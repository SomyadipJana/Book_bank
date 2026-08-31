from django.contrib import admin
from .models import Fine

@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ("student", "book", "amount", "days_late", "status", "due_date", "return_date")
    list_filter = ("status",)
    search_fields = ("student__user__full_name", "student__enrollment_number", "book__title")
