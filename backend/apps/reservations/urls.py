from django.urls import path
from . import views

urlpatterns = [
    path("",                   views.reservation_list_create, name="reservation-list-create"),
    path("<int:pk>/",          views.reservation_detail,      name="reservation-detail"),
    path("<int:pk>/cancel/",   views.cancel_reservation,     name="reservation-cancel"),
    path("<int:pk>/fulfill/",  views.fulfill_reservation,    name="reservation-fulfill"),
]
