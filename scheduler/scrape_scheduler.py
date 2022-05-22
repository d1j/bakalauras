import json
import logging
import os
from datetime import datetime, timedelta

import pytz
import requests

from database import Database
from job_scheduler import JobScheduler

DB = Database()


SCRAPER_HOST = os.getenv("SCRAPER_HOST")
MAILER_HOST = os.getenv("MAILER_HOST")

logging.basicConfig(level=logging.INFO)


def get_schedule_info(schedule) -> str:
    if not schedule:
        return "get_schedule_info() received `None`"
    return (
        "Schedule info:\n"
        f"\t* ID: {schedule.id}\n"
        f"\t* Name: {schedule.name}\n"
        f"\t* Description {schedule.description}\n"
        f"\t* URL {schedule.url}\n"
    )


def get_command_info(command) -> str:
    if not command:
        return "get_command_info() received `None`"
    return (
        "Command info:\n"
        f"\t* ID: {command.id}\n"
        f"\t* Name: {command.name}\n"
        f"\t* Option: {command.option}\n"
        f"\t* Value: {command.value}\n"
    )


def get_failed_commands_msg(schedule, commands, commands_results: list) -> str:
    message = ""
    for result in commands_results:
        if not result["success"]:
            if not message:
                message += (
                    "---------------------------------------------\n"
                    "Scraper failed to process the following commands:\n"
                    + get_schedule_info(schedule)
                    + "---------------------------------------------\n"
                )
            for command in commands:
                if command.id == result["html_scrape_command_id"]:
                    message += (
                        f"{get_command_info(command)}"
                        "Command result:\n"
                        f"\t* Value: {result['result']}\n"
                        "---------------------------------------------\n"
                    )
                    break

    return message


def get_result_change_msg(schedule, commands) -> str:
    message = ""
    for command in commands:
        results = DB.get_two_most_recent_html_scrape_command_results(command.id)
        if not results or len(results) < 2:
            continue
        if (
            results[0].result == results[1].result
            and results[0].success == results[1].success
        ):
            continue
        if not message:
            message += (
                "---------------------------------------------\n"
                "Changes in scraping results detected\n"
                + get_schedule_info(schedule)
                + "---------------------------------------------\n"
            )
        message += (
            get_command_info(command) + f"Changes:\n\n"
            f"\t* Success: {results[1].success}\n"
            f"\t* Result: {results[1].result}"
            "\n\nvvv\n\n"
            f"\t* Success: {results[0].success}\n"
            f"\t* Result: {results[0].result}"
            "\n\n---------------------------------------------\n"
        )
    return message


def get_command_value(command):
    if command.option == "tag_attributes":
        return json.loads(command.value)
    return command.value


def send_mail(user_email, subject, message):
    url = f"{MAILER_HOST}/send_mail"
    data = {
        "user_email": user_email,
        "subject": subject,
        "message": message,
    }
    requests.post(url, json=data)


def scrape_html(schedule_id: int) -> None:
    logging.info(f"\nProcessing <{schedule_id}> schedule\n")
    schedule, commands = DB.get_schedule_with_active_commands(schedule_id)
    if not schedule:
        logging.error("Schedule not found.")
        return
    if not schedule.active:
        logging.info("Schedule is not active.")
        return
    if not len(commands):
        logging.info("Schedule has no active commands. Skipping.")
        return

    schedule_commands = []
    for command in commands:
        if not command.active:
            logging.info(f"Command <{command.id}> is not active.")
            continue
        schedule_commands.append(
            {
                "command_id": command.id,
                "option": command.option,
                "value": get_command_value(command),
                "html_tag": command.html_tag or None,
            }
        )

    scrape_data = {"url": schedule.url, "commands": schedule_commands}

    url = f"{SCRAPER_HOST}/scrape_html"
    response = requests.post(url, json=scrape_data)
    db_results = []
    for command_id, value in response.json().items():
        db_results.append(
            {
                "html_scrape_command_id": int(command_id),
                "success": value["success"],
                "command_run_date": value["command_run_date"],
                "result": "~|~".join(value["result"]),
            }
        )

    DB.add_html_scrape_command_results(db_results)

    failed_command_msg = get_failed_commands_msg(schedule, commands, db_results)

    result_change_msg = get_result_change_msg(schedule, commands)

    message = failed_command_msg + result_change_msg

    if message:
        user_email = DB.get_user_email(schedule.id)
        print(message)
        if not user_email:
            logging.ERROR(f"Failed to find email for schedule <{schedule.id}>")
            return
        send_mail(user_email, "Your Scraper Schedule schanges", message)


class ScrapeScheduler:
    def __init__(self):
        self._scheduler = JobScheduler()
        self._freq_map = {
            "hourly": 3600,
            "daily": 86400,
            "weekly": 604800,
            "debug5s": 5,
        }

    def frequency_to_seconds(self, frequency: str) -> int:
        return self._freq_map[frequency]

    def start_schedule(self, schedule_id: int) -> None:
        schedule = DB.get_schedule(schedule_id)

        current_time = datetime.now(pytz.timezone("UTC"))
        sec_freq = self.frequency_to_seconds(schedule.frequency)
        if schedule.start_date > current_time:
            schedule_start_date = schedule.start_date
        else:
            sec_diff = (current_time - schedule.start_date).total_seconds()
            additional_seconds = sec_diff % sec_freq
            schedule_start_date = current_time + timedelta(seconds=additional_seconds)

        job_id = self._scheduler.start_job(
            scrape_html, schedule_start_date, sec_freq, {"schedule_id": schedule_id}
        )

        DB.set_schedule_job_id(schedule_id, job_id)

    def remove_schedule(self, schedule_id: int) -> None:
        job_id = DB.get_job_id(schedule_id)
        DB.delete_schedule_job_id(schedule_id)
        if job_id:
            self._scheduler.remove_job(job_id)

    def pause_schedule(self, schedule_id: int) -> None:
        job_id = DB.get_job_id(schedule_id)
        self._scheduler.pause_job(job_id)

    def resume_schedule(self, schedule_id: int) -> None:
        job_id = DB.get_job_id(schedule_id)
        self._scheduler.resume_job(job_id)
