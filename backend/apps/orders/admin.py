"""Django admin for orders."""
from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ["id", "vendor", "created_by", "status", "order_date", "expected_date"]
    list_filter = ["status"]
    search_fields = ["vendor__name"]
    inlines = [PurchaseOrderItemInline]

