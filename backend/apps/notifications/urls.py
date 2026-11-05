"""URL patterns for notification endpoints."""
from django.urls import path
from . import views

urlpatterns = [
    path("",                     views.notification_list, name="notification-list"),
    path("<int:pk>/read/",       views.mark_read,         name="notification-read"),
    path("<int:pk>/",            views.delete_notification, name="notification-delete"),
    path("mark-all-read/",       views.mark_all_read,     name="notification-mark-all-read"),
]

