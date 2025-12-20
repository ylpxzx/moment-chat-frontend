<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
import { computed } from 'vue'

// 自定义主题覆盖以匹配后端页面
const themeOverrides = {
  common: {
    primaryColor: '#667eea',
    primaryColorHover: '#5a67d8',
    primaryColorPressed: '#4c51bf',
    primaryColorSuppl: '#4c51bf',

    infoColor: '#4299e1',
    successColor: '#48bb78',
    warningColor: '#ed8936',
    errorColor: '#f56565',

    borderRadius: '10px',
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusLarge: '10px',
    borderRadiusSmall: '6px',
  },
  Card: {
    borderRadius: '16px',
  },
  Input: {
    borderRadius: '8px',
  },
}

// 根据系统偏好设置主题
const theme = computed(() => {
  // 使用亮色主题匹配后端页面
  return null // 使用默认亮色主题
})
</script>

<style>
/* 全局样式 - 匹配后端页面 */
#app {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 自定义滚动条 - 匹配后端页面 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 工具类 */
.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 渐变背景工具类 */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 卡片阴影 */
.card-shadow {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 按钮动画 */
.btn-hover {
  transition: all 0.3s ease;
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-hover:active {
  transform: translateY(0);
}
</style>
