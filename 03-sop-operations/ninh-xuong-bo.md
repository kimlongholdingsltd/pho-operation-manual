# SOP — Ninh xương bò lấy nước dùng

## 1. Mục tiêu

Ninh xương bò cho nước dùng trong vắt, ngọt lịm từ xương (không phải từ mì chính), thơm lừng và không hôi gây mùi bò. Đồng thời luộc chín thịt nạm/gầu đúng thời điểm để thái bán, và vận hành mẻ chuẩn theo định mức đã chốt (nồi 100L → 140 tô).

## 2. Người thực hiện

Bếp chính. Ca đêm nhận bàn giao từ bếp chính (xem Bước 9).

## 3. Tần suất

Hàng ngày (ninh trước ngày bán, tổng thời gian ninh khoảng 20 tiếng).

## 4. Các bước thực hiện chi tiết

**Nguyên liệu làm nước dùng**: xương bò; mắm, muối, gia vị, mì chính, hạt nêm, đường phèn; hành củ; củ gừng; hành tây; quế; thảo quả; cánh hoa hồi; nước mắm cốt độ đạm cao.

**Định mức mẻ chuẩn** (v0.4.0 — số thực đo, đã chốt trong `../01-financial-models/recipe-nuoc-dung-pho-bo.yaml`):

| Hạng mục | Giá trị |
|---|---|
| Nồi chuẩn | Nồi điện Newsun 100L (công suất max 6kW) |
| Xương đầu vào | 25 kg (ống + cục) |
| Nước đầu vào | 100 lít |
| Thành phẩm sau lọc | 70 lít = 140 tô |
| Định mức nước dùng / tô | 500 mL |
| Điện năng | ~32 kWh/mẻ (đun sôi ~8 kWh + ninh liu riu ~24 kWh) |

1. **Rửa và khử mùi xương**: xương bò mua về rửa sạch, chà xát với muối và rượu trắng chút đỉnh cho bớt mùi gây, ngâm nước vỏ chanh khoảng **15–20 phút**.
2. **Nướng xương**: xương đã sạch ráo thì cho lên khay nướng trên bếp gas/than, nồi chiên không dầu hoặc lò nướng ở nhiệt **200–230°C** khoảng **15–20 phút**. Xương sẽ cháy xém, chảy mỡ thừa, mùi xương rất thơm, không gây hôi khi ninh.
3. **Hầm sơ và vớt bọt**: xương nướng xong rửa lại sạch với nước, cho vào nồi nước ninh xương. Ở bước này mở nhiệt độ cao vừa phải để bọt nổi lên mặt nước và vớt sạch bọt, không để bọt tan vào nước.
4. **Cho thịt nạm/gầu vào ngay sau khi vớt sạch bọt đợt đầu**: ngay sau khi vớt sạch bọt đợt đầu, cho thịt nạm, gầu, đuôi (nếu có) vào nồi nước dùng để luộc chín.
5. **Ninh xương — kiểm soát nhiệt độ liu riu**: ninh khoảng **20 tiếng** với độ sôi **liu riu** (mặt nước sôi lăn tăn, rung nhẹ, KHÔNG sôi sùng sục). Sôi quá mạnh làm nước đục và hao nước nhanh; sôi yếu quá làm xương không nhả hết ngọt.
6. **Mốc kiểm tra & châm bù nước sôi**: định kỳ kiểm tra mực nước, khi nước cạn dưới mức xương thì **châm bù bằng nước SÔI** (không châm nước lạnh — làm vỡ nhiệt, nước đục). Ghi giờ + số lít châm bù vào `forms/phieu-me-nuoc-dung.md`.
7. **Vớt thịt sau 2,5–3 giờ luộc**: thịt nạm/gầu luộc **2,5–3 giờ** (kiểm tra độ chín mềm rồi vớt ra — xiên đũa xuyên dễ, không còn máu hồng). Để nguội tự nhiên (áp dụng quy tắc kiểm soát thời gian/nhiệt độ tránh vùng nguy cơ 4–60°C), sau đó chia túi/hộp: **ngăn đông mềm** nếu bán ngay hôm sau, hoặc **cấp đông lạnh sâu** nếu bảo quản dài ngày. Ghi cân trước/sau luộc vào `forms/phieu-luoc-va-thu-hoi-thit.md`.
8. **Làm nước lèo — tạo hương & nêm nếm**: sau khi nước xương được ninh kỹ để tạo mùi thơm và độ ngọt, lấy ra làm nước lèo (nước dùng cho phở). Lúc này mới cho gia vị và nguyên liệu tạo mùi thơm đặc trưng.
   - **Hộp gia vị inox**: toàn bộ thảo mộc (quế, hồi, thảo quả...) cho vào hộp inox lưới nhúng trong nồi nước dùng, **tuyệt đối KHÔNG thả trực tiếp**. Nhấc hộp gia vị ra sau khoảng **45 phút** để nước dùng thanh, không bị nồng/đắng mùi quế hồi.
   - **Phối hợp hương liệu 3 lớp**: (1) gừng, hành tây, quế hồi nướng thơm trước khi cho vào hộp; (2) kết hợp một phần gia vị để tươi (không nướng) cho cùng vào hộp để giữ hậu vị tươi; (3) bắt buộc có phần hương vị chưng cất cùng dầu ăn (dầu điều/mỡ hành gia vị chưng) để tạo độ béo và dậy mùi đặc trưng.
   - **Nước mắm nêm**: dùng nước mắm cốt độ đạm cao để tạo vị ngọt hậu tự nhiên. Tỷ lệ gia vị chính xác là bí quyết riêng — để `TBD_OWNER_INPUT`, không tự bịa.
9. **Bàn giao qua đêm**: ca đêm nhận bàn giao phải biết rõ (a) mực nước hiện tại, (b) mốc châm bù tiếp theo, (c) giờ dự kiến vớt thịt/vớt xương. Ghi vào sổ bàn giao để ca sáng không phải đoán.
10. **Chuẩn bị bán hàng**: chuẩn bị thịt, rau thơm, bánh phở để bán; ra tô chuẩn 500 mL/tô theo `ra-to-va-giu-nhiet.md` và `forms/phieu-ra-to-chuan.md`.

## 5. Tiêu chuẩn nghiệm thu

- Nước dùng **trong vắt** (không đục, không vẩn bọt).
- **Thơm lừng**, không gây (không còn mùi hôi bò).
- **Ngọt lịm từ xương**, không phải từ mì chính.
- **Mùi quế hồi thanh**, không nồng/đắng (nhấc hộp gia vị đúng ~45 phút).
- Mực nước được duy trì ổn định suốt 20 tiếng (có ghi châm bù).
- Thịt nạm/gầu chín đều sau 2,5–3 giờ, không khô, không sống; thu hồi khớp `yield_factor` (nạm 0.68 / gầu 0.65) hoặc lệch trong ±2 điểm %.
- Thành phẩm đạt **70 lít / 140 tô** cho mẻ chuẩn 25 kg xương + 100 L nước.

## 6. Lỗi thường gặp & Cách xử lý

- **Nước đục do bọt tan vào** → vớt sạch bọt ngay khi bọt nổi, không để tan vào nước.
- **Nước đục do châm nước lạnh** → chỉ châm bù bằng nước sôi.
- **Nước hôi gây mùi bò** → rửa xương với muối/rượu trắng, ngâm nước vỏ chanh và nướng xương trước khi ninh.
- **Nước nồng/đắng mùi quế hồi** → nhấc hộp gia vị ra đúng ~45 phút, không thả thảo mộc trực tiếp.
- **Nước hao quá nhanh / cạn dưới xương** → kiểm soát nhiệt độ liu riu (không sôi sùng sục), kiểm tra mực nước theo mốc định kỳ.
- **Thịt luộc chín quá hoặc khô** → đúng thời điểm cho thịt vào (ngay sau vớt sạch bọt đợt đầu) và vớt ra sau 2,5–3 giờ, để nguội đúng quy trình.
- **Thịt để nguội ở nhiệt độ phòng quá lâu** → vi khuẩn phát triển (vùng 4–60°C) → áp dụng quy tắc kiểm soát thời gian/nhiệt độ, chia nhỏ, đưa vào ngăn đông mềm/cấp đông sâu kịp thời.
