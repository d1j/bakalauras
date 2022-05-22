import logging
import os
from typing import Any, Optional, Union

from sqlalchemy import MetaData, create_engine, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import sessionmaker


class Database:
    def __init__(self):
        self._engine = create_engine(os.getenv("POSTGRESS_CONNECTION"))
        self._Session = sessionmaker(self._engine)

        self._metadata = MetaData()
        self._metadata.reflect(
            self._engine,
            only=[
                "apscheduler_jobs",
                "core_html_scrape_schedule",
                "core_html_scrape_command",
                "core_html_scrape_command_result",
                "auth_user",
            ],
        )

        self._Base = automap_base(metadata=self._metadata)
        self._Base.prepare()

        self._ApschedulerJobs = self._Base.classes.apscheduler_jobs
        self._HtmlScrapeSchedule = self._Base.classes.core_html_scrape_schedule
        self._HtmlScrapeCommand = self._Base.classes.core_html_scrape_command
        self._HtmlScrapeCommandResult = (
            self._Base.classes.core_html_scrape_command_result
        )
        self._AuthUser = self._Base.classes.auth_user

    def get_schedule_with_active_commands(self, schedule_id: int):
        with self._Session() as session:
            schedule_query = select(self._HtmlScrapeSchedule).where(
                self._HtmlScrapeSchedule.id == schedule_id,
            )
            try:
                schedule = session.scalars(schedule_query).one()
            except NoResultFound:
                return None, None

            commands_query = select(self._HtmlScrapeCommand).where(
                self._HtmlScrapeCommand.html_scrape_schedule_id == schedule_id,
                self._HtmlScrapeCommand.active == True,
            )
            try:
                commands = session.scalars(commands_query).all()
            except NoResultFound:
                return schedule, None

            return schedule, commands

    def set_schedule_job_id(self, schedule_id: int, job_id: str) -> None:
        with self._Session() as session:
            query = select(self._HtmlScrapeSchedule).where(
                self._HtmlScrapeSchedule.id == schedule_id
            )
            schedule = session.scalars(query).one()
            schedule.job_schedule_id = job_id
            session.commit()

    def delete_schedule_job_id(self, schedule_id: int) -> None:
        with self._Session() as session:
            query = select(self._HtmlScrapeSchedule).where(
                self._HtmlScrapeSchedule.id == schedule_id
            )
            schedule = session.scalars(query).one()
            schedule.job_schedule_id = None
            session.commit()

    def get_job_id(self, schedule_id: str) -> Union[int, None]:
        with self._Session() as session:
            query = (
                select(self._ApschedulerJobs.id)
                .join(
                    self._HtmlScrapeSchedule,
                    self._ApschedulerJobs.id
                    == self._HtmlScrapeSchedule.job_schedule_id,
                )
                .where(self._HtmlScrapeSchedule.id == schedule_id)
            )
            try:
                job_id = session.scalars(query).one()
            except NoResultFound:
                logging.error(
                    f"Could not find job id associated with schedule {schedule_id}"
                )
                return None
            return job_id

    def get_schedule(self, schedule_id: str) -> Any:
        with self._Session() as session:
            schedule_query = select(self._HtmlScrapeSchedule).where(
                self._HtmlScrapeSchedule.id == schedule_id
            )
            schedule = session.scalars(schedule_query).one()
            return schedule

    def add_html_scrape_command_results(self, command_results: list) -> None:
        with self._Session() as session:
            for command_result in command_results:
                session.add(self._HtmlScrapeCommandResult(**command_result))
            session.commit()

    def get_two_most_recent_html_scrape_command_results(self, command_id: int):
        with self._Session() as session:
            query = (
                select(self._HtmlScrapeCommandResult)
                .join(
                    self._HtmlScrapeCommand,
                    self._HtmlScrapeCommand.id
                    == self._HtmlScrapeCommandResult.html_scrape_command_id,
                )
                .where(self._HtmlScrapeCommand.id == command_id)
                .order_by(self._HtmlScrapeCommandResult.command_run_date.desc())
                .limit(2)
            )
            try:
                return session.scalars(query).all()
            except NoResultFound:
                return None

    def get_user_email(self, schedule_id: int) -> Optional[str]:
        with self._Session() as session:
            query = (
                select(self._AuthUser.email)
                .join(
                    self._HtmlScrapeSchedule,
                    self._HtmlScrapeSchedule.owner_id == self._AuthUser.id,
                )
                .where(self._HtmlScrapeSchedule.id == schedule_id)
            )
            try:
                return session.scalars(query).one()
            except NoResultFound:
                return None
