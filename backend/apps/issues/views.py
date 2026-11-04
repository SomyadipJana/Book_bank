"""Book issue views with atomic checkout and renewal logic."""
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
from .models import Issue
from .serializers import IssueSerializer, IssueCreateSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def issue_list_create(request):
    """
    GET  — List issues. Librarian sees all; students see own.
    POST — Student requests a book checkout.
    """
    if request.method == "GET":
        user = request.user
        if user.role == "librarian":
            qs = Issue.objects.select_related("book", "student__user", "issued_by").all()
        else:
            try:
                qs = Issue.objects.filter(student=user.student_profile).select_related("book")
            except Exception:
                return Response([], status=status.HTTP_200_OK)
        return Response(IssueSerializer(qs, many=True).data)

    # POST — only students can request issues
    if request.user.role != "student":
        return Response(
            {"detail": "Only students can request book checkouts."},
            status=status.HTTP_403_FORBIDDEN,
        )

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
            {"detail": f"Borrowing limit ({student.borrowing_limit}) reached. Return a book first."},
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
        if b.available_copies <= 0:
            return Response(
                {"detail": "No copies available (concurrent request). Please try again."},
                status=status.HTTP_409_CONFLICT,
            )
        due = timezone.now().date() + timedelta(days=settings.LOAN_DURATION_DAYS)
        issue = Issue.objects.create(
            book=b,
            student=student,
            due_date=due,
            status=Issue.Status.ACTIVE,
        )
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
        issue = Issue.objects.select_related("book", "student__user", "issued_by").get(pk=pk)
    except Issue.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # Permission: librarian sees all; student only sees own
    if request.user.role != "librarian" and issue.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    return Response(IssueSerializer(issue).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def renew_issue(request, pk):
    """
    Renew a book loan. Both students (own) and librarians can renew.
    POST /api/issues/<pk>/renew/
    """
    try:
        issue = Issue.objects.select_related("book", "student__user").get(pk=pk, status=Issue.Status.ACTIVE)
    except Issue.DoesNotExist:
        return Response({"detail": "Active issue not found."}, status=status.HTTP_404_NOT_FOUND)

    # Students can only renew their own
    if request.user.role == "student" and issue.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if issue.renewal_count >= settings.MAX_RENEWALS:
        return Response(
            {"detail": f"Maximum renewals ({settings.MAX_RENEWALS}) reached."},
            status=status.HTTP_409_CONFLICT,
        )

    if issue.book.reservations.filter(status="waiting").exists():
        return Response(
            {"detail": "Cannot renew — this book has pending reservations."},
            status=status.HTTP_409_CONFLICT,
        )

    issue.due_date += timedelta(days=settings.LOAN_DURATION_DAYS)
    issue.renewal_count += 1
    issue.save(update_fields=["due_date", "renewal_count"])

    send_notification(
        recipient=issue.student.user,
        notification_type="book_issued",
        title=f"Loan Renewed: {issue.book.title}",
        message=f"Your loan for '{issue.book.title}' has been renewed. New due date: {issue.due_date.strftime('%d %b %Y')}.",
        related_book=issue.book,
    )

    return Response(IssueSerializer(issue).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_overdue(request):
    """
    Librarian utility: scan all active issues past due date and mark them overdue.
    POST /api/issues/mark-overdue/
    """
    if request.user.role != "librarian":
        return Response({"detail": "Librarian only."}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.now().date()
    updated = Issue.objects.filter(
        status=Issue.Status.ACTIVE, due_date__lt=today
    ).update(status=Issue.Status.OVERDUE)

    return Response({"detail": f"{updated} issue(s) marked overdue."})

