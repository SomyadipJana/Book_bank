"""Authentication & account views: register, login, logout, refresh, me, change-password."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new student account and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """Authenticate and return JWT access + refresh tokens."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Blacklist the provided refresh token (logout)."""
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def token_refresh(request):
    """Return a new access token given a valid refresh token."""
    from rest_framework_simplejwt.views import TokenRefreshView
    return TokenRefreshView.as_view()(request._request)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """Return the currently authenticated user's profile."""
    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Allow any authenticated user to change their own password."""
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    if not user.check_password(serializer.validated_data["old_password"]):
        return Response({"old_password": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data["new_password"])
    user.save()
    return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_vendor_user(request):
    """
    Librarian-only: create a vendor-role user account.
    POST /api/auth/create-vendor/
    Body: { email, full_name, password }
    """
    from apps.accounts.permissions import IsLibrarian
    if request.user.role != "librarian":
        return Response({"detail": "Only librarians can create vendor accounts."}, status=status.HTTP_403_FORBIDDEN)

    email = request.data.get("email", "").strip()
    full_name = request.data.get("full_name", "").strip()
    password = request.data.get("password", "")

    if not email or not full_name or not password:
        return Response({"detail": "email, full_name, and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    from .models import User
    if User.objects.filter(email=email).exists():
        return Response({"detail": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

    vendor_user = User.objects.create_user(
        email=email,
        password=password,
        full_name=full_name,
        role=User.Role.VENDOR,
    )
    return Response(
        {"detail": "Vendor account created.", "user": UserSerializer(vendor_user).data},
        status=status.HTTP_201_CREATED,
    )

