"""Issue serializers."""
from rest_framework import serializers
from .models import Issue
from apps.books.serializers import BookListSerializer
from apps.students.serializers import StudentProfileSerializer


class IssueSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_accession = serializers.CharField(source="book.accession_number", read_only=True)
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_enrollment = serializers.CharField(source="student.enrollment_number", read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = Issue
        fields = [
            "id", "book", "book_title", "book_accession",
            "student", "student_name", "student_enrollment",
            "issued_by", "issue_date", "due_date",
            "status", "renewal_count", "is_overdue", "days_remaining",
        ]
        read_only_fields = ["id", "issue_date", "issued_by"]


class IssueCreateSerializer(serializers.Serializer):
    """Input serializer for creating an issue (student checkout request)."""
    accession = serializers.CharField()

    def validate_accession(self, value):
        from apps.books.models import Book
        try:
            book = Book.objects.get(accession_number=value, is_active=True)
        except Book.DoesNotExist:
            raise serializers.ValidationError(f"Book with accession '{value}' not found.")
        return book

