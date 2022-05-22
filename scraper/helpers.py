import json
import logging
import os
from typing import Union

def _init_logger(scope=os.getenv("LOGGER_LEVEL")) -> logging.Logger:
    levels = {
        "debug": logging.DEBUG,
        "info": logging.INFO,
        "warning": logging.WARNING,
        "error": logging.ERROR,
        "critical": logging.CRITICAL
    }
    logging.basicConfig(
        level=levels.get(scope.lower(), "error"),
        format="%(asctime)s.%(msecs)03d %(levelname)s %(module)s - %(funcName)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    logger = logging.getLogger()
    return logger


def dump(content: Union[dict, str], file_name: str) -> None:
    with open(file_name, "w", encoding="utf-8") as outfile:
        if file_name.endswith(".json"):
            json.dump(content, outfile)
        else:
            outfile.write(str(content))


LOGGER = _init_logger()