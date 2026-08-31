"""URL configuration for Book Bank backend."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ── Django Admin Branding ─────────────────────────────────────────────────────
admin.site.site_header = "Book Bank — Administration"
admin.site.site_title = "Book Bank Admin Portal"
admin.site.index_title = "Library System Administration"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/",          include("apps.accounts.urls")),
    path("api/books/",         include("apps.books.urls")),
    path("api/students/",      include("apps.students.urls")),
    path("api/issues/",        include("apps.issues.urls")),
    path("api/returns/",       include("apps.returns.urls")),
    path("api/reservations/",  include("apps.reservations.urls")),
    path("api/fines/",         include("apps.fines.urls")),
    path("api/vendors/",       include("apps.vendors.urls")),
    path("api/orders/",        include("apps.orders.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/reports/",       include("apps.reports.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
