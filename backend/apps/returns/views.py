"""Book return views with automatic fine calculation and reservation trigger."""
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian
from apps.issues.models import Issue
from apps.books.models import Book
from apps.fines.models import Fine
from apps.reservations.models import Reservation
from apps.notifications.models import send_notification
from .models import Return
from .serializers import ReturnSerializer, ReturnProcessSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def return_list_create(request):
    """
    GET  — List return records (Librarian: all, Student: own).
    POST — Process a book return (Librarian only).
    """
    if request.method == "GET":
        if request.user.role == "librarian":
            qs = Return.objects.select_related("issue__book", "issue__student__user", "returned_to").all()
        else:
            try:
                qs = Return.objects.filter(
                    issue__student=request.user.student_profile
                ).select_related("issue__book", "returned_to")
            except Exception:
                return Response([])
        return Response(ReturnSerializer(qs, many=True).data)

    # POST: Librarian only
    if request.user.role != "librarian":
        return Response({"detail": "Only librarians can process returns."}, status=status.HTTP_403_FORBIDDEN)

    serializer = ReturnProcessSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    issue = None

    if data.get("issue_id"):
        try:
            issue = Issue.objects.select_related("book", "student__user").get(
                id=data["issue_id"], status__in=[Issue.Status.ACTIVE, Issue.Status.OVERDUE]
            )
        except Issue.DoesNotExist:
            return Response({"detail": "Active/overdue issue not found."}, status=status.HTTP_404_NOT_FOUND)
    else:
        try:
            issue = Issue.objects.select_related("book", "student__user").get(
                book__accession_number=data["accession"],
                student__enrollment_number=data["student_enrollment"],
                status__in=[Issue.Status.ACTIVE, Issue.Status.OVERDUE],
            )
        except Issue.DoesNotExist:
            return Response(
                {"detail": f"Active loan for accession '{data['accession']}' and student '{data['student_enrollment']}' not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Issue.MultipleObjectsReturned:
            issue = Issue.objects.filter(
                book__accession_number=data["accession"],
                student__enrollment_number=data["student_enrollment"],
                status__in=[Issue.Status.ACTIVE, Issue.Status.OVERDUE],
            ).order_by("-issue_date").first()

    today = timezone.now().date()
    days_late = max(0, (today - issue.due_date).days)
    was_late = days_late > 0
    fine_record = None

    with transaction.atomic():
        book = Book.objects.select_for_update().get(pk=issue.book.pk)

        # 1. Mark issue returned
        issue.status = Issue.Status.RETURNED
        issue.save(update_fields=["status"])

        # 2. Create return record
        ret = Return.objects.create(
            issue=issue,
            returned_to=request.user,
            condition_notes=data.get("condition_notes", ""),
            was_late=was_late,
            days_late=days_late,
        )

        # 3. Create fine if late
        if was_late:
            fine_amount = days_late * settings.FINE_PER_DAY
            fine_record = Fine.objects.create(
                issue=issue,
                student=issue.student,
                book=book,
                due_date=issue.due_date,
                return_date=today,
                days_late=days_late,
                amount=fine_amount,
                status=Fine.Status.UNPAID,
                notes=f"Overdue by {days_late} days. ₹{settings.FINE_PER_DAY}/day.",
            )
            send_notification(
                recipient=issue.student.user,
                notification_type="fine_raised",
                title=f"Late Return Fine: ₹{fine_amount}",
                message=f"'{book.title}' was returned {days_late} days late. Fine: ₹{fine_amount}.",
                related_book=book,
            )

        # 4. Restore available copy
        book.available_copies += 1
        book.save(update_fields=["available_copies"])

        # 5. Trigger reservation queue
        waiting_res = Reservation.objects.filter(
            book=book, status=Reservation.Status.WAITING
        ).order_by("reserved_date", "id").first()

        if waiting_res:
            pickup_deadline = today + timedelta(days=settings.PICKUP_DEADLINE_DAYS)
            waiting_res.status = Reservation.Status.READY
            waiting_res.pickup_deadline = pickup_deadline
            waiting_res.notified_at = timezone.now()
            waiting_res.save(update_fields=["status", "pickup_deadline", "notified_at"])

            send_notification(
                recipient=waiting_res.student.user,
                notification_type="reservation_ready",
                title=f"Reserved Book Ready: {book.title}",
                message=(
                    f"Your reserved book '{book.title}' is now available for pickup at "
                    f"{waiting_res.pickup_location}. "
                    f"Please collect it before {pickup_deadline.strftime('%d %b %Y')}."
                ),
                related_book=book,
            )

        # 6. Confirm return to student
        send_notification(
            recipient=issue.student.user,
            notification_type="return_confirmed",
            title=f"Book Returned: {book.title}",
            message=f"'{book.title}' has been successfully returned and recorded.",
            related_book=book,
        )

    res_data = ReturnSerializer(ret).data
    if fine_record:
        res_data["fine"] = {
            "id": fine_record.id,
            "amount": str(fine_record.amount),
            "days_late": fine_record.days_late,
            "status": fine_record.status,
        }
    return Response(res_data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def return_detail(request, pk):
    """Retrieve a single return record."""
    try:
        ret = Return.objects.select_related("issue__book", "issue__student__user", "returned_to").get(pk=pk)
    except Return.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != "librarian" and ret.issue.student.user != request.user:
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    return Response(ReturnSerializer(ret).data)

