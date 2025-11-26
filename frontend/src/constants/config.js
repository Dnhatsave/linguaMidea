/**
 * Configuration constants for LínguaMedia
 */

// API Configuration
export const API_CONFIG = {
    // Change this to your backend URL
    BASE_URL: __DEV__ ? 'http://192.168.0.3:8000' : 'https://your-production-api.com',
    TIMEOUT: 30000, // 30 seconds
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// App constants
export const APP_CONSTANTS = {
    DEFAULT_LANGUAGE: 'Inglês',
    LANGUAGES: ['Inglês', 'Changana'],
    DEFAULT_VOICE: 'Kore',
};

export default {
    API_CONFIG,
    FIREBASE_CONFIG,
    APP_CONSTANTS,
};
