import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from './constants/theme';
import { translateText } from './services/api';
import { speak, stopSpeaking } from './services/speech';
import { saveToHistory, getHistory, clearHistory, HistoryEntry } from './services/storage';

export default function App() {
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const loadedHistory = await getHistory();
    setHistory(loadedHistory);
  };

  const handleTranslate = async (text: string) => {
    if (!text.trim()) {
      Alert.alert('Erro', 'Por favor, digite algum texto');
      return;
    }

    setIsTranslating(true);
    setShowTranslation(false);

    try {
      const result = await translateText({
        text: text.trim(),
        target_language: targetLanguage,
      });

      setOriginalText(result.original);
      setTranslatedText(result.translated);
      setShowTranslation(true);

      // Save to history
      await saveToHistory(result.original, result.translated, result.language);
      await loadHistory();

      // Speak translation
      await speak(result.translated, targetLanguage);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Falha na tradução');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTextSubmit = () => {
    setShowTextModal(false);
    handleTranslate(textInput);
    setTextInput('');
  };

  const handleReplay = () => {
    if (translatedText) {
      speak(translatedText, targetLanguage);
    } else {
      Alert.alert('Aviso', 'Nenhum áudio disponível');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja limpar todo o histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            await loadHistory();
          },
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => {
    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTime}>{timeStr}</Text>
          <Text style={styles.historyLang}>{item.language}</Text>
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyLabel}>Original:</Text>
          <Text style={styles.historyText}>{item.original}</Text>
          <View style={styles.historyDivider} />
          <Text style={styles.historyLabel}>Tradução:</Text>
          <Text style={[styles.historyText, styles.historyTranslated]}>{item.translated}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={[COLORS.background.start, COLORS.background.end]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>LínguaMedia</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Language Selector */}
          <View style={styles.languageSelector}>
            <View style={styles.languageCard}>
              <View style={styles.languageHeader}>
                <View>
                  <Text style={styles.languageLabel}>Traduzir de</Text>
                  <Text style={styles.languageText}>Língua Autodetectada</Text>
                </View>
                <Ionicons name="language" size={24} color={COLORS.text.secondary} />
              </View>
              <View style={styles.languageTarget}>
                <Text style={styles.languageLabel}>Traduzir para</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.languagePicker}
                    onPress={() => {
                      Alert.alert(
                        'Selecionar Língua',
                        '',
                        [
                          { text: 'Inglês (English)', onPress: () => setTargetLanguage('English') },
                          { text: 'Changana', onPress: () => setTargetLanguage('Changana') },
                          { text: 'Cancelar', style: 'cancel' },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.languagePickerText}>
                      {targetLanguage === 'English' ? 'Inglês (English)' : 'Changana'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Microphone Button */}
          <View style={styles.micContainer}>
            <TouchableOpacity
              onPress={() => setShowTextModal(true)}
              disabled={isTranslating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={[styles.micButton, isTranslating && styles.micButtonDisabled]}
              >
                {isTranslating ? (
                  <View style={styles.spinner} />
                ) : (
                  <Ionicons name="mic" size={80} color={COLORS.text.primary} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Translation Display */}
          {showTranslation && (
            <View style={styles.translationDisplay}>
              <View style={styles.translationCard}>
                <View style={styles.translationSection}>
                  <View style={styles.translationLabelContainer}>
                    <Ionicons name="chatbox-outline" size={20} color="#A78BFA" />
                    <Text style={styles.translationLabel}>Original</Text>
                  </View>
                  <Text style={styles.translationText}>{originalText}</Text>
                </View>
                <View style={styles.translationDivider} />
                <View style={styles.translationSection}>
                  <View style={styles.translationLabelContainer}>
                    <Ionicons name="language" size={20} color={COLORS.success} />
                    <Text style={styles.translationLabel}>Tradução ({targetLanguage})</Text>
                  </View>
                  <Text style={[styles.translationText, styles.translatedText]}>{translatedText}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowTextModal(true)}>
              <Ionicons name="create-outline" size={24} color={COLORS.text.primary} />
              <Text style={styles.actionButtonText}>Texto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, !translatedText && styles.actionButtonDisabled]}
              onPress={handleReplay}
              disabled={!translatedText}
            >
              <Ionicons name="volume-high-outline" size={24} color={COLORS.text.primary} />
              <Text style={styles.actionButtonText}>Ouvir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => setShowHistoryModal(true)}>
              <Ionicons name="time-outline" size={24} color={COLORS.text.primary} />
              <Text style={styles.actionButtonText}>Histórico</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            Tradução instantânea para línguas nacionais moçambicanas
          </Text>
        </ScrollView>

        {/* Text Input Modal */}
        <Modal
          isVisible={showTextModal}
          onBackdropPress={() => setShowTextModal(false)}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Digite o texto para traduzir</Text>
              <TouchableOpacity onPress={() => setShowTextModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Digite ou cole o texto aqui..."
              placeholderTextColor={COLORS.text.gray}
              multiline
              value={textInput}
              onChangeText={setTextInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowTextModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleTextSubmit}
              >
                <Text style={styles.modalButtonText}>Traduzir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* History Modal */}
        <Modal
          isVisible={showHistoryModal}
          onBackdropPress={() => setShowHistoryModal(false)}
          style={styles.modal}
        >
          <View style={[styles.modalContent, styles.historyModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico de Traduções</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={64} color={COLORS.text.gray} opacity={0.5} />
                <Text style={styles.emptyHistoryText}>Nenhuma tradução no histórico</Text>
              </View>
            ) : (
              <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.historyList}
                contentContainerStyle={styles.historyListContent}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={handleClearHistory}
              >
                <Text style={styles.modalButtonText}>Limpar Histórico</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowHistoryModal(false)}
              >
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  settingsButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.card.bg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.card.border,
  },
  languageSelector: {
    marginBottom: SPACING.xl,
  },
  languageCard: {
    backgroundColor: COLORS.card.bg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.card.border,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  languageLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.gray,
    marginBottom: SPACING.xs,
  },
  languageText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  languageTarget: {
    marginTop: SPACING.md,
  },
  pickerContainer: {
    marginTop: SPACING.sm,
  },
  languagePicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.card.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languagePickerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  micButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  micButtonDisabled: {
    opacity: 0.6,
  },
  spinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: COLORS.primary,
    borderRadius: 20,
  },
  translationDisplay: {
    marginBottom: SPACING.xl,
  },
  translationCard: {
    backgroundColor: COLORS.card.bg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.card.border,
  },
  translationSection: {
    marginVertical: SPACING.sm,
  },
  translationLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  translationLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.gray,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  translationText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
  },
  translatedText: {
    fontWeight: '600',
  },
  translationDivider: {
    height: 1,
    backgroundColor: COLORS.card.border,
    marginVertical: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    backgroundColor: 'rgba(30, 20, 50, 0.8)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: COLORS.card.border,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  footerText: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.gray,
  },
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2b1f5c',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: COLORS.card.border,
  },
  historyModalContent: {
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.card.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    height: 150,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderColor: COLORS.card.border,
  },
  modalButtonSubmit: {
    backgroundColor: COLORS.primary,
  },
  modalButtonDelete: {
    backgroundColor: COLORS.error,
  },
  modalButtonText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingVertical: SPACING.sm,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(127, 0, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  historyTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.gray,
  },
  historyLang: {
    fontSize: FONT_SIZES.xs,
    color: '#A78BFA',
  },
  historyContent: {
    marginTop: SPACING.sm,
  },
  historyLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.gray,
    marginBottom: SPACING.xs,
  },
  historyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  historyTranslated: {
    fontWeight: '600',
  },
  historyDivider: {
    height: 1,
    backgroundColor: 'rgba(127, 0, 255, 0.2)',
    marginVertical: SPACING.sm,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyHistoryText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.gray,
    marginTop: SPACING.md,
  },
});
