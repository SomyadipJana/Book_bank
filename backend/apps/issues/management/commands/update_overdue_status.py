"""
Management command: update_overdue_status

Scans all active issues whose due_date has passed and updates their status
from ACTIVE → OVERDUE in the database.

Run daily via cron (e.g., just after midnight):
    python manage.py update_overdue_status
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from apps.issues.models import Issue
from apps.notifications.models import send_notification


class Command(BaseCommand):
    help = "Mark all active issues past due date as OVERDUE and notify students."

    def add_arguments(self, parser):
        parser.add_argument(
            "--notify",
            action="store_true",
            default=True,
            help="Send overdue notifications to students (default: True).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print what would be updated without making DB changes.",
        )

    def handle(self, *args, **options):
        today = timezone.now().date()
        dry_run = options["dry_run"]
        notify = options["notify"]

        overdue_issues = Issue.objects.filter(
            status=Issue.Status.ACTIVE,
            due_date__lt=today,
        ).select_related("book", "student__user")

        count = overdue_issues.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("No new overdue issues found."))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(f"[DRY-RUN] Would mark {count} issue(s) as OVERDUE:"))
            for issue in overdue_issues:
                days_overdue = (today - issue.due_date).days
                self.stdout.write(
                    f"  Issue #{issue.id}: '{issue.book.title}' — "
                    f"{issue.student.user.email} ({days_overdue} days overdue)"
                )
            return

        updated_ids = list(overdue_issues.values_list("id", flat=True))

        # Bulk update status
        Issue.objects.filter(id__in=updated_ids).update(status=Issue.Status.OVERDUE)

        # Send individual notifications
        if notify:
            issues_with_data = Issue.objects.filter(
                id__in=updated_ids
            ).select_related("book", "student__user")

            for issue in issues_with_data:
                days_overdue = (today - issue.due_date).days
                estimated_fine = days_overdue * settings.FINE_PER_DAY
                send_notification(
                    recipient=issue.student.user,
                    notification_type="overdue",
                    title=f"OVERDUE: {issue.book.title}",
                    message=(
                        f"Your loan for '{issue.book.title}' is {days_overdue} day(s) overdue. "
                        f"Current estimated fine: ₹{estimated_fine}. "
                        f"Please return the book immediately to minimise the fine."
                    ),
                    related_book=issue.book,
                )

        self.stdout.write(self.style.SUCCESS(
            f"Marked {count} issue(s) as OVERDUE. Notifications sent: {notify}."
        ))

