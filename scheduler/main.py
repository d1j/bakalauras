from fastapi import FastAPI
from fastapi.responses import Response

from scrape_scheduler import ScrapeScheduler

app = FastAPI()

SCRAPE_SCHEDULER = ScrapeScheduler()


@app.get("/start_schedule/{schedule_id}")
def start_schedule(schedule_id: int):
    SCRAPE_SCHEDULER.start_schedule(schedule_id)
    return Response(status_code=200)


@app.get("/remove_schedule/{schedule_id}")
def remove_schedule(schedule_id: int):
    SCRAPE_SCHEDULER.remove_schedule(schedule_id)
    return Response(status_code=200)


@app.get("/pause_schedule/{schedule_id}")
def remove_schedule(schedule_id: int):
    SCRAPE_SCHEDULER.pause_schedule(schedule_id)
    return Response(status_code=200)


@app.get("/resume_schedule/{schedule_id}")
def remove_schedule(schedule_id: int):
    SCRAPE_SCHEDULER.resume_schedule(schedule_id)
    return Response(status_code=200)


@app.get("/restart_schedule/{schedule_id}")
def remove_schedule(schedule_id: int):
    SCRAPE_SCHEDULER.remove_schedule(schedule_id)
    SCRAPE_SCHEDULER.start_schedule(schedule_id)
    return Response(status_code=200)
