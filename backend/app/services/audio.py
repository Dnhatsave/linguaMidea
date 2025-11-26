"""
Audio processing utilities
Converts PCM16 audio to WAV format (matching HTML implementation)
"""
import struct
import io
from typing import Tuple


def pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, num_channels: int = 1, bits_per_sample: int = 16) -> bytes:
    """
    Convert PCM16 audio data to WAV format
    
    This function replicates the JavaScript pcmToWav function from the HTML implementation
    
    Args:
        pcm_data: Raw PCM16 audio data
        sample_rate: Audio sample rate (default: 24000 Hz)
        num_channels: Number of audio channels (default: 1 for mono)
        bits_per_sample: Bits per sample (default: 16)
    
    Returns:
        WAV format audio data as bytes
    """
    # Calculate header values
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = len(pcm_data)
    
    # Create WAV file in memory
    wav_buffer = io.BytesIO()
    
    # RIFF header
    wav_buffer.write(b'RIFF')
    wav_buffer.write(struct.pack('<I', 36 + data_size))  # File size - 8
    wav_buffer.write(b'WAVE')
    
    # fmt subchunk
    wav_buffer.write(b'fmt ')
    wav_buffer.write(struct.pack('<I', 16))  # Subchunk1Size (16 for PCM)
    wav_buffer.write(struct.pack('<H', 1))   # AudioFormat (1 for PCM)
    wav_buffer.write(struct.pack('<H', num_channels))
    wav_buffer.write(struct.pack('<I', sample_rate))
    wav_buffer.write(struct.pack('<I', byte_rate))
    wav_buffer.write(struct.pack('<H', block_align))
    wav_buffer.write(struct.pack('<H', bits_per_sample))
    
    # data subchunk
    wav_buffer.write(b'data')
    wav_buffer.write(struct.pack('<I', data_size))
    wav_buffer.write(pcm_data)
    
    return wav_buffer.getvalue()


def base64_to_bytes(base64_string: str) -> bytes:
    """
    Convert base64 string to bytes
    Equivalent to base64ToArrayBuffer from HTML implementation
    
    Args:
        base64_string: Base64 encoded string
    
    Returns:
        Decoded bytes
    """
    import base64
    return base64.b64decode(base64_string)
