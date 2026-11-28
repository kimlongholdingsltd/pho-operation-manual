# pho-auto-provisioning — Worker tự động cấp quyền Web Docs

Cloudflare Worker nhận webhook biến động số dư từ **SePay.vn**, tự động:

1. Xác thực API key của SePay.
2. Lọc giao dịch **tiền vào** có số tiền **≥ 499.000đ** (đổi được bằng `MIN_AMOUNT`).
3. Trích xuất email khách từ nội dung chuyển khoản có tiền tố `KLH`.
4. Thêm email vào **Cloudflare Zero Trust Access Policy** của Web Docs.
5. Gửi **email hướng dẫn đăng nhập** qua **Resend**, BCC cho quản trị viên để đối soát.

Worker này độc lập hoàn toàn với `docs/` và `landing-page/`, không dùng thư viện runtime ngoài.

---

## 1. Kiến trúc luồng

```
SePay.vn ──POST /webhook/sepay──▶ Worker pho-auto-provisioning
                                   │  Authorization: Apikey <SEPAY_API_KEY>
                                   │  transferType = "in", amount ≥ 499000
                                   ▼
                         extractAndNormalizeEmail(content)
                                   │
                     ┌─────────────┴─────────────┐
                     │ có email                  │ không có email
                     ▼                           ▼
       Cloudflare Access API                Trả 200 manual_review_needed
       GET policy → PUT thêm email          + email cảnh báo ADMIN_EMAIL
                     │
                     ▼
       Resend API → email hướng dẫn cho khách (BCC admin)
```

Thứ tự cố ý: **cấp quyền trước, gửi email sau**. Nếu Cloudflare lỗi, worker trả `500` để SePay gửi lại webhook; khách không nhận email hướng dẫn khi quyền chưa được cấp.

---

## 2. Yêu cầu chuẩn bị

| Thành phần | Cần có |
|---|---|
| Cloudflare | Tài khoản đang chạy Worker Web Docs + Zero Trust Access đã bật One-time PIN |
| SePay | Tài khoản đã liên kết tài khoản ngân hàng, quyền tạo Webhook |
| Resend | Tài khoản đã xác minh tên miền gửi `kimlongholdings.vn` |
| Máy local | Node.js ≥ 20 và npm |

> Web Docs phải đang được bảo vệ bằng Access Application có ít nhất một policy. Worker chỉ **thêm email vào policy có sẵn**, không tạo policy mới.

---

## 3. Cài đặt & chạy local

```bash
cd auto-provisioning-worker
npm install
cp .dev.vars.example .dev.vars   # rồi điền các giá trị bên dưới
npm run dev                      # http://localhost:8787
```

Chạy thử webhook local (thay key thật):

```bash
curl -X POST "http://localhost:8787/webhook/sepay" \
  -H "Authorization: Apikey <SEPAY_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 12345,
    "gateway": "Techcombank",
    "transactionDate": "2026-11-28 10:00:00",
    "transferType": "in",
    "transferAmount": 499000,
    "content": "KLH lan.caotn@gmail.com 0938983385",
    "referenceCode": "FT26112812345"
  }'
```

> Lệnh trên **cấp quyền thật** và **gửi email thật**. Khi thử, dùng email bạn sở hữu. `npm run dev` đọc `.dev.vars` — file này đã nằm trong `.gitignore`, tuyệt đối không commit.

---

## 4. Lấy các biến bí mật

### 4.1. `SEPAY_API_KEY`

1. Đăng nhập [my.sepay.vn](https://my.sepay.vn) → **Tích hợp → Webhook** (hoặc **Cấu hình → Webhook**).
2. Tạo webhook mới (xem mục 6) hoặc mở webhook đã tạo.
3. Ở phần xác thực, chọn **API Key** và tạo/copy khóa.
4. SePay gửi header dạng `Authorization: Apikey <khóa>`. Code so khớp đúng chuỗi này.

Nếu giao diện SePay cho nhập header tùy chỉnh, đặt:

- Header name: `Authorization`
- Header value: `Apikey <khóa>`

### 4.2. `CF_API_TOKEN` và `CF_ACCOUNT_ID`

1. Cloudflare Dashboard → **My Profile → API Tokens → Create Token**.
2. Chọn **Create Custom Token**, đặt tên `pho-auto-provisioning`.
3. Permissions:

   | Group | Permission |
   |---|---|
   | Account | **Access: Apps and Policies** — **Edit** |

4. Account Resources: **Include → tài khoản của bạn**.
5. Create → copy token (chỉ hiện một lần).
6. `CF_ACCOUNT_ID`: mở **Workers & Pages**, nhìn cột phải (Account ID) hoặc lấy trong URL dashboard.

### 4.3. `CF_ACCESS_APP_ID` và `CF_ACCESS_POLICY_ID`

Cách nhanh nhất là gọi API bằng token vừa tạo:

```bash
export CF_API_TOKEN="..."
export CF_ACCOUNT_ID="..."

# Liệt kê các Access Application
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/access/apps" \
  -H "Authorization: Bearer $CF_API_TOKEN" | python3 -m json.tool
```

Tìm ứng dụng Web Docs (`pho-operation-manual...`), lấy `id` → đó là `CF_ACCESS_APP_ID`.

```bash
export CF_ACCESS_APP_ID="..."

# Liệt kê policy của ứng dụng
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/access/apps/$CF_ACCESS_APP_ID/policies" \
  -H "Authorization: Bearer $CF_API_TOKEN" | python3 -m json.tool
```

Lấy `id` của policy đang chứa danh sách email khách → đó là `CF_ACCESS_POLICY_ID`.

> Cũng có thể xem trên giao diện: **Zero Trust → Access → Applications → chọn app → Policies**. Policy phải có `decision: allow`. Worker giữ nguyên `name`, `decision`, `precedence`, `exclude`, `require`, các cấu hình nâng cao và toàn bộ `include` cũ; chỉ nối thêm một mục `{ "email": { "email": "<email khách>" } }`.

### 4.4. `RESEND_API_KEY` và `SENDER_EMAIL`

1. [resend.com](https://resend.com) → **Domains → Add Domain** → nhập `kimlongholdings.vn`.
2. Thêm các bản ghi DNS (SPF, DKIM) Resend cung cấp, chờ trạng thái **Verified**.
3. **API Keys → Create API Key** → quyền **Sending access** → copy `re_...`.
4. `SENDER_EMAIL` phải dùng địa chỉ thuộc tên miền đã xác minh, ví dụ:
   `Cẩm Nang Quán Phở - Kim Long Holdings <hotro@kimlongholdings.vn>`
5. Chưa xác minh tên miền? Resend chỉ cho gửi từ `onboarding@resend.dev` tới chính email chủ tài khoản — không dùng được cho khách thật.

### 4.5. `ADMIN_EMAIL`

Email quản trị/kế toán nhận:

- BCC của mọi email chào mừng (đối soát, xuất hóa đơn VAT).
- Cảnh báo khi giao dịch tiền vào không trích xuất được email.

Ví dụ: `kimlongholdings.ltd@gmail.com`. Nếu bỏ trống, worker vẫn chạy nhưng không có BCC và không gửi cảnh báo xử lý tay.

### 4.6. `MIN_AMOUNT` (tùy chọn)

Ngưỡng tiền vào tối thiểu, đơn vị VNĐ. Mặc định `499000` (đúng giá bán). Có thể đặt trong `[vars]` của `wrangler.toml` hoặc bằng secret.

---

## 5. Nạp secrets & deploy

```bash
cd auto-provisioning-worker
npx wrangler login

npx wrangler secret put SEPAY_API_KEY
npx wrangler secret put CF_API_TOKEN
npx wrangler secret put CF_ACCOUNT_ID
npx wrangler secret put CF_ACCESS_APP_ID
npx wrangler secret put CF_ACCESS_POLICY_ID
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put SENDER_EMAIL
npx wrangler secret put ADMIN_EMAIL

npm run deploy
```

Wrangler in ra URL dạng:

```
https://pho-auto-provisioning.<tên-tài-khoản>.workers.dev
```

Webhook URL hoàn chỉnh:

```
https://pho-auto-provisioning.<tên-tài-khoản>.workers.dev/webhook/sepay
```

Kiểm tra nhanh sau deploy:

```bash
curl -i "https://pho-auto-provisioning.<tên-tài-khoản>.workers.dev/webhook/sepay"
# → 405 Method Not Allowed (đúng: route tồn tại, chỉ nhận POST)

curl -i "https://pho-auto-provisioning.<tên-tài-khoản>.workers.dev/abc"
# → 404 Not Found
```

> **Không** đặt worker này sau Cloudflare Access. SePay phải gọi trực tiếp được. Bảo vệ nằm ở API key trong header.

Xem log realtime khi cần gỡ lỗi:

```bash
npm run tail
```

---

## 6. Cấu hình Webhook trên SePay.vn

1. Đăng nhập [my.sepay.vn](https://my.sepay.vn) → **Tích hợp → Webhook** → **Thêm Webhook**.
2. Điền:

   | Trường | Giá trị |
   |---|---|
   | Tên | `Cấp quyền Web Docs (Cloudflare Worker)` |
   | URL nhận webhook | `https://pho-auto-provisioning.<tên-tài-khoản>.workers.dev/webhook/sepay` |
   | Phương thức | `POST` |
   | Xác thực | **API Key** — dán đúng khóa đã dùng cho `SEPAY_API_KEY` |
   | Sự kiện | **Tiền vào** (money in) |

3. Lưu → bấm **Gửi test** (nếu có) hoặc chuyển khoản thật một giao dịch nhỏ để kiểm tra log.
4. Nếu SePay hỏi header tùy chỉnh, dùng `Authorization: Apikey <SEPAY_API_KEY>`.

SePay coi response **2xx** là gửi thành công; **4xx/5xx** sẽ được gửi lại theo cấu hình retry. Worker trả `200` cho các trường hợp bỏ qua có chủ đích (tiền ra, dưới ngưỡng, không có email) để tránh gửi lặp vô ích.

---

## 7. Nội dung chuyển khoản khách phải ghi

Trang bán hàng hướng dẫn:

```
KLH <Email của bạn> <SĐT>
```

Ví dụ:

```
KLH lan.caotn@gmail.com 0938983385
```

Worker chấp nhận các biến thể do ngân hàng làm biến dạng nội dung:

| Nội dung nhận được | Email trích xuất |
|---|---|
| `KLH lan.caotn@gmail.com` | `lan.caotn@gmail.com` |
| `KLH lan caotn gmail com` | `lan.caotn@gmail.com` |
| `KLH lan.caotn AT gmail DOT com` | `lan.caotn@gmail.com` |
| `KLH lan caotn AT gmail DOT com 0938983385` | `lan.caotn@gmail.com` |
| `KLH lancao gmail com` | `lancao@gmail.com` |
| `MBVCB.1234567890.KLH lan.caotn@gmail.com chuyen tien` | `lan.caotn@gmail.com` |
| `KLH lan caotn congty vn` | `lan.caotn@congty.vn` |

Quy tắc xử lý:

- Tìm `KLH` không phân biệt hoa thường, không dính chữ cái trước/sau; bỏ qua mã giao dịch ngân hàng đứng trước.
- Đổi `AT` → `@`, `DOT` → `.` (cả dạng `[at]`, `(at)`).
- Chuẩn hóa chữ thường, bỏ khoảng trắng quanh `@` và `.`.
- Bỏ số điện thoại / mã giao dịch thuần số.
- Nhận diện đuôi phổ biến: `gmail.com`, `yahoo.com`, `outlook.com`, `hotmail.com`, `icloud.com`; hoặc tên miền 2 cấp ở cuối (`congty.vn`, `congty.com.vn`).
- Khi ngân hàng xóa cả `@` và `.`, các từ của local-part được nối bằng dấu chấm: `lan caotn gmail com` → `lan.caotn@gmail.com`.
- Email cuối cùng phải qua regex RFC-ish; nếu không → `manual_review_needed` + email cảnh báo admin.

**Giới hạn cần biết:**

- Nhiều ngân hàng giới hạn độ dài nội dung chuyển khoản (khoảng 79 ký tự). Email dài + SĐT có thể bị cắt → worker không trích xuất được → admin xử lý tay.
- Nếu ngân hàng xóa sạch dấu chấm, worker không thể biết địa chỉ gốc là `lancaotn@` hay `lan.caotn@`; heuristic nối bằng dấu chấm theo khoảng trắng. Vì vậy landing page khuyến khích khách ghi rõ email.
- Chỉ xử lý **một** địa chỉ email đầu tiên trong nội dung.

---

## 8. Bảng phản hồi của Worker

| HTTP | `status` | Ý nghĩa |
|---|---|---|
| 200 | `provisioned` | Đã thêm email vào policy (hoặc đã có sẵn) và gửi email hướng dẫn |
| 200 | `ignored` | Tiền ra / dưới ngưỡng / số tiền không hợp lệ — không xử lý, không retry |
| 200 | `manual_review_needed` | Không trích xuất được email; đã cảnh báo admin |
| 400 | `invalid_json` | Body không phải JSON |
| 401 | `unauthorized` | Thiếu hoặc sai `Authorization: Apikey ...` |
| 404 | `not_found` | Sai đường dẫn |
| 405 | `method_not_allowed` | Gọi `/webhook/sepay` bằng method khác POST |
| 500 | `error` | Lỗi Cloudflare Access / Resend → SePay sẽ retry |

Ví dụ response thành công:

```json
{
  "status": "provisioned",
  "email": "lan.caotn@gmail.com",
  "already_present": false,
  "transaction_id": 12345,
  "reference_code": "FT26112812345",
  "amount": 499000
}
```

---

## 9. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| SePay nhận `401` | `SEPAY_API_KEY` không khớp; header sai dạng | Đặt lại secret, kiểm tra SePay gửi `Authorization: Apikey <key>` |
| `500` + log `Không đọc được Access Policy (HTTP 403)` | Token thiếu quyền `Access: Apps and Policies: Edit`, sai Account ID | Tạo lại token đúng quyền, cập nhật secret |
| `500` + log `HTTP 404` từ Cloudflare | Sai `CF_ACCESS_APP_ID` / `CF_ACCESS_POLICY_ID` | Gọi lại API liệt kê app/policy để lấy ID đúng |
| `PUT ... 400` | Cấu trúc policy thay đổi (ví dụ include dùng `everyone`) | Mở policy trên dashboard kiểm tra; báo kỹ thuật |
| Resend `403` / `domain not verified` | Tên miền gửi chưa xác minh, `SENDER_EMAIL` sai domain | Xác minh domain, sửa `SENDER_EMAIL` |
| Khách báo không nhận email | Vào Spam/Quảng cáo; email sai do nội dung bị cắt | Kiểm tra log `provisioned`, gửi lại tay hoặc bảo khách xem Spam |
| `manual_review_needed` liên tục | Khách không ghi `KLH` hoặc email sai/thiếu | Cấp quyền tay trên Zero Trust, nhắc khách đúng cú pháp |
| Khách nhận 2 email | SePay retry sau khi lần trước đã gửi mail nhưng response bị timeout | Chấp nhận được; policy không bị trùng. Có thể bổ sung idempotency bằng KV sau |
| Đã cấp quyền nhưng khách chưa vào được | Access cache vài giây; sai email | Chờ 10–30 giây, đối chiếu đúng email trong policy |

Xem log:

```bash
cd auto-provisioning-worker
npm run tail
```

---

## 10. Vận hành & bảo mật

- **Không commit file `.dev.vars`** hoặc dán secret vào README/chat. Secret chỉ nạp bằng `npx wrangler secret put` (hoặc Dashboard → Worker → Settings → Variables and Secrets).
- **Xoay khóa định kỳ**: tạo key mới ở SePay/Cloudflare/Resend → `wrangler secret put` → thu hồi key cũ.
- **Hoàn tiền**: worker không tự thu hồi quyền. Khi hoàn tiền, vào Zero Trust → Access → Application → Policy, xóa email khách khỏi `include`.
- **Tặng/thanh toán hộ**: bất kỳ ai chuyển đúng số tiền và ghi email của người khác đều cấp quyền cho email đó — đúng thiết kế bán hàng, nhưng cần biết khi đối soát.
- **Giám sát**: bật log/observability trên Worker; theo dõi tỷ lệ `manual_review_needed` và lỗi `500` mỗi tuần.
- **Không trả nội dung chuyển khoản ra ngoài** ngoại trừ response cho SePay và email cảnh báo nội bộ.

---

## 11. Kiểm tra trước khi bàn giao

- [ ] `npm run typecheck` không lỗi.
- [ ] Đã nạp đủ 8 secret (hoặc 6 bắt buộc + 2 tùy chọn).
- [ ] `npm run deploy` thành công, URL `/webhook/sepay` trả `405` khi GET.
- [ ] Webhook SePay trỏ đúng URL, xác thực API Key, sự kiện tiền vào.
- [ ] Chuyển khoản thử 499.000đ với nội dung `KLH <email thử> <SĐT>`:
  - [ ] Email thử nằm trong Access Policy.
  - [ ] Email hướng dẫn tới hộp thư (kiểm tra cả Spam).
  - [ ] Admin nhận BCC.
  - [ ] Đăng nhập Web Docs bằng OTP thành công.
- [ ] Chuyển khoản thử sai cú pháp → admin nhận cảnh báo `manual_review_needed`.
- [ ] Đã cập nhật landing page với cú pháp `KLH <Email của bạn> <SĐT>`.

---

## 12. Lệnh thường dùng

```bash
npm run dev        # chạy local với .dev.vars
npm run typecheck  # kiểm tra TypeScript
npm run deploy     # deploy production
npm run tail       # xem log realtime
npx wrangler secret list   # liệt kê tên secret (không hiện giá trị)
```
