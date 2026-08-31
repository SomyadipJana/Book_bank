"""Management command to create a librarian superuser account."""
from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = "Create or update a Librarian superuser account"

    def add_arguments(self, parser):
        parser.add_argument("--email", type=str, default="librarian@bookbank.edu", help="Librarian email")
        parser.add_argument("--password", type=str, default="Librarian@123", help="Librarian password")
        parser.add_argument("--name", type=str, default="Head Librarian", help="Full name")

    def handle(self, *args, **options):
        email = options["email"]
        password = options["password"]
        name = options["name"]

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": name,
                "role": User.Role.LIBRARIAN,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            }
        )

        user.set_password(password)
        user.role = User.Role.LIBRARIAN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.full_name = name
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Successfully created librarian account: {email} / {password}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Updated existing librarian account: {email} / {password}"))
