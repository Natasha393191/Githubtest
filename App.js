import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TabNavigator from './src/navigation/TabNavigator';
import { initializeDatabase } from './src/database/database';
import { theme } from './src/constants/theme';

export default function App() {
  useEffect(() => {
    // 初始化資料庫
    initializeDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <TabNavigator />
          <StatusBar style="light" backgroundColor={theme.colors.primary} />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}