from fastapi import BackgroundTasks, FastAPI
from fastapi.responses import Response

import mailer
from models import SendMailData

app = FastAPI()

@app.post("/send_mail")
def send_mail(mail_data: SendMailData, background_tasks: BackgroundTasks):
    background_tasks.add_task(mailer.send_mail, mail_data)
    return Response(status_code=202)
