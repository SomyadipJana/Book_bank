from django.contrib import admin
from .models import Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("accession_number", "title", "author", "category", "format", "total_copies", "available_copies", "is_active")
    list_filter = ("category", "format", "is_active")
    search_fields = ("title", "author", "isbn", "accession_number")
    ordering = ("title",)
