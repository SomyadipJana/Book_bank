"""Fine records for overdue book returns."""
from django.db import models


class Fine(models.Model):
    class Status(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        WAIVED = "waived", "Waived"

    issue = models.OneToOneField(
        "issues.Issue", on_delete=models.SET_NULL, null=True, blank=True, related_name="fine"
    )
    student = models.ForeignKey("students.StudentProfile", on_delete=models.CASCADE, related_name="fines")
    book = models.ForeignKey("books.Book", on_delete=models.CASCADE, related_name="fines")
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    days_late = models.PositiveIntegerField(default=0)
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    paid_at = models.DateTimeField(null=True, blank=True)
    waived_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="waived_fines"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Fine: ₹{self.amount} for {self.student} on {self.book} [{self.status}]"

