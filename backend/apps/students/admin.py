from django.contrib import admin
from .models import StudentProfile, Document

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("enrollment_number", "user", "department", "year_of_study", "borrowing_limit", "is_active")
    search_fields = ("enrollment_number", "user__full_name", "user__email")
    list_filter = ("is_active", "department")

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("student", "document_type", "uploaded_at")
