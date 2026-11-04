"""
Management command: seed_books

Seeds the database with sample books matching the frontend mock data.
Run once after migrations:
    python manage.py seed_books
"""
from django.core.management.base import BaseCommand
from apps.books.models import Book

SAMPLE_BOOKS = [
    {"accession_number": "BB-0001", "title": "Introduction to Algorithms", "author": "Cormen, Leiserson, Rivest, Stein", "isbn": "978-0262033848", "category": "Algorithms & DS", "edition": "4th", "publisher": "MIT Press", "total_copies": 5, "available_copies": 5},
    {"accession_number": "BB-0002", "title": "Clean Code", "author": "Robert C. Martin", "isbn": "978-0132350884", "category": "Computer Science", "edition": "1st", "publisher": "Prentice Hall", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0003", "title": "The Pragmatic Programmer", "author": "David Thomas, Andrew Hunt", "isbn": "978-0135957059", "category": "Computer Science", "edition": "2nd", "publisher": "Addison-Wesley", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0004", "title": "Design Patterns", "author": "Gang of Four", "isbn": "978-0201633610", "category": "Computer Science", "edition": "1st", "publisher": "Addison-Wesley", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0005", "title": "Operating System Concepts", "author": "Silberschatz, Galvin, Gagne", "isbn": "978-1119800361", "category": "Systems & OS", "edition": "10th", "publisher": "Wiley", "total_copies": 6, "available_copies": 6},
    {"accession_number": "BB-0006", "title": "Computer Networks", "author": "Andrew S. Tanenbaum", "isbn": "978-0132126953", "category": "Networks", "edition": "5th", "publisher": "Prentice Hall", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0007", "title": "Database System Concepts", "author": "Silberschatz, Korth, Sudarshan", "isbn": "978-0078022159", "category": "Computer Science", "edition": "7th", "publisher": "McGraw-Hill", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0008", "title": "Structure and Interpretation of Computer Programs", "author": "Abelson, Sussman", "isbn": "978-0262510875", "category": "Computer Science", "edition": "2nd", "publisher": "MIT Press", "total_copies": 2, "available_copies": 2},
    {"accession_number": "BB-0009", "title": "Compilers: Principles, Techniques, and Tools", "author": "Aho, Lam, Sethi, Ullman", "isbn": "978-0321486813", "category": "Systems & OS", "edition": "2nd", "publisher": "Addison-Wesley", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0010", "title": "Discrete Mathematics and Its Applications", "author": "Kenneth H. Rosen", "isbn": "978-0073383095", "category": "Mathematics", "edition": "8th", "publisher": "McGraw-Hill", "total_copies": 5, "available_copies": 5},
    {"accession_number": "BB-0011", "title": "Linear Algebra and Its Applications", "author": "David C. Lay", "isbn": "978-0321982384", "category": "Mathematics", "edition": "5th", "publisher": "Pearson", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0012", "title": "Calculus: Early Transcendentals", "author": "James Stewart", "isbn": "978-1285741550", "category": "Mathematics", "edition": "8th", "publisher": "Cengage", "total_copies": 5, "available_copies": 5},
    {"accession_number": "BB-0013", "title": "Artificial Intelligence: A Modern Approach", "author": "Russell, Norvig", "isbn": "978-0134610993", "category": "Computer Science", "edition": "4th", "publisher": "Pearson", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0014", "title": "Deep Learning", "author": "Goodfellow, Bengio, Courville", "isbn": "978-0262035613", "category": "Computer Science", "edition": "1st", "publisher": "MIT Press", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0015", "title": "The Art of Computer Programming Vol. 1", "author": "Donald E. Knuth", "isbn": "978-0201896831", "category": "Algorithms & DS", "edition": "3rd", "publisher": "Addison-Wesley", "total_copies": 2, "available_copies": 2},
    {"accession_number": "BB-0016", "title": "Computer Organization and Design", "author": "Patterson, Hennessy", "isbn": "978-0128201091", "category": "Engineering", "edition": "6th", "publisher": "Morgan Kaufmann", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0017", "title": "Engineering Mathematics", "author": "K.A. Stroud", "isbn": "978-1352010275", "category": "Mathematics", "edition": "8th", "publisher": "Red Globe Press", "total_copies": 5, "available_copies": 5},
    {"accession_number": "BB-0018", "title": "Data Communications and Networking", "author": "Behrouz A. Forouzan", "isbn": "978-0073376226", "category": "Networks", "edition": "5th", "publisher": "McGraw-Hill", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0019", "title": "Software Engineering", "author": "Ian Sommerville", "isbn": "978-0133943030", "category": "Computer Science", "edition": "10th", "publisher": "Pearson", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0020", "title": "Python Crash Course", "author": "Eric Matthes", "isbn": "978-1718502703", "category": "Computer Science", "edition": "3rd", "publisher": "No Starch Press", "total_copies": 5, "available_copies": 5},
    {"accession_number": "BB-0021", "title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "isbn": "978-0374533557", "category": "Psychology", "edition": "1st", "publisher": "Farrar, Straus and Giroux", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0022", "title": "Sapiens: A Brief History of Humankind", "author": "Yuval Noah Harari", "isbn": "978-0062316097", "category": "History", "edition": "1st", "publisher": "Harper", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0023", "title": "The Design of Everyday Things", "author": "Don Norman", "isbn": "978-0465050659", "category": "Design", "edition": "Revised", "publisher": "Basic Books", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0024", "title": "Atomic Habits", "author": "James Clear", "isbn": "978-0735211292", "category": "Management", "edition": "1st", "publisher": "Avery", "total_copies": 5, "available_copies": 5},
    {"accession_number": "BB-0025", "title": "The Lean Startup", "author": "Eric Ries", "isbn": "978-0307887894", "category": "Management", "edition": "1st", "publisher": "Crown Business", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0026", "title": "1984", "author": "George Orwell", "isbn": "978-0451524935", "category": "Fiction", "edition": "Signet Classic", "publisher": "Signet Classic", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0027", "title": "To Kill a Mockingbird", "author": "Harper Lee", "isbn": "978-0061935466", "category": "Fiction", "edition": "Perennial Modern Classics", "publisher": "Harper Perennial", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0028", "title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "isbn": "978-0743273565", "category": "Fiction", "edition": "1st Scribner", "publisher": "Scribner", "total_copies": 4, "available_copies": 4},
    {"accession_number": "BB-0029", "title": "Introduction to the Theory of Computation", "author": "Michael Sipser", "isbn": "978-1133187790", "category": "Computer Science", "edition": "3rd", "publisher": "Cengage", "total_copies": 3, "available_copies": 3},
    {"accession_number": "BB-0030", "title": "Cracking the Coding Interview", "author": "Gayle Laakmann McDowell", "isbn": "978-0984782857", "category": "Computer Science", "edition": "6th", "publisher": "CareerCup", "total_copies": 5, "available_copies": 5},
]


class Command(BaseCommand):
    help = "Seed the database with sample book records."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing books before seeding.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Book.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing book(s)."))

        created = 0
        skipped = 0

        for book_data in SAMPLE_BOOKS:
            _, was_created = Book.objects.get_or_create(
                accession_number=book_data["accession_number"],
                defaults=book_data,
            )
            if was_created:
                created += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeding complete: {created} book(s) created, {skipped} already existed."
        ))

