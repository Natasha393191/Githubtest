import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  useTheme,
  Surface,
  List,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getUserStats, getRecentQuizRecords } from '../database/database';

const StatisticsScreen = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userStats, records] = await Promise.all([
        getUserStats(),
        getRecentQuizRecords(20)
      ]);
      setStats(userStats);
      setRecentRecords(records);
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getAccuracyRate = () => {
    if (!stats || stats.total_questions === 0) return 0;
    return Math.round((stats.correct_answers / stats.total_questions) * 100);
  };

  const getAverageTime = () => {
    if (!stats || stats.total_questions === 0) return 0;
    return Math.round(stats.total_time / stats.total_questions);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultIcon = (isCorrect) => {
    return isCorrect ? 'check-circle' : 'cancel';
  };

  const getResultColor = (isCorrect) => {
    return isCorrect ? theme.colors.success : theme.colors.error;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Paragraph style={styles.loadingText}>載入統計資料中...</Paragraph>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 總體統計 */}
        <Card style={styles.overallStatsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>總體統計</Title>
            <View style={styles.statsGrid}>
              <Surface style={[styles.statItem, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialIcons name="quiz" size={32} color={theme.colors.primary} />
                <Paragraph style={styles.statNumber}>{stats?.total_questions || 0}</Paragraph>
                <Paragraph style={styles.statLabel}>總答題數</Paragraph>
              </Surface>
              
              <Surface style={[styles.statItem, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialIcons name="check-circle" size={32} color={theme.colors.secondary} />
                <Paragraph style={styles.statNumber}>{getAccuracyRate()}%</Paragraph>
                <Paragraph style={styles.statLabel}>正確率</Paragraph>
              </Surface>
            </View>
            
            <View style={styles.statsGrid}>
              <Surface style={[styles.statItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <MaterialIcons name="timer" size={32} color={theme.colors.tertiary} />
                <Paragraph style={styles.statNumber}>{getAverageTime()}s</Paragraph>
                <Paragraph style={styles.statLabel}>平均時間</Paragraph>
              </Surface>
              
              <Surface style={[styles.statItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <MaterialIcons name="trending-up" size={32} color={theme.colors.tertiary} />
                <Paragraph style={styles.statNumber}>{stats?.best_streak || 0}</Paragraph>
                <Paragraph style={styles.statLabel}>最佳連續</Paragraph>
              </Surface>
            </View>
          </Card.Content>
        </Card>

        {/* 詳細統計 */}
        <Card style={styles.detailStatsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>詳細數據</Title>
            <View style={styles.detailItem}>
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>答對題數</Paragraph>
                <Paragraph style={[styles.detailValue, { color: theme.colors.success }]}>
                  {stats?.correct_answers || 0}
                </Paragraph>
              </View>
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>答錯題數</Paragraph>
                <Paragraph style={[styles.detailValue, { color: theme.colors.error }]}>
                  {(stats?.total_questions || 0) - (stats?.correct_answers || 0)}
                </Paragraph>
              </View>
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>總答題時間</Paragraph>
                <Paragraph style={styles.detailValue}>
                  {Math.round((stats?.total_time || 0) / 60)} 分鐘
                </Paragraph>
              </View>
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>目前連續</Paragraph>
                <Paragraph style={[styles.detailValue, { color: theme.colors.primary }]}>
                  {stats?.streak || 0}
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 最近記錄 */}
        <Card style={styles.recentRecordsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>最近答題記錄</Title>
            {recentRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="history" size={60} color={theme.colors.outline} />
                <Paragraph style={styles.emptyText}>尚無答題記錄</Paragraph>
              </View>
            ) : (
              <View>
                {recentRecords.map((record, index) => (
                  <View key={record.id}>
                    <List.Item
                      title={record.question.length > 30 ? record.question.substring(0, 30) + '...' : record.question}
                      description={`${record.category} • ${formatDate(record.quiz_date)} • ${record.time_spent}秒`}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={getResultIcon(record.is_correct)}
                          color={getResultColor(record.is_correct)}
                        />
                      )}
                      right={(props) => (
                        <View style={styles.recordMeta}>
                          <Paragraph style={[styles.recordResult, { color: getResultColor(record.is_correct) }]}>
                            {record.is_correct ? '✓' : '✗'}
                          </Paragraph>
                        </View>
                      )}
                      style={styles.recordItem}
                    />
                    {index < recentRecords.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  overallStatsCard: {
    marginBottom: 16,
    elevation: 3,
  },
  detailStatsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  recentRecordsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 6,
    borderRadius: 16,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  detailItem: {
    paddingHorizontal: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  recordItem: {
    paddingVertical: 4,
  },
  recordMeta: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  recordResult: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StatisticsScreen;