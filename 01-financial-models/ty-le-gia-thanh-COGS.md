# Tỷ lệ giá thành / COGS — phở bò

Để có lãi khi mở quán phở bò, cần tính ngược từ giá bán thị trường để khống chế giá cost nguyên liệu. Ghi chú gốc nêu ngưỡng 30% – 35% giá bán; sau đối chiếu kiểm toán v0.3.0 (ĐC-01), chốt 3 ngưỡng: mục tiêu toàn menu 35–38%, trần món chủ lực nhiều thịt tối đa 42–45%, và tô mẫu 25.700đ/45.000đ (57.1%) chỉ là ví dụ chưa tối ưu định lượng/giá bán.

## 1. Xác định giá nguyên liệu tối đa (Cost nguyên liệu)

- **Áp dụng tỷ lệ vàng**: giữ tổng tiền nguyên liệu (thịt bò, xương ninh, bánh phở, gia vị, rau hành, gia vị kèm) khoảng 30% – 35% giá bán. Ví dụ: với giá bán 50.000đ/tô, mức nguyên liệu tối đa nên quanh 15.000đ – 17.500đ/tô (thực tế nhiều quán có thể dao động quanh 20.000đ – 26.000đ tùy định lượng thịt và phân khúc).
- **Tính theo định lượng chuẩn**: quy đổi giá mua từng nguyên liệu (kg, bó, lít) về chi phí theo gram/tô rồi cộng lại cho 1 tô tiêu chuẩn, tránh ước lượng cảm tính.
- **Tính cả hao hụt và phần dùng chung**: cộng thêm phần hao hụt khi sơ chế/cắt thái và chia đều chi phí nồi nước dùng (xương, gia vị, nhiên liệu ninh) cho số tô dự kiến bán.
- **Chừa biên độ biến động giá**: giá thịt bò, xương và rau dễ biến động theo mùa hoặc thị trường, nên chừa một khoảng đệm để không bị âm vốn khi giá sỉ tăng.

## 2. Lưu ý khi tính toán giá bán

- **Gánh đủ chi phí cố định theo sản lượng**: lấy tổng chi phí cố định tháng (mặt bằng, lương nhân viên, điện nước, khấu hao dụng cụ) chia cho số tô bán dự kiến mỗi tháng (nên ước conservative/thấp để an toàn) để ra phần chi phí cố định mỗi tô phải gánh.
- **Tính điểm hòa vốn (ĐC-02)**: `Điểm hòa vốn (tô/ngày) = Chi phí cố định tháng ÷ Lãi đóng góp bình quân/tô ÷ Số ngày bán/tháng`, trong đó `Lãi đóng góp/tô = Giá bán − Giá vốn nguyên liệu − Biến phí kênh` (bao bì, phí sàn app, khuyến mãi).
- **Đừng chỉ nhìn lãi gộp**: giá bán trừ nguyên liệu chưa phải lợi nhuận ròng; phải trừ tiếp phần chi phí cố định và vận hành/đóng gói/khuyến mãi trên mỗi tô.
- **Tham khảo mặt bằng giá khu vực**: đặt giá sát với phân khúc khách hàng và đối thủ quanh khu vực mở quán; giá quá thấp dễ gây nghi ngờ chất lượng, còn quá cao sẽ khó kéo khách mới.
- **Tối ưu thực đơn bán kèm**: dùng các món/topping dễ bán hoặc đồ uống có biên lợi nhuận tốt để tăng giá trị trung bình trên mỗi lượt khách.

> Biến số food cost, giá bán tham chiếu, công thức hòa vốn: xem `food-cost-cogs.yaml`. Mẫu tính giá vốn 1 bát đầy đủ: xem `recipe-costing-sample.yaml`.
