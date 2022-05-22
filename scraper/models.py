from enum import Enum
from typing import Optional, Union

from pydantic import BaseModel


class HtmlCommandOptions(str, Enum):
    XPATH = "xpath"
    CSS_SELECTOR = "css_selector"
    CSS_CLASS = "css_class"
    CSS_ID = "css_id"
    TAG_ATTRIBUTES = "tag_attributes"


class HtmlCommand(BaseModel):
    command_id: int
    option: HtmlCommandOptions
    value: Union[str, dict]
    html_tag: Optional[str]


class HtmlScrapeRequest(BaseModel):
    url: str
    commands: list[HtmlCommand]
