"""Student profile views."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsLibrarian, IsOwnerOrLibrarian
from .models import StudentProfile
from .serializers import StudentProfileSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Student profile management.

    - GET  /api/students/               — librarian: all students
    - GET  /api/students/<id>/          — own profile or librarian
    - PUT  /api/students/<id>/          — update own profile
    - GET  /api/students/me/            — own profile shortcut
    - GET  /api/students/<id>/loans/    — active loans
    - GET  /api/students/<id>/history/  — loan history
    - GET  /api/students/<id>/reservations/ — reservations
    - GET  /api/students/<id>/fines/    — fines
    """
    queryset = StudentProfile.objects.select_related("user").all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "librarian":
            return super().get_queryset()
        return super().get_queryset().filter(user=user)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """Return the current student's own profile."""
        try:
            profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StudentProfileSerializer(profile).data)

    @action(detail=True, methods=["get"])
    def loans(self, request, pk=None):
        """Active loans for a student."""
        student = self.get_object()
        from apps.issues.serializers import IssueSerializer
        qs = student.issues.filter(status="active").select_related("book")
        return Response(IssueSerializer(qs, many=True).data)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        """Returned loan history for a student."""
        student = self.get_object()
        from apps.issues.serializers import IssueSerializer
        qs = student.issues.filter(status="returned").select_related("book").order_by("-issue_date")
        return Response(IssueSerializer(qs, many=True).data)

    @action(detail=True, methods=["get"])
    def reservations(self, request, pk=None):
        """Reservations for a student."""
        student = self.get_object()
        from apps.reservations.serializers import ReservationSerializer
        qs = student.reservations.select_related("book").order_by("-reserved_date")
        return Response(ReservationSerializer(qs, many=True).data)

    @action(detail=True, methods=["get"])
    def fines(self, request, pk=None):
        """Fines for a student."""
        student = self.get_object()
        from apps.fines.serializers import FineSerializer
        qs = student.fines.select_related("book", "issue").order_by("-id")
        return Response(FineSerializer(qs, many=True).data)
