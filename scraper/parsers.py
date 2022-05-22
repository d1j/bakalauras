from bs4 import BeautifulSoup
from lxml import etree

from enums import HtmlCommandOptions
from errors import InvalidArgument
from models import HtmlCommand


class HtmlParser:
    def __init__(self, html, parser: str = "lxml") -> None:
        self.html = html
        self.soup = BeautifulSoup(html, parser)

    def is_html(self) -> bool:
        return bool(self.soup.find())

    def _convert_elements_to_str(slef, elements: list) -> list:
        ret_list = []
        for element in elements:
            if isinstance(element, etree._Element):
                ret_list.append(''.join(element.itertext()).strip())
            elif isinstance(element, str):
                ret_list.append(element.strip())
            else:
                print("could not parse: ")
                print(type(element))
                ret_list.append("ERROR: could not parse element")
        return ret_list

    def get_by_xpath(self, xpath: str) -> list:
        tree = etree.fromstring(self.html, etree.HTMLParser())
        try:
            found_elements = tree.xpath(xpath)
            return self._convert_elements_to_str(found_elements)
        except etree.XPathEvalError:
            raise InvalidArgument(f"Invalid xpath argument {xpath}")

    def _get_text_from_found_elements(self, found_elements: list) -> list:
        return [
            "".join(element.find_all(text=True, recursive=True)).strip()
            for element in found_elements
        ]

    def get_by_attributes(self, attributes: dict, element: str = None) -> list:
        found_elements = self.soup.find_all(element, attributes)
        return self._get_text_from_found_elements(found_elements)

    def get_by_class(self, class_name: str, element: str = None) -> list:
        return self.get_by_attributes({"class": class_name}, element)

    def get_by_id(self, id_name: str, element: str = None) -> list:
        return self.get_by_attributes({"id": id_name}, element)

    def get_by_css_selector(self, selector: str) -> list:
        found_elements = self.soup.select(selector)
        return self._get_text_from_found_elements(found_elements)


class CommandExecutor:
    def __init__(self, html_parser: HtmlParser) -> None:
        self.html_parser = html_parser

    def get_from_html(self, command: HtmlCommand):
        if command.option == HtmlCommandOptions.XPATH:
            return self.html_parser.get_by_xpath(command.value)
        elif command.option == HtmlCommandOptions.CSS_SELECTOR:
            return self.html_parser.get_by_css_selector(command.value)
        elif command.option == HtmlCommandOptions.CSS_CLASS:
            return self.html_parser.get_by_class(command.value, command.html_tag)
        elif command.option == HtmlCommandOptions.CSS_ID:
            return self.html_parser.get_by_id(command.value, command.html_tag)
        elif command.option == HtmlCommandOptions.TAG_ATTRIBUTES:
            return self.html_parser.get_by_attributes(command.value, command.html_tag)
