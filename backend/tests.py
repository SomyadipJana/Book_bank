"""
Comprehensive Django TestCase test suite for the Book Bank API.

Run with:
    cd backend
    pytest                          # all tests
    pytest tests.py -v              # verbose
    pytest tests.py -k "test_auth"  # filter by name
"""
from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User
from apps.students.models import StudentProfile
from apps.books.models import Book
from apps.issues.models import Issue
from apps.fines.models import Fine
from apps.reservations.models import Reservation
from apps.vendors.models import Vendor


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_librarian(email="lib@test.com", password="Library@123"):
    return User.objects.create_superuser(email=email, password=password, full_name="Test Librarian")


def make_student(email="student@test.com", password="Student@123", enrollment="TEST001"):
    user = User.objects.create_user(email=email, password=password, full_name="Test Student", role="student")
    profile = StudentProfile.objects.create(user=user, enrollment_number=enrollment)
    return user, profile


def make_book(**kwargs):
    defaults = {
        "accession_number": "BB-TEST1",
        "title": "Test Book",
        "author": "Test Author",
        "category": "Computer Science",
        "total_copies": 3,
        "available_copies": 3,
    }
    defaults.update(kwargs)
    return Book.objects.create(**defaults)


def get_tokens(client, email, password):
    resp = client.post("/api/auth/login/", {"email": email, "password": password}, format="json")
    return resp.data.get("access"), resp.data.get("refresh")


def auth(client, token):
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


# ─────────────────────────────────────────────────────────────────────────────
# 1. Authentication Tests
# ─────────────────────────────────────────────────────────────────────────────

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_student(self):
        resp = self.client.post("/api/auth/register/", {
            "full_name": "New Student",
            "enrollment_number": "ENR001",
            "email": "new@test.com",
            "password": "Password@123",
            "confirm_password": "Password@123",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)
        self.assertEqual(resp.data["user"]["role"], "student")

    def test_register_duplicate_email(self):
        make_student()
        resp = self.client.post("/api/auth/register/", {
            "full_name": "Another",
            "enrollment_number": "ENR002",
            "email": "student@test.com",
            "password": "Password@123",
            "confirm_password": "Password@123",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        resp = self.client.post("/api/auth/register/", {
            "full_name": "Fail",
            "enrollment_number": "ENR003",
            "email": "fail@test.com",
            "password": "Password@123",
            "confirm_password": "WrongPass",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        make_librarian()
        resp = self.client.post("/api/auth/login/", {
            "email": "lib@test.com", "password": "Library@123"
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)

    def test_login_wrong_password(self):
        make_librarian()
        resp = self.client.post("/api/auth/login/", {
            "email": "lib@test.com", "password": "wrong"
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_requires_auth(self):
        resp = self.client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_user(self):
        make_librarian()
        token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        auth(self.client, token)
        resp = self.client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["email"], "lib@test.com")

    def test_logout_blacklists_token(self):
        make_librarian()
        access, refresh = get_tokens(self.client, "lib@test.com", "Library@123")
        auth(self.client, access)
        resp = self.client.post("/api/auth/logout/", {"refresh": refresh}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_change_password(self):
        make_librarian()
        access, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        auth(self.client, access)
        resp = self.client.post("/api/auth/change-password/", {
            "old_password": "Library@123",
            "new_password": "NewPass@456",
            "confirm_new_password": "NewPass@456",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Book Catalogue Tests
# ─────────────────────────────────────────────────────────────────────────────

class BookTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def test_list_books_authenticated(self):
        make_book()
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/books/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_books_unauthenticated(self):
        resp = self.client.get("/api/books/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_book_as_librarian(self):
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/books/", {
            "accession_number": "BB-NEW1",
            "title": "New Book",
            "author": "Some Author",
            "category": "Fiction",
            "total_copies": 2,
            "available_copies": 2,
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_book_as_student_forbidden(self):
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/books/", {
            "accession_number": "BB-NEW2",
            "title": "Forbidden",
            "author": "Auth",
            "category": "Fiction",
            "total_copies": 1,
            "available_copies": 1,
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_search_books(self):
        make_book(title="Python Programming", accession_number="BB-PY01")
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/books/search/?q=Python")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_soft_delete_book(self):
        book = make_book()
        auth(self.client, self.lib_token)
        resp = self.client.delete(f"/api/books/{book.accession_number}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        book.refresh_from_db()
        self.assertFalse(book.is_active)

    def test_get_categories(self):
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/books/categories/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)


# ─────────────────────────────────────────────────────────────────────────────
# 3. Issue / Checkout Tests
# ─────────────────────────────────────────────────────────────────────────────

class IssueTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.book = make_book()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def test_student_can_checkout_book(self):
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/issues/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 2)

    def test_checkout_unavailable_book(self):
        self.book.available_copies = 0
        self.book.save()
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/issues/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_duplicate_checkout_prevented(self):
        auth(self.client, self.stu_token)
        self.client.post("/api/issues/", {"accession": self.book.accession_number}, format="json")
        resp = self.client.post("/api/issues/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_librarian_cannot_checkout(self):
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/issues/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_renew_issue(self):
        auth(self.client, self.stu_token)
        issue_resp = self.client.post("/api/issues/", {"accession": self.book.accession_number}, format="json")
        issue_id = issue_resp.data["id"]
        old_due = issue_resp.data["due_date"]
        resp = self.client.post(f"/api/issues/{issue_id}/renew/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertNotEqual(resp.data["due_date"], old_due)
        self.assertEqual(resp.data["renewal_count"], 1)

    def test_borrowing_limit_enforced(self):
        """Student can't borrow more than their limit (default=3)."""
        books = [make_book(accession_number=f"BB-LIM{i}", title=f"Book {i}") for i in range(3)]
        auth(self.client, self.stu_token)
        for b in books:
            self.client.post("/api/issues/", {"accession": b.accession_number}, format="json")
        extra = make_book(accession_number="BB-EXTRA", title="Extra Book")
        resp = self.client.post("/api/issues/", {"accession": extra.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_mark_overdue(self):
        issue = Issue.objects.create(
            book=self.book,
            student=self.student,
            due_date=date.today() - timedelta(days=5),
            status=Issue.Status.ACTIVE,
        )
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/issues/mark-overdue/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        issue.refresh_from_db()
        self.assertEqual(issue.status, Issue.Status.OVERDUE)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Return Tests
# ─────────────────────────────────────────────────────────────────────────────

class ReturnTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.book = make_book()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def _issue_book(self, overdue=False):
        due = date.today() - timedelta(days=5) if overdue else date.today() + timedelta(days=10)
        return Issue.objects.create(
            book=self.book,
            student=self.student,
            due_date=due,
            status=Issue.Status.ACTIVE,
        )

    def test_on_time_return(self):
        issue = self._issue_book()
        self.book.available_copies -= 1
        self.book.save()
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/returns/", {"issue_id": issue.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("fine", resp.data)
        self.book.refresh_from_db()
        self.assertEqual(self.book.available_copies, 3)

    def test_late_return_creates_fine(self):
        issue = self._issue_book(overdue=True)
        self.book.available_copies -= 1
        self.book.save()
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/returns/", {"issue_id": issue.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("fine", resp.data)
        self.assertGreater(float(resp.data["fine"]["amount"]), 0)

    def test_student_cannot_process_return(self):
        issue = self._issue_book()
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/returns/", {"issue_id": issue.id}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Reservation Tests
# ─────────────────────────────────────────────────────────────────────────────

class ReservationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.book = make_book(available_copies=0)  # No copies available
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def test_student_can_reserve_unavailable_book(self):
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/reservations/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "waiting")

    def test_cannot_reserve_available_book(self):
        self.book.available_copies = 2
        self.book.save()
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/reservations/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_duplicate_reservation_prevented(self):
        auth(self.client, self.stu_token)
        self.client.post("/api/reservations/", {"accession": self.book.accession_number}, format="json")
        resp = self.client.post("/api/reservations/", {"accession": self.book.accession_number}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)

    def test_cancel_reservation(self):
        auth(self.client, self.stu_token)
        res_resp = self.client.post("/api/reservations/", {"accession": self.book.accession_number}, format="json")
        res_id = res_resp.data["id"]
        resp = self.client.put(f"/api/reservations/{res_id}/cancel/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_return_triggers_reservation_ready(self):
        """When a book is returned, the first waiting reservation should become READY."""
        issue = Issue.objects.create(
            book=self.book,
            student=self.student,
            due_date=date.today() + timedelta(days=5),
            status=Issue.Status.ACTIVE,
        )
        reservation = Reservation.objects.create(
            book=self.book,
            student=self.student,
            status=Reservation.Status.WAITING,
            queue_position=1,
        )
        auth(self.client, self.lib_token)
        self.client.post("/api/returns/", {"issue_id": issue.id}, format="json")
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, Reservation.Status.READY)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Fine Tests
# ─────────────────────────────────────────────────────────────────────────────

class FineTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.book = make_book()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def _make_fine(self, amount=10, fine_status=Fine.Status.UNPAID):
        issue = Issue.objects.create(
            book=self.book,
            student=self.student,
            due_date=date.today() - timedelta(days=5),
            status=Issue.Status.RETURNED,
        )
        return Fine.objects.create(
            issue=issue,
            student=self.student,
            book=self.book,
            due_date=date.today() - timedelta(days=5),
            return_date=date.today(),
            days_late=5,
            amount=amount,
            status=fine_status,
        )

    def test_list_fines_as_student(self):
        self._make_fine()
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/fines/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_pay_fine(self):
        fine = self._make_fine()
        auth(self.client, self.lib_token)
        resp = self.client.post(f"/api/fines/{fine.id}/pay/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        fine.refresh_from_db()
        self.assertEqual(fine.status, Fine.Status.PAID)

    def test_waive_fine(self):
        fine = self._make_fine()
        auth(self.client, self.lib_token)
        resp = self.client.post(f"/api/fines/{fine.id}/waive/", {"notes": "Waived as goodwill."}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        fine.refresh_from_db()
        self.assertEqual(fine.status, Fine.Status.WAIVED)

    def test_cannot_pay_already_paid_fine(self):
        fine = self._make_fine(fine_status=Fine.Status.PAID)
        auth(self.client, self.lib_token)
        resp = self.client.post(f"/api/fines/{fine.id}/pay/")
        self.assertEqual(resp.status_code, status.HTTP_409_CONFLICT)


# ─────────────────────────────────────────────────────────────────────────────
# 7. Report Tests
# ─────────────────────────────────────────────────────────────────────────────

class ReportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def test_summary_report_librarian(self):
        auth(self.client, self.lib_token)
        resp = self.client.get("/api/reports/summary/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("books", resp.data)
        self.assertIn("loans", resp.data)
        self.assertIn("fines", resp.data)

    def test_summary_report_student_forbidden(self):
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/reports/summary/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_inventory_report(self):
        make_book()
        auth(self.client, self.lib_token)
        resp = self.client.get("/api/reports/inventory/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_overdue_report(self):
        auth(self.client, self.lib_token)
        resp = self.client.get("/api/reports/overdue/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# 8. Vendor & Order Tests
# ─────────────────────────────────────────────────────────────────────────────

class VendorOrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def test_create_vendor(self):
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/vendors/", {
            "name": "Test Vendor",
            "email": "vendor@test.com",
            "phone": "9876543210",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_student_cannot_create_vendor(self):
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/vendors/", {"name": "Hack"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_order(self):
        vendor = Vendor.objects.create(name="V1", email="v1@test.com")
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/orders/", {
            "vendor": vendor.id,
            "notes": "Urgent order",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_add_item_to_order(self):
        vendor = Vendor.objects.create(name="V2", email="v2@test.com")
        auth(self.client, self.lib_token)
        order_resp = self.client.post("/api/orders/", {"vendor": vendor.id}, format="json")
        order_id = order_resp.data["id"]
        resp = self.client.post(f"/api/orders/{order_id}/items/", {
            "book_title": "New Book to Order",
            "author": "Some Author",
            "quantity": 5,
            "unit_price": "450.00",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# 9. Notification Tests
# ─────────────────────────────────────────────────────────────────────────────

class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")
        from apps.notifications.models import send_notification
        send_notification(self.student_user, "other", "Hello", "Test notification")

    def test_list_own_notifications(self):
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/notifications/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_mark_notification_read(self):
        auth(self.client, self.stu_token)
        notifs = self.client.get("/api/notifications/").data
        notif_id = notifs[0]["id"]
        resp = self.client.put(f"/api/notifications/{notif_id}/read/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data["is_read"])

    def test_mark_all_read(self):
        from apps.notifications.models import send_notification
        send_notification(self.student_user, "other", "Hello 2", "Another notification")
        auth(self.client, self.stu_token)
        resp = self.client.post("/api/notifications/mark-all-read/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# 10. Student Profile Tests
# ─────────────────────────────────────────────────────────────────────────────

class StudentProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.librarian = make_librarian()
        self.student_user, self.student = make_student()
        self.lib_token, _ = get_tokens(self.client, "lib@test.com", "Library@123")
        self.stu_token, _ = get_tokens(self.client, "student@test.com", "Student@123")

    def test_student_me_endpoint(self):
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/students/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["enrollment_number"], "TEST001")

    def test_librarian_sees_all_students(self):
        auth(self.client, self.lib_token)
        resp = self.client.get("/api/students/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_student_sees_only_own(self):
        auth(self.client, self.stu_token)
        resp = self.client.get("/api/students/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_create_vendor_user_as_librarian(self):
        auth(self.client, self.lib_token)
        resp = self.client.post("/api/auth/create-vendor/", {
            "email": "newvendor@test.com",
            "full_name": "Test Vendor Co.",
            "password": "Vendor@123",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["user"]["role"], "vendor")

