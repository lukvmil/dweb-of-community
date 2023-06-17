import uvicorn
from backend import app

uvicorn.run(app, host="localhost", port=80)