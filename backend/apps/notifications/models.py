"""In-app notification model and helper."""
from django.db import models
from apps.accounts.models import User


class Notification(models.Model):
    class Type(models.TextChoices):
        ISSUE_APPROVED = "issue_approved", "Issue Approved"
        BOOK_ISSUED = "book_issued", "Book Issued"
        DUE_SOON = "due_soon", "Due Soon"
        OVERDUE = "overdue", "Overdue"
        RESERVATION_READY = "reservation_ready", "Reservation Ready"
        RETURN_CONFIRMED = "return_confirmed", "Return Confirmed"
        FINE_RAISED = "fine_raised", "Fine Raised"
        ORDER_UPDATE = "order_update", "Order Update"
        OTHER = "other", "Other"

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=Type.choices, default=Type.OTHER)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_book = models.ForeignKey(
        "books.Book", on_delete=models.SET_NULL, null=True, blank=True, related_name="notifications"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.recipient} — {self.title}"


def send_notification(recipient, notification_type, title, message, related_book=None):
    """Helper: create an in-app notification record."""
    Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_book=related_book,
    )

