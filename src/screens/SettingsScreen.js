import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  useTheme,
  List,
  Divider,
  Switch,
  Dialog,
  Portal
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const theme = useTheme();
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      '清除資料',
      '您確定要清除所有答題記錄嗎？此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定清除', 
          style: 'destructive',
          onPress: () => {
            // 這裡可以實作清除資料的邏輯
            Alert.alert('提示', '資料清除功能將在未來版本中實作');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('提示', '資料匯出功能將在未來版本中實作');
  };

  const handleImportData = () => {
    Alert.alert('提示', '資料匯入功能將在未來版本中實作');
  };

  const handleContactSupport = () => {
    const email = 'support@example.com';
    const subject = '理財抽考遊戲 - 意見反馈';
    const body = '請描述您的問題或建議：\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('錯誤', '無法開啟郵件應用程式');
      }
    });
  };

  const handleRateApp = () => {
    Alert.alert('提示', '評分功能將在APP上架後實作');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* APP資訊卡片 */}
        <Card style={styles.appInfoCard}>
          <Card.Content>
            <View style={styles.appInfoContent}>
              <MaterialIcons name="account-balance-wallet" size={60} color={theme.colors.primary} />
              <View style={styles.appInfoText}>
                <Title style={styles.appTitle}>理財抽考遊戲</Title>
                <Paragraph style={styles.appVersion}>版本 1.0.0</Paragraph>
                <Paragraph style={styles.appDescription}>
                  透過遊戲化學習理財知識
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 應用設定 */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>應用設定</Title>
            
            <List.Item
              title="通知提醒"
              description="接收學習提醒通知"
              left={props => <List.Icon {...props} icon="notifications" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="音效"
              description="答題時的音效提示"
              left={props => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* 資料管理 */}
        <Card style={styles.dataCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>資料管理</Title>
            
            <List.Item
              title="匯出資料"
              description="將答題記錄匯出備份"
              left={props => <List.Icon {...props} icon="export" />}
              onPress={handleExportData}
            />
            <Divider />
            
            <List.Item
              title="匯入資料"
              description="從備份檔案匯入資料"
              left={props => <List.Icon {...props} icon="import" />}
              onPress={handleImportData}
            />
            <Divider />
            
            <List.Item
              title="清除所有資料"
              description="刪除所有答題記錄"
              left={props => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
              titleStyle={{ color: theme.colors.error }}
              onPress={handleClearData}
            />
          </Card.Content>
        </Card>

        {/* 關於與支援 */}
        <Card style={styles.supportCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>關於與支援</Title>
            
            <List.Item
              title="關於應用程式"
              description="查看APP詳細資訊"
              left={props => <List.Icon {...props} icon="information" />}
              onPress={() => setShowAboutDialog(true)}
            />
            <Divider />
            
            <List.Item
              title="意見反饋"
              description="向我們發送建議或問題"
              left={props => <List.Icon {...props} icon="email" />}
              onPress={handleContactSupport}
            />
            <Divider />
            
            <List.Item
              title="為APP評分"
              description="在應用商店給我們評分"
              left={props => <List.Icon {...props} icon="star" />}
              onPress={handleRateApp}
            />
          </Card.Content>
        </Card>

        {/* 開發者資訊 */}
        <Card style={styles.developerCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>開發者</Title>
            <Paragraph style={styles.developerText}>
              此APP使用React Native + Expo開發{'\n'}
              資料儲存於本地SQLite資料庫{'\n'}
              UI框架使用React Native Paper
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* 關於對話框 */}
      <Portal>
        <Dialog visible={showAboutDialog} onDismiss={() => setShowAboutDialog(false)}>
          <Dialog.Title>關於理財抽考遊戲</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.aboutText}>
              理財抽考遊戲是一款幫助用戶學習理財知識的教育性應用程式。
              
              {'\n\n'}主要功能：
              {'\n'}• 隨機抽取理財相關題目
              {'\n'}• 記錄答題進度和統計
              {'\n'}• 本地資料儲存，保護隱私
              {'\n'}• 現代化綠色主題設計
              
              {'\n\n'}版本：1.0.0
              {'\n'}開發框架：React Native + Expo
              {'\n'}資料庫：SQLite
              
              {'\n\n'}感謝您的使用！
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAboutDialog(false)}>關閉</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  appInfoCard: {
    marginBottom: 16,
    elevation: 4,
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoText: {
    marginLeft: 20,
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appVersion: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  appDescription: {
    fontSize: 16,
    marginTop: 8,
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  dataCard: {
    marginBottom: 16,
    elevation: 2,
  },
  supportCard: {
    marginBottom: 16,
    elevation: 2,
  },
  developerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  developerText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default SettingsScreen;