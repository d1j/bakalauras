# urls.py
from django.urls import path
from .views import TestScrape

urlpatterns = [
    path("test_scrape_html/", TestScrape.as_view()),
]
