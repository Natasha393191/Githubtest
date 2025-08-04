import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  RadioButton,
  useTheme,
  ActivityIndicator,
  Surface,
  Chip,
  Modal,
  Portal
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRandomQuestion, recordQuizResult } from '../database/database';

const QuizScreen = () => {
  const theme = useTheme();
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    loadNewQuestion();
  }, []);

  const loadNewQuestion = async () => {
    try {
      setLoading(true);
      setAnswered(false);
      setSelectedOption('');
      setShowResult(false);
      
      const newQuestion = await getRandomQuestion();
      setQuestion(newQuestion);
      setStartTime(Date.now());
    } catch (error) {
      console.error('載入題目失敗:', error);
      Alert.alert('錯誤', '無法載入題目，請檢查資料庫');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) {
      Alert.alert('提醒', '請選擇一個答案');
      return;
    }

    const endTime = Date.now();
    const spent = Math.round((endTime - startTime) / 1000);
    setTimeSpent(spent);

    const userAnswerIndex = parseInt(selectedOption);
    const correct = userAnswerIndex === question.correct_answer;
    setIsCorrect(correct);
    setAnswered(true);
    setShowResult(true);

    try {
      await recordQuizResult(question.id, userAnswerIndex, correct, spent);
    } catch (error) {
      console.error('記錄答題結果失敗:', error);
    }
  };

  const handleNextQuestion = () => {
    loadNewQuestion();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '初級': return theme.colors.success;
      case '中級': return theme.colors.warning;
      case '高級': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>載入題目中...</Paragraph>
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <MaterialIcons name="error-outline" size={60} color={theme.colors.error} />
        <Paragraph style={styles.errorText}>無法載入題目</Paragraph>
        <Button mode="contained" onPress={loadNewQuestion} style={styles.retryButton}>
          重試
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 題目資訊 */}
      <Surface style={styles.questionHeader}>
        <View style={styles.questionMeta}>
          <Chip 
            icon="folder-outline" 
            style={[styles.categoryChip, { backgroundColor: theme.colors.primaryContainer }]}
          >
            {question.category}
          </Chip>
          <Chip 
            icon="signal" 
            style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(question.difficulty) + '20' }]}
            textStyle={{ color: getDifficultyColor(question.difficulty) }}
          >
            {question.difficulty}
          </Chip>
        </View>
      </Surface>

      {/* 題目卡片 */}
      <Card style={styles.questionCard}>
        <Card.Content>
          <Title style={styles.questionText}>{question.question}</Title>
        </Card.Content>
      </Card>

      {/* 選項卡片 */}
      <Card style={styles.optionsCard}>
        <Card.Content>
          <RadioButton.Group onValueChange={setSelectedOption} value={selectedOption}>
            {question.options.map((option, index) => (
              <View key={index} style={styles.optionItem}>
                <RadioButton.Item
                  label={option}
                  value={index.toString()}
                  disabled={answered}
                  style={[
                    styles.optionButton,
                    answered && index === question.correct_answer && styles.correctOption,
                    answered && index === parseInt(selectedOption) && index !== question.correct_answer && styles.wrongOption
                  ]}
                  labelStyle={styles.optionLabel}
                />
              </View>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* 操作按鈕 */}
      <View style={styles.actionButtons}>
        {!answered ? (
          <Button
            mode="contained"
            onPress={handleSubmitAnswer}
            disabled={!selectedOption}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
          >
            提交答案
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleNextQuestion}
            style={styles.nextButton}
            contentStyle={styles.buttonContent}
          >
            下一題
          </Button>
        )}
      </View>

      {/* 結果彈窗 */}
      <Portal>
        <Modal
          visible={showResult}
          onDismiss={() => setShowResult(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content style={styles.resultContent}>
              <View style={styles.resultHeader}>
                <MaterialIcons 
                  name={isCorrect ? "check-circle" : "cancel"} 
                  size={60} 
                  color={isCorrect ? theme.colors.success : theme.colors.error} 
                />
                <Title style={[styles.resultTitle, { color: isCorrect ? theme.colors.success : theme.colors.error }]}>
                  {isCorrect ? '答對了！' : '答錯了'}
                </Title>
              </View>
              
              <View style={styles.resultDetails}>
                <Paragraph style={styles.timeInfo}>
                  答題時間: {timeSpent} 秒
                </Paragraph>
                
                {question.explanation && (
                  <View style={styles.explanationContainer}>
                    <Paragraph style={styles.explanationTitle}>解釋：</Paragraph>
                    <Paragraph style={styles.explanationText}>
                      {question.explanation}
                    </Paragraph>
                  </View>
                )}
              </View>
              
              <Button
                mode="contained"
                onPress={() => setShowResult(false)}
                style={styles.closeButton}
              >
                繼續
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  questionHeader: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryChip: {
    
  },
  difficultyChip: {
    
  },
  questionCard: {
    marginBottom: 16,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsCard: {
    flex: 1,
    marginBottom: 16,
    elevation: 2,
  },
  optionItem: {
    marginVertical: 4,
  },
  optionButton: {
    borderRadius: 12,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 22,
  },
  correctOption: {
    backgroundColor: '#E8F5E8',
  },
  wrongOption: {
    backgroundColor: '#FFEBEE',
  },
  actionButtons: {
    paddingVertical: 8,
  },
  submitButton: {
    borderRadius: 25,
  },
  nextButton: {
    borderRadius: 25,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  modalContainer: {
    margin: 20,
  },
  resultContent: {
    alignItems: 'center',
    padding: 8,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  resultDetails: {
    width: '100%',
    marginBottom: 20,
  },
  timeInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  explanationContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  explanationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    minWidth: 120,
  },
});

export default QuizScreen;