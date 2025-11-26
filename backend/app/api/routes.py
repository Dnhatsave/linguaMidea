"""
API routes for LínguaMedia backend
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from app.api.gemini import GeminiClient
from app.services.translation import TranslationService
import os


# Request/Response models
class TranslateRequest(BaseModel):
    text: str
    target_language: str = "Inglês"


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str


class SynthesizeRequest(BaseModel):
    text: str
    voice: str = "Kore"


class SynthesizeResponse(BaseModel):
    audio_base64: str
    format: str
    sample_rate: int


# Initialize router
router = APIRouter()

# Initialize services (will be set on app startup)
gemini_client: Optional[GeminiClient] = None
translation_service: Optional[TranslationService] = None


def init_services():
    """Initialize services with API key from environment"""
    global gemini_client, translation_service
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    gemini_client = GeminiClient(api_key=api_key)
    translation_service = TranslationService(gemini_client)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "linguamedia-backend",
        "version": "1.0.0"
    }


@router.post("/api/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """
    Translate text to target language using Gemini API
    
    Args:
        request: Translation request with text and target language
    
    Returns:
        Translation response with original and translated text
    """
    if not translation_service:
        raise HTTPException(status_code=500, detail="Translation service not initialized")
    
    try:
        result = await translation_service.translate(
            text=request.text,
            target_language=request.target_language
        )
        return TranslateResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/api/synthesize", response_model=SynthesizeResponse)
async def synthesize_speech(request: SynthesizeRequest):
    """
    Synthesize speech from text using Gemini TTS
    
    Args:
        request: Synthesis request with text and voice name
    
    Returns:
        Synthesis response with base64 encoded audio
    """
    if not translation_service:
        raise HTTPException(status_code=500, detail="Translation service not initialized")
    
    try:
        result = await translation_service.synthesize_speech(
            text=request.text,
            voice=request.voice
        )
        return SynthesizeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")


@router.post("/api/translate-audio")
async def translate_audio(
    file: UploadFile = File(...),
    target_language: str = Form("Inglês")
):
    """
    Translate audio file to text and target language
    
    Args:
        file: Audio file (WAV/MP3)
        target_language: Target language for translation
    
    Returns:
        JSON with original text and translation
    """
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini client not initialized")
    
    try:
        # Read file content
        audio_content = await file.read()
        
        # Call Gemini API
        result = await gemini_client.translate_audio(
            audio_data=audio_content,
            target_language=target_language
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio translation failed: {str(e)}")
