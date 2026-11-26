# Landing Page Bán Hàng — Cẩm Nang Mở & Vận Hành Quán Phở (v1.2.1)

Trang bán hàng **độc lập** (single-page static website), tách biệt hoàn toàn với
Web Docs nội bộ trong `docs/`. Trang này được thiết kế để **xuất bản công khai
ra Internet** — khách bấm từ link Bio TikTok / Reels / Zalo vào là đọc và mua ngay,
không cần đăng nhập OTP.

- Công nghệ: **HTML5 + CSS3 (biến CSS, Flexbox/Grid) + Vanilla JavaScript**.
- Không framework, không font/thư viện ngoài → tải tức thì, nhẹ dưới 0.5 giây trên 4G.
- Responsive 100%, **Mobile-first**.

## Cấu trúc

```
landing-page/
├── index.html   # toàn bộ giao diện + CSS + JS nằm gọn trong 1 file
└── README.md    # hướng dẫn này
```

Toàn bộ CSS và JS được nhúng inline trong `index.html` để deploy chỉ cần **1 file**
mà vẫn giữ nguyên hiệu ứng (FAQ accordion, copy nhanh, modal xem trước cấu trúc).

---

## 1. Thay thông tin tài khoản ngân hàng / Zalo

Mở `index.html`, tìm và thay **4 placeholder** dưới đây (chú ý thay cả dấu ngoặc
vuông `[...]`). Có 2 nơi cần thay số Zalo: phần nút bấm và phần chữ hiển thị.

| Placeholder | Ý nghĩa | Ví dụ thay bằng |
|---|---|---|
| `[SO_TAI_KHOAN]` | Số tài khoản nhận tiền | `0123456789` |
| `[TEN_NGAN_HANG]` | Tên ngân hàng | `Vietcombank` |
| `[CHU_TAI_KHOAN]` | Chủ tài khoản | `NGUYEN VAN A` |
| `[SO_ZALO]` | Số điện thoại / ID Zalo | `0901234567` |

Các placeholder xuất hiện ở **Khối 5 — Thanh toán**, cụ thể:

```html
<span class="val" id="ten-ngan-hang">[TEN_NGAN_HANG]</span>
<span class="val" id="so-tai-khoan">[SO_TAI_KHOAN]</span>
<span class="val" id="chu-tai-khoan">[CHU_TAI_KHOAN]</span>

<a class="btn btn-emerald" href="https://zalo.me/[SO_ZALO]" ...>Gửi biên lai &amp; Kích hoạt qua Zalo</a>
...
<strong id="so-zalo">[SO_ZALO]</strong>
```

> **Mẹo:** nút **“Copy số tài khoản”** và **“Copy số Zalo”** đọc trực tiếp chữ hiển
> thị của `#so-tai-khoan` / `#so-zalo`, nên bạn chỉ cần sửa đúng 1 chỗ ở phần chữ
> hiển thị là nút copy tự cập nhật theo. Riêng link Zalo (`href`) phải sửa riêng.

Còn **nội dung chuyển khoản mẫu** (nút “Copy nội dung chuyển khoản mẫu”) là chuỗi
cố định để khách tự thay SĐT/Email của họ — không cần đổi nếu chưa muốn:

```html
data-copy="Cẩm nang Phở 499.000đ — SĐT: [SĐT của bạn] — Email: [Email của bạn]"
```

---

## 2. Deploy lên Cloudflare Pages (công khai, riêng biệt với Web Docs)

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

## 3. Điều cần kiểm tra trước khi chạy chính thức

1. Đã thay đủ 4 placeholder `[SO_TAI_KHOAN]`, `[TEN_NGAN_HANG]`, `[CHU_TAI_KHOAN]`, `[SO_ZALO]`.
2. Link Zalo `https://zalo.me/[SO_ZALO]` trỏ đúng Zalo của bạn.
3. Link Web Docs ở Bước 3 (`https://pho-operation-manual.kimlongholdings-ltd.workers.dev`) trỏ đúng domain đang chạy.
4. Bấm thử: 2 nút CTA cuộn mượt, FAQ đóng/mở, 2 nút copy hiện “Đã sao chép ✓”, nút
   “Xem trước cấu trúc cẩm nang” mở modal, bấm nền/✕/Esc đóng modal.

---

## 4. Quan hệ với Web Docs (`docs/`)

`landing-page/` **không** bị Web Docs xử lý: thư mục này đã được thêm vào `srcExclude`
trong `docs/.vitepress/config.mts` (`'landing-page/**'`). Vì vậy chạy
`npm run docs:build` ở thư mục `docs/` **hoàn toàn không bị ảnh hưởng**.
