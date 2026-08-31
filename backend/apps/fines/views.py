"""Fine management views for tracking and clearing overdue penalties."""
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian
from apps.notifications.models import send_notification
from .models import Fine
from .serializers import FineSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fine_list(request):
    """
    GET — List fines (Librarian: all, Student: own).
    Supports query parameter ?status=unpaid|paid|waived
    """
    status_filter = request.query_params.get("status")
    if request.user.role == "librarian":
        qs = Fine.objects.select_related("book", "student__user").all()
    else:
        try:
            qs = Fine.objects.filter(student=request.user.student_profile).select_related("book")
        except Exception:
            return Response([])

    if status_filter:
        qs = qs.filter(status=status_filter)

    return Response(FineSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fine_detail(request, pk):
    """Retrieve details of a single fine."""
    try:
        fine = Fine.objects.select_related("book", "student__user").get(pk=pk)
    except Fine.DoesNotExist:
        return Response({"detail": "Fine not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and fine.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    return Response(FineSerializer(fine).data)


@api_view(["PUT", "POST"])
@permission_classes([IsAuthenticated])
def pay_fine(request, pk):
    """Mark a fine as paid."""
    try:
        fine = Fine.objects.select_related("student__user", "book").get(pk=pk)
    except Fine.DoesNotExist:
        return Response({"detail": "Fine not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and fine.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if fine.status == Fine.Status.PAID:
        return Response({"detail": "Fine is already paid."}, status=status.HTTP_400_BAD_REQUEST)

    fine.status = Fine.Status.PAID
    fine.paid_at = timezone.now()
    fine.notes = f"{fine.notes}\nPaid on {fine.paid_at.strftime('%Y-%m-%d %H:%M')}".strip()
    fine.save(update_fields=["status", "paid_at", "notes"])

    send_notification(
        recipient=fine.student.user,
        notification_type="other",
        title=f"Fine Paid: ₹{fine.amount}",
        message=f"Your fine payment of ₹{fine.amount} for '{fine.book.title}' has been successfully recorded.",
        related_book=fine.book,
    )

    return Response(FineSerializer(fine).data)


@api_view(["PUT", "POST"])
@permission_classes([IsAuthenticated, IsLibrarian])
def waive_fine(request, pk):
    """Librarian waives an unpaid fine."""
    try:
        fine = Fine.objects.select_related("student__user", "book").get(pk=pk)
    except Fine.DoesNotExist:
        return Response({"detail": "Fine not found."}, status=status.HTTP_404_NOT_FOUND)

    fine.status = Fine.Status.WAIVED
    fine.notes = f"{fine.notes}\nWaived by librarian {request.user.full_name} on {timezone.now().strftime('%Y-%m-%d')}".strip()
    fine.save(update_fields=["status", "notes"])

    send_notification(
        recipient=fine.student.user,
        notification_type="other",
        title=f"Fine Waived: ₹{fine.amount}",
        message=f"Your fine of ₹{fine.amount} for '{fine.book.title}' has been waived by the library administration.",
        related_book=fine.book,
    )

    return Response(FineSerializer(fine).data)
