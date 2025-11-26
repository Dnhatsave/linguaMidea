/**
 * Footer with action buttons (OCR, Ouvir, Histórico)
 */
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export default function FooterActions({ onPlayPress, onHistoryPress, onTextPress, canPlay }) {
    const ActionButton = ({ icon, label, onPress, disabled }) => (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled}
        >
            <Ionicons
                name={icon}
                size={24}
                color={disabled ? theme.colors.textMuted : theme.colors.textPrimary}
            />
            <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.buttonGroup}>
                <ActionButton
                    icon="text"
                    label="Texto"
                    onPress={onTextPress}
                />
                <ActionButton
                    icon="volume-high"
                    label="Ouvir"
                    onPress={onPlayPress}
                    disabled={!canPlay}
                />
                <ActionButton
                    icon="time"
                    label="Histórico"
                    onPress={onHistoryPress}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
    },
    button: {
        flex: 1,
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textPrimary,
    },
    buttonTextDisabled: {
        color: theme.colors.textMuted,
    },
});
