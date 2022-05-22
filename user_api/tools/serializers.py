from rest_framework import serializers

HTML_COMMAND_OPTIONS_CHOICES = [
    ("xpath", "xpath"),
    ("css_selector", "css_selector"),
    ("css_class", "css_class"),
    ("css_id", "css_id"),
    ("tag_attributes", "tag_attributes"),
]


class TestScrapeCommandSerializer(serializers.Serializer):
    command_id = serializers.IntegerField()
    option = serializers.ChoiceField(HTML_COMMAND_OPTIONS_CHOICES)
    value = serializers.CharField()
    html_tag = serializers.CharField(required=False)


class TestScrapeRequestSerializer(serializers.Serializer):
    url = serializers.CharField()
    commands = TestScrapeCommandSerializer(required=True, many=True)

    def validate_commands(self, attrs):
        if len(attrs) == 0:
            raise serializers.ValidationError("At least one command is required")
        return attrs
