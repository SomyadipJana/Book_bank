import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.books.models import Book
from apps.students.models import StudentProfile

client = APIClient()

print("--- STARTING BACKEND API VERIFICATION SUITE ---")

# 1. Test Login
res = client.post("/api/auth/login/", {"email": "librarian@bookbank.edu", "password": "Librarian@123"}, format="json")
assert res.status_code == 200, f"Login failed: {res.data}"
token = res.data["access"]
print("[OK] Librarian login successful")

# 2. Test Student Registration
res = client.post("/api/auth/register/", {
    "full_name": "Test Student",
    "enrollment_number": "STU-2026-001",
    "email": "student1@university.edu",
    "password": "Password@123",
    "confirm_password": "Password@123"
}, format="json")
assert res.status_code == 201, f"Registration failed: {res.data}"
student_token = res.data["access"]
print("[OK] Student registration & JWT issuance successful")

# 3. Test Books list
client.credentials(HTTP_AUTHORIZATION=f"Bearer {student_token}")
res = client.get("/api/books/")
assert res.status_code == 200 and len(res.data["results"]) > 0, f"Books list failed: {res.data}"
print(f"[OK] Books catalog endpoint returned {len(res.data['results'])} items")

# 4. Test Book Detail
res = client.get("/api/books/BB-0001/")
assert res.status_code == 200 and res.data["accession"] == "BB-0001", f"Book detail failed: {res.data}"
print("[OK] Book detail endpoint (BB-0001) successful")

# 5. Test Book Search
res = client.get("/api/books/search/?q=algorithms")
assert res.status_code == 200, f"Book search failed: {res.data}"
print("[OK] Book search endpoint successful")

# 6. Test Book Issue
res = client.post("/api/issues/", {"accession": "BB-0001"}, format="json")
assert res.status_code == 201, f"Issue request failed: {res.data}"
issue_id = res.data["id"]
print(f"[OK] Book issue request created (Issue #{issue_id})")

# 7. Test Student Profile & Loans
res = client.get("/api/students/me/")
assert res.status_code == 200, f"Student profile failed: {res.data}"
student_id = res.data["id"]
res = client.get(f"/api/students/{student_id}/loans/")
assert res.status_code == 200 and len(res.data) == 1, f"Student loans failed: {res.data}"
print("[OK] Student loans list verified")

# 8. Test Book Return (Librarian)
client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
res = client.post("/api/returns/", {"issue_id": issue_id, "condition_notes": "Good condition"}, format="json")
assert res.status_code == 201, f"Return processing failed: {res.data}"
print("[OK] Return processing successful")

# 9. Test Summary Report
res = client.get("/api/reports/summary/")
assert res.status_code == 200, f"Summary report failed: {res.data}"
print("[OK] Librarian reports summary endpoint successful")

print("\n>>> ALL API ENDPOINTS VERIFIED AND WORKING 100%! <<<")
