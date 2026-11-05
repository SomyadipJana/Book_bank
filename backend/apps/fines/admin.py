"""Django admin for fines."""
from django.contrib import admin
from .models import Fine


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ["id", "student", "book", "amount", "days_late", "status", "created_at"]
    list_filter = ["status"]
    search_fields = ["student__enrollment_number", "student__user__full_name", "book__title"]

