import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
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
  warning: '#ffc107',
  info: '#17a2b8',
};

export default function StatisticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    totalTime: 0,
    streak: 0,
    categoryStats: [],
  });

  // 示例數據（實際應用中會從資料庫讀取）
  const mockStats = {
    week: {
      totalQuestions: 45,
      correctAnswers: 32,
      accuracy: 71,
      totalTime: 25, // 分鐘
      streak: 5,
      categoryStats: [
        { name: '基礎理財', total: 15, correct: 12, accuracy: 80 },
        { name: '投資概念', total: 12, correct: 8, accuracy: 67 },
        { name: '保險規劃', total: 10, correct: 7, accuracy: 70 },
        { name: '稅務知識', total: 8, correct: 5, accuracy: 63 },
      ],
    },
    month: {
      totalQuestions: 180,
      correctAnswers: 135,
      accuracy: 75,
      totalTime: 120,
      streak: 12,
      categoryStats: [
        { name: '基礎理財', total: 60, correct: 48, accuracy: 80 },
        { name: '投資概念', total: 45, correct: 32, accuracy: 71 },
        { name: '保險規劃', total: 40, correct: 30, accuracy: 75 },
        { name: '稅務知識', total: 35, correct: 25, accuracy: 71 },
      ],
    },
    all: {
      totalQuestions: 520,
      correctAnswers: 390,
      accuracy: 75,
      totalTime: 350,
      streak: 12,
      categoryStats: [
        { name: '基礎理財', total: 180, correct: 144, accuracy: 80 },
        { name: '投資概念', total: 130, correct: 91, accuracy: 70 },
        { name: '保險規劃', total: 120, correct: 90, accuracy: 75 },
        { name: '稅務知識', total: 90, correct: 65, accuracy: 72 },
      ],
    },
  };

  useEffect(() => {
    setStats(mockStats[selectedPeriod]);
  }, [selectedPeriod]);

  const periods = [
    { key: 'week', label: '本週' },
    { key: 'month', label: '本月' },
    { key: 'all', label: '全部' },
  ];

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return theme.success;
    if (accuracy >= 60) return theme.warning;
    return '#dc3545';
  };

  const getAccuracyIcon = (accuracy) => {
    if (accuracy >= 80) return 'trophy';
    if (accuracy >= 60) return 'ribbon';
    return 'alert-circle';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 時間期間選擇 */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.activePeriodButtonText,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 主要統計卡片 */}
        <View style={styles.mainStatsContainer}>
          <View style={styles.mainStatCard}>
            <View style={styles.accuracySection}>
              <Ionicons
                name={getAccuracyIcon(stats.accuracy)}
                size={48}
                color={getAccuracyColor(stats.accuracy)}
              />
              <Text style={[styles.accuracyText, { color: getAccuracyColor(stats.accuracy) }]}>
                {stats.accuracy}%
              </Text>
              <Text style={styles.accuracyLabel}>正確率</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
                <Text style={styles.statLabel}>總題數</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.correctAnswers}</Text>
                <Text style={styles.statLabel}>答對數</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalTime}</Text>
                <Text style={styles.statLabel}>學習時間(分)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.streak}</Text>
                <Text style={styles.statLabel}>連續天數</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 類別統計 */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>分類統計</Text>
          {stats.categoryStats.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryAccuracy}>
                  <Text
                    style={[
                      styles.categoryAccuracyText,
                      { color: getAccuracyColor(category.accuracy) },
                    ]}
                  >
                    {category.accuracy}%
                  </Text>
                </View>
              </View>
              <View style={styles.categoryProgress}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${category.accuracy}%`,
                        backgroundColor: getAccuracyColor(category.accuracy),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryStats}>
                  {category.correct} / {category.total} 題
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 成就區域 */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>最近成就</Text>
          <View style={styles.achievementCard}>
            <Ionicons name="medal" size={32} color={theme.accent} />
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>學習新手</Text>
              <Text style={styles.achievementDescription}>
                完成了第一次理財測驗
              </Text>
            </View>
          </View>
          <View style={styles.achievementCard}>
            <Ionicons name="flame" size={32} color="#ff6b35" />
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>連續學習</Text>
              <Text style={styles.achievementDescription}>
                連續 {stats.streak} 天進行學習
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    marginBottom: 10,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: theme.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  activePeriodButtonText: {
    color: '#FFFFFF',
  },
  mainStatsContainer: {
    margin: 20,
    marginTop: 10,
  },
  mainStatCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accuracySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  accuracyText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  accuracyLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  categorySection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  categoryAccuracy: {
    backgroundColor: theme.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryAccuracyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryStats: {
    fontSize: 12,
    color: theme.textSecondary,
    minWidth: 60,
    textAlign: 'right',
  },
  achievementSection: {
    margin: 20,
    marginTop: 0,
  },
  achievementCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementText: {
    marginLeft: 16,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
});