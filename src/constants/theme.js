import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32',       // 深綠色 - 主色
    primaryContainer: '#A5D6A7', // 淺綠色容器
    secondary: '#4CAF50',     // 綠色 - 次要色
    secondaryContainer: '#C8E6C9', // 次要色容器
    tertiary: '#66BB6A',      // 中綠色
    surface: '#FFFFFF',       // 表面色
    surfaceVariant: '#F1F8E9', // 表面變化色 - 很淺的綠
    background: '#FAFAFA',    // 背景色
    error: '#D32F2F',         // 錯誤色
    onPrimary: '#FFFFFF',     // 主色上的文字
    onSecondary: '#FFFFFF',   // 次要色上的文字
    onSurface: '#212121',     // 表面上的文字
    onBackground: '#212121',  // 背景上的文字
    outline: '#757575',       // 邊框色
    success: '#388E3C',       // 成功色
    warning: '#F57C00',       // 警告色
  },
};

export const colors = {
  // 額外的色彩定義
  money: '#4CAF50',          // 金錢相關的綠色
  profit: '#2E7D32',         // 獲利綠
  loss: '#D32F2F',           // 虧損紅
  neutral: '#757575',        // 中性灰
  lightGreen: '#E8F5E8',     // 淺綠背景
  darkGreen: '#1B5E20',      // 深綠文字
};