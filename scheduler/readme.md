# Prerequisites
* Python 3.9+
* `python3-venv`
* PostgreSQL 14.2


# Required environment variables
```bash
export POSTGRESS_CONNECTION='postgresql://postgres:password@localhost:5432/core'
export SCRAPER_HOST='http://localhost:9000'
export MAILER_HOST='http://localhost:9009'
```


# Application startup for testing purposes.
1. Create virtual environment: `python3 -m venv venv`
2. Activate virtual environment: `. venv/bin/activate`
3. Install requirements: `pip install -r requirements.txt`
4. Setup environment variables (suggested tool - `direnv`)
5. Run the system: `uvicorn main:app --reload --port 8002`
