<template>
  <div class="network-diagnostics">
    <div class="page-header">
      <h2>网络诊断工具</h2>
      <p>检测网络连接状态和工具可用性</p>
    </div>

    <el-card class="diagnostic-card">
      <template #header>
        <div class="card-header">
          <el-icon><Monitor /></el-icon>
          <span>网络状态检测</span>
          <el-button 
            type="primary" 
            @click="runDiagnostics" 
            :loading="isRunning"
            class="run-button"
          >
            <el-icon><Refresh /></el-icon>
            {{ isRunning ? '检测中...' : '开始检测' }}
          </el-button>
        </div>
      </template>

      <div v-if="!diagnosticResult && !isRunning" class="empty-state">
        <el-empty description="点击开始检测按钮检查网络状态" />
      </div>

      <div v-if="isRunning" class="loading-state">
        <el-skeleton :rows="4" animated />
        <p class="loading-text">正在检测网络连接状态...</p>
      </div>

      <div v-if="diagnosticResult" class="diagnostic-results">
        <!-- 总体状态 -->
        <div class="overall-status">
          <el-alert
            :type="diagnosticResult.overall"
            :title="getOverallTitle()"
            :description="getOverallDescription()"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 详细测试结果 -->
        <div class="test-results">
          <h3>详细测试结果</h3>
          <div class="results-grid">
            <div
              v-for="result in diagnosticResult.results"
              :key="result.test"
              class="result-item"
            >
              <div class="result-header">
                <el-icon 
                  :class="result.success ? 'success-icon' : 'error-icon'"
                >
                  <Check v-if="result.success" />
                  <Close v-else />
                </el-icon>
                <span class="test-name">{{ result.test }}</span>
                <span v-if="result.latency" class="latency">
                  {{ result.latency }}ms
                </span>
              </div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </div>
        </div>

        <!-- 建议 -->
        <div v-if="diagnosticResult.recommendations.length > 0" class="recommendations">
          <h3>修复建议</h3>
          <ul class="recommendation-list">
            <li
              v-for="(recommendation, index) in diagnosticResult.recommendations"
              :key="index"
              class="recommendation-item"
            >
              <el-icon><InfoFilled /></el-icon>
              {{ recommendation }}
            </li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button @click="copyResults">
            <el-icon><CopyDocument /></el-icon>
            复制结果
          </el-button>
          <el-button @click="runDiagnostics">
            <el-icon><Refresh /></el-icon>
            重新检测
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 常见问题解决方案 -->
    <el-card class="solutions-card">
      <template #header>
        <div class="card-header">
          <el-icon><QuestionFilled /></el-icon>
          <span>常见问题解决方案</span>
        </div>
      </template>

      <el-collapse v-model="activeSolutions">
        <el-collapse-item name="whois" title="Whois 查询失败">
          <div class="solution-content">
            <p><strong>问题描述：</strong>无法获取域名的 Whois 信息</p>
            <p><strong>可能原因：</strong></p>
            <ul>
              <li>网络连接问题</li>
              <li>Whois 服务器限制</li>
              <li>域名不存在或格式错误</li>
            </ul>
            <p><strong>解决方案：</strong></p>
            <ol>
              <li>检查网络连接是否正常</li>
              <li>确认域名格式正确</li>
              <li>稍后重试，可能是服务器临时限制</li>
              <li>尝试使用其他 Whois 查询工具验证</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item name="dns" title="DNS 查询失败">
          <div class="solution-content">
            <p><strong>问题描述：</strong>无法解析域名的 DNS 记录</p>
            <p><strong>可能原因：</strong></p>
            <ul>
              <li>DNS 服务器问题</li>
              <li>域名不存在</li>
              <li>网络防火墙阻止</li>
            </ul>
            <p><strong>解决方案：</strong></p>
            <ol>
              <li>更换 DNS 服务器（推荐：8.8.8.8, 1.1.1.1）</li>
              <li>清除 DNS 缓存</li>
              <li>检查防火墙设置</li>
              <li>使用命令行工具验证：<code>nslookup domain.com</code></li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item name="ping" title="Ping 测试失败">
          <div class="solution-content">
            <p><strong>问题描述：</strong>无法 Ping 通目标主机</p>
            <p><strong>可能原因：</strong></p>
            <ul>
              <li>目标主机禁用 ICMP</li>
              <li>网络路由问题</li>
              <li>防火墙阻止</li>
            </ul>
            <p><strong>解决方案：</strong></p>
            <ol>
              <li>尝试使用 HTTP 连接测试代替</li>
              <li>检查本地网络设置</li>
              <li>使用 traceroute 检查网络路径</li>
              <li>联系网络管理员检查防火墙规则</li>
            </ol>
          </div>
        </el-collapse-item>

        <el-collapse-item name="cors" title="CORS 跨域问题">
          <div class="solution-content">
            <p><strong>问题描述：</strong>浏览器阻止跨域请求</p>
            <p><strong>可能原因：</strong></p>
            <ul>
              <li>浏览器安全策略</li>
              <li>API 服务器不支持 CORS</li>
              <li>请求头配置错误</li>
            </ul>
            <p><strong>解决方案：</strong></p>
            <ol>
              <li>使用支持 CORS 的 API 服务</li>
              <li>通过代理服务器转发请求</li>
              <li>使用浏览器扩展禁用 CORS（仅开发环境）</li>
              <li>联系 API 提供商添加 CORS 支持</li>
            </ol>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  Refresh,
  Check,
  Close,
  InfoFilled,
  CopyDocument,
  QuestionFilled
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import { runNetworkDiagnostics, type NetworkDiagnosticReport } from '@/utils/network/network-diagnostics'

const { copy } = useClipboard()

const isRunning = ref(false)
const diagnosticResult = ref<NetworkDiagnosticReport | null>(null)
const activeSolutions = ref(['whois'])

const runDiagnostics = async () => {
  isRunning.value = true
  diagnosticResult.value = null
  
  try {
    const result = await runNetworkDiagnostics()
    diagnosticResult.value = result
    
    if (result.overall === 'success') {
      ElMessage.success('网络诊断完成，状态良好')
    } else if (result.overall === 'warning') {
      ElMessage.warning('网络诊断完成，发现一些问题')
    } else {
      ElMessage.error('网络诊断完成，发现严重问题')
    }
  } catch (error) {
    ElMessage.error('网络诊断失败: ' + (error as Error).message)
  } finally {
    isRunning.value = false
  }
}

const getOverallTitle = (): string => {
  if (!diagnosticResult.value) return ''
  
  switch (diagnosticResult.value.overall) {
    case 'success':
      return '网络状态良好'
    case 'warning':
      return '网络状态一般'
    case 'error':
      return '网络状态异常'
    default:
      return '未知状态'
  }
}

const getOverallDescription = (): string => {
  if (!diagnosticResult.value) return ''
  
  const successCount = diagnosticResult.value.results.filter(r => r.success).length
  const totalCount = diagnosticResult.value.results.length
  
  return `${successCount}/${totalCount} 项测试通过`
}

const copyResults = async () => {
  if (!diagnosticResult.value) return
  
  const text = `网络诊断结果 - ${new Date().toLocaleString()}

总体状态: ${getOverallTitle()}
测试结果: ${getOverallDescription()}

详细结果:
${diagnosticResult.value.results.map(r => 
  `- ${r.test}: ${r.success ? '✓' : '✗'} ${r.message}${r.latency ? ` (${r.latency}ms)` : ''}`
).join('\n')}

建议:
${diagnosticResult.value.recommendations.map(r => `- ${r}`).join('\n')}`
  
  try {
    await copy(text)
    ElMessage.success('诊断结果已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.network-diagnostics {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.page-header p {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.diagnostic-card,
.solutions-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.run-button {
  margin-left: auto;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-text {
  margin-top: 16px;
  color: var(--el-text-color-secondary);
}

.diagnostic-results {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overall-status {
  margin-bottom: 8px;
}

.test-results h3,
.recommendations h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.result-item {
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.success-icon {
  color: var(--el-color-success);
}

.error-icon {
  color: var(--el-color-danger);
}

.test-name {
  font-weight: 600;
  flex: 1;
}

.latency {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-bg-color);
  padding: 2px 6px;
  border-radius: 4px;
}

.result-message {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.recommendation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.recommendation-item .el-icon {
  color: var(--el-color-primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.solution-content {
  line-height: 1.6;
}

.solution-content p {
  margin: 8px 0;
}

.solution-content ul,
.solution-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.solution-content li {
  margin: 4px 0;
}

.solution-content code {
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

@media (max-width: 768px) {
  .network-diagnostics {
    padding: 16px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
