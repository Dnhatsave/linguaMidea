import axios from 'axios';

// Change this to your backend URL
const API_BASE_URL = 'http://localhost:8000';

export interface TranslationRequest {
    text: string;
    target_language: string;
}

export interface TranslationResponse {
    original: string;
    translated: string;
    language: string;
}

export const translateText = async (request: TranslationRequest): Promise<TranslationResponse> => {
    try {
        const response = await axios.post<TranslationResponse>(
            `${API_BASE_URL}/api/translate`,
            request,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.detail || 'Translation failed');
        }
        throw error;
    }
};

export const checkHealth = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        return response.data.status === 'ok';
    } catch (error) {
        return false;
    }
};
