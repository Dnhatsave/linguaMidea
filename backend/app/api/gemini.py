"""
Gemini API client with retry logic
"""
import os
from typing import Optional, List, Dict, Any
import google.generativeai as genai
from app.utils.retry import retry_with_backoff


class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client
        
        Args:
            api_key: Gemini API key (defaults to GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not provided")
        
        genai.configure(api_key=self.api_key)
    
    async def generate_content(
        self,
        prompt: str,
        system_instruction: str,
        model_name: str = "gemini-2.0-flash-exp",
        generation_config: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Generate content using Gemini API with retry logic
        
        Args:
            prompt: User prompt
            system_instruction: System instruction for the model
            model_name: Name of the Gemini model
            generation_config: Optional generation configuration
        
        Returns:
            Generated response from Gemini
        """
        async def _generate():
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction,
                generation_config=generation_config
            )
            
            response = model.generate_content(prompt)
            return response
        
        return await retry_with_backoff(_generate, max_retries=3, base_delay=1.0)
    
    async def translate_text(
        self,
        text: str,
        target_language: str = "Inglês"
    ) -> str:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_language: Target language name
        
        Returns:
            Translated text
        """
        system_instruction = (
            "Aja como um tradutor linguístico profissional. "
            "Dada uma frase e uma língua de destino, forneça apenas a tradução do texto, "
            "sem qualquer formatação ou texto adicional. "
            "A língua de destino padrão é Inglês, o usuario pode selecionar Changana como opcional para escutar"
        )
        
        prompt = f'Traduza o seguinte texto para {target_language}: "{text}"'
        
        response = await self.generate_content(
            prompt=prompt,
            system_instruction=system_instruction,
            model_name="gemini-2.0-flash-exp"
        )
        
        if response.candidates and len(response.candidates) > 0:
            return response.candidates[0].content.parts[0].text.strip()
        
        raise ValueError("No translation received from Gemini API")
    
    async def synthesize_speech(
        self,
        text: str,
        voice_name: str = "Kore"
    ) -> bytes:
        """
        Synthesize speech from text using Gemini TTS
        
        Args:
            text: Text to synthesize
            voice_name: Voice name for TTS
        
        Returns:
            Audio data in PCM16 format (base64 decoded)
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
        
        response = await self.generate_content(
            prompt=text,
            system_instruction=system_instruction,
            model_name="gemini-2.0-flash-exp",
            generation_config=generation_config
        )
        
        # Extract audio from response
        if response.candidates and len(response.candidates) > 0:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    # Return the raw audio data
                    import base64
                    return base64.b64decode(part.inline_data.data)
        
        raise ValueError("No audio data received from Gemini API")

    async def translate_audio(
        self,
        audio_data: bytes,
        target_language: str = "Inglês"
    ) -> Dict[str, str]:
        """
        Translate audio to text and target language
        
        Args:
            audio_data: Audio file bytes
            target_language: Target language name
        
        Returns:
            Dictionary with original text (transcribed) and translated text
        """
        system_instruction = (
            "You are a professional translator and transcriber. "
            "You will receive an audio file. "
            "1. Transcribe the audio exactly as spoken in the original language. "
            f"2. Translate the transcription to {target_language}. "
            "Return the result in JSON format with keys: 'original_text' and 'translated_text'."
        )
        
        prompt = "Transcribe and translate this audio."
        
        # Create a generation config that requests JSON response
        generation_config = {
            "response_mime_type": "application/json"
        }
        
        # Prepare content parts: text prompt + audio data
        contents = [
            prompt,
            {
                "mime_type": "audio/wav",  # Assuming WAV from frontend
                "data": audio_data
            }
        ]
        
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-exp",
            system_instruction=system_instruction,
            generation_config=generation_config
        )
        
        response = await model.generate_content_async(contents)
        
        if response.candidates and len(response.candidates) > 0:
            import json
            try:
                return json.loads(response.text)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "original_text": "Error parsing response",
                    "translated_text": response.text
                }
        
        raise ValueError("No translation received from Gemini API")
