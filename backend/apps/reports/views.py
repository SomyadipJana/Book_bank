"""Library administration reports and analytics."""
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian
from apps.books.models import Book
from apps.issues.models import Issue
from apps.returns.models import Return
from apps.reservations.models import Reservation
from apps.fines.models import Fine
from apps.students.models import StudentProfile


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsLibrarian])
def summary_report(request):
    """Overall system metrics summary for the librarian dashboard."""
    today = timezone.now().date()
    
    total_titles = Book.objects.filter(is_active=True).count()
    book_stats = Book.objects.filter(is_active=True).aggregate(
        total_copies=Sum("total_copies"),
        available_copies=Sum("available_copies")
    )
    
    active_loans = Issue.objects.filter(status=Issue.Status.ACTIVE).count()
    overdue_loans = Issue.objects.filter(
        status=Issue.Status.ACTIVE, due_date__lt=today
    ).count()
    
    total_returns = Return.objects.count()
    waiting_reservations = Reservation.objects.filter(status=Reservation.Status.WAITING).count()
    ready_reservations = Reservation.objects.filter(status=Reservation.Status.READY).count()
    
    fine_stats = Fine.objects.aggregate(
        total_unpaid=Sum("amount", filter=Q(status=Fine.Status.UNPAID)),
        total_collected=Sum("amount", filter=Q(status=Fine.Status.PAID)),
        total_waived=Sum("amount", filter=Q(status=Fine.Status.WAIVED)),
    )
    
    total_students = StudentProfile.objects.filter(is_active=True).count()

    return Response({
        "books": {
            "total_titles": total_titles,
            "total_copies": book_stats["total_copies"] or 0,
            "available_copies": book_stats["available_copies"] or 0,
            "issued_copies": (book_stats["total_copies"] or 0) - (book_stats["available_copies"] or 0),
        },
        "loans": {
            "active_loans": active_loans,
            "overdue_loans": overdue_loans,
            "total_returns": total_returns,
        },
        "reservations": {
            "waiting": waiting_reservations,
            "ready_for_pickup": ready_reservations,
        },
        "fines": {
            "total_unpaid": fine_stats["total_unpaid"] or 0.00,
            "total_collected": fine_stats["total_collected"] or 0.00,
            "total_waived": fine_stats["total_waived"] or 0.00,
        },
        "students": {
            "active_students": total_students,
        }
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsLibrarian])
def issued_books_report(request):
    """Detailed report of all active loans."""
    qs = Issue.objects.filter(status=Issue.Status.ACTIVE).select_related("book", "student__user").order_by("due_date")
    data = [
        {
            "issue_id": issue.id,
            "accession": issue.book.accession_number,
            "title": issue.book.title,
            "author": issue.book.author,
            "student_name": issue.student.user.full_name,
            "student_enrollment": issue.student.enrollment_number,
            "department": issue.student.department,
            "issue_date": issue.issue_date,
            "due_date": issue.due_date,
            "renewals_used": issue.renewal_count,
            "is_overdue": issue.is_overdue,
        }
        for issue in qs
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsLibrarian])
def overdue_report(request):
    """Detailed report of all overdue books."""
    today = timezone.now().date()
    from django.conf import settings
    qs = Issue.objects.filter(status=Issue.Status.ACTIVE, due_date__lt=today).select_related("book", "student__user")
    data = [
        {
            "issue_id": issue.id,
            "accession": issue.book.accession_number,
            "title": issue.book.title,
            "student_name": issue.student.user.full_name,
            "student_enrollment": issue.student.enrollment_number,
            "student_email": issue.student.user.email,
            "due_date": issue.due_date,
            "days_overdue": (today - issue.due_date).days,
            "estimated_fine": (today - issue.due_date).days * settings.FINE_PER_DAY,
        }
        for issue in qs
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsLibrarian])
def inventory_report(request):
    """Breakdown of inventory by category."""
    categories = (
        Book.objects.filter(is_active=True)
        .values("category")
        .annotate(
            title_count=Count("id"),
            total_copies=Sum("total_copies"),
            available_copies=Sum("available_copies"),
        )
        .order_by("category")
    )
    return Response(list(categories))


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsLibrarian])
def fines_report(request):
    """Summary and listing of all fines."""
    qs = Fine.objects.select_related("student__user", "book").order_by("-created_at")
    data = [
        {
            "id": f.id,
            "student_name": f.student.user.full_name,
            "student_enrollment": f.student.enrollment_number,
            "book_title": f.book.title,
            "amount": str(f.amount),
            "days_late": f.days_late,
            "status": f.status,
            "due_date": f.due_date,
            "return_date": f.return_date,
            "paid_at": f.paid_at,
        }
        for f in qs
    ]
    return Response(data)
