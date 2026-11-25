# Bảng quyết định đầu tư & Dòng tiền 13 tuần — suất đầu tư 300 triệu

> Hỗ trợ quyết định cho suất đầu tư 300 triệu (quán gia đình 30–50 chỗ hoặc quán
> mặt phố khởi điểm). **Mọi số tiền cụ thể là `TBD_OWNER_INPUT`** — chủ quán điền
> theo báo giá thực tế (thuê nhà, báo giá thi công, báo giá thiết bị). Khung này
> chỉ cấu trúc + công thức, KHÔNG tự bịa số. Đối chiếu biến số nền ở
> `setup-capital-and-scale.yaml` và `food-cost-cogs.yaml`.

## 1. Biến số đầu vào (điền trước)

| Biến | Ký hiệu | Giá trị | Cách đo / nguồn |
|---|---|---|---|
| Giá bán bình quân 1 tô | `Gia_ban` | `TBD_OWNER_INPUT` | Chốt theo mặt bằng giá khu vực |
| Giá vốn nguyên liệu 1 tô | `Gia_von` | `TBD_OWNER_INPUT` | `recipe-costing-sample.yaml`, food cost mục tiêu 35–38% |
| Biến phí kênh 1 tô | `Bien_phi_kenh` | `TBD_OWNER_INPUT` | Bao bì + phí sàn app + khuyến mãi |
| Lãi đóng góp 1 tô | `Lai_dong_gop` | = Gia_ban − Gia_von − Bien_phi_kenh | Tự tính |
| Chi phí cố định / tháng | `Chi_phi_co_dinh` | `TBD_OWNER_INPUT` | Thuê + lương + điện nước + khấu hao |
| Số ngày bán / tuần | `So_ngay_ban_tuan` | `TBD_OWNER_INPUT` | Theo khung giờ đã chọn |
| Số tô / ngày (3 kịch bản) | `So_to_ngay` | `TBD_OWNER_INPUT` | Xem Bảng 3 |

## 2. Phân bổ 300 triệu — cấu trúc 6 khoản

Nguyên tắc: **tổng 6 khoản = 300 triệu**. Khoản 6 "Quỹ tiền mặt duy trì vận hành"
được tính SAU CÙNG = phần còn lại sau 5 khoản trước, để luôn khớp tổng.

| # | Khoản mục | Nguyên tắc phân bổ (từ ghi chú gốc) | Số tiền (VND) |
|---|---|---|---|
| 1 | Cọc thuê nhà | 1–3 tháng tiền thuê, **HOÀN LẠI** khi hết hợp đồng | `TBD_OWNER_INPUT` |
| 2 | Thuê trả trước kỳ đầu | 2–3 tháng tiền thuê | `TBD_OWNER_INPUT` |
| 3 | Cải tạo hạ tầng | "Phần lớn cho mặt bằng và sửa chữa" | `TBD_OWNER_INPUT` |
| 4 | Thiết bị bếp / quầy | "Tiếp đến là thiết bị – nội thất" | `TBD_OWNER_INPUT` |
| 5 | Nguyên liệu mở bán + Marketing khai trương | "Nguyên liệu ban đầu, marketing khai trương" | `TBD_OWNER_INPUT` |
| 6 | Quỹ tiền mặt duy trì vận hành | tối thiểu 3 tháng chi phí cố định (= 3 × `Chi_phi_co_dinh`) | = 300tr − (1+2+3+4+5) |

> Lưu ý (ĐC-04): tách bạch hai khoản dự phòng độc lập — (1) **Dự phòng phát sinh
> thi công/mua sắm = 5–10% CAPEX** (tính trên tổng khoản 3 + 4, chừa riêng khi nhận
> báo giá thi công/thiết bị), và (2) **Quỹ tiền mặt duy trì vận hành = tối thiểu
> 3 tháng chi phí cố định** (khoản 6). Khoản 6 phải ≥ 3 × `Chi_phi_co_dinh`; nếu
> không đủ, giảm khoản 3–5 hoặc tăng tổng vốn.

## 3. Ba kịch bản số tô/ngày (chủ quán tự định nghĩa)

| Kịch bản | Định nghĩa | Số tô/ngày |
|---|---|---|
| Thận trọng | Mức thấp nhất bạn tin chắc đạt được | `TBD_OWNER_INPUT` |
| Cơ sở | Mức trung bình hợp lý | `TBD_OWNER_INPUT` |
| Khả quan | Mức cao có điều kiện (đủ khách, đủ nhân sự) | `TBD_OWNER_INPUT` |

## 4. Khung dòng tiền 13 tuần

Công thức mỗi tuần (chạy riêng cho từng kịch bản):

- `So_to_tuan = So_to_ngay × So_ngay_ban_tuan`
- `Doanh_thu = So_to_tuan × Gia_ban`
- `Bien_phi = So_to_tuan × (Gia_von + Bien_phi_kenh)`
- `Lai_dong_gop = Doanh_thu − Bien_phi`
- `Chi_phi_co_dinh_tuan = Chi_phi_co_dinh × 12 / 52`
- **Dòng tiền thuần từng tuần** = `Lai_dong_gop − Chi_phi_co_dinh_tuan`
- **Số dư tiền mặt cuối tuần (Cash Balance)** = quỹ tiền mặt đầu kỳ (khoản 6) + Σ dòng tiền thuần các tuần trước
- **Lỗ/Lãi lũy kế (Cumulative P&L)** = Σ dòng tiền thuần các tuần trước (bắt đầu từ 0, KHÔNG cộng vốn gốc 300 triệu)

Ba con số khác nhau: **Số dư tiền mặt** phản ánh "còn bao nhiêu tiền trong két" (bắt
đầu từ quỹ khoản 6), còn **Lỗ/Lãi lũy kế** phản ánh "mẻ kinh doanh này đã lời/lỗ bao
nhiêu" (bắt đầu từ 0).

| Tuần | Số tô/tuần | Doanh thu | Biến phí | Lãi đóng góp | CP cố định/tuần | Dòng tiền thuần | Số dư tiền mặt cuối tuần | Lỗ/Lãi lũy kế |
|---|---|---|---|---|---|---|---|---|
| 1 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 2 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 3 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 4 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 5 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 6 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 7 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 8 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 9 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 10 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 11 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 12 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 13 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |

**Cách đọc mốc quyết định:**

- Tuần đầu tiên có `Lỗ/Lãi lũy kế ≥ 0` là tuần bắt đầu tự nuôi được dòng tiền.
- `Số dư tiền mặt cuối tuần` phải luôn ≥ 0 trong 13 tuần mới an toàn; quỹ khoản 6 phải đủ bù phần `Dòng tiền thuần` âm các tuần đầu.
- Nếu kịch bản **Thận trọng** vẫn cần > 13 tuần để `Lỗ/Lãi lũy kế ≥ 0`, xem lại: giá
  bán, định lượng, chi phí cố định, hoặc chưa nên mở với suất 300 triệu này.

## 5. Ca mẫu điền đầy đủ (Worked Example)

> Số liệu GIẢ ĐỊNH để minh họa cách điền. Chủ quán thay bằng báo giá/đo thực tế của
> mình. Mục đích: thấy rõ 3 dòng tiền khác nhau (dòng tiền thuần / số dư tiền mặt /
> lỗ-lãi lũy kế) và cách khoản 6 "quỹ tiền mặt" đóng vai trò đệm.

### 5.1 Phân bổ 300 triệu (điền đầy đủ)

| # | Khoản mục | Số tiền |
|---|---|---|
| 1 | Cọc thuê nhà | 30 triệu |
| 2 | Thuê trả trước kỳ đầu | 30 triệu |
| 3 | Cải tạo hạ tầng | 60 triệu |
| 4 | Thiết bị bếp / quầy | 90 triệu |
| 5 | Nguyên liệu mở bán + Marketing khai trương | 25 triệu |
| 6 | Quỹ tiền mặt duy trì vận hành | 65 triệu |
| **Tổng** | | **300 triệu** |

> CAPEX (khoản 3 + 4) = 150 triệu → dự phòng thi công 5–10% CAPEX ≈ 7,5–15 triệu
> (chừa riêng khi nhận báo giá; trong ví dụ đã gộp gọn vào khoản 3+4 để khớp 6 khoản).

### 5.2 Thông số vận hành giả định

| Biến | Giá trị giả định |
|---|---|
| Giá bán bình quân | 45.000 đ/tô |
| Giá vốn nguyên liệu | 18.000 đ/tô (food cost 40%) |
| Biến phí kênh | 3.000 đ/tô |
| Lãi đóng góp | 24.000 đ/tô |
| Chi phí cố định / tháng | 21.500.000 đ (≈ 65 triệu / 3 tháng) |
| Số ngày bán / tuần | 7 ngày |
| Ramp số tô/ngày | T1–2: 40 · T3–4: 60 · T5–6: 80 · T7–13: 100 |

> Điểm hòa vốn = 21.500.000 / 24.000 ≈ 896 tô/tháng ≈ 30 tô/ngày. Từ tuần 1 (40
> tô/ngày) đã trên hòa vốn — đây là kịch bản CƠ SỞ; kịch bản THẬN TRỌNG nên hạ ramp
> (ví dụ bắt đầu 25–30 tô/ngày) để thấy rõ số tuần âm dòng tiền.

### 5.3 Dòng tiền 13 tuần (đơn vị: triệu đồng, làm tròn)

| Tuần | Số tô/tuần | Dòng tiền thuần | Số dư tiền mặt cuối tuần | Lỗ/Lãi lũy kế |
|---|---|---|---|---|
| 1 | 280 | +1,76 | 66,76 | +1,76 |
| 2 | 280 | +1,76 | 68,52 | +3,52 |
| 3 | 420 | +5,12 | 73,64 | +8,64 |
| 4 | 420 | +5,12 | 78,76 | +13,76 |
| 5 | 560 | +8,48 | 87,24 | +22,24 |
| 6 | 560 | +8,48 | 95,72 | +30,72 |
| 7 | 700 | +11,84 | 107,56 | +42,56 |
| 8 | 700 | +11,84 | 119,40 | +54,40 |
| 9 | 700 | +11,84 | 131,24 | +66,24 |
| 10 | 700 | +11,84 | 143,08 | +78,08 |
| 11 | 700 | +11,84 | 154,92 | +89,92 |
| 12 | 700 | +11,84 | 166,76 | +101,76 |
| 13 | 700 | +11,84 | 178,60 | +113,60 |

> Cách đọc: `Dòng tiền thuần` = (45.000 − 18.000 − 3.000) × số tô − 4,96 triệu
> (chi phí cố định/tuần = 21,5 triệu × 12 / 52). `Số dư tiền mặt` bắt đầu từ 65
> triệu (khoản 6) rồi cộng dồn dòng tiền thuần. `Lỗ/Lãi lũy kế` bắt đầu từ 0 — cuối
> tuần 13 lời 113,6 triệu, còn số dư tiền mặt là 178,6 triệu (65 triệu vốn + lãi).
