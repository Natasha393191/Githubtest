import React, { useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 引入各個頁面
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 引入資料庫初始化
import { initDatabase } from './src/database/database';

// 主題顏色配置
const theme = {
  primary: '#2E8B57', // 海綠色
  secondary: '#90EE90', // 淺綠色
  accent: '#32CD32', // 萊姆綠
  background: '#F0FFF0', // 蜜瓜色
  surface: '#FFFFFF',
  text: '#2F4F4F', // 深板岩灰
  textSecondary: '#708090' // 板岩灰
};

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    // 初始化資料庫
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={theme.primary} 
        />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Quiz') {
                iconName = focused ? 'library' : 'library-outline';
              } else if (route.name === 'Statistics') {
                iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.surface,
              borderTopColor: theme.secondary,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerStyle: {
              backgroundColor: theme.primary,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: '首頁',
              tabBarLabel: '首頁'
            }}
          />
          <Tab.Screen 
            name="Quiz" 
            component={QuizScreen}
            options={{
              title: '抽考遊戲',
              tabBarLabel: '抽考'
            }}
          />
          <Tab.Screen 
            name="Statistics" 
            component={StatisticsScreen}
            options={{
              title: '學習統計',
              tabBarLabel: '統計'
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: '設定',
              tabBarLabel: '設定'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
});