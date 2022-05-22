import os
import smtplib

from models import SendMailData


SENDER_ADRESS = os.getenv("MAIL_SENDER_ADDRESS")
SENDER_PASS = os.getenv("MAIL_SENDER_PASSWORD")


def send_mail(mail_data: SendMailData):
    email_text = f"""\
From: {SENDER_ADRESS}
To: {mail_data.user_email}
Subject: {mail_data.subject}

{mail_data.message}
"""
    smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
    smtp_server.ehlo()
    smtp_server.login(SENDER_ADRESS, SENDER_PASS)
    smtp_server.sendmail(SENDER_ADRESS, mail_data.user_email, email_text)
    smtp_server.close()
