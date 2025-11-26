import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'linguamedia_history';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryEntry {
    id: number;
    original: string;
    translated: string;
    language: string;
    timestamp: string;
}

export const saveToHistory = async (
    original: string,
    translated: string,
    language: string
): Promise<void> => {
    try {
        const history = await getHistory();

        const entry: HistoryEntry = {
            id: Date.now(),
            original,
            translated,
            language,
            timestamp: new Date().toISOString(),
        };

        history.unshift(entry);

        // Keep only last 50 entries
        if (history.length > MAX_HISTORY_ITEMS) {
            history.pop();
        }

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Error saving to history:', error);
    }
};

export const getHistory = async (): Promise<HistoryEntry[]> => {
    try {
        const historyStr = await AsyncStorage.getItem(HISTORY_KEY);
        return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
        console.error('Error loading history:', error);
        return [];
    }
};

export const clearHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};
