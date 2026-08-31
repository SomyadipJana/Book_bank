from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import StudentProfile, Document


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    active_loans_count = serializers.IntegerField(read_only=True)
    can_borrow = serializers.BooleanField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "enrollment_number", "date_of_birth",
            "department", "year_of_study", "phone", "parent_name",
            "address", "state", "pin_code", "borrowing_limit",
            "is_active", "active_loans_count", "can_borrow",
        ]
        read_only_fields = ["id", "enrollment_number"]


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["id", "document_type", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]
