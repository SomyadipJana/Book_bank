from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("book", "student", "reserved_date", "status", "queue_position", "pickup_deadline")
    list_filter = ("status", "reserved_date")
    search_fields = ("book__title", "student__user__full_name", "student__enrollment_number")
