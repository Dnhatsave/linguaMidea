/**
 * Text input modal for entering text to translate
 */
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export default function TextInputModal({ visible, onClose, onSubmit }) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text.trim());
            setText('');
        }
    };

    const handleClose = () => {
        setText('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Digite o texto para traduzir</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            multiline
                            numberOfLines={4}
                            placeholder="Digite ou cole o texto aqui..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={text}
                            onChangeText={setText}
                            autoFocus
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleClose}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.submitButton]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>Traduzir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.backgroundStart,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        width: '90%',
        maxWidth: 500,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.base,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: theme.spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6B7280',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        ...theme.shadows.glowButton,
    },
    buttonText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.base,
        fontWeight: '600',
    },
});
