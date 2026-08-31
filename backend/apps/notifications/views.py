"""Notification views — read own notifications."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """Return current user's notifications, newest first."""
    qs = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    """Mark a single notification as read."""
    try:
        notif = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    notif.is_read = True
    notif.save(update_fields=["is_read"])
    return Response(NotificationSerializer(notif).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all of the current user's notifications as read."""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({"detail": "All notifications marked as read."})
