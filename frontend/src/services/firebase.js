/**
 * Firebase configuration and initialization
 * Using Firebase JS SDK (compatible with Expo)
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../constants/config';

let firebaseApp = null;
let firebaseAuth = null;

/**
 * Initialize Firebase
 */
export const initializeFirebase = async () => {
    try {
        // Check if already initialized
        if (getApps().length === 0) {
            firebaseApp = initializeApp(FIREBASE_CONFIG);
        } else {
            firebaseApp = getApp();
        }

        firebaseAuth = getAuth(firebaseApp);
        console.log('Firebase initialized');
        return firebaseApp;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
};

/**
 * Sign in anonymously
 */
export const signInAnonymouslyFirebase = async () => {
    try {
        if (!firebaseAuth) {
            await initializeFirebase();
        }

        const userCredential = await signInAnonymously(firebaseAuth);
        console.log('Anonymous auth successful:', userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error('Anonymous auth error:', error);
        throw error;
    }
};

/**
 * Sign in with custom token
 */
export const signInWithCustomTokenFirebase = async (token) => {
    try {
        if (!firebaseAuth) {
            await initializeFirebase();
        }

        const userCredential = await signInWithCustomToken(firebaseAuth, token);
        console.log('Custom token auth successful:', userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error('Custom token auth error:', error);
        // Fallback to anonymous
        return await signInAnonymouslyFirebase();
    }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
    if (!firebaseAuth) {
        return null;
    }
    return firebaseAuth.currentUser;
};

/**
 * Sign out
 */
export const signOut = async () => {
    try {
        if (!firebaseAuth) {
            return;
        }
        await firebaseAuth.signOut();
        console.log('User signed out');
    } catch (error) {
        console.error('Sign out error:', error);
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
    if (!firebaseAuth) {
        initializeFirebase().then(() => {
            if (firebaseAuth) {
                return onAuthStateChanged(firebaseAuth, callback);
            }
        });
        return () => { }; // Return empty unsubscribe function
    }

    return onAuthStateChanged(firebaseAuth, callback);
};

export default {
    initializeFirebase,
    signInAnonymously: signInAnonymouslyFirebase,
    signInWithCustomTokenFirebase: signInWithCustomTokenFirebase,
    getCurrentUser,
    signOut,
    onAuthStateChange,
};
