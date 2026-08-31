from django.contrib import admin
from .models import Issue

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ("book", "student", "issue_date", "due_date", "status", "renewal_count")
    list_filter = ("status",)
    search_fields = ("book__title", "student__user__full_name", "student__enrollment_number")
    ordering = ("-issue_date",)
