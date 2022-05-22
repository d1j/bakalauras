from django.db import models

HTML_SCRAPE_FREQUENCY_CHOISES = [
    ("hourly", "hourly"),
    ("daily", "daily"),
    ("weekly", "weekly"),
    ("monthly", "monthly"),
    ("debug5s", "debug5s"),
]


HTML_COMMAND_OPTIONS = [
    ("xpath", "xpath"),
    ("css_selector", "css_selector"),
    ("css_class", "css_class"),
    ("css_id", "css_id"),
    ("tag_attributes", "tag_attributes"),
]


class ApschedulerJobs(models.Model):
    id = models.CharField(primary_key=True, max_length=191)
    next_run_time = models.FloatField(blank=True, null=True)
    job_state = models.BinaryField()

    class Meta:
        db_table = "apscheduler_jobs"


class HtmlScrapeSchedule(models.Model):
    name = models.CharField(max_length=128, blank=False)
    description = models.CharField(max_length=512, default="", blank=True)
    url = models.CharField(max_length=2048, blank=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    start_date = models.DateTimeField(blank=False)
    frequency = models.CharField(
        max_length=64, choices=HTML_SCRAPE_FREQUENCY_CHOISES, blank=False
    )
    owner = models.ForeignKey(
        "auth.User", related_name="html_scrape_schedules", on_delete=models.CASCADE
    )
    active = models.BooleanField(default=True)
    job_schedule = models.ForeignKey(
        ApschedulerJobs, on_delete=models.SET_NULL, blank=True, null=True
    )

    class Meta:
        db_table = "core_html_scrape_schedule"


class HtmlScrapeCommand(models.Model):
    name = models.CharField(max_length=128, blank=False)
    description = models.CharField(max_length=256, default="", blank=True)
    option = models.CharField(max_length=64, blank=False, choices=HTML_COMMAND_OPTIONS)
    value = models.CharField(max_length=2048, blank=False)
    html_tag = models.CharField(max_length=256, default="")
    html_scrape_schedule = models.ForeignKey(
        HtmlScrapeSchedule,
        related_name="html_scrape_commands",
        on_delete=models.CASCADE,
    )
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "core_html_scrape_command"


class HtmlScrapeCommandResult(models.Model):
    result = models.CharField(max_length=8192)
    command_run_date = models.DateTimeField(auto_now_add=True)
    success = models.BooleanField()
    html_scrape_command = models.ForeignKey(
        HtmlScrapeCommand,
        related_name="html_scrape_command_results",
        on_delete=models.CASCADE,
    )

    class Meta:
        db_table = "core_html_scrape_command_result"
