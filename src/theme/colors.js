// 主題顏色配置
export const theme = {
  // 主要顏色 - 綠色系理財主題
  primary: '#2E8B57',      // 海綠色 - 主要按鈕、標題
  secondary: '#90EE90',    // 淺綠色 - 次要元素、提示
  accent: '#32CD32',       // 萊姆綠 - 強調色、成功狀態

  // 背景顏色
  background: '#F0FFF0',   // 蜜瓜色 - 主背景
  surface: '#FFFFFF',      // 白色 - 卡片背景
  
  // 文字顏色
  text: '#2F4F4F',         // 深板岩灰 - 主要文字
  textSecondary: '#708090', // 板岩灰 - 次要文字
  textLight: '#FFFFFF',    // 白色 - 按鈕上的文字
  
  // 狀態顏色
  success: '#28a745',      // 成功 - 綠色
  warning: '#ffc107',      // 警告 - 黃色
  error: '#dc3545',        // 錯誤 - 紅色
  info: '#17a2b8',         // 資訊 - 藍色
  
  // 其他顏色
  border: '#E0E0E0',       // 邊框顏色
  disabled: '#CCCCCC',     // 禁用狀態
  shadow: '#000000',       // 陰影顏色
  
  // 漸層色
  gradientPrimary: ['#2E8B57', '#32CD32'],
  gradientSecondary: ['#90EE90', '#F0FFF0'],
};

// 深色主題（預留）
export const darkTheme = {
  primary: '#32CD32',
  secondary: '#2E8B57',
  accent: '#90EE90',
  
  background: '#1C1C1E',
  surface: '#2C2C2E',
  
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textLight: '#000000',
  
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#007AFF',
  
  border: '#38383A',
  disabled: '#48484A',
  shadow: '#000000',
  
  gradientPrimary: ['#32CD32', '#2E8B57'],
  gradientSecondary: ['#2C2C2E', '#1C1C1E'],
};

// 字體大小
export const fontSize = {
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 24,
  huge: 32,
};

// 間距
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
};

// 圓角
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};

// 陰影
export const shadows = {
  small: {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default theme;