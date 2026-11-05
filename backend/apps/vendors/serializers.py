"""Vendor serializers."""
from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ["id", "name", "contact_person", "email", "phone", "address", "is_active", "notes", "created_at"]
        read_only_fields = ["id", "created_at"]

