/**
 * API service for communicating with the FastAPI backend
 */
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

/**
 * Translate text to target language
 */
export const translateText = async (text, targetLanguage = 'Inglês') => {
    try {
        const response = await apiClient.post('/api/translate', {
            text,
            target_language: targetLanguage,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || 'Translation failed');
    }
};

/**
 * Synthesize speech from text
 */
export const synthesizeSpeech = async (text, voice = 'Kore') => {
    try {
        const response = await apiClient.post('/api/synthesize', {
            text,
            voice,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.detail || 'Speech synthesis failed');
    }
};

/**
 * Health check
 */
export const healthCheck = async () => {
    try {
        const response = await apiClient.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('Backend is not available');
    }
};

/**
 * Upload audio for translation
 * @param {string} audioUri - URI of the recorded audio file
 * @param {string} targetLanguage - Target language
 * @returns {Promise<object>} - Translation result
 */
export const translateAudio = async (audioUri, targetLanguage = 'Inglês') => {
    try {
        const formData = new FormData();

        // Append file
        formData.append('file', {
            uri: audioUri,
            name: 'recording.m4a', // Expo AV records in m4a/caf usually
            type: 'audio/m4a',
        });

        formData.append('target_language', targetLanguage);

        const response = await apiClient.post('/api/translate-audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Audio translation error:', error);
        throw error;
    }
};

export default {
    translateText,
    synthesizeSpeech,
    healthCheck,
    translateAudio,
};
