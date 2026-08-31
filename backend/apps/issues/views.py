"""Book issue views with atomic checkout logic."""
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian, IsStudent
from apps.notifications.models import send_notification
from .models import Issue
from .serializers import IssueSerializer, IssueCreateSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def issue_list_create(request):
    """
    GET  — List issues. Librarian sees all; students see own.
    POST — Student requests a book issue.
    """
    if request.method == "GET":
        user = request.user
        if user.role == "librarian":
            qs = Issue.objects.select_related("book", "student__user").all()
        else:
            try:
                qs = Issue.objects.filter(student=user.student_profile).select_related("book")
            except Exception:
                return Response([], status=status.HTTP_200_OK)
        return Response(IssueSerializer(qs, many=True).data)

    # POST — student requests book issue
    if request.user.role != "student":
        return Response({"detail": "Only students can request book issues."}, status=status.HTTP_403_FORBIDDEN)

    serializer = IssueCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    book = serializer.validated_data["accession"]

    try:
        student = request.user.student_profile
    except Exception:
        return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # Business rule checks
    if not student.can_borrow:
        return Response(
            {"detail": f"Borrowing limit ({student.borrowing_limit}) reached."},
            status=status.HTTP_409_CONFLICT,
        )
    if book.available_copies <= 0:
        return Response(
            {"detail": "No copies available. Please reserve this book instead."},
            status=status.HTTP_409_CONFLICT,
        )
    if Issue.objects.filter(book=book, student=student, status__in=["active", "pending"]).exists():
        return Response(
            {"detail": "You already have an active or pending issue for this book."},
            status=status.HTTP_409_CONFLICT,
        )

    with transaction.atomic():
        b = type(book).objects.select_for_update().get(pk=book.pk)
        due = timezone.now().date() + timedelta(days=settings.LOAN_DURATION_DAYS)
        issue = Issue.objects.create(book=b, student=student, due_date=due, status=Issue.Status.ACTIVE)
        b.available_copies -= 1
        b.save(update_fields=["available_copies"])
        send_notification(
            recipient=request.user,
            notification_type="book_issued",
            title=f"Book Issued: {b.title}",
            message=f"'{b.title}' has been issued to you. Due date: {due.strftime('%d %b %Y')}.",
            related_book=b,
        )

    return Response(IssueSerializer(issue).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def issue_detail(request, pk):
    """Retrieve a single issue record."""
    try:
        issue = Issue.objects.select_related("book", "student__user").get(pk=pk)
    except Issue.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(IssueSerializer(issue).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsLibrarian])
def renew_issue(request, pk):
    """Librarian or student renews a book loan."""
    try:
        issue = Issue.objects.select_related("book").get(pk=pk, status=Issue.Status.ACTIVE)
    except Issue.DoesNotExist:
        return Response({"detail": "Active issue not found."}, status=status.HTTP_404_NOT_FOUND)

    if issue.renewal_count >= settings.MAX_RENEWALS:
        return Response({"detail": "Maximum renewals reached."}, status=status.HTTP_409_CONFLICT)

    has_reservation = issue.book.reservations.filter(status="waiting").exists()
    if has_reservation:
        return Response(
            {"detail": "Cannot renew — this book has a pending reservation."},
            status=status.HTTP_409_CONFLICT,
        )

    issue.due_date += timedelta(days=settings.LOAN_DURATION_DAYS)
    issue.renewal_count += 1
    issue.save(update_fields=["due_date", "renewal_count"])
    return Response(IssueSerializer(issue).data)
