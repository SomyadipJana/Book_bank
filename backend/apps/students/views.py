"""Student profile views — full CRUD + sub-resources + document upload."""
from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian, IsOwnerOrLibrarian
from .models import StudentProfile, Document
from .serializers import StudentProfileSerializer, StudentProfileUpdateSerializer, DocumentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Student profile management.

    GET  /api/students/                     — librarian: all, student: own
    GET  /api/students/<id>/                — own or librarian
    PUT  /api/students/<id>/                — update own profile
    GET  /api/students/me/                  — shortcut for own profile
    GET  /api/students/<id>/loans/          — active loans
    GET  /api/students/<id>/history/        — returned loan history
    GET  /api/students/<id>/reservations/   — reservations
    GET  /api/students/<id>/fines/          — fines
    GET  /api/students/<id>/documents/      — list documents
    POST /api/students/<id>/documents/      — upload a document
    DELETE /api/students/<id>/documents/<doc_id>/ — delete a document
    """
    queryset = StudentProfile.objects.select_related("user").all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "librarian":
            return super().get_queryset()
        # Students can only see their own profile
        return super().get_queryset().filter(user=user)

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer

    def get_permissions(self):
        if self.action == "destroy":
            return [IsAuthenticated(), IsLibrarian()]
        return [IsAuthenticated()]

    # ── /me shortcut ─────────────────────────────────────────────────────────
    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Return the requesting student's own profile."""
        try:
            profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentProfileSerializer(profile).data)

    # ── Active loans ──────────────────────────────────────────────────────────
    @action(detail=True, methods=["get"])
    def loans(self, request, pk=None):
        student = self.get_object()
        from apps.issues.serializers import IssueSerializer
        qs = student.issues.filter(status="active").select_related("book")
        return Response(IssueSerializer(qs, many=True).data)

    # ── Loan history ──────────────────────────────────────────────────────────
    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        student = self.get_object()
        from apps.issues.serializers import IssueSerializer
        qs = student.issues.filter(status="returned").select_related("book").order_by("-issue_date")
        return Response(IssueSerializer(qs, many=True).data)

    # ── Reservations ──────────────────────────────────────────────────────────
    @action(detail=True, methods=["get"])
    def reservations(self, request, pk=None):
        student = self.get_object()
        from apps.reservations.serializers import ReservationSerializer
        qs = student.reservations.select_related("book").order_by("-reserved_date")
        return Response(ReservationSerializer(qs, many=True).data)

    # ── Fines ─────────────────────────────────────────────────────────────────
    @action(detail=True, methods=["get"])
    def fines(self, request, pk=None):
        student = self.get_object()
        from apps.fines.serializers import FineSerializer
        qs = student.fines.select_related("book", "issue").order_by("-id")
        return Response(FineSerializer(qs, many=True).data)

    # ── Documents — list & upload ─────────────────────────────────────────────
    @action(
        detail=True,
        methods=["get", "post"],
        url_path="documents",
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def documents(self, request, pk=None):
        """
        GET  — list all documents for this student.
        POST — upload a new document (multipart/form-data).
              Fields: document_type, file, notes (optional)
        """
        student = self.get_object()

        if request.method == "GET":
            docs = student.documents.all()
            return Response(DocumentSerializer(docs, many=True).data)

        # POST
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ── Documents — delete ────────────────────────────────────────────────────
    @action(
        detail=True,
        methods=["delete"],
        url_path=r"documents/(?P<doc_id>\d+)",
    )
    def delete_document(self, request, pk=None, doc_id=None):
        """DELETE /api/students/<id>/documents/<doc_id>/"""
        student = self.get_object()
        try:
            doc = student.documents.get(pk=doc_id)
        except Document.DoesNotExist:
            return Response({"detail": "Document not found."}, status=status.HTTP_404_NOT_FOUND)
        doc.file.delete(save=False)
        doc.delete()
        return Response({"detail": "Document deleted."}, status=status.HTTP_200_OK)

