# Ca mẫu điền đầy đủ — 1 ngày vận hành (Worked Example)

> Số liệu GIẢ ĐỊNH để minh họa cách điền các phiếu theo đúng luồng 1 ngày:
> **nhập hàng → ninh mẻ nước dùng 70L → luộc thịt nạm/gầu → ra tô → đối soát cuối ca**.
> Chủ quán thay bằng số thực tế của mình. Các phiếu trống tham chiếu trong `forms/`.

## Ngày mẫu: 26/11/2026 (thứ Năm)

### 1. Nhập hàng đầu ngày (đối chiếu `ingredients-standards.yaml`)

| Nguyên liệu | Khối lượng | Đơn giá | Kiểm tra tươi (tiêu chí chọn) |
|---|---|---|---|
| Xương bò — ống | 10 kg | 60.000 đ/kg | Đỏ tươi, ống to ~4 đốt ngón tay, nhiều tủy, không hôi |
| Xương bò — lẫn (cổ/sườn/hom) | 10 kg | 60.000 đ/kg | Săn chắc, không mùi lạ |
| Xương heo (ống/cục) | 5 kg | 30.000 đ/kg | Trắng hồng, có tủy, không hôi |
| Thịt nạm | 5,0 kg | 130.000 đ/kg | Đỏ au, thớ mịn, đàn hồi tốt |
| Thịt gầu | 3,0 kg | 120.000 đ/kg | Nửa nạc nửa mỡ, mỡ vàng nhạt |
| Thịt tái (thăn) | 4,0 kg | 150.000 đ/kg | Đỏ tươi, ráo mặt; thái mỏng 1,5–2 mm |
| Bánh phở tươi | 30 kg | 16.000 đ/kg | Dẻo, mặt láng, không hàn the |
| Rau thơm + giá + hành | 10 kg | — | Tươi, không dập úng |

### 2. Ninh mẻ nước dùng (điền `phieu-me-nuoc-dung.md`)

| Mục | Giá trị | Đối chiếu chuẩn |
|---|---|---|
| Nồi | Newsun 100L (6kW) | danh định 100L |
| Tổng xương | 25 kg (20 kg bò + 5 kg heo) | 25 kg |
| Nước lạnh nạp ban đầu | 82 L | 80–85 L |
| Châm bù nước sôi | 18 L (3 lần × 6 L) | 15–20 L |
| Tổng nước cấp vào | 100 L | 100 L |
| Thành phẩm sau lọc | 70 L | 70 L |
| Số tô thành phẩm | 140 tô × 500 mL | 140 tô |
| Tỷ lệ xương/nước ban đầu | 0,25 (25/100) | 0,25 |
| Tỷ lệ xương/nước tổng | 0,25 (25/100) | 0,25 |
| Điện năng | 32 kWh | ~32 kWh |
| Thời gian ninh | 20 giờ (18h00 hôm trước → 14h00) | ~20 giờ |

### 3. Luộc thịt nạm/gầu (điền `phieu-luoc-va-thu-hoi-thit.md`)

| Thịt | Cân sống | Cân chín | Thu hồi | Chuẩn `yield_factor` |
|---|---|---|---|---|
| Nạm | 5,0 kg | 3,4 kg | 68% | 0,68 |
| Gầu | 3,0 kg | 1,95 kg | 65% | 0,65 |

> Vớt sau 2,5–3 giờ (chạy SONG SONG trong 20 giờ ninh, không cộng thêm). Làm nguội
> nhanh theo FDA §3-501.14 (khay nông ≤ 5 cm, 57°C → 21°C ≤ 2h → ≤ 5°C tổng ≤ 6h);
> cất ngăn đông mềm -1°C đến -3°C (tối đa 48h) nếu bán hôm sau, hoặc cấp đông
> ≤ -18°C (điểm đặt tủ -20°C) nếu bán dài ngày.

### 4. Ra tô chuẩn (điền `phieu-ra-to-chuan.md`)

| Cỡ tô | Bánh phở (g) | Thịt (g) | Hành/rau (g) | Nước dùng (mL) |
|---|---|---|---|---|
| Tô thường | 200 | 60 tái + 40 chín (nạm) | 15 | 500 |

> Duy trì nồi nước chan SÔI, tráng tô bằng nước sôi trước khi xếp bánh/thịt
> (xem `ra-to-va-giu-nhiet.md`).

### 5. Đối soát cuối ca (đối chiếu `food-cost-cogs.yaml` + `recipe-costing-sample.yaml`)

| Chỉ số | Giá trị |
|---|---|
| Số tô bán trong ngày | 140 tô (hết mẻ 70L) |
| Doanh thu | 140 × 45.000 = 6.300.000 đ |
| Giá vốn nguyên liệu (mẫu) | 140 × 35.963 = 5.034.820 đ (giá tham khảo, đã gồm điện năng + dầu hương vị) |
| Food cost nguyên liệu | 79,9% → **vượt trần 42–45%, cảnh báo ĐỎ** |
| Kết luận | Mẫu CHƯA tối ưu: cần giảm định lượng thịt/tăng giá/đàm phán giá xương về ngưỡng ≤ 45% |

> Lưu ý: food cost 79,9% là con số của tô MẪU (`recipe-costing-sample.yaml`, giá
> tham khảo) khi phân bổ xương 20 kg bò + 5 kg heo/140 tô và định lượng mới (tái 60g
> + chín 40g) — gia vị đã itemized (nước nèo + tôm khô + đồ thơm 3 lớp) thay ước tính
> 2.000đ. Đây là **tín hiệu cảnh báo để tối ưu**, không phải chuẩn vận hành — trước
> khi bán thật phải đưa về 35–38% (toàn menu) hoặc tối đa 42–45% (món chủ lực nhiều
> thịt).
