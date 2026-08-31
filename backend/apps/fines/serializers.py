from rest_framework import serializers
from .models import Fine


class FineSerializer(serializers.ModelSerializer):
    """Matches the frontend Fines tab record."""
    accession = serializers.CharField(source="book.accession_number", read_only=True)
    title = serializers.CharField(source="book.title", read_only=True)
    studentName = serializers.CharField(source="student.user.full_name", read_only=True)
    studentEnrollment = serializers.CharField(source="student.enrollment_number", read_only=True)
    dueDate = serializers.DateField(source="due_date", read_only=True)
    returnDate = serializers.DateField(source="return_date", read_only=True)
    daysLate = serializers.IntegerField(source="days_late", read_only=True)
    paidAt = serializers.DateTimeField(source="paid_at", read_only=True)

    class Meta:
        model = Fine
        fields = [
            "id", "accession", "title", "studentName", "studentEnrollment",
            "dueDate", "returnDate", "daysLate", "amount", "status",
            "paidAt", "notes", "created_at"
        ]
        read_only_fields = ["id", "amount", "days_late", "created_at"]
