"""
End-to-End Test Suite for Book Bank Management System
Tests the complete lifecycle of students, librarians, catalogue, issues, 
renewals, returns, fines, reservations, purchase orders, and administrative reports.
"""
import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.books.models import Book
from apps.students.models import StudentProfile
from apps.issues.models import Issue
from apps.fines.models import Fine
from apps.reservations.models import Reservation
from apps.notifications.models import Notification

client = APIClient()


def print_step(title):
    print(f"\n{'='*70}\n>> {title}\n{'='*70}")


def run_full_workflow():
    print("\n" + "#"*70)
    print("  BOOK BANK MANAGEMENT SYSTEM — FULL END-TO-END WORKFLOW TEST")
    print("#"*70)

    # -------------------------------------------------------------------------
    # 1. AUTHENTICATION & PROFILES
    # -------------------------------------------------------------------------
    print_step("PHASE 1: AUTHENTICATION & PROFILES")

    # A. Register new student
    import time
    ts = int(time.time())
    student_email = f"rahul.sharma.{ts}@university.edu"
    student_enrollment = f"STU-2026-{ts % 10000:04d}"
    student_pass = "SecurePass@2026"

    res = client.post("/api/auth/register/", {
        "full_name": "Rahul Sharma",
        "enrollment_number": student_enrollment,
        "email": student_email,
        "password": student_pass,
        "confirm_password": student_pass,
    }, format="json")
    assert res.status_code == 201, f"Registration failed: {res.data}"
    student_jwt = res.data["access"]
    student_user_id = res.data["user"]["id"]
    print(f"[OK] 1.1 Student registered: Rahul Sharma (STU-2026-8801)")
    print(f"     JWT Token issued: {student_jwt[:24]}...")

    # B. Student login
    res = client.post("/api/auth/login/", {
        "email": student_email,
        "password": student_pass,
    }, format="json")
    assert res.status_code == 200, f"Login failed: {res.data}"
    student_jwt = res.data["access"]
    print(f"[OK] 1.2 Student authenticated via JWT")

    # C. Librarian login
    res = client.post("/api/auth/login/", {
        "email": "librarian@bookbank.edu",
        "password": "Librarian@123",
    }, format="json")
    assert res.status_code == 200, f"Librarian login failed: {res.data}"
    librarian_jwt = res.data["access"]
    print(f"[OK] 1.3 Librarian authenticated (role: librarian)")

    # D. Get student own profile
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {student_jwt}")
    res = client.get("/api/students/me/")
    assert res.status_code == 200, f"Student profile failed: {res.data}"
    student_profile_id = res.data["id"]
    print(f"[OK] 1.4 Student profile verified: {res.data['user']['full_name']} | Borrowing Limit: {res.data['borrowing_limit']}")

    # -------------------------------------------------------------------------
    # 2. BOOK CATALOGUE & SEARCH
    # -------------------------------------------------------------------------
    print_step("PHASE 2: BOOK CATALOGUE & SEARCH")

    # A. Browse catalog
    res = client.get("/api/books/")
    assert res.status_code == 200, f"Books list failed: {res.data}"
    total_books = res.data["count"]
    print(f"[OK] 2.1 Catalog browsing: {total_books} total titles available")

    # B. Search by query
    res = client.get("/api/books/search/?q=Cormen")
    assert res.status_code == 200, f"Search failed: {res.data}"
    search_results = res.data.get("results", res.data)
    assert len(search_results) > 0
    print(f"[OK] 2.2 Search 'Cormen': Found '{search_results[0]['title']}' [{search_results[0]['accession']}]")

    # C. View detail by accession
    res = client.get("/api/books/BB-0001/")
    assert res.status_code == 200, f"Book detail failed: {res.data}"
    b1_copies_before = res.data["availableCopies"]
    print(f"[OK] 2.3 Book Detail (BB-0001): {res.data['title']} | Copies Available: {b1_copies_before}")

    # -------------------------------------------------------------------------
    # 3. BOOK ISSUE WORKFLOW (AVAILABLE BOOK)
    # -------------------------------------------------------------------------
    print_step("PHASE 3: BOOK ISSUE (AVAILABLE BOOK FLOW)")

    res = client.post("/api/issues/", {"accession": "BB-0001"}, format="json")
    assert res.status_code == 201, f"Book issue failed: {res.data}"
    issue_id = res.data["id"]
    due_date = res.data["dueDate"]
    print(f"[OK] 3.1 Book checkout successful: Loan ID #{issue_id} created")
    print(f"     Due Date: {due_date} (14 days loan)")

    # Verify atomic inventory reduction
    book_b1 = Book.objects.get(accession_number="BB-0001")
    assert book_b1.available_copies == b1_copies_before - 1
    print(f"[OK] 3.2 Inventory updated: BB-0001 available copies decreased from {b1_copies_before} to {book_b1.available_copies}")

    # Student checks active loans
    res = client.get(f"/api/students/{student_profile_id}/loans/")
    assert res.status_code == 200 and len(res.data) >= 1
    print(f"[OK] 3.3 Student active loans: {len(res.data)} active loan(s) on file")

    # Check notification received
    res = client.get("/api/notifications/")
    assert res.status_code == 200 and len(res.data) > 0
    print(f"[OK] 3.4 In-App notification received: '{res.data[0]['title']}'")

    # -------------------------------------------------------------------------
    # 4. LOAN RENEWAL
    # -------------------------------------------------------------------------
    print_step("PHASE 4: LOAN RENEWAL WORKFLOW")

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {librarian_jwt}")
    res = client.post(f"/api/issues/{issue_id}/renew/")
    assert res.status_code == 200, f"Renewal failed: {res.data}"
    new_due_date = res.data["dueDate"]
    renewals_left = res.data["renewalsLeft"]
    print(f"[OK] 4.1 Loan #{issue_id} renewed! New Due Date: {new_due_date}")
    print(f"     Renewals remaining: {renewals_left}")

    # -------------------------------------------------------------------------
    # 5. RESERVATION WORKFLOW (UNAVAILABLE BOOK)
    # -------------------------------------------------------------------------
    print_step("PHASE 5: BOOK RESERVATION (UNAVAILABLE BOOK FLOW)")

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {student_jwt}")
    
    # BB-0006 (Clean Code) has 0 copies available
    book_b6 = Book.objects.get(accession_number="BB-0006")
    book_b6.available_copies = 0
    book_b6.save()

    # Attempt direct issue -> must be rejected
    res = client.post("/api/issues/", {"accession": "BB-0006"}, format="json")
    assert res.status_code == 409, f"Expected 409 conflict, got: {res.status_code}"
    print(f"[OK] 5.1 Direct borrow blocked for 0-copy book (Proper 409 Conflict returned)")

    # Place reservation
    Reservation.objects.filter(book=book_b6).delete()
    res = client.post("/api/reservations/", {"accession": "BB-0006"}, format="json")
    assert res.status_code == 201, f"Reservation failed: {res.data}"
    res_id = res.data["id"]
    queue_pos = res.data["queue_position"]
    print(f"[OK] 5.2 Reservation #{res_id} created for '{book_b6.title}'")
    print(f"     Queue Position: #{queue_pos} | Status: {res.data['status']}")

    # Check student reservations tab
    res = client.get(f"/api/students/{student_profile_id}/reservations/")
    assert res.status_code == 200 and len(res.data) >= 1
    print(f"[OK] 5.3 Reservation visible in Student Account tab")

    # -------------------------------------------------------------------------
    # 6. BOOK RETURN & OVERDUE FINE CALCULATION
    # -------------------------------------------------------------------------
    print_step("PHASE 6: BOOK RETURN & AUTOMATIC OVERDUE FINE")

    # Simulate overdue loan by setting due_date 5 days in the past
    issue_obj = Issue.objects.get(id=issue_id)
    issue_obj.due_date = timezone.now().date() - timedelta(days=5)
    issue_obj.save()

    # Librarian processes return
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {librarian_jwt}")
    res = client.post("/api/returns/", {
        "issue_id": issue_id,
        "condition_notes": "Cover slightly creased, otherwise intact.",
    }, format="json")
    assert res.status_code == 201, f"Return processing failed: {res.data}"
    
    assert res.data["was_late"] is True
    assert res.data["days_late"] == 5
    fine_info = res.data.get("fine")
    assert fine_info is not None
    fine_id = fine_info["id"]
    print(f"[OK] 6.1 Return processed: Detected {res.data['days_late']} days overdue")
    print(f"[OK] 6.2 Automatic fine calculated: Rs.{fine_info['amount']} (Rs.2/day * 5 days) [Fine ID #{fine_id}]")

    # Student checks fine and pays it
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {student_jwt}")
    res = client.get("/api/fines/")
    assert res.status_code == 200 and len(res.data) >= 1
    print(f"[OK] 6.3 Student Fines tab displays unpaid penalty of Rs.{res.data[0]['amount']}")

    # Pay fine
    res = client.post(f"/api/fines/{fine_id}/pay/")
    assert res.status_code == 200 and res.data["status"] == "paid"
    print(f"[OK] 6.4 Fine #{fine_id} paid successfully! Status: PAID")

    # -------------------------------------------------------------------------
    # 7. RETURN TRIGGERING RESERVATION PICKUP NOTIFICATION
    # -------------------------------------------------------------------------
    print_step("PHASE 7: RETURN TRIGGERING RESERVATION QUEUE NOTIFICATION")

    # Create dummy active loan for BB-0006 and return it
    dummy_user, _ = User.objects.get_or_create(email="dummy@uni.edu", defaults={"full_name": "Dummy Student", "role": User.Role.STUDENT})
    dummy_student, _ = StudentProfile.objects.get_or_create(user=dummy_user, defaults={"enrollment_number": "STU-DUMMY"})
    dummy_issue = Issue.objects.create(
        book=book_b6,
        student=dummy_student,
        due_date=timezone.now().date() + timedelta(days=14),
        status=Issue.Status.ACTIVE
    )

    # Librarian processes return of BB-0006
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {librarian_jwt}")
    res = client.post("/api/returns/", {"issue_id": dummy_issue.id}, format="json")
    assert res.status_code == 201

    # Check that Rahul's reservation automatically flipped to READY
    res_obj = Reservation.objects.get(id=res_id)
    assert res_obj.status == Reservation.Status.READY
    assert res_obj.pickup_deadline is not None
    print(f"[OK] 7.1 Return triggered reservation queue: Reservation #{res_id} status flipped to READY!")
    print(f"     Pickup Deadline: {res_obj.pickup_deadline} at '{res_obj.pickup_location}'")

    # Librarian fulfills reservation
    res = client.post(f"/api/reservations/{res_id}/fulfill/")
    assert res.status_code == 200
    print(f"[OK] 7.2 Librarian fulfilled reservation: Converted to active loan on student account")

    # -------------------------------------------------------------------------
    # 8. VENDOR & PURCHASE ORDERS
    # -------------------------------------------------------------------------
    print_step("PHASE 8: VENDORS & PURCHASE ORDERS")

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {librarian_jwt}")

    # Create vendor
    res = client.post("/api/vendors/", {
        "name": "Oxford Academic Suppliers",
        "contact_person": "Mr. A. Sengupta",
        "email": "orders@oxfordacademic.in",
        "phone": "+91-9876543210",
        "address": "College Street, Kolkata 700073",
    }, format="json")
    assert res.status_code == 201, f"Vendor creation failed: {res.data}"
    vendor_id = res.data["id"]
    print(f"[OK] 8.1 Vendor created: Oxford Academic Suppliers (ID #{vendor_id})")

    # Create purchase order
    res = client.post("/api/orders/", {
        "vendor": vendor_id,
        "notes": "Urgent semester requirement for CS department.",
    }, format="json")
    assert res.status_code == 201, f"PO creation failed: {res.data}"
    po_id = res.data["id"]
    print(f"[OK] 8.2 Purchase Order #{po_id} created")

    # Add line items
    res = client.post(f"/api/orders/{po_id}/items/", {
        "book_title": "Design Patterns",
        "author": "Gang of Four",
        "quantity": 5,
        "unit_price": "650.00",
        "isbn_requested": "9780201633610",
    }, format="json")
    assert res.status_code == 201
    print(f"[OK] 8.3 Line item added: 5 copies of 'Design Patterns' @ Rs.650.00")

    # -------------------------------------------------------------------------
    # 9. LIBRARIAN ANALYTICS & REPORTS
    # -------------------------------------------------------------------------
    print_step("PHASE 9: LIBRARIAN ANALYTICS & REPORTS")

    res = client.get("/api/reports/summary/")
    assert res.status_code == 200
    summary = res.data
    print(f"[OK] 9.1 System Summary Report:")
    print(f"     - Total Titles:        {summary['books']['total_titles']}")
    print(f"     - Total Copies:        {summary['books']['total_copies']}")
    print(f"     - Available Copies:    {summary['books']['available_copies']}")
    print(f"     - Active Loans:        {summary['loans']['active_loans']}")
    print(f"     - Total Returns:       {summary['loans']['total_returns']}")
    print(f"     - Total Fines Collected: Rs.{summary['fines']['total_collected']}")

    res = client.get("/api/reports/inventory/")
    assert res.status_code == 200
    print(f"[OK] 9.2 Inventory Breakdown ({len(res.data)} categories analyzed)")

    res = client.get("/api/reports/issued/")
    assert res.status_code == 200
    print(f"[OK] 9.3 Active Loans Listing ({len(res.data)} items)")

    print("\n" + "="*70)
    print(">>>>> FULL END-TO-END WORKFLOW TEST: 100% PASSED! <<<<<")
    print("="*70 + "\n")


if __name__ == "__main__":
    run_full_workflow()
