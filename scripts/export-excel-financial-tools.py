# -*- coding: utf-8 -*-
"""
Xuất Bộ Công Cụ Tài Chính Quán Phở — file Excel có công thức sống.

Nguồn dữ liệu: 01-financial-models/*.yaml (đọc trực tiếp, không bịa số).
Đầu ra       : assets/Bo-Cong-Cu-Tai-Chinh-Quan-Pho-v1.1.xlsx

3 sheet:
  1. Du-Toan-Von-300Tr          — phân bổ 6 khoản 300 triệu + kiểm tra quỹ 3 tháng.
  2. Tinh-Gia-Von-Food-Cost     — giá vốn nước dùng 100L, dầu 5L, nước nèo,
                                  định lượng thịt, food cost với cảnh báo đỏ >45%.
  3. Dong-Tien-13-Tuan-Hoa-Von  — điểm hòa vốn tô/ngày theo kênh + dòng tiền 13 tuần.

Chạy:  python3 scripts/export-excel-financial-tools.py
"""
import os
import yaml

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import CellIsRule

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FM = os.path.join(REPO, "01-financial-models")
OUT = os.path.join(REPO, "assets", "Bo-Cong-Cu-Tai-Chinh-Quan-Pho-v1.1.xlsx")

# ---------- Kiểu dáng ----------
NAVY = "1F4E78"
LIGHT_BLUE = "D9E1F2"
INPUT_YELLOW = "FFF2CC"   # ô chủ quán điền
CALC_GREEN = "E2EFDA"     # ô công thức tự tính
WARN_RED = "FFC7CE"
NOTE_GREY = "808080"

HEADER_FILL = PatternFill("solid", fgColor=NAVY)
SUBHEAD_FILL = PatternFill("solid", fgColor=LIGHT_BLUE)
INPUT_FILL = PatternFill("solid", fgColor=INPUT_YELLOW)
CALC_FILL = PatternFill("solid", fgColor=CALC_GREEN)
WARN_FILL = PatternFill("solid", fgColor=WARN_RED)
TOTAL_FILL = PatternFill("solid", fgColor="FCE4D6")

HEADER_FONT = Font(bold=True, color="FFFFFF", size=10)
TITLE_FONT = Font(bold=True, size=14, color=NAVY)
SUBHEAD_FONT = Font(bold=True, size=11, color=NAVY)
BOLD = Font(bold=True)
NOTE_FONT = Font(italic=True, size=9, color=NOTE_GREY)
WARN_FONT = Font(bold=True, color="9C0006")

THIN = Side(style="thin", color="BFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

CURRENCY = '#,##0" ₫"'
NUMBER = "#,##0.00"
INT = "#,##0"
PERCENT = "0.0%"

WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center")
LEFT = Alignment(horizontal="left", vertical="center")
RIGHT = Alignment(horizontal="right", vertical="center")


def style_cell(c, *, fill=None, font=None, num_fmt=None, align=None, border=True):
    if fill:
        c.fill = fill
    if font:
        c.font = font
    if num_fmt:
        c.number_format = num_fmt
    if align:
        c.alignment = align
    if border:
        c.border = BORDER
    return c


def set_widths(ws, widths):
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def title(ws, row, text, span):
    c = ws.cell(row=row, column=1, value=text)
    c.font = TITLE_FONT
    if span > 1:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=span)


def note(ws, row, text, span):
    c = ws.cell(row=row, column=1, value=text)
    c.font = NOTE_FONT
    c.alignment = WRAP
    if span > 1:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=span)


def subhead(ws, row, text, span):
    c = ws.cell(row=row, column=1, value=text)
    c.font = SUBHEAD_FONT
    c.fill = SUBHEAD_FILL
    c.alignment = LEFT
    for col in range(1, span + 1):
        ws.cell(row=row, column=col).fill = SUBHEAD_FILL
        ws.cell(row=row, column=col).border = BORDER


def header(ws, row, labels):
    for i, lab in enumerate(labels, start=1):
        c = ws.cell(row=row, column=i, value=lab)
        style_cell(c, fill=HEADER_FILL, font=HEADER_FONT, align=CENTER)


# ---------- Đọc dữ liệu YAML ----------
def load(name):
    with open(os.path.join(FM, name), encoding="utf-8") as f:
        return yaml.safe_load(f)


rc = load("recipe-costing-sample.yaml")
rnd = load("recipe-nuoc-dung-pho-bo.yaml")
ing = load("ingredients-standards.yaml")
fc = load("food-cost-cogs.yaml")

PRICE_SELLING = rc["meta"]["price_selling"]                # 45000
FOOD_COST_TARGET = rc["meta"]["target_food_cost_percent"]  # 0.38
CEILING = 0.45                                             # trần món chủ lực (ĐC-01)

PORTION = ing["portion_thit_ra_to"]
BROTH_SPEC = rnd["batch_spec"]
SO_TO = BROTH_SPEC["so_to_thanh_pham"]                     # 140
DIEN = rnd["dien_nang"]
NUOC_NEO_70L = rnd["nuoc_neo"]["thanh_phan_per_70L"]
OIL_5L = rnd["dau_huong_vi_chung_cat"]["nguyen_lieu"]

# Giá tham khảo cho các loại thịt chưa có trong YAML (rõ ràng là GIÁ THAM KHẢO).
# Tái 150k & nạm 130k lấy từ recipe-costing-sample.yaml; bắp/gân/đuôi để giá tham
# khảo để chủ quán thay bằng giá nhập thực tế.
MEAT_REF = {
    "tai": 150000,   # thăn bò (có trong recipe-costing-sample)
    "chin": 130000,  # nạm bò (có trong recipe-costing-sample)
    "bap": 150000,   # bắp bò — GIÁ THAM KHẢO
    "gan": 180000,   # gân bò — GIÁ THAM KHẢO
    "duoi": 200000,  # đuôi bò — GIÁ THAM KHẢO
}

wb = Workbook()

# =============================================================================
# SHEET 1 — DU-TOAN-VON-300TR
# =============================================================================
ws = wb.active
ws.title = "Du-Toan-Von-300Tr"
set_widths(ws, [6, 40, 34, 22, 40])

r = 1
title(ws, r, "DỰ TOÁN VỐN — SUẤT ĐẦU TƯ 300 TRIỆU", 5); r += 1
note(ws, r, "Phân bổ 6 khoản (theo 01-financial-models/investment-decision-300m.md — ca mẫu 5.1). "
            "Ô vàng = chủ quán điền theo báo giá thực tế. Khoản 6 'Quỹ tiền mặt' tự tính = 300 triệu − (khoản 1..5).", 5); r += 2

header(ws, r, ["#", "Khoản mục", "Nguyên tắc phân bổ", "Số tiền (VNĐ)", "Ghi chú"]); r += 1

buckets = [
    ("Cọc thuê nhà", "1–3 tháng tiền thuê; HOÀN LẠI khi hết hợp đồng", 30000000, "input"),
    ("Thuê trả trước kỳ đầu", "2–3 tháng tiền thuê, phân bổ dần theo kỳ", 30000000, "input"),
    ("Cải tạo hạ tầng", "Phần lớn cho mặt bằng & sửa chữa", 60000000, "input"),
    ("Thiết bị bếp / quầy", "Thiết bị – nội thất", 90000000, "input"),
    ("Nguyên liệu mở bán + Marketing khai trương", "Nguyên liệu ban đầu + khai trương", 25000000, "input"),
]
first_bucket_row = r
for i, (name, rule, amount, kind) in enumerate(buckets, start=1):
    ws.cell(row=r, column=1, value=i).alignment = CENTER
    ws.cell(row=r, column=2, value=name).alignment = LEFT
    ws.cell(row=r, column=3, value=rule).alignment = WRAP
    d = ws.cell(row=r, column=4, value=amount)
    style_cell(d, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
    ws.cell(row=r, column=5, value="").alignment = LEFT
    for col in range(1, 6):
        ws.cell(row=r, column=col).border = BORDER
    r += 1

# Khoản 6 = 300tr − (khoản 1..5)
quy_row = r
ws.cell(row=r, column=1, value=6).alignment = CENTER
ws.cell(row=r, column=2, value="Quỹ tiền mặt duy trì vận hành").alignment = LEFT
ws.cell(row=r, column=3, value="Tối thiểu 3 tháng chi phí cố định").alignment = WRAP
d = ws.cell(row=r, column=4, value=f"=300000000-SUM(D{first_bucket_row}:D{first_bucket_row+4})")
style_cell(d, fill=CALC_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws.cell(row=r, column=5, value="= 300 triệu − (1..5)").alignment = LEFT
for col in range(1, 6):
    ws.cell(row=r, column=col).border = BORDER
r += 1

# Tổng
total_row = r
ws.cell(row=r, column=1, value="").alignment = CENTER
ws.cell(row=r, column=2, value="TỔNG").font = BOLD
ws.cell(row=r, column=3, value="").alignment = WRAP
d = ws.cell(row=r, column=4, value=f"=SUM(D{first_bucket_row}:D{quy_row})")
style_cell(d, fill=TOTAL_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws.cell(row=r, column=5, value="Phải = 300.000.000 ₫").alignment = LEFT
for col in range(1, 6):
    ws.cell(row=r, column=col).border = BORDER
r += 2

# Kiểm tra quỹ ≥ 3 tháng chi phí cố định
subhead(ws, r, "KIỂM TRA ĐỆM VẬN HÀNH (quỹ ≥ 3 tháng chi phí cố định)", 5); r += 1
header(ws, r, ["", "Hạng mục", "", "Giá trị (VNĐ)", ""]); r += 1

cpcd_row = r
ws.cell(row=r, column=2, value="Chi phí cố định / tháng").alignment = LEFT
d = ws.cell(row=r, column=4, value=21500000)
style_cell(d, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
ws.cell(row=r, column=5, value="Thuê + lương + điện nước + khấu hao").alignment = LEFT
r += 1

yc_row = r
ws.cell(row=r, column=2, value="Yêu cầu quỹ tối thiểu (3 tháng CP cố định)").alignment = LEFT
d = ws.cell(row=r, column=4, value=f"=D{cpcd_row}*3")
style_cell(d, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
ws.cell(row=r, column=5, value="= CP cố định × 3").alignment = LEFT
r += 1

qt_row = r
ws.cell(row=r, column=2, value="Quỹ thực tế (khoản 6)").alignment = LEFT
d = ws.cell(row=r, column=4, value=f"=D{quy_row}")
style_cell(d, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
ws.cell(row=r, column=5, value="").alignment = LEFT
r += 1

res_row = r
ws.cell(row=r, column=2, value="Kết quả kiểm tra").alignment = LEFT
d = ws.cell(row=r, column=4, value=f'=IF(D{qt_row}>=D{yc_row},"ĐẠT","KHÔNG ĐỦ — giảm khoản 3–5 hoặc tăng tổng vốn")')
style_cell(d, fill=CALC_FILL, font=BOLD, align=LEFT)
ws.merge_cells(start_row=r, start_column=4, end_row=r, end_column=5)
r += 2

note(ws, r, "Lưu ý (ĐC-04): tách bạch (1) Dự phòng phát sinh thi công/mua sắm = 5–10% CAPEX (khoản 3+4) — chừa riêng khi nhận báo giá; "
            "và (2) Quỹ tiền mặt = tối thiểu 3 tháng CP cố định. Nếu khoản 6 không đủ 3 tháng, giảm khoản 3–5 hoặc tăng tổng vốn.", 5); r += 1
note(ws, r, "CAPEX (khoản 3 + 4) = 150 triệu trong ca mẫu → dự phòng thi công 5–10% ≈ 7,5–15 triệu.", 5)

ws.freeze_panes = "A4"

# =============================================================================
# SHEET 2 — TINH-GIA-VON-FOOD-COST
# =============================================================================
ws2 = wb.create_sheet("Tinh-Gia-Von-Food-Cost")
set_widths(ws2, [34, 12, 10, 15, 16, 15, 34])

r = 1
title(ws2, r, "TÍNH GIÁ VỐN & FOOD COST — PHỞ BÒ TÁI CHÍN", 7); r += 1
note(ws2, r, "Ô vàng = chủ quán sửa (đơn giá nhập, định lượng). Ô xanh = tự tính. Mẻ nước dùng chuẩn 100L → 140 tô (500 mL/tô). "
             "Nguồn: recipe-costing-sample.yaml + recipe-nuoc-dung-pho-bo.yaml.", 7); r += 2

# --- Block A: giá bán & ngưỡng ---
subhead(ws2, r, "GIÁ BÁN & NGƯỠNG FOOD COST", 7); r += 1
ws2.cell(row=r, column=1, value="Giá bán 1 tô").alignment = LEFT
pb = ws2.cell(row=r, column=4, value=PRICE_SELLING)
style_cell(pb, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=5, value="VND").alignment = LEFT
r += 1
ws2.cell(row=r, column=1, value="Ngưỡng food cost mục tiêu (toàn menu)").alignment = LEFT
tgt = ws2.cell(row=r, column=4, value=FOOD_COST_TARGET)
style_cell(tgt, fill=INPUT_FILL, num_fmt=PERCENT, align=RIGHT)
ws2.cell(row=r, column=5, value="35–38% (chuẩn)").alignment = LEFT
r += 1
ws2.cell(row=r, column=1, value="Ngưỡng trần food cost (món chủ lực nhiều thịt)").alignment = LEFT
cel = ws2.cell(row=r, column=4, value=CEILING)
style_cell(cel, fill=INPUT_FILL, num_fmt=PERCENT, align=RIGHT)
ws2.cell(row=r, column=5, value="42–45% (trần)").alignment = LEFT
r += 2

# --- Block B: nước dùng mẻ 100L ---
subhead(ws2, r, "NƯỚC DÙNG MẺ 100L (25 kg xương → 140 tô)", 7); r += 1
header(ws2, r, ["Nguyên liệu", "Định lượng/mẻ", "Đơn vị", "Đơn giá (đ/đv)", "Thành tiền (đ/mẻ)", "Giá vốn (đ/tô)", "Ghi chú"]); r += 1

broth = [
    ("Xương bò", 20, "kg", 60000, "20 kg/mẻ (ống + lẫn)"),
    ("Xương heo", 5, "kg", 30000, "5 kg/mẻ (ống/cục)"),
    ("Tôm khô (cốt ngọt)", 0.6, "kg", 180000, "600 g/mẻ"),
    ("Gừng (cốt ngọt + đồ thơm nướng/tươi)", 1.8, "kg", 40000, "1 kg cốt ngọt + 0.5 nướng + 0.3 tươi (v1.1.2 bỏ 0.2 chưng dầu)"),
    ("Hành khô", 0.25, "kg", 25000, "250 g nướng (v1.1.2 bỏ 200 g chưng dầu)"),
    ("Hành tây", 0.2, "kg", 20000, "1 củ ~200 g nướng"),
    ("Nước nèo — mì chính", 0.49, "kg", 50000, "490 g/70L"),
    ("Nước nèo — đường phèn", 0.84, "kg", 30000, "840 g/70L"),
    ("Nước nèo — hạt nêm", 0.35, "kg", 75000, "350 g/70L"),
    ("Nước nèo — muối trắng", 0.28, "kg", 8000, "280 g/70L"),
    ("Nước nèo — nước mắm cốt", 2.45, "kg", 80000, "2450 g/70L"),
    ("Điện năng ninh (nồi Newsun 100L)", 32, "kWh", 3000, "32 kWh/mẻ (điện kinh doanh ~3.000đ/kWh)"),
    ("Dầu hương vị — Đồ thơm lớp 3 (1L/mẻ 100L)", 1, "lít", None, "kéo 'đơn giá 1L' từ mẻ dầu 5L bên dưới"),
]
broth_first = r
for name, qty, unit, price, note_ in broth:
    ws2.cell(row=r, column=1, value=name).alignment = LEFT
    b = ws2.cell(row=r, column=2, value=qty)
    style_cell(b, fill=INPUT_FILL, num_fmt=NUMBER, align=RIGHT)
    ws2.cell(row=r, column=3, value=unit).alignment = CENTER
    d = ws2.cell(row=r, column=4, value=price if price is not None else None)
    if price is not None:
        style_cell(d, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
    e = ws2.cell(row=r, column=5, value=f"=B{r}*D{r}")
    style_cell(e, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
    f = ws2.cell(row=r, column=6, value=f"=E{r}/{SO_TO}")
    style_cell(f, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
    ws2.cell(row=r, column=7, value=note_).alignment = WRAP
    r += 1
broth_last = r - 1
dau_broth_row = broth_first + len(broth) - 1  # dòng "Dầu hương vị"

# Tổng mẻ nước dùng
broth_total = r
ws2.cell(row=r, column=1, value="TỔNG mẻ nước dùng").font = BOLD
ws2.cell(row=r, column=5, value=f"=SUM(E{broth_first}:E{broth_last})")
style_cell(ws2.cell(row=r, column=5), fill=TOTAL_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=6, value=f"=SUM(F{broth_first}:F{broth_last})")
style_cell(ws2.cell(row=r, column=6), fill=TOTAL_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="Giá vốn nước dùng + gia vị = tổng/mẻ ÷ 140 tô").alignment = WRAP
for col in range(1, 8):
    ws2.cell(row=r, column=col).border = BORDER
broth_total_row = r
r += 2

# --- Block C: dầu hương vị 5L ---
subhead(ws2, r, "DẦU HƯƠNG VỊ CHƯNG CẤT — MẺ 5 LÍT (phân bổ 1L/mẻ 100L = 1/5 mẻ)", 7); r += 1
header(ws2, r, ["Nguyên liệu", "Định lượng/mẻ 5L", "Đơn vị", "Đơn giá (đ/đv)", "Thành tiền (đ/mẻ)", "", "Ghi chú"]); r += 1

oil = [
    ("Dầu ăn", 5, "lít", 40000, ""),
    ("Gừng thái lát", 1.5, "kg", 40000, ""),
    ("Hành tím đập dập", 0.9, "kg", 25000, ""),
    ("Tỏi", 0.2, "kg", 50000, ""),
    ("Quế", 0.1, "kg", 120000, ""),
    ("Thảo quả", 0.07, "kg", 200000, ""),
    ("Hoa hồi", 0.07, "kg", 150000, ""),
]
oil_first = r
for name, qty, unit, price, note_ in oil:
    ws2.cell(row=r, column=1, value=name).alignment = LEFT
    b = ws2.cell(row=r, column=2, value=qty)
    style_cell(b, fill=INPUT_FILL, num_fmt=NUMBER, align=RIGHT)
    ws2.cell(row=r, column=3, value=unit).alignment = CENTER
    d = ws2.cell(row=r, column=4, value=price)
    style_cell(d, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
    e = ws2.cell(row=r, column=5, value=f"=B{r}*D{r}")
    style_cell(e, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
    ws2.cell(row=r, column=7, value=note_).alignment = WRAP
    r += 1
oil_last = r - 1

# Tổng 5L
oil_total_row = r
ws2.cell(row=r, column=1, value="TỔNG mẻ 5L dầu hương vị").font = BOLD
ws2.cell(row=r, column=5, value=f"=SUM(E{oil_first}:E{oil_last})")
style_cell(ws2.cell(row=r, column=5), fill=TOTAL_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
r += 1

# 1L cost
oil_1l_row = r
ws2.cell(row=r, column=1, value="Giá 1 L dầu hương vị").alignment = LEFT
ws2.cell(row=r, column=5, value=f"=E{oil_total_row}/5")
style_cell(ws2.cell(row=r, column=5), fill=CALC_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= tổng mẻ 5L ÷ 5").alignment = LEFT
r += 1

# Giá vốn/tô
oil_pertob_row = r
ws2.cell(row=r, column=1, value="Giá vốn dầu hương vị / tô").alignment = LEFT
ws2.cell(row=r, column=5, value=f"=E{oil_1l_row}/{SO_TO}")
style_cell(ws2.cell(row=r, column=5), fill=CALC_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= 1L ÷ 140 tô").alignment = LEFT
r += 2

# Nối "đơn giá dầu 1L" vào dòng Dầu hương vị trong Block B
ws2.cell(row=dau_broth_row, column=4, value=f"=E{oil_1l_row}")
style_cell(ws2.cell(row=dau_broth_row, column=4), fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)

# --- Block D: định lượng thịt ---
subhead(ws2, r, "ĐỊNH LƯỢNG THỊT RA TÔ & GIÁ VỐN (chỉnh gram + đơn giá)", 7); r += 1
header(ws2, r, ["Loại thịt", "Gram ra tô (g)", "Hệ số thu hồi", "Gram thô mua (g)", "Đơn giá nhập (đ/kg)", "Giá vốn (đ/tô)", "Ghi chú"]); r += 1

meats = [
    ("Thịt bò tái (thăn)", PORTION["tai_g"], 1.0, MEAT_REF["tai"], "Thái sống, không hao hụt"),
    ("Nạm bò (chín)", PORTION["chin_g"], 0.68, MEAT_REF["chin"], "40g chín ÷ 0.68 = 58.8g thô"),
    ("Bắp bò", PORTION["bap_g"], 0.68, MEAT_REF["bap"], "GIÁ THAM KHẢO — thay bằng giá nhập thực tế"),
    ("Gân bò", PORTION["gan_g"], 0.68, MEAT_REF["gan"], "Hầm mềm; GIÁ THAM KHẢO"),
    ("Đuôi bò", PORTION["duoi_bo_g"], 0.68, MEAT_REF["duoi"], "Hầm mềm; GIÁ THAM KHẢO"),
]
meat_first = r
meat_cost_rows = {}
for name, gram, yield_, price, note_ in meats:
    ws2.cell(row=r, column=1, value=name).alignment = LEFT
    b = ws2.cell(row=r, column=2, value=gram)
    style_cell(b, fill=INPUT_FILL, num_fmt=INT, align=RIGHT)
    c = ws2.cell(row=r, column=3, value=yield_)
    style_cell(c, fill=INPUT_FILL, num_fmt=NUMBER, align=RIGHT)
    d = ws2.cell(row=r, column=4, value=f"=B{r}/C{r}")
    style_cell(d, fill=CALC_FILL, num_fmt=NUMBER, align=RIGHT)
    e = ws2.cell(row=r, column=5, value=price)
    style_cell(e, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
    f = ws2.cell(row=r, column=6, value=f"=D{r}/1000*E{r}")
    style_cell(f, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
    ws2.cell(row=r, column=7, value=note_).alignment = WRAP
    key = name.split(" ")[0].lower()
    meat_cost_rows[key] = r
    r += 1
r += 1

# --- Block E: tổng hợp 1 tô ---
subhead(ws2, r, "TỔNG HỢP 1 TÔ MẪU — PHỞ BÒ TÁI CHÍN (60g tái + 40g chín)", 7); r += 1
header(ws2, r, ["Hạng mục", "Định lượng", "Đơn vị", "Đơn giá (đ/đv)", "Thành tiền (đ)", "Giá vốn (đ/tô)", "Ghi chú"]); r += 1

bowl_first = r
# Bánh phở
ws2.cell(row=r, column=1, value="Bánh phở").alignment = LEFT
b = ws2.cell(row=r, column=2, value=200); style_cell(b, fill=INPUT_FILL, num_fmt=INT, align=RIGHT)
ws2.cell(row=r, column=3, value="g").alignment = CENTER
d = ws2.cell(row=r, column=4, value=16000); style_cell(d, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
f = ws2.cell(row=r, column=6, value=f"=B{r}/1000*D{r}"); style_cell(f, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="200 g/tô").alignment = LEFT
banh_row = r
r += 1
# Thịt tái (kéo từ Block D)
ws2.cell(row=r, column=1, value="Thịt bò tái (60g)").alignment = LEFT
f = ws2.cell(row=r, column=6, value=f"=F{meat_cost_rows['thịt']}"); style_cell(f, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= Block Định lượng thịt (tái)").alignment = LEFT
tai_bowl_row = r
r += 1
# Nạm chín (kéo từ Block D)
ws2.cell(row=r, column=1, value="Nạm bò chín (40g)").alignment = LEFT
f = ws2.cell(row=r, column=6, value=f"=F{meat_cost_rows['nạm']}"); style_cell(f, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= Block Định lượng thịt (nạm chín)").alignment = LEFT
nam_bowl_row = r
r += 1
# Nước dùng + gia vị (kéo từ Block B tổng/tô)
ws2.cell(row=r, column=1, value="Nước dùng + gia vị (xương, cốt ngọt, đồ thơm, nước nèo, điện, dầu)").alignment = LEFT
f = ws2.cell(row=r, column=6, value=f"=F{broth_total_row}"); style_cell(f, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= Tổng nước dùng ÷ 140 tô").alignment = LEFT
nuoc_bowl_row = r
r += 1
# Rau thơm
ws2.cell(row=r, column=1, value="Hành lá, rau thơm, giá đỗ").alignment = LEFT
f = ws2.cell(row=r, column=6, value=1200); style_cell(f, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="trọn gói/tô").alignment = LEFT
rau_bowl_row = r
r += 1
# Gia vị kèm
ws2.cell(row=r, column=1, value="Chanh, ớt, tương, thìa đũa").alignment = LEFT
f = ws2.cell(row=r, column=6, value=800); style_cell(f, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="trọn gói/tô").alignment = LEFT
giavi_bowl_row = r
r += 1
bowl_last = r - 1

# Tổng giá vốn 1 tô
total_bowl_row = r
ws2.cell(row=r, column=1, value="TỔNG GIÁ VỐN 1 TÔ").font = BOLD
f = ws2.cell(row=r, column=6, value=f"=SUM(F{banh_row}:F{bowl_last})")
style_cell(f, fill=TOTAL_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= bánh + thịt + nước dùng + rau + gia vị").alignment = WRAP
r += 1

# Food cost %
foodcost_row = r
ws2.cell(row=r, column=1, value="% FOOD COST (giá vốn ÷ giá bán)").font = BOLD
f = ws2.cell(row=r, column=6, value=f"=F{total_bowl_row}/D{pb.row}")
style_cell(f, fill=CALC_FILL, font=BOLD, num_fmt=PERCENT, align=RIGHT)
ws2.cell(row=r, column=7, value="Cảnh báo ĐỎ nếu > trần 45%").alignment = LEFT
# cảnh báo điều kiện: > 45% → đỏ
ws2.conditional_formatting.add(
    f"F{foodcost_row}",
    CellIsRule(operator="greaterThan", formula=["0.45"], fill=WARN_FILL, font=WARN_FONT),
)
r += 1

# Cảnh báo chữ
warn_row = r
ws2.cell(row=r, column=1, value="Trạng thái food cost").alignment = LEFT
f = ws2.cell(row=r, column=6, value=f'=IF(F{foodcost_row}>$D${cel.row},"⚠ VƯỢT TRẦN — GIẢM ĐỊNH LƯỢNG HOẶC TĂNG GIÁ","OK — trong ngưỡng")')
style_cell(f, fill=CALC_FILL, font=BOLD, align=LEFT)
ws2.merge_cells(start_row=r, start_column=6, end_row=r, end_column=7)
r += 1

# Giá bán đề xuất đạt 42%
gia42_row = r
ws2.cell(row=r, column=1, value="Giá bán đề xuất đạt chuẩn Food Cost 42%").font = BOLD
f = ws2.cell(row=r, column=6, value=f"=F{total_bowl_row}/0.42")
style_cell(f, fill=CALC_FILL, font=BOLD, num_fmt=CURRENCY, align=RIGHT)
ws2.cell(row=r, column=7, value="= tổng giá vốn ÷ 0.42").alignment = LEFT
r += 2

note(ws2, r, "Ghi chú (v1.1.2): 'Đồ thơm lớp 3 (chưng dầu)' = 1,0 L dầu hương vị múc từ mẻ 5L (chủ quán xác nhận). "
            "Các hương liệu chưng (gừng, hành, quế, thảo quả) đã nằm trong giá vốn mẻ dầu 5L, nên bảng mẻ nước dùng 100L KHÔNG itemize lại chúng.", 7); r += 1
note(ws2, r, "Mọi giá là GIÁ THAM KHẢO (nhập sỉ thị trường VN); thay bằng giá nhập thực tế từng tuần.", 7)

ws2.freeze_panes = "A4"

# =============================================================================
# SHEET 3 — DONG-TIEN-13-TUAN-HOA-VON
# =============================================================================
ws3 = wb.create_sheet("Dong-Tien-13-Tuan-Hoa-Von")
set_widths(ws3, [30, 16, 16, 16, 16, 16, 16, 16, 16])

r = 1
title(ws3, r, "ĐIỂM HÒA VỐN THEO KÊNH + DÒNG TIỀN 13 TUẦN", 9); r += 1
note(ws3, r, "Công thức hòa vốn theo lãi đóng góp (ĐC-02):  Hòa vốn tô/ngày = Chi phí cố định/tháng ÷ Lãi đóng góp/tô ÷ Số ngày bán/tháng. "
             "Lãi đóng góp = Giá bán − Giá vốn nguyên liệu − Biến phí kênh.", 9); r += 2

# --- Block A: đầu vào chung ---
subhead(ws3, r, "ĐẦU VÀO CHUNG (ô vàng = sửa)", 9); r += 1
def input_row(ws3, r, label, value, fmt=CURRENCY, unit=""):
    ws3.cell(row=r, column=1, value=label).alignment = LEFT
    v = ws3.cell(row=r, column=2, value=value)
    style_cell(v, fill=INPUT_FILL, num_fmt=fmt, align=RIGHT)
    if unit:
        ws3.cell(row=r, column=3, value=unit).alignment = LEFT
    return r + 1

r = input_row(ws3, r, "Giá bán bình quân 1 tô", 45000, CURRENCY, "₫")
gia_ban_row = r - 1
r = input_row(ws3, r, "Giá vốn nguyên liệu 1 tô (mục tiêu 40%)", 18000, CURRENCY, "₫")
gia_von_row = r - 1
r = input_row(ws3, r, "Chi phí cố định / tháng", 21500000, CURRENCY, "₫")
cpcd_row = r - 1
r = input_row(ws3, r, "Số ngày bán / tháng", 30, INT, "ngày")
songay_row = r - 1
ws3.cell(row=r, column=1, value="Quỹ tiền mặt đầu kỳ (khoản 6)").alignment = LEFT
quy3 = ws3.cell(row=r, column=2, value=65000000); style_cell(quy3, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
ws3.cell(row=r, column=3, value="₫").alignment = LEFT
quy3_row = r
r += 2

# --- Block B: hòa vốn theo kênh ---
subhead(ws3, r, "ĐIỂM HÒA VỐN THEO KÊNH", 9); r += 1
header(ws3, r, ["Kênh", "Biến phí kênh/tô", "Lãi đóng góp/tô", "Hòa vốn (tô/ngày)", "Hòa vốn (tô/tháng)", "", "", "", ""]); r += 1

# Kênh tại quán
ws3.cell(row=r, column=1, value="Tại quán (ăn tại chỗ)").alignment = LEFT
b = ws3.cell(row=r, column=2, value=0); style_cell(b, fill=INPUT_FILL, num_fmt=CURRENCY, align=RIGHT)
c = ws3.cell(row=r, column=3, value=f"=B{gia_ban_row}-B{gia_von_row}-B{r}"); style_cell(c, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
d = ws3.cell(row=r, column=4, value=f"=B{cpcd_row}/C{r}/B{songay_row}"); style_cell(d, fill=CALC_FILL, num_fmt='#,##0.0', align=RIGHT)
e = ws3.cell(row=r, column=5, value=f"=B{cpcd_row}/C{r}"); style_cell(e, fill=CALC_FILL, num_fmt=INT, align=RIGHT)
ws3.cell(row=r, column=6, value="Biến phí ~0 (ăn tại chỗ)").alignment = LEFT
atquan_row = r
r += 1

# Kênh app
ws3.cell(row=r, column=1, value="App giao đồ ăn").alignment = LEFT
b = ws3.cell(row=r, column=2, value=f"=0.2*B{gia_ban_row}+2000"); style_cell(b, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
c = ws3.cell(row=r, column=3, value=f"=B{gia_ban_row}-B{gia_von_row}-B{r}"); style_cell(c, fill=CALC_FILL, num_fmt=CURRENCY, align=RIGHT)
d = ws3.cell(row=r, column=4, value=f"=B{cpcd_row}/C{r}/B{songay_row}"); style_cell(d, fill=CALC_FILL, num_fmt='#,##0.0', align=RIGHT)
e = ws3.cell(row=r, column=5, value=f"=B{cpcd_row}/C{r}"); style_cell(e, fill=CALC_FILL, num_fmt=INT, align=RIGHT)
ws3.cell(row=r, column=6, value="Phí sàn 20% + bao bì 2.000đ").alignment = LEFT
app_row = r
r += 2

note(ws3, r, "Biến phí kênh App = 20% × giá bán + 2.000đ bao bì (chỉnh hệ số 0.2 và 2000 trong ô công thức B-app nếu phí sàn khác).", 9); r += 1
note(ws3, r, "Điểm hòa vốn tô/ngày = CP cố định ÷ lãi đóng góp ÷ số ngày bán. Số ngày bán càng ít → phải bán càng nhiều tô/ngày để bù CP cố định.", 9); r += 2

# --- Block C: dòng tiền 13 tuần ---
subhead(ws3, r, "DÒNG TIỀN 13 TUẦN (kịch bản CƠ SỞ — ramp 40→100 tô/ngày)", 9); r += 1
header(ws3, r, ["Tuần", "Số tô/tuần", "Doanh thu", "Biến phí", "Lãi đóng góp", "CP cố định/tuần", "Dòng tiền thuần", "Số dư tiền mặt cuối tuần", "Lỗ/Lãi lũy kế"]); r += 1

# ramp: T1-2 40, T3-4 60, T5-6 80, T7-13 100
ramp = [40, 40, 60, 60, 80, 80, 100, 100, 100, 100, 100, 100, 100]
cash_first = r
for week in range(1, 14):
    to_ngay = ramp[week - 1]
    to_tuan = to_ngay * 7  # 7 ngày/tuần
    ws3.cell(row=r, column=1, value=week).alignment = CENTER
    t = ws3.cell(row=r, column=2, value=to_tuan); style_cell(t, fill=INPUT_FILL, num_fmt=INT, align=RIGHT)
    ws3.cell(row=r, column=3, value=f"=B{r}*B{gia_ban_row}").number_format = CURRENCY
    ws3.cell(row=r, column=4, value=f"=B{r}*(B{gia_von_row}+B{atquan_row})").number_format = CURRENCY
    ws3.cell(row=r, column=5, value=f"=C{r}-D{r}").number_format = CURRENCY
    ws3.cell(row=r, column=6, value=f"=B{cpcd_row}*12/52").number_format = CURRENCY
    ws3.cell(row=r, column=7, value=f"=E{r}-F{r}").number_format = CURRENCY
    if week == 1:
        ws3.cell(row=r, column=8, value=f"=B{quy3_row}+G{r}").number_format = CURRENCY
    else:
        ws3.cell(row=r, column=8, value=f"=H{r-1}+G{r}").number_format = CURRENCY
    if week == 1:
        ws3.cell(row=r, column=9, value=f"=G{r}").number_format = CURRENCY
    else:
        ws3.cell(row=r, column=9, value=f"=I{r-1}+G{r}").number_format = CURRENCY
    for col in range(1, 10):
        ws3.cell(row=r, column=col).border = BORDER
    r += 1
cash_last = r - 1

r += 1
note(ws3, r, "Số dư tiền mặt bắt đầu từ quỹ khoản 6 (65 triệu) rồi cộng dồn dòng tiền thuần; Lỗ/Lãi lũy kế bắt đầu từ 0.", 9); r += 1
note(ws3, r, "Tuần đầu 'Lỗ/Lãi lũy kế ≥ 0' là tuần tự nuôi được dòng tiền. Số dư tiền mặt phải luôn ≥ 0 suốt 13 tuần mới an toàn.", 9); r += 1
note(ws3, r, "Kịch bản THẬN TRỌNG: hạ ramp (bắt đầu ~25–30 tô/ngày) để thấy rõ số tuần âm dòng tiền. Số liệu ca mẫu theo investment-decision-300m.md.", 9)

ws3.freeze_panes = "A4"

# ---------- Lưu ----------
os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
print("Đã xuất:", OUT)
