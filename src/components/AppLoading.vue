<template>
  <div class="app-loading">
    <div class="loading-content">
      <div class="logo">
        <el-icon class="logo-icon"><Tools /></el-icon>
      </div>
      <h1 class="app-name">YT Tools Plus</h1>
      <div class="loading-spinner">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
      <p class="loading-text">{{ loadingText }}</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tools, Loading } from '@element-plus/icons-vue'

const loadingText = ref('正在启动应用...')
const progress = ref(0)

const loadingSteps = [
  { text: '正在启动应用...', duration: 500 },
  { text: '加载核心模块...', duration: 300 },
  { text: '初始化组件...', duration: 200 },
  { text: '准备就绪...', duration: 100 }
]

onMounted(() => {
  let currentStep = 0
  let currentProgress = 0
  
  const updateProgress = () => {
    if (currentStep < loadingSteps.length) {
      const step = loadingSteps[currentStep]
      loadingText.value = step.text
      
      const targetProgress = ((currentStep + 1) / loadingSteps.length) * 100
      const progressIncrement = (targetProgress - currentProgress) / (step.duration / 50)
      
      const progressInterval = setInterval(() => {
        currentProgress += progressIncrement
        progress.value = Math.min(currentProgress, targetProgress)
        
        if (currentProgress >= targetProgress) {
          clearInterval(progressInterval)
          currentStep++
          
          if (currentStep < loadingSteps.length) {
            setTimeout(updateProgress, 100)
          }
        }
      }, 50)
    }
  }
  
  updateProgress()
})
</script>

<style scoped>
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 40px;
}

.logo {
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 64px;
  color: white;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.app-name {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 30px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  margin-bottom: 20px;
}

.loading-spinner .el-icon {
  font-size: 24px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  margin: 0 0 30px 0;
  opacity: 0.9;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-content {
    padding: 20px;
  }
  
  .logo-icon {
    font-size: 48px;
  }
  
  .app-name {
    font-size: 24px;
  }
}
</style>
