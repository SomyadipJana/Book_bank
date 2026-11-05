"""Purchase order models for procuring books from vendors."""
from django.db import models
from apps.accounts.models import User
from apps.vendors.models import Vendor


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed by Vendor"
        SUPPLIED = "supplied", "Supplied"
        COMPLETED = "completed", "Completed / Added to Inventory"

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="purchase_orders")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    order_date = models.DateField(auto_now_add=True)
    expected_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-order_date", "-id"]

    def __str__(self):
        return f"PO #{self.id} — {self.vendor.name} [{self.status}]"

    @property
    def total_items_count(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_value(self):
        total = sum(
            (item.unit_price or 0) * item.quantity
            for item in self.items.all()
        )
        return total


class PurchaseOrderItem(models.Model):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    book_title = models.CharField(max_length=512)
    author = models.CharField(max_length=512, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    isbn_requested = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.book_title} x {self.quantity} (PO #{self.order.id})"

