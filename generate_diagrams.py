"""
generate_diagrams.py
Generates crisp, high-resolution UML diagrams and interface mockups
for the Book Bank Management System academic lab report.
"""

import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = "report_assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

# Load fonts
try:
    font_bold_lg = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
    font_bold_md = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
    font_bold_sm = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16)
    font_regular_md = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)
    font_regular_sm = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
    font_regular_xs = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
except Exception:
    font_bold_lg = ImageFont.load_default()
    font_bold_md = ImageFont.load_default()
    font_bold_sm = ImageFont.load_default()
    font_regular_md = ImageFont.load_default()
    font_regular_sm = ImageFont.load_default()
    font_regular_xs = ImageFont.load_default()

def draw_arrow(draw, start, end, fill="black", width=2, arrow_size=8):
    draw.line([start, end], fill=fill, width=width)
    x1, y1 = start
    x2, y2 = end
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    x_tip1 = x2 - arrow_size * math.cos(angle - math.pi / 6)
    y_tip1 = y2 - arrow_size * math.sin(angle - math.pi / 6)
    x_tip2 = x2 - arrow_size * math.cos(angle + math.pi / 6)
    y_tip2 = y2 - arrow_size * math.sin(angle + math.pi / 6)
    draw.polygon([(x2, y2), (x_tip1, y_tip1), (x_tip2, y_tip2)], fill=fill)

def generate_hld():
    """Figure 2.1: High-Level Architecture"""
    img = Image.new("RGB", (1200, 360), "white")
    draw = ImageDraw.Draw(img)

    # Boxes
    boxes = [
        ((40, 100, 240, 200), ["Students /", "Campus Librarians"]),
        ((320, 100, 520, 200), ["React 19 SPA", "(Client UI)"]),
        ((600, 100, 840, 200), ["Application Services", "(FastAPI + Django Core)"]),
        ((920, 100, 1140, 200), ["Relational DB", "(SQLite / Postgres)"]),
        ((600, 250, 840, 330), ["Google Books API /", "OpenLibrary Covers"])
    ]

    for (x1, y1, x2, y2), lines in boxes:
        draw.rectangle([x1, y1, x2, y2], outline="black", width=2, fill="#FAFAFA")
        total_h = len(lines) * 22
        start_y = y1 + (y2 - y1 - total_h) // 2
        for i, line in enumerate(lines):
            bbox = font_regular_md.getbbox(line)
            w = bbox[2] - bbox[0]
            draw.text((x1 + (x2 - x1 - w) // 2, start_y + i * 22), line, fill="black", font=font_bold_sm if i == 0 else font_regular_sm)

    # Arrows
    draw_arrow(draw, (240, 150), (320, 150), width=2)
    draw_arrow(draw, (520, 150), (600, 150), width=2)
    draw_arrow(draw, (840, 150), (920, 150), width=2)
    draw_arrow(draw, (720, 250), (720, 200), width=2)

    img.save(f"{ASSETS_DIR}/fig_2_1_hld.png", dpi=(300, 300))
    print("Generated fig_2_1_hld.png")

def generate_use_case():
    """Figure 5.1: Use Case Diagram"""
    img = Image.new("RGB", (1300, 680), "white")
    draw = ImageDraw.Draw(img)

    # System Boundary Box
    draw.rectangle([280, 40, 1000, 640], outline="black", width=2, fill="#FFFFFF")
    draw.text((490, 55), "BOOK BANK MANAGEMENT SYSTEM", fill="black", font=font_bold_md)

    # Actors
    # Student (left)
    draw.rectangle([40, 300, 180, 370], outline="black", width=2, fill="#F0F4F8")
    draw.text((80, 325), "Student", fill="black", font=font_bold_md)

    # Librarian (right)
    draw.rectangle([1100, 300, 1260, 370], outline="black", width=2, fill="#F0F4F8")
    draw.text((1125, 325), "Librarian", fill="black", font=font_bold_md)

    # Use Cases (ellipses)
    use_cases = [
        ("Login & Authentication", 110, True, True),
        ("Browse & Search Catalog", 175, True, True),
        ("Reserve Title / Join Waitlist", 240, True, False),
        ("View My Loans & Renew Book", 305, True, False),
        ("Issue Book (Checkout)", 370, False, True),
        ("Return Book & Assess Fine", 435, False, True),
        ("Manage Catalog & Accessions", 500, False, True),
        ("Export Reports & Analytics", 565, False, True)
    ]

    for text, cy, conn_student, conn_lib in use_cases:
        x1, y1, x2, y2 = 460, cy - 25, 820, cy + 25
        draw.ellipse([x1, y1, x2, y2], outline="black", width=2, fill="#FAF7F0")
        bbox = font_regular_md.getbbox(text)
        w = bbox[2] - bbox[0]
        draw.text((x1 + (x2 - x1 - w) // 2, cy - 9), text, fill="black", font=font_regular_sm)

        # Lines to actors
        if conn_student:
            draw.line([(180, 335), (x1, cy)], fill="black", width=1)
        if conn_lib:
            draw.line([(1100, 335), (x2, cy)], fill="black", width=1)

    img.save(f"{ASSETS_DIR}/fig_5_1_use_case.png", dpi=(300, 300))
    print("Generated fig_5_1_use_case.png")

def generate_activity():
    """Figure 5.2: Activity Diagram"""
    img = Image.new("RGB", (1000, 660), "white")
    draw = ImageDraw.Draw(img)

    steps = [
        "Start",
        "Student / Librarian selects title from catalog",
        "Verify borrowing eligibility (Loan limit < 5, Unpaid fines = 0)",
        "Check physical copy availability in ledger",
        "Update circulation ledger (Create Issue / Hold) & audit log",
        "Generate digital due-date slip & confirmation",
        "End"
    ]

    y_pos = 30
    prev_center = None

    for i, step in enumerate(steps):
        if step in ["Start", "End"]:
            w, h = 140, 44
            x1 = (1000 - w) // 2
            y1 = y_pos
            x2 = x1 + w
            y2 = y1 + h
            draw.rounded_rectangle([x1, y1, x2, y2], radius=15, outline="black", width=2, fill="#EAEAEA")
            bbox = font_bold_sm.getbbox(step)
            tw = bbox[2] - bbox[0]
            draw.text((x1 + (w - tw) // 2, y1 + 13), step, fill="black", font=font_bold_sm)
            curr_center = (500, y1)
            next_start = (500, y2)
        else:
            w, h = 580, 50
            x1 = (1000 - w) // 2
            y1 = y_pos
            x2 = x1 + w
            y2 = y1 + h
            draw.rectangle([x1, y1, x2, y2], outline="black", width=2, fill="#FFFFFF")
            bbox = font_regular_sm.getbbox(step)
            tw = bbox[2] - bbox[0]
            draw.text((x1 + (w - tw) // 2, y1 + 16), step, fill="black", font=font_regular_sm)
            curr_center = (500, y1)
            next_start = (500, y2)

        if prev_center:
            draw_arrow(draw, prev_center, curr_center, width=2)

        prev_center = next_start
        y_pos += 95

    img.save(f"{ASSETS_DIR}/fig_5_2_activity.png", dpi=(300, 300))
    print("Generated fig_5_2_activity.png")

def generate_class():
    """Figure 5.3: Class Diagram"""
    img = Image.new("RGB", (1200, 650), "white")
    draw = ImageDraw.Draw(img)

    classes = [
        # (x, y, w, h, name, attrs, methods)
        (50, 40, 320, 240, "Book", 
         ["- bookId: String", "- isbn: String", "- title: String", "- author: String", "- totalCopies: int", "- availableCopies: int"],
         ["+ addCopy()", "+ updateMetadata()", "+ isAvailable(): bool"]),
        
        (440, 40, 320, 240, "Issue (Loan)",
         ["- issueId: String", "- studentId: String", "- accessionNo: String", "- issueDate: Date", "- dueDate: Date", "- renewalCount: int"],
         ["+ renewLoan()", "+ calculateOverdue()", "+ markReturned()"]),

        (830, 40, 320, 240, "User",
         ["- userId: String", "- username: String", "- role: RoleEnum", "- email: String", "- isActive: bool"],
         ["+ login()", "+ logout()", "+ authorize()"]),

        (50, 360, 320, 240, "Student",
         ["- studentId: String", "- rollNumber: String", "- department: String", "- activeLoans: int", "- fineBalance: Decimal"],
         ["+ canBorrow(): bool", "+ getActiveIssues()", "+ settleFine()"]),

        (440, 360, 320, 240, "Reservation",
         ["- reservationId: String", "- studentId: String", "- bookId: String", "- queuePos: int", "- expiryDate: Date"],
         ["+ advanceQueue()", "+ fulfillHold()", "+ cancelHold()"]),

        (830, 360, 320, 240, "Fine",
         ["- fineId: String", "- issueId: String", "- daysLate: int", "- ratePerDay: Decimal", "- amount: Decimal", "- isPaid: bool"],
         ["+ calculateFine()", "+ recordPayment()", "+ waiveFine()"])
    ]

    for x, y, w, h, name, attrs, methods in classes:
        draw.rectangle([x, y, x + w, y + h], outline="black", width=2, fill="#FFFFFF")
        # Header
        draw.rectangle([x, y, x + w, y + 36], outline="black", width=2, fill="#F2F4F7")
        bbox = font_bold_sm.getbbox(name)
        tw = bbox[2] - bbox[0]
        draw.text((x + (w - tw) // 2, y + 8), name, fill="black", font=font_bold_sm)

        # Attrs
        ay = y + 44
        for attr in attrs:
            draw.text((x + 10, ay), attr, fill="black", font=font_regular_xs)
            ay += 18

        draw.line([(x, y + 160), (x + w, y + 160)], fill="black", width=1)
        # Methods
        my = y + 168
        for m in methods:
            draw.text((x + 10, my), m, fill="black", font=font_regular_xs)
            my += 18

    # Connecting arrows
    draw_arrow(draw, (370, 160), (440, 160), width=2)
    draw_arrow(draw, (760, 160), (830, 160), width=2)
    draw_arrow(draw, (210, 360), (210, 280), width=2)
    draw_arrow(draw, (600, 360), (600, 280), width=2)
    draw_arrow(draw, (990, 360), (990, 280), width=2)

    img.save(f"{ASSETS_DIR}/fig_5_3_class.png", dpi=(300, 300))
    print("Generated fig_5_3_class.png")

def generate_sequence():
    """Figure 5.4: Sequence Diagram"""
    img = Image.new("RGB", (1200, 540), "white")
    draw = ImageDraw.Draw(img)

    lifelines = [
        (150, "Student / Staff"),
        (450, "Web UI"),
        (750, "Circulation Service"),
        (1050, "Database")
    ]

    # Draw lifeline headers & vertical lines
    for x, name in lifelines:
        draw.rectangle([x - 90, 30, x + 90, 75], outline="black", width=2, fill="#F4EFE6")
        bbox = font_bold_sm.getbbox(name)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, 45), name, fill="black", font=font_bold_sm)
        # dashed/dotted line
        for y in range(85, 500, 12):
            draw.line([(x, y), (x, y + 6)], fill="#888888", width=2)

    # Messages
    msgs = [
        (150, 450, 120, "1. Submit checkout request (studentId, accessionNo)"),
        (450, 750, 175, "2. Validate borrowing invariants (loans < 5, fine == 0)"),
        (750, 1050, 230, "3. Query copy balance & lock accession record"),
        (1050, 750, 285, "4. Return copy status (AVAILABLE)"),
        (750, 1050, 340, "5. Commit Issue record & decrement copy count"),
        (750, 450, 395, "6. Return loan confirmation (Due: +14 days)"),
        (450, 150, 450, "7. Display digital due-date slip to user")
    ]

    for x1, x2, y, text in msgs:
        draw_arrow(draw, (x1, y), (x2, y), width=2)
        mid_x = (x1 + x2) // 2
        bbox = font_regular_xs.getbbox(text)
        tw = bbox[2] - bbox[0]
        draw.text((mid_x - tw // 2, y - 18), text, fill="black", font=font_regular_xs)

    img.save(f"{ASSETS_DIR}/fig_5_4_sequence.png", dpi=(300, 300))
    print("Generated fig_5_4_sequence.png")

def generate_component():
    """Figure 5.5: Component / Architecture Diagram"""
    img = Image.new("RGB", (1200, 320), "white")
    draw = ImageDraw.Draw(img)

    comps = [
        (60, 90, 280, 190, ["Client Web Application", "(React 19 SPA)"]),
        (380, 90, 600, 190, ["API Gateway & Search", "(FastAPI Microservice)"]),
        (700, 90, 920, 190, ["Circulation & Core Services", "(Django REST Framework)"]),
        (1010, 90, 1150, 190, ["Relational DB", "(PostgreSQL / SQLite)"])
    ]

    for x1, y1, x2, y2, lines in comps:
        draw.rectangle([x1, y1, x2, y2], outline="black", width=2, fill="#FAFAFA")
        total_h = len(lines) * 22
        start_y = y1 + (y2 - y1 - total_h) // 2
        for i, line in enumerate(lines):
            bbox = font_regular_sm.getbbox(line)
            w = bbox[2] - bbox[0]
            draw.text((x1 + (x2 - x1 - w) // 2, start_y + i * 22), line, fill="black", font=font_bold_sm if i == 0 else font_regular_xs)

    # Arrows
    draw_arrow(draw, (280, 140), (380, 140), width=2)
    draw_arrow(draw, (600, 140), (700, 140), width=2)
    draw_arrow(draw, (920, 140), (1010, 140), width=2)

    img.save(f"{ASSETS_DIR}/fig_5_5_component.png", dpi=(300, 300))
    print("Generated fig_5_5_component.png")

def generate_screenshots():
    """Figure 6.1: Illustrative Admin Panel & Student Portal Mockups"""
    # Create combined image matching 1672 x 941
    width, height = 1600, 920
    img = Image.new("RGB", (width, height), "#0F172A")
    draw = ImageDraw.Draw(img)

    # Upper Panel: Admin / Librarian Dashboard (y: 10 to 450)
    # Background
    draw.rectangle([20, 20, 1580, 450], fill="#1E293B", outline="#334155", width=2)
    
    # Top navbar
    draw.rectangle([20, 20, 1580, 70], fill="#0F172A")
    draw.text((40, 32), "BOOK BANK MANAGEMENT SYSTEM — LIBRARIAN CONTROL CENTER", fill="#38BDF8", font=font_bold_sm)
    draw.text((1380, 34), "Admin: librarian@bookbank.edu", fill="#94A3B8", font=font_regular_sm)

    # Metric Tiles
    tiles = [
        ("TOTAL BOOKS", "156", "#10B981"),
        ("ACTIVE LOANS", "42", "#3B82F6"),
        ("OVERDUE ITEMS", "7", "#EF4444"),
        ("ACTIVE HOLDS", "12", "#8B5CF6"),
        ("OUTSTANDING FINES", "Rs. 240", "#F59E0B")
    ]
    tile_w = 280
    for i, (title, val, color) in enumerate(tiles):
        tx1 = 45 + i * 305
        ty1 = 90
        tx2 = tx1 + tile_w
        ty2 = 175
        draw.rectangle([tx1, ty1, tx2, ty2], fill="#0F172A", outline="#334155", width=1)
        draw.text((tx1 + 15, ty1 + 12), title, fill="#94A3B8", font=font_regular_xs)
        draw.text((tx1 + 15, ty1 + 35), val, fill=color, font=font_bold_lg)

    # Admin Tables: Recent Checkouts (left) & Overdue Alerts (right)
    # Left table
    draw.rectangle([45, 195, 800, 435], fill="#0F172A", outline="#334155", width=1)
    draw.text((60, 205), "Recent Circulation Checkouts", fill="#F8FAFC", font=font_bold_sm)
    checkouts = [
        ("ISS-1042", "BB-0042", "Clean Code (Robert Martin)", "AU/2024/0002521", "14 Days Left"),
        ("ISS-1043", "BB-0108", "Introduction to Algorithms", "AU/2024/0001852", "12 Days Left"),
        ("ISS-1044", "BB-0021", "Operating System Concepts", "AU/2024/0003411", "9 Days Left"),
        ("ISS-1045", "BB-0077", "Database System Concepts", "AU/2024/0004102", "14 Days Left")
    ]
    for idx, (iss, acc, title, stu, due) in enumerate(checkouts):
        row_y = 245 + idx * 42
        draw.line([(55, row_y - 5), (790, row_y - 5)], fill="#1E293B", width=1)
        draw.text((60, row_y), iss, fill="#38BDF8", font=font_regular_xs)
        draw.text((150, row_y), acc, fill="#CBD5E1", font=font_regular_xs)
        draw.text((250, row_y), title, fill="#FFFFFF", font=font_regular_xs)
        draw.text((540, row_y), stu, fill="#94A3B8", font=font_regular_xs)
        draw.text((690, row_y), due, fill="#10B981", font=font_bold_sm)

    # Right table
    draw.rectangle([825, 195, 1555, 435], fill="#0F172A", outline="#334155", width=1)
    draw.text((840, 205), "Overdue & Hold Triage Board", fill="#F8FAFC", font=font_bold_sm)
    alerts = [
        ("BB-0015", "Computer Networks", "Soyuz Paul", "3 Days Overdue", "Fine: Rs. 6.00"),
        ("BB-0089", "Artificial Intelligence: A Modern Approach", "Rahul Sen", "5 Days Overdue", "Fine: Rs. 10.00"),
        ("BB-0112", "Compilers: Principles & Techniques", "Priya Das", "Hold Expiry: 1 Day", "Queue #1"),
        ("BB-0034", "Design Patterns (GoF)", "Aniket Roy", "Hold Expiry: Today", "Ready for Pickup")
    ]
    for idx, (acc, title, name, status, fine) in enumerate(alerts):
        row_y = 245 + idx * 42
        draw.line([(835, row_y - 5), (1545, row_y - 5)], fill="#1E293B", width=1)
        draw.text((840, row_y), acc, fill="#F59E0B", font=font_regular_xs)
        draw.text((930, row_y), title[:30] + "...", fill="#FFFFFF", font=font_regular_xs)
        draw.text((1200, row_y), name, fill="#94A3B8", font=font_regular_xs)
        color = "#EF4444" if "Overdue" in status else "#8B5CF6"
        draw.text((1350, row_y), status, fill=color, font=font_bold_sm)


    # Lower Panel: Student Portal (y: 470 to 900)
    draw.rectangle([20, 470, 1580, 900], fill="#0F172A", outline="#334155", width=2)
    
    # Top navbar
    draw.rectangle([20, 470, 1580, 520], fill="#1E293B")
    draw.text((40, 482), "BOOK BANK STUDENT PORTAL — CATALOGUE & MY BORROWED BOOKS", fill="#10B981", font=font_bold_sm)
    draw.text((1360, 484), "Student ID: UG/SOET/30/24/554", fill="#94A3B8", font=font_regular_sm)

    # Search Bar & Filter Chips
    draw.rectangle([45, 535, 700, 575], fill="#1E293B", outline="#475569", width=1)
    draw.text((60, 545), "Search by Title, Author, Accession No., or ISBN (e.g. Algorithms)...", fill="#64748B", font=font_regular_sm)

    filters = ["All Categories", "Computer Science", "Mathematics", "Engineering", "Algorithms", "Available Now"]
    fx = 720
    for f in filters:
        draw.rectangle([fx, 535, fx + 125, 575], fill="#334155" if f == "Available Now" else "#1E293B", outline="#475569", width=1)
        draw.text((fx + 12, 547), f, fill="#38BDF8" if f == "Available Now" else "#E2E8F0", font=font_regular_xs)
        fx += 135

    # Catalog Cards (lower left) & My Loans (lower right)
    draw.rectangle([45, 595, 880, 885], fill="#1E293B", outline="#334155", width=1)
    draw.text((60, 608), "Available Library Catalog Titles", fill="#F8FAFC", font=font_bold_sm)
    
    books = [
        ("Clean Code: Agile Software Craftsmanship", "Robert C. Martin", "Available: 3 Copies", "#10B981", "Reserve Title"),
        ("Introduction to Algorithms (CLRS 4th Ed.)", "Thomas H. Cormen", "Available: 1 Copy", "#10B981", "Reserve Title"),
        ("Design Patterns: Elements of Reusable OO", "Erich Gamma et al.", "All Loaned Out (0 Avail)", "#EF4444", "Join Waitlist"),
        ("Operating System Concepts (10th Ed.)", "Silberschatz & Galvin", "Available: 2 Copies", "#10B981", "Reserve Title"),
    ]
    for idx, (title, author, avail, col, action) in enumerate(books):
        by = 645 + idx * 58
        draw.line([(55, by - 6), (870, by - 6)], fill="#0F172A", width=1)
        draw.text((60, by), title, fill="#FFFFFF", font=font_bold_sm)
        draw.text((60, by + 22), author, fill="#94A3B8", font=font_regular_xs)
        draw.text((540, by + 10), avail, fill=col, font=font_bold_sm)
        # Action button
        btn_bg = "#3B82F6" if "Reserve" in action else "#8B5CF6"
        draw.rectangle([730, by + 4, 860, by + 36], fill=btn_bg)
        draw.text((742, by + 12), action, fill="#FFFFFF", font=font_regular_xs)

    # Student's Active Loans & Due Dates (lower right)
    draw.rectangle([905, 595, 1555, 885], fill="#1E293B", outline="#334155", width=1)
    draw.text((920, 608), "My Active Loans & Renewals", fill="#F8FAFC", font=font_bold_sm)

    loans = [
        ("BB-0042", "Clean Code", "Issued: 10-Nov-2026", "Due: 24-Nov-2026", "14 Days Remaining", "Renew (+14d)"),
        ("BB-0015", "Computer Networks", "Issued: 25-Oct-2026", "Due: 08-Nov-2026", "3 Days Overdue (Rs. 6)", "Blocked: Overdue")
    ]
    for idx, (acc, title, iss, due, status, action) in enumerate(loans):
        ly = 655 + idx * 95
        draw.line([(915, ly - 8), (1545, ly - 8)], fill="#0F172A", width=1)
        draw.text((920, ly), f"{acc} — {title}", fill="#FFFFFF", font=font_bold_sm)
        draw.text((920, ly + 25), f"{iss} | {due}", fill="#94A3B8", font=font_regular_xs)
        col = "#10B981" if "Remaining" in status else "#EF4444"
        draw.text((920, ly + 50), status, fill=col, font=font_bold_sm)
        # Action button
        btn_bg = "#10B981" if "Renew" in action else "#475569"
        draw.rectangle([1380, ly + 15, 1530, ly + 55], fill=btn_bg)
        draw.text((1395, ly + 26), action, fill="#FFFFFF", font=font_regular_xs)

    img.save(f"{ASSETS_DIR}/fig_6_1_screenshots.png", dpi=(300, 300))
    print("Generated fig_6_1_screenshots.png")

if __name__ == "__main__":
    generate_hld()
    generate_use_case()
    generate_activity()
    generate_class()
    generate_sequence()
    generate_component()
    generate_screenshots()
    print("All diagrams and screenshots generated successfully!")
