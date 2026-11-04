"""URL patterns for order endpoints."""
from django.urls import path
from . import views

urlpatterns = [
    path("",                      views.order_list_create,    name="order-list"),
    path("<int:pk>/",             views.order_detail_update,  name="order-detail"),
    path("<int:pk>/items/",       views.add_order_item,       name="order-add-item"),
]

