"""Fine views — list, detail, pay, waive."""
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
    GET /api/fines/?status=unpaid
    Librarian: all fines. Student: own fines.
    """
    fine_status = request.query_params.get("status", "")
    if request.user.role == "librarian":
        qs = Fine.objects.select_related("student__user", "book").all()
    else:
        try:
            qs = Fine.objects.filter(student=request.user.student_profile).select_related("book")
        except Exception:
            return Response([])

    if fine_status:
        qs = qs.filter(status=fine_status)
    return Response(FineSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def fine_detail(request, pk):
    """Retrieve a single fine."""
    try:
        fine = Fine.objects.select_related("student__user", "book").get(pk=pk)
    except Fine.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and fine.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    return Response(FineSerializer(fine).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_fine(request, pk):
    """
    Mark a fine as paid.
    POST /api/fines/<pk>/pay/
    Librarian: can pay any. Student: can pay own (self-service).
    """
    try:
        fine = Fine.objects.select_related("student__user", "book").get(pk=pk)
    except Fine.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and fine.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if fine.status != Fine.Status.UNPAID:
        return Response(
            {"detail": f"Fine is already {fine.status}."},
            status=status.HTTP_409_CONFLICT,
        )

    fine.status = Fine.Status.PAID
    fine.paid_at = timezone.now()
    fine.save(update_fields=["status", "paid_at"])

    send_notification(
        recipient=fine.student.user,
        notification_type="other",
        title="Fine Paid",
        message=f"Your fine of ₹{fine.amount} for '{fine.book.title}' has been recorded as paid.",
        related_book=fine.book,
    )

    return Response(FineSerializer(fine).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsLibrarian])
def waive_fine(request, pk):
    """
    Librarian waives a fine.
    POST /api/fines/<pk>/waive/
    Body: { notes: "reason" } (optional)
    """
    try:
        fine = Fine.objects.select_related("student__user", "book").get(pk=pk)
    except Fine.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if fine.status != Fine.Status.UNPAID:
        return Response(
            {"detail": f"Fine is already {fine.status}."},
            status=status.HTTP_409_CONFLICT,
        )

    notes = request.data.get("notes", "").strip()
    fine.status = Fine.Status.WAIVED
    fine.waived_by = request.user
    fine.paid_at = timezone.now()
    if notes:
        fine.notes = (fine.notes + "\n" + notes).strip()
    fine.save(update_fields=["status", "waived_by", "paid_at", "notes"])

    send_notification(
        recipient=fine.student.user,
        notification_type="other",
        title="Fine Waived",
        message=f"Your fine of ₹{fine.amount} for '{fine.book.title}' has been waived by the librarian.",
        related_book=fine.book,
    )

    return Response(FineSerializer(fine).data)

