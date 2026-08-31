from rest_framework import serializers
from apps.vendors.serializers import VendorSerializer
from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ["id", "order", "book_title", "author", "quantity", "unit_price", "isbn_requested", "notes"]
        read_only_fields = ["id"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    total_items = serializers.IntegerField(source="total_items_count", read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id", "vendor", "vendor_name", "created_by", "created_by_name",
            "status", "order_date", "expected_date", "notes", "items", "total_items"
        ]
        read_only_fields = ["id", "order_date", "created_by"]
