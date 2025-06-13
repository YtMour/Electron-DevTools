<template>
  <div class="tools-home">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Tools /></el-icon>
        系统工具
      </h1>
      <p class="page-description">
        提供系统性能监控、错误诊断等实用工具
      </p>
    </div>

    <div class="tools-grid">
      <el-card
        shadow="hover"
        class="tool-card"
        @click="$router.push('/tools/performance-monitor')"
      >
        <div class="tool-content">
          <div class="tool-icon performance">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">性能监控</h3>
            <p class="tool-description">实时监控应用性能指标</p>
          </div>
        </div>
      </el-card>

      <el-card
        shadow="hover"
        class="tool-card"
        @click="$router.push('/tools/api-tester')"
      >
        <div class="tool-content">
          <div class="tool-icon api">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">API 测试工具</h3>
            <p class="tool-description">强大的 RESTful API 测试工具</p>
          </div>
        </div>
      </el-card>

      <el-card
        shadow="hover"
        class="tool-card"
        @click="$router.push('/tools/regex-tester')"
      >
        <div class="tool-content">
          <div class="tool-icon regex">
            <el-icon><Search /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">正则表达式测试器</h3>
            <p class="tool-description">正则表达式测试和学习工具</p>
          </div>
        </div>
      </el-card>

      <el-card
        shadow="hover"
        class="tool-card"
        @click="$router.push('/tools/color-picker')"
      >
        <div class="tool-content">
          <div class="tool-icon color">
            <el-icon><Brush /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-title">颜色选择器</h3>
            <p class="tool-description">专业的颜色选择和转换工具</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tools, Monitor, Connection, Search, Brush } from '@element-plus/icons-vue'
</script>

<style scoped>
.tools-home {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.tool-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tool-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.tool-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  transition: all 0.3s ease;
}

.tool-icon.performance {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.tool-icon.api {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.tool-icon.regex {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.tool-icon.color {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.tool-info {
  flex: 1;
}

.tool-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.tool-description {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .tools-home {
    padding: 16px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
