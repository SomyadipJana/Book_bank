"""Custom permissions for role-based access control."""
from rest_framework.permissions import BasePermission


class IsLibrarian(BasePermission):
    """Allow access only to users with the librarian role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "librarian"
        )


class IsStudent(BasePermission):
    """Allow access only to users with the student role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "student"
        )


class IsVendor(BasePermission):
    """Allow access only to users with the vendor role."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "vendor"
        )


class IsOwnerOrLibrarian(BasePermission):
    """Allow a student to access their own data, or a librarian to access any."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == "librarian":
            return True
        # obj could be a StudentProfile or have a .user attribute
        if hasattr(obj, "user"):
            return obj.user == request.user
        return False
