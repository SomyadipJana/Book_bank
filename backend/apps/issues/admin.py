"""Django admin for issues."""
from django.contrib import admin
from .models import Issue


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ["id", "book", "student", "issue_date", "due_date", "status", "renewal_count"]
    list_filter = ["status"]
    search_fields = ["book__title", "book__accession_number", "student__enrollment_number", "student__user__full_name"]
    ordering = ["-issue_date"]

