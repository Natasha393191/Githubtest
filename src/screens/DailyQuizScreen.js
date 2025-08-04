// 每日理財抽考遊戲頁面
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { GAME_STATUS } from '../game/gameLogic';

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
  warning: '#ffc107',
};

export default function DailyQuizScreen({ navigation }) {
  const {
    currentGame,
    currentQuestion,
    availability,
    loading,
    error,
    isGameAvailable,
    isGameInProgress,
    isGameCompleted,
    gameProgress,
    startGame,
    submitGameAnswer,
    clearCurrentGame,
    checkAvailability
  } = useGame();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // 動畫相關
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 計時器相關
  useEffect(() => {
    if (isGameInProgress && currentQuestion) {
      setQuestionStartTime(Date.now());
      setTimeLeft(30); // 每題30秒
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 時間到，自動提交答案
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion]);

  // 更新進度條動畫
  useEffect(() => {
    if (currentGame) {
      Animated.timing(progressAnim, {
        toValue: gameProgress / 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [gameProgress]);

  // 處理開始遊戲
  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (error) {
      Alert.alert('錯誤', error.message);
    }
  };

  // 處理答案選擇
  const handleAnswerSelect = (answerIndex) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    
    // 添加選擇動畫
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 處理提交答案
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('提示', '請選擇一個答案');
      return;
    }

    const timeTaken = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 30;
    
    try {
      const result = submitGameAnswer(selectedAnswer, timeTaken);
      setShowResult(true);
      
      // 顯示結果動畫
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      Alert.alert('錯誤', error.message);
    }
  };

  // 處理下一題
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    
    // 重置動畫
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 處理超時
  const handleTimeout = () => {
    if (showResult) return;
    
    const timeTaken = 30;
    const answerToSubmit = selectedAnswer !== null ? selectedAnswer : 0; // 預設選第一個
    
    try {
      submitGameAnswer(answerToSubmit, timeTaken);
      setShowResult(true);
      Alert.alert('時間到！', '已自動提交答案');
    } catch (error) {
      Alert.alert('錯誤', error.message);
    }
  };

  // 處理查看結果
  const handleViewResults = () => {
    navigation.navigate('GameResult', { 
      gameState: currentGame 
    });
  };

  // 處理重新檢查可用性
  const handleRefreshAvailability = () => {
    checkAvailability();
  };

  // 渲染遊戲不可用狀態
  const renderUnavailableState = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="time" size={64} color={theme.textSecondary} />
      <Text style={styles.unavailableTitle}>抽考遊戲暫不可用</Text>
      <Text style={styles.unavailableMessage}>{availability.message}</Text>
      
      {availability.nextAvailableTime && (
        <Text style={styles.nextTimeText}>
          下次可玩時間：{new Date(availability.nextAvailableTime).toLocaleString()}
        </Text>
      )}
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRefreshAvailability}
      >
        <Ionicons name="refresh" size={20} color={theme.primary} />
        <Text style={styles.refreshButtonText}>重新檢查</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染遊戲可用狀態
  const renderAvailableState = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="game-controller" size={64} color={theme.primary} />
      <Text style={styles.welcomeTitle}>今日理財抽考</Text>
      <Text style={styles.welcomeMessage}>
        準備好測試你的理財知識了嗎？{'\n'}
        今天的問題將基於你的消費記錄！
      </Text>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStartGame}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>開始抽考</Text>
          </>
        )}
      </TouchableOpacity>
      
      <View style={styles.gameInfo}>
        <Text style={styles.gameInfoText}>
          • 每天只能玩一次{'\n'}
          • 3-5個個人化問題{'\n'}
          • 答對有分數獎勵{'\n'}
          • 連續答對有加分
        </Text>
      </View>
    </View>
  );

  // 渲染遊戲進行中狀態
  const renderGameInProgress = () => {
    if (!currentQuestion) return null;

    return (
      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
        {/* 遊戲頭部 */}
        <View style={styles.gameHeader}>
          <View style={styles.progressSection}>
            <Text style={styles.questionNumber}>
              第 {currentGame.currentQuestionIndex + 1} / {currentGame.questions.length} 題
            </Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })}
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.timeSection}>
            <Ionicons name="time" size={16} color={timeLeft <= 10 ? theme.error : theme.textSecondary} />
            <Text style={[
              styles.timeText,
              { color: timeLeft <= 10 ? theme.error : theme.textSecondary }
            ]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* 問題區域 */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.description && (
            <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
          )}
        </View>

        {/* 選項區域 */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            let optionStyle = [styles.optionButton];
            let textStyle = [styles.optionText];

            if (showResult) {
              if (index === currentQuestion.correctAnswer) {
                optionStyle.push(styles.correctOption);
                textStyle.push(styles.correctOptionText);
              } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
                optionStyle.push(styles.wrongOption);
                textStyle.push(styles.wrongOptionText);
              }
            } else if (selectedAnswer === index) {
              optionStyle.push(styles.selectedOption);
              textStyle.push(styles.selectedOptionText);
            }

            return (
              <Animated.View key={index} style={{ transform: [{ scale: selectedAnswer === index ? scaleAnim : 1 }] }}>
                <TouchableOpacity
                  style={optionStyle}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={showResult}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIndex}>
                      <Text style={styles.optionIndexText}>{String.fromCharCode(65 + index)}</Text>
                    </View>
                    <Text style={textStyle}>{option}</Text>
                    {showResult && index === currentQuestion.correctAnswer && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                    )}
                    {showResult && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                      <Ionicons name="close-circle" size={24} color={theme.error} />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* 解釋區域 */}
        {showResult && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>解釋</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
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
              onPress={
                currentGame.currentQuestionIndex + 1 < currentGame.questions.length 
                  ? handleNextQuestion 
                  : handleViewResults
              }
            >
              <Text style={styles.nextButtonText}>
                {currentGame.currentQuestionIndex + 1 < currentGame.questions.length ? '下一題' : '查看結果'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // 渲染遊戲完成狀態
  const renderGameCompleted = () => (
    <View style={styles.centerContainer}>
      <Ionicons 
        name={currentGame?.status === GAME_STATUS.TIME_UP ? "time" : "trophy"} 
        size={64} 
        color={currentGame?.status === GAME_STATUS.TIME_UP ? theme.warning : theme.success} 
      />
      <Text style={styles.completedTitle}>
        {currentGame?.status === GAME_STATUS.TIME_UP ? '時間到！' : '遊戲完成！'}
      </Text>
      <Text style={styles.completedMessage}>
        你已完成今日的理財抽考遊戲
      </Text>
      
      <TouchableOpacity 
        style={styles.resultButton}
        onPress={handleViewResults}
      >
        <Ionicons name="bar-chart" size={20} color="#FFFFFF" />
        <Text style={styles.resultButtonText}>查看詳細結果</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeButtonText}>返回首頁</Text>
      </TouchableOpacity>
    </View>
  );

  // 主渲染
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.error} />
          <Text style={styles.errorTitle}>發生錯誤</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isGameCompleted && renderGameCompleted()}
      {isGameInProgress && renderGameInProgress()}
      {!isGameAvailable && !isGameInProgress && !isGameCompleted && renderUnavailableState()}
      {isGameAvailable && !isGameInProgress && !isGameCompleted && renderAvailableState()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  
  // 遊戲頭部
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressSection: {
    flex: 1,
    marginRight: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // 問題區域
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    lineHeight: 26,
  },
  questionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },

  // 選項區域
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIndexText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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

  // 解釋區域
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

  // 按鈕
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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

  // 狀態頁面
  unavailableTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    textAlign: 'center',
  },
  unavailableMessage: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  nextTimeText: {
    fontSize: 14,
    color: theme.primary,
    marginTop: 16,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  refreshButtonText: {
    color: theme.primary,
    fontSize: 16,
    marginLeft: 8,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 32,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  gameInfo: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    width: '100%',
  },
  gameInfoText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },

  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    textAlign: 'center',
  },
  completedMessage: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  resultButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 24,
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  homeButtonText: {
    color: theme.primary,
    fontSize: 16,
  },

  // 載入和錯誤狀態
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.error,
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});