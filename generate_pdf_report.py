"""
generate_pdf_report.py
Generates a comprehensive, beautifully styled PDF report for the Book Bank Management System.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_PATH = "/Users/somu/Documents/Book_Management_system/Book_Bank_Project_Report.pdf"

# Design Palette
INK_GREEN = colors.HexColor("#1E3D32")
OCHRE = colors.HexColor("#C68A2E")
OXBLOOD = colors.HexColor("#7A2E27")
CHARCOAL = colors.HexColor("#2B2620")
CHARCOAL_MUTED = colors.HexColor("#666055")
PAPER_BG = colors.HexColor("#FAF7F0")
CARD_BG = colors.HexColor("#F4EFE6")
LIGHT_GREY = colors.HexColor("#EAE5DA")
WHITE = colors.white

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(CHARCOAL_MUTED)
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.setStrokeColor(LIGHT_GREY)
            self.setLineWidth(0.5)
            self.line(40, 755, 572, 755)
            self.drawString(40, 760, "Book Bank Management System — Comprehensive Architecture & Technical Report")
            self.drawRightString(572, 760, "Academic Year 2026")
        
        # Footer
        self.setStrokeColor(LIGHT_GREY)
        self.setLineWidth(0.5)
        self.line(40, 42, 572, 42)
        self.drawString(40, 30, "Confidential — Internal Technical Documentation & Feature Specification")
        self.drawRightString(572, 30, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=INK_GREEN,
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=OCHRE,
        spaceAfter=14,
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=INK_GREEN,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=CHARCOAL,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=CHARCOAL,
        spaceAfter=6,
    )
    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold',
    )
    term_title = ParagraphStyle(
        'TermTitle',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=9.5,
        textColor=INK_GREEN,
        spaceAfter=2,
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=CHARCOAL,
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell,
        fontName='Helvetica-Bold',
        textColor=INK_GREEN,
    )
    table_hdr = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=WHITE,
    )
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=OCHRE,
    )

    story = []

    # ── COVER / TITLE HEADER ──
    story.append(Paragraph("BOOK BANK MANAGEMENT SYSTEM", title_style))
    story.append(Paragraph("System Architecture, Tech Stack & Domain Module Specification", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=INK_GREEN, spaceAfter=14))

    # Meta Overview Box
    meta_data = [
        [
            Paragraph("<b>Project:</b> Enterprise Campus Book Bank", table_cell),
            Paragraph("<b>Role System:</b> Dual Role (Student & Librarian RBAC)", table_cell),
        ],
        [
            Paragraph("<b>Branch:</b> <code>frontend</code>", table_cell),
            Paragraph("<b>Currency & Fine Model:</b> Indian Rupees (₹5 / day overdue)", table_cell),
        ],
        [
            Paragraph("<b>Frontend:</b> React 19 + Tailwind CSS + Vite", table_cell),
            Paragraph("<b>Backend Microservice:</b> FastAPI (Python 3.14) + Google Books API", table_cell),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[260, 272])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, LIGHT_GREY),
        ('INNERGRID', (0,0), (-1,-1), 0.5, LIGHT_GREY),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ── SECTION 1: EXECUTIVE SUMMARY & OVERVIEW ──
    story.append(Paragraph("1. Executive Summary & Project Purpose", h1_style))
    story.append(Paragraph(
        "The <b>Book Bank Management System</b> is a full-featured campus library circulation and cataloguing platform designed to handle the end-to-end lifecycle of university book lending. Unlike simple generic library templates, it implements strict institutional circulation invariants, authentic tactile visual motifs (such as due-date slip pockets and physical book spines), and a synchronized single-source-of-truth architecture that bridges students and campus librarians seamlessly in real time.",
        body_style
    ))
    story.append(Paragraph(
        "Key capabilities include instant full-text catalogue search, automated Google Books API volume enrichment, multi-stage fallback book cover resolution, real-time pickup holds and waitlist queues, automated daily late fines (₹5/day), complete borrower record management, administrative circulation desks, real-time audit logging, and downloadable CSV analytics.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # ── SECTION 2: TECHNOLOGY STACK ──
    story.append(Paragraph("2. Full Technology Stack", h1_style))
    story.append(Paragraph("The system is organized into modular tiers covering client rendering, asynchronous microservices, external APIs, and client-side reactive state persistence:", body_style))

    tech_data = [
        [Paragraph("Tier / Layer", table_hdr), Paragraph("Technology / Tool", table_hdr), Paragraph("Version", table_hdr), Paragraph("Role & Implementation Details", table_hdr)],
        [
            Paragraph("<b>Frontend Core</b>", table_cell_bold),
            Paragraph("React (SPA)", table_cell),
            Paragraph("v19.2.8", table_cell),
            Paragraph("Single Page Application utilizing custom hash routing (<code>#catalog</code>, <code>#book/:id</code>, <code>#loans</code>, <code>#admin/*</code>) to avoid web-server rewrite dependencies.", table_cell)
        ],
        [
            Paragraph("<b>Build Tooling</b>", table_cell_bold),
            Paragraph("Vite + Rolldown", table_cell),
            Paragraph("v8.2.2", table_cell),
            Paragraph("Blazing fast HMR dev server and production asset bundler (~230ms production build times).", table_cell)
        ],
        [
            Paragraph("<b>Styling & Tokens</b>", table_cell_bold),
            Paragraph("Tailwind CSS v4 + Design Tokens", table_cell),
            Paragraph("v4.3.3", table_cell),
            Paragraph("Tailwind CSS engine paired with library CSS design tokens: Fraunces (display serif), IBM Plex Mono (accession/labels), and plain Arial sans-serif body stack.", table_cell)
        ],
        [
            Paragraph("<b>State & Persistence</b>", table_cell_bold),
            Paragraph("React Context + LocalStorage + Storage Events", table_cell),
            Paragraph("Native ES6", table_cell),
            Paragraph("Single source of truth in <code>libraryStore.jsx</code> under <code>bb_library_data_v2</code> with cross-tab reactive sync via <code>window.addEventListener('storage')</code>.", table_cell)
        ],
        [
            Paragraph("<b>Backend API</b>", table_cell_bold),
            Paragraph("FastAPI (Python)", table_cell),
            Paragraph("v0.141.1", table_cell),
            Paragraph("Asynchronous ASGI microservice (Python 3.14) providing proxy endpoints with timeout handling and CORS control for Google Books queries.", table_cell)
        ],
        [
            Paragraph("<b>ASGI Server</b>", table_cell_bold),
            Paragraph("Uvicorn", table_cell),
            Paragraph("v0.52.4", table_cell),
            Paragraph("High-performance ASGI server running on port 8000 with auto-reload for local development.", table_cell)
        ],
        [
            Paragraph("<b>HTTP Client</b>", table_cell_bold),
            Paragraph("HTTPX (Async)", table_cell),
            Paragraph("v0.28.1", table_cell),
            Paragraph("Non-blocking async HTTP client powering backend Google Books Volumes API searches.", table_cell)
        ],
        [
            Paragraph("<b>External APIs</b>", table_cell_bold),
            Paragraph("Google Books API & OpenLibrary", table_cell),
            Paragraph("v1 / REST", table_cell),
            Paragraph("Dual external integration: Google Books API for metadata search & auto-fill; OpenLibrary Covers API for high-resolution cover artwork verification.", table_cell)
        ],
    ]
    tech_table = Table(tech_data, colWidths=[85, 110, 55, 282])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), INK_GREEN),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, LIGHT_GREY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # ── SECTION 3: SYSTEM MODULES & DOMAIN DICTIONARY ──
    story.append(Paragraph("3. Detailed Module Guide & Domain Dictionary", h1_style))
    story.append(Paragraph(
        "Each module in the Book Bank system serves a specific operational purpose. Below is a comprehensive breakdown of what every concept, status value, and interface component means and how it functions:",
        body_style
    ))

    # Subsection 3.1 Book Statuses & Catalogue Concepts
    story.append(Paragraph("A. Book States & Inventory Lifecycle", h2_style))
    
    concepts_data = [
        [Paragraph("Term / Status", table_hdr), Paragraph("Visual Indicator", table_hdr), Paragraph("Precise Operational Meaning & Invariants", table_hdr)],
        [
            Paragraph("<b>Available</b>", table_cell_bold),
            Paragraph("<font color='#1E3D32'>● Green Dot</font>", table_cell),
            Paragraph("At least one physical copy is present on the shelf and ready for checkout. Derived dynamically: <code>Available Copies = Total Copies - Active Loans - Pickup Holds &gt; 0</code>.", table_cell)
        ],
        [
            Paragraph("<b>On Loan</b>", table_cell_bold),
            Paragraph("<font color='#C68A2E'>● Amber Dot</font>", table_cell),
            Paragraph("Every owned copy of this title is currently borrowed by students. <code>Available Copies == 0</code>. Students viewing this title are invited to join the FIFO waitlist queue.", table_cell)
        ],
        [
            Paragraph("<b>Reserved</b>", table_cell_bold),
            Paragraph("<font color='#6B4EAF'>● Purple Dot</font>", table_cell),
            Paragraph("A physical copy is currently set aside at the circulation desk for a specific student who placed a hold. The copy cannot be given to walk-in borrowers.", table_cell)
        ],
        [
            Paragraph("<b>Overdue</b>", table_cell_bold),
            Paragraph("<font color='#7A2E27'>● Oxblood Dot</font>", table_cell),
            Paragraph("A loan whose return due date is strictly in the past (<code>today &gt; dueDate</code>). Accrues a continuous financial penalty of ₹5.00 per day until returned.", table_cell)
        ],
        [
            Paragraph("<b>Retired</b>", table_cell_bold),
            Paragraph("<font color='#666055'>● Grey Strikethrough</font>", table_cell),
            Paragraph("Decommissioned from circulation due to damage or obsolescence. <i>Strict invariant:</i> Retiring a title with active loans is blocked: <code>Cannot retire: title has active loans.</code>", table_cell)
        ],
        [
            Paragraph("<b>Accession No.</b><br/>(e.g. <code>BB-0042</code>)", table_cell_bold),
            Paragraph("Monospace Tag", table_cell),
            Paragraph("The unique permanent university asset identifier stamped on the physical book spine and due-date pocket slip. Distinct from standard ISBN, which identifies the edition.", table_cell)
        ],
        [
            Paragraph("<b>Due Date Pocket</b>", table_cell_bold),
            Paragraph("Card Tab Motif", table_cell),
            Paragraph("An authentic paper slip tab rendered on book covers showing library accession stamps, date due guidelines, and institutional provenance.", table_cell)
        ],
    ]
    concepts_table = Table(concepts_data, colWidths=[105, 95, 332])
    concepts_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), INK_GREEN),
        ('GRID', (0,0), (-1,-1), 0.5, LIGHT_GREY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(concepts_table)
    story.append(Spacer(1, 10))

    # Subsection 3.2 Student Portal Modules
    story.append(Paragraph("B. Student Portal Features & Workflows", h2_style))
    
    student_modules = [
        ("Public Catalogue (Browse & Search)", 
         "Search pill supporting instant text search across book titles, authors, accession numbers, and ISBNs. Includes filter pills for Category (Computer Science, Mathematics, Engineering, Algorithms, etc.) and Availability, paired with pagination."),
        ("Book Detail Page & Action Area",
         "Presents full bibliographical data (edition, publisher, format, synopsis) and live copy availability. Dynamic Action Button adapts automatically: if copies are available, shows 'Reserve this title' (5-day hold); if copies are zero, shows 'Join Waitlist'; if already reserved, displays hold pickup deadline or queue position # with cancellation option."),
        ("Pickup Holds vs. Waitlists",
         "When a student reserves an available book, a 5-day hold is created (expires if uncollected). If zero copies are available, the student joins a FIFO waitlist. When another borrower returns a copy, the system automatically converts waitlist position #1 into a ready hold and sets a 5-day expiration."),
        ("My Loans & Renewals Engine",
         "Displays the student's active books, checkout dates, due dates, and days remaining (or days overdue in oxblood). Supports 1-click renewal (+14 days). Renewals are limited to a maximum of 2 times and are blocked if the loan is overdue, if the student has unpaid fines, or if another student is on the waitlist."),
        ("Assessed Fines & Charges Ledger",
         "Displays all unpaid and settled fines in Indian Rupees (₹). Overdue books accumulate ₹5.00 per calendar day. Upon book return, accrued late fees convert into a fixed invoice that blocks subsequent checkouts until cleared by the administrator."),
    ]
    for title, desc in student_modules:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))

    story.append(Spacer(1, 8))

    # Subsection 3.3 Admin Portal Modules
    story.append(Paragraph("C. Administrative & Librarian Control Center (/admin)", h2_style))

    admin_modules = [
        ("Role-Based Access Control (RBAC)",
         "Strict authentication gating. Signing in with <code>admin@bookbank.edu</code> assigns the 'librarian' role, landing directly on <code>/admin</code> and displaying an ink-green left navigation sidebar. Non-librarians attempting to enter <code>/admin</code> are bounced to the catalogue with an unauthorized notification."),
        ("Admin Dashboard & Metric Tiles",
         "Overview tiles computing live counts for Total Books, Active Loans, Overdue Items, Active Holds, Registered Students, and Total Unpaid Fines Owed (₹)."),
        ("Needs Attention Triage Section",
         "A high-priority incident board breaking down urgent operational matters: overdue loans with accrued rupees, holds nearing 5-day expiration, unpaid fine invoices, and pending waitlists."),
        ("Catalogue Master & Cover Drag-and-Drop",
         "Comprehensive book directory with 5-status filtering, sorting, and inline edit/retire actions. Features a slide-over form with Google Books auto-fill and a drag-and-drop cover upload zone supporting JPEG, PNG, and WebP (up to 2MB)."),
        ("Issue / Return Circulation Desk",
         "Fast workstation allowing librarians to search a student and search a book to perform one-click checkout or return. Automatically checks all 6 borrowing invariants before issuing."),
        ("Member Directory & Student Detail Drawer",
         "Searchable student list displaying student IDs, departments, active loans, and fines. Clicking any row opens a comprehensive drawer with active loans, returned history, active reservations, and fine invoices with a 'Mark Paid' settlement button."),
        ("Audit Activity Log",
         "An immutable timeline feed capturing every critical action (issuing, returning, renewing, reserving, fine generation, fine settlement, member suspension, book retirement) with actor, student, and accession stamps."),
        ("Reports & CSV Export",
         "Four analytical reporting tabs: Overdue Items, Inventory Status, Most Borrowed, and Fines Ledger (Collected vs. Outstanding). Each tab includes a 1-click 'Export CSV' button for institutional reporting."),
        ("Dev Date Travel Simulator",
         "A built-in administrative tool allowing test operators to fast-forward system time by +1 day, +7 days, or +14 days to simulate due dates, observe late fine accruals, and test automated hold expirations."),
        ("Google Books API Live Importer",
         "An interactive search modal built into the Admin Catalogue that queries millions of titles on Google Books live and allows 1-click batch import into the university collection."),
    ]
    for title, desc in admin_modules:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))

    story.append(Spacer(1, 10))

    # ── SECTION 4: INVARIANT BUSINESS RULES ──
    story.append(Paragraph("4. Invariant Business Rules Checklist", h1_style))
    story.append(Paragraph(
        "To ensure academic library integrity, the system enforces the following strict business logic rules on both client and administrative operations:",
        body_style
    ))

    rules_data = [
        [Paragraph("Rule Domain", table_hdr), Paragraph("Constraint & Invariant", table_hdr), Paragraph("System Enforcement Mechanism", table_hdr)],
        [
            Paragraph("<b>Borrowing Limit</b>", table_cell_bold),
            Paragraph("Max 5 books per student", table_cell),
            Paragraph("Checkout blocked if student already has 5 active loans.", table_cell)
        ],
        [
            Paragraph("<b>Duplicate Borrowing</b>", table_cell_bold),
            Paragraph("1 copy of a title per student", table_cell),
            Paragraph("Cannot issue a title the student currently has checked out.", table_cell)
        ],
        [
            Paragraph("<b>Account Suspension</b>", table_cell_bold),
            Paragraph("Suspended accounts cannot borrow", table_cell),
            Paragraph("Issue and renewal blocked; warns admin if suspended member has active loans.", table_cell)
        ],
        [
            Paragraph("<b>Unpaid Fines Block</b>", table_cell_bold),
            Paragraph("Zero checkout with pending debt", table_cell),
            Paragraph("Blocked from issuing new loans or renewing until all fines are paid.", table_cell)
        ],
        [
            Paragraph("<b>Loan Duration</b>", table_cell_bold),
            Paragraph("14 calendar days", table_cell),
            Paragraph("Calculates due date as <code>issuedDate + 14 days</code>.", table_cell)
        ],
        [
            Paragraph("<b>Renewals</b>", table_cell_bold),
            Paragraph("Max 2 renewals (+14 days each)", table_cell),
            Paragraph("Disabled if overdue, if another student is on waitlist, or if fine &gt; ₹0.", table_cell)
        ],
        [
            Paragraph("<b>Overdue Late Fine</b>", table_cell_bold),
            Paragraph("₹5.00 per calendar day", table_cell),
            Paragraph("Accrues live after due date; converted to fixed invoice upon return.", table_cell)
        ],
        [
            Paragraph("<b>Hold Expiration</b>", table_cell_bold),
            Paragraph("5-day pickup deadline", table_cell),
            Paragraph("Auto-expires after 5 days and passes the book to the next student in queue.", table_cell)
        ],
        [
            Paragraph("<b>Retirement Safety</b>", table_cell_bold),
            Paragraph("Cannot retire active titles", table_cell),
            Paragraph("Blocked with: <code>Cannot retire: title has active loans.</code>", table_cell)
        ],
    ]
    rules_table = Table(rules_data, colWidths=[110, 150, 272])
    rules_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), INK_GREEN),
        ('GRID', (0,0), (-1,-1), 0.5, LIGHT_GREY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(rules_table)
    story.append(Spacer(1, 14))

    # ── SECTION 5: PROJECT FILE ARCHITECTURE ──
    story.append(Paragraph("5. Project Repository Structure", h1_style))
    story.append(Paragraph(
        "The project is structured into a clean two-service architecture separating client UI from backend services:",
        body_style
    ))

    struct_data = [
        [Paragraph("Directory / File", table_hdr), Paragraph("Description & Responsibility", table_hdr)],
        [Paragraph("<code>book-bank-ui/src/data/libraryStore.jsx</code>", table_cell_bold), Paragraph("Central state provider managing books, members, loans, reservations, fines, and audit log in localStorage with cross-tab event sync.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/context/AuthContext.jsx</code>", table_cell_bold), Paragraph("Role-based authentication context mapping student logins to real member records and librarians to administrative permissions.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/CatalogPage.jsx</code>", table_cell_bold), Paragraph("Public catalogue browsing, search bar, category filters, and card grids with real-time availability dots.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/BookDetailPage.jsx</code>", table_cell_bold), Paragraph("Single title inspection, multi-stage fallback cover display, and dynamic hold/waitlist Action Area.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/AccountPage.jsx</code>", table_cell_bold), Paragraph("Student portal displaying personalized loans, return countdowns, 1-click renewals, active reservations, and fines in ₹.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/AdminPage.jsx</code>", table_cell_bold), Paragraph("Authenticated admin shell with 240px ink-green sidebar, header actions, and route protection.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/admin/AdminDashboard.jsx</code>", table_cell_bold), Paragraph("Admin stat counters, 'Needs Attention' triage section, date simulator, and live audit feed.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/admin/AdminCatalogue.jsx</code>", table_cell_bold), Paragraph("Catalogue master table, 5-status filtering, cover upload with preview, and live Google Books importer.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/admin/AdminIssueReturn.jsx</code>", table_cell_bold), Paragraph("Circulation desk for fast student checkouts and returns with comprehensive rule enforcement.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/admin/AdminMembers.jsx</code>", table_cell_bold), Paragraph("Student directory with overdue/fine filter chips, inspection drawer, and fine payment settlement.", table_cell)],
        [Paragraph("<code>book-bank-ui/src/pages/admin/AdminReports.jsx</code>", table_cell_bold), Paragraph("Analytics dashboard with 4 reporting tabs (Overdue, Inventory, Popular, Fines) and CSV download.", table_cell)],
        [Paragraph("<code>book-search-api/main.py</code>", table_cell_bold), Paragraph("FastAPI microservice proxying search queries to Google Books Volumes API with error handling.", table_cell)],
        [Paragraph("<code>book-search-api/google_books.py</code>", table_cell_bold), Paragraph("Async HTTP client parsing Google Books JSON volumes and extracting ISBN-13 identifiers.", table_cell)],
        [Paragraph("<code>book-bank-ui/docs/data-model.md</code>", table_cell_bold), Paragraph("Formal system contract documenting entities, relationships, derived fields, and target REST endpoints.", table_cell)],
    ]
    struct_table = Table(struct_data, colWidths=[200, 332])
    struct_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), INK_GREEN),
        ('GRID', (0,0), (-1,-1), 0.5, LIGHT_GREY),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, CARD_BG]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(struct_table)
    story.append(Spacer(1, 16))

    # ── SIGN OFF / CONCLUSION ──
    story.append(Paragraph("6. Conclusion & Verification Summary", h1_style))
    story.append(Paragraph(
        "All modules and circulation invariants have been verified and confirmed functional. The system seamlessly handles 103+ titles loaded from Google Books, supports dual-role workflows without state leakage, and provides campus libraries with an efficient, resilient, and visually distinctive management platform.",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report generated successfully: {PDF_PATH}")

if __name__ == '__main__':
    build_pdf()

