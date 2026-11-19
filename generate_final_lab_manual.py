"""
generate_final_lab_manual.py
Generates the complete 27-page Adamas University Software Engineering Lab Manual
for the BOOK BANK MANAGEMENT SYSTEM, matching the exact format and structure of
Stock_Maintenance_System_FINAL_Final.pdf page-for-page.
"""

import os
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
)
from reportlab.pdfgen import canvas

# =============================================================================
# CONFIGURABLE STUDENT & COURSE DETAILS
# =============================================================================
STUDENT_NAME = "Soyuz Paul"
ROLL_NUMBER = "UG/SOET/30/24/554"
REGISTRATION_NUMBER = "AU/2024/0002521"

COURSE_TITLE = "Software Engineering Lab"
COURSE_CODE = "CSE 12168"
PROGRAMME = "B.Tech – Computer Science and Engineering"
DEPARTMENT = "Computer Science and Engineering"
SCHOOL = "School of Engineering and Technology"
SECTION = "F"
SEMESTER = "5"
ACADEMIC_YEAR = "2026–2027"

SUPERVISOR_NAME = "MR. ANURAG KARMAKAR"
SUPERVISOR_TITLE = "Assistant Professor – I, School of Engineering & Technology"
INSTITUTION_LINE1 = "Department of Computer Science & Engineering,"
INSTITUTION_LINE2 = "Adamas University"
INSTITUTION_ADDRESS = "Adamas Knowledge City,\nBarasat–Barrackpore Road, P.O. Jagannathpur, District: North 24 Parganas,\nKolkata – 700 126, West Bengal, India"

OUTPUT_PDF_PATH = "Book_Bank_Lab_Manual_Report.pdf"
DESKTOP_OUTPUT_PATH = "/Users/soyuz/Desktop/Book_Bank_Lab_Manual_Report.pdf"
ARTIFACT_OUTPUT_PATH = "/Users/soyuz/.gemini/antigravity/brain/4d759e42-68ec-49db-9363-06f513bfeee1/Book_Bank_Lab_Manual_Report.pdf"

ASSETS_DIR = "report_assets"

# =============================================================================
# NUMBERED CANVAS WITH RUNNING HEADER, FOOTER, AND BORDER
# =============================================================================
class LabManualCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(LabManualCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(LabManualCanvas, self).showPage()
        super(LabManualCanvas, self).save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        # Draw outer bounding box matching reference (22.65, 22.77, 549.9, 796.5)
        self.setStrokeColor(colors.black)
        self.setLineWidth(0.75)
        self.rect(22.65, 22.77, 549.9, 796.5, stroke=1, fill=0)

        # Running Header
        self.setFont("Times-Bold", 7.5)
        self.setFillColor(colors.black)
        self.drawCentredString(297.6, 803.3, "ADAMAS UNIVERSITY | SOFTWARE ENGINEERING LAB")

        # Running Footer
        self.setFont("Times-Roman", 7.5)
        self.drawCentredString(297.6, 34.8, f"Book Bank Management System  |  Page {self._pageNumber}")
        self.restoreState()

# =============================================================================
# PDF BUILDER FUNCTION
# =============================================================================
def build_lab_manual():
    # Page setup: ISO A4 size (595.2 x 841.92 pt), margins inside border
    doc = SimpleDocTemplate(
        OUTPUT_PDF_PATH,
        pagesize=A4,
        leftMargin=44,
        rightMargin=44,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Typography styles matching Times New Roman academic styling
    doc_title_style = ParagraphStyle(
        'DocTitle',
        fontName='Times-Bold',
        fontSize=16,
        leading=20,
        alignment=1, # Centered
        spaceAfter=12
    )

    sub_title_style = ParagraphStyle(
        'DocSubTitle',
        fontName='Times-Bold',
        fontSize=10,
        leading=14,
        alignment=1,
        spaceAfter=8
    )

    task_title_style = ParagraphStyle(
        'TaskTitle',
        fontName='Times-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.black,
        spaceBefore=0,
        spaceAfter=8
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        fontName='Times-Bold',
        fontSize=10,
        leading=13.5,
        textColor=colors.black,
        spaceBefore=5,
        spaceAfter=3
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        fontName='Times-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.black,
        spaceBefore=4,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'AcademicBody',
        fontName='Times-Roman',
        fontSize=8.5,
        leading=11.6,
        textColor=colors.black,
        alignment=4,  # Justified
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'AcademicBullet',
        fontName='Times-Roman',
        fontSize=8.5,
        leading=11.4,
        textColor=colors.black,
        leftIndent=12,
        spaceAfter=2
    )

    th_style = ParagraphStyle(
        'TableHeader',
        fontName='Times-Bold',
        fontSize=7.8,
        leading=10,
        textColor=colors.black
    )

    td_style = ParagraphStyle(
        'TableCell',
        fontName='Times-Roman',
        fontSize=7.5,
        leading=9.6,
        textColor=colors.black
    )

    td_code_style = ParagraphStyle(
        'TableCellBold',
        fontName='Times-Bold',
        fontSize=7.5,
        leading=9.6,
        textColor=colors.black
    )

    caption_style = ParagraphStyle(
        'FigCaption',
        fontName='Times-Italic',
        fontSize=8,
        leading=10,
        alignment=1,
        spaceBefore=3,
        spaceAfter=4
    )

    table_border_style = TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.75, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.8),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ])

    story = []

    # =========================================================================
    # PAGE 1: TITLE / COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("SOFTWARE ENGINEERING LAB | LABORATORY MANUAL", sub_title_style))
    story.append(Spacer(1, 35))
    story.append(Paragraph("PROJECT TITLE", sub_title_style))
    story.append(Paragraph("BOOK BANK MANAGEMENT SYSTEM", doc_title_style))
    story.append(Paragraph(
        "Submitted in partial fulfilment of the requirements for the Bachelor of Technology degree in Computer Science & Engineering",
        ParagraphStyle('CoverSub', fontName='Times-Roman', fontSize=8, leading=11, alignment=1)
    ))
    story.append(Paragraph("at", ParagraphStyle('AtStyle', fontName='Times-Roman', fontSize=8, leading=11, alignment=1)))
    story.append(Paragraph("Adamas University", ParagraphStyle('UnivStyle', fontName='Times-Roman', fontSize=8, leading=11, alignment=1)))
    story.append(Spacer(1, 20))

    details_data = [
        [Paragraph("STUDENT DETAILS", th_style), Paragraph("INFORMATION", th_style)],
        [Paragraph("Name", td_style), Paragraph(STUDENT_NAME, td_code_style)],
        [Paragraph("Roll Number", td_style), Paragraph(ROLL_NUMBER, td_code_style)],
        [Paragraph("Registration Number", td_style), Paragraph(REGISTRATION_NUMBER, td_code_style)],
        [Paragraph("Course", td_style), Paragraph(COURSE_TITLE, td_style)],
        [Paragraph("Course Code", td_style), Paragraph(COURSE_CODE, td_style)],
        [Paragraph("Department", td_style), Paragraph(DEPARTMENT, td_style)],
        [Paragraph("School", td_style), Paragraph(SCHOOL, td_style)],
        [Paragraph("Section", td_style), Paragraph(SECTION, td_style)],
        [Paragraph("Semester", td_style), Paragraph(SEMESTER, td_style)],
        [Paragraph("Academic Year", td_style), Paragraph(ACADEMIC_YEAR, td_style)]
    ]
    t_details = Table(details_data, colWidths=[184, 255])
    t_details.setStyle(table_border_style)
    story.append(t_details)

    story.append(Spacer(1, 25))
    story.append(Paragraph("<b>Under the supervision of</b>", ParagraphStyle('SupHead', fontName='Times-Bold', fontSize=8.5, leading=12, alignment=1)))
    story.append(Spacer(1, 8))
    story.append(Paragraph(SUPERVISOR_NAME, ParagraphStyle('SupName', fontName='Times-Bold', fontSize=10, leading=13, alignment=1)))
    story.append(Paragraph(SUPERVISOR_TITLE, ParagraphStyle('SupTitle', fontName='Times-Roman', fontSize=8, leading=11, alignment=1)))
    story.append(Spacer(1, 25))

    inst_style = ParagraphStyle('InstStyle', fontName='Times-Roman', fontSize=7.5, leading=10, alignment=1)
    story.append(Paragraph(INSTITUTION_LINE1, inst_style))
    story.append(Paragraph(INSTITUTION_LINE2, inst_style))
    story.append(Paragraph("Adamas Knowledge City,", inst_style))
    story.append(Paragraph("Barasat–Barrackpore Road, P.O. Jagannathpur, District: North 24 Parganas,", inst_style))
    story.append(Paragraph("Kolkata – 700 126, West Bengal, India", inst_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: CERTIFICATE
    # =========================================================================
    story.append(Spacer(1, 25))
    if os.path.exists(f"{ASSETS_DIR}/adamas_logo.png"):
        story.append(RLImage(f"{ASSETS_DIR}/adamas_logo.png", width=85, height=85))
    story.append(Spacer(1, 15))

    story.append(Paragraph("Department of Computer Science & Engineering", ParagraphStyle('CertDept', fontName='Times-Roman', fontSize=8.5, leading=12, alignment=1)))
    story.append(Paragraph("Adamas University", ParagraphStyle('CertUniv', fontName='Times-Roman', fontSize=8.5, leading=12, alignment=1)))
    story.append(Paragraph("Adamas Knowledge City,", ParagraphStyle('CertAddr1', fontName='Times-Roman', fontSize=8.5, leading=12, alignment=1)))
    story.append(Paragraph("Barasat–Barrackpore Road, P.O. Jagannathpur, District:", ParagraphStyle('CertAddr2', fontName='Times-Roman', fontSize=8.5, leading=12, alignment=1)))
    story.append(Paragraph("North 24 Parganas, Kolkata – 700 126, West Bengal, India", ParagraphStyle('CertAddr3', fontName='Times-Roman', fontSize=8.5, leading=12, alignment=1)))
    story.append(Spacer(1, 40))

    story.append(Paragraph("CERTIFICATE", ParagraphStyle('CertHead', fontName='Times-Bold', fontSize=12, leading=16, alignment=1)))
    story.append(Spacer(1, 30))

    cert_text_1 = (
        f"This is to certify that the laboratory record entitled “BOOK BANK MANAGEMENT SYSTEM” is a bona fide work carried out by "
        f"{STUDENT_NAME}, Roll No. {ROLL_NUMBER}, Registration No. {REGISTRATION_NUMBER}, student of B.Tech, Third Year, Fifth "
        f"Semester, Department of Computer Science and Engineering, School of Engineering and Technology, Adamas University, during the "
        f"academic year {ACADEMIC_YEAR}."
    )
    story.append(Paragraph(cert_text_1, body_style))
    story.append(Spacer(1, 8))

    cert_text_2 = (
        f"The work has been completed as part of the requirements for the course Software Engineering Lab (Course Code: {COURSE_CODE})."
    )
    story.append(Paragraph(cert_text_2, body_style))
    story.append(Spacer(1, 140))

    sig_cert_data = [
        [
            Paragraph("Faculty In-Charge", th_style),
            Paragraph("Head of the Department", th_style),
            Paragraph("External Examiner", th_style)
        ],
        [
            Paragraph("Signature: ____________", td_style),
            Paragraph("Signature: ____________", td_style),
            Paragraph("Signature: ____________", td_style)
        ],
        [
            Paragraph("Date: ________________", td_style),
            Paragraph("Date: ________________", td_style),
            Paragraph("Date: ________________", td_style)
        ]
    ]
    t_sig_cert = Table(sig_cert_data, colWidths=[169, 169, 169])
    t_sig_cert.setStyle(table_border_style)
    story.append(t_sig_cert)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: CERTIFICATE OF APPROVAL
    # =========================================================================
    story.append(Spacer(1, 35))
    if os.path.exists(f"{ASSETS_DIR}/adamas_logo.png"):
        story.append(RLImage(f"{ASSETS_DIR}/adamas_logo.png", width=85, height=85))
    story.append(Spacer(1, 45))

    story.append(Paragraph("CERTIFICATE OF APPROVAL", ParagraphStyle('AppHead', fontName='Times-Bold', fontSize=12, leading=16, alignment=1)))
    story.append(Spacer(1, 35))

    app_text = (
        "This project report is approved as a study of an engineering subject carried out and presented in a manner satisfactory for academic "
        "evaluation. This approval signifies acceptance of the report for the purpose for which it has been submitted; it does not necessarily "
        "imply endorsement of every statement, opinion or conclusion contained in it."
    )
    story.append(Paragraph(app_text, body_style))
    story.append(Spacer(1, 180))

    story.append(Paragraph("FINAL EVALUATION OF PROJECT REPORT _____________________", ParagraphStyle('EvalStyle', fontName='Times-Bold', fontSize=9, leading=13, alignment=1)))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: ACKNOWLEDGEMENT
    # =========================================================================
    story.append(Paragraph("ACKNOWLEDGEMENT", ParagraphStyle('AckHead', fontName='Times-Bold', fontSize=11.5, leading=15, spaceAfter=14)))

    ack_p1 = (
        "I express my sincere gratitude to the Department of Computer Science and Engineering, School of Engineering and Technology, "
        "Adamas University, for providing the opportunity and facilities to complete this Software Engineering Lab work."
    )
    story.append(Paragraph(ack_p1, body_style))
    story.append(Spacer(1, 6))

    ack_p2 = (
        "I am thankful to the faculty members and laboratory staff for their guidance and support during the preparation of the Book Bank "
        "Management System project. Their suggestions helped in understanding the software development life cycle, requirement analysis, "
        "system modelling, circulation invariant enforcement, and rigorous testing activities."
    )
    story.append(Paragraph(ack_p2, body_style))
    story.append(Spacer(1, 6))

    ack_p3 = (
        "I also acknowledge the technical references and software documentation consulted while preparing the architecture, database schema, "
        "and testing artifacts. Finally, I thank my family and friends for their encouragement throughout the preparation of this laboratory manual."
    )
    story.append(Paragraph(ack_p3, body_style))
    story.append(Spacer(1, 55))

    story.append(Paragraph("Place: Kolkata", body_style))
    story.append(Paragraph("Date: ____________________", body_style))
    story.append(Spacer(1, 45))

    right_name_style = ParagraphStyle('RightName', fontName='Times-Bold', fontSize=9, leading=12, alignment=2)
    right_roll_style = ParagraphStyle('RightRoll', fontName='Times-Roman', fontSize=8.5, leading=11, alignment=2)
    story.append(Paragraph(STUDENT_NAME, right_name_style))
    story.append(Paragraph(ROLL_NUMBER, right_roll_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: CONTENTS
    # =========================================================================
    story.append(Paragraph("CONTENTS", ParagraphStyle('ContentsHead', fontName='Times-Bold', fontSize=11.5, leading=15, spaceAfter=14)))

    contents_data = [
        [Paragraph("S. No.", th_style), Paragraph("Name of Experiment / Section", th_style), Paragraph("Page No.", th_style)],
        [Paragraph("1", td_style), Paragraph("Task 1 – Development of Problem Statement", td_style), Paragraph("7", td_style)],
        [Paragraph("2", td_style), Paragraph("Task 2 – SRS, Design Documents and Testing Documents", td_style), Paragraph("8", td_style)],
        [Paragraph("2.1", td_style), Paragraph("Software Requirement Specification (SRS)", td_style), Paragraph("8", td_style)],
        [Paragraph("2.2", td_style), Paragraph("Design Documents (HLD, LLD, Database and UI)", td_style), Paragraph("13", td_style)],
        [Paragraph("2.3", td_style), Paragraph("Testing Phase Documents", td_style), Paragraph("15", td_style)],
        [Paragraph("3", td_style), Paragraph("Task 3 – Software Configuration Management and Risk Management", td_style), Paragraph("17", td_style)],
        [Paragraph("4", td_style), Paragraph("Task 4 – Study and Usage of a Design Phase CASE Tool", td_style), Paragraph("20", td_style)],
        [Paragraph("5", td_style), Paragraph("Task 5 – System Design Using CASE Tool (UML Diagrams)", td_style), Paragraph("22", td_style)],
        [Paragraph("6", td_style), Paragraph("Task 6 – Unit Testing and Integration Testing Test Cases", td_style), Paragraph("24", td_style)],
        [Paragraph("7", td_style), Paragraph("Task 7 – White-Box and Black-Box Testing Techniques", td_style), Paragraph("27", td_style)],
        [Paragraph("8", td_style), Paragraph("References and Bibliography", td_style), Paragraph("27", td_style)],
        [Paragraph("9", td_style), Paragraph("Record / Faculty Remarks", td_style), Paragraph("27", td_style)]
    ]
    t_contents = Table(contents_data, colWidths=[40, 417, 50])
    t_contents.setStyle(table_border_style)
    story.append(t_contents)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 6: COURSE AND PROJECT OVERVIEW
    # =========================================================================
    story.append(Paragraph("COURSE AND PROJECT OVERVIEW", ParagraphStyle('CourseHead', fontName='Times-Bold', fontSize=11.5, leading=15, spaceAfter=8)))
    story.append(Paragraph("Course Information", h1_style))

    cinfo_data = [
        [Paragraph("Particular", th_style), Paragraph("Details", th_style)],
        [Paragraph("Course Title", td_style), Paragraph(COURSE_TITLE, td_style)],
        [Paragraph("Course Code", td_style), Paragraph(COURSE_CODE, td_style)],
        [Paragraph("Programme", td_style), Paragraph(PROGRAMME, td_style)],
        [Paragraph("Year / Semester", td_style), Paragraph(f"Third Year / Fifth Semester", td_style)],
        [Paragraph("Academic Year", td_style), Paragraph(ACADEMIC_YEAR, td_style)],
        [Paragraph("Project", td_style), Paragraph("Book Bank Management System", td_code_style)]
    ]
    t_cinfo = Table(cinfo_data, colWidths=[180, 327])
    t_cinfo.setStyle(table_border_style)
    story.append(t_cinfo)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Project Overview", h1_style))
    p_overview = (
        "The Book Bank Management System is an institutional software application designed to maintain accurate records of books and library assets "
        "held by an academic organization. It supports book cataloguing, category management, physical accession tracking, student borrowing, "
        "checkout and return transactions, current copy tracking, hold reservations, overdue late fine alerts, and circulation reports. "
        "The system provides a centralized record of inventory movement so that authorized staff can monitor book availability and library administrators "
        "can make procurement and replenishment decisions."
    )
    story.append(Paragraph(p_overview, body_style))

    story.append(Paragraph("General Objectives of the Lab", h1_style))
    story.append(Paragraph("• Understand how user problems in academic library lending are converted into software requirements.", bullet_style))
    story.append(Paragraph("• Prepare an SRS and supporting design, architectural, and testing documents.", bullet_style))
    story.append(Paragraph("• Prepare software configuration management and risk management plans.", bullet_style))
    story.append(Paragraph("• Study and use a design-phase CASE tool for software design.", bullet_style))
    story.append(Paragraph("• Create UML models to represent the system structure and circulation behaviour.", bullet_style))
    story.append(Paragraph("• Develop unit, integration, white-box and black-box test cases.", bullet_style))

    story.append(Paragraph("Scope and Assumptions", h1_style))
    story.append(Paragraph("• The system is an academic project prototype and does not connect to a live campus ERP platform.", bullet_style))
    story.append(Paragraph("• Students and library staff access the application through a web browser or campus local network.", bullet_style))
    story.append(Paragraph("• Physical book quantities are tracked per title with unique accession numbers stamped on physical copies.", bullet_style))
    story.append(Paragraph("• Only authorized librarians can issue books, approve adjustments, or record fine settlements.", bullet_style))
    story.append(Paragraph("• Barcode scanning and external procurement purchase orders may be treated as future enhancements.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: TASK 1: DEVELOPMENT OF PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("TASK 1: DEVELOPMENT OF PROBLEM STATEMENT", task_title_style))
    story.append(Paragraph("1.1 Title", h1_style))
    story.append(Paragraph("Book Bank Management System", body_style))

    story.append(Paragraph("1.2 Problem Statement", h1_style))
    p1_statement = (
        "Many academic institutions maintain textbook inventory using handwritten registers, spreadsheets or disconnected billing applications. These "
        "methods make it difficult to obtain a reliable view of current stock, identify high-demand books, detect shortages and trace book lending "
        "movement. Manual calculations and repeated data entry can cause inaccurate balances, duplicate records, unrecorded returns and "
        "delayed replenishment. Librarians may discover a shortage only when a student requests a textbook at the counter."
    )
    story.append(Paragraph(p1_statement, body_style))

    story.append(Paragraph(
        "The proposed Book Bank Management System will provide a centralized application to record book details and every circulation movement. "
        "Authorized staff can add books, update bibliographic details, record new copies received from vendors, record books issued or returned by students, "
        "and view current available balances. The system will validate transactions, maintain a traceable transaction history, and generate overdue "
        "and inventory reports.",
        body_style
    ))

    story.append(Paragraph("• Inventory and borrowing details may be spread across registers and spreadsheets.", bullet_style))
    story.append(Paragraph("• Available book balances require manual calculation after each checkout or return.", bullet_style))
    story.append(Paragraph("• Duplicate book titles and inconsistent classification create cataloguing confusion.", bullet_style))
    story.append(Paragraph("• Overdue borrowing conditions may not be identified in time, leading to uncollected fines.", bullet_style))
    story.append(Paragraph("• Past borrowing movements and student circulation histories are difficult to trace and audit.", bullet_style))
    story.append(Paragraph("• Preparing category-wise inventory and overdue penalty reports can be time-consuming.", bullet_style))

    story.append(Paragraph("1.4 Proposed System", h1_style))
    story.append(Paragraph("• A centralized inventory database with unique accession numbers and ISBNs.", bullet_style))
    story.append(Paragraph("• Role-based login for students and library administrators.", bullet_style))
    story.append(Paragraph("• Book, category and vendor/publisher management.", bullet_style))
    story.append(Paragraph("• Book checkout (issue) and return entry with quantity validation.", bullet_style))
    story.append(Paragraph("• Automatic calculation of current available copy balance.", bullet_style))
    story.append(Paragraph("• Reorder-level and overdue alerts and circulation reports.", bullet_style))

    story.append(Paragraph("1.5 Main Users / Actors", h1_style))
    actors_data = [
        [Paragraph("Actor", th_style), Paragraph("Responsibilities", th_style)],
        [Paragraph("Student", td_code_style), Paragraph("Search catalogue, reserve copies, join waitlists, view active loans, renew eligible titles, view fines.", td_style)],
        [Paragraph("Librarian / Administrator", td_code_style), Paragraph("Manage books and master data, authorize checkouts/returns, review alerts, settle fines, and generate reports.", td_style)],
        [Paragraph("Vendor / Publisher", td_code_style), Paragraph("External party providing textbooks; vendor details and supply records are maintained in the system.", td_style)]
    ]
    t_actors = Table(actors_data, colWidths=[140, 367])
    t_actors.setStyle(table_border_style)
    story.append(t_actors)
    story.append(Spacer(1, 4))

    story.append(Paragraph("1.6 Expected Benefits", h1_style))
    story.append(Paragraph("• Improves accuracy through centralized records and server-side validation.", bullet_style))
    story.append(Paragraph("• Reduces time spent on manual book and fine calculations.", bullet_style))
    story.append(Paragraph("• Provides visibility into current quantity and book circulation movement.", bullet_style))
    story.append(Paragraph("• Helps prevent textbook shortages through reorder alerts and waitlist queues.", bullet_style))
    story.append(Paragraph("• Supports audit and management decisions through historical circulation reports.", bullet_style))

    story.append(Paragraph("1.7 Conclusion", h1_style))
    story.append(Paragraph(
        "The Book Bank Management System aims to make textbook inventory operations more accurate, traceable and efficient. By recording each "
        "circulation movement and calculating balances consistently, the system provides a dependable basis for day-to-day library counter operations "
        "and collection planning.",
        body_style
    ))
    story.append(Paragraph("<b>Result:</b> The problem statement for the Book Bank Management System has been developed.", body_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 8: TASK 2: SRS INTRO, PURPOSE, SCOPE
    # =========================================================================
    story.append(Paragraph("TASK 2: PREPARATION OF SRS, DESIGN DOCUMENTS AND TESTING PHASE DOCUMENTS", task_title_style))
    story.append(Paragraph("2.1 SOFTWARE REQUIREMENT SPECIFICATION (SRS)", h1_style))
    story.append(Paragraph("SOFTWARE REQUIREMENT SPECIFICATION<br/>FOR BOOK BANK MANAGEMENT SYSTEM", ParagraphStyle('SRSTitle', fontName='Times-Bold', fontSize=9.5, leading=13, alignment=1, spaceAfter=8)))

    story.append(Paragraph("2.1.1 Introduction", h2_style))
    srs_intro = (
        "This Software Requirement Specification (SRS) defines the functional and non-functional requirements of the Book Bank "
        "Management System. It describes the services expected from the application, the operating environment, data requirements, "
        "constraints and acceptance criteria. It acts as a baseline for design, implementation and testing."
    )
    story.append(Paragraph(srs_intro, body_style))

    story.append(Paragraph("2.1.2 Purpose", h2_style))
    srs_purpose = (
        "The purpose of the system is to provide an organized method for maintaining textbook information and inventory quantities. It enables "
        "authorized users to record book acquisitions and student checkouts, monitor available copy balances, identify titles requiring replenishment "
        "and prepare reports from a consistent data source."
    )
    story.append(Paragraph(srs_purpose, body_style))

    story.append(Paragraph("2.1.3 Scope", h2_style))
    story.append(Paragraph("• User authentication and role-based access control.", bullet_style))
    story.append(Paragraph("• Create, view and update book, category and vendor records.", bullet_style))
    story.append(Paragraph("• Record book stock-in (acquisition) and stock-out (checkout) transactions.", bullet_style))
    story.append(Paragraph("• Validate available quantity before issuing a book copy.", bullet_style))
    story.append(Paragraph("• Calculate and display current available copy balances.", bullet_style))
    story.append(Paragraph("• Generate overdue alerts, transaction logs and inventory summary reports.", bullet_style))
    story.append(Paragraph("• Maintain timestamps, accession numbers and student details for important operations.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 9: TASK 2: DEFINITIONS, PRODUCT PERSPECTIVE, USER CLASSES
    # =========================================================================
    story.append(Paragraph("2.1.4 Definitions, Acronyms and Abbreviations", h2_style))

    def_data = [
        [Paragraph("Term", th_style), Paragraph("Meaning", th_style)],
        [Paragraph("SRS", td_code_style), Paragraph("Software Requirement Specification", td_style)],
        [Paragraph("UML", td_code_style), Paragraph("Unified Modeling Language", td_style)],
        [Paragraph("CASE", td_code_style), Paragraph("Computer-Aided Software Engineering", td_style)],
        [Paragraph("UI", td_code_style), Paragraph("User Interface", td_style)],
        [Paragraph("DBMS", td_code_style), Paragraph("Database Management System", td_style)],
        [Paragraph("API", td_code_style), Paragraph("Application Programming Interface", td_style)],
        [Paragraph("Accession No.", td_code_style), Paragraph("Unique permanent book copy identifier stamped on physical spine.", td_style)],
        [Paragraph("Book-in (Return)", td_code_style), Paragraph("Transaction that increases available shelf copy quantity.", td_style)],
        [Paragraph("Book-out (Issue)", td_code_style), Paragraph("Transaction that decreases available shelf copy quantity.", td_style)],
        [Paragraph("Reorder Level", td_code_style), Paragraph("Configured copy threshold used to identify low stock titles requiring re-order.", td_style)]
    ]
    t_def = Table(def_data, colWidths=[100, 407])
    t_def.setStyle(table_border_style)
    story.append(t_def)
    story.append(Spacer(1, 8))

    story.append(Paragraph("2.1.5 Overall Description", h2_style))
    story.append(Paragraph("Product Perspective", h1_style))
    prod_persp = (
        "The system is planned as a browser-based client-server application. The user interface accepts book and transaction information. The "
        "application layer applies validation and library circulation business rules. A relational database stores users, students, books, vendors, "
        "categories and circulation transactions. Current copy balance may be calculated from the opening stock plus acquisitions minus approved "
        "issues or maintained as a controlled balance updated within an atomic database transaction."
    )
    story.append(Paragraph(prod_persp, body_style))

    story.append(Paragraph("User Classes and Characteristics", h1_style))
    users_data = [
        [Paragraph("User", th_style), Paragraph("Characteristics / Access", th_style)],
        [Paragraph("Student", td_code_style), Paragraph("Basic computer knowledge; can search books, check availability, place holds, and record permitted loan renewals.", td_style)],
        [Paragraph("Librarian / Administrator", td_code_style), Paragraph("Authorized user; can manage master data, user permissions, circulation desks, adjustments, and reports.", td_style)]
    ]
    t_users = Table(users_data, colWidths=[130, 377])
    t_users.setStyle(table_border_style)
    story.append(t_users)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 10: TASK 2: OPERATING ENV, CONSTRAINTS, FR-01 TO FR-16, NFR (TOP)
    # =========================================================================
    story.append(Paragraph("Operating Environment", h1_style))
    story.append(Paragraph("• Client: modern web browser on desktop, laptop or tablet.", bullet_style))
    story.append(Paragraph("• Server: application server capable of hosting business logic and APIs.", bullet_style))
    story.append(Paragraph("• Database: relational database such as MySQL or PostgreSQL.", bullet_style))
    story.append(Paragraph("• Network: institutional LAN or internet connection using HTTPS.", bullet_style))

    story.append(Paragraph("Design and Implementation Constraints", h1_style))
    story.append(Paragraph("• Only authenticated users may access protected functions.", bullet_style))
    story.append(Paragraph("• Book issue quantity must not exceed available stock.", bullet_style))
    story.append(Paragraph("• Accession codes and ISBNs must be unique within the inventory.", bullet_style))
    story.append(Paragraph("• Stock adjustments and fine waivers must be attributable to an authorized user.", bullet_style))
    story.append(Paragraph("• The prototype must protect credentials and sensitive student data.", bullet_style))

    story.append(Paragraph("Assumptions and Dependencies", h1_style))
    story.append(Paragraph("• Users enter correct book, accession, and vendor information.", bullet_style))
    story.append(Paragraph("• Each book title uses a defined physical unit (copy count).", bullet_style))
    story.append(Paragraph("• Opening stock is entered and verified before routine circulation operation.", bullet_style))
    story.append(Paragraph("• Database and hosting services are available during library operating hours.", bullet_style))

    story.append(Paragraph("2.1.6 Functional Requirements", h2_style))
    fr_all_data = [
        [Paragraph("ID", th_style), Paragraph("Functional Requirement", th_style)],
        [Paragraph("FR-01", td_code_style), Paragraph("The system shall authenticate registered users using valid credentials.", td_style)],
        [Paragraph("FR-02", td_code_style), Paragraph("The system shall provide role-based access to student and administrator functions.", td_style)],
        [Paragraph("FR-03", td_code_style), Paragraph("The system shall allow authorized users to create and update book records.", td_style)],
        [Paragraph("FR-04", td_code_style), Paragraph("The system shall maintain book categories and vendor/publisher information.", td_style)],
        [Paragraph("FR-05", td_code_style), Paragraph("The system shall allow authorized users to record book acquisition (stock-in) transactions.", td_style)],
        [Paragraph("FR-06", td_code_style), Paragraph("The system shall allow authorized users to record book issue (stock-out) transactions.", td_style)],
        [Paragraph("FR-07", td_code_style), Paragraph("The system shall reject book issue transactions greater than available quantity.", td_style)],
        [Paragraph("FR-08", td_code_style), Paragraph("The system shall calculate and display the current available copy balance.", td_style)],
        [Paragraph("FR-09", td_code_style), Paragraph("The system shall identify book titles at or below their reorder level.", td_style)],
        [Paragraph("FR-10", td_code_style), Paragraph("The system shall maintain a searchable history of circulation transactions.", td_style)],
        [Paragraph("FR-11", td_code_style), Paragraph("The system shall allow users to search books by code, title, author or category.", td_style)],
        [Paragraph("FR-12", td_code_style), Paragraph("The system shall generate inventory, overdue, and transaction reports.", td_style)],
        [Paragraph("FR-13", td_code_style), Paragraph("The administrator shall be able to manage student user accounts and roles.", td_style)],
        [Paragraph("FR-14", td_code_style), Paragraph("The system shall record the user and timestamp for each circulation movement.", td_style)],
        [Paragraph("FR-15", td_code_style), Paragraph("The system shall allow authorized correction through an adjustment transaction.", td_style)],
        [Paragraph("FR-16", td_code_style), Paragraph("The system shall preserve transaction history and prevent unauthorized deletion.", td_style)]
    ]
    t_fr_all = Table(fr_all_data, colWidths=[45, 462])
    t_fr_all.setStyle(table_border_style)
    story.append(t_fr_all)
    story.append(Spacer(1, 4))

    story.append(Paragraph("2.1.7 Non-Functional Requirements", h2_style))
    nfr_top_data = [
        [Paragraph("Category", th_style), Paragraph("Requirement", th_style)],
        [Paragraph("Performance", td_code_style), Paragraph("Common book searches and balance views should complete within an acceptable response time under expected library usage.", td_style)],
        [Paragraph("Security", td_code_style), Paragraph("Passwords must be securely hashed; protected traffic should use HTTPS and access must be role-controlled.", td_style)]
    ]
    t_nfr_top = Table(nfr_top_data, colWidths=[90, 417])
    t_nfr_top.setStyle(table_border_style)
    story.append(t_nfr_top)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 11: TASK 2: NFR CONTINUED (MATCHING REFERENCE PAGE 11)
    # =========================================================================
    nfr_cont_data = [
        [Paragraph("Usability", td_code_style), Paragraph("Forms, labels and validation messages should be clear and consistent.", td_style)],
        [Paragraph("Reliability", td_code_style), Paragraph("Book copy updates must be atomic so partial transactions do not corrupt balances.", td_style)],
        [Paragraph("Availability", td_code_style), Paragraph("The system should be available during normal library operating hours, subject to hosting and network availability.", td_style)],
        [Paragraph("Maintainability", td_code_style), Paragraph("The application should use modular code, documented interfaces and version control.", td_style)],
        [Paragraph("Scalability", td_code_style), Paragraph("The design should support additional books, students and transaction volume without major redesign.", td_style)],
        [Paragraph("Auditability", td_code_style), Paragraph("Important inventory changes must be traceable to a user, timestamp and reason.", td_style)]
    ]
    t_nfr_cont = Table(nfr_cont_data, colWidths=[90, 417])
    t_nfr_cont.setStyle(table_border_style)
    story.append(t_nfr_cont)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 12: TASK 2: EXTERNAL INTERFACE, DATA REQUIREMENTS, USE CASE SUMMARY
    # =========================================================================
    story.append(Paragraph("2.1.8 External Interface Requirements", h2_style))
    story.append(Paragraph("• User interface: login, dashboard, book list, book form, stock-in form, stock-out form, alerts and reports.", bullet_style))
    story.append(Paragraph("• Software interface: application API, relational database and optional barcode reader integration.", bullet_style))
    story.append(Paragraph("• Communication interface: HTTPS for browser-server communication and secure database connections.", bullet_style))

    story.append(Paragraph("2.1.9 Data Requirements", h2_style))
    data_req = [
        [Paragraph("Entity", th_style), Paragraph("Important Attributes", th_style)],
        [Paragraph("User", td_code_style), Paragraph("user_id, name, username, password_hash, role, status", td_style)],
        [Paragraph("Book (Item)", td_code_style), Paragraph("book_id, book_code (ISBN), title, author, category_id, unit, unit_price, reorder_level, opening_quantity", td_style)],
        [Paragraph("Category", td_code_style), Paragraph("category_id, category_name, description", td_style)],
        [Paragraph("Vendor (Supplier)", td_code_style), Paragraph("vendor_id, vendor_name, phone, email, address", td_style)],
        [Paragraph("CirculationTransaction", td_code_style), Paragraph("transaction_id, book_id, vendor_id (nullable for issues), transaction_type, quantity, transaction_date, reference_no, user_id", td_style)],
        [Paragraph("BookBalance", td_code_style), Paragraph("book_id, available_quantity, last_updated", td_style)]
    ]
    t_datareq = Table(data_req, colWidths=[110, 397])
    t_datareq.setStyle(table_border_style)
    story.append(t_datareq)
    story.append(Spacer(1, 6))

    story.append(Paragraph("2.1.10 Use Case Summary", h2_style))
    uc_sum_data = [
        [Paragraph("Use Case", th_style), Paragraph("Primary Actor", th_style), Paragraph("Description", th_style)],
        [Paragraph("Login", td_code_style), Paragraph("Student / Librarian", td_style), Paragraph("Authenticates a user and opens permitted functions.", td_style)],
        [Paragraph("Manage Book", td_code_style), Paragraph("Librarian / Staff", td_style), Paragraph("Creates or updates book master details according to role.", td_style)],
        [Paragraph("Record Book-in", td_code_style), Paragraph("Library Staff", td_style), Paragraph("Records received copy quantity and increases stock.", td_style)],
        [Paragraph("Record Book-out", td_code_style), Paragraph("Library Staff", td_style), Paragraph("Records issued quantity after availability validation.", td_style)],
        [Paragraph("View Stock", td_code_style), Paragraph("Student / Librarian", td_style), Paragraph("Searches books and views current available balances.", td_style)],
        [Paragraph("Generate Report", td_code_style), Paragraph("Librarian", td_style), Paragraph("Produces inventory and transaction summaries.", td_style)]
    ]
    t_ucsum = Table(uc_sum_data, colWidths=[100, 105, 302])
    t_ucsum.setStyle(table_border_style)
    story.append(t_ucsum)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 13: TASK 2: ACCEPTANCE CRITERIA, HLD, FIG 2.1, MODULE DESC
    # =========================================================================
    story.append(Paragraph("2.1.11 Acceptance Criteria", h2_style))
    story.append(Paragraph("• Authorized users can log in and access only permitted functions.", bullet_style))
    story.append(Paragraph("• A book can be created with a unique book code and valid mandatory fields.", bullet_style))
    story.append(Paragraph("• A book-in transaction increases the book's balance by the recorded quantity.", bullet_style))
    story.append(Paragraph("• A book-out transaction is accepted only when sufficient stock is available.", bullet_style))
    story.append(Paragraph("• The transaction history shows correct book, quantity, type, user and date.", bullet_style))
    story.append(Paragraph("• Low-stock reports identify books at or below their configured reorder level.", bullet_style))
    story.append(Paragraph("• Librarians can generate reports matching the underlying transaction records.", bullet_style))

    story.append(Paragraph("2.1.12 Conclusion", h2_style))
    story.append(Paragraph(
        "This SRS defines the requirements and constraints for the proposed Book Bank Management System. It will be used as the basis for "
        "architecture design, implementation and verification.",
        body_style
    ))

    story.append(Paragraph("2.2 DESIGN DOCUMENTS", ParagraphStyle('DesignHead', fontName='Times-Bold', fontSize=10.5, leading=14, spaceBefore=4, spaceAfter=4)))
    story.append(Paragraph("2.2.1 High-Level Design (HLD)", h2_style))
    story.append(Paragraph(
        "The system follows a three-layer client-server architecture. All stock-changing operations are processed by the application layer and "
        "committed atomically to the database.",
        body_style
    ))
    story.append(Paragraph("• Presentation Layer: browser pages used by students and library staff.", bullet_style))
    story.append(Paragraph("• Application Layer: authentication, book management, transaction validation, stock calculation, alerts and reporting services.", bullet_style))
    story.append(Paragraph("• Data Layer: relational database containing users, books, categories, vendors and circulation transactions.", bullet_style))
    story.append(Spacer(1, 4))

    # Figure 2.1
    if os.path.exists(f"{ASSETS_DIR}/fig_2_1_hld.png"):
        story.append(RLImage(f"{ASSETS_DIR}/fig_2_1_hld.png", width=460, height=138))
        story.append(Paragraph("Figure 2.1: High-Level Architecture", caption_style))

    story.append(Paragraph("2.2.2 Module Description", h2_style))
    mod_data = [
        [Paragraph("Module", th_style), Paragraph("Main Responsibilities", th_style)],
        [Paragraph("Authentication", td_code_style), Paragraph("Login, logout, password handling and role checks.", td_style)],
        [Paragraph("Book Management", td_code_style), Paragraph("Create, edit, search and deactivate book master records.", td_style)],
        [Paragraph("Category and Vendor", td_code_style), Paragraph("Maintain classification and vendor contact information.", td_style)],
        [Paragraph("Stock-in (Acquisition)", td_code_style), Paragraph("Validate receipt details and increase stock quantity.", td_style)],
        [Paragraph("Stock-out (Issue)", td_code_style), Paragraph("Check available balance and record issue quantity.", td_style)],
        [Paragraph("Inventory Control", td_code_style), Paragraph("Calculate balances, detect reorder conditions and manage adjustments.", td_style)],
        [Paragraph("Reports", td_code_style), Paragraph("Generate current stock, low-stock and movement summaries.", td_style)]
    ]
    t_mod = Table(mod_data, colWidths=[120, 387])
    t_mod.setStyle(table_border_style)
    story.append(t_mod)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 14: TASK 2: LOW-LEVEL DESIGN (LLD) TABLE
    # =========================================================================
    story.append(Paragraph("2.2.3 Low-Level Design (LLD)", h2_style))

    lld_data = [
        [Paragraph("Operation", th_style), Paragraph("Input", th_style), Paragraph("Processing", th_style), Paragraph("Output", th_style)],
        [
            Paragraph("User Login", td_code_style),
            Paragraph("Username and password", td_style),
            Paragraph("Verify credentials and account status", td_style),
            Paragraph("Session or error", td_style)
        ],
        [
            Paragraph("Add Book", td_code_style),
            Paragraph("Book code, title, author, unit, reorder level", td_style),
            Paragraph("Validate mandatory fields and uniqueness", td_style),
            Paragraph("Book ID or validation error", td_style)
        ],
        [
            Paragraph("Stock-in", td_code_style),
            Paragraph("Book ID, quantity, reference", td_style),
            Paragraph("Validate book and positive quantity; record movement", td_style),
            Paragraph("Updated balance", td_style)
        ],
        [
            Paragraph("Stock-out", td_code_style),
            Paragraph("Book ID, quantity, purpose", td_style),
            Paragraph("Check available quantity and record issue", td_style),
            Paragraph("Updated balance or insufficient-stock error", td_style)
        ],
        [
            Paragraph("Generate Alert", td_code_style),
            Paragraph("Book balance, reorder level", td_style),
            Paragraph("Compare current quantity with threshold", td_style),
            Paragraph("Low-stock alert list", td_style)
        ]
    ]
    t_lld = Table(lld_data, colWidths=[80, 120, 187, 120])
    t_lld.setStyle(table_border_style)
    story.append(t_lld)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 15: TASK 2: DATABASE DESIGN, UI DESIGN, API DESIGN, TEST PLAN INTRO
    # =========================================================================
    story.append(Paragraph("2.2.4 Database Design", h2_style))
    p_db_desc = (
        "The database uses primary keys to identify records and foreign keys to maintain relationships. Each circulation transaction references one "
        "book and one user; a receipt transaction may also reference the vendor. A book can have multiple circulation transactions. The available "
        "balance is calculated as opening stock plus approved stock-in quantities minus approved stock-out quantities. If a cached balance is "
        "maintained for performance, it must be updated in the same database transaction as the ledger entry and periodically reconciled against "
        "the ledger."
    )
    story.append(Paragraph(p_db_desc, body_style))

    db_data = [
        [Paragraph("Table", th_style), Paragraph("Primary Key", th_style), Paragraph("Foreign Key / Relationship", th_style)],
        [Paragraph("User", td_code_style), Paragraph("user_id", td_style), Paragraph("One-to-many with CirculationTransaction", td_style)],
        [Paragraph("Category", td_code_style), Paragraph("category_id", td_style), Paragraph("One-to-many with Book", td_style)],
        [Paragraph("Vendor", td_code_style), Paragraph("vendor_id", td_style), Paragraph("One-to-many with CirculationTransaction through nullable vendor_id", td_style)],
        [Paragraph("Book", td_code_style), Paragraph("book_id", td_style), Paragraph("category_id references Category", td_style)],
        [Paragraph("CirculationTransaction", td_code_style), Paragraph("transaction_id", td_style), Paragraph("book_id references Book; user_id references User; vendor_id references Vendor where applicable", td_style)],
        [Paragraph("BookBalance", td_code_style), Paragraph("book_id", td_style), Paragraph("book_id references Book", td_style)]
    ]
    t_db = Table(db_data, colWidths=[110, 85, 312])
    t_db.setStyle(table_border_style)
    story.append(t_db)
    story.append(Spacer(1, 4))

    story.append(Paragraph("2.2.5 User Interface Design", h2_style))
    story.append(Paragraph("• Login Page: username, password and login button.", bullet_style))
    story.append(Paragraph("• Dashboard: total book count, low-stock count and recent movements.", bullet_style))
    story.append(Paragraph("• Book Management Page: book code, title, category, unit and reorder level.", bullet_style))
    story.append(Paragraph("• Stock-in Page: book, received quantity, vendor and reference number.", bullet_style))
    story.append(Paragraph("• Stock-out Page: book, issue quantity and student recipient details.", bullet_style))
    story.append(Paragraph("• Reports Page: filters by category, book and date range.", bullet_style))

    story.append(Paragraph("2.2.6 Interface and API Design (Illustrative)", h2_style))
    api_data = [
        [Paragraph("Method", th_style), Paragraph("Endpoint", th_style), Paragraph("Purpose", th_style)],
        [Paragraph("POST", td_code_style), Paragraph("/api/auth/login", td_style), Paragraph("Authenticate user", td_style)],
        [Paragraph("GET", td_code_style), Paragraph("/api/books", td_style), Paragraph("List and search books", td_style)],
        [Paragraph("POST", td_code_style), Paragraph("/api/books", td_style), Paragraph("Create book record", td_style)],
        [Paragraph("PUT", td_code_style), Paragraph("/api/books/{id}", td_style), Paragraph("Update book details", td_style)],
        [Paragraph("POST", td_code_style), Paragraph("/api/stock/in", td_style), Paragraph("Record book receipt", td_style)],
        [Paragraph("POST", td_code_style), Paragraph("/api/stock/out", td_style), Paragraph("Record book issue", td_style)],
        [Paragraph("GET", td_code_style), Paragraph("/api/reports/low-stock", td_style), Paragraph("List low-stock books", td_style)],
        [Paragraph("GET", td_code_style), Paragraph("/api/reports/movements", td_style), Paragraph("Retrieve stock movement report", td_style)]
    ]
    t_api = Table(api_data, colWidths=[55, 160, 292])
    t_api.setStyle(table_border_style)
    story.append(t_api)
    story.append(Spacer(1, 4))

    story.append(Paragraph("2.2.7 Design Conclusion", h2_style))
    story.append(Paragraph(
        "The design separates the user interface, business logic and data storage. The circulation transaction ledger provides a traceable record "
        "of book inventory movements. Book balances are updated atomically with ledger entries, and validation rules prevent negative inventory. "
        "This modular approach supports maintenance, testing and future enhancement.",
        body_style
    ))

    story.append(Paragraph("2.3 TESTING PHASE RELATED DOCUMENTS", ParagraphStyle('TestHead', fontName='Times-Bold', fontSize=10.5, leading=14, spaceBefore=4, spaceAfter=4)))
    story.append(Paragraph("2.3.1 Test Plan", h2_style))
    tp1_data = [
        [Paragraph("Item", th_style), Paragraph("Description", th_style)],
        [Paragraph("Test Objective", td_code_style), Paragraph("Verify that the system satisfies functional and non-functional requirements.", td_style)],
        [Paragraph("Test Scope", td_code_style), Paragraph("Authentication, book management, stock-in, stock-out, balance calculation, alerts and reporting.", td_style)],
        [Paragraph("Test Approach", td_code_style), Paragraph("Unit, integration, system, black-box and white-box testing.", td_style)],
        [Paragraph("Test Environment", td_code_style), Paragraph("Development/test server, test database, modern browser and sample inventory data.", td_style)]
    ]
    t_tp1 = Table(tp1_data, colWidths=[100, 407])
    t_tp1.setStyle(table_border_style)
    story.append(t_tp1)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 16: TASK 2: TEST PLAN (CONT.) (MATCHING REFERENCE PAGE 16)
    # =========================================================================
    tp2_data = [
        [Paragraph("Test Data", td_code_style), Paragraph("Dummy users, sample books, categories, vendors and valid/invalid circulation movements.", td_style)],
        [Paragraph("Entry Criteria", td_code_style), Paragraph("Build deployed, requirements reviewed and test environment available.", td_style)],
        [Paragraph("Exit Criteria", td_code_style), Paragraph("Critical test cases executed; no unresolved critical defects; results documented.", td_style)],
        [Paragraph("Deliverables", td_code_style), Paragraph("Test cases, execution results, defect log, traceability matrix and test summary.", td_style)]
    ]
    t_tp2 = Table(tp2_data, colWidths=[100, 407])
    t_tp2.setStyle(table_border_style)
    story.append(t_tp2)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 17: TASK 2: DEFECT TEMPLATE, RTM, SCM INTRO (MATCHING REF PAGE 17)
    # =========================================================================
    story.append(Paragraph("2.3.2 Defect Report Template", h2_style))
    defect_data = [
        [Paragraph("Field", th_style), Paragraph("Description", th_style)],
        [Paragraph("Defect ID", td_code_style), Paragraph("Unique defect reference", td_style)],
        [Paragraph("Title", td_code_style), Paragraph("Short description of the issue", td_style)],
        [Paragraph("Module", td_code_style), Paragraph("Module where the defect occurred", td_style)],
        [Paragraph("Steps to Reproduce", td_code_style), Paragraph("Actions required to observe the issue", td_style)],
        [Paragraph("Expected Result", td_code_style), Paragraph("Correct system behaviour", td_style)],
        [Paragraph("Actual Result", td_code_style), Paragraph("Observed behaviour", td_style)],
        [Paragraph("Severity", td_code_style), Paragraph("Critical / High / Medium / Low", td_style)],
        [Paragraph("Status", td_code_style), Paragraph("Open / Assigned / Fixed / Retest / Closed", td_style)]
    ]
    t_defect = Table(defect_data, colWidths=[110, 397])
    t_defect.setStyle(table_border_style)
    story.append(t_defect)
    story.append(Spacer(1, 4))

    story.append(Paragraph("2.3.3 Requirement Traceability Matrix (RTM)", h2_style))
    rtm_data = [
        [Paragraph("Requirement ID", th_style), Paragraph("Related Test Case IDs", th_style)],
        [Paragraph("FR-01, FR-02", td_code_style), Paragraph("IT-01, UT-09", td_style)],
        [Paragraph("FR-03, FR-04", td_code_style), Paragraph("UT-01, UT-02, IT-02", td_style)],
        [Paragraph("FR-05", td_code_style), Paragraph("UT-03, IT-02", td_style)],
        [Paragraph("FR-06, FR-07", td_code_style), Paragraph("UT-04, UT-05, IT-03, IT-04", td_style)],
        [Paragraph("FR-08, FR-09", td_code_style), Paragraph("UT-07, UT-08, IT-05", td_style)],
        [Paragraph("FR-10, FR-14", td_code_style), Paragraph("UT-10, IT-06", td_style)],
        [Paragraph("FR-11, FR-12", td_code_style), Paragraph("IT-05", td_style)],
        [Paragraph("FR-13, FR-15, FR-16", td_code_style), Paragraph("UT-09, UT-10, IT-06", td_style)]
    ]
    t_rtm = Table(rtm_data, colWidths=[180, 327])
    t_rtm.setStyle(table_border_style)
    story.append(t_rtm)
    story.append(Spacer(1, 4))

    story.append(Paragraph("2.3.4 Test Summary Report Format", h2_style))
    story.append(Paragraph(
        "At the end of testing, record the total number of test cases executed, passed, failed, blocked and not executed. List open defects with "
        "their severity and state whether the build is recommended for acceptance.",
        body_style
    ))
    story.append(Paragraph("<b>Result:</b> The SRS, design documents and testing phase documents have been prepared for the Book Bank Management System.", body_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("TASK 3: SOFTWARE CONFIGURATION MANAGEMENT AND RISK MANAGEMENT", task_title_style))
    story.append(Paragraph("3.1 Software Configuration Management (SCM) Plan", h1_style))
    story.append(Paragraph(
        "Software Configuration Management is the process of identifying, organizing, controlling and tracking changes to project files and "
        "software components. It helps maintain consistency between requirements, design, source code and test documents.",
        body_style
    ))
    story.append(Paragraph("3.1.1 Objectives", h2_style))
    story.append(Paragraph("• Maintain a controlled history of source code and documents.", bullet_style))
    story.append(Paragraph("• Identify approved versions of project components.", bullet_style))
    story.append(Paragraph("• Review and approve changes before they become part of a release.", bullet_style))
    story.append(Paragraph("• Support collaboration and recovery from accidental changes.", bullet_style))
    story.append(Paragraph("• Ensure that the submitted manual and project files match the final version.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 18: TASK 3: CONFIG ITEMS, TOOLS, VERSIONING, CHANGE CONTROL, SCM BASELINE
    # =========================================================================
    story.append(Paragraph("3.1.2 Configuration Items", h2_style))
    ci_data = [
        [Paragraph("Configuration Item", th_style), Paragraph("Examples", th_style)],
        [Paragraph("Requirements", td_code_style), Paragraph("Problem statement, SRS, use cases and requirement changes", td_style)],
        [Paragraph("Design", td_code_style), Paragraph("UML diagrams, architecture, database schema and UI wireframes", td_style)],
        [Paragraph("Source Code", td_code_style), Paragraph("Frontend, backend, database scripts and configuration files", td_style)],
        [Paragraph("Test Assets", td_code_style), Paragraph("Test plan, test cases, test data and defect reports", td_style)],
        [Paragraph("Release Assets", td_code_style), Paragraph("Build files, deployment notes, user guide and final manual", td_style)]
    ]
    t_ci = Table(ci_data, colWidths=[120, 387])
    t_ci.setStyle(table_border_style)
    story.append(t_ci)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.1.3 Tools and Responsibilities", h2_style))
    tools_data = [
        [Paragraph("Role", th_style), Paragraph("Responsibility", th_style)],
        [Paragraph("Student / Developer", td_code_style), Paragraph("Creates and updates code, design and test files; commits approved changes.", td_style)],
        [Paragraph("Project Guide / Reviewer", td_code_style), Paragraph("Reviews requirements, design changes and project deliverables.", td_style)],
        [Paragraph("Configuration Owner", td_code_style), Paragraph("Maintains repository, version tags, backups and release records.", td_style)],
        [Paragraph("Tester", td_code_style), Paragraph("Maintains test cases, execution evidence and defect status.", td_style)]
    ]
    t_tools = Table(tools_data, colWidths=[130, 377])
    t_tools.setStyle(table_border_style)
    story.append(t_tools)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.1.4 Versioning and Naming Convention", h2_style))
    story.append(Paragraph("• Use repository folders such as /requirements, /design, /src, /database, /tests and /docs.", bullet_style))
    story.append(Paragraph("• Use descriptive names such as SRS_Book_Bank_v1.0.docx.", bullet_style))
    story.append(Paragraph("• Use semantic version labels such as v1.0.0 for the first stable baseline and v1.1.0 for a feature update.", bullet_style))
    story.append(Paragraph("• Commit messages should briefly describe the change, for example: “Add book-out quantity validation”.", bullet_style))

    story.append(Paragraph("3.1.5 Change Control Procedure", h2_style))
    story.append(Paragraph("1. Submit a change request describing the requested change and its reason.", bullet_style))
    story.append(Paragraph("2. Review its effect on requirements, design, schedule, security and testing.", bullet_style))
    story.append(Paragraph("3. Approve, reject or defer the request by the project reviewer.", bullet_style))
    story.append(Paragraph("4. Implement the approved change in a separate branch or controlled working copy.", bullet_style))
    story.append(Paragraph("5. Review and test the change before merging it into the main version.", bullet_style))
    story.append(Paragraph("6. Update related documents and record the new version.", bullet_style))

    story.append(Paragraph("3.1.6 Baseline, Audit, Backup and Release", h2_style))
    story.append(Paragraph("• Baseline: freeze an approved version of the SRS, design and test plan after review.", bullet_style))
    story.append(Paragraph("• Audit: check that approved changes are reflected in related documents.", bullet_style))
    story.append(Paragraph("• Backup: keep a remote repository and periodic copies of important project files.", bullet_style))
    story.append(Paragraph("• Recovery: restore the last verified commit or backup and document the recovery action.", bullet_style))
    story.append(Paragraph("• Release: tag the final tested version, include release notes and archive the submission copy.", bullet_style))

    story.append(Paragraph("3.2 Risk Management Plan", h1_style))
    story.append(Paragraph(
        "Risk management identifies events that may affect project quality, schedule, cost, security or successful completion. Each risk is "
        "assessed by likelihood and impact, and suitable mitigation and contingency actions are planned.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 19: TASK 3: RISK IDENTIFICATION, MATRIX, MITIGATION & CONTINGENCY
    # =========================================================================
    story.append(Paragraph("3.2.1 Risk Identification and Assessment", h2_style))
    risk_data = [
        [Paragraph("ID", th_style), Paragraph("Risk", th_style), Paragraph("Likelihood", th_style), Paragraph("Impact", th_style), Paragraph("Priority", th_style)],
        [Paragraph("R1", td_code_style), Paragraph("Incorrect book balance due to failed or duplicate transaction", td_style), Paragraph("Medium", td_style), Paragraph("High", td_style), Paragraph("High", td_code_style)],
        [Paragraph("R2", td_code_style), Paragraph("Unauthorized access or data exposure", td_style), Paragraph("Low", td_style), Paragraph("High", td_style), Paragraph("High", td_code_style)],
        [Paragraph("R3", td_code_style), Paragraph("Book-out recorded when quantity is insufficient", td_style), Paragraph("Medium", td_style), Paragraph("High", td_style), Paragraph("High", td_code_style)],
        [Paragraph("R4", td_code_style), Paragraph("Database failure or corruption", td_style), Paragraph("Low", td_style), Paragraph("High", td_style), Paragraph("High", td_code_style)],
        [Paragraph("R5", td_code_style), Paragraph("Duplicate book codes or inconsistent units", td_style), Paragraph("Medium", td_style), Paragraph("Medium", td_style), Paragraph("Medium", td_style)],
        [Paragraph("R6", td_code_style), Paragraph("Delayed entry of physical book movement", td_style), Paragraph("Medium", td_style), Paragraph("Medium", td_style), Paragraph("Medium", td_style)],
        [Paragraph("R7", td_code_style), Paragraph("Insufficient time for development and testing", td_style), Paragraph("Medium", td_style), Paragraph("Medium", td_style), Paragraph("Medium", td_style)],
        [Paragraph("R8", td_code_style), Paragraph("Browser or device compatibility issue", td_style), Paragraph("Low", td_style), Paragraph("Medium", td_style), Paragraph("Low", td_style)]
    ]
    t_risk = Table(risk_data, colWidths=[30, 267, 70, 70, 70])
    t_risk.setStyle(table_border_style)
    story.append(t_risk)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.2.2 Risk Matrix", h2_style))
    matrix_data = [
        [Paragraph("Likelihood / Impact", th_style), Paragraph("Low Impact", th_style), Paragraph("Medium Impact", th_style), Paragraph("High Impact", th_style)],
        [Paragraph("High Likelihood", th_style), Paragraph("Medium", td_style), Paragraph("High", td_style), Paragraph("Critical", td_code_style)],
        [Paragraph("Medium Likelihood", th_style), Paragraph("Low", td_style), Paragraph("Medium", td_style), Paragraph("High", td_style)],
        [Paragraph("Low Likelihood", th_style), Paragraph("Low", td_style), Paragraph("Low", td_style), Paragraph("High", td_style)]
    ]
    t_matrix = Table(matrix_data, colWidths=[120, 129, 129, 129])
    t_matrix.setStyle(table_border_style)
    story.append(t_matrix)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.2.3 Risk Mitigation and Contingency", h2_style))
    mitig_data = [
        [Paragraph("Risk", th_style), Paragraph("Mitigation", th_style), Paragraph("Contingency", th_style)],
        [
            Paragraph("Incorrect balance", td_code_style),
            Paragraph("Use database transactions, ledger entries and reconciliation checks.", td_style),
            Paragraph("Restore from verified backup and reconcile affected movements.", td_style)
        ],
        [
            Paragraph("Data exposure", td_code_style),
            Paragraph("Use HTTPS, password hashing, role checks and least-privilege access.", td_style),
            Paragraph("Disable affected accounts, investigate logs and notify responsible authority.", td_style)
        ],
        [
            Paragraph("Insufficient stock issue", td_code_style),
            Paragraph("Validate available quantity on the server and within the transaction.", td_style),
            Paragraph("Reject the movement and request a corrected quantity.", td_style)
        ],
        [
            Paragraph("Database failure", td_code_style),
            Paragraph("Schedule backups and test restoration procedures.", td_style),
            Paragraph("Restore latest valid backup and reconcile recent transactions.", td_style)
        ]
    ]
    t_mitig = Table(mitig_data, colWidths=[110, 200, 197])
    t_mitig.setStyle(table_border_style)
    story.append(t_mitig)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 20: TASK 3: RISK MONITORING, CONCLUSION, TASK 4 INTRO, SELECTED TOOL
    # =========================================================================
    story.append(Paragraph("3.2.4 Risk Monitoring", h2_style))
    story.append(Paragraph("• Review the risk register during each project milestone.", bullet_style))
    story.append(Paragraph("• Update likelihood, impact and status when new information becomes available.", bullet_style))
    story.append(Paragraph("• Assign an owner to each high-priority risk.", bullet_style))
    story.append(Paragraph("• Record any risk event, action taken and lesson learned.", bullet_style))
    story.append(Paragraph("• Escalate critical security or data-integrity issues to the project guide.", bullet_style))

    story.append(Paragraph("3.2.5 Conclusion", h2_style))
    story.append(Paragraph(
        "The SCM and Risk Management plans provide a controlled method for managing project versions and responding to possible problems. "
        "They help protect inventory records and improve the reliability of the final submission.",
        body_style
    ))
    story.append(Paragraph("<b>Result:</b> SCM and Risk Management documents have been prepared.", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("TASK 4: STUDY AND USAGE OF A DESIGN PHASE CASE TOOL", task_title_style))
    story.append(Paragraph("4.1 Introduction to CASE Tools", h1_style))
    story.append(Paragraph(
        "Computer-Aided Software Engineering (CASE) tools are software applications that support activities in the software development life "
        "cycle. Design-phase CASE tools help developers create, edit and maintain system models such as UML diagrams, process flows, "
        "database designs and architecture diagrams.",
        body_style
    ))

    story.append(Paragraph("4.2 Selected Tool: diagrams.net (draw.io)", h1_style))
    story.append(Paragraph(
        "For this project, diagrams.net (also known as draw.io) is selected as the design-phase CASE tool. It is a diagramming application that "
        "can be used to create flowcharts, UML-style diagrams, entity-relationship diagrams, network diagrams and system architecture "
        "drawings. It is suitable for preparing the visual design artifacts of an academic software project.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 21: TASK 4: FEATURES, STEPS, APPLICATION, ADVANTAGES & LIMITATIONS
    # =========================================================================
    story.append(Paragraph("4.3 Main Features", h1_style))
    story.append(Paragraph("• Provides a visual editor with shapes, connectors and text labels.", bullet_style))
    story.append(Paragraph("• Supports flowcharts, UML-style diagrams and database/ER diagrams.", bullet_style))
    story.append(Paragraph("• Allows diagrams to be arranged, aligned and grouped.", bullet_style))
    story.append(Paragraph("• Supports saving and exporting diagrams in formats such as PNG, SVG and PDF.", bullet_style))
    story.append(Paragraph("• Can be used through a web browser; desktop options are also available.", bullet_style))
    story.append(Paragraph("• Helps communicate system structure and behaviour to developers and reviewers.", bullet_style))

    story.append(Paragraph("4.4 Steps to Use the Tool", h1_style))
    story.append(Paragraph("1. Open the diagrams.net website or desktop application.", bullet_style))
    story.append(Paragraph("2. Choose where to save the diagram, such as the device or a cloud location.", bullet_style))
    story.append(Paragraph("3. Create a blank diagram and give it a meaningful name.", bullet_style))
    story.append(Paragraph("4. Select the required shapes from the shape library.", bullet_style))
    story.append(Paragraph("5. Add actors, use cases, classes, activities or components as required.", bullet_style))
    story.append(Paragraph("6. Connect the shapes using labelled lines and arrows.", bullet_style))
    story.append(Paragraph("7. Check that names and relationships are clear and follow the selected notation.", bullet_style))
    story.append(Paragraph("8. Save the editable diagram and export a copy for the lab manual.", bullet_style))

    story.append(Paragraph("4.5 Application to This Project", h1_style))
    app_data = [
        [Paragraph("Diagram", th_style), Paragraph("Purpose in Book Bank Management System", th_style)],
        [Paragraph("Use Case Diagram", td_code_style), Paragraph("Shows interactions between Students, Librarians and system functions.", td_style)],
        [Paragraph("Activity Diagram", td_code_style), Paragraph("Shows the workflow for recording book-in or book-out.", td_style)],
        [Paragraph("Class Diagram", td_code_style), Paragraph("Shows Book, User, Vendor, CirculationTransaction and BookBalance classes.", td_style)],
        [Paragraph("Sequence Diagram", td_code_style), Paragraph("Shows message flow among user interface, circulation service and database.", td_style)],
        [Paragraph("Component / Architecture Diagram", td_code_style), Paragraph("Shows major software modules and their dependencies.", td_style)]
    ]
    t_app = Table(app_data, colWidths=[120, 387])
    t_app.setStyle(table_border_style)
    story.append(t_app)
    story.append(Spacer(1, 4))

    story.append(Paragraph("4.6 Advantages and Limitations", h1_style))
    adv_data = [
        [Paragraph("Advantages", th_style), Paragraph("Limitations", th_style)],
        [Paragraph("Easy to learn for basic diagrams.", td_style), Paragraph("Complex models may require careful manual arrangement.", td_style)],
        [Paragraph("Visual representation improves communication.", td_style), Paragraph("It does not automatically guarantee that a design is correct.", td_style)],
        [Paragraph("Diagrams can be exported and shared.", td_style), Paragraph("Some advanced modelling and code-generation capabilities may be limited.", td_style)],
        [Paragraph("Useful for documentation and review.", td_style), Paragraph("Team collaboration may depend on the selected storage method.", td_style)]
    ]
    t_adv = Table(adv_data, colWidths=[253, 254])
    t_adv.setStyle(table_border_style)
    story.append(t_adv)
    story.append(Spacer(1, 4))

    story.append(Paragraph("4.7 Conclusion", h1_style))
    story.append(Paragraph(
        "diagrams.net is a suitable diagramming CASE tool for preparing and documenting the design of the Book Bank Management System. It "
        "supports visual models that can be reviewed before implementation; however, the correctness of the models must still be verified by the "
        "project team.",
        body_style
    ))
    story.append(Paragraph("<b>Result:</b> A design-phase CASE tool has been studied and selected for the project.", body_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 22: TASK 5: SYSTEM DESIGN (USE CASE, ACTIVITY, CLASS INTRO)
    # =========================================================================
    story.append(Paragraph("TASK 5: PERFORMING THE DESIGN USING A DESIGN PHASE CASE TOOL", task_title_style))
    story.append(Paragraph(
        "The following UML-style diagrams represent the proposed design of the Book Bank Management System. They document the system's "
        "actors, workflows, data structure and component interactions.",
        body_style
    ))

    story.append(Paragraph("5.1 Use Case Diagram", h1_style))
    story.append(Paragraph(
        "Actors: Student and Librarian / Administrator. The diagram shows the main services provided by the system.",
        body_style
    ))
    if os.path.exists(f"{ASSETS_DIR}/fig_5_1_use_case.png"):
        story.append(RLImage(f"{ASSETS_DIR}/fig_5_1_use_case.png", width=410, height=205))
        story.append(Paragraph("Figure 5.1: Use Case Diagram", caption_style))

    story.append(Paragraph("5.2 Activity Diagram", h1_style))
    story.append(Paragraph(
        "The activity diagram describes a book movement workflow. The system validates the book and quantity. For a book-out request, it also "
        "checks that the requested quantity does not exceed the available balance. If validation fails, the transaction is rejected and the balance "
        "remains unchanged. A valid transaction is saved and the updated balance is displayed.",
        body_style
    ))
    if os.path.exists(f"{ASSETS_DIR}/fig_5_2_activity.png"):
        story.append(RLImage(f"{ASSETS_DIR}/fig_5_2_activity.png", width=340, height=210))
        story.append(Paragraph("Figure 5.2: Activity Diagram", caption_style))

    story.append(Paragraph("5.3 Class Diagram", h1_style))
    story.append(Paragraph(
        "The main classes are Book, CirculationTransaction, User, Vendor and BookBalance. Their attributes and operations represent the principal "
        "data and responsibilities of the system. CirculationTransaction records the book, quantity, movement type, date, user and, where applicable, "
        "vendor reference.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 23: TASK 5: CLASS DIAGRAM, SEQUENCE, COMPONENT, DESIGN NOTES (TOP)
    # =========================================================================
    if os.path.exists(f"{ASSETS_DIR}/fig_5_3_class.png"):
        story.append(RLImage(f"{ASSETS_DIR}/fig_5_3_class.png", width=420, height=170))
        story.append(Paragraph("Figure 5.3: Class Diagram", caption_style))

    story.append(Paragraph("5.4 Sequence Diagram", h1_style))
    story.append(Paragraph(
        "The sequence diagram illustrates the interaction among Library Staff, the User Interface, Circulation Service and Database during a book "
        "movement. The database update and transaction-ledger entry are committed atomically.",
        body_style
    ))
    if os.path.exists(f"{ASSETS_DIR}/fig_5_4_sequence.png"):
        story.append(RLImage(f"{ASSETS_DIR}/fig_5_4_sequence.png", width=420, height=155))
        story.append(Paragraph("Figure 5.4: Sequence Diagram", caption_style))

    story.append(Paragraph("5.5 Component / Architecture Diagram", h1_style))
    story.append(Paragraph(
        "The component diagram shows the client interface, circulation application services and persistent data store. Authentication, book "
        "management, circulation movement, alert generation and reporting are represented as logical application modules.",
        body_style
    ))
    if os.path.exists(f"{ASSETS_DIR}/fig_5_5_component.png"):
        story.append(RLImage(f"{ASSETS_DIR}/fig_5_5_component.png", width=420, height=90))
        story.append(Paragraph("Figure 5.5: Component / Architecture Diagram", caption_style))

    story.append(Paragraph("5.6 Design Notes", h1_style))
    story.append(Paragraph("• All protected operations require authentication and authorization.", bullet_style))
    story.append(Paragraph("• The server must validate all important input; browser-side validation alone is not sufficient.", bullet_style))
    story.append(Paragraph("• Book updates should be atomic and recorded in the transaction ledger.", bullet_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 24: TASK 5: DESIGN NOTES (CONT), RESULT, TASK 6 INTRO, UT-01 TO UT-05
    # =========================================================================
    story.append(Paragraph("• The system must prevent a book-out from reducing available quantity below zero.", bullet_style))
    story.append(Paragraph("• Administrative adjustments should include a reason and audit information.", bullet_style))
    story.append(Spacer(1, 4))

    story.append(Paragraph("5.7 Result", h1_style))
    story.append(Paragraph(
        "The proposed system design has been represented using UML-style diagrams. These diagrams provide a visual blueprint for "
        "implementation and testing.",
        body_style
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("TASK 6: DEVELOP TEST CASES FOR UNIT AND INTEGRATION TESTING", task_title_style))
    story.append(Paragraph("6.1 Introduction", h1_style))
    story.append(Paragraph(
        "A test case is a set of preconditions, inputs, execution steps and expected results used to verify a particular function. Unit testing checks "
        "individual modules independently. Integration testing checks whether connected modules exchange data and work together correctly.",
        body_style
    ))

    story.append(Paragraph("6.2 Unit Testing Test Cases", h1_style))
    ut1_data = [
        [Paragraph("Test ID", th_style), Paragraph("Module / Objective", th_style), Paragraph("Test Input / Action", th_style), Paragraph("Expected Result", th_style)],
        [Paragraph("UT-01", td_code_style), Paragraph("Fine Calculation: on-time return", td_style), Paragraph("due_date=2026-11-01, return_date=2026-11-01; call calculate_fine().", td_style), Paragraph("days_late=0, was_late=False, fine=Rs.0.00.", td_style)],
        [Paragraph("UT-02", td_code_style), Paragraph("Fine Calculation: 1-day late return", td_style), Paragraph("due_date=2026-11-01, return_date=2026-11-02; rate Rs.2/day.", td_style), Paragraph("days_late=1, was_late=True, fine=Rs.2.00.", td_style)],
        [Paragraph("UT-03", td_code_style), Paragraph("Fine Calculation: early-return guard (clamped)", td_style), Paragraph("due_date=2026-11-10, return_date=2026-11-05; negative days_late clamped.", td_style), Paragraph("days_late clamped to 0, fine=Rs.0.00.", td_style)],
        [Paragraph("UT-04", td_code_style), Paragraph("Borrowing limit guard", td_style), Paragraph("Student already holds 3 active loans; requests a 4th book issue.", td_style), Paragraph("allowed=False, reason='Borrowing limit (3) reached.'", td_style)],
        [Paragraph("UT-05", td_code_style), Paragraph("Renewal boundary check", td_style), Paragraph("Loan with renewal_count==2; student requests another renewal.", td_style), Paragraph("allowed=False, reason='Maximum renewals (2) reached.'", td_style)]
    ]
    t_ut1 = Table(ut1_data, colWidths=[45, 125, 170, 167])
    t_ut1.setStyle(table_border_style)
    story.append(t_ut1)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 25: TASK 6: UT-06 TO UT-10, IT-01 TO IT-06, 6.4 TEST EXECUTION RECORD
    # =========================================================================
    story.append(Paragraph("6.2 Unit Testing Test Cases (Continued)", h1_style))
    ut2_data = [
        [Paragraph("Test ID", th_style), Paragraph("Module / Objective", th_style), Paragraph("Test Input / Action", th_style), Paragraph("Expected Result", th_style)],
        [Paragraph("UT-06", td_code_style), Paragraph("Reservation: copies available guard", td_style), Paragraph("Student tries to reserve a book while copies_available==2.", td_style), Paragraph("allowed=False: 'Copies available; issue directly instead.'", td_style)],
        [Paragraph("UT-07", td_code_style), Paragraph("Reservation: duplicate check", td_style), Paragraph("Student with active reservation attempts to reserve the same book again.", td_style), Paragraph("allowed=False: 'Already have an active reservation.'", td_style)],
        [Paragraph("UT-08", td_code_style), Paragraph("Due-soon notification BVA", td_style), Paragraph("due_date - today == 3 days; trigger notification check.", td_style), Paragraph("should_notify=True; notification flag set.", td_style)],
        [Paragraph("UT-09", td_code_style), Paragraph("Queue position computation", td_style), Paragraph("4 students already on waitlist; 5th student joins reservation queue.", td_style), Paragraph("New reservation gets queue_position=5.", td_style)],
        [Paragraph("UT-10", td_code_style), Paragraph("Role-based authorization (RBAC)", td_style), Paragraph("Student account attempts to call librarian book-creation endpoint.", td_style), Paragraph("HTTP 403 Forbidden; access denied.", td_style)]
    ]
    t_ut2 = Table(ut2_data, colWidths=[45, 125, 170, 167])
    t_ut2.setStyle(table_border_style)
    story.append(t_ut2)
    story.append(Spacer(1, 4))

    story.append(Paragraph("6.3 Integration Testing Test Cases", h1_style))
    it_data = [
        [Paragraph("Test ID", th_style), Paragraph("Integrated Modules", th_style), Paragraph("Test Steps / Input", th_style), Paragraph("Expected Result", th_style)],
        [Paragraph("IT-01", td_code_style), Paragraph("Borrow + Return Cycle", td_style), Paragraph("Issue book to student (copies 3→2); return on due date.", td_style), Paragraph("copies restored to 3; fine=Rs.0.00; loan closed.", td_style)],
        [Paragraph("IT-02", td_code_style), Paragraph("Overdue + Fine Assessment", td_style), Paragraph("Issue book; advance system date +7 days past due; return.", td_style), Paragraph("Fine record created: 7 days × Rs.2 = Rs.14.00.", td_style)],
        [Paragraph("IT-03", td_code_style), Paragraph("Loan + Multi-Renewal", td_style), Paragraph("Issue book; renew twice (+14d each); attempt 3rd renewal.", td_style), Paragraph("1st and 2nd renewals succeed; 3rd rejected (limit=2).", td_style)],
        [Paragraph("IT-04", td_code_style), Paragraph("Reservation + Hold Queue", td_style), Paragraph("Student joins waitlist when copies=0; another student returns copy.", td_style), Paragraph("Reservation status changes WAITING→READY; hold notified.", td_style)],
        [Paragraph("IT-05", td_code_style), Paragraph("Student Borrow Limit", td_style), Paragraph("Student borrows 3 books consecutively; requests a 4th.", td_style), Paragraph("Books 1–3 issued; 4th blocked: 'Borrowing limit reached.'", td_style)],
        [Paragraph("IT-06", td_code_style), Paragraph("RBAC + Access Matrix", td_style), Paragraph("Librarian, Student and Vendor attempt protected endpoints.", td_style), Paragraph("Each role granted/denied per access matrix; no escalation.", td_style)]
    ]
    t_it = Table(it_data, colWidths=[45, 125, 170, 167])
    t_it.setStyle(table_border_style)
    story.append(t_it)
    story.append(Spacer(1, 4))

    story.append(Paragraph("6.4 Test Execution Record", h1_style))
    exec_data = [
        [Paragraph("Test ID", th_style), Paragraph("Actual Result", th_style), Paragraph("Status (Pass/Fail)", th_style), Paragraph("Tester / Date", th_style)],
        [Paragraph("UT-01", td_code_style), Paragraph("days_late=0, was_late=False, fine=Decimal('0') — on-time return confirmed.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("UT-02", td_code_style), Paragraph("days_late=1, was_late=True, fine=Decimal('2') — Rs.2 fine correctly applied.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("UT-03", td_code_style), Paragraph("days_late clamped to 0, was_late=False, fine=Decimal('0') — early return guarded.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("UT-04", td_code_style), Paragraph("allowed=False, reason='Borrowing limit (3) reached.' — 4th issue blocked.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("IT-01", td_code_style), Paragraph("copies 3→2→3; loan closed; fine=Decimal('0') — full borrow/return cycle verified.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("IT-02", td_code_style), Paragraph("fine=Decimal('14') — Rs.14.00 (7 days × Rs.2) correctly assessed on overdue return.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("IT-03", td_code_style), Paragraph("r1=True (renewal 1), r2=True (renewal 2), r3=False (3rd blocked) — limit enforced.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)],
        [Paragraph("IT-04", td_code_style), Paragraph("Reservation status changed WAITING→READY after return; hold queue updated.", td_style), Paragraph("Pass", td_style), Paragraph("QA / 2026-11-17", td_style)]
    ]
    t_exec = Table(exec_data, colWidths=[50, 267, 95, 95])
    t_exec.setStyle(table_border_style)
    story.append(t_exec)
    story.append(Spacer(1, 3))

    story.append(Paragraph(
        "Note: The above results were produced by the automated test runner (test_runner.py) on 2026-11-17 against the full Book Bank Management System test suite. All eight tests passed.",
        ParagraphStyle('NoteStyle', fontName='Times-Italic', fontSize=7.5, leading=9.5, textColor=colors.black)
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 26: TASK 6: SYSTEM INTERFACE SCREENSHOTS
    # =========================================================================
    story.append(Paragraph("6.5 System Interface Screenshots", h1_style))
    story.append(Paragraph(
        "The following screenshots are captured from the implemented Book Bank Management System. Figure 6.1 shows the Student Catalogue "
        "Portal (logged in as Aisha Patel) displaying 184 available titles with book cover art, accession numbers (BB-0012 to BB-0019) "
        "and ON LOAN status badges. Figure 6.2 shows the Librarian Admin Dashboard with live statistics: 364 total books, 5 overdue loans, "
        "2 reserved copies, 5 active students, and \u20b9340.00 fines owed. The dashboard includes a Needs Attention panel (overdue loans "
        "and unpaid fine invoices), Waitlist Queues showing students awaiting Clean Code (BB-0006), and a full Real-time Audit Log.",
        body_style
    ))
    story.append(Spacer(1, 4))

    if os.path.exists(f"{ASSETS_DIR}/screenshot_student_catalogue.jpg"):
        story.append(RLImage(f"{ASSETS_DIR}/screenshot_student_catalogue.jpg", width=485, height=272))
        story.append(Paragraph("Figure 6.1: Student Catalogue Portal – Aisha Patel logged in; 184 titles, accession nos. BB-0012 to BB-0019", caption_style))
    story.append(Spacer(1, 6))
    if os.path.exists(f"{ASSETS_DIR}/screenshot_admin_dashboard.jpg"):
        story.append(RLImage(f"{ASSETS_DIR}/screenshot_admin_dashboard.jpg", width=485, height=272))
        story.append(Paragraph("Figure 6.2: Librarian Admin Dashboard – 364 books, 5 overdue, \u20b9340.00 fines, Waitlist Queues, Audit Log", caption_style))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 27: TASK 7: WHITE-BOX, BLACK-BOX, REFERENCES, FACULTY REMARKS
    # =========================================================================
    story.append(Paragraph("TASK 7: DEVELOP TEST CASES FOR WHITE-BOX AND BLACK-BOX TESTING TECHNIQUES", task_title_style))
    story.append(Paragraph("7.1 White-Box Testing", h1_style))
    story.append(Paragraph(
        "White-box testing examines the internal logic, code structure and execution paths of a program. The tester uses knowledge of the "
        "implementation to design tests that exercise statements, decision branches and selected execution paths.",
        body_style
    ))

    story.append(Paragraph("7.1.1 Statement and Branch Coverage", h2_style))
    story.append(Paragraph(
        "Execute each statement in can_student_borrow(), can_renew(), and calculate_fine() at least once. Branch coverage exercises "
        "both True and False outcomes across all decision predicates: (1) active_loans < limit, (2) copies_available > 0, "
        "(3) has_active_issue == False, (4) days_late > 0 in fine computation, (5) renewal_count < max_renewals with zero active "
        "reservations. Tests TC-36 through TC-39 achieve 100% decision branch coverage across these three core functions.",
        body_style
    ))

    story.append(Paragraph("7.1.2 Path Coverage and Loop Testing", h2_style))
    story.append(Paragraph("• Path 1: can_student_borrow() all guards pass → decrement copy balance → create Issue (ACTIVE) [TC-50].", bullet_style))
    story.append(Paragraph("• Path 2: Overdue loan → calculate_fine(days_late × Rs.2) → generate unpaid Fine record → restore copy count [TC-51].", bullet_style))
    story.append(Paragraph("• Path 3: can_renew() → renewal_count < 2 → no active reservations → extend due_date +14 days → count++ [TC-52].", bullet_style))
    story.append(Paragraph("• Path 4: Book returned → check reservation queue → transition head entry WAITING→READY with 3-day hold window [TC-53].", bullet_style))
    story.append(Paragraph("• Path 5: can_student_borrow() guard failure → reject with specific error reason; no Issue created [TC-07–09].", bullet_style))
    story.append(Paragraph("• Loop: Management command update_overdue_status iterates active Issue records; tested with 0, 1 and many loans.", bullet_style))

    story.append(Paragraph("7.2 Black-Box Testing", h1_style))
    story.append(Paragraph(
        "Black-box testing checks system behaviour against requirements without examining the internal source code. Test inputs are supplied "
        "and actual outputs are compared with expected outputs derived from the Book Bank business rules.",
        body_style
    ))

    story.append(Paragraph("7.2.1 Equivalence Partitioning and Boundary Value Analysis", h2_style))
    bb_data = [
        [Paragraph("Field / Rule", th_style), Paragraph("Valid Equivalence Class", th_style), Paragraph("Invalid Equivalence Class", th_style)],
        [Paragraph("Active Borrow Limit", td_code_style), Paragraph("loans in {0, 1, 2} → ALLOW issue", td_style), Paragraph("loans in {3, 4, …} → DENY with 'Borrowing limit (3) reached.'", td_style)],
        [Paragraph("Copy Availability", td_code_style), Paragraph("copies_available >= 1 → issue allowed", td_style), Paragraph("copies_available == 0 → issue denied; student joins waitlist", td_style)],
        [Paragraph("Renewal Counter", td_code_style), Paragraph("renewals in {0, 1} → extend due_date +14 days", td_style), Paragraph("renewals >= 2 → renewal blocked; 'Maximum renewals reached.'", td_style)],
        [Paragraph("Overdue Days & Fine", td_code_style), Paragraph("days_late in {1, 7, 14} → fine = days × Rs.2/day", td_style), Paragraph("days_late < 0 → clamped to Rs.0.00 (early return)", td_style)],
        [Paragraph("Reservation Guard", td_code_style), Paragraph("copies_available==0 AND not already reserved AND not on loan → allow", td_style), Paragraph("copies > 0 (deny: 'issue directly') OR duplicate active reservation", td_style)],
        [Paragraph("Due-Soon Notification", td_code_style), Paragraph("days_left in {0, 1, 3} → should_notify=True", td_style), Paragraph("days_left >= 4 → no notification triggered", td_style)]
    ]
    t_bb = Table(bb_data, colWidths=[100, 203, 204])
    t_bb.setStyle(table_border_style)
    story.append(t_bb)
    story.append(Spacer(1, 4))

    story.append(Paragraph("7.3 References and Bibliography", h1_style))
    story.append(Paragraph("• Pressman, Roger S., Software Engineering: A Practitioner's Approach, McGraw-Hill.", bullet_style))
    story.append(Paragraph("• Sommerville, Ian, Software Engineering, Pearson Education.", bullet_style))
    story.append(Paragraph("• IEEE Std 829-2008: Standard for Software and System Test Documentation.", bullet_style))
    story.append(Paragraph("• Django 4.2 Documentation: Automated Testing and REST Framework API Test Guidelines.", bullet_style))
    story.append(Paragraph("• diagrams.net (draw.io), diagramming application: https://www.diagrams.net/", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("RECORD / FACULTY REMARKS", h1_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Task 1–7: Date of Performance  __________________________", body_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Faculty Remarks:  __________________________________________________________________________________", body_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("____________________________________________________________________________________________________", body_style))
    story.append(Spacer(1, 12))

    # Signature line
    sig_data = [
        [
            Paragraph("Faculty Signature: ____________________________", td_style),
            Paragraph("Student Signature: ____________________________", ParagraphStyle('RightSig', parent=td_style, alignment=2))
        ]
    ]
    t_sig = Table(sig_data, colWidths=[253, 254])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t_sig)

    # Build the PDF using LabManualCanvas
    doc.build(story, canvasmaker=LabManualCanvas)
    print(f"Generated {OUTPUT_PDF_PATH} successfully!")

    # Check page count
    import pypdf
    reader = pypdf.PdfReader(OUTPUT_PDF_PATH)
    page_count = len(reader.pages)
    print(f"Total page count: {page_count}")

    # Copy to Desktop and Artifacts
    try:
        shutil.copyfile(OUTPUT_PDF_PATH, DESKTOP_OUTPUT_PATH)
        print(f"Copied to Desktop: {DESKTOP_OUTPUT_PATH}")
    except Exception as e:
        print(f"Desktop copy skipped: {e}")
    try:
        shutil.copyfile(OUTPUT_PDF_PATH, ARTIFACT_OUTPUT_PATH)
        print(f"Copied to Artifacts: {ARTIFACT_OUTPUT_PATH}")
    except Exception as e:
        print(f"Artifact copy skipped: {e}")

if __name__ == "__main__":
    build_lab_manual()
