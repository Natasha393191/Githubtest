import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  useTheme,
  Surface,
  IconButton
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserStats } from '../database/database';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const userStats = await getUserStats();
      setStats(userStats);
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    }
  };

  const getAccuracyRate = () => {
    if (!stats || stats.total_questions === 0) return 0;
    return Math.round((stats.correct_answers / stats.total_questions) * 100);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 歡迎卡片 */}
        <Card style={[styles.welcomeCard, { backgroundColor: theme.colors.primary }]}>
          <Card.Content>
            <View style={styles.welcomeContent}>
              <MaterialIcons name="account-balance-wallet" size={50} color={theme.colors.onPrimary} />
              <View style={styles.welcomeText}>
                <Title style={[styles.welcomeTitle, { color: theme.colors.onPrimary }]}>
                  理財抽考遊戲
                </Title>
                <Paragraph style={[styles.welcomeSubtitle, { color: theme.colors.onPrimary }]}>
                  透過遊戲學習理財知識
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 統計卡片 */}
        {stats && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>今日狀況</Title>
              <View style={styles.statsGrid}>
                <Surface style={[styles.statItem, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialIcons name="quiz" size={30} color={theme.colors.primary} />
                  <Paragraph style={styles.statNumber}>{stats.total_questions}</Paragraph>
                  <Paragraph style={styles.statLabel}>答題總數</Paragraph>
                </Surface>
                
                <Surface style={[styles.statItem, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <MaterialIcons name="check-circle" size={30} color={theme.colors.secondary} />
                  <Paragraph style={styles.statNumber}>{getAccuracyRate()}%</Paragraph>
                  <Paragraph style={styles.statLabel}>正確率</Paragraph>
                </Surface>
                
                <Surface style={[styles.statItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <MaterialIcons name="trending-up" size={30} color={theme.colors.tertiary} />
                  <Paragraph style={styles.statNumber}>{stats.streak}</Paragraph>
                  <Paragraph style={styles.statLabel}>連答對</Paragraph>
                </Surface>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* 快速操作 */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.actionsTitle}>快速開始</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="play-arrow"
                onPress={() => navigation.navigate('Quiz')}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.actionButtonContent}
              >
                開始抽考
              </Button>
              
              <Button
                mode="outlined"
                icon="bar-chart"
                onPress={() => navigation.navigate('Statistics')}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                查看統計
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* 功能介紹 */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>功能特色</Title>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <IconButton icon="lightbulb-outline" iconColor={theme.colors.primary} />
                <View style={styles.featureText}>
                  <Paragraph style={styles.featureTitle}>隨機抽考</Paragraph>
                  <Paragraph style={styles.featureDesc}>隨機抽取理財知識題目</Paragraph>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <IconButton icon="chart-line" iconColor={theme.colors.primary} />
                <View style={styles.featureText}>
                  <Paragraph style={styles.featureTitle}>進度追蹤</Paragraph>
                  <Paragraph style={styles.featureDesc}>記錄學習進度和成績</Paragraph>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <IconButton icon="database" iconColor={theme.colors.primary} />
                <View style={styles.featureText}>
                  <Paragraph style={styles.featureTitle}>本地儲存</Paragraph>
                  <Paragraph style={styles.featureDesc}>資料安全保存在手機本地</Paragraph>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 4,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 25,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: 8,
  },
  featureTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  featureDesc: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default HomeScreen;