"""Reservation queue views."""
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian
from apps.notifications.models import send_notification
from apps.issues.models import Issue
from apps.books.models import Book
from .models import Reservation
from .serializers import ReservationSerializer, ReservationCreateSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def reservation_list_create(request):
    """
    GET  — List reservations. Librarian: all; Student: own.
    POST — Student creates a reservation for an unavailable book.
    """
    if request.method == "GET":
        if request.user.role == "librarian":
            qs = Reservation.objects.select_related("book", "student__user").all()
        else:
            try:
                qs = Reservation.objects.filter(
                    student=request.user.student_profile
                ).select_related("book")
            except Exception:
                return Response([])
        return Response(ReservationSerializer(qs, many=True).data)

    # POST — only students can reserve
    if request.user.role != "student":
        return Response({"detail": "Only students can make reservations."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ReservationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    book = serializer.validated_data["accession"]

    try:
        student = request.user.student_profile
    except Exception:
        return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # Can't reserve if copies are available (issue instead)
    if book.available_copies > 0:
        return Response(
            {"detail": "Copies are available. Please issue this book directly instead of reserving."},
            status=status.HTTP_409_CONFLICT,
        )

    # Duplicate check
    already = Reservation.objects.filter(
        book=book, student=student, status__in=["waiting", "ready"]
    ).exists()
    if already:
        return Response(
            {"detail": "You already have an active reservation for this book."},
            status=status.HTTP_409_CONFLICT,
        )

    # Also check if student already has the book on loan
    if Issue.objects.filter(book=book, student=student, status__in=["active", "pending"]).exists():
        return Response(
            {"detail": "You already have this book on loan."},
            status=status.HTTP_409_CONFLICT,
        )

    with transaction.atomic():
        queue_pos = (
            Reservation.objects.filter(book=book, status=Reservation.Status.WAITING).count() + 1
        )
        reservation = Reservation.objects.create(
            book=book,
            student=student,
            status=Reservation.Status.WAITING,
            queue_position=queue_pos,
        )

        send_notification(
            recipient=request.user,
            notification_type="other",
            title=f"Reservation Confirmed: {book.title}",
            message=f"You are #{queue_pos} in the queue for '{book.title}'. We'll notify you when it's available.",
            related_book=book,
        )

    return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reservation_detail(request, pk):
    """Retrieve a single reservation."""
    try:
        res = Reservation.objects.select_related("book", "student__user").get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and res.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    return Response(ReservationSerializer(res).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, pk):
    """
    Cancel a waiting/ready reservation.
    PUT /api/reservations/<pk>/cancel/
    Students can cancel own; librarian can cancel any.
    """
    try:
        res = Reservation.objects.select_related("book", "student__user").get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and res.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if res.status not in (Reservation.Status.WAITING, Reservation.Status.READY):
        return Response(
            {"detail": f"Cannot cancel a reservation with status '{res.status}'."},
            status=status.HTTP_409_CONFLICT,
        )

    res.status = Reservation.Status.CANCELLED
    res.save(update_fields=["status"])

    return Response({"detail": "Reservation cancelled.", "id": res.id})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def fulfill_reservation(request, pk):
    """
    Librarian fulfills a READY reservation — creates an active Issue.
    POST /api/reservations/<pk>/fulfill/
    """
    if request.user.role != "librarian":
        return Response({"detail": "Librarian only."}, status=status.HTTP_403_FORBIDDEN)

    try:
        res = Reservation.objects.select_related("book", "student__user").get(
            pk=pk, status=Reservation.Status.READY
        )
    except Reservation.DoesNotExist:
        return Response({"detail": "Ready reservation not found."}, status=status.HTTP_404_NOT_FOUND)

    if not res.student.can_borrow:
        return Response(
            {"detail": "Student has reached their borrowing limit."},
            status=status.HTTP_409_CONFLICT,
        )

    with transaction.atomic():
        book = Book.objects.select_for_update().get(pk=res.book.pk)
        if book.available_copies <= 0:
            return Response({"detail": "No copies available."}, status=status.HTTP_409_CONFLICT)

        due = timezone.now().date() + timedelta(days=settings.LOAN_DURATION_DAYS)
        issue = Issue.objects.create(
            book=book,
            student=res.student,
            issued_by=request.user,
            due_date=due,
            status=Issue.Status.ACTIVE,
        )
        book.available_copies -= 1
        book.save(update_fields=["available_copies"])

        res.status = Reservation.Status.FULFILLED
        res.save(update_fields=["status"])

        send_notification(
            recipient=res.student.user,
            notification_type="book_issued",
            title=f"Reservation Fulfilled: {book.title}",
            message=f"Your reserved copy of '{book.title}' has been issued. Due date: {due.strftime('%d %b %Y')}.",
            related_book=book,
        )

    from apps.issues.serializers import IssueSerializer
    return Response(IssueSerializer(issue).data, status=status.HTTP_201_CREATED)

