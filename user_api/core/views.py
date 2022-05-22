import os

import requests
from django.db.models import Count
from django.http import JsonResponse
from rest_framework import generics, permissions, viewsets

from .models import (HtmlScrapeCommand, HtmlScrapeCommandResult,
                     HtmlScrapeSchedule)
from .permissions import IsCommandRelatedToOwnerSchedule, IsOwner
from .serializers import (HtmlScrapeCommandResultSerializer,
                          HtmlScrapeCommandSerializer,
                          HtmlScrapeScheduleSerializer)

SCHEDULER_HOST = os.environ.get("SCHEDULER_HOST")


class ScrapeScheduleViewSet(viewsets.ModelViewSet):
    queryset = HtmlScrapeSchedule.objects.all()
    serializer_class = HtmlScrapeScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        queryset = (
            HtmlScrapeSchedule.objects.filter(owner=self.request.user)
            .annotate(num_commands=Count("html_scrape_commands"))
            .all()
        )
        return queryset

    def perform_create(self, serializer):
        schedule_id = serializer.save(owner=self.request.user).id
        url = f"{SCHEDULER_HOST}/start_schedule/{schedule_id}"
        requests.get(url)

    def perform_update(self, serializer):
        schedule = serializer.save()
        serializer_active = schedule.active
        database_active = HtmlScrapeSchedule.objects.get(id=schedule.id)
        if serializer_active != database_active:
            if serializer_active:
                # User wishes to activate schedule.
                requests.get(f"{SCHEDULER_HOST}/resume_schedule/{schedule.id}")
            else:
                # User wishes to deactivate schedule.
                requests.get(f"{SCHEDULER_HOST}/pause_schedule/{schedule.id}")

    def perform_destroy(self, instance):
        schedule_id = instance.id
        url = f"{SCHEDULER_HOST}/remove_schedule/{schedule_id}"
        requests.get(url)
        return super().perform_destroy(instance)


class HtmlScrapeCommandViewSet(viewsets.ModelViewSet):
    queryset = HtmlScrapeCommand.objects.all()
    serializer_class = HtmlScrapeCommandSerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsCommandRelatedToOwnerSchedule,
    ]

    def get_queryset(self):
        queryset = HtmlScrapeCommand.objects.annotate(
            num_results=Count("html_scrape_command_results")
        ).all()
        schedule = self.request.query_params.get("schedule")
        if schedule:
            queryset = queryset.filter(html_scrape_schedule__id=schedule)

        return queryset


class HtmlScrapeCommandResultViewSet(generics.ListAPIView):
    serializer_class = HtmlScrapeCommandResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HtmlScrapeCommandResult.objects.filter(
            html_scrape_command__html_scrape_schedule__owner=self.request.user,
            html_scrape_command__id=self.kwargs.get("pk"),
        ).order_by("command_run_date")

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = HtmlScrapeCommandResultSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)
