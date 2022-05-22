from enum import Enum


class HtmlCommandOptions(str, Enum):
    XPATH = "xpath"
    CSS_SELECTOR = "css_selector"
    CSS_CLASS = "css_class"
    CSS_ID = "css_id"
    TAG_ATTRIBUTES = "tag_attributes"
