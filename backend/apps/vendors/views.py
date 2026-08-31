"""Vendor CRUD views — librarian only."""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.accounts.permissions import IsLibrarian
from .models import Vendor
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ModelViewSet):
    """CRUD for book vendors. Librarian access only."""
    queryset = Vendor.objects.filter(is_active=True).order_by("name")
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated, IsLibrarian]
    search_fields = ["name", "contact_person", "email"]
