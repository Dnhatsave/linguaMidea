import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Alert, Platform } from 'react-native';

export interface VoiceRecognitionResult {
    text: string;
}

// Note: expo-speech doesn't have built-in speech recognition
// For a full implementation, you would need to use expo-av with a service like Google Speech-to-Text
// This is a placeholder structure
export const startVoiceRecognition = async (
    onResult: (result: VoiceRecognitionResult) => void,
    onError: (error: string) => void
): Promise<void> => {
    try {
        // Request microphone permissions
        const { status } = await Audio.requestPermissionsAsync();

        if (status !== 'granted') {
            onError('Permissão de microfone negada');
            return;
        }

        // This is a placeholder - in a real app, you would implement actual speech recognition
        // Options: 
        // 1. Use Google Cloud Speech-to-Text API
        // 2. Use expo-av to record audio and send to backend for transcription
        // 3. Use a third-party service

        Alert.alert(
            'Voice Recognition',
            'Esta funcionalidade requer integração com um serviço de reconhecimento de voz. Por favor, use o botão "Texto" para input manual.',
            [{ text: 'OK' }]
        );

    } catch (error) {
        onError('Erro ao iniciar reconhecimento de voz');
    }
};

export const speak = async (text: string, language: string): Promise<void> => {
    try {
        const lang = language === 'English' ? 'en-US' : 'pt-PT';

        await Speech.speak(text, {
            language: lang,
            pitch: 1.0,
            rate: 0.9,
        });
    } catch (error) {
        console.error('TTS Error:', error);
        throw new Error('Erro ao reproduzir áudio');
    }
};

export const stopSpeaking = (): void => {
    Speech.stop();
};

export const isSpeaking = async (): Promise<boolean> => {
    return await Speech.isSpeakingAsync();
};
