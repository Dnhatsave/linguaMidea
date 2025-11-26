import httpx
import os
from typing import Optional
import asyncio
import base64


class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
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
    
    async def translate_audio(self, audio_data: bytes, target_language: str, max_retries: int = 3) -> dict:
        """
        Transcribe and translate audio using Gemini API
        
        Args:
            audio_data: Audio file bytes (WAV, MP3, M4A, etc.)
            target_language: Target language for translation
            max_retries: Maximum number of retry attempts
            
        Returns:
            Dictionary with 'original' (transcribed text) and 'translated' (translated text)
            
        Raises:
            Exception: If translation fails after all retries
        """
        system_instruction = (
            "You are a professional transcriber and translator. "
            f"1. First, transcribe the audio exactly as spoken in its original language. "
            f"2. Then, translate the transcribed text to {target_language}. "
            "Respond in JSON format with two fields: 'original' (the transcribed text in the original language) "
            "and 'translated' (the translation in the target language)."
        )
        
        # Encode audio to base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        # Build request with audio and text
        request_body = {
            "contents": [{
                "parts": [
                    {
                        "text": f"Transcribe this audio and translate it to {target_language}."
                    },
                    {
                        "inline_data": {
                            "mime_type": "audio/mp4",  # M4A is audio/mp4
                            "data": audio_base64
                        }
                    }
                ]
            }],
            "systemInstruction": {
                "parts": [{
                    "text": system_instruction
                }]
            },
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:  # Longer timeout for audio
                    response = await client.post(url, json=request_body)
                    
                    if response.status_code == 429:
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
                        continue
                    
                    if response.status_code != 200:
                        error_data = response.json()
                        raise Exception(f"API request failed: {response.status_code} - {error_data}")
                    
                    data = response.json()
                    
                    if not data.get("candidates") or not data["candidates"][0]:
                        raise Exception("No transcription result from API")
                    
                    # Parse the JSON response
                    result_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    
                    # Try to parse as JSON
                    import json
                    try:
                        result = json.loads(result_text)
                        return {
                            "original": result.get("original", ""),
                            "translated": result.get("translated", "")
                        }
                    except json.JSONDecodeError:
                        # Fallback: treat entire response as translated text
                        return {
                            "original": result_text,
                            "translated": result_text
                        }
                    
            except httpx.TimeoutException:
                if attempt >= max_retries - 1:
                    raise Exception("Audio translation request timeout")
                await asyncio.sleep(2 ** attempt)
                
            except Exception as e:
                if attempt >= max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)
        
        raise Exception("Audio translation failed after all retries")


    async def synthesize_speech(self, text: str, voice_name: str = "Kore") -> bytes:
        """
        Synthesize speech from text using Gemini TTS
        
        Args:
            text: Text to synthesize
            voice_name: Voice name for TTS
            
        Returns:
            Audio data in WAV format
        """
        system_instruction = "Você é um sintetizador de voz profissional."
        
        generation_config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {
                        "voice_name": voice_name
                    }
                }
            }
        }
        
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": text
                }]
            }],
            "systemInstruction": {
                "parts": [{
                    "text": system_instruction
                }]
            },
            "generationConfig": generation_config
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=request_body)
            
            if response.status_code != 200:
                error_data = response.json()
                raise Exception(f"TTS API request failed: {response.status_code} - {error_data}")
            
            data = response.json()
            
            if not data.get("candidates") or not data["candidates"][0]:
                raise Exception("No audio result from API")
            
            # Extract inline audio data
            parts = data["candidates"][0]["content"]["parts"]
            for part in parts:
                if "inlineData" in part:
                    # Found audio data
                    pcm_base64 = part["inlineData"]["data"]
                    pcm_data = base64.b64decode(pcm_base64)
                    
                    # Convert PCM to WAV
                    from app.services.audio import pcm_to_wav
                    return pcm_to_wav(pcm_data)
            
            raise Exception("No audio data found in response")


# Singleton instance
gemini_service = GeminiService()
