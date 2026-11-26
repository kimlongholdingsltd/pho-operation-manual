---
layout: home

hero:
  name: "Mở & Vận hành Quán Phở"
  text: "Bộ cẩm nang thực chiến — Docs-as-Code"
  tagline: "SOP 6 phần · Mô hình tài chính YAML · Định lượng & food cost · Đặc tả App. Mọi con số có căn cứ thực đo, tuyệt đối không bịa số."
  actions:
    - theme: brand
      text: "Bắt đầu đọc Cẩm nang"
      link: /02-setup-and-location/cac-buoc-chuan-bi-co-ban
    - theme: alt
      text: "Tải Bộ Công Cụ Excel"
      link: /downloads/Bo-Cong-Cu-Tai-Chinh-Quan-Pho-v1.1.xlsx

features:
  - title: "Tránh bẫy mất vốn"
    details: "Phân tách rõ 4 khoản vốn (cọc, trả trước, dự phòng CAPEX 5–10%, quỹ tiền mặt ≥ 3 tháng chi phí cố định). Quyết định đầu tư 300 triệu đi kèm dòng tiền 13 tuần × 3 kịch bản."
  - title: "Kiểm soát Food Cost"
    details: "Chốt ngưỡng 35–38% toàn menu và trần 42–45% món chủ lực nhiều thịt. Tính điểm hòa vốn theo lãi đóng góp, không phải lãi gộp."
  - title: "Chặn thất thoát nguyên liệu"
    details: "Mỗi nguyên liệu có yield_factor (hệ số thu hồi sau sơ chế), kèm biểu mẫu cân trước/sau luộc và phiếu kiểm kho để phát hiện hao hụt bất thường."
  - title: "Sẵn sàng chuyển thành App"
    details: "Mọi định lượng là biến số trong YAML (name, unit, qty_raw, price_per_unit, yield_factor, qty_net, cost). Đội lập trình chuyển thẳng thành database không cần đoán nghĩa."
---

<div class="landing-sections">
  <a href="/01-financial-models/investment-decision-300m">
    <span class="num">01 · Tài chính</span>
    <span class="title">Mô hình tài chính</span>
    <span class="desc">Quyết định đầu tư 300 triệu · dòng tiền 13 tuần · food cost & hòa vốn · dữ liệu YAML.</span>
  </a>
  <a href="/02-setup-and-location/cac-buoc-chuan-bi-co-ban">
    <span class="num">02 · Mở quán</span>
    <span class="title">Mở quán & Mặt bằng</span>
    <span class="desc">Trình tự chuẩn bị · điều kiện tiên quyết · thiết bị · POS · chọn vị trí.</span>
  </a>
  <a href="/03-sop-operations/chon-xuong-bo">
    <span class="num">03 · SOP</span>
    <span class="title">SOP Vận hành</span>
    <span class="desc">Chọn nguyên liệu · ninh xương 100L · ra tô chuẩn · bảo quản thịt + biểu mẫu nghiệm thu.</span>
  </a>
  <a href="/04-hr-and-training/quy-trinh-tuyen-dung-va-dao-tao">
    <span class="num">04 · Nhân sự</span>
    <span class="title">Nhân sự & Đào tạo</span>
    <span class="desc">Quy trình tuyển dụng, đào tạo và chấm công theo ca vận hành.</span>
  </a>
  <a href="/05-marketing-launch/nguyen-tac-thiet-ke-menu">
    <span class="num">05 · Marketing</span>
    <span class="title">Marketing & Khai trương</span>
    <span class="desc">Thiết kế menu & định giá · bán online – offline · chọn khung giờ bán.</span>
  </a>
  <a href="/06-app-specifications/system-architecture-and-specs">
    <span class="num">06 · App</span>
    <span class="title">Đặc tả hệ thống App</span>
    <span class="desc">Database Schema 6 bảng · 4 phân hệ · bộ 6 ca kiểm thử bàn giao.</span>
  </a>
</div>

## Tải Bộ Công Cụ Tài Chính Excel

Bộ công cụ Excel 3 sheet (dự toán vốn 300 triệu · tính giá vốn food cost · hòa vốn theo kênh & dòng tiền 13 tuần) với công thức sống `=SUM`/`=IF` và cảnh báo đỏ khi vượt trần 45% — mở bằng Microsoft Excel hoặc Google Sheets.

<a class="download-cta" href="/downloads/Bo-Cong-Cu-Tai-Chinh-Quan-Pho-v1.1.xlsx" download>⬇ Tải Bộ Công Cụ Excel (v1.1.xlsx)</a>

## Lịch sử phiên bản

| Phiên bản | Nội dung chính |
|---|---|
| **v1.2.0** | Xuất bản Web Docs thương mại bằng VitePress (trang chủ, tìm kiếm toàn văn tiếng Việt, tải Excel). |
| **v1.1.5** | Bảo vệ chia âm/chia 0 cho cột "Hòa vốn theo tháng" E13:E14; đồng bộ nhãn phiên bản. |
| **v1.1.4** | Đồng bộ số liệu 35.963đ/tô (79,9%) trên toàn bộ tài liệu mẫu. |
| **v1.1.3** | Đóng 2 điểm chặn kiểm toán cuối (TC-01/TC-02 = 35.963đ; biến phí kênh 3.000đ). |
| **v1.1.2** | Bỏ tính trùng "đồ thơm lớp 3" khỏi giá vốn mẻ 100L. |
| **v1.1.1** | Hoàn thiện phân bổ điện năng + dầu hương vị; xuất bộ công cụ Excel 3 sheet. |
| **v1.1.0** | Bổ sung công thức chi tiết mẻ nước dùng chuẩn 100L + định lượng thịt ra tô. |
| **v1.0.0** | Phát hành thương mại: trang chủ README + đặc tả hệ thống App. |

> Xem toàn bộ lịch sử trong file `README.md` tại gốc repository.

## Dành cho ai?

- **Người lần đầu mở quán** — đọc theo trình tự: *Các bước chuẩn bị* → *Quyết định đầu tư 300 triệu* → toàn bộ SOP vận hành.
- **Chủ quán đang vận hành** — in bộ biểu mẫu trong phần *03 · SOP Vận hành* và chạy checklist hằng ngày.
- **Đội phát triển phần mềm** — bắt đầu từ *06 · Đặc tả App*, đối chiếu biến số gốc trong `01-financial-models/*.yaml`.
