# Đặc tả hệ thống — App quản lý vận hành quán Phở

> Mục tiêu: chuyển toàn bộ dữ liệu vận hành hiện có (YAML + SOP) thành **Database
> Schema** và **đặc tả tính năng** cho đội lập trình — không cần đoán nghĩa, giữ
> nguyên các biến số thực tế (`yield_factor`, `kwh_per_batch`, `dinh_muc_ml_per_to`...).

---

## 1. Nguồn dữ liệu gốc (mapping)

| File nguồn | Vai trò trong hệ thống |
|---|---|
| `01-financial-models/ingredients-standards.yaml` | Bảng `NguyenVatLieu` + tiêu chí chọn + `yield_factor` |
| `01-financial-models/recipe-costing-sample.yaml` | Bảng `CongThucMon` + định lượng + giá vốn 1 bát |
| `01-financial-models/recipe-nuoc-dung-pho-bo.yaml` | Bảng `MeNuocDung` (mẻ chuẩn 100L, điện năng, hương liệu) |
| `01-financial-models/food-cost-cogs.yaml` | Ngưỡng food cost + công thức hòa vốn (Dashboard) |
| `01-financial-models/storage-preservation.yaml` | Quy tắc nhiệt độ + làm nguội (Checklist an toàn) |
| `03-sop-operations/ninh-xuong-bo.md`, `ra-to-va-giu-nhiet.md` | Đồng hồ đếm ngược mẻ ninh/luộc + quy trình ra tô |

---

## 2. Database Schema

### 2.1 Bảng `NguyenVatLieu` (nguyên vật liệu)

Nguồn: `ingredients-standards.yaml` + `recipe-costing-sample.yaml`.

| Cột | Kiểu | Ý nghĩa | Nguồn (key YAML) |
|---|---|---|---|
| `id` | int (PK) | Mã nguyên liệu | — |
| `name` | varchar | Tên nguyên liệu ("Xương bò", "Nạm bò"…) | `ingredients[].name` |
| `unit` | varchar | Đơn vị tính (`kg`, `batch`) | `ingredients[].unit` |
| `category` | varchar | Nhóm: xương / thịt / bánh / rau / gia vị | `ingredients[].purpose` |
| `yield_factor` | decimal(3,2) | Hệ số thu hồi sau sơ chế (nạm 0.68, gầu 0.65, rau 0.85, tái 1.0, xương 1.0) | `ingredients[].yield_factor` |
| `price_per_unit` | decimal | Giá mua / đơn vị (VND) | `recipe-costing-sample.ingredients[].price_per_unit` |
| `selection_criteria` | json | Tiêu chí chọn (màu, thớ, mùi, tránh…) | `ingredients[].selection`, `avoid` |
| `storage_rule` | varchar | Liên kết quy tắc nhiệt độ bảo quản | `storage-preservation.temperature_standard` |

### 2.2 Bảng `CongThucMon` (công thức món)

Nguồn: `recipe-costing-sample.yaml`.

| Cột | Kiểu | Ý nghĩa | Nguồn (key YAML) |
|---|---|---|---|
| `id` | int (PK) | Mã món | `recipe_id` |
| `ten_mon` | varchar | Tên món | `recipe_name` |
| `price_selling` | decimal | Giá bán 1 bát (VND) | `price_selling` |
| `target_food_cost_percent` | decimal(3,2) | Mục tiêu food cost | `target_food_cost_percent` |
| `dinh_luong` | json | Danh sách `{nguyen_vat_lieu_id, qty_raw_gram, cost_per_serving}` | `ingredients[]` |
| `total_food_cost` | decimal | Tổng giá vốn 1 bát | `summary.total_food_cost_nguyen_lieu` |
| `food_cost_percent` | decimal(3,2) | Food cost thực tế | `summary.food_cost_percent_nguyen_lieu` |

### 2.3 Bảng `MeNuocDung` (mẻ nước dùng)

Nguồn: `recipe-nuoc-dung-pho-bo.yaml`.

| Cột | Kiểu | Ý nghĩa | Nguồn (key YAML) |
|---|---|---|---|
| `id` | int (PK) | Mã mẻ | — |
| `ngay` | date | Ngày ninh | — |
| `noi_chuan` | varchar | Nồi chuẩn (Newsun 100L, 6kW) | `batch_spec.noi_chuan` |
| `kg_xuong_per_me` | decimal | Đầu vào xương (25 kg) | `batch_spec.kg_xuong_per_me` |
| `lit_nuoc_dau_vao` | decimal | Nước ban đầu (100 L) | `batch_spec.lit_nuoc_dau_vao` |
| `lit_thanh_pham_sau_loc` | decimal | Thành phẩm sau lọc (70 L) | `batch_spec.lit_thanh_pham_sau_loc` |
| `so_to_thanh_pham` | int | Số tô (140) | `batch_spec.so_to_thanh_pham` |
| `dinh_muc_ml_per_to` | int | Định mức nước dùng/tô (500 mL) | `batch_spec.dinh_muc_ml_nuoc_dung_per_to` |
| `kwh_per_batch` | decimal | Điện năng mẻ ninh (32 kWh) | `dien_nang.kwh_per_batch` |
| `electricity_unit_price` | decimal | Giá điện (VND/kWh) — chủ quán nhập | `dien_nang.electricity_unit_price` |
| `thoi_gian_ninh_gio` | int | Tổng giờ ninh (20h) | `process.step[4].time_hour` |
| `luoc_thit` | json | `{gio_vao, gio_vot, gio_luoc_min: 2.5, gio_luoc_max: 3}` | `process.step[5]` |
| `hop_gia_vi_phut` | int | Thời gian nhấc hộp gia vị (45 phút) | `huong_lieu.hop_gia_vi_inox.thoi_gian_nhac_ra_phut` |
| `cham_bu_log` | json | Nhật ký châm bù nước sôi (giờ, lít) | `phieu-me-nuoc-dung.md` |

### 2.4 Bảng `PhieuKiemKho` (phiếu kiểm kho — cảnh báo lệch kho)

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | int (PK) | Mã phiếu |
| `ngay` | date | Ngày kiểm kê |
| `nguyen_vat_lieu_id` | int (FK) | Nguyên liệu |
| `ton_dau_ky` | decimal | Tồn đầu kỳ |
| `nhap_trong_ky` | decimal | Nhập trong kỳ |
| `xuat_ly_thuyet` | decimal | Xuất theo định mức = Σ(qty_raw × số tô bán) |
| `ton_cuoi_ky_thuc_te` | decimal | Tồn thực tế (cân kiểm kê) |
| `ton_cuoi_ky_ly_thuyet` | decimal | = đầu kỳ + nhập − xuất lý thuyết |
| `chenh_lech` | decimal | = thực tế − lý thuyết (âm = thất thoát) |
| `chenh_lech_percent` | decimal | % lệch để kích hoạt cảnh báo |

### 2.5 Bảng `CaLamViec` (ca làm việc — checklist mở/đóng ca)

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | int (PK) | Mã ca |
| `ngay` | date | Ngày làm việc |
| `ca` | varchar | sáng / chiều / tối |
| `nhan_vien` | varchar | Người phụ trách |
| `checklist_mo_ca` | json | Trạng thái từng mục (nhiệt độ tủ, vệ sinh, nguyên liệu) |
| `checklist_dong_ca` | json | Trạng thái từng mục (làm nguội, cất tủ, bàn giao) |
| `nhiet_do_tu` | json | `{kho_dong, kho_mat_song, kho_mat_chin}` đo thực tế |
| `ban_giao` | text | Ghi chú bàn giao ca đêm |

### 2.6 Bảng `DoanhThuNgay` (doanh thu ngày — dashboard hòa vốn)

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | int (PK) | Mã bản ghi |
| `ngay` | date | Ngày |
| `so_to_ban` | json | Số tô theo kênh: `{tai_quan, mang_ve, app}` |
| `doanh_thu` | decimal | Tổng doanh thu (VND) |
| `chi_phi_nguyen_lieu` | decimal | Food cost thực tế trong ngày |
| `bien_phi_kenh` | decimal | Bao bì + phí sàn app + khuyến mãi |
| `chi_phi_co_dinh_ngay` | decimal | Chi phí cố định phân bổ / ngày |
| `lai_dong_gop` | decimal | = doanh thu − nguyên liệu − biến phí kênh |
| `diem_hoa_von_to` | decimal | Đối chiếu điểm hòa vốn (xem Phân hệ 4) |

---

## 3. Đặc tả 4 phân hệ tính năng cốt lõi

### Phân hệ 1 — Tính giá vốn & Cảnh báo lệch kho tự động

**Tính giá vốn 1 bát (tự động):**

```
qty_raw_gram = qty_net_gram / yield_factor
cost_per_serving = qty_raw_gram × price_per_unit / 1000
food_cost_percent = total_food_cost / price_selling
```

Ví dụ (từ `recipe-costing-sample.yaml`): nạm 34g chín → `34 / 0.68 = 50g` thô; xương mẻ chuẩn → `25kg / 140 tô = 178.6g/tô`.

**Cảnh báo ngưỡng food cost** (từ `food-cost-cogs.yaml`):

| Ngưỡng | Giá trị | Hành động khi vượt |
|---|---|---|
| Mục tiêu toàn menu | 35–38% | Cảnh báo vàng — xem lại định lượng |
| Trần món chủ lực | 42–45% | Cảnh báo đỏ — chặn xuất bán nếu cấu hình yêu cầu |

**Cảnh báo lệch kho:** khi `chenh_lech_percent` của `PhieuKiemKho` vượt ngưỡng (chủ quán đặt, gợi ý ±2–3%) → đẩy cảnh báo "thất thoát nguyên liệu" kèm nguyên liệu và giá trị tiền hao hụt.

### Phân hệ 2 — Quản lý mẻ nước dùng & Luộc thịt (đồng hồ đếm ngược)

Từ SOP `ninh-xuong-bo.md` + `recipe-nuoc-dung-pho-bo.yaml`, lập **timer đếm ngược từng mốc** cho mỗi mẻ `MeNuocDung`:

| # | Mốc sự kiện | Thời điểm | Cảnh báo |
|---|---|---|---|
| 1 | Bắt đầu ninh | t = 0 | Ghi `gio_vao` |
| 2 | Vớt sạch bọt đợt đầu | sau khi đun sôi | Nhắc "cho thịt nạm/gầu vào" |
| 3 | Vớt thịt nạm/gầu | +2.5–3 giờ | Đếm ngược 2.5h, báo khi tới 3h |
| 4 | Nhấc hộp gia vị inox | +45 phút (từ khi thả hộp) | Đếm ngược 45 phút |
| 5 | Châm bù nước sôi | định kỳ theo mực nước | Nhắc kiểm tra mực nước |
| 6 | Kết thúc ninh | +20 giờ | Bàn giao ca đêm |

Mỗi mốc ghi log vào `MeNuocDung` (giờ thực tế) để đối chiếu tiêu chuẩn nghiệm thu (70L / 140 tô).

### Phân hệ 3 — Checklist mở/đóng ca & An toàn thực phẩm

Từ `storage-preservation.yaml`:

**Kiểm tra nhiệt độ (mở ca, lặp định kỳ):**

| Khu vực | Ngưỡng chuẩn | Cảnh báo khi |
|---|---|---|
| Kho đông | ≤ -18°C | > -18°C |
| Kho mát thịt sống | 0–3°C | ngoài 0–3°C |
| Kho mát thịt chín | 2–4°C | ngoài 2–4°C |

**Làm nguội thịt chín (đóng ca) — quy tắc FDA 2h/4h:**

- Đếm ngược: 60°C → 21°C trong ≤ 2 giờ; 21°C → ≤ 4°C trong ≤ 4 giờ tiếp theo.
- Không đạt mốc → cảnh báo "hâm lại ≥ 74°C rồi làm nguội lại, hoặc loại bỏ".
- Khay nông < 5 cm, chia nhỏ phần bán/dùng.

### Phân hệ 4 — Dashboard điểm hòa vốn theo ngày

Từ `food-cost-cogs.yaml.breakeven`:

```
Lai_dong_gop_to = Gia_ban − Gia_von_nguyen_lieu − Bien_phi_kenh
Diem_hoa_von_to_ngay = Chi_phi_co_dinh_thang / Lai_dong_gop_to / So_ngay_ban_thang
```

Dashboard hiển thị theo ngày:

- **Doanh thu hôm nay** vs **điểm hòa vốn hôm nay** (progress bar).
- **Số tô còn thiếu để hòa vốn** = (điểm hòa vốn − số tô đã bán).
- **Lãi đóng góp lũy kế** từ đầu tháng.
- Cảnh báo khi tháng hiện tại chưa đạt hòa vốn ở ngưỡng ước conservative (số tô bán thấp).

---

## 4. Lưu ý triển khai

- Mọi biến số có `TBD_OWNER_INPUT` (giá điện, tỷ lệ gia vị bí quyết) là **ô nhập liệu** trong App — không hard-code, không đoán nghĩa.
- `yield_factor` và `kwh_per_batch` là biến cấu hình toàn cục, cho phép chủ quán cập nhật khi đo thực tế lệch.
- Chuẩn dữ liệu tuân thủ quy ước `name / unit / qty_raw / price_per_unit / yield_factor / qty_net / cost` trong `CLAUDE.md`.
