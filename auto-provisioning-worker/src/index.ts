/**
 * Cloudflare Worker — pho-auto-provisioning
 *
 * Luồng: SePay.vn gọi webhook khi có biến động số dư
 *   → xác thực API key
 *   → lọc giao dịch tiền vào đạt ngưỡng 499.000đ
 *   → trích xuất email khách từ nội dung chuyển khoản (tiền tố KLH)
 *   → thêm email vào Cloudflare Zero Trust Access Policy
 *   → gửi email hướng dẫn đăng nhập qua Resend.
 *
 * Không dùng thư viện ngoài: toàn bộ là Web API có sẵn trong Workers runtime.
 */

interface Env {
  /** API key SePay gửi ở header `Authorization: Apikey <key>`. */
  SEPAY_API_KEY: string;
  /** Ngưỡng tiền vào tối thiểu (VNĐ), mặc định 499000. */
  MIN_AMOUNT?: string;

  /** Cloudflare API token có quyền Access: Apps and Policies — Edit. */
  CF_API_TOKEN: string;
  CF_ACCOUNT_ID: string;
  CF_ACCESS_APP_ID: string;
  CF_ACCESS_POLICY_ID: string;

  /** Resend API key có quyền gửi mail. */
  RESEND_API_KEY: string;
  /** Ví dụ: `Cẩm Nang Quán Phở - Kim Long Holdings <hotro@kimlongholdings.vn>`. */
  SENDER_EMAIL?: string;
  /** Email quản trị: nhận BCC đối soát + cảnh báo giao dịch cần xử lý tay. */
  ADMIN_EMAIL?: string;
}

interface SePayPayload {
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  content?: string;
  transferType?: string;
  transferAmount?: number | string;
  referenceCode?: string;
  [key: string]: unknown;
}

interface AccessPolicy {
  name?: string;
  decision?: string;
  precedence?: number;
  include?: Array<Record<string, any>>;
  exclude?: Array<Record<string, any>>;
  require?: Array<Record<string, any>>;
  approval_groups?: Array<Record<string, any>>;
  isolation_required?: boolean;
  session_duration?: string;
  purpose_justification_required?: boolean;
  purpose_justification_prompt?: string;
  [key: string]: unknown;
}

interface CloudflareApiResponse<T> {
  success: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: Array<{ code?: number; message?: string }>;
  result?: T;
}

const WEBHOOK_PATH = '/webhook/sepay';
const DEFAULT_MIN_AMOUNT = 499_000;
const DEFAULT_SENDER =
  'Cẩm Nang Quán Phở - Kim Long Holdings <hotro@kimlongholdings.vn>';
const DOCS_URL = 'https://pho-operation-manual.kimlongholdings-ltd.workers.dev';
const SUPPORT_EMAIL = 'hotro@kimlongholdings.vn';
const SUPPORT_ZALO = '0938983385';
const WELCOME_SUBJECT =
  '[Kim Long Holdings] Kích hoạt thành công quyền truy cập Cẩm Nang Mở & Vận Hành Quán Phở';

// ---------------------------------------------------------------------------
// Tiện ích HTTP
// ---------------------------------------------------------------------------

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}

/** So sánh chuỗi theo thời gian hằng định (hash trước để che độ dài). */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function requireEnv(env: Env, key: keyof Env): string {
  const value = env[key];
  if (!isNonEmptyString(value)) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${String(key)}`);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// Trích xuất & chuẩn hóa email từ nội dung chuyển khoản
// ---------------------------------------------------------------------------

/**
 * Bỏ dấu tiếng Việt + chuyển chữ thường để so khớp từ khóa ổn định.
 * Ngân hàng thường gửi nội dung không dấu, nhưng khách có thể gõ có dấu.
 */
function foldText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

/** Chuẩn RFC-ish: local 1–64 ký tự, domain có ít nhất một dấu chấm + TLD ≥ 2 ký tự. */
const EMAIL_RE =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;

const KNOWN_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];

/** Các đuôi miền phổ biến để ghép lại khi ngân hàng xóa dấu chấm. */
const TLD_TOKENS = new Set([
  'com',
  'net',
  'org',
  'vn',
  'io',
  'co',
  'info',
  'biz',
  'edu',
  'gov',
  'dev',
  'app',
  'store',
  'shop',
  'me',
  'ai',
  'xyz',
  'online',
  'site',
  'com.vn',
  'edu.vn',
  'gov.vn',
  'net.vn',
  'org.vn',
]);

/** Từ khóa rác thường xuất hiện cạnh nội dung chuyển khoản — chỉ cắt ở hai đầu. */
const NOISE_WORDS = new Set([
  'chuyen',
  'khoan',
  'ck',
  'sdt',
  'dienthoai',
  'phone',
  'gd',
  'giaodich',
  'magiaodich',
]);

/** Token kiểu số điện thoại / mã giao dịch thuần số → loại bỏ. */
function isDigitNoise(token: string): boolean {
  return /^\d{8,}$/.test(token) || /^\+?\d{9,}$/.test(token);
}

function cleanToken(token: string): string {
  return token
    .replace(/[^a-z0-9._%+-]/g, '')
    .replace(/^[._%+-]+/, '')
    .replace(/[._%+-]+$/, '');
}

function trimNoise(tokens: string[]): string[] {
  const out = tokens.filter((token) => token.length > 0);
  while (out.length > 0 && NOISE_WORDS.has(out[0])) out.shift();
  while (out.length > 0 && NOISE_WORDS.has(out[out.length - 1])) out.pop();
  return out;
}

/** Ghép local-part từ các token ngân hàng tách rời: `lan caotn` → `lan.caotn`. */
function buildLocalPart(raw: string): string {
  const tokens = raw
    .split(/\s+/)
    .map(cleanToken)
    .filter((token) => token.length > 0 && !/^\d+$/.test(token));
  return trimNoise(tokens)
    .join('.')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;

/** Sửa domain bị mất dấu chấm: `gmailcom` → `gmail.com`, `congtyvn` → `congty.vn`. */
function repairDomain(candidate: string): string | null {
  const domain = candidate
    .toLowerCase()
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '');
  if (!domain) return null;
  if (DOMAIN_RE.test(domain)) return domain;

  // Domain đã có dấu chấm nhưng sai cấu trúc → không đoán bừa.
  if (domain.includes('.')) return null;

  for (const known of KNOWN_DOMAINS) {
    const dotless = known.replace(/\./g, '');
    if (domain === dotless) return known;
    if (domain.endsWith(dotless) && domain.length > dotless.length) {
      return `${domain.slice(0, -dotless.length)}.${known}`;
    }
  }

  // Ưu tiên đuôi 2 cấp trước (comvn, netvn, …), rồi mới tới đuôi 1 cấp.
  const twoLevel = ['comvn', 'netvn', 'orgvn', 'eduvn', 'govvn'];
  for (const suffix of twoLevel) {
    if (domain.endsWith(suffix) && domain.length > suffix.length) {
      const head = domain.slice(0, -suffix.length);
      return `${head}.${suffix.slice(0, 3)}.${suffix.slice(3)}`;
    }
  }

  const suffixes = [
    'com',
    'net',
    'org',
    'info',
    'online',
    'store',
    'shop',
    'site',
    'dev',
    'app',
    'vn',
    'io',
    'co',
    'ai',
    'me',
    'xyz',
  ];
  for (const suffix of suffixes) {
    if (domain.endsWith(suffix) && domain.length > suffix.length + 1) {
      return `${domain.slice(0, -suffix.length)}.${suffix}`;
    }
  }
  return null;
}

/** Ghép domain từ các token sau dấu `@`, chịu được ngân hàng chèn khoảng trắng. */
function buildDomain(raw: string): string | null {
  const tokens = raw
    .split(/\s+/)
    .map((token) => token.toLowerCase().replace(/[^a-z0-9.-]/g, ''))
    .filter((token) => token.length > 0 && !isDigitNoise(token));
  for (let take = 1; take <= tokens.length; take++) {
    const candidate = tokens.slice(0, take).join('.');
    const repaired = repairDomain(candidate);
    if (!repaired) continue;
    // `congty com vn` → đừng dừng ở `congty.com`, ghép luôn `.vn`.
    if (tokens[take] === 'vn' && /\.(?:com|net|org|edu|gov)$/.test(repaired)) {
      return `${repaired}.vn`;
    }
    return repaired;
  }
  return null;
}

function finalizeEmail(candidate: string): string | null {
  const email = candidate.toLowerCase().replace(/\.+$/, '');
  if (email.length > 254) return null;
  const at = email.lastIndexOf('@');
  if (at <= 0) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length === 0 || local.length > 64) return null;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  if (domain.startsWith('.') || domain.includes('..')) return null;
  return EMAIL_RE.test(email) ? email : null;
}

/** Tìm vị trí tiền tố `KLH` (không phân biệt hoa thường, không dính chữ cái). */
function findKlhIndex(folded: string): number {
  let from = 0;
  while (from < folded.length) {
    const index = folded.indexOf('klh', from);
    if (index === -1) return -1;
    const before = index === 0 ? '' : folded[index - 1];
    const after = index + 3 >= folded.length ? '' : folded[index + 3];
    if (!/[a-z]/.test(before) && !/[a-z]/.test(after)) return index;
    from = index + 3;
  }
  return -1;
}

/**
 * Trích xuất email từ `content` chuyển khoản.
 *
 * Hỗ trợ:
 *  - `KLH lan.caotn@gmail.com`
 *  - `KLH lan caotn gmail com` (ngân hàng xóa @ và .)
 *  - `KLH lan.caotn AT gmail DOT com`
 *  - `KLH lan caotn AT gmail DOT com 0938983385`
 *  - mã giao dịch ngân hàng đứng trước hoặc sau KLH
 */
function parseTail(tail: string): string | null {
  // ---- Nhánh 1: nội dung còn dấu @ ----
  if (tail.includes('@')) {
    // Dồn khoảng trắng quanh @ và . để xử lý `lan caotn @ gmail . com`.
    const dense = tail.replace(/\s*@\s*/g, '@').replace(/\s*\.\s*/g, '.');
    const at = dense.indexOf('@');
    const local = buildLocalPart(dense.slice(0, at));
    const domain = buildDomain(dense.slice(at + 1));
    if (local && domain) {
      const email = finalizeEmail(`${local}@${domain}`);
      if (email) return email;
    }
  }

  // ---- Nhánh 2: ngân hàng đã xóa @ (và có thể xóa cả dấu chấm) ----
  const tokens = tail
    .split(/\s+/)
    .map(cleanToken)
    .filter((token) => token.length > 0 && !isDigitNoise(token));

  // 2a. Nhận diện đuôi email phổ biến: `… gmail com` / `… gmailcom`.
  for (let i = 0; i < tokens.length; i++) {
    const joined = tokens.slice(i).join('');
    for (const known of KNOWN_DOMAINS) {
      const dotless = known.replace(/\./g, '');
      if (!joined.startsWith(known) && !joined.startsWith(dotless)) continue;
      const local = buildLocalPart(tokens.slice(0, i).join(' '));
      if (!local) continue;
      const email = finalizeEmail(`${local}@${known}`);
      if (email) return email;
    }
  }

  // 2b. Tên miền 2 cấp đứng cuối chuỗi: `… congty vn` hoặc `… congty com vn`.
  if (tokens.length >= 3) {
    const last = tokens[tokens.length - 1];
    const prev = tokens[tokens.length - 2];
    if (TLD_TOKENS.has(last) && prev.length >= 2 && !/^\d/.test(prev) && !prev.includes('@')) {
      let domain = `${prev}.${last}`;
      let localTokens = tokens.slice(0, tokens.length - 2);

      if (last === 'vn' && ['com', 'edu', 'gov', 'net', 'org'].includes(prev) && tokens.length >= 4) {
        const third = tokens[tokens.length - 3];
        if (third.length >= 2 && !/^\d/.test(third)) {
          domain = `${third}.${prev}.${last}`;
          localTokens = tokens.slice(0, tokens.length - 3);
        }
      }

      const local = buildLocalPart(localTokens.join(' '));
      if (local) {
        const email = finalizeEmail(`${local}@${domain}`);
        if (email) return email;
      }
    }
  }

  return null;
}

export function extractAndNormalizeEmail(content: string): string | null {
  if (typeof content !== 'string' || content.trim().length === 0) return null;

  const folded = foldText(content);
  const klhIndex = findKlhIndex(folded);
  if (klhIndex === -1) return null;

  const rawTail = folded.slice(klhIndex + 3);

  // Ưu tiên địa chỉ đã có @ thật — tránh biến email `at@gmail.com` thành rác.
  if (rawTail.includes('@')) {
    const direct = parseTail(rawTail);
    if (direct) return direct;
  }

  // Ngân hàng / khách hay viết AT, DOT thay cho @ và dấu chấm.
  const normalizedTail = rawTail.replace(/\bat\b/g, '@').replace(/\bdot\b/g, '.');
  return parseTail(normalizedTail);
}

// ---------------------------------------------------------------------------
// Cloudflare Zero Trust Access Policy
// ---------------------------------------------------------------------------

interface PolicyUpdateResult {
  email: string;
  alreadyPresent: boolean;
}

function describeCfErrors(body: CloudflareApiResponse<unknown>): string {
  const errors = body.errors ?? [];
  if (errors.length === 0) return 'Cloudflare API trả về lỗi không có mô tả';
  return errors.map((e) => `${e.code ?? '?'}: ${e.message ?? 'unknown'}`).join('; ');
}

/**
 * Bảo đảm email nằm trong Access Policy.
 * GET policy hiện tại → nếu chưa có thì PUT lại với mảng include cũ + email mới.
 */
async function ensureAccessEmail(env: Env, email: string): Promise<PolicyUpdateResult> {
  const accountId = requireEnv(env, 'CF_ACCOUNT_ID');
  const appId = requireEnv(env, 'CF_ACCESS_APP_ID');
  const policyId = requireEnv(env, 'CF_ACCESS_POLICY_ID');
  const token = requireEnv(env, 'CF_API_TOKEN');

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps/${appId}/policies/${policyId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };

  const getRes = await fetch(url, { headers });
  const getBody = (await getRes.json()) as CloudflareApiResponse<AccessPolicy>;
  if (!getRes.ok || !getBody.success || !getBody.result) {
    throw new Error(`Không đọc được Access Policy (HTTP ${getRes.status}): ${describeCfErrors(getBody)}`);
  }

  const policy = getBody.result;
  const include = Array.isArray(policy.include) ? policy.include : [];
  const alreadyPresent = include.some((item) => {
    const itemEmail = item?.email?.email;
    return typeof itemEmail === 'string' && itemEmail.toLowerCase() === email;
  });

  if (alreadyPresent) return { email, alreadyPresent: true };

  if (!isNonEmptyString(policy.name) || !isNonEmptyString(policy.decision)) {
    throw new Error('Access Policy thiếu `name` hoặc `decision` — không thể cập nhật an toàn');
  }

  const payload: Record<string, unknown> = {
    name: policy.name,
    decision: policy.decision,
    include: [...include, { email: { email } }],
    exclude: Array.isArray(policy.exclude) ? policy.exclude : [],
    require: Array.isArray(policy.require) ? policy.require : [],
  };
  if (typeof policy.precedence === 'number') payload.precedence = policy.precedence;

  // Giữ nguyên các cấu hình nâng cao nếu policy đang dùng.
  for (const key of [
    'approval_groups',
    'isolation_required',
    'session_duration',
    'purpose_justification_required',
    'purpose_justification_prompt',
  ] as const) {
    if (policy[key] !== undefined) payload[key] = policy[key];
  }

  const putRes = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const putBody = (await putRes.json()) as CloudflareApiResponse<AccessPolicy>;
  if (!putRes.ok || !putBody.success) {
    throw new Error(`Cập nhật Access Policy thất bại (HTTP ${putRes.status}): ${describeCfErrors(putBody)}`);
  }

  return { email, alreadyPresent: false };
}

// ---------------------------------------------------------------------------
// Resend
// ---------------------------------------------------------------------------

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
}

async function resendSend(env: Env, payload: Record<string, unknown>): Promise<string> {
  const apiKey = requireEnv(env, 'RESEND_API_KEY');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Resend API thất bại (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
  return text;
}

interface WelcomeContext {
  email: string;
  amount: number;
  referenceCode?: string;
  transactionDate?: string;
}

function buildWelcomeText(ctx: WelcomeContext): string {
  const ref = ctx.referenceCode ? `\nMã tham chiếu: ${ctx.referenceCode}` : '';
  return [
    'CÔNG TY TNHH KIM LONG HOLDINGS xin chân thành cảm ơn bạn đã tin tưởng đặt mua',
    'Bộ Cẩm Nang Mở & Vận Hành Quán Phở.',
    '',
    `Chúng tôi đã nhận được thanh toán ${formatVnd(ctx.amount)} của bạn.${ref}`,
    'Quyền truy cập Web Docs đã được kích hoạt cho địa chỉ email này.',
    '',
    `Truy cập: ${DOCS_URL}`,
    '',
    'HƯỚNG DẪN ĐĂNG NHẬP (3 bước):',
    '1. Mở link trên và nhập đúng địa chỉ email đã dùng khi chuyển khoản.',
    '2. Bấm "Send me a code".',
    '3. Mở hộp thư (kiểm tra cả Spam/Quảng cáo), lấy mã OTP 6 số và nhập vào để truy cập.',
    '',
    'Bạn sẽ đọc trọn đời 28 tài liệu chuyên sâu và tải Bộ Công Cụ Tài Chính Excel.',
    '',
    `Cần xuất hóa đơn VAT hoặc hỗ trợ kỹ thuật: Zalo ${SUPPORT_ZALO} · Email ${SUPPORT_EMAIL}`,
    '',
    'Trân trọng,',
    'CÔNG TY TNHH KIM LONG HOLDINGS',
  ].join('\n');
}

function buildWelcomeHtml(ctx: WelcomeContext): string {
  const safeEmail = escapeHtml(ctx.email);
  const safeRef = ctx.referenceCode ? escapeHtml(ctx.referenceCode) : '';
  const refLine = safeRef
    ? `<tr><td style="padding:4px 0;color:#57534E;font-size:14px;">Mã tham chiếu</td><td align="right" style="padding:4px 0;color:#1C1917;font-size:14px;font-weight:600;">${safeRef}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kích hoạt quyền truy cập Cẩm nang Quán Phở</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1C1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E7E0D6;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background-color:#B45309;padding:28px 32px;">
              <div style="color:#FFF7ED;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Kim Long Holdings</div>
              <div style="color:#FFFFFF;font-size:24px;font-weight:700;margin-top:6px;line-height:1.3;">Kích hoạt thành công quyền truy cập</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Chào bạn,</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                <strong>CÔNG TY TNHH KIM LONG HOLDINGS</strong> xin chân thành cảm ơn bạn đã tin tưởng đặt mua
                <strong>Bộ Cẩm Nang Mở &amp; Vận Hành Quán Phở</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
                Chúng tôi đã nhận được khoản thanh toán của bạn và <strong>kích hoạt quyền truy cập</strong>
                cho email <strong>${safeEmail}</strong>.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5;border:1px solid #E7E0D6;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#57534E;font-size:14px;">Số tiền đã nhận</td>
                        <td align="right" style="padding:4px 0;color:#B45309;font-size:16px;font-weight:700;">${formatVnd(ctx.amount)}</td>
                      </tr>
                      ${refLine}
                      <tr>
                        <td style="padding:4px 0;color:#57534E;font-size:14px;">Trạng thái</td>
                        <td align="right" style="padding:4px 0;color:#15803D;font-size:14px;font-weight:600;">Đã kích hoạt</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#B45309;">
                    <a href="${DOCS_URL}" target="_blank" rel="noopener"
                       style="display:inline-block;padding:16px 36px;color:#FFFFFF;font-size:17px;font-weight:700;text-decoration:none;border-radius:10px;">
                      Truy cập Cẩm Nang Ngay
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;color:#78716C;font-size:12px;word-break:break-all;">
                    ${DOCS_URL}
                  </td>
                </tr>
              </table>

              <div style="border-top:1px solid #E7E0D6;padding-top:24px;">
                <h2 style="margin:0 0 16px;font-size:18px;color:#1C1917;">Hướng dẫn đăng nhập 3 bước</h2>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                  <tr>
                    <td valign="top" style="padding:0 12px 0 0;">
                      <div style="width:26px;height:26px;line-height:26px;border-radius:50%;background-color:#B45309;color:#FFFFFF;text-align:center;font-size:14px;font-weight:700;">1</div>
                    </td>
                    <td style="font-size:15px;line-height:1.6;padding-bottom:12px;">
                      Nhập <strong>đúng địa chỉ email đã đăng ký</strong> (email nhận thư này) vào ô đăng nhập.
                    </td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:0 12px 0 0;">
                      <div style="width:26px;height:26px;line-height:26px;border-radius:50%;background-color:#B45309;color:#FFFFFF;text-align:center;font-size:14px;font-weight:700;">2</div>
                    </td>
                    <td style="font-size:15px;line-height:1.6;padding-bottom:12px;">
                      Bấm <strong>Send me a code</strong> để hệ thống gửi mã đăng nhập.
                    </td>
                  </tr>
                  <tr>
                    <td valign="top" style="padding:0 12px 0 0;">
                      <div style="width:26px;height:26px;line-height:26px;border-radius:50%;background-color:#B45309;color:#FFFFFF;text-align:center;font-size:14px;font-weight:700;">3</div>
                    </td>
                    <td style="font-size:15px;line-height:1.6;">
                      Kiểm tra hộp thư — <strong>kể cả mục Spam/Quảng cáo</strong> — lấy <strong>mã OTP 6 số</strong>
                      và nhập vào để đọc trọn đời <strong>28 tài liệu chuyên sâu</strong> cùng
                      <strong>Bộ Công Cụ Tài Chính Excel</strong>.
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background-color:#FAF8F5;border-left:4px solid #B45309;border-radius:8px;padding:16px 18px;margin-top:8px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#57534E;">
                  Cần <strong>xuất hóa đơn VAT</strong> hoặc hỗ trợ kỹ thuật? Liên hệ Zalo
                  <a href="https://zalo.me/${SUPPORT_ZALO}" target="_blank" rel="noopener" style="color:#B45309;font-weight:600;text-decoration:none;">${SUPPORT_ZALO}</a>
                  hoặc Email
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#B45309;font-weight:600;text-decoration:none;">${SUPPORT_EMAIL}</a>.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#FAF8F5;border-top:1px solid #E7E0D6;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#78716C;font-size:12px;line-height:1.6;">
                CÔNG TY TNHH KIM LONG HOLDINGS<br>
                Email hỗ trợ: ${SUPPORT_EMAIL} · Zalo: ${SUPPORT_ZALO}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendWelcomeEmail(env: Env, ctx: WelcomeContext): Promise<void> {
  const from = env.SENDER_EMAIL?.trim() || DEFAULT_SENDER;
  const admin = env.ADMIN_EMAIL?.trim();
  const payload: Record<string, unknown> = {
    from,
    to: [ctx.email],
    subject: WELCOME_SUBJECT,
    html: buildWelcomeHtml(ctx),
    text: buildWelcomeText(ctx),
  };
  if (admin && admin.toLowerCase() !== ctx.email.toLowerCase()) {
    payload.bcc = [admin];
    payload.reply_to = admin;
  }
  await resendSend(env, payload);
}

/** Cảnh báo quản trị khi không trích xuất được email — không được làm hỏng webhook. */
async function sendManualReviewAlert(env: Env, payload: SePayPayload, reason: string): Promise<void> {
  const admin = env.ADMIN_EMAIL?.trim();
  if (!admin) return;
  const from = env.SENDER_EMAIL?.trim() || DEFAULT_SENDER;
  const content = typeof payload.content === 'string' ? payload.content : '(trống)';
  const amount = Number(payload.transferAmount);
  const rows = [
    ['Lý do', reason],
    ['Nội dung chuyển khoản', content],
    ['Số tiền', Number.isFinite(amount) ? formatVnd(amount) : String(payload.transferAmount ?? '?')],
    ['Mã giao dịch SePay', String(payload.id ?? '?')],
    ['Mã tham chiếu', String(payload.referenceCode ?? '?')],
    ['Ngân hàng', String(payload.gateway ?? '?')],
    ['Thời điểm', String(payload.transactionDate ?? '?')],
  ];
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#57534E;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#1C1917;font-weight:600;">${escapeHtml(String(value))}</td></tr>`,
    )
    .join('');

  await resendSend(env, {
    from,
    to: [admin],
    subject: '[Kim Long Holdings] Cần xử lý tay: chuyển khoản chưa trích xuất được email',
    html: `<div style="font-family:Arial,sans-serif;color:#1C1917;line-height:1.6;">
      <h2 style="color:#B45309;margin:0 0 12px;">Chuyển khoản cần xử lý tay</h2>
      <p style="margin:0 0 16px;">Worker <strong>pho-auto-provisioning</strong> nhận được tiền vào nhưng không trích xuất được email hợp lệ. Vui lòng cấp quyền thủ công trong Cloudflare Zero Trust và gửi hướng dẫn cho khách.</p>
      <table style="border-collapse:collapse;font-size:14px;">${table}</table>
    </div>`,
    text: rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
  });
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

async function handleSePayWebhook(request: Request, env: Env): Promise<Response> {
  const authHeader = (request.headers.get('Authorization') ?? '').trim();
  const expected = `Apikey ${requireEnv(env, 'SEPAY_API_KEY')}`;
  if (!(await timingSafeEqual(authHeader, expected))) {
    return json({ status: 'unauthorized', message: 'API key không hợp lệ' }, 401);
  }

  let payload: SePayPayload;
  try {
    payload = (await request.json()) as SePayPayload;
  } catch {
    return json({ status: 'invalid_json', message: 'Body phải là JSON hợp lệ' }, 400);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ status: 'invalid_json', message: 'Payload rỗng' }, 400);
  }

  // 1. Chỉ xử lý tiền vào.
  if (payload.transferType !== 'in') {
    return json({ status: 'ignored', reason: 'not_incoming_transfer' });
  }

  const amount = Number(payload.transferAmount);
  if (!Number.isFinite(amount)) {
    return json({ status: 'ignored', reason: 'invalid_transfer_amount' });
  }

  const configuredMin = Number(env.MIN_AMOUNT ?? DEFAULT_MIN_AMOUNT);
  const minAmount =
    Number.isFinite(configuredMin) && configuredMin > 0 ? configuredMin : DEFAULT_MIN_AMOUNT;
  if (amount < minAmount) {
    return json({
      status: 'ignored',
      reason: 'amount_below_minimum',
      minimum: minAmount,
      received: amount,
    });
  }

  // 2. Trích xuất email từ nội dung chuyển khoản.
  const content = typeof payload.content === 'string' ? payload.content : '';
  const email = extractAndNormalizeEmail(content);

  if (!email) {
    try {
      await sendManualReviewAlert(env, payload, 'Không trích xuất được email hợp lệ từ nội dung KLH');
    } catch (error) {
      console.error('manual_review_alert_failed', error);
    }
    return json({
      status: 'manual_review_needed',
      content,
      transaction_id: payload.id ?? null,
      reference_code: payload.referenceCode ?? null,
      amount,
    });
  }

  // 3. Cấp quyền Zero Trust (lỗi ở đây → 500 để SePay gửi lại webhook).
  const policyResult = await ensureAccessEmail(env, email);

  // 4. Gửi email hướng dẫn (kể cả khi email đã có trong policy).
  await sendWelcomeEmail(env, {
    email,
    amount,
    referenceCode: typeof payload.referenceCode === 'string' ? payload.referenceCode : undefined,
    transactionDate:
      typeof payload.transactionDate === 'string' ? payload.transactionDate : undefined,
  });

  return json({
    status: 'provisioned',
    email,
    already_present: policyResult.alreadyPresent,
    transaction_id: payload.id ?? null,
    reference_code: payload.referenceCode ?? null,
    amount,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path !== WEBHOOK_PATH) {
      return json({ status: 'not_found' }, 404);
    }

    if (request.method !== 'POST') {
      return json({ status: 'method_not_allowed', message: 'Chỉ chấp nhận POST' }, 405, {
        Allow: 'POST',
      });
    }

    try {
      return await handleSePayWebhook(request, env);
    } catch (error) {
      console.error('webhook_processing_failed', error);
      return json(
        {
          status: 'error',
          message: 'Không xử lý được giao dịch. SePay sẽ thử lại theo cấu hình.',
        },
        500,
      );
    }
  },
} satisfies ExportedHandler<Env>;
