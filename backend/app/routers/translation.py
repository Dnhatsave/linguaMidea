from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import TranslationRequest, TranslationResponse, SynthesizeRequest, SynthesizeResponse, AudioTranslationResponse, ErrorResponse
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
            original_text=request.text,
            translated_text=translated_text,
            language=request.target_language
        )
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


@router.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize_speech(request: SynthesizeRequest):
    """
    Synthesize speech from text using Gemini TTS
    
    Args:
        request: Synthesis request with text and voice name
        
    Returns:
        Synthesis response with WAV audio data
        
    Raises:
        HTTPException: If synthesis fails
    """
    try:
        logger.info(f"Speech synthesis requested for text: {request.text[:50]}...")
        
        # Call Gemini service to synthesize speech
        wav_data = await gemini_service.synthesize_speech(
            text=request.text,
            voice_name=request.voice
        )
        
        import base64
        audio_base64 = base64.b64encode(wav_data).decode('utf-8')
        
        return SynthesizeResponse(
            audio_base64=audio_base64,
            format="wav",
            sample_rate=24000
        )
        
    except Exception as e:
        logger.error(f"Synthesis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Speech synthesis failed: {str(e)}"
        )


@router.post("/translate-audio", response_model=AudioTranslationResponse)
async def translate_audio(
    file: UploadFile = File(...),
    target_language: str = Form("English")
):
    """
    Translate audio file to text and target language using Google Gemini API
    
    Args:
        file: Audio file (WAV, MP3, M4A, etc.)
        target_language: Target language for translation
        
    Returns:
        Audio translation response with transcribed and translated text
        
    Raises:
        HTTPException: If audio translation fails
    """
    try:
        logger.info(f"Translating audio file: {file.filename} to {target_language}")
        
        # Read audio file content
        audio_content = await file.read()
        logger.info(f"Audio file size: {len(audio_content)} bytes, content-type: {file.content_type}")
        
        # Validate audio size (max 20MB)
        max_size = 20 * 1024 * 1024  # 20MB
        if len(audio_content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file too large. Maximum size is {max_size // (1024*1024)}MB"
            )
        
        # Use Gemini API to transcribe and translate
        result = await gemini_service.translate_audio(
            audio_data=audio_content,
            target_language=target_language
        )
        
        logger.info(f"Audio translation successful. Original: '{result['original'][:50]}...', Translated: '{result['translated'][:50]}...'")
        
        return AudioTranslationResponse(
            original_text=result["original"],
            translated_text=result["translated"],
            language=target_language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio translation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Audio translation failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "LínguaMedia Translation API"}
