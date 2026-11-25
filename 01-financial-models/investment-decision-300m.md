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

Nguyên tắc: **tổng 6 khoản = 300 triệu**. Khoản 6 "Quỹ dự phòng chịu lỗ 3 tháng
đầu" được tính SAU CÙNG = phần còn lại sau 5 khoản trước, để luôn khớp tổng.

| # | Khoản mục | Nguyên tắc phân bổ (từ ghi chú gốc) | Số tiền (VND) |
|---|---|---|---|
| 1 | Cọc thuê nhà | 1–3 tháng tiền thuê, **HOÀN LẠI** khi hết hợp đồng | `TBD_OWNER_INPUT` |
| 2 | Thuê trả trước kỳ đầu | 2–3 tháng tiền thuê | `TBD_OWNER_INPUT` |
| 3 | Cải tạo hạ tầng | "Phần lớn cho mặt bằng và sửa chữa" | `TBD_OWNER_INPUT` |
| 4 | Thiết bị bếp / quầy | "Tiếp đến là thiết bị – nội thất" | `TBD_OWNER_INPUT` |
| 5 | Nguyên liệu mở bán + Marketing khai trương | "Nguyên liệu ban đầu, marketing khai trương" | `TBD_OWNER_INPUT` |
| 6 | Quỹ dự phòng chịu lỗ 3 tháng đầu | ≥ 3 × `Chi_phi_co_dinh` + dự phòng thi công 5–10% CAPEX | = 300tr − (1+2+3+4+5) |

> Lưu ý: khoản 6 tối thiểu phải ≥ 3 × `Chi_phi_co_dinh`. Nếu không đủ, phải giảm
> khoản 3–5 hoặc tăng tổng vốn.

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
- `Dong_tien_rong = Lai_dong_gop − Chi_phi_co_dinh_tuan`
- `Tich_luy = Tich_luy tuần trước + Dong_tien_rong`

| Tuần | Số tô/tuần | Doanh thu | Biến phí | Lãi đóng góp | CP cố định/tuần | Dòng tiền ròng | Tích lũy |
|---|---|---|---|---|---|---|---|
| 1 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 2 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 3 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 4 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 5 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 6 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 7 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 8 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 9 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 10 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 11 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 12 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |
| 13 | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |

**Cách đọc mốc quyết định:**

- Tuần đầu tiên có `Tich_luy ≥ 0` là tuần bắt đầu tự nuôi được dòng tiền.
- Quỹ dự phòng 3 tháng (khoản 6) phải đủ bù phần `Tich_luy` âm trong 13 tuần.
- Nếu kịch bản **Thận trọng** vẫn cần > 13 tuần để `Tich_luy ≥ 0`, xem lại: giá
  bán, định lượng, chi phí cố định, hoặc chưa nên mở với suất 300 triệu này.
