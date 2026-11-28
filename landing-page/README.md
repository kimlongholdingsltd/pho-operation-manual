# Landing Page Bán Hàng — Cẩm Nang Mở & Vận Hành Quán Phở (v1.2.2)

Trang bán hàng **độc lập** (single-page static website), tách biệt hoàn toàn với
Web Docs nội bộ trong `docs/`. Trang này được thiết kế để **xuất bản công khai
ra Internet** — khách bấm từ link Bio TikTok / Reels / Zalo vào là đọc và chốt đơn,
không cần đăng nhập OTP.

- Công nghệ: **HTML5 + CSS3 (biến CSS, Flexbox/Grid) + Vanilla JavaScript**.
- Không framework, không font/thư viện ngoài → tải tức thì, nhẹ dưới 0.5 giây trên 4G.
- Responsive 100%, **Mobile-first**.
- **Đơn vị chủ quản:** Công ty TNHH Kim Long Holdings — luồng chốt đơn chuyển về Zalo
  (trang giữ đúng tính chất *website giới thiệu thông tin*, không đặt form đặt hàng tự động).

## Cấu trúc

```
landing-page/
├── index.html   # toàn bộ giao diện + CSS + JS nằm gọn trong 1 file
└── README.md    # hướng dẫn này
```

Toàn bộ CSS và JS được nhúng inline trong `index.html` để deploy chỉ cần **1 file**
mà vẫn giữ nguyên hiệu ứng (FAQ accordion, copy nhanh, modal xem trước cấu trúc,
modal điều khoản pháp lý).

---

## 1. Thay thông tin pháp nhân & thanh toán

Mở `index.html`, tìm và thay **6 placeholder** dưới đây (chú ý thay cả dấu ngoặc
vuông `[...]`). Số Zalo xuất hiện ở 3 nơi: nút bấm Zalo, chữ hiển thị, và chân trang.

| Placeholder | Ý nghĩa | Ví dụ thay bằng |
|---|---|---|
| `[SO_TAI_KHOAN]` | Số tài khoản doanh nghiệp nhận tiền | `0123456789` |
| `[TEN_NGAN_HANG]` | Tên ngân hàng | `Vietcombank` |
| `[SO_ZALO]` | Số điện thoại / ID Zalo hỗ trợ | `0901234567` |
| `[MA_SO_THUE]` | Mã số thuế công ty | `0312345678` |
| `[DIA_CHI_TRU_SO]` | Địa chỉ trụ sở công ty | `12 Nguyễn Văn A, Q.1, TP.HCM` |
| `[EMAIL_HO_TRO]` | Email hỗ trợ / xuất hóa đơn | `support@kimlongholdings.com` |

### Vị trí cụ thể trong `index.html`

**Khối 5 — Thanh toán (Bước 1 & Bước 2):**

```html
<!-- Bước 1: Zalo -->
<a class="btn btn-emerald btn-lg" href="https://zalo.me/[SO_ZALO]" ...>Đăng ký &amp; Nhận hướng dẫn qua Zalo</a>
...
<strong id="so-zalo">[SO_ZALO]</strong>

<!-- Bước 2: Chuyển khoản vào tài khoản doanh nghiệp -->
<span class="val">CÔNG TY TNHH KIM LONG HOLDINGS</span>   <!-- chủ tài khoản: cố định -->
<span class="val" id="so-tai-khoan">[SO_TAI_KHOAN]</span>
<span class="val" id="ten-ngan-hang">[TEN_NGAN_HANG]</span>
```

**Chân trang (Footer) — thông tin đơn vị chủ quản:**

```html
<strong>Đơn vị chủ quản:</strong> CÔNG TY TNHH KIM LONG HOLDINGS
<strong>Mã số thuế:</strong> [MA_SO_THUE]
<strong>Địa chỉ trụ sở:</strong> [DIA_CHI_TRU_SO]
<strong>Hotline / Zalo hỗ trợ:</strong> [SO_ZALO]
<strong>Email:</strong> [EMAIL_HO_TRO]
```

> **Mẹo:** nút **“Copy số tài khoản”** và **“Copy số Zalo”** đọc trực tiếp chữ hiển
> thị của `#so-tai-khoan` / `#so-zalo`, nên bạn chỉ cần sửa đúng 1 chỗ ở phần chữ
> hiển thị là nút copy tự cập nhật theo. Riêng link Zalo (`href="https://zalo.me/..."`)
> phải sửa riêng.

Nội dung **“Copy nội dung chuyển khoản mẫu”** là chuỗi cố định để khách tự thay
SĐT/Email của họ — không cần đổi nếu chưa muốn:

```html
data-copy="Cẩm nang Phở 499.000đ — SĐT: [SĐT của bạn] — Email nhận tài liệu: [Email của bạn]"
```

---

## 2. Luồng chốt đơn (quan trọng)

Trang **không** có form đặt hàng tự động. Toàn bộ thao tác chốt đơn diễn ra qua Zalo:

1. **Bước 1** — Khách bấm nút “Đăng ký & Nhận hướng dẫn qua Zalo” → vào Zalo của bạn
   để xác nhận thông tin xuất hóa đơn và nhận mã QR chuyển khoản chính thức.
2. **Bước 2** — Khách chuyển khoản 499.000đ vào tài khoản doanh nghiệp
   **CÔNG TY TNHH KIM LONG HOLDINGS** với nội dung `SĐT + Email nhận tài liệu`.
3. **Bước 3** — Bạn xác nhận biên lai, cấp quyền đăng nhập OTP vào Web Docs sau 15 giây.

---

## 3. Deploy lên Cloudflare Pages (công khai, riêng biệt với Web Docs)

Đây là dự án **tĩnh** nên deploy nhanh, không cần build step. Web Docs nội bộ đang
chạy ở dự án khác; hãy tạo **một dự án Cloudflare Pages mới** cho riêng `landing-page/`.

### Cách 1 — Cloudflare Pages qua Git (khuyến nghị)

1. Vào **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Chọn repo `pho-operation-manual` (chung repo cũng được, vì thư mục tách biệt).
3. Cấu hình build:
   - **Build command:** *(để trống)* — trang tĩnh, không cần build.
   - **Build output directory:** `landing-page`
4. Nhấn **Save and Deploy**. Cloudflare sẽ serve `landing-page/index.html` ra tên miền
   con dạng `https://<tên-dự-án>.pages.dev`.

### Cách 2 — Upload thủ công (nhanh, không cần Git)

1. **Workers & Pages → Create → Pages → Upload assets**.
2. Chọn thư mục `landing-page/` trên máy (chỉ cần đúng `index.html`).
3. Đặt tên dự án, nhấn **Deploy**. Xong — lấy link `*.pages.dev`.

### (Tuỳ chọn) Gắn domain riêng

**Custom domains** → thêm domain riêng (vd: `camnangpho.example.com`) rồi trỏ CNAME
theo hướng dẫn của Cloudflare.

### Khi cập nhật

- Cách 1: push commit mới lên Git → Cloudflare tự deploy lại.
- Cách 2: upload lại `index.html`.

---

## 4. Điều cần kiểm tra trước khi chạy chính thức

1. Đã thay đủ **6 placeholder**: `[SO_TAI_KHOAN]`, `[TEN_NGAN_HANG]`, `[SO_ZALO]`,
   `[MA_SO_THUE]`, `[DIA_CHI_TRU_SO]`, `[EMAIL_HO_TRO]`.
2. Link Zalo `https://zalo.me/[SO_ZALO]` trỏ đúng Zalo của bạn (sửa cả 3 chỗ xuất hiện).
3. Link Web Docs ở Bước 3 (`https://pho-operation-manual.kimlongholdings-ltd.workers.dev`) trỏ đúng domain đang chạy.
4. Bấm thử: 2 nút CTA cuộn mượt, FAQ đóng/mở, các nút copy hiện “Đã sao chép ✓”,
   nút “Xem trước cấu trúc cẩm nang” mở modal, 3 link điều khoản pháp lý ở footer mở
   đúng modal; đóng modal bằng nút ✕ / bấm nền / phím Esc.

---

## 5. Quan hệ với Web Docs (`docs/`)

`landing-page/` **không** bị Web Docs xử lý: thư mục này đã được thêm vào `srcExclude`
trong `docs/.vitepress/config.mts` (`'landing-page/**'`). Vì vậy chạy
`npm run docs:build` ở thư mục `docs/` **hoàn toàn không bị ảnh hưởng**.
