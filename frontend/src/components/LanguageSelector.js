/**
 * Language selector component
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export default function LanguageSelector({ selectedLanguage, onLanguagePress }) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>De:</Text>
                <Text style={styles.fixedLanguage}>Português</Text>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity onPress={onLanguagePress} style={styles.row}>
                <Text style={styles.label}>Para:</Text>
                <View style={styles.targetContainer}>
                    <Text style={styles.languageText}>{selectedLanguage}</Text>
                    <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.cardBackground,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        width: '100%',
        maxWidth: 500,
        gap: theme.spacing.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
    fixedLanguage: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textMuted,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.cardBorder,
        marginVertical: 4,
    },
    targetContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    languageText: {
        fontSize: theme.fontSize.lg,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
});
