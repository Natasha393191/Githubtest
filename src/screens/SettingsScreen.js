import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const theme = {
  primary: '#2E8B57',
  secondary: '#90EE90',
  accent: '#32CD32',
  background: '#F0FFF0',
  surface: '#FFFFFF',
  text: '#2F4F4F',
  textSecondary: '#708090',
  danger: '#dc3545',
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    vibration: false,
    darkMode: false,
    autoSave: true,
    dailyReminder: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingsSections = [
    {
      title: '學習設定',
      items: [
        {
          key: 'notifications',
          title: '推播通知',
          subtitle: '接收學習提醒和成就通知',
          icon: 'notifications',
          type: 'switch',
          value: settings.notifications,
        },
        {
          key: 'dailyReminder',
          title: '每日提醒',
          subtitle: '每天提醒你進行理財學習',
          icon: 'alarm',
          type: 'switch',
          value: settings.dailyReminder,
        },
        {
          key: 'autoSave',
          title: '自動儲存',
          subtitle: '自動儲存學習進度',
          icon: 'save',
          type: 'switch',
          value: settings.autoSave,
        },
      ],
    },
    {
      title: '介面設定',
      items: [
        {
          key: 'soundEffects',
          title: '音效',
          subtitle: '啟用按鈕音效和回饋音',
          icon: 'volume-high',
          type: 'switch',
          value: settings.soundEffects,
        },
        {
          key: 'vibration',
          title: '震動回饋',
          subtitle: '按鈕點擊時提供震動回饋',
          icon: 'phone-portrait',
          type: 'switch',
          value: settings.vibration,
        },
        {
          key: 'darkMode',
          title: '深色模式',
          subtitle: '使用深色主題（開發中）',
          icon: 'moon',
          type: 'switch',
          value: settings.darkMode,
          disabled: true,
        },
      ],
    },
    {
      title: '資料管理',
      items: [
        {
          key: 'exportData',
          title: '匯出資料',
          subtitle: '將學習記錄匯出為檔案',
          icon: 'download',
          type: 'action',
          onPress: () => {
            Alert.alert('功能開發中', '資料匯出功能正在開發中，敬請期待！');
          },
        },
        {
          key: 'clearData',
          title: '清除資料',
          subtitle: '刪除所有學習記錄和統計',
          icon: 'trash',
          type: 'action',
          danger: true,
          onPress: () => {
            Alert.alert(
              '確認清除',
              '這將刪除所有學習記錄和統計資料，此操作無法復原。',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '確認清除',
                  style: 'destructive',
                  onPress: () => {
                    // 實際應用中會清除資料庫
                    Alert.alert('成功', '資料已清除');
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: '關於應用',
      items: [
        {
          key: 'version',
          title: '版本資訊',
          subtitle: 'v1.0.0',
          icon: 'information-circle',
          type: 'info',
        },
        {
          key: 'feedback',
          title: '意見回饋',
          subtitle: '幫助我們改善應用程式',
          icon: 'chatbubbles',
          type: 'action',
          onPress: () => {
            Alert.alert('感謝回饋', '請透過應用商店評分或聯絡開發團隊');
          },
        },
        {
          key: 'privacy',
          title: '隱私政策',
          subtitle: '查看我們的隱私政策',
          icon: 'shield-checkmark',
          type: 'action',
          onPress: () => {
            Alert.alert('隱私政策', '我們重視您的隱私，所有資料僅儲存在您的設備上。');
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {
    return (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.settingItem,
          item.disabled && styles.disabledItem,
        ]}
        onPress={item.type === 'switch' ? () => toggleSetting(item.key) : item.onPress}
        disabled={item.disabled || item.type === 'info'}
        activeOpacity={item.type === 'info' ? 1 : 0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: item.danger ? theme.danger : theme.primary }
          ]}>
            <Ionicons
              name={item.icon}
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle,
              item.disabled && styles.disabledText,
              item.danger && styles.dangerText,
            ]}>
              {item.title}
            </Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={() => toggleSetting(item.key)}
              trackColor={{ false: '#E0E0E0', true: theme.secondary }}
              thumbColor={item.value ? theme.primary : '#FFFFFF'}
              disabled={item.disabled}
            />
          )}
          {item.type === 'action' && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 使用者資訊卡片 */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>理財學習者</Text>
            <Text style={styles.userStats}>已學習 15 天 • 正確率 75%</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* 設定項目 */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* 底部空間 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  userCard: {
    backgroundColor: theme.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  userStats: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 12,
  },
  disabledItem: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.textSecondary,
  },
  dangerText: {
    color: theme.danger,
  },
  bottomSpacing: {
    height: 20,
  },
});