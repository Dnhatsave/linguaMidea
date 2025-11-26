"""
LínguaMedia FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api.routes import router, init_services

# Load environment variables
load_dotenv()
print(f"DEBUG: Current working directory: {os.getcwd()}")
print(f"DEBUG: .env file exists: {os.path.exists('.env')}")
api_key = os.getenv('GEMINI_API_KEY')
print(f"DEBUG: GEMINI_API_KEY loaded: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"DEBUG: GEMINI_API_KEY length: {len(api_key)}")
    print(f"DEBUG: GEMINI_API_KEY start: {api_key[:4]}...")

# Create FastAPI app
app = FastAPI(
    title="LínguaMedia API",
    description="Backend API for voice-to-voice translation with Gemini AI",
    version="1.0.0"
)

# Configure CORS
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:8081')
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:19006", "exp://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on app startup"""
    print("Initializing LínguaMedia backend services...")
    try:
        init_services()
        print("✓ Services initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize services: {e}")
        raise


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "LínguaMedia API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
