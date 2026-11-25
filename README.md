# Bộ Cẩm Nang Mở & Vận Hành Quán Phở Thực Chiến

> **Phiên bản hiện tại: v1.0.0 (Commercial Release)** — phát hành thương mại, sẵn sàng bàn giao App với đặc tả schema + bộ 6 ca kiểm thử.

> Tài liệu vận hành F&B chuẩn **Docs-as-Code**: mọi quy trình là file có phiên bản, review được; mọi thông số định lượng là **biến số trong YAML** — sẵn sàng chuyển thẳng thành phần mềm quản lý mà đội lập trình không cần đoán nghĩa.

**Dành cho ai:** người lần đầu mở quán phở/bún bò, chủ quán đang vận hành muốn chuẩn hóa lại quy trình, và đội phát triển phần mềm cần đặc tả dữ liệu gốc.

---

## Giá trị cốt lõi

- **Tránh bẫy mất vốn** — phân tách rõ 4 khoản vốn (cọc, trả trước, dự phòng CAPEX 5–10%, quỹ tiền mặt ≥ 3 tháng chi phí cố định); quyết định đầu tư 300 triệu đi kèm dòng tiền 13 tuần × 3 kịch bản thay vì "bán càng nhiều càng tốt".
- **Kiểm soát Food Cost** — chốt ngưỡng 35–38% (toàn menu) và trần 42–45% (món chủ lực nhiều thịt); công thức hòa vốn theo **lãi đóng góp** chứ không phải lãi gộp.
- **Kiểm soát thất thoát nguyên liệu** — mỗi nguyên liệu có `yield_factor` (hệ số thu hồi sau sơ chế) + biểu mẫu cân trước/sau luộc và phiếu kiểm kho để phát hiện hao hụt bất thường.
- **Không bịa số** — mọi số liệu đều có căn cứ thực đo hoặc đánh dấu `TBD_OWNER_INPUT` (chủ quán tự điền theo quy mô nồi), tuyệt đối không nhét số lý thuyết vào bí quyết nấu nướng.

---

## Cấu trúc & Mục lục

### 00 — Kho ghi chú gốc (lưu trữ, không sửa)

Toàn bộ 20 ghi chú thực chiến ban đầu, giữ nguyên làm nguồn tham chiếu.

| Tài liệu | Nội dung |
|---|---|
| [`Cach-chon-xuong-bo.md`](00-raw-notes/Cach-chon-xuong-bo.md) | Ghi chú gốc — chọn xương bò |
| [`Chon-banh-pho.md`](00-raw-notes/Chon-banh-pho.md) | Ghi chú gốc — chọn bánh phở |
| [`Chon-rau-thom.md`](00-raw-notes/Chon-rau-thom.md) | Ghi chú gốc — chọn rau thơm |
| [`Kinh-nghiem-ninh-xuong.md`](00-raw-notes/Kinh-nghiem-ninh-xuong.md) | Ghi chú gốc — ninh xương |
| [`chon-thit-nam.md`](00-raw-notes/chon-thit-nam.md) | Ghi chú gốc — thịt nạm |
| [`thit-gau.md`](00-raw-notes/thit-gau.md) | Ghi chú gốc — thịt gầu |
| [`thit-tai.md`](00-raw-notes/thit-tai.md) | Ghi chú gốc — thịt tái |
| [`bao-quan-thi-tai.md`](00-raw-notes/bao-quan-thi-tai.md) | Ghi chú gốc — bảo quản tái |
| [`bao-quan-thit-chin.md`](00-raw-notes/bao-quan-thit-chin.md) | Ghi chú gốc — bảo quản chín |
| [`cac-buoc-cbi-co-ban.md`](00-raw-notes/cac-buoc-cbi-co-ban.md) | Ghi chú gốc — chuẩn bị mở quán |
| [`danh-muc-thiet-bi.md`](00-raw-notes/danh-muc-thiet-bi.md) | Ghi chú gốc — thiết bị |
| [`thiet-bi-tinh-tien.md`](00-raw-notes/thiet-bi-tinh-tien.md) | Ghi chú gốc — máy tính tiền |
| [`ty-le-gia-thanh-COGS.md`](00-raw-notes/ty-le-gia-thanh-COGS.md) | Ghi chú gốc — COGS |
| [`nguyen-tac-tke-menu.md`](00-raw-notes/nguyen-tac-tke-menu.md) | Ghi chú gốc — thiết kế menu |
| [`nguyen-tac-chon-vi-tri.md`](00-raw-notes/nguyen-tac-chon-vi-tri.md) | Ghi chú gốc — chọn vị trí |
| [`chua-co-thuong-hieu.md`](00-raw-notes/chua-co-thuong-hieu.md) | Ghi chú gốc — chưa có thương hiệu |
| [`ban-online-offline.md`](00-raw-notes/ban-online-offline.md) | Ghi chú gốc — bán online/offline |
| [`chon-gio-ban-hang.md`](00-raw-notes/chon-gio-ban-hang.md) | Ghi chú gốc — chọn giờ bán |
| [`dieu-kien-tien-quyet.md`](00-raw-notes/dieu-kien-tien-quyet.md) | Ghi chú gốc — điều kiện tiên quyết |
| [`nhuong-quyen-hay-khong.md`](00-raw-notes/nhuong-quyen-hay-khong.md) | Ghi chú gốc — nhượng quyền |

### 01 — Mô hình tài chính (dữ liệu YAML cho App)

| Tài liệu | Nội dung |
|---|---|
| [`ingredients-standards.yaml`](01-financial-models/ingredients-standards.yaml) | Tiêu chuẩn chọn nguyên liệu + `yield_factor` từng loại |
| [`recipe-costing-sample.yaml`](01-financial-models/recipe-costing-sample.yaml) | Mẫu tính giá vốn 1 bát (Phở Bò Tái Nạm) |
| [`recipe-nuoc-dung-pho-bo.yaml`](01-financial-models/recipe-nuoc-dung-pho-bo.yaml) | Công thức ninh nước dùng — mẻ chuẩn 100L (25kg/100L/70L/140 tô) + điện năng |
| [`food-cost-cogs.yaml`](01-financial-models/food-cost-cogs.yaml) | Ngưỡng food cost + công thức hòa vốn theo lãi đóng góp |
| [`storage-preservation.yaml`](01-financial-models/storage-preservation.yaml) | Chuẩn nhiệt độ bảo quản + quy tắc làm nguội FDA |
| [`setup-capital-and-scale.yaml`](01-financial-models/setup-capital-and-scale.yaml) | Vốn & quy mô mở quán (4 khoản vốn) |
| [`equipment-specs.yaml`](01-financial-models/equipment-specs.yaml) | Thông số thiết bị bếp/quầy + POS |
| [`investment-decision-300m.md`](01-financial-models/investment-decision-300m.md) | Bảng quyết định đầu tư 300 triệu + dòng tiền 13 tuần |
| [`ty-le-gia-thanh-COGS.md`](01-financial-models/ty-le-gia-thanh-COGS.md) | Giải thích tỷ lệ giá thành / COGS |

### 02 — Mở quán & Mặt bằng

| Tài liệu | Nội dung |
|---|---|
| [`cac-buoc-chuan-bi-co-ban.md`](02-setup-and-location/cac-buoc-chuan-bi-co-ban.md) | Trình tự chuẩn bị mở quán |
| [`dieu-kien-tien-quyet.md`](02-setup-and-location/dieu-kien-tien-quyet.md) | Điều kiện tiên quyết (pháp lý, vốn, nguồn nước) |
| [`danh-muc-thiet-bi.md`](02-setup-and-location/danh-muc-thiet-bi.md) | Danh mục thiết bị bếp phở |
| [`thiet-bi-tinh-tien.md`](02-setup-and-location/thiet-bi-tinh-tien.md) | Yêu cầu máy tính tiền (POS) |
| [`nguyen-tac-chon-vi-tri.md`](02-setup-and-location/nguyen-tac-chon-vi-tri.md) | Nguyên tắc chọn vị trí |
| [`nhuong-quyen-hay-khong.md`](02-setup-and-location/nhuong-quyen-hay-khong.md) | Tự xây thương hiệu hay nhượng quyền |

### 03 — SOP Vận hành (chuẩn 6 phần)

| Tài liệu | Nội dung |
|---|---|
| [`chon-xuong-bo.md`](03-sop-operations/chon-xuong-bo.md) | Chọn xương bò ninh nước dùng |
| [`chon-banh-pho.md`](03-sop-operations/chon-banh-pho.md) | Chọn bánh phở |
| [`chon-rau-thom.md`](03-sop-operations/chon-rau-thom.md) | Chọn rau thơm |
| [`chon-thit-nam.md`](03-sop-operations/chon-thit-nam.md) | Chọn thịt nạm |
| [`chon-thit-gau.md`](03-sop-operations/chon-thit-gau.md) | Chọn thịt gầu |
| [`chon-thit-tai.md`](03-sop-operations/chon-thit-tai.md) | Chọn thịt tái |
| [`ninh-xuong-bo.md`](03-sop-operations/ninh-xuong-bo.md) | Ninh xương bò lấy nước dùng (mẻ chuẩn 100L) |
| [`bao-quan-thit-tai.md`](03-sop-operations/bao-quan-thit-tai.md) | Bảo quản thịt tái |
| [`bao-quan-thit-chin.md`](03-sop-operations/bao-quan-thit-chin.md) | Bảo quản thịt chín |
| [`ra-to-va-giu-nhiet.md`](03-sop-operations/ra-to-va-giu-nhiet.md) | Ra tô chuẩn & giữ nhiệt phục vụ |

**Biểu mẫu nghiệm thu:**

| Biểu mẫu | Nội dung |
|---|---|
| [`phieu-me-nuoc-dung.md`](03-sop-operations/forms/phieu-me-nuoc-dung.md) | Phiếu theo dõi mẻ nước dùng |
| [`phieu-luoc-va-thu-hoi-thit.md`](03-sop-operations/forms/phieu-luoc-va-thu-hoi-thit.md) | Phiếu cân luộc & thu hồi thịt |
| [`phieu-ra-to-chuan.md`](03-sop-operations/forms/phieu-ra-to-chuan.md) | Phiếu ra tô chuẩn (định lượng) |
| [`example-filled-forms.md`](03-sop-operations/forms/example-filled-forms.md) | Ca mẫu điền đầy đủ 1 ngày vận hành |

### 04 — Nhân sự & Đào tạo

| Tài liệu | Nội dung |
|---|---|
| [`quy-trinh-tuyen-dung-va-dao-tao.md`](04-hr-and-training/quy-trinh-tuyen-dung-va-dao-tao.md) | Tuyển dụng & đào tạo nhân sự |

### 05 — Marketing & Khai trương

| Tài liệu | Nội dung |
|---|---|
| [`nguyen-tac-thiet-ke-menu.md`](05-marketing-launch/nguyen-tac-thiet-ke-menu.md) | Thiết kế menu & định giá |
| [`ban-online-offline.md`](05-marketing-launch/ban-online-offline.md) | Kết hợp bán online – offline |
| [`chon-gio-ban-hang.md`](05-marketing-launch/chon-gio-ban-hang.md) | Chọn khung giờ bán hàng |
| [`chua-co-thuong-hieu.md`](05-marketing-launch/chua-co-thuong-hieu.md) | Vận hành khi chưa có thương hiệu |

### 06 — Đặc tả hệ thống (App)

| Tài liệu | Nội dung |
|---|---|
| [`system-architecture-and-specs.md`](06-app-specifications/system-architecture-and-specs.md) | Database Schema (6 bảng) + đặc tả 4 phân hệ + bộ 6 ca kiểm thử bàn giao |

### Quy tắc làm việc cho AI

- [`CLAUDE.md`](CLAUDE.md) — tiêu chuẩn SOP 6 phần, quy ước YAML, quản lý phiên bản.

---

## Lịch sử phiên bản (Changelog)

| Phiên bản | Nội dung chính |
|---|---|
| **v0.1.0** | Khởi tạo cấu trúc dự án Docs-as-Code + `CLAUDE.md` (tiêu chuẩn SOP 6 phần, quy ước dữ liệu YAML, Conventional Commits). |
| **v0.2.0** | Biên tập 20 ghi chú gốc (`00-raw-notes/`) thành tài liệu chuẩn theo 5 thư mục chức năng + tách toàn bộ thông số định lượng/hệ số hao hụt thành `.yaml`. Cập nhật `yield_factor` gầu bò luộc = 0.65. |
| **v0.3.0** | Đồng bộ 10 điểm kiểm toán ĐC-01…ĐC-10 giữa Markdown & YAML; bổ sung bảng quyết định đầu tư 300 triệu + dòng tiền 13 tuần; bộ 3 biểu mẫu nghiệm thu; nâng cấp SOP ninh xương. |
| **v0.4.0** | Chốt định mức mẻ nước dùng chuẩn 100L (25kg xương/100L nước/70L thành phẩm/140 tô), điện năng Newsun ~32 kWh/mẻ, bí quyết tạo hương 3 lớp + hộp gia vị inox, SOP ra tô & giữ nhiệt. |
| **v0.5.0** | Bản vá kiểm toán: đóng 6 điểm ĐC-01/04/05/06/07/08, chuẩn làm nguội FDA §3-501.14, chuẩn hóa nồi 100L Newsun, tách hệ số xương (vật lý vs chi phí), bổ sung ca mẫu điền đầy đủ. |
| **v1.0.0 (Commercial Release)** | Trang chủ README + đặc tả hệ thống App (6 bảng DB + 4 phân hệ + bộ 6 ca kiểm thử bàn giao); phát hành thương mại với tag `v1.0.0`. |

---

## Cách dùng nhanh

1. **Người mới mở quán** — đọc theo trình tự: `02-setup-and-location/cac-buoc-chuan-bi-co-ban.md` → `01-financial-models/investment-decision-300m.md` → toàn bộ SOP trong `03-sop-operations/`.
2. **Chủ quán đang vận hành** — in bộ biểu mẫu trong `03-sop-operations/forms/` và chạy checklist hằng ngày theo SOP.
3. **Đội phát triển phần mềm** — bắt đầu từ `06-app-specifications/system-architecture-and-specs.md`, đối chiếu biến số gốc trong `01-financial-models/*.yaml`.
