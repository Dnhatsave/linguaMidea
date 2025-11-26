"""
Translation service
"""
from app.api.gemini import GeminiClient


class TranslationService:
    """Service for handling text translation"""
    
    def __init__(self, gemini_client: GeminiClient):
        """
        Initialize translation service
        
        Args:
            gemini_client: Initialized Gemini client
        """
        self.gemini_client = gemini_client
    
    async def translate(self, text: str, target_language: str = "Inglês") -> dict:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_language: Target language (Inglês or Changana)
        
        Returns:
            Dictionary with original_text, translated_text, and target_language
        """
        translated_text = await self.gemini_client.translate_text(text, target_language)
        
        return {
            "original_text": text,
            "translated_text": translated_text,
            "target_language": target_language
        }
    
    async def synthesize_speech(self, text: str, voice: str = "Kore") -> dict:
        """
        Synthesize speech from text
        
        Args:
            text: Text to synthesize
            voice: Voice name for TTS
        
        Returns:
            Dictionary with audio data, format, and sample rate
        """
        # Get PCM audio from Gemini
        pcm_audio = await self.gemini_client.synthesize_speech(text, voice)
        
        # Convert to WAV
        from app.services.audio import pcm_to_wav
        import base64
        
        wav_audio = pcm_to_wav(pcm_audio, sample_rate=24000)
        audio_base64 = base64.b64encode(wav_audio).decode('utf-8')
        
        return {
            "audio_base64": audio_base64,
            "format": "wav",
            "sample_rate": 24000
        }
