from fastapi import FastAPI
from pydantic import BaseModel
from services.log_parser import extract_error_chunks
from services.diagnosis_service import diagnose_log
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="BuildMedic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LogRequest(BaseModel):
    log_text: str

@app.get("/")
def root():
    return {"message": "BuildMedic backend is running"}

@app.post("/diagnose")
def diagnose(request: LogRequest):
    error_chunks = extract_error_chunks(request.log_text)
    diagnosis = diagnose_log(error_chunks)

    return {
        "error_excerpt": error_chunks,
        "diagnosis": diagnosis
    }