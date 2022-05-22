import os

from apscheduler.executors.pool import ProcessPoolExecutor, ThreadPoolExecutor
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pytz import utc


class JobScheduler:
    def __init__(self):
        jobstores = {
            "default": SQLAlchemyJobStore(url=os.getenv("POSTGRESS_CONNECTION"))
        }
        executors = {
            "default": ThreadPoolExecutor(20),
            "processpool": ProcessPoolExecutor(5),
        }
        job_defaults = {"coalesce": False, "max_instances": 3}
        self._scheduler = AsyncIOScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults=job_defaults,
            timezone=utc,
        )

        self._scheduler.start()

    def start_job(self, func, start_date, frequency, func_data):
        return self._scheduler.add_job(
            func,
            trigger="interval",
            seconds=frequency,
            start_date=start_date,
            misfire_grace_time=60,
            kwargs={**func_data},
        ).id

    def remove_job(self, job_id):
        self._scheduler.remove_job(job_id)

    def pause_job(self, job_id):
        self._scheduler.pause_job(job_id)

    def resume_job(self, job_id):
        self._scheduler.resume_job(job_id)
