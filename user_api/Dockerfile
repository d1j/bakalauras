FROM python:3.9-slim

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /code/requirements.txt

RUN apt-get update \
    && apt-get -y install libpq-dev gcc
    
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./ /code/
