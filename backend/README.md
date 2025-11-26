# LínguaMedia Backend API

FastAPI backend for LínguaMedia translation application.

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Configure environment**:
Create `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
API_HOST=0.0.0.0
API_PORT=8000
```

3. **Run server**:
```bash
# Development
uvicorn app.main:app --reload

# Or using Python directly
python -m app.main
```

## API Endpoints

### POST /api/translate
Translate text to target language.

**Request:**
```json
{
  "text": "Bom dia",
  "target_language": "English"
}
```

**Response:**
```json
{
  "original": "Bom dia",
  "translated": "Good morning",
  "language": "English"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "LínguaMedia Translation API"
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Features

- ✅ Google Gemini AI integration
- ✅ Exponential backoff retry logic
- ✅ CORS enabled
- ✅ Async/await support
- ✅ Request validation with Pydantic
- ✅ Error handling
- ✅ Logging

## Tech Stack

- **FastAPI**: Web framework
- **httpx**: Async HTTP client
- **python-dotenv**: Environment variables
- **Pydantic**: Data validation
- **uvicorn**: ASGI server
