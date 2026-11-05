"""Notification views."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    GET /api/notifications/
    Returns all notifications for the requesting user.
    Optional: ?unread=true to filter only unread.
    """
    qs = Notification.objects.filter(recipient=request.user).select_related("related_book")
    unread_only = request.query_params.get("unread", "false").lower() == "true"
    if unread_only:
        qs = qs.filter(is_read=False)
    return Response(NotificationSerializer(qs, many=True).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    """
    Mark a single notification as read.
    PUT /api/notifications/<pk>/read/
    """
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
    """
    Mark all of the user's notifications as read.
    POST /api/notifications/mark-all-read/
    """
    updated = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({"detail": f"{updated} notification(s) marked as read."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    """
    Delete a single notification.
    DELETE /api/notifications/<pk>/
    """
    try:
        notif = Notification.objects.get(pk=pk, recipient=request.user)
    except Notification.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    notif.delete()
    return Response({"detail": "Notification deleted."}, status=status.HTTP_200_OK)

