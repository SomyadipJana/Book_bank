from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "vendor", "status", "order_date", "expected_date", "created_by")
    list_filter = ("status", "order_date")
    search_fields = ("vendor__name",)
    inlines = [PurchaseOrderItemInline]
