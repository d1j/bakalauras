import json
import os

import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions

from tools.serializers import TestScrapeRequestSerializer

SCRAPING_HOST = os.getenv("TOOLS_TEST_SCRAPE_HOST")

class TestScrape(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, format=None):
        serializer = TestScrapeRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.data
            for command in data["commands"]:
                if command["option"] == "tag_attributes":
                    command["value"] = json.loads(command["value"])
            print(data)
            response = requests.post(SCRAPING_HOST, json=data)
            return Response(response.json(), status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
