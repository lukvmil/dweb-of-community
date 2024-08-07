import os.path
import base64

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.message import EmailMessage

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

creds = None    
if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json", SCOPES
        )
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
        token.write(creds.to_json())
    
            
def send(to, subject, content):
    service = build("gmail", "v1", credentials=creds)
    message = EmailMessage()
    
    message.set_content(content)
    message["To"] = to
    message["From"] = "webofcommunity.org"
    message["Subject"] = subject
    
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    
    return (
        service.users()
        .messages()
        .send(
            userId="me",
            body={"raw": encoded_message})
        .execute()
    )
    