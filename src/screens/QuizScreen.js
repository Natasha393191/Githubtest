import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#2E8B57',
  secondary: '#90EE90',
  accent: '#32CD32',
  background: '#F0FFF0',
  surface: '#FFFFFF',
  text: '#2F4F4F',
  textSecondary: '#708090',
  success: '#28a745',
  error: '#dc3545',
};

// 示例題目數據（實際應用中會從資料庫讀取）
const sampleQuestions = [
  {
    id: 1,
    question: '什麼是複利？',
    options: [
      '利息加入本金再計算利息',
      '固定利率計算',
      '單純的利息計算',
      '銀行手續費'
    ],
    correctAnswer: 0,
    explanation: '複利是指將利息加入本金後，再計算下一期的利息，讓資產能夠加速成長。'
  },
  {
    id: 2,
    question: '以下哪項不是投資風險管理的原則？',
    options: [
      '分散投資',
      '定期檢視',
      '集中單一投資',
      '設定停損點'
    ],
    correctAnswer: 2,
    explanation: '集中單一投資會增加風險，分散投資才是風險管理的重要原則。'
  },
  {
    id: 3,
    question: '緊急備用金建議準備幾個月的生活費？',
    options: [
      '1-2個月',
      '3-6個月',
      '12個月',
      '不需要準備'
    ],
    correctAnswer: 1,
    explanation: '一般建議準備3-6個月的生活費作為緊急備用金，以應對突發狀況。'
  }
];

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState(sampleQuestions);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('提示', '請選擇一個答案');
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // 測驗結束
      Alert.alert(
        '測驗完成！',
        `你的得分：${score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0)}/${questions.length}`,
        [
          {
            text: '重新開始',
            onPress: () => {
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setShowResult(false);
              setScore(0);
            }
          }
        ]
      );
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* 進度條 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} / {questions.length}
        </Text>
      </View>

      {/* 題目區域 */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>第 {currentQuestion + 1} 題</Text>
        <Text style={styles.questionText}>{currentQ.question}</Text>
      </View>

      {/* 選項區域 */}
      <View style={styles.optionsContainer}>
        {currentQ.options.map((option, index) => {
          let optionStyle = [styles.optionButton];
          let textStyle = [styles.optionText];

          if (showResult) {
            if (index === currentQ.correctAnswer) {
              optionStyle.push(styles.correctOption);
              textStyle.push(styles.correctOptionText);
            } else if (index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer) {
              optionStyle.push(styles.wrongOption);
              textStyle.push(styles.wrongOptionText);
            }
          } else if (selectedAnswer === index) {
            optionStyle.push(styles.selectedOption);
            textStyle.push(styles.selectedOptionText);
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => !showResult && handleAnswerSelect(index)}
              disabled={showResult}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionIndex}>{String.fromCharCode(65 + index)}</Text>
                <Text style={textStyle}>{option}</Text>
                {showResult && index === currentQ.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                )}
                {showResult && index === selectedAnswer && selectedAnswer !== currentQ.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color={theme.error} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 解釋區域 */}
      {showResult && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>解釋</Text>
          <Text style={styles.explanationText}>{currentQ.explanation}</Text>
        </View>
      )}

      {/* 按鈕區域 */}
      <View style={styles.buttonContainer}>
        {!showResult ? (
          <TouchableOpacity
            style={[styles.submitButton, selectedAnswer === null && styles.disabledButton]}
            onPress={handleSubmitAnswer}
            disabled={selectedAnswer === null}
          >
            <Text style={styles.submitButtonText}>確認答案</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion < questions.length - 1 ? '下一題' : '完成測驗'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetQuiz}
        >
          <Ionicons name="refresh" size={20} color={theme.textSecondary} />
          <Text style={styles.resetButtonText}>重新開始</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  questionContainer: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: theme.text,
    lineHeight: 26,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: theme.primary,
    backgroundColor: theme.secondary + '20',
  },
  correctOption: {
    borderColor: theme.success,
    backgroundColor: theme.success + '20',
  },
  wrongOption: {
    borderColor: theme.error,
    backgroundColor: theme.error + '20',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.textSecondary,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: theme.primary,
    fontWeight: '600',
  },
  correctOptionText: {
    color: theme.success,
    fontWeight: '600',
  },
  wrongOptionText: {
    color: theme.error,
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.textSecondary,
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.textSecondary,
    borderRadius: 12,
    padding: 16,
  },
  resetButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    marginLeft: 8,
  },
});