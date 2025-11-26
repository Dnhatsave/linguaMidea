from pydantic import BaseModel
from typing import Optional


class TranslationRequest(BaseModel):
    """Request model for translation endpoint"""
    text: str
    target_language: str


class TranslationResponse(BaseModel):
    """Response model for translation endpoint"""
    original: str
    translated: str
    language: str
    

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
