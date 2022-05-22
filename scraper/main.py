from fastapi import FastAPI

import uvicorn

from html_scrape_request_processor import HtmlScrapeRequestProcessor
from models import HtmlScrapeRequest

app = FastAPI()


@app.post("/scrape_html")
async def scrape(scrape_request: HtmlScrapeRequest):
    return await HtmlScrapeRequestProcessor(scrape_request).process()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
