"""URL patterns for fine endpoints."""
from django.urls import path
from . import views

urlpatterns = [
    path("",              views.fine_list,   name="fine-list"),
    path("<int:pk>/",     views.fine_detail, name="fine-detail"),
    path("<int:pk>/pay/", views.pay_fine,    name="fine-pay"),
    path("<int:pk>/waive/", views.waive_fine, name="fine-waive"),
]

