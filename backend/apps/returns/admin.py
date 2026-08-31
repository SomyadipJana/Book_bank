from django.contrib import admin
from .models import Return

@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ("issue", "returned_to", "return_date", "was_late", "days_late")
    list_filter = ("was_late", "return_date")
    search_fields = ("issue__book__title", "issue__student__user__full_name", "issue__student__enrollment_number")
