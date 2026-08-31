"""Book catalogue views with search, filter, and CRUD."""
from django.db.models import Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.permissions import IsLibrarian
from .models import Book
from .serializers import BookListSerializer, BookDetailSerializer, BookCreateUpdateSerializer


class BookViewSet(viewsets.ModelViewSet):
    """
    Book catalogue endpoint.

    - GET  /api/books/              — paginated catalog list (all authenticated)
    - GET  /api/books/<accession>/  — full detail (all authenticated)
    - POST /api/books/              — create (librarian only)
    - PUT  /api/books/<accession>/  — update (librarian only)
    - DELETE /api/books/<accession>/— soft delete (librarian only)
    - GET  /api/books/search/?q=   — full-text search (all authenticated)
    """
    queryset = Book.objects.filter(is_active=True)
    lookup_field = "accession_number"
    lookup_url_kwarg = "accession"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "format"]
    search_fields = ["title", "author", "isbn", "accession_number"]
    ordering_fields = ["title", "added_date", "available_copies"]
    ordering = ["title"]

    def get_serializer_class(self):
        if self.action in ("list", "search"):
            return BookListSerializer
        if self.action in ("create", "update", "partial_update"):
            return BookCreateUpdateSerializer
        return BookDetailSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsLibrarian()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        """Soft-delete: set is_active=False instead of removing the row."""
        book = self.get_object()
        book.is_active = False
        book.save(update_fields=["is_active"])
        return Response({"detail": "Book deactivated."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        """Full-text search across title, author, and ISBN."""
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": "q parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(
            Q(title__icontains=q) |
            Q(author__icontains=q) |
            Q(isbn__icontains=q) |
            Q(accession_number__icontains=q)
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(BookListSerializer(page, many=True).data)
        return Response(BookListSerializer(qs, many=True).data)
