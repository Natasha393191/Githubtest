// =============================================
// 理財抽考遊戲 - 使用範例組件
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  RadioButton,
  ProgressBar,
  useTheme,
  ActivityIndicator,
  Surface,
  Chip,
  Modal,
  Portal
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame, GameProvider } from './GameContext';

// 遊戲主組件
const GameExample = () => {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
};

// 遊戲畫面組件
const GameScreen = () => {
  const theme = useTheme();
  const {
    // 狀態
    gameState,
    currentQuestion,
    gameProgress,
    gameStats,
    totalScore,
    combo,
    showResult,
    lastResult,
    error,
    timeRestriction,
    gameResult,
    
    // 狀態檢查
    isGameIdle,
    isGameLoading,
    isGameReady,
    isGamePlaying,
    isGameCompleted,
    isTimeRestricted,
    hasError,
    canStartGame,
    canSubmitAnswer,
    canProceedNext,
    
    // 操作函數
    initGame,
    startGame,
    submitAnswer,
    proceedToNextQuestion,
    resetGame,
    clearError
  } = useGame();

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answerStartTime, setAnswerStartTime] = useState(null);
  
  // 動畫值
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 重置選擇的答案
  useEffect(() => {
    if (isGamePlaying) {
      setSelectedAnswer('');
      setAnswerStartTime(Date.now());
    }
  }, [isGamePlaying, currentQuestion]);

  // 處理遊戲初始化
  const handleInitGame = async () => {
    const result = await initGame(1);
    if (!result.success) {
      Alert.alert('錯誤', result.error);
    }
  };

  // 處理開始遊戲
  const handleStartGame = () => {
    const result = startGame();
    if (!result.success) {
      Alert.alert('錯誤', result.error);
    }
  };

  // 處理提交答案
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      Alert.alert('提醒', '請選擇一個答案');
      return;
    }

    const answerTime = Date.now() - answerStartTime;
    const result = await submitAnswer(parseInt(selectedAnswer), answerTime);
    
    if (result.success) {
      // 答題動畫
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Alert.alert('錯誤', result.error);
    }
  };

  // 處理繼續下一題
  const handleProceedNext = () => {
    const result = proceedToNextQuestion();
    if (!result.success) {
      Alert.alert('錯誤', result.error);
    }
  };

  // 處理重新開始
  const handleRestart = () => {
    Alert.alert(
      '確認',
      '確定要重新開始遊戲嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: () => {
            resetGame();
          }
        }
      ]
    );
  };

  // 渲染時間限制頁面
  const renderTimeRestriction = () => (
    <View style={[styles.container, styles.centered]}>
      <Card style={styles.restrictionCard}>
        <Card.Content style={styles.centered}>
          <MaterialIcons name="access-time" size={80} color={theme.colors.primary} />
          <Title style={styles.restrictionTitle}>遊戲時間限制</Title>
          <Paragraph style={styles.restrictionText}>
            理財抽考遊戲開放時間：
          </Paragraph>
          <Paragraph style={[styles.timeText, { color: theme.colors.primary }]}>
            {timeRestriction?.gameWindow}
          </Paragraph>
          <Paragraph style={styles.restrictionDescription}>
            請在指定時間內回來玩遊戲哦！
          </Paragraph>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            返回
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  // 渲染載入畫面
  const renderLoading = () => (
    <View style={[styles.container, styles.centered]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Paragraph style={styles.loadingText}>準備遊戲中...</Paragraph>
    </View>
  );

  // 渲染遊戲初始頁面
  const renderGameIdle = () => (
    <View style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content style={styles.centered}>
          <MaterialIcons name="quiz" size={80} color={theme.colors.primary} />
          <Title style={styles.welcomeTitle}>理財抽考遊戲</Title>
          <Paragraph style={styles.welcomeDescription}>
            根據您今天的記帳記錄，
            我們將為您量身定制專屬問題！
          </Paragraph>
          <Button
            mode="contained"
            onPress={handleInitGame}
            style={styles.initButton}
            contentStyle={styles.buttonContent}
            loading={isGameLoading}
          >
            開始遊戲
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  // 渲染遊戲準備頁面
  const renderGameReady = () => (
    <View style={styles.container}>
      <Card style={styles.readyCard}>
        <Card.Content>
          <Title style={styles.readyTitle}>準備就緒！</Title>
          <View style={styles.gameInfo}>
            <View style={styles.infoItem}>
              <MaterialIcons name="help" size={24} color={theme.colors.primary} />
              <Paragraph>問題數量: {gameProgress.totalQuestions}</Paragraph>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="timer" size={24} color={theme.colors.primary} />
              <Paragraph>不限時間</Paragraph>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="star" size={24} color={theme.colors.primary} />
              <Paragraph>答對得分，連答有加成</Paragraph>
            </View>
          </View>
          <Button
            mode="contained"
            onPress={handleStartGame}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
          >
            開始答題
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  // 渲染遊戲進行中
  const renderGamePlaying = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 進度指示器 */}
      <Surface style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Paragraph>題目 {gameProgress.currentQuestion} / {gameProgress.totalQuestions}</Paragraph>
          <View style={styles.scoreContainer}>
            <Paragraph>分數: {totalScore}</Paragraph>
            {combo > 0 && (
              <Chip icon="flash-on" style={styles.comboChip}>
                Combo x{combo}
              </Chip>
            )}
          </View>
        </View>
        <ProgressBar 
          progress={gameProgress.percentage / 100} 
          color={theme.colors.primary}
          style={styles.progressBar}
        />
      </Surface>

      {/* 問題卡片 */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card style={styles.questionCard}>
          <Card.Content>
            <Title style={styles.questionTitle}>{currentQuestion?.question}</Title>
            
            <RadioButton.Group 
              onValueChange={setSelectedAnswer} 
              value={selectedAnswer}
            >
              {currentQuestion?.options.map((option, index) => (
                <RadioButton.Item
                  key={index}
                  label={option}
                  value={index.toString()}
                  style={styles.optionItem}
                  labelStyle={styles.optionLabel}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* 提交按鈕 */}
      <Button
        mode="contained"
        onPress={handleSubmitAnswer}
        disabled={!canSubmitAnswer || !selectedAnswer}
        style={styles.submitButton}
        contentStyle={styles.buttonContent}
      >
        提交答案
      </Button>
    </Animated.View>
  );

  // 渲染遊戲完成
  const renderGameCompleted = () => (
    <View style={styles.container}>
      <Card style={styles.resultCard}>
        <Card.Content style={styles.centered}>
          <MaterialIcons 
            name={gameResult?.isPerfectGame ? "emoji-events" : "celebration"} 
            size={80} 
            color={theme.colors.primary} 
          />
          <Title style={styles.resultTitle}>
            {gameResult?.isPerfectGame ? '完美表現！' : '遊戲完成！'}
          </Title>
          
          <View style={styles.resultStats}>
            <View style={styles.statRow}>
              <Paragraph>總分數</Paragraph>
              <Title style={{ color: theme.colors.primary }}>
                {gameResult?.totalScore}
              </Title>
            </View>
            
            <View style={styles.statRow}>
              <Paragraph>正確率</Paragraph>
              <Paragraph>
                {gameResult?.correctAnswers}/{gameResult?.totalQuestions} 
                ({gameResult?.accuracyRate}%)
              </Paragraph>
            </View>
            
            <View style={styles.statRow}>
              <Paragraph>最高連擊</Paragraph>
              <Paragraph>{gameResult?.maxCombo}</Paragraph>
            </View>
            
            <View style={styles.statRow}>
              <Paragraph>遊戲時間</Paragraph>
              <Paragraph>{Math.round(gameResult?.duration / 60)}分鐘</Paragraph>
            </View>
          </View>

          <View style={styles.resultActions}>
            <Button
              mode="contained"
              onPress={handleRestart}
              style={styles.actionButton}
            >
              再玩一次
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Statistics')}
              style={styles.actionButton}
            >
              查看統計
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // 錯誤處理
  if (hasError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Card style={styles.errorCard}>
          <Card.Content style={styles.centered}>
            <MaterialIcons name="error" size={60} color={theme.colors.error} />
            <Title>遊戲錯誤</Title>
            <Paragraph style={styles.errorText}>{error}</Paragraph>
            <Button mode="contained" onPress={clearError}>
              重試
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  // 根據遊戲狀態渲染不同頁面
  if (isTimeRestricted) return renderTimeRestriction();
  if (isGameLoading) return renderLoading();
  if (isGameIdle) return renderGameIdle();
  if (isGameReady) return renderGameReady();
  if (isGamePlaying) return renderGamePlaying();
  if (isGameCompleted) return renderGameCompleted();

  return renderGameIdle();
};

// 結果彈窗組件 (在答題後顯示)
const QuestionResultModal = ({ visible, result, onClose, onNext }) => {
  const theme = useTheme();
  
  if (!result) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <Card>
          <Card.Content style={styles.modalContent}>
            <View style={styles.resultHeader}>
              <MaterialIcons
                name={result.isCorrect ? "check-circle" : "cancel"}
                size={60}
                color={result.isCorrect ? theme.colors.success : theme.colors.error}
              />
              <Title style={[
                styles.modalTitle,
                { color: result.isCorrect ? theme.colors.success : theme.colors.error }
              ]}>
                {result.isCorrect ? '答對了！' : '答錯了'}
              </Title>
            </View>

            <View style={styles.scoreBreakdown}>
              <Paragraph>基礎分數: {result.score.baseScore}</Paragraph>
              <Paragraph>Combo加成: {result.score.comboMultiplier}</Paragraph>
              {result.score.bonusScore > 0 && (
                <Paragraph>獎勵分數: +{result.score.bonusScore}</Paragraph>
              )}
              <Title>總分: {result.score.totalScore}</Title>
            </View>

            <Paragraph style={styles.explanation}>
              {result.explanation}
            </Paragraph>

            <Button mode="contained" onPress={onNext} style={styles.nextButton}>
              繼續
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 歡迎頁面
  welcomeCard: {
    elevation: 4,
    marginVertical: 50,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  
  // 準備頁面
  readyCard: {
    elevation: 3,
    marginTop: 50,
  },
  readyTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  gameInfo: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  // 遊戲進行中
  progressContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboChip: {
    marginLeft: 8,
    backgroundColor: '#FF6B35',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  
  questionCard: {
    elevation: 3,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionItem: {
    marginVertical: 4,
    borderRadius: 8,
  },
  optionLabel: {
    fontSize: 16,
    lineHeight: 22,
  },
  
  // 結果頁面
  resultCard: {
    elevation: 4,
    marginVertical: 30,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  resultStats: {
    width: '100%',
    marginVertical: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  
  // 按鈕樣式
  buttonContent: {
    paddingVertical: 12,
  },
  initButton: {
    borderRadius: 25,
    marginTop: 20,
  },
  startButton: {
    borderRadius: 25,
  },
  submitButton: {
    borderRadius: 25,
    marginTop: 20,
  },
  
  // 模態框樣式
  modalContainer: {
    margin: 20,
  },
  modalContent: {
    alignItems: 'center',
    padding: 10,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  scoreBreakdown: {
    alignItems: 'center',
    marginBottom: 20,
  },
  explanation: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  nextButton: {
    minWidth: 120,
  },
  
  // 其他樣式
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    elevation: 3,
    margin: 20,
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
  },
  restrictionCard: {
    elevation: 4,
    margin: 20,
  },
  restrictionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  restrictionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  restrictionDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  backButton: {
    borderRadius: 25,
  },
});

export default GameExample;