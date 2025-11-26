from fastapi import APIRouter, HTTPException
from app.models.schemas import TranslationRequest, TranslationResponse, ErrorResponse
from app.services.gemini import gemini_service
import logging

router = APIRouter(prefix="/api", tags=["translation"])
logger = logging.getLogger(__name__)


@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text to target language using Google Gemini API
    
    Args:
        request: Translation request with text and target language
        
    Returns:
        Translation response with original, translated text and language
        
    Raises:
        HTTPException: If translation fails
    """
    try:
        logger.info(f"Translating text to {request.target_language}")
        
        translated_text = await gemini_service.translate(
            text=request.text,
            target_language=request.target_language
        )
        
        return TranslationResponse(
            original=request.text,
            translated=translated_text,
            language=request.target_language
        )
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "LínguaMedia Translation API"}
