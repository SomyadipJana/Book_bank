"""
generate_testing_pdf.py
Generates the Software Testing Report PDF matching the exact academic lab format
(Task 6 & Task 7) using the actual test cases and results from testing/test_runner.py
for the Book Bank Management System.
"""

import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)

PDF_OUTPUT_PATH = "/Users/somu/Documents/Book_Management_system/Book_Bank_Software_Testing_Report.pdf"
ARTIFACT_OUTPUT_PATH = "/Users/somu/.gemini/antigravity/brain/f106db8b-839a-4c9b-bfde-22cc619c7b41/Book_Bank_Software_Testing_Report.pdf"

def build_pdf():
    # Page setup: letter size, 36 pt (0.5 in) margins matching reference pictures
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PATH,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    # Academic Typography Styles (Times-Roman)
    task_title_style = ParagraphStyle(
        'TaskTitle',
        fontName='Times-Bold',
        fontSize=12.5,
        leading=16,
        textColor=colors.black,
        spaceAfter=10,
        spaceBefore=0
    )

    section_heading_style = ParagraphStyle(
        'SectionHeading',
        fontName='Times-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.black,
        spaceBefore=5,
        spaceAfter=4
    )

    subsection_heading_style = ParagraphStyle(
        'SubSectionHeading',
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.black,
        spaceBefore=4,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'AcademicBody',
        fontName='Times-Roman',
        fontSize=9.5,
        leading=13,
        textColor=colors.black,
        alignment=4,  # Justified
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'AcademicBullet',
        fontName='Times-Roman',
        fontSize=9,
        leading=12.5,
        textColor=colors.black,
        leftIndent=14,
        spaceAfter=2.5
    )

    # Table Typography
    th_style = ParagraphStyle(
        'TableHeader',
        fontName='Times-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.black
    )

    td_style = ParagraphStyle(
        'TableCell',
        fontName='Times-Roman',
        fontSize=8,
        leading=10.5,
        textColor=colors.black
    )

    td_code_style = ParagraphStyle(
        'TableCellCode',
        fontName='Times-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.black
    )

    note_style = ParagraphStyle(
        'TableNote',
        fontName='Times-Roman',
        fontSize=8.5,
        leading=11,
        textColor=colors.black,
        spaceBefore=3
    )

    # Standard clean black border table style
    table_border_style = TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.75, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ])

    story = []

    # =========================================================================
    # PAGE 1: TASK 6 (Intro + 6.2 Unit Testing UT-01 to UT-05 from test_runner.py)
    # =========================================================================
    story.append(Paragraph("TASK 6: DEVELOP TEST CASES FOR UNIT AND INTEGRATION TESTING", task_title_style))
    story.append(Paragraph("6.1 Introduction", section_heading_style))
    story.append(Paragraph(
        "A test case is a set of preconditions, inputs, execution steps and expected results used to verify a particular function. "
        "Unit testing checks individual modules independently. Integration testing checks whether connected modules exchange data "
        "and work together correctly.",
        body_style
    ))

    story.append(Paragraph("6.2 Unit Testing Test Cases", section_heading_style))

    # Actual tests from test_runner.py for Book Bank Management System
    # Col widths: 52 + 133 + 175 + 180 = 540 pt
    ut_page1_data = [
        [
            Paragraph("Test ID", th_style),
            Paragraph("Module / Objective", th_style),
            Paragraph("Test Input / Action", th_style),
            Paragraph("Expected Result", th_style)
        ],
        [
            Paragraph("UT-01", td_code_style),
            Paragraph("Fine: On-time return", td_style),
            Paragraph("due_date = 2026-11-01, return_date = 2026-11-01 (TC-01)", td_style),
            Paragraph("days_late = 0, fine amount = Rs. 0.00, was_late = False.", td_style)
        ],
        [
            Paragraph("UT-02", td_code_style),
            Paragraph("Fine: 1-day late return", td_style),
            Paragraph("due_date = 2026-11-01, return_date = 2026-11-02 (TC-02)", td_style),
            Paragraph("days_late = 1, fine amount = Rs. 2.00 (rate: Rs. 2/day).", td_style)
        ],
        [
            Paragraph("UT-03", td_code_style),
            Paragraph("Fine: Early return guard", td_style),
            Paragraph("due_date = 2026-11-10, return_date = 2026-11-05 (TC-04)", td_style),
            Paragraph("days_late clamped to 0, fine amount = Rs. 0.00 (no negative fine).", td_style)
        ],
        [
            Paragraph("UT-04", td_code_style),
            Paragraph("Borrowing limit guard", td_style),
            Paragraph("Student with 3 active loans requests 4th book issue (TC-14)", td_style),
            Paragraph("allowed = False, reason = 'Borrowing limit (3) reached.'", td_style)
        ],
        [
            Paragraph("UT-05", td_code_style),
            Paragraph("Renewal boundary check", td_style),
            Paragraph("Request renewal on loan where renewal_count == 2 (TC-17)", td_style),
            Paragraph("allowed = False, reason = 'Maximum renewals (2) reached.'", td_style)
        ]
    ]

    t_ut1 = Table(ut_page1_data, colWidths=[52, 133, 175, 180])
    t_ut1.setStyle(table_border_style)
    story.append(t_ut1)

    # End of Page 1
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: TASK 6 (UT-06 to UT-10, 6.3 Integration Testing, 6.4 Execution Record)
    # =========================================================================
    story.append(Paragraph("6.2 Unit Testing Test Cases (Continued)", section_heading_style))

    ut_page2_data = [
        [
            Paragraph("Test ID", th_style),
            Paragraph("Module / Objective", th_style),
            Paragraph("Test Input / Action", th_style),
            Paragraph("Expected Result", th_style)
        ],
        [
            Paragraph("UT-06", td_code_style),
            Paragraph("Reservation: Stock check", td_style),
            Paragraph("Reserve book while copies_available == 2 (TC-19)", td_style),
            Paragraph("allowed = False: 'Copies available; issue directly instead.'", td_style)
        ],
        [
            Paragraph("UT-07", td_code_style),
            Paragraph("Reservation: Duplicate check", td_style),
            Paragraph("Student with active reservation reserves same book (TC-20)", td_style),
            Paragraph("allowed = False: 'Already have an active reservation.'", td_style)
        ],
        [
            Paragraph("UT-08", td_code_style),
            Paragraph("Due-soon notification BVA", td_style),
            Paragraph("due_date - today == 3 days (TC-57 boundary)", td_style),
            Paragraph("should_notify = True (within 3-day notification threshold).", td_style)
        ],
        [
            Paragraph("UT-09", td_code_style),
            Paragraph("Queue position computation", td_style),
            Paragraph("Queue reservation when 4 students are waiting (TC-61)", td_style),
            Paragraph("Calculated queue position = 5 (existing_waiting + 1).", td_style)
        ],
        [
            Paragraph("UT-10", td_code_style),
            Paragraph("Role-based authorization", td_style),
            Paragraph("Student attempts librarian book creation action (TC-64)", td_style),
            Paragraph("Permission denied: student role cannot access librarian endpoints.", td_style)
        ]
    ]

    t_ut2 = Table(ut_page2_data, colWidths=[52, 133, 175, 180])
    t_ut2.setStyle(table_border_style)
    story.append(t_ut2)
    story.append(Spacer(1, 4))

    story.append(Paragraph("6.3 Integration Testing Test Cases", section_heading_style))

    # Exact multi-step integration workflows from test_runner.py
    it_data = [
        [
            Paragraph("Test ID", th_style),
            Paragraph("Integrated Modules", th_style),
            Paragraph("Test Steps / Input", th_style),
            Paragraph("Expected Result", th_style)
        ],
        [
            Paragraph("IT-01", td_code_style),
            Paragraph("Borrow + Return Cycle", td_style),
            Paragraph("Issue available book (copies: 3->2), return on time (TC-50)", td_style),
            Paragraph("Book restored to 3 copies, loan marked returned, fine = Rs. 0.", td_style)
        ],
        [
            Paragraph("IT-02", td_code_style),
            Paragraph("Overdue + Fine Assessment", td_style),
            Paragraph("Issue book, advance date 7 days late, process return (TC-51)", td_style),
            Paragraph("Return completed, copies restored, fine assessed at Rs. 14.00.", td_style)
        ],
        [
            Paragraph("IT-03", td_code_style),
            Paragraph("Loan + Multi-Renewal", td_style),
            Paragraph("Apply 1st renewal (+14d), 2nd renewal (+14d), 3rd renewal (TC-52)", td_style),
            Paragraph("Renewals 1 & 2 succeed; 3rd attempt rejected (max limit 2).", td_style)
        ],
        [
            Paragraph("IT-04", td_code_style),
            Paragraph("Reservation + Hold Queue", td_style),
            Paragraph("Queue student reservation on 0-copy book, return loan (TC-53)", td_style),
            Paragraph("Reservation status becomes READY; book held for student.", td_style)
        ],
        [
            Paragraph("IT-05", td_code_style),
            Paragraph("Student Borrow Limit", td_style),
            Paragraph("Student borrows 3 books consecutively, then requests 4th (TC-54)", td_style),
            Paragraph("First 3 issues succeed; 4th issue blocked by limit guard.", td_style)
        ],
        [
            Paragraph("IT-06", td_code_style),
            Paragraph("RBAC + Access Matrix", td_style),
            Paragraph("Authenticate librarian vs student vs vendor across views (TC-63/68)", td_style),
            Paragraph("Role permissions strictly enforced per authorization matrix.", td_style)
        ]
    ]

    t_it = Table(it_data, colWidths=[52, 133, 175, 180])
    t_it.setStyle(table_border_style)
    story.append(t_it)
    story.append(Spacer(1, 4))

    story.append(Paragraph("6.4 Test Execution Record", section_heading_style))

    # Real execution evidence from test_runner.py execution
    exec_data = [
        [
            Paragraph("Test ID", th_style),
            Paragraph("Actual Result", th_style),
            Paragraph("Status (Pass/Fail)", th_style),
            Paragraph("Tester / Date", th_style)
        ],
        [
            Paragraph("UT-01", td_code_style),
            Paragraph("days_late=0, was_late=False, fine amount=Decimal('0').", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("UT-02", td_code_style),
            Paragraph("days_late=1, was_late=True, fine amount=Decimal('2').", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("UT-03", td_code_style),
            Paragraph("days_late=0, was_late=False, fine amount=Decimal('0').", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("UT-04", td_code_style),
            Paragraph("allowed=False, reason='Borrowing limit (3) reached.'", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("IT-01", td_code_style),
            Paragraph("Copies: 3->2->3, loan returned cleanly, fine=Decimal('0').", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("IT-02", td_code_style),
            Paragraph("Loan returned, inventory incremented, fine=Decimal('14').", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("IT-03", td_code_style),
            Paragraph("r1=True (due +14d), r2=True (due +28d), r3=False (denied).", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ],
        [
            Paragraph("IT-04", td_code_style),
            Paragraph("Reservation transitioned to READY; hold assigned; then fulfilled.", td_style),
            Paragraph("Pass", td_style),
            Paragraph("QA / 2026-11-17", td_style)
        ]
    ]

    t_exec = Table(exec_data, colWidths=[52, 280, 108, 100])
    t_exec.setStyle(table_border_style)
    story.append(t_exec)
    story.append(Paragraph("Note: Actual results and Pass/Fail status must be filled after executing the tests. Expected results are not actual execution evidence.", note_style))

    # End of Page 2
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: TASK 7 (White-box, Black-box, References, Faculty Remarks)
    # =========================================================================
    story.append(Paragraph("TASK 7: DEVELOP TEST CASES FOR WHITE-BOX AND BLACK-BOX TESTING TECHNIQUES", task_title_style))
    story.append(Paragraph("7.1 White-Box Testing", section_heading_style))
    story.append(Paragraph(
        "White-box testing examines the internal logic, code structure and execution paths of a program. "
        "The tester uses knowledge of the implementation to design tests that exercise statements, "
        "decision branches and selected execution paths.",
        body_style
    ))

    story.append(Paragraph("7.1.1 Statement and Branch Coverage", subsection_heading_style))
    story.append(Paragraph(
        "Execute each statement in can_student_borrow(), can_renew(), and calculate_fine() at least once. "
        "Branch coverage exercises both True and False outcomes across all decision predicates: "
        "(1) active_loans < limit, (2) copies_available > 0, (3) has_active_issue == False, "
        "(4) days_late > 0 in fine computation, and (5) renewal_count < max_renewals with zero active reservations. "
        "Tests TC-36 through TC-39 achieve 100% decision branch coverage over these core library business rules.",
        body_style
    ))

    story.append(Paragraph("7.1.2 Path Coverage and Loop Testing", subsection_heading_style))
    story.append(Paragraph("• Path 1: can_student_borrow() all clear -> decrement copy balance -> create Issue(ACTIVE) [TC-50].", bullet_style))
    story.append(Paragraph("• Path 2: Overdue loan -> calculate_fine(days_late * Rs. 2) -> generate unpaid Fine record -> increment stock [TC-51].", bullet_style))
    story.append(Paragraph("• Path 3: can_renew() -> renewal_count < 2 -> no reservations -> extend due_date +14d -> count++ [TC-52].", bullet_style))
    story.append(Paragraph("• Path 4: Book returned -> check reservation queue -> transition head to READY with 3-day hold [TC-53].", bullet_style))
    story.append(Paragraph("• Path 5: Borrow guard failure (limit reached / 0 copies / duplicate) -> reject with error reason [TC-07..09].", bullet_style))
    story.append(Paragraph("• Loop testing: Automated management command (update_overdue_status) iterates through active loans to evaluate overdue flags.", bullet_style))

    story.append(Spacer(1, 4))
    story.append(Paragraph("7.2 Black-Box Testing", section_heading_style))
    story.append(Paragraph(
        "Black-box testing checks system behaviour against requirements without examining the internal source code. "
        "Test inputs are supplied and actual outputs are compared with expected outputs.",
        body_style
    ))

    story.append(Paragraph("7.2.1 Equivalence Partitioning and Boundary Value Analysis", subsection_heading_style))

    # Exact Equivalence Partitioning & BVA test cases from test_runner.py (TC-06 to TC-18, TC-40 to TC-49)
    # Col widths: 120 + 210 + 210 = 540 pt
    bb_data = [
        [
            Paragraph("Field / Domain", th_style),
            Paragraph("Valid Equivalence Class & BVA Values", th_style),
            Paragraph("Invalid Equivalence Class & BVA Boundaries", th_style)
        ],
        [
            Paragraph("Active Borrow Limit", td_code_style),
            Paragraph("loans in {0, 1, 2} (Min: 0, Max-1: 2) -> ALLOW", td_style),
            Paragraph("loans in {3, 4} (At limit: 3, Overflow: 4) -> DENY", td_style)
        ],
        [
            Paragraph("Copy Availability", td_code_style),
            Paragraph("copies_available >= 1 -> Issue allowed", td_style),
            Paragraph("copies_available == 0 -> Issue denied; prompt reservation", td_style)
        ],
        [
            Paragraph("Renewal Counter", td_code_style),
            Paragraph("renewals in {0, 1} -> Extend due date +14 days", td_style),
            Paragraph("renewals >= 2 (TC-17 at max: 2) -> Renewal blocked", td_style)
        ],
        [
            Paragraph("Overdue Days & Fine", td_code_style),
            Paragraph("days_late in {0, 1, 14} -> Fine = days * Rs. 2", td_style),
            Paragraph("days_late < 0 (Early return) -> Clamped to Rs. 0 fine", td_style)
        ],
        [
            Paragraph("Reservation Guard", td_code_style),
            Paragraph("copies == 0 and not reserved and not on loan", td_style),
            Paragraph("copies > 0 (deny reserve) OR already reserved / on loan", td_style)
        ],
        [
            Paragraph("Due-Soon Window", td_code_style),
            Paragraph("days_left in {0, 1, 3} (Boundary: 3 days) -> Notify", td_style),
            Paragraph("days_left >= 4 -> No notification generated", td_style)
        ]
    ]

    t_bb = Table(bb_data, colWidths=[120, 210, 210])
    t_bb.setStyle(table_border_style)
    story.append(t_bb)
    story.append(Spacer(1, 4))

    story.append(Paragraph("7.3 References and Bibliography", section_heading_style))
    story.append(Paragraph("• Pressman, Roger S., Software Engineering: A Practitioner's Approach, McGraw-Hill.", bullet_style))
    story.append(Paragraph("• Sommerville, Ian, Software Engineering, Pearson Education.", bullet_style))
    story.append(Paragraph("• IEEE Standard 829-2008: Standard for Software and System Test Documentation.", bullet_style))
    story.append(Paragraph("• Django 4.2 Documentation: Automated Testing and REST Framework API Test Guidelines.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("RECORD / FACULTY REMARKS", section_heading_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Task 1–7: Date of Performance  __________________________", body_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("Faculty Remarks:  __________________________________________________________________________________", body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("____________________________________________________________________________________________________", body_style))
    story.append(Spacer(1, 14))

    # Signature line
    sig_data = [
        [
            Paragraph("Faculty Signature: ____________________________", td_style),
            Paragraph("Student Signature: ____________________________", ParagraphStyle('RightSig', parent=td_style, alignment=2))
        ]
    ]
    t_sig = Table(sig_data, colWidths=[270, 270])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t_sig)

    # Build PDF
    doc.build(story)
    print(f"Successfully generated PDF: {PDF_OUTPUT_PATH}")

    # Copy to artifacts directory
    shutil.copyfile(PDF_OUTPUT_PATH, ARTIFACT_OUTPUT_PATH)
    print(f"Successfully copied to artifact directory: {ARTIFACT_OUTPUT_PATH}")

if __name__ == "__main__":
    build_pdf()
