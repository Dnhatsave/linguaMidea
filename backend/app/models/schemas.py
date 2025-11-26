from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class TranslationRequest(BaseModel):
    """Request model for translation endpoint"""
    text: str
    target_language: str


class TranslationResponse(BaseModel):
    """Response model for translation endpoint"""
    model_config = ConfigDict(populate_by_name=True)
    
    original_text: str
    translated_text: str
    language: str


class SynthesizeRequest(BaseModel):
    """Request model for speech synthesis endpoint"""
    text: str
    voice: str = "Kore"


class SynthesizeResponse(BaseModel):
    """Response model for speech synthesis endpoint"""
    audio_base64: str
    format: str
    sample_rate: int


class AudioTranslationResponse(BaseModel):
    """Response model for audio translation endpoint"""
    model_config = ConfigDict(populate_by_name=True)
    
    original_text: str
    translated_text: str
    language: str


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None

