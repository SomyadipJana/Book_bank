"""Book issue (checkout) model."""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class Issue(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        RETURNED = "returned", "Returned"
        OVERDUE = "overdue", "Overdue"

    book = models.ForeignKey("books.Book", on_delete=models.PROTECT, related_name="issues")
    student = models.ForeignKey("students.StudentProfile", on_delete=models.PROTECT, related_name="issues")
    issued_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="issued_books"
    )
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    renewal_count = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-issue_date"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.due_date:
            self.due_date = timezone.now().date() + timedelta(days=settings.LOAN_DURATION_DAYS)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} → {self.book} [{self.status}]"

    @property
    def is_overdue(self):
        return self.status == self.Status.ACTIVE and timezone.now().date() > self.due_date

    @property
    def days_remaining(self):
        return (self.due_date - timezone.now().date()).days

