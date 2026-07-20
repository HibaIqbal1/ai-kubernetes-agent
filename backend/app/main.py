from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.investigate import router as investigate_router

app = FastAPI(title="AI Kubernetes Agent", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach router
app.include_router(investigate_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-kubernetes-agent"}