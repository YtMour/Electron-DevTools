<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Odometer /></el-icon>
        项目仪表板
      </h1>
      <p class="page-description">
        YT Tools Plus 功能概览和使用统计
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon crypto">
            <el-icon><Lock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.crypto }}</div>
            <div class="stat-label">加密解密工具</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon format">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.format }}</div>
            <div class="stat-label">格式转换工具</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon file">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.file }}</div>
            <div class="stat-label">文件处理工具</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon network">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.network }}</div>
            <div class="stat-label">网络工具</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon system">
            <el-icon><Tools /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.system }}</div>
            <div class="stat-label">系统工具</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">工具总数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 功能模块 -->
    <div class="modules-section">
      <el-card shadow="never" class="modules-card">
        <template #header>
          <div class="card-header">
            <el-icon><Grid /></el-icon>
            <span>功能模块</span>
          </div>
        </template>

        <div class="modules-grid">
          <div
            v-for="module in modules"
            :key="module.path"
            class="module-item"
            @click="$router.push(module.path)"
          >
            <div class="module-icon" :class="module.iconClass">
              <el-icon>
                <component :is="module.icon" />
              </el-icon>
            </div>
            <div class="module-info">
              <h3 class="module-title">{{ module.name }}</h3>
              <p class="module-description">{{ module.description }}</p>
              <div class="module-stats">
                <el-tag type="info" effect="light" size="small">
                  {{ module.toolCount }} 个工具
                </el-tag>
                <el-tag :type="module.status.type" effect="light" size="small">
                  {{ module.status.text }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最新功能 -->
    <div class="features-section">
      <el-card shadow="never" class="features-card">
        <template #header>
          <div class="card-header">
            <el-icon><Star /></el-icon>
            <span>最新功能</span>
          </div>
        </template>

        <div class="features-list">
          <div
            v-for="feature in latestFeatures"
            :key="feature.name"
            class="feature-item"
          >
            <div class="feature-icon" :class="feature.iconClass">
              <el-icon>
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <div class="feature-content">
              <div class="feature-header">
                <h4 class="feature-title">{{ feature.name }}</h4>
                <el-tag type="success" effect="light" size="small">
                  {{ feature.version }}
                </el-tag>
              </div>
              <p class="feature-description">{{ feature.description }}</p>
              <div class="feature-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="$router.push(feature.path)"
                >
                  立即体验
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 使用提示 -->
    <div class="tips-section">
      <el-card shadow="never" class="tips-card">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>使用提示</span>
          </div>
        </template>

        <div class="tips-content">
          <el-alert
            v-for="tip in tips"
            :key="tip.title"
            :title="tip.title"
            :type="tip.type"
            :description="tip.description"
            show-icon
            :closable="false"
            class="tip-item"
          />
        </div>
      </el-card>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <el-card shadow="never" class="actions-card">
        <template #header>
          <div class="card-header">
            <el-icon><Lightning /></el-icon>
            <span>快速操作</span>
          </div>
        </template>

        <div class="actions-grid">
          <el-button
            v-for="action in quickActions"
            :key="action.name"
            :type="action.type"
            :icon="action.icon"
            @click="handleQuickAction(action)"
            class="action-button"
          >
            {{ action.name }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Odometer,
  Lock,
  Document,
  Folder,
  Connection,
  Tools,
  DataAnalysis,
  Grid,
  Star,
  InfoFilled,
  Lightning,
  Monitor,
  Search,
  Brush,
  Setting,
  Download,
  Refresh
} from '@element-plus/icons-vue'

// 统计数据
const stats = reactive({
  crypto: 8,
  format: 6,
  file: 5,
  network: 8,
  system: 4,
  total: 31
})

// 功能模块
const modules = [
  {
    name: '加密解密',
    path: '/crypto',
    description: '提供各种加密解密算法和工具',
    icon: 'Lock',
    iconClass: 'crypto',
    toolCount: 8,
    status: { type: 'success', text: '稳定' }
  },
  {
    name: '格式转换',
    path: '/format',
    description: '支持多种数据格式的相互转换',
    icon: 'Document',
    iconClass: 'format',
    toolCount: 6,
    status: { type: 'success', text: '稳定' }
  },
  {
    name: '文件处理',
    path: '/file',
    description: '文件操作和处理相关工具',
    icon: 'Folder',
    iconClass: 'file',
    toolCount: 5,
    status: { type: 'success', text: '稳定' }
  },
  {
    name: '网络工具',
    path: '/network',
    description: '网络诊断和信息查询工具',
    icon: 'Connection',
    iconClass: 'network',
    toolCount: 8,
    status: { type: 'success', text: '稳定' }
  },
  {
    name: '系统工具',
    path: '/tools',
    description: '系统监控和开发辅助工具',
    icon: 'Tools',
    iconClass: 'system',
    toolCount: 4,
    status: { type: 'warning', text: '新增' }
  }
]

// 最新功能
const latestFeatures = [
  {
    name: '性能监控工具',
    path: '/tools/performance-monitor',
    description: '实时监控应用性能指标，包括内存、CPU、网络状态等',
    icon: 'Monitor',
    iconClass: 'performance',
    version: 'v1.3.7'
  },
  {
    name: 'API 测试工具',
    path: '/tools/api-tester',
    description: '强大的 RESTful API 测试工具，支持多种请求方法',
    icon: 'Connection',
    iconClass: 'api',
    version: 'v1.3.7'
  },
  {
    name: '正则表达式测试器',
    path: '/tools/regex-tester',
    description: '正则表达式测试和学习工具，支持实时匹配',
    icon: 'Search',
    iconClass: 'regex',
    version: 'v1.3.7'
  },
  {
    name: '颜色选择器',
    path: '/tools/color-picker',
    description: '专业的颜色选择和转换工具，支持多种颜色格式',
    icon: 'Brush',
    iconClass: 'color',
    version: 'v1.3.7'
  }
]

// 使用提示
const tips = [
  {
    title: '快捷键支持',
    description: '大部分工具支持键盘快捷键操作，提高使用效率',
    type: 'info'
  },
  {
    title: '数据安全',
    description: '所有数据处理均在本地进行，不会上传到服务器',
    type: 'success'
  },
  {
    title: '主题切换',
    description: '支持明暗主题切换，可在右上角设置中调整',
    type: 'info'
  },
  {
    title: '功能建议',
    description: '如有功能建议或问题反馈，欢迎通过 GitHub 提交 Issue',
    type: 'warning'
  }
]

// 快速操作
const quickActions = [
  {
    name: '性能监控',
    type: 'primary',
    icon: Monitor,
    action: 'performance'
  },
  {
    name: 'API 测试',
    type: 'success',
    icon: Connection,
    action: 'api'
  },
  {
    name: '正则测试',
    type: 'warning',
    icon: Search,
    action: 'regex'
  },
  {
    name: '颜色选择',
    type: 'danger',
    icon: Brush,
    action: 'color'
  },
  {
    name: '系统设置',
    type: 'info',
    icon: Setting,
    action: 'settings'
  },
  {
    name: '导出数据',
    type: 'default',
    icon: Download,
    action: 'export'
  }
]

// 方法
const handleQuickAction = (action: any) => {
  switch (action.action) {
    case 'performance':
      window.location.href = '#/tools/performance-monitor'
      break
    case 'api':
      window.location.href = '#/tools/api-tester'
      break
    case 'regex':
      window.location.href = '#/tools/regex-tester'
      break
    case 'color':
      window.location.href = '#/tools/color-picker'
      break
    case 'settings':
      ElMessage.info('设置功能将在后续版本中提供')
      break
    case 'export':
      ElMessage.info('数据导出功能将在后续版本中提供')
      break
    default:
      ElMessage.info(`执行操作: ${action.name}`)
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  max-width: 100%;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.title-icon {
  color: var(--el-color-primary);
  font-size: 32px;
}

.page-description {
  color: var(--el-text-color-secondary);
  font-size: 16px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.stat-icon.crypto {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.stat-icon.format {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.stat-icon.file {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.stat-icon.network {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.stat-icon.system {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.modules-section,
.features-section,
.tips-section,
.quick-actions {
  margin-bottom: 32px;
}

.modules-card,
.features-card,
.tips-card,
.actions-card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 18px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-fill-color-light);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  transform: translateY(-2px);
}

.module-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.module-icon.crypto {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.module-icon.format {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.module-icon.file {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.module-icon.network {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.module-icon.system {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.module-info {
  flex: 1;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.module-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.module-stats {
  display: flex;
  gap: 8px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--el-fill-color-light);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
}

.feature-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 20px;
  flex-shrink: 0;
}

.feature-icon.performance {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.feature-icon.api {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.feature-icon.regex {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.feature-icon.color {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.feature-content {
  flex: 1;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.feature-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.feature-actions {
  display: flex;
  gap: 8px;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  border-radius: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.action-button {
  height: 60px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .module-item,
  .feature-item {
    flex-direction: column;
    text-align: center;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
.dashboard-container {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card,
.module-item,
.feature-item {
  animation: slideInUp 0.6s ease-in-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .stat-card,
  .modules-card,
  .features-card,
  .tips-card,
  .actions-card {
    border-color: var(--el-border-color-dark);
  }

  .module-item,
  .feature-item {
    background: var(--el-fill-color-dark);
    border-color: var(--el-border-color-dark);
  }

  .module-item:hover {
    background: var(--el-color-primary-light-8);
  }
}
</style>
