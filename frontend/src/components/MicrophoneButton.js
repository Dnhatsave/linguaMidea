/**
 * Microphone button with purple glow and pulse animation
 */
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../styles/theme';

export default function MicrophoneButton({ onPress, isLoading, isPlaying, isRecording, disabled }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                })
            ).start();
        } else {
            waveAnim.setValue(0);
        }
    }, [isRecording]);

    return (
        <View style={styles.container}>
            {isRecording && (
                <Animated.View
                    style={[
                        styles.wave,
                        {
                            transform: [{ scale: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2] }) }],
                            opacity: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                        },
                    ]}
                />
            )}

            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={[
                        styles.buttonWrapper,
                        { transform: [{ scale: pulseAnim }] },
                        disabled && styles.disabled
                    ]}
                >
                    <LinearGradient
                        colors={isRecording ? ['#FF0000', '#990000'] : theme.colors.primaryGradient}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#FFFFFF" />
                        ) : (
                            // Microphone Icon
                            <View style={styles.iconContainer}>
                                {/* Simple mic icon using Views for portability */}
                                <View style={styles.micBody} />
                                <View style={styles.micBase} />
                                <View style={styles.micStand} />
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWrapper: {
        width: 200,
        height: 200,
        borderRadius: 100,
        ...theme.shadows.glow,
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    disabled: {
        opacity: 0.6,
    },
    wave: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(127, 0, 255, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(127, 0, 255, 0.5)',
    },
    // Icon styles
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    micBody: {
        width: 24,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 4,
    },
    micBase: {
        width: 40,
        height: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        borderTopWidth: 0,
        position: 'absolute',
        bottom: 20,
    },
    micStand: {
        width: 4,
        height: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 20,
    },
});
