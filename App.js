import React, { useEffect } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 引入各個頁面
import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import DailyQuizScreen from './src/screens/DailyQuizScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 引入遊戲狀態管理
import { GameProvider } from './src/context/GameContext';

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
const Stack = createStackNavigator();

// 抽考相關的Stack Navigator
function QuizStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="QuizMain" 
        component={QuizScreen}
        options={{
          title: '理財學習',
          headerShown: false, // 使用Tab的header
        }}
      />
      <Stack.Screen 
        name="DailyQuiz" 
        component={DailyQuizScreen}
        options={{
          title: '每日抽考',
          headerBackTitle: '返回',
        }}
      />
    </Stack.Navigator>
  );
}

// 主要的Tab Navigator
function MainTabs() {
  return (
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
        component={QuizStack}
        options={{
          title: '理財學習',
          tabBarLabel: '學習',
          headerShown: false, // Stack會處理header
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
  );
}

export default function App() {
  useEffect(() => {
    // 初始化資料庫
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={theme.primary} 
          />
          <MainTabs />
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
});