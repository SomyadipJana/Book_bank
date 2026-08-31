"""Reservation views for booking unavailable books and queue management."""
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian
from apps.books.models import Book
from apps.issues.models import Issue
from apps.notifications.models import send_notification
from .models import Reservation
from .serializers import ReservationSerializer, ReservationCreateSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def reservation_list_create(request):
    """
    GET  — List reservations (Librarian: all, Student: own).
    POST — Reserve an unavailable book (Student only).
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

    if request.user.role != "student":
        return Response({"detail": "Only students can place reservations."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ReservationCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    book = serializer.validated_data["accession"]

    try:
        student = request.user.student_profile
    except Exception:
        return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # If book has available copies, encourage direct borrowing instead
    if book.available_copies > 0:
        return Response(
            {"detail": "This book is currently available! You can request an issue directly."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if student already has a pending/waiting/ready reservation for this book
    existing = Reservation.objects.filter(
        book=book,
        student=student,
        status__in=[Reservation.Status.WAITING, Reservation.Status.READY]
    ).exists()
    if existing:
        return Response(
            {"detail": "You already have an active reservation for this book."},
            status=status.HTTP_409_CONFLICT
        )

    # Compute queue position
    queue_count = Reservation.objects.filter(
        book=book,
        status=Reservation.Status.WAITING
    ).count()

    reservation = Reservation.objects.create(
        book=book,
        student=student,
        status=Reservation.Status.WAITING,
        queue_position=queue_count + 1,
    )

    send_notification(
        recipient=request.user,
        notification_type="other",
        title=f"Reservation Confirmed: {book.title}",
        message=f"You are position #{queue_count + 1} in queue for '{book.title}'. We will notify you when a copy becomes available.",
        related_book=book,
    )

    return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reservation_detail(request, pk):
    """Retrieve details of a single reservation."""
    try:
        res = Reservation.objects.select_related("book", "student__user").get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and res.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    return Response(ReservationSerializer(res).data)


@api_view(["PUT", "POST"])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, pk):
    """Cancel an existing reservation."""
    try:
        res = Reservation.objects.get(pk=pk)
    except Reservation.DoesNotExist:
        return Response({"detail": "Reservation not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and res.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    res.status = Reservation.Status.CANCELLED
    res.save(update_fields=["status"])
    return Response({"detail": "Reservation cancelled.", "reservation": ReservationSerializer(res).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsLibrarian])
def fulfill_reservation(request, pk):
    """Librarian fulfills a ready reservation by converting it into an active Issue."""
    try:
        res = Reservation.objects.select_related("book", "student__user").get(
            pk=pk, status=Reservation.Status.READY
        )
    except Reservation.DoesNotExist:
        return Response(
            {"detail": "Ready reservation with specified ID not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    with transaction.atomic():
        book = Book.objects.select_for_update().get(pk=res.book.pk)
        if book.available_copies <= 0:
            return Response({"detail": "No copy available to issue."}, status=status.HTTP_409_CONFLICT)

        due_date = timezone.now().date() + timedelta(days=settings.LOAN_DURATION_DAYS)
        issue = Issue.objects.create(
            book=book,
            student=res.student,
            issued_by=request.user,
            due_date=due_date,
            status=Issue.Status.ACTIVE
        )

        book.available_copies -= 1
        book.save(update_fields=["available_copies"])

        res.status = Reservation.Status.FULFILLED
        res.save(update_fields=["status"])

        send_notification(
            recipient=res.student.user,
            notification_type="book_issued",
            title=f"Reserved Book Collected: {book.title}",
            message=f"Your reservation for '{book.title}' has been fulfilled. Due date: {due_date.strftime('%d %b %Y')}.",
            related_book=book,
        )

    return Response({
        "detail": "Reservation fulfilled and loan created.",
        "reservation": ReservationSerializer(res).data,
    })
