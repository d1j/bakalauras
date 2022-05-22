import os
from datetime import datetime

import pytz

import scrapers
from errors import FailedRequest, FailedToGetHtml, InvalidArgument
from models import HtmlScrapeRequest
from parsers import CommandExecutor, HtmlParser


class HtmlScrapeRequestProcessor:
    def __init__(self, scrape_request: HtmlScrapeRequest):
        self._scrape_request = scrape_request
        self._scrape_time = None

    async def _scrape_html(self) -> str:
        try:
            self._scrape_time = datetime.utcnow().replace(
                tzinfo=pytz.utc, microsecond=0
            )
            return await scrapers.scrape_html(self._scrape_request.url)
        except FailedRequest as err:
            raise FailedToGetHtml(f"Failed to scrape data. {err}")

    def _save_html_locally(self, html:str) -> None:
        curr_date = str(datetime.now()).replace(" ", "_")
        html_dir = "./htmls"
        if not os.path.isdir(html_dir):
            os.mkdir(html_dir)
        with open(f"{html_dir}/{curr_date}.html", "w") as outfile:
            outfile.write(html)

    def _parse_html(self, html: str) -> dict:
        parser = HtmlParser(html)
        executor = CommandExecutor(parser)

        return_data = {}
        for command in self._scrape_request.commands:
            command_data = {"command_run_date": self._scrape_time.isoformat()}
            try:
                found_value = executor.get_from_html(command)
                command_data.update({"success": True, "result": found_value})
            except InvalidArgument as err:
                print(err)
                command_data.update(
                    {
                        "success": False,
                        "result": [str(err)],
                    }
                )
            return_data[command.command_id] = command_data

        return return_data

    async def process(self) -> dict:
        try:
            html = await self._scrape_html()
        except FailedToGetHtml as err:
            return {
                command.command_id: {
                    "command_run_date": self._scrape_time,
                    "result": [str(err)],
                    "success": False,
                }
                for command in self._scrape_request.commands
            }
        self._save_html_locally(html)
        return self._parse_html(html)
