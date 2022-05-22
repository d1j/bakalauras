from pydantic import BaseModel

class SendMailData(BaseModel): 
    user_email: str
    subject: str
    message: str
