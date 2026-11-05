"""Serializers for student profiles and documents."""
from rest_framework import serializers
from .models import StudentProfile, Document
from apps.accounts.serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "document_type", "file", "uploaded_at", "notes"]
        read_only_fields = ["id", "uploaded_at"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    active_loans_count = serializers.IntegerField(read_only=True)
    can_borrow = serializers.BooleanField(read_only=True)
    total_unpaid_fines = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "enrollment_number",
            "date_of_birth", "department", "year_of_study",
            "phone", "parent_name", "address", "state", "pin_code",
            "borrowing_limit", "is_active",
            "active_loans_count", "can_borrow", "total_unpaid_fines",
        ]
        read_only_fields = ["id", "enrollment_number", "borrowing_limit"]


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Used when a student updates their own profile."""
    class Meta:
        model = StudentProfile
        fields = [
            "date_of_birth", "department", "year_of_study",
            "phone", "parent_name", "address", "state", "pin_code",
        ]

