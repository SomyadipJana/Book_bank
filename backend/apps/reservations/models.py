"""Book reservation model for queueing requests when copies are unavailable."""
from django.db import models
from django.utils import timezone


class Reservation(models.Model):
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting in Queue"
        READY = "ready", "Ready for Pickup"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELLED = "cancelled", "Cancelled"

    book = models.ForeignKey("books.Book", on_delete=models.CASCADE, related_name="reservations")
    student = models.ForeignKey("students.StudentProfile", on_delete=models.CASCADE, related_name="reservations")
    reserved_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)
    queue_position = models.PositiveIntegerField(default=1)
    notified_at = models.DateTimeField(null=True, blank=True)
    pickup_deadline = models.DateField(null=True, blank=True)
    pickup_location = models.CharField(max_length=255, default="Desk Bay 2 — Shelf R-04")

    class Meta:
        ordering = ["reserved_date", "id"]
        unique_together = ("book", "student", "status")

    def __str__(self):
        return f"Reservation of {self.book} by {self.student} [{self.status}]"

    @property
    def is_ready(self):
        return self.status == self.Status.READY
