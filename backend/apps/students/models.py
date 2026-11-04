"""Student profile and document upload models."""
from django.db import models
from apps.accounts.models import User


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    enrollment_number = models.CharField(max_length=50, unique=True, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    department = models.CharField(max_length=255, blank=True)
    year_of_study = models.PositiveSmallIntegerField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    parent_name = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    state = models.CharField(max_length=100, blank=True)
    pin_code = models.CharField(max_length=10, blank=True)
    borrowing_limit = models.PositiveSmallIntegerField(default=3)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.full_name} ({self.enrollment_number})"

    @property
    def active_loans_count(self):
        return self.issues.filter(status="active").count()

    @property
    def can_borrow(self):
        return self.active_loans_count < self.borrowing_limit

    @property
    def total_unpaid_fines(self):
        from django.db.models import Sum
        result = self.fines.filter(status="unpaid").aggregate(total=Sum("amount"))
        return result["total"] or 0


class Document(models.Model):
    """Student verification documents (uploaded files)."""

    class DocType(models.TextChoices):
        ID_CARD = "id_card", "ID Card"
        ENROLLMENT_PROOF = "enrollment_proof", "Enrollment Proof"
        ADDRESS_PROOF = "address_proof", "Address Proof"
        OTHER = "other", "Other"

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=30, choices=DocType.choices, default=DocType.OTHER)
    file = models.FileField(upload_to="documents/%Y/%m/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    notes = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.student} — {self.document_type}"

