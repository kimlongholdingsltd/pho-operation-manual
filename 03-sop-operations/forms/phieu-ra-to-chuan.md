# Phiếu ra tô chuẩn (định lượng)

> Mục đích: chốt định lượng gram/mL cho từng loại thịt và cỡ tô để ra tô đồng đều,
> kiểm soát food cost. **Múc chuẩn nước dùng: 500 mL/tô** (mẻ chuẩn 100L → 140 tô).
> Đối chiếu `dinh_muc_ml_nuoc_dung_per_to` trong
> `../../01-financial-models/recipe-nuoc-dung-pho-bo.yaml` và `portion_thit_ra_to`
> trong `../../01-financial-models/ingredients-standards.yaml`.
>
> Quy tắc giữ nhiệt: duy trì nồi nước chan SÔI suốt giờ bán; tráng tô bằng nước sôi
> trước khi xếp bánh/thịt để giữ trọn độ nóng (xem `../ra-to-va-giu-nhiet.md`).

## 1. Định lượng thịt ra tô (chuẩn v1.1.0)

| Loại thịt | Gram / tô |
|---|---|
| Tái | 60 g |
| Chín (nạm/gầu) | 40 g |
| Bắp | 60 g |
| Gân | 80 g |
| Xào lăn | 70 g |
| Đuôi bò | 150 g |

> Định lượng chuẩn do chủ quán chốt (v1.1.0). Tô mẫu **Phở Bò Tái Chín** = 60 g tái
> + 40 g chín (xem `../../01-financial-models/recipe-costing-sample.yaml`).

## 2. Cỡ tô & nước dùng

| Cỡ tô | Bánh phở (g) | Hành/rau (g) | Nước dùng (mL) | Ghi chú |
|---|---|---|---|---|
| Tô nhỏ | | | | |
| Tô thường | 200 | 15 | 500 | chuẩn 1 tô |
| Tô lớn | | | | |

> Tham khảo mẫu (recipe-costing-sample.yaml): bánh phở 200g, nước dùng 500 mL/tô.
> Chủ quán đo và chốt lại theo nồi/quy mô thực tế.

## 3. Quy cách đóng gói mang về

| Thành phần | Quy cách | Ghi chú |
|---|---|---|
| Nước dùng | ____ mL, túi/ly chịu nhiệt | tách riêng, chống rò rỉ |
| Bánh phở | ____ g | trần sơ, tách riêng |
| Thịt (tái/nạm/gầu) | ____ g | tách riêng |
| Rau, hành | ____ g | tách riêng |
| Gia vị kèm (chanh, ớt, quẩy, tương, đũa thìa) | đủ suất | |

Ký tên người chốt định lượng: ____________
