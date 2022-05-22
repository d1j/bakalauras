from rest_framework import serializers
from .models import HtmlScrapeCommandResult, HtmlScrapeSchedule, HtmlScrapeCommand


class HtmlScrapeCommandSerializer(serializers.ModelSerializer):
    html_scrape_schedule = serializers.PrimaryKeyRelatedField(
        queryset=HtmlScrapeSchedule.objects.all(),
    )
    num_results = serializers.IntegerField(required=False)

    class Meta:
        model = HtmlScrapeCommand
        fields = [
            "id",
            "name",
            "description",
            "option",
            "value",
            "html_tag",
            "html_scrape_schedule",
            "num_results",
            "active",
        ]
        read_only_fields = ["id", "html_scrape_schedule", "num_results"]


class HtmlScrapeScheduleSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    num_commands = serializers.IntegerField(required=False)

    class Meta:
        model = HtmlScrapeSchedule
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "url",
            "created",
            "updated",
            "start_date",
            "frequency",
            "active",
            "num_commands",
        ]
        read_only_fields = [
            "id",
            "owner",
            "created",
            "updated",
            "num_commands",
        ]


class HtmlScrapeCommandResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = HtmlScrapeCommandResult
        fields = ["id", "result", "command_run_date", "success"]

