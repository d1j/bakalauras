from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    HtmlScrapeCommandResultViewSet,
    HtmlScrapeCommandViewSet,
    ScrapeScheduleViewSet,
)

router = DefaultRouter()
router.register(r"html_scrape_command", HtmlScrapeCommandViewSet)
router.register(r"scrape_schedule", ScrapeScheduleViewSet)


# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", include(router.urls)),
    path(
        "html_scrape_command_result/<int:pk>/", HtmlScrapeCommandResultViewSet.as_view()
    ),
]
