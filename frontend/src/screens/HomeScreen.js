/**
 * Home Screen - Main screen of LínguaMedia app
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import Header from '../components/Header';
import LanguageSelector from '../components/LanguageSelector';
import MicrophoneButton from '../components/MicrophoneButton';
import FooterActions from '../components/FooterActions';
import TextInputModal from '../components/TextInputModal';
import Snackbar from '../components/Snackbar';
import HistoryModal from '../components/HistoryModal';
import useAppState, { AppState } from '../hooks/useAppState';
import { translateText, synthesizeSpeech, translateAudio } from '../services/api';
import { playAudioFromBase64 } from '../services/audio';
import theme from '../styles/theme';

export default function HomeScreen() {
    const {
        state,
        setState,
        targetLanguage,
        toggleLanguage,
        translatedText,
        setTranslatedText,
        audioBase64,
        setAudioBase64,
        snackbarMessage,
        snackbarVisible,
        showSnackbar,
        hideSnackbar,
        saveTranslation,
    } = useAppState();

    const [modalVisible, setModalVisible] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [statusText, setStatusText] = useState('Tradução instantânea para línguas nacionais moçambicanas');
    const [recording, setRecording] = useState(null);

    // Request permissions on mount
    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso ao microfone para traduzir sua voz.');
            }
        })();
    }, []);

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setState(AppState.RECORDING);
            setStatusText('Ouvindo...');
        } catch (err) {
            console.error('Failed to start recording', err);
            showSnackbar('Erro ao iniciar gravação');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setState(AppState.TRANSLATING);
        setStatusText('Processando áudio...');

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            // Reset audio mode for playback
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });

            if (uri) {
                await handleAudioTranslation(uri);
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
            showSnackbar('Erro ao parar gravação');
            setState(AppState.IDLE);
        }
    };

    const handleAudioTranslation = async (audioUri) => {
        try {
            setStatusText('Traduzindo áudio...');
            const result = await translateAudio(audioUri, targetLanguage);

            await processTranslationResult(result);
        } catch (error) {
            console.error('Audio translation error:', error);
            showSnackbar('Erro na tradução de áudio');
            setStatusText('Erro. Tente novamente.');
            setState(AppState.IDLE);
        }
    };

    const handleMicPress = () => {
        if (state === AppState.IDLE) {
            startRecording();
        } else if (state === AppState.RECORDING) {
            stopRecording();
        }
    };

    const handleTextTranslate = async (text) => {
        setModalVisible(false);
        setState(AppState.TRANSLATING);
        setStatusText('Traduzindo texto...');

        try {
            const result = await translateText(text, targetLanguage);
            await processTranslationResult(result);
        } catch (error) {
            console.error('Translation error:', error);
            showSnackbar(`Erro: ${error.message}`);
            setStatusText('Erro na tradução. Tente novamente.');
            setState(AppState.IDLE);
        }
    };

    const processTranslationResult = async (result) => {
        setTranslatedText(result.translated_text);
        setStatusText(`Tradução: ${result.translated_text}`);

        // Save to history
        await saveTranslation(result.original_text || "Áudio", result.translated_text);

        // Generate audio
        setStatusText('Gerando áudio...');
        try {
            const audioResult = await synthesizeSpeech(result.translated_text);
            setAudioBase64(audioResult.audio_base64);

            // Play audio
            setState(AppState.PLAYING);
            await playAudioFromBase64(audioResult.audio_base64, (status) => {
                if (status.didJustFinish) {
                    setState(AppState.IDLE);
                }
            });

            setStatusText(`✓ Tradução: ${result.translated_text}`);
            showSnackbar('Tradução concluída!');
        } catch (error) {
            console.error('TTS error:', error);
            showSnackbar('Erro ao gerar áudio (TTS)');
            setState(AppState.IDLE);
        }
    };

    const handlePlayAudio = async () => {
        if (!audioBase64) {
            showSnackbar('Nenhum áudio disponível');
            return;
        }

        try {
            setState(AppState.PLAYING);
            await playAudioFromBase64(audioBase64, (status) => {
                if (status.didJustFinish) {
                    setState(AppState.IDLE);
                }
            });
        } catch (error) {
            console.error('Playback error:', error);
            showSnackbar('Erro ao reproduzir áudio');
            setState(AppState.IDLE);
        }
    };

    const handleSettings = () => {
        showSnackbar('Configurações em desenvolvimento');
    };



    const handleHistory = () => {
        setHistoryVisible(true);
    };

    const handleTextMode = () => {
        setModalVisible(true);
    };

    return (
        <LinearGradient
            colors={[theme.colors.backgroundStart, theme.colors.backgroundEnd]}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            <Header onSettingsPress={handleSettings} />

            <View style={styles.content}>
                <LanguageSelector
                    selectedLanguage={targetLanguage}
                    onLanguagePress={toggleLanguage}
                />

                <View style={styles.micContainer}>
                    <MicrophoneButton
                        onPress={handleMicPress}
                        isLoading={state === AppState.TRANSLATING}
                        isPlaying={state === AppState.PLAYING}
                        isRecording={state === AppState.RECORDING}
                        disabled={false}
                    />
                    {state === AppState.RECORDING && (
                        <Text style={styles.recordingHint}>Toque para parar</Text>
                    )}
                </View>

                <Text style={styles.statusText}>{statusText}</Text>
            </View>

            <View style={styles.footer}>
                <FooterActions
                    onPlayPress={handlePlayAudio}
                    onHistoryPress={handleHistory}
                    onTextPress={handleTextMode}
                    canPlay={!!audioBase64 && state === AppState.IDLE}
                />
            </View>

            <TextInputModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleTextTranslate}
            />

            <HistoryModal
                visible={historyVisible}
                onClose={() => setHistoryVisible(false)}
            />

            <Snackbar
                message={snackbarMessage}
                visible={snackbarVisible}
                onHide={hideSnackbar}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingBottom: 120,
    },
    micContainer: {
        marginVertical: theme.spacing.xxl,
        alignItems: 'center',
    },
    recordingHint: {
        color: '#FF4444',
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    statusText: {
        fontSize: theme.fontSize.base,
        color: theme.colors.textMuted,
        textAlign: 'center',
        maxWidth: 500,
        marginTop: theme.spacing.lg,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
