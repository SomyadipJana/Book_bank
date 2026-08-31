from rest_framework import serializers
from apps.books.serializers import BookListSerializer
from .models import Issue


class IssueSerializer(serializers.ModelSerializer):
    """Serializer matching the frontend Loan shape."""
    accession = serializers.CharField(source="book.accession_number", read_only=True)
    title = serializers.CharField(source="book.title", read_only=True)
    author = serializers.CharField(source="book.author", read_only=True)
    category = serializers.CharField(source="book.category", read_only=True)
    format = serializers.CharField(source="book.format", read_only=True)
    borrowedDate = serializers.DateField(source="issue_date", read_only=True)
    dueDate = serializers.DateField(source="due_date", read_only=True)
    isOverdue = serializers.BooleanField(source="is_overdue", read_only=True)
    renewalsLeft = serializers.SerializerMethodField()

    def get_renewalsLeft(self, obj):
        from django.conf import settings
        return settings.MAX_RENEWALS - obj.renewal_count

    class Meta:
        model = Issue
        fields = [
            "id", "accession", "title", "author", "category", "format",
            "borrowedDate", "dueDate", "status", "isOverdue", "renewalsLeft",
            "renewal_count", "book", "student",
        ]
        read_only_fields = ["id", "issue_date", "status", "renewal_count"]


class IssueCreateSerializer(serializers.Serializer):
    accession = serializers.CharField()

    def validate_accession(self, value):
        from apps.books.models import Book
        try:
            return Book.objects.get(accession_number=value, is_active=True)
        except Book.DoesNotExist:
            raise serializers.ValidationError(f"Book with accession '{value}' not found.")
