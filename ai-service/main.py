import uvicorn
from fastapi import FastAPI
from app.routes import anomaly_routes
from app.core.config import settings

# Initialize FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION
)

# Register routes
app.include_router(anomaly_routes.router)

@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}

if __name__ == "__main__":
    print(f"🚀 Starting {settings.PROJECT_NAME} on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
