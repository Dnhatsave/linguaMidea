/**
 * Audio playback utilities using expo-av
 */
import { Audio } from 'expo-av';

let currentSound = null;

/**
 * Play audio from base64 WAV data
 */
export const playAudioFromBase64 = async (audioBase64, onPlaybackStatusUpdate = null) => {
    try {
        // Stop current sound if playing
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            currentSound = null;
        }

        // Set audio mode
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        // Create sound from base64
        const { sound } = await Audio.Sound.createAsync(
            { uri: `data:audio/wav;base64,${audioBase64}` },
            { shouldPlay: true },
            onPlaybackStatusUpdate
        );

        currentSound = sound;
        return sound;
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
};

/**
 * Stop currently playing audio
 */
export const stopAudio = async () => {
    if (currentSound) {
        try {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            currentSound = null;
        } catch (error) {
            console.error('Error stopping audio:', error);
        }
    }
};

/**
 * Get current sound instance
 */
export const getCurrentSound = () => currentSound;

export default {
    playAudioFromBase64,
    stopAudio,
    getCurrentSound,
};
