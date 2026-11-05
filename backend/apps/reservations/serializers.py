"""Reservation serializers."""
from rest_framework import serializers
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_accession = serializers.CharField(source="book.accession_number", read_only=True)
    student_name = serializers.CharField(source="student.user.full_name", read_only=True)
    student_enrollment = serializers.CharField(source="student.enrollment_number", read_only=True)
    is_ready = serializers.BooleanField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "book", "book_title", "book_accession",
            "student", "student_name", "student_enrollment",
            "reserved_date", "status", "queue_position",
            "notified_at", "pickup_deadline", "pickup_location",
            "is_ready",
        ]
        read_only_fields = ["id", "reserved_date", "queue_position", "notified_at"]


class ReservationCreateSerializer(serializers.Serializer):
    """Input for creating a reservation."""
    accession = serializers.CharField()

    def validate_accession(self, value):
        from apps.books.models import Book
        try:
            return Book.objects.get(accession_number=value, is_active=True)
        except Book.DoesNotExist:
            raise serializers.ValidationError(f"Book with accession '{value}' not found.")

