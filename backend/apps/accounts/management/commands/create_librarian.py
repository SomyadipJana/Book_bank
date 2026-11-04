"""Management command to create a librarian superuser account."""
from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create a librarian (staff) user account."

    def add_arguments(self, parser):
        parser.add_argument("--email",    default="librarian@bookbank.local")
        parser.add_argument("--name",     default="Head Librarian")
        parser.add_argument("--password", default="Library@123")

    def handle(self, *args, **options):
        email = options["email"]
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"User '{email}' already exists."))
            return

        User.objects.create_superuser(
            email=email,
            password=options["password"],
            full_name=options["name"],
        )
        self.stdout.write(self.style.SUCCESS(
            f"Librarian account created: {email} / {options['password']}"
        ))

