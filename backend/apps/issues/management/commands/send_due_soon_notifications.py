r"""
Management command: send_due_soon_notifications

Scans all active loans whose due_date falls within DUE_SOON_DAYS days from today
and sends an in-app notification to the student if not already sent today.

Run daily via cron:
    python manage.py send_due_soon_notifications

Windows Task Scheduler example (run daily at 8 AM):
    python D:\book bank\Book_bank\backend\manage.py send_due_soon_notifications
"""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from apps.issues.models import Issue
from apps.notifications.models import Notification, send_notification


class Command(BaseCommand):
    help = "Send 'due soon' notifications for loans expiring within DUE_SOON_DAYS days."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=None,
            help="Override DUE_SOON_DAYS setting (how many days ahead to alert).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print what would be notified without actually creating notifications.",
        )

    def handle(self, *args, **options):
        due_soon_days = options["days"] or getattr(settings, "DUE_SOON_DAYS", 3)
        dry_run = options["dry_run"]
        today = timezone.now().date()
        threshold = today + timedelta(days=due_soon_days)

        # Active issues due on or before the threshold (but not already overdue)
        issues = Issue.objects.filter(
            status=Issue.Status.ACTIVE,
            due_date__gte=today,
            due_date__lte=threshold,
        ).select_related("book", "student__user")

        sent = 0
        skipped = 0

        for issue in issues:
            # Avoid re-notifying: skip if already sent a DUE_SOON notification today for this book
            already_notified = Notification.objects.filter(
                recipient=issue.student.user,
                notification_type=Notification.Type.DUE_SOON,
                related_book=issue.book,
                created_at__date=today,
            ).exists()

            if already_notified:
                skipped += 1
                continue

            days_left = (issue.due_date - today).days
            due_label = "today" if days_left == 0 else f"in {days_left} day{'s' if days_left > 1 else ''}"

            if dry_run:
                self.stdout.write(
                    f"[DRY-RUN] Would notify {issue.student.user.email}: "
                    f"'{issue.book.title}' due {due_label} ({issue.due_date})."
                )
            else:
                send_notification(
                    recipient=issue.student.user,
                    notification_type="due_soon",
                    title=f"Book Due {due_label.title()}: {issue.book.title}",
                    message=(
                        f"Reminder: '{issue.book.title}' is due {due_label} "
                        f"({issue.due_date.strftime('%d %b %Y')}). "
                        f"Please return or renew it to avoid a fine of "
                        f"₹{settings.FINE_PER_DAY}/day."
                    ),
                    related_book=issue.book,
                )
            sent += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"[DRY-RUN] Would send {sent} notification(s). {skipped} already notified today."
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"Sent {sent} due-soon notification(s). {skipped} already notified today."
            ))

