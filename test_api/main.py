import asyncio
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    ts = datetime.now()
    print(f"received {ts}")
    await asyncio.sleep(5)
    print(f"responded {ts}")
    return {"message": "Hello World"}

@app.get("/400")
async def bad_request():
    raise HTTPException(status_code=400)