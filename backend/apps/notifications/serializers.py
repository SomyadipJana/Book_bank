"""Notification serializers."""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="related_book.title", read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = [
            "id", "notification_type", "title", "message",
            "is_read", "created_at", "related_book", "book_title",
        ]
        read_only_fields = ["id", "created_at"]

