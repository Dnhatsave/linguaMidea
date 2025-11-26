import httpx
import os
from typing import Optional
import asyncio


class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
    async def translate(self, text: str, target_language: str, max_retries: int = 3) -> str:
        """
        Translate text to target language using Gemini API
        
        Args:
            text: Text to translate
            target_language: Target language for translation
            max_retries: Maximum number of retry attempts
            
        Returns:
            Translated text
            
        Raises:
            Exception: If translation fails after all retries
        """
        system_instruction = (
            "Aja como um tradutor linguístico profissional. "
            "Dada uma frase e uma língua de destino, forneça apenas a tradução do texto, "
            "sem qualquer formatação ou texto adicional."
        )
        
        prompt = f'Traduza o seguinte texto para {target_language}: "{text}"'
        
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "systemInstruction": {
                "parts": [{
                    "text": system_instruction
                }]
            }
        }
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(url, json=request_body)
                    
                    if response.status_code == 429:
                        # Rate limit - exponential backoff
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
                        continue
                    
                    if response.status_code != 200:
                        error_data = response.json()
                        raise Exception(f"API request failed: {response.status_code} - {error_data}")
                    
                    data = response.json()
                    
                    if not data.get("candidates") or not data["candidates"][0]:
                        raise Exception("No translation result from API")
                    
                    translated_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return translated_text
                    
            except httpx.TimeoutException:
                if attempt >= max_retries - 1:
                    raise Exception("Translation request timeout")
                await asyncio.sleep(2 ** attempt)
                
            except Exception as e:
                if attempt >= max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
        
        raise Exception("Translation failed after all retries")


# Singleton instance
gemini_service = GeminiService()
