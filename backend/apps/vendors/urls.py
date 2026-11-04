"""URL patterns for vendor endpoints."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet

router = DefaultRouter()
router.register("", VendorViewSet, basename="vendors")

urlpatterns = router.urls

