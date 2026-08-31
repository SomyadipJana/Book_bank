"""Purchase Order views for managing book procurement."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian, IsVendor
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer


class OrderViewSet(viewsets.ModelViewSet):
    """
    Purchase Order management:
    - GET  /api/orders/          — List orders (Librarian: all, Vendor: assigned)
    - POST /api/orders/          — Create order (Librarian)
    - GET  /api/orders/<id>/     — Order detail with line items
    - PUT  /api/orders/<id>/     — Update status (Librarian/Vendor)
    - POST /api/orders/<id>/items/ — Add line item to order
    """
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "librarian":
            return PurchaseOrder.objects.select_related("vendor", "created_by").prefetch_related("items").all()
        elif user.role == "vendor":
            return PurchaseOrder.objects.filter(vendor__email=user.email).select_related("vendor").prefetch_related("items")
        return PurchaseOrder.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def items(self, request, pk=None):
        """Add a line item to an existing purchase order."""
        order = self.get_object()
        data = request.data.copy()
        data["order"] = order.id
        serializer = PurchaseOrderItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(PurchaseOrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
