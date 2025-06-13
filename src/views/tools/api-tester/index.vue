<template>
  <div class="api-tester-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Connection /></el-icon>
        API 测试工具
      </h1>
      <p class="page-description">
        强大的 RESTful API 测试工具，支持多种请求方法和参数配置
      </p>
    </div>

    <div class="tester-layout">
      <!-- 请求配置面板 -->
      <div class="request-panel">
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>请求配置</span>
            </div>
          </template>

          <div class="request-form">
            <!-- 请求方法和URL -->
            <div class="url-section">
              <el-select v-model="requestConfig.method" class="method-select">
                <el-option
                  v-for="method in httpMethods"
                  :key="method.value"
                  :label="method.label"
                  :value="method.value"
                  :class="`method-${method.value.toLowerCase()}`"
                />
              </el-select>
              
              <el-input
                v-model="requestConfig.url"
                placeholder="请输入 API 地址，例如: https://api.example.com/users"
                class="url-input"
              >
                <template #append>
                  <el-button
                    type="primary"
                    @click="sendRequest"
                    :loading="loading"
                    :disabled="!requestConfig.url.trim()"
                  >
                    发送
                  </el-button>
                </template>
              </el-input>
            </div>

            <!-- 请求头 -->
            <div class="headers-section">
              <div class="section-title">
                <span>请求头</span>
                <el-button type="text" size="small" @click="addHeader">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
              
              <div class="headers-list">
                <div
                  v-for="(header, index) in requestConfig.headers"
                  :key="index"
                  class="header-item"
                >
                  <el-input
                    v-model="header.key"
                    placeholder="Header 名称"
                    size="small"
                  />
                  <el-input
                    v-model="header.value"
                    placeholder="Header 值"
                    size="small"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeHeader(index)"
                    :icon="Delete"
                  />
                </div>
              </div>
            </div>

            <!-- 请求参数 -->
            <div class="params-section" v-if="showParams">
              <div class="section-title">
                <span>查询参数</span>
                <el-button type="text" size="small" @click="addParam">
                  <el-icon><Plus /></el-icon>
                  添加
                </el-button>
              </div>
              
              <div class="params-list">
                <div
                  v-for="(param, index) in requestConfig.params"
                  :key="index"
                  class="param-item"
                >
                  <el-input
                    v-model="param.key"
                    placeholder="参数名"
                    size="small"
                  />
                  <el-input
                    v-model="param.value"
                    placeholder="参数值"
                    size="small"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeParam(index)"
                    :icon="Delete"
                  />
                </div>
              </div>
            </div>

            <!-- 请求体 -->
            <div class="body-section" v-if="showBody">
              <div class="section-title">
                <span>请求体</span>
                <el-select v-model="requestConfig.bodyType" size="small">
                  <el-option label="JSON" value="json" />
                  <el-option label="Form Data" value="form" />
                  <el-option label="Raw Text" value="raw" />
                </el-select>
              </div>
              
              <div class="body-content">
                <el-input
                  v-if="requestConfig.bodyType === 'json' || requestConfig.bodyType === 'raw'"
                  v-model="requestConfig.body"
                  type="textarea"
                  :rows="8"
                  :placeholder="getBodyPlaceholder()"
                />
                
                <div v-else-if="requestConfig.bodyType === 'form'" class="form-data">
                  <div class="form-data-header">
                    <span>Form Data</span>
                    <el-button type="text" size="small" @click="addFormField">
                      <el-icon><Plus /></el-icon>
                      添加字段
                    </el-button>
                  </div>
                  
                  <div class="form-fields">
                    <div
                      v-for="(field, index) in requestConfig.formData"
                      :key="index"
                      class="form-field"
                    >
                      <el-input
                        v-model="field.key"
                        placeholder="字段名"
                        size="small"
                      />
                      <el-input
                        v-model="field.value"
                        placeholder="字段值"
                        size="small"
                      />
                      <el-button
                        type="danger"
                        size="small"
                        @click="removeFormField(index)"
                        :icon="Delete"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 响应面板 -->
      <div class="response-panel">
        <el-card shadow="never" class="response-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>响应结果</span>
              <div class="response-actions" v-if="response">
                <el-button type="text" size="small" @click="copyResponse">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
                <el-button type="text" size="small" @click="downloadResponse">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
          </template>

          <div class="response-content">
            <div v-if="loading" class="loading-state">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>正在发送请求...</span>
            </div>

            <div v-else-if="response" class="response-data">
              <!-- 响应状态 -->
              <div class="response-status">
                <el-tag
                  :type="getStatusType(response.status)"
                  effect="light"
                  size="large"
                >
                  {{ response.status }} {{ response.statusText }}
                </el-tag>
                <span class="response-time">{{ response.time }}ms</span>
                <span class="response-size">{{ formatSize(response.size) }}</span>
              </div>

              <!-- 响应头 -->
              <div class="response-headers">
                <h4>响应头</h4>
                <div class="headers-display">
                  <div
                    v-for="(value, key) in response.headers"
                    :key="key"
                    class="header-display-item"
                  >
                    <span class="header-key">{{ key }}:</span>
                    <span class="header-value">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- 响应体 -->
              <div class="response-body">
                <h4>响应体</h4>
                <div class="body-display">
                  <pre v-if="response.data" class="response-text">{{ formatResponseData(response.data) }}</pre>
                  <div v-else class="empty-response">无响应数据</div>
                </div>
              </div>
            </div>

            <div v-else-if="error" class="error-state">
              <el-alert
                :title="error.message"
                type="error"
                show-icon
                :closable="false"
              >
                <template #default>
                  <div v-if="error.details">
                    <p><strong>错误详情:</strong></p>
                    <pre class="error-details">{{ error.details }}</pre>
                  </div>
                </template>
              </el-alert>
            </div>

            <div v-else class="empty-state">
              <el-empty description="点击发送按钮开始测试 API" :image-size="120" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Connection,
  Setting,
  Plus,
  Delete,
  Document,
  CopyDocument,
  Download,
  Loading
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'

// 接口定义
interface KeyValuePair {
  key: string
  value: string
}

interface RequestConfig {
  method: string
  url: string
  headers: KeyValuePair[]
  params: KeyValuePair[]
  body: string
  bodyType: 'json' | 'form' | 'raw'
  formData: KeyValuePair[]
}

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  time: number
  size: number
}

interface ApiError {
  message: string
  details?: string
}

// 响应式数据
const loading = ref(false)
const response = ref<ApiResponse | null>(null)
const error = ref<ApiError | null>(null)

const requestConfig = ref<RequestConfig>({
  method: 'GET',
  url: '',
  headers: [
    { key: 'Content-Type', value: 'application/json' }
  ],
  params: [],
  body: '',
  bodyType: 'json',
  formData: []
})

// 使用剪贴板
const { copy } = useClipboard()

// HTTP 方法选项
const httpMethods = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' }
]

// 计算属性
const showParams = computed(() => ['GET', 'DELETE', 'HEAD'].includes(requestConfig.value.method))
const showBody = computed(() => ['POST', 'PUT', 'PATCH'].includes(requestConfig.value.method))

// 方法
const addHeader = () => {
  requestConfig.value.headers.push({ key: '', value: '' })
}

const removeHeader = (index: number) => {
  requestConfig.value.headers.splice(index, 1)
}

const addParam = () => {
  requestConfig.value.params.push({ key: '', value: '' })
}

const removeParam = (index: number) => {
  requestConfig.value.params.splice(index, 1)
}

const addFormField = () => {
  requestConfig.value.formData.push({ key: '', value: '' })
}

const removeFormField = (index: number) => {
  requestConfig.value.formData.splice(index, 1)
}

const getBodyPlaceholder = (): string => {
  switch (requestConfig.value.bodyType) {
    case 'json':
      return '{\n  "key": "value"\n}'
    case 'raw':
      return '请输入原始文本数据...'
    default:
      return ''
  }
}

const sendRequest = async () => {
  if (!requestConfig.value.url.trim()) {
    ElMessage.warning('请输入 API 地址')
    return
  }

  loading.value = true
  error.value = null
  response.value = null

  try {
    const startTime = performance.now()
    
    // 构建请求配置
    const config: RequestInit = {
      method: requestConfig.value.method,
      headers: {}
    }

    // 添加请求头
    requestConfig.value.headers.forEach(header => {
      if (header.key && header.value) {
        (config.headers as Record<string, string>)[header.key] = header.value
      }
    })

    // 构建 URL（添加查询参数）
    let url = requestConfig.value.url
    if (showParams.value && requestConfig.value.params.length > 0) {
      const params = new URLSearchParams()
      requestConfig.value.params.forEach(param => {
        if (param.key && param.value) {
          params.append(param.key, param.value)
        }
      })
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString()
      }
    }

    // 添加请求体
    if (showBody.value) {
      if (requestConfig.value.bodyType === 'json' && requestConfig.value.body) {
        config.body = requestConfig.value.body
      } else if (requestConfig.value.bodyType === 'form') {
        const formData = new FormData()
        requestConfig.value.formData.forEach(field => {
          if (field.key && field.value) {
            formData.append(field.key, field.value)
          }
        })
        config.body = formData
        // 移除 Content-Type，让浏览器自动设置
        delete (config.headers as Record<string, string>)['Content-Type']
      } else if (requestConfig.value.bodyType === 'raw') {
        config.body = requestConfig.value.body
      }
    }

    // 发送请求
    const res = await fetch(url, config)
    const endTime = performance.now()

    // 获取响应头
    const headers: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      headers[key] = value
    })

    // 获取响应数据
    const contentType = res.headers.get('content-type') || ''
    let data: any
    
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    // 计算响应大小
    const size = new Blob([JSON.stringify(data)]).size

    response.value = {
      status: res.status,
      statusText: res.statusText,
      headers,
      data,
      time: Math.round(endTime - startTime),
      size
    }

    ElMessage.success('请求发送成功')
  } catch (err) {
    error.value = {
      message: err instanceof Error ? err.message : '请求失败',
      details: err instanceof Error ? err.stack : undefined
    }
    ElMessage.error('请求发送失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: number): 'success' | 'warning' | 'danger' | 'info' => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'info'
  if (status >= 400 && status < 500) return 'warning'
  return 'danger'
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatResponseData = (data: any): string => {
  if (typeof data === 'string') return data
  return JSON.stringify(data, null, 2)
}

const copyResponse = async () => {
  if (!response.value) return
  
  try {
    const text = formatResponseData(response.value.data)
    await copy(text)
    ElMessage.success('响应数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadResponse = () => {
  if (!response.value) return
  
  try {
    const data = formatResponseData(response.value.data)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-response-${new Date().toISOString().slice(0, 19)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('响应数据下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}
</script>

<style scoped>
.api-tester-container {
  padding: 24px;
  max-width: 100%;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
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

.tester-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  height: calc(100vh - 120px);
}

@media (max-width: 1200px) {
  .tester-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.config-card,
.response-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.response-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.request-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.url-section {
  display: flex;
  gap: 8px;
}

.method-select {
  width: 120px;
}

.url-input {
  flex: 1;
}

.section-title {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.headers-list,
.params-list,
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-item,
.param-item,
.form-field {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-item .el-input,
.param-item .el-input,
.form-field .el-input {
  flex: 1;
}

.body-content {
  margin-top: 12px;
}

.form-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.response-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  color: var(--el-text-color-secondary);
}

.loading-state .el-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.response-data {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.response-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.response-time,
.response-size {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  background: var(--el-bg-color);
  padding: 4px 8px;
  border-radius: 4px;
}

.response-headers h4,
.response-body h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.headers-display {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.header-display-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.header-key {
  color: var(--el-color-primary);
  font-weight: 600;
  min-width: 120px;
}

.header-value {
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.body-display {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow: auto;
}

.response-text {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-response {
  color: var(--el-text-color-secondary);
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.error-state {
  padding: 20px;
}

.error-details {
  margin: 8px 0 0 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: var(--el-fill-color-light);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px;
}

/* HTTP 方法颜色 */
.method-get {
  color: #67c23a;
}

.method-post {
  color: #409eff;
}

.method-put {
  color: #e6a23c;
}

.method-delete {
  color: #f56c6c;
}

.method-patch {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .api-tester-container {
    padding: 16px;
  }

  .url-section {
    flex-direction: column;
  }

  .method-select {
    width: 100%;
  }

  .header-item,
  .param-item,
  .form-field {
    flex-direction: column;
  }

  .response-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* 动画效果 */
.api-tester-container {
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

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .config-card,
  .response-card {
    border-color: var(--el-border-color-dark);
  }

  .headers-display,
  .body-display {
    background: var(--el-fill-color-dark);
  }

  .response-status {
    background: var(--el-fill-color-dark);
  }
}
</style>
