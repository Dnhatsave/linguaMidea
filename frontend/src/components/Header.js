/**
 * Header component with logo and settings button
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../styles/theme';

export default function Header({ onSettingsPress }) {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>LínguaMedia</Text>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={onSettingsPress}
            >
                <Ionicons name="settings-outline" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    logo: {
        fontSize: theme.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    settingsButton: {
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
    },
});
