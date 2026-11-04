"""Book catalogue serializers."""
from rest_framework import serializers
from .models import Book


class BookListSerializer(serializers.ModelSerializer):
    """Compact serializer for catalogue list — matches frontend data shape."""
    accession = serializers.CharField(source="accession_number")
    addedDate = serializers.DateField(source="added_date")
    totalCopies = serializers.IntegerField(source="total_copies")
    availableCopies = serializers.IntegerField(source="available_copies")
    available = serializers.BooleanField()

    class Meta:
        model = Book
        fields = [
            "id", "accession", "title", "author", "category", "format",
            "isbn", "edition", "publisher", "addedDate",
            "totalCopies", "availableCopies", "available", "cover_url",
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    """Full serializer for book detail page."""
    accession = serializers.CharField(source="accession_number")
    addedDate = serializers.DateField(source="added_date")
    totalCopies = serializers.IntegerField(source="total_copies")
    availableCopies = serializers.IntegerField(source="available_copies")
    available = serializers.BooleanField()

    class Meta:
        model = Book
        fields = [
            "id", "accession", "title", "author", "category", "format",
            "isbn", "edition", "publisher", "description",
            "addedDate", "totalCopies", "availableCopies", "available",
            "vendor", "price", "purchase_date", "cover_url",
        ]


class BookCreateUpdateSerializer(serializers.ModelSerializer):
    """Write serializer for librarian CRUD."""
    class Meta:
        model = Book
        fields = [
            "accession_number", "title", "author", "isbn", "edition",
            "publisher", "category", "format", "description",
            "total_copies", "available_copies", "vendor",
            "price", "purchase_date", "cover_url", "is_active",
        ]

    def validate(self, data):
        total = data.get("total_copies", getattr(self.instance, "total_copies", 1))
        available = data.get("available_copies", getattr(self.instance, "available_copies", 1))
        if available > total:
            raise serializers.ValidationError(
                {"available_copies": "Available copies cannot exceed total copies."}
            )
        return data

