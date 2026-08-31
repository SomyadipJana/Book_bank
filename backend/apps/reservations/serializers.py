from rest_framework import serializers
from apps.books.models import Book
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    """Matches the frontend Reservation item format."""
    accession = serializers.CharField(source="book.accession_number", read_only=True)
    title = serializers.CharField(source="book.title", read_only=True)
    author = serializers.CharField(source="book.author", read_only=True)
    category = serializers.CharField(source="book.category", read_only=True)
    reservedDate = serializers.DateField(source="reserved_date", read_only=True)
    pickupLocation = serializers.CharField(source="pickup_location", read_only=True)
    pickupDeadline = serializers.DateField(source="pickup_deadline", read_only=True)
    isReady = serializers.BooleanField(source="is_ready", read_only=True)
    studentName = serializers.CharField(source="student.user.full_name", read_only=True)
    studentEnrollment = serializers.CharField(source="student.enrollment_number", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "accession", "title", "author", "category",
            "reservedDate", "status", "queue_position", "pickupLocation",
            "pickupDeadline", "isReady", "studentName", "studentEnrollment",
            "book", "student"
        ]
        read_only_fields = ["id", "reserved_date", "queue_position", "status"]


class ReservationCreateSerializer(serializers.Serializer):
    accession = serializers.CharField()

    def validate_accession(self, value):
        try:
            return Book.objects.get(accession_number=value, is_active=True)
        except Book.DoesNotExist:
            raise serializers.ValidationError(f"Book with accession '{value}' not found.")
