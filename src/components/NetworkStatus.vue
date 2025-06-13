<template>
  <div class="network-status" v-if="showStatus">
    <el-alert
      :title="statusInfo.title"
      :type="statusInfo.type"
      :description="statusInfo.description"
      show-icon
      :closable="true"
      @close="hideStatus"
      class="status-alert"
    >
      <template #default>
        <div v-if="statusInfo.suggestions.length > 0" class="suggestions">
          <p class="suggestions-title">建议：</p>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in statusInfo.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { analyzeNetworkError, type NetworkError } from '@/utils/network/error-handler'

interface StatusInfo {
  title: string;
  type: 'success' | 'warning' | 'error' | 'info';
  description: string;
  suggestions: string[];
}

const showStatus = ref(false)
const statusInfo = reactive<StatusInfo>({
  title: '',
  type: 'info',
  description: '',
  suggestions: []
})

/**
 * 显示网络状态
 * @param error 错误对象
 * @param context 错误上下文
 */
const showNetworkError = (error: any, context: string = '') => {
  const networkError = analyzeNetworkError(error, context)
  
  // 只显示用户需要关注的错误
  if (networkError.type === 'cors' || networkError.type === 'api') {
    return // 这些错误对用户来说是正常的
  }
  
  statusInfo.title = networkError.userMessage
  statusInfo.type = networkError.type === 'network' ? 'error' : 'warning'
  statusInfo.description = `在 ${context} 时遇到问题`
  statusInfo.suggestions = networkError.suggestions
  
  showStatus.value = true
  
  // 自动隐藏非严重错误
  if (networkError.type !== 'network') {
    setTimeout(() => {
      hideStatus()
    }, 5000)
  }
}

/**
 * 显示成功状态
 * @param message 成功消息
 */
const showSuccess = (message: string) => {
  statusInfo.title = '操作成功'
  statusInfo.type = 'success'
  statusInfo.description = message
  statusInfo.suggestions = []
  
  showStatus.value = true
  
  setTimeout(() => {
    hideStatus()
  }, 3000)
}

/**
 * 显示信息状态
 * @param title 标题
 * @param description 描述
 * @param suggestions 建议
 */
const showInfo = (title: string, description: string, suggestions: string[] = []) => {
  statusInfo.title = title
  statusInfo.type = 'info'
  statusInfo.description = description
  statusInfo.suggestions = suggestions
  
  showStatus.value = true
}

/**
 * 隐藏状态
 */
const hideStatus = () => {
  showStatus.value = false
}

// 暴露方法给父组件
defineExpose({
  showNetworkError,
  showSuccess,
  showInfo,
  hideStatus
})
</script>

<style scoped>
.network-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  animation: slideInRight 0.3s ease-in-out;
}

.status-alert {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.suggestions {
  margin-top: 12px;
}

.suggestions-title {
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.suggestions-list {
  margin: 0;
  padding-left: 20px;
}

.suggestions-list li {
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .network-status {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .status-alert {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>
