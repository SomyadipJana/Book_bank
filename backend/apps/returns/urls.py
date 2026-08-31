from django.urls import path
from . import views

urlpatterns = [
    path("",          views.return_list_create, name="return-list-create"),
    path("<int:pk>/", views.return_detail,      name="return-detail"),
]
