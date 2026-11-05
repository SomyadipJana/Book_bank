"""Django admin for reservations."""
from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ["id", "book", "student", "reserved_date", "status", "queue_position", "pickup_deadline"]
    list_filter = ["status"]
    search_fields = ["book__title", "student__enrollment_number"]

