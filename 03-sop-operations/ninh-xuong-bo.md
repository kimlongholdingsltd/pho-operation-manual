# SOP — Ninh xương bò lấy nước dùng

## 1. Mục tiêu

Ninh xương bò cho nước dùng trong vắt, ngọt lịm từ xương (không phải từ mì chính), thơm lừng và không hôi gây mùi bò. Đồng thời luộc chín thịt nạm/gầu đúng thời điểm để thái bán, và đo lường để chốt định mức xương/nước cho từng quy mô nồi.

## 2. Người thực hiện

Bếp chính. Ca đêm nhận bàn giao từ bếp chính (xem Bước 8).

## 3. Tần suất

Hàng ngày (ninh trước ngày bán, tổng thời gian ninh khoảng 20 tiếng).

## 4. Các bước thực hiện chi tiết

**Nguyên liệu làm nước dùng**: xương bò; mắm, muối, gia vị, mì chính, hạt nêm, đường phèn; hành củ; củ gừng; hành tây; quế; thảo quả; cánh hoa hồi.

**Biến số chủ quán phải đo và chốt** (ghi vào `../01-financial-models/recipe-nuoc-dung-pho-bo.yaml`, đo bằng `forms/phieu-me-nuoc-dung.md`):

| Biến | Ký hiệu YAML | Giá trị |
|---|---|---|
| Tỷ lệ xương/nước (kg xương ÷ lít nước đầu vào) | `ty_le_xuong_nuoc` | `TBD_OWNER_INPUT` |
| Lít nước dùng thành phẩm / mẻ (sau lọc) | `so_lit_nuoc_dung_thanh_pham_per_me` | `TBD_OWNER_INPUT` |
| Định mức nước dùng / tô (mL) | `dinh_muc_ml_nuoc_dung_per_to` | `TBD_OWNER_INPUT` |

> Không tự bịa tỷ lệ xương/nước — đo thực tế mỗi mẻ bằng phiếu `phieu-me-nuoc-dung.md`.

1. **Rửa và khử mùi xương**: xương bò mua về rửa sạch, chà xát với muối và rượu trắng chút đỉnh cho bớt mùi gây, ngâm nước vỏ chanh khoảng **15–20 phút**.
2. **Nướng xương**: xương đã sạch ráo thì cho lên khay nướng trên bếp gas/than, nồi chiên không dầu hoặc lò nướng ở nhiệt **200–230°C** khoảng **15–20 phút**. Xương sẽ cháy xém, chảy mỡ thừa, mùi xương rất thơm, không gây hôi khi ninh.
3. **Hầm sơ và vớt bọt**: xương nướng xong rửa lại sạch với nước, cho vào nồi nước ninh xương. Ở bước này mở nhiệt độ cao vừa phải để bọt nổi lên mặt nước và vớt sạch bọt, không để bọt tan vào nước.
4. **Ninh xương — kiểm soát nhiệt độ liu riu**: ninh khoảng **20 tiếng** với độ sôi **liu riu** (mặt nước sôi lăn tăn, rung nhẹ, KHÔNG sôi sùng sục). Sôi quá mạnh làm nước đục và hao nước nhanh; sôi yếu quá làm xương không nhả hết ngọt.
5. **Mốc kiểm tra & châm bù nước sôi**: định kỳ kiểm tra mực nước, khi nước cạn dưới mức xương thì **châm bù bằng nước SÔI** (không châm nước lạnh — làm vỡ nhiệt, nước đục). Ghi giờ + số lít châm bù vào `phieu-me-nuoc-dung.md`.
6. **Luộc thịt nạm/gầu trong quá trình ninh**: cho thịt nạm, gầu, đuôi (nếu có) vào trong quá trình ninh để đun chín. Thịt chín (thử xiên đũa xuyên dễ, không còn máu hồng) thì vớt ra để nguội trước khi thái bán. Ghi cân trước/sau luộc vào `phieu-luoc-va-thu-hoi-thit.md`.
   - Khung giờ cho thịt vào và vớt ra: `TBD_OWNER_INPUT` (chủ quán chốt theo tổng 20 tiếng ninh, sao cho thịt chín đúng lúc chuẩn bị bán).
7. **Làm nước lèo**: sau khi nước xương được ninh kỹ để tạo mùi thơm và độ ngọt, lấy ra làm nước lèo (nước dùng cho phở). Lúc này mới cho gia vị và nguyên liệu tạo mùi thơm đặc trưng. Tỷ lệ gia vị và cách chế biến nước thơm là bí quyết tạo ra tô phở ngon đúng kiểu truyền thống — để `TBD_OWNER_INPUT`, không tự bịa.
8. **Bàn giao qua đêm**: ca đêm nhận bàn giao phải biết rõ (a) mực nước hiện tại, (b) mốc châm bù tiếp theo, (c) giờ dự kiến vớt thịt/vớt xương. Ghi vào sổ bàn giao để ca sáng không phải đoán.
9. **Chuẩn bị bán hàng**: chuẩn bị thịt, rau thơm, bánh phở để bán; ra tô theo `phieu-ra-to-chuan.md`.

## 5. Tiêu chuẩn nghiệm thu

- Nước dùng **trong vắt** (không đục, không vẩn bọt).
- **Thơm lừng**, không gây (không còn mùi hôi bò).
- **Ngọt lịm từ xương**, không phải từ mì chính.
- Mực nước được duy trì ổn định suốt 20 tiếng (có ghi châm bù).
- Thịt nạm/gầu chín đều, không khô, không sống; thu hồi khớp `yield_factor` (nạm 0.68 / gầu 0.65) hoặc lệch trong ±2 điểm %.

## 6. Lỗi thường gặp & Cách xử lý

- **Nước đục do bọt tan vào** → vớt sạch bọt ngay khi bọt nổi, không để tan vào nước.
- **Nước đục do châm nước lạnh** → chỉ châm bù bằng nước sôi.
- **Nước hôi gây mùi bò** → rửa xương với muối/rượu trắng, ngâm nước vỏ chanh và nướng xương trước khi ninh.
- **Nước hao quá nhanh / cạn dưới xương** → kiểm soát nhiệt độ liu riu (không sôi sùng sục), kiểm tra mực nước theo mốc định kỳ.
- **Thịt luộc chín quá hoặc khô** → kiểm tra đúng thời điểm cho thịt vào luộc và vớt ra để nguội đúng quy trình.
