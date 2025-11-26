import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';

const HISTORY_STORAGE_KEY = '@linguamedia_history';

export default function HistoryModal({ visible, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            loadHistory();
        }
    }, [visible]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
            if (jsonValue != null) {
                const parsed = JSON.parse(jsonValue);
                setHistory(Array.isArray(parsed) ? parsed : []);
            } else {
                setHistory([]);
            }
        } catch (e) {
            console.error('Failed to load history', e);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = async () => {
        try {
            await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
            setHistory([]);
        } catch (e) {
            console.error('Failed to clear history', e);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={[theme.colors.backgroundStart, theme.colors.backgroundEnd]}
                    style={styles.modalContent}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Histórico de Traduções</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                    ) : (
                        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                            {!Array.isArray(history) || history.length === 0 ? (
                                <Text style={styles.emptyText}>Nenhuma tradução no histórico</Text>
                            ) : (
                                history.map((item) => (
                                    <View key={item.id || Math.random()} style={styles.historyItem}>
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.timestamp}>
                                                {item.timestamp ? new Date(item.timestamp).toLocaleString('pt-PT') : ''}
                                            </Text>
                                            <Text style={styles.language}>{item.language}</Text>
                                        </View>
                                        <View style={styles.translationContainer}>
                                            <Text style={styles.label}>Original:</Text>
                                            <Text style={styles.originalText}>{item.original}</Text>
                                            <View style={styles.divider} />
                                            <Text style={styles.label}>Tradução:</Text>
                                            <Text style={styles.translatedText}>{item.translated}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.clearButton]}
                            onPress={clearHistory}
                            disabled={history.length === 0}
                        >
                            <Text style={styles.buttonText}>Limpar Histórico</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.closeActionButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
}

// Helper to save history (can be imported elsewhere)
export const saveToHistory = async (original, translated, language) => {
    try {
        const newItem = {
            id: Date.now(),
            original,
            translated,
            language,
            timestamp: new Date().toISOString(),
        };

        const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        let currentHistory = jsonValue != null ? JSON.parse(jsonValue) : [];

        // Add to beginning
        currentHistory.unshift(newItem);

        // Limit to 50 items
        if (currentHistory.length > 50) {
            currentHistory = currentHistory.slice(0, 50);
        }

        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(currentHistory));
        return true;
    } catch (e) {
        console.error('Failed to save history', e);
        return false;
    }
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(127, 0, 255, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(127, 0, 255, 0.3)',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 20,
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    historyItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(127, 0, 255, 0.2)',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    language: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    translationContainer: {
        gap: 4,
    },
    label: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    originalText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(127, 0, 255, 0.2)',
        marginVertical: 4,
    },
    translatedText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(127, 0, 255, 0.3)',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#DC2626',
    },
    closeActionButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(127, 0, 255, 0.3)',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
