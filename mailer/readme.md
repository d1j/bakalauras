# Prerequisites
* Python 3.9+
* `python3-venv`


# Required environment variables
```bash
export MAIL_SENDER_ADDRESS='smtp@mail'
export MAIL_SENDER_PASSWORD='mail.password'
```


# Application startup for testing purposes.
1. Create virtual environment: `python3 -m venv venv`
2. Activate virtual environment: `. venv/bin/activate`
3. Install requirements: `pip install -r requirements.txt`
4. Setup environment variables (suggested tool - `direnv`)
5. Run the system: `uvicorn main:app --reload --port 9009`


# Note
Whole system can work without this component, but users will not receive emails about data changes.