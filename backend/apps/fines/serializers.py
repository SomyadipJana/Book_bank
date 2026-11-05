"""Fine serializers."""
from rest_framework import serializers
from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_enrollment = serializers.CharField(source="student.enrollment_number", read_only=True)
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_accession = serializers.CharField(source="book.accession_number", read_only=True)

    class Meta:
        model = Fine
        fields = [
            "id", "issue",
            "student", "student_name", "student_enrollment",
            "book", "book_title", "book_accession",
            "due_date", "return_date", "days_late",
            "amount", "status", "paid_at", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at", "paid_at"]

