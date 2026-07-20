from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import investigate

app = FastAPI(title="AI Kubernetes Agent")

# Allow requests from Next.js frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investigate.router)

@app.get("/")
def read_root():
    return {"message": "Kubernetes AI Agent Backend is running."}