import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
  textSecondary: '#708090'
};

export default function HomeScreen({ navigation }) {
  const quickActions = [
    {
      title: '開始抽考',
      subtitle: '測試你的理財知識',
      icon: 'library',
      color: theme.primary,
      onPress: () => navigation.navigate('Quiz')
    },
    {
      title: '查看統計',
      subtitle: '檢視學習進度',
      icon: 'bar-chart',
      color: theme.accent,
      onPress: () => navigation.navigate('Statistics')
    },
    {
      title: '應用設定',
      subtitle: '個人化設定',
      icon: 'settings',
      color: theme.textSecondary,
      onPress: () => navigation.navigate('Settings')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 歡迎區塊 */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeCard}>
            <Ionicons name="wallet" size={48} color={theme.primary} />
            <Text style={styles.welcomeTitle}>歡迎使用理財抽考遊戲</Text>
            <Text style={styles.welcomeSubtitle}>
              透過有趣的抽考遊戲，提升你的理財知識！
            </Text>
          </View>
        </View>

        {/* 統計概覽 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>今日概覽</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color={theme.accent} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>答對題數</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={theme.primary} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>學習時間</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color={theme.accent} />
              <Text style={styles.statNumber}>0%</Text>
              <Text style={styles.statLabel}>正確率</Text>
            </View>
          </View>
        </View>

        {/* 快速操作 */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
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
  welcomeSection: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  actionSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
});