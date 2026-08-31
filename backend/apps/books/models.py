"""Book catalogue and inventory model."""
from django.db import models


class Book(models.Model):
    class Category(models.TextChoices):
        COMPUTER_SCIENCE = "Computer Science", "Computer Science"
        ENGINEERING = "Engineering", "Engineering"
        MATHEMATICS = "Mathematics", "Mathematics"
        ALGORITHMS_DS = "Algorithms & DS", "Algorithms & DS"
        SYSTEMS_OS = "Systems & OS", "Systems & OS"
        NETWORKS = "Networks", "Networks"
        FICTION = "Fiction", "Fiction"
        PSYCHOLOGY = "Psychology", "Psychology"
        MANAGEMENT = "Management", "Management"
        HISTORY = "History", "History"
        DESIGN = "Design", "Design"
        REFERENCE = "Reference", "Reference"
        OTHER = "Other", "Other"

    class Format(models.TextChoices):
        BOOK = "Book", "Book"
        MAGAZINE = "Magazine", "Magazine"
        REFERENCE = "Reference", "Reference"

    accession_number = models.CharField(max_length=20, unique=True, db_index=True)
    title = models.CharField(max_length=512)
    author = models.CharField(max_length=512)
    isbn = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    edition = models.CharField(max_length=100, blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.OTHER)
    format = models.CharField(max_length=20, choices=Format.choices, default=Format.BOOK)
    description = models.TextField(blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    added_date = models.DateField(auto_now_add=True)
    vendor = models.ForeignKey(
        "vendors.Vendor", on_delete=models.SET_NULL, null=True, blank=True, related_name="books"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    cover_url = models.TextField(blank=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"[{self.accession_number}] {self.title}"

    @property
    def available(self):
        return self.available_copies > 0
