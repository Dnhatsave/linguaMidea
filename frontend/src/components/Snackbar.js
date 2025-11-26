/**
 * Snackbar/Toast notification component
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';

export default function Snackbar({ message, visible, duration = 3000, onHide }) {
    const translateY = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Auto hide after duration
            const timer = setTimeout(() => {
                hideSnackbar();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideSnackbar = () => {
        Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (onHide) onHide();
        });
    };

    if (!message) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                },
            ]}
        >
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80,
        left: '10%',
        right: '10%',
        backgroundColor: '#333',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.card,
    },
    message: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.base,
        textAlign: 'center',
    },
});
