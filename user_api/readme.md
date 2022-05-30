# Prerequisites
* Python 3.9+
* `python3-venv`
* PostgreSQL 14.2


# Required environment variables

```bash
export DJANGO_SETTINGS_SECRET_KEY='Leave it as is for testing purposes. Change in prod.'
export PSQL_ENGINE='django.db.backends.postgresql'
export PSQL_NAME='core'
export PSQL_HOST='localhost'
export PSQL_PORT='5432'
export PSQL_USER='postgresql'
export PSQL_PASSWORD='password'
export TOOLS_TEST_SCRAPE_HOST='http://localhost:9000/scrape_html'
export SCHEDULER_HOST='http://localhost:8002'
```


# Application startup for testing purposes.
1. Create virtual environment: `python3 -m venv venv`
2. Activate virtual environment: `. venv/bin/activate`
3. Install requirements: `pip install -r requirements.txt`
4. Setup environment variables (suggested tool - `direnv`)
5. Create schema/database called `core` in PostgreSQL database. Recommended to do so via `pgAdmin`.
6. Migrate database: `python manage.py migrate`. 
7. Run the system: `python manage.py runserver`
