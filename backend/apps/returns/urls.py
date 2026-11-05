"""URL patterns for return endpoints."""
from django.urls import path
from . import views

urlpatterns = [
    path("",           views.return_list_create, name="return-list"),
    path("<int:pk>/",  views.return_detail,       name="return-detail"),
]

