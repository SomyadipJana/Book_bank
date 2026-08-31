from django.urls import path
from . import views

urlpatterns = [
    path("summary/",   views.summary_report,      name="report-summary"),
    path("issued/",    views.issued_books_report, name="report-issued"),
    path("overdue/",   views.overdue_report,      name="report-overdue"),
    path("inventory/", views.inventory_report,    name="report-inventory"),
    path("fines/",     views.fines_report,        name="report-fines"),
]
