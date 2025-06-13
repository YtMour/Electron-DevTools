<template>
  <div class="performance-monitor-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Monitor /></el-icon>
        性能监控
      </h1>
      <p class="page-description">
        实时监控应用性能指标，包括内存使用、CPU 占用、网络状态等
      </p>
    </div>

    <div class="monitor-controls">
      <el-card shadow="never" class="controls-card">
        <div class="controls-content">
          <div class="control-group">
            <el-button
              v-if="!isMonitoring"
              type="primary"
              @click="startMonitoring"
              :icon="VideoPlay"
            >
              开始监控
            </el-button>
            <el-button
              v-else
              type="danger"
              @click="stopMonitoring"
              :icon="VideoPause"
            >
              停止监控
            </el-button>
            
            <el-button
              @click="clearHistory"
              :icon="Delete"
              :disabled="!hasHistory"
            >
              清空历史
            </el-button>
            
            <el-button
              @click="exportData"
              :icon="Download"
              :disabled="!hasHistory"
            >
              导出数据
            </el-button>
          </div>
          
          <div class="status-info">
            <el-tag :type="isMonitoring ? 'success' : 'info'" effect="light">
              {{ isMonitoring ? '监控中' : '已停止' }}
            </el-tag>
            <span class="sample-count">样本数: {{ sampleCount }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="metrics-grid">
      <!-- 内存使用情况 -->
      <el-card shadow="hover" class="metric-card">
        <template #header>
          <div class="card-header">
            <el-icon class="metric-icon memory-icon"><Cpu /></el-icon>
            <span>内存使用</span>
          </div>
        </template>
        
        <div class="metric-content">
          <div class="metric-value">
            <span class="value">{{ currentMetrics?.memory.percentage || 0 }}%</span>
            <span class="unit">{{ currentMetrics?.memory.used || 0 }}MB / {{ currentMetrics?.memory.total || 0 }}MB</span>
          </div>
          
          <el-progress
            :percentage="currentMetrics?.memory.percentage || 0"
            :color="getProgressColor(currentMetrics?.memory.percentage || 0)"
            :show-text="false"
            class="metric-progress"
          />
        </div>
      </el-card>

      <!-- CPU 使用情况 -->
      <el-card shadow="hover" class="metric-card">
        <template #header>
          <div class="card-header">
            <el-icon class="metric-icon cpu-icon"><Operation /></el-icon>
            <span>CPU 使用</span>
          </div>
        </template>
        
        <div class="metric-content">
          <div class="metric-value">
            <span class="value">{{ currentMetrics?.cpu.usage || 0 }}%</span>
            <span class="unit">{{ currentMetrics?.cpu.cores || 0 }} 核心</span>
          </div>
          
          <el-progress
            :percentage="currentMetrics?.cpu.usage || 0"
            :color="getProgressColor(currentMetrics?.cpu.usage || 0)"
            :show-text="false"
            class="metric-progress"
          />
        </div>
      </el-card>

      <!-- 网络状态 -->
      <el-card shadow="hover" class="metric-card">
        <template #header>
          <div class="card-header">
            <el-icon class="metric-icon network-icon"><Connection /></el-icon>
            <span>网络状态</span>
          </div>
        </template>
        
        <div class="metric-content">
          <div class="network-info">
            <div class="network-status">
              <el-tag :type="currentMetrics?.network.online ? 'success' : 'danger'" effect="light">
                {{ currentMetrics?.network.online ? '在线' : '离线' }}
              </el-tag>
            </div>
            
            <div class="network-details" v-if="currentMetrics?.network.online">
              <div class="detail-item" v-if="currentMetrics?.network.effectiveType">
                <span class="label">连接类型:</span>
                <span class="value">{{ currentMetrics.network.effectiveType }}</span>
              </div>
              <div class="detail-item" v-if="currentMetrics?.network.downlink">
                <span class="label">下行速度:</span>
                <span class="value">{{ currentMetrics.network.downlink }} Mbps</span>
              </div>
              <div class="detail-item" v-if="currentMetrics?.network.rtt">
                <span class="label">延迟:</span>
                <span class="value">{{ currentMetrics.network.rtt }} ms</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 页面性能 -->
      <el-card shadow="hover" class="metric-card">
        <template #header>
          <div class="card-header">
            <el-icon class="metric-icon page-icon"><Timer /></el-icon>
            <span>页面性能</span>
          </div>
        </template>
        
        <div class="metric-content">
          <div class="performance-metrics">
            <div class="perf-item">
              <span class="label">加载时间:</span>
              <span class="value">{{ formatTime(currentMetrics?.page.loadTime || 0) }}</span>
            </div>
            <div class="perf-item">
              <span class="label">DOM 就绪:</span>
              <span class="value">{{ formatTime(currentMetrics?.page.domContentLoaded || 0) }}</span>
            </div>
            <div class="perf-item" v-if="currentMetrics?.page.firstPaint">
              <span class="label">首次绘制:</span>
              <span class="value">{{ formatTime(currentMetrics.page.firstPaint) }}</span>
            </div>
            <div class="perf-item" v-if="currentMetrics?.page.firstContentfulPaint">
              <span class="label">首次内容绘制:</span>
              <span class="value">{{ formatTime(currentMetrics.page.firstContentfulPaint) }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计信息 -->
    <el-card v-if="statistics" shadow="hover" class="statistics-card">
      <template #header>
        <div class="card-header">
          <el-icon class="metric-icon"><DataAnalysis /></el-icon>
          <span>统计信息</span>
        </div>
      </template>
      
      <div class="statistics-content">
        <div class="stat-group">
          <h4>内存使用统计</h4>
          <div class="stat-items">
            <div class="stat-item">
              <span class="label">平均:</span>
              <span class="value">{{ statistics.memory.avg }}%</span>
            </div>
            <div class="stat-item">
              <span class="label">最高:</span>
              <span class="value">{{ statistics.memory.max }}%</span>
            </div>
            <div class="stat-item">
              <span class="label">最低:</span>
              <span class="value">{{ statistics.memory.min }}%</span>
            </div>
          </div>
        </div>
        
        <div class="stat-group">
          <h4>CPU 使用统计</h4>
          <div class="stat-items">
            <div class="stat-item">
              <span class="label">平均:</span>
              <span class="value">{{ statistics.cpu.avg }}%</span>
            </div>
            <div class="stat-item">
              <span class="label">最高:</span>
              <span class="value">{{ statistics.cpu.max }}%</span>
            </div>
            <div class="stat-item">
              <span class="label">最低:</span>
              <span class="value">{{ statistics.cpu.min }}%</span>
            </div>
          </div>
        </div>
        
        <div class="stat-group">
          <h4>监控信息</h4>
          <div class="stat-items">
            <div class="stat-item">
              <span class="label">样本数:</span>
              <span class="value">{{ statistics.sampleCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">监控时长:</span>
              <span class="value">{{ formatDuration(statistics.timeRange.end - statistics.timeRange.start) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  VideoPlay,
  VideoPause,
  Delete,
  Download,
  Cpu,
  Operation,
  Connection,
  Timer,
  DataAnalysis
} from '@element-plus/icons-vue'
import { 
  PerformanceMonitor, 
  type PerformanceMetrics 
} from '@/utils/performance'

// 响应式数据
const isMonitoring = ref(false)
const currentMetrics = ref<PerformanceMetrics | null>(null)
const sampleCount = ref(0)
const statistics = ref<any>(null)

// 性能监控器实例
const monitor = new PerformanceMonitor(200)

// 计算属性
const hasHistory = computed(() => sampleCount.value > 0)

// 方法
const startMonitoring = () => {
  monitor.startMonitoring(1000)
  isMonitoring.value = true
  ElMessage.success('开始性能监控')
}

const stopMonitoring = () => {
  monitor.stopMonitoring()
  isMonitoring.value = false
  updateStatistics()
  ElMessage.info('停止性能监控')
}

const clearHistory = () => {
  monitor.clearHistory()
  sampleCount.value = 0
  statistics.value = null
  ElMessage.success('历史数据已清空')
}

const exportData = () => {
  try {
    const data = monitor.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-data-${new Date().toISOString().slice(0, 19)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('性能数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const updateStatistics = () => {
  statistics.value = monitor.getStatistics()
}

const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const formatTime = (time: number): string => {
  if (time < 1000) {
    return `${Math.round(time)}ms`
  }
  return `${(time / 1000).toFixed(2)}s`
}

const formatDuration = (duration: number): string => {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

// 监控回调
const onMetricsUpdate = (metrics: PerformanceMetrics) => {
  currentMetrics.value = metrics
  sampleCount.value = monitor.getHistory().metrics.length
}

// 生命周期
onMounted(() => {
  // 获取初始指标
  currentMetrics.value = monitor.getCurrentMetrics()
  
  // 注册回调
  monitor.onMetricsUpdate(onMetricsUpdate)
})

onUnmounted(() => {
  monitor.stopMonitoring()
  monitor.removeCallback(onMetricsUpdate)
})
</script>

<style scoped>
.performance-monitor-container {
  padding: 24px;
  max-width: 100%;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.title-icon {
  color: var(--el-color-primary);
  font-size: 28px;
}

.page-description {
  color: var(--el-text-color-secondary);
  margin: 0;
  font-size: 14px;
}

.monitor-controls {
  margin-bottom: 24px;
}

.controls-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.controls-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.control-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sample-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: var(--el-border-color-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.metric-icon {
  font-size: 18px;
}

.memory-icon {
  color: #409eff;
}

.cpu-icon {
  color: #67c23a;
}

.network-icon {
  color: #e6a23c;
}

.page-icon {
  color: #f56c6c;
}

.metric-content {
  padding: 16px 0;
}

.metric-value {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.metric-value .value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.metric-value .unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.metric-progress {
  margin-top: 8px;
}

.network-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.network-status {
  display: flex;
  align-items: center;
}

.network-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item,
.perf-item,
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.detail-item .label,
.perf-item .label,
.stat-item .label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.detail-item .value,
.perf-item .value,
.stat-item .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
  font-size: 14px;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.statistics-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.statistics-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-group h4 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.stat-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-monitor-container {
    padding: 16px;
  }

  .controls-content {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: center;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .statistics-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* 动画效果 */
.performance-monitor-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card {
  animation: slideInUp 0.3s ease-in-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .controls-card,
  .metric-card,
  .statistics-card {
    border-color: var(--el-border-color-dark);
  }

  .metric-card:hover {
    border-color: var(--el-border-color);
  }
}
</style>
