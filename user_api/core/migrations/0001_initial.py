# Generated by Django 4.0.3 on 2022-05-08 11:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ApschedulerJobs',
            fields=[
                ('id', models.CharField(max_length=191, primary_key=True, serialize=False)),
                ('next_run_time', models.FloatField(blank=True, null=True)),
                ('job_state', models.BinaryField()),
            ],
            options={
                'db_table': 'apscheduler_jobs',
            },
        ),
        migrations.CreateModel(
            name='HtmlScrapeCommand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('description', models.CharField(blank=True, default='', max_length=256)),
                ('option', models.CharField(choices=[('xpath', 'xpath'), ('css_selector', 'css_selector'), ('css_class', 'css_class'), ('css_id', 'css_id'), ('tag_attributes', 'tag_attributes')], max_length=64)),
                ('value', models.CharField(max_length=2048)),
                ('html_tag', models.CharField(default='', max_length=256)),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'core_html_scrape_command',
            },
        ),
        migrations.CreateModel(
            name='HtmlScrapeSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('description', models.CharField(blank=True, default='', max_length=512)),
                ('url', models.CharField(max_length=2048)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('start_date', models.DateTimeField()),
                ('frequency', models.CharField(choices=[('hourly', 'hourly'), ('daily', 'daily'), ('weekly', 'weekly'), ('monthly', 'monthly'), ('debug5s', 'debug5s')], max_length=64)),
                ('active', models.BooleanField(default=True)),
                ('job_schedule', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.apschedulerjobs')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='html_scrape_schedules', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'core_html_scrape_schedule',
            },
        ),
        migrations.CreateModel(
            name='HtmlScrapeCommandResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('result', models.CharField(max_length=8192)),
                ('command_run_date', models.DateTimeField(auto_now_add=True)),
                ('success', models.BooleanField()),
                ('html_scrape_command', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='html_scrape_command_results', to='core.htmlscrapecommand')),
            ],
            options={
                'db_table': 'core_html_scrape_command_result',
            },
        ),
        migrations.AddField(
            model_name='htmlscrapecommand',
            name='html_scrape_schedule',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='html_scrape_commands', to='core.htmlscrapeschedule'),
        ),
    ]