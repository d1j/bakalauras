from rest_framework import permissions

from core.models import HtmlScrapeSchedule


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to CRUD it.
    """

    def has_object_permission(self, request, view, obj):
        if request.method == "POST":
            return True
        return obj.owner == request.user


class IsCommandRelatedToOwnerSchedule(permissions.BasePermission):
    def _is_schedule_owner(self, schedule_id, user):
        user_html_scrape_schedules = HtmlScrapeSchedule.objects.filter(
            owner=user
        ).values_list("id", flat=True)
        if schedule_id not in user_html_scrape_schedules:
            return False
        return True

    def has_permission(self, request, view):
        if view.action == "create":
            return self._is_schedule_owner(
                request.data["html_scrape_schedule"], request.user
            )
        return True

    def has_object_permission(self, request, view, obj):
        return self._is_schedule_owner(obj.html_scrape_schedule_id, request.user)
