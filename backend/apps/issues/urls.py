"""URL patterns for issue endpoints."""
from django.urls import path
from . import views

urlpatterns = [
    path("",                  views.issue_list_create, name="issue-list"),
    path("<int:pk>/",         views.issue_detail,      name="issue-detail"),
    path("<int:pk>/renew/",   views.renew_issue,       name="issue-renew"),
    path("mark-overdue/",     views.mark_overdue,      name="issue-mark-overdue"),
]

