"""Purchase order views."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian, IsLibrarianOrVendor
from apps.notifications.models import send_notification
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderCreateSerializer, PurchaseOrderItemSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def order_list_create(request):
    """
    GET  — Librarian: all orders. Vendor: own orders.
    POST — Librarian creates a purchase order.
    """
    user = request.user

    if request.method == "GET":
        if user.role == "librarian":
            qs = PurchaseOrder.objects.prefetch_related("items").select_related("vendor", "created_by").all()
        elif user.role == "vendor":
            qs = PurchaseOrder.objects.prefetch_related("items").select_related("vendor", "created_by").filter(
                vendor__email=user.email
            )
        else:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        return Response(PurchaseOrderSerializer(qs, many=True).data)

    # POST — librarian only
    if user.role != "librarian":
        return Response({"detail": "Only librarians can create purchase orders."}, status=status.HTTP_403_FORBIDDEN)

    serializer = PurchaseOrderCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    order = serializer.save(created_by=user)
    return Response(PurchaseOrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def order_detail_update(request, pk):
    """
    GET  — Order detail.
    PUT  — Update order status (librarian or vendor).
    """
    try:
        order = PurchaseOrder.objects.prefetch_related("items").select_related("vendor", "created_by").get(pk=pk)
    except PurchaseOrder.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    if user.role not in ("librarian", "vendor"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        return Response(PurchaseOrderSerializer(order).data)

    # PUT
    new_status = request.data.get("status")
    if not new_status:
        return Response({"detail": "'status' field is required."}, status=status.HTTP_400_BAD_REQUEST)

    if new_status not in [s[0] for s in PurchaseOrder.Status.choices]:
        return Response({"detail": f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    if request.data.get("expected_date"):
        order.expected_date = request.data["expected_date"]
    if request.data.get("notes"):
        order.notes = request.data["notes"]
    order.save()

    # Notify librarian if vendor updates
    if user.role == "vendor" and order.created_by:
        send_notification(
            recipient=order.created_by,
            notification_type="order_update",
            title=f"Order #{order.id} Updated",
            message=f"Vendor '{order.vendor.name}' updated Order #{order.id} status to '{new_status}'.",
        )

    return Response(PurchaseOrderSerializer(order).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_order_item(request, pk):
    """
    Add a line item to an existing purchase order.
    POST /api/orders/<pk>/items/
    """
    try:
        order = PurchaseOrder.objects.get(pk=pk)
    except PurchaseOrder.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role not in ("librarian", "vendor"):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    serializer = PurchaseOrderItemSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    item = serializer.save(order=order)
    return Response(PurchaseOrderItemSerializer(item).data, status=status.HTTP_201_CREATED)

