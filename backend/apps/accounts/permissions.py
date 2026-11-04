"""Custom permissions for role-based access control."""
from rest_framework.permissions import BasePermission


class IsLibrarian(BasePermission):
    """Allow access only to librarian-role users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "librarian"
        )


class IsStudent(BasePermission):
    """Allow access only to student-role users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "student"
        )


class IsVendor(BasePermission):
    """Allow access only to vendor-role users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "vendor"
        )


class IsLibrarianOrVendor(BasePermission):
    """Allow librarians and vendors (e.g. to view their own orders)."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ("librarian", "vendor")
        )


class IsOwnerOrLibrarian(BasePermission):
    """Allow a student to access their own data, or a librarian to access any."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == "librarian":
            return True
        if hasattr(obj, "user"):
            return obj.user == request.user
        return False

