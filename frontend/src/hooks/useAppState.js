/**
 * Custom hook for managing app state
 */
import { useState } from 'react';
import { saveToHistory } from '../components/HistoryModal';

export const AppState = {
    IDLE: 'idle',
    TRANSLATING: 'translating',
    PLAYING: 'playing',
    RECORDING: 'recording',
};

export default function useAppState() {
    const [state, setState] = useState(AppState.IDLE);
    const [targetLanguage, setTargetLanguage] = useState('Inglês');
    const [translatedText, setTranslatedText] = useState('');
    const [audioBase64, setAudioBase64] = useState(null);

    // Snackbar state
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);

    const toggleLanguage = () => {
        const newLang = targetLanguage === 'Inglês' ? 'Changana' : 'Inglês';
        setTargetLanguage(newLang);
        showSnackbar(`Língua alterada para ${newLang}`);
    };

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const hideSnackbar = () => {
        setSnackbarVisible(false);
        setSnackbarMessage('');
    };

    const saveTranslation = async (original, translated) => {
        await saveToHistory(original, translated, targetLanguage);
    };

    return {
        state,
        setState,
        targetLanguage,
        toggleLanguage,
        translatedText,
        setTranslatedText,
        audioBase64,
        setAudioBase64,
        saveTranslation,
        snackbarMessage,
        snackbarVisible,
        showSnackbar,
        hideSnackbar,
    };
}
