"""Vendor views — full CRUD (librarian only)."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsLibrarian
from .models import Vendor
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ModelViewSet):
    """
    Vendor management (librarian only).

    GET/POST         /api/vendors/
    GET/PUT/DELETE   /api/vendors/<id>/
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        active_only = self.request.query_params.get("active_only", "false").lower() == "true"
        if active_only:
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        return [IsAuthenticated(), IsLibrarian()]

