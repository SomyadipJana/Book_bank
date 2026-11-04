"""Django admin for returns."""
from django.contrib import admin
from .models import Return


@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ["id", "issue", "return_date", "was_late", "days_late", "returned_to"]
    list_filter = ["was_late"]
    search_fields = ["issue__book__title", "issue__student__enrollment_number"]

