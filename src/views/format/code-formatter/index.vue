<template>
  <div class="code-formatter-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Document /></el-icon>
        代码格式化工具
      </h1>
      <p class="page-description">
        支持 JavaScript、TypeScript、CSS、HTML 等多种语言的代码格式化
      </p>
    </div>

    <div class="formatter-content">
      <!-- 配置面板 -->
      <div class="config-panel">
        <el-card shadow="never" class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>格式化配置</span>
            </div>
          </template>
          
          <div class="config-form">
            <el-form :model="formatOptions" label-width="100px" size="small">
              <el-form-item label="语言类型">
                <el-select v-model="selectedLanguage" placeholder="选择语言">
                  <el-option
                    v-for="lang in supportedLanguages"
                    :key="lang.value"
                    :label="lang.label"
                    :value="lang.value"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="缩进大小">
                <el-input-number
                  v-model="formatOptions.indentSize"
                  :min="1"
                  :max="8"
                  controls-position="right"
                />
              </el-form-item>
              
              <el-form-item label="使用制表符">
                <el-switch v-model="formatOptions.useTabs" />
              </el-form-item>
              
              <el-form-item label="末尾换行">
                <el-switch v-model="formatOptions.insertFinalNewline" />
              </el-form-item>
              
              <el-form-item label="删除尾随空格">
                <el-switch v-model="formatOptions.trimTrailingWhitespace" />
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-section">
        <div class="editor-container">
          <div class="editor-header">
            <span class="editor-title">输入代码</span>
            <div class="editor-actions">
              <el-button
                type="primary"
                size="small"
                @click="formatCode"
                :loading="formatting"
                :disabled="!inputCode.trim()"
              >
                <el-icon><Star /></el-icon>
                格式化
              </el-button>
              <el-button
                size="small"
                @click="clearInput"
                :disabled="!inputCode.trim()"
              >
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
          </div>
          
          <el-input
            v-model="inputCode"
            type="textarea"
            :rows="20"
            placeholder="请输入要格式化的代码..."
            @input="handleInputChange"
          />
        </div>

        <div class="editor-container">
          <div class="editor-header">
            <span class="editor-title">格式化结果</span>
            <div class="editor-actions">
              <el-button
                size="small"
                @click="copyResult"
                :disabled="!outputCode.trim()"
              >
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
              <el-button
                size="small"
                @click="downloadResult"
                :disabled="!outputCode.trim()"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
          
          <el-input
            v-model="outputCode"
            type="textarea"
            :rows="20"
            readonly
            placeholder="格式化结果将显示在这里..."
          />
        </div>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="formatError"
        type="error"
        :title="formatError"
        show-icon
        :closable="false"
        class="error-alert"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Document,
  Setting,
  Star,
  Delete,
  CopyDocument,
  Download
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
// import MonacoEditor from '@/components/MonacoEditor.vue'
import { CodeFormatter, type FormatOptions } from '@/utils/formatter'

// 响应式数据
const inputCode = ref('')
const outputCode = ref('')
const selectedLanguage = ref('javascript')
const formatting = ref(false)
const formatError = ref('')

const formatOptions = reactive<FormatOptions>({
  indentSize: 2,
  useTabs: false,
  insertFinalNewline: true,
  trimTrailingWhitespace: true
})

// 使用 VueUse 的剪贴板功能
const { copy } = useClipboard()

// 支持的语言列表
const supportedLanguages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'CSS', value: 'css' },
  { label: 'HTML', value: 'html' },
  { label: 'JSON', value: 'json' }
]

// 编辑器配置（简化版）
const editorOptions = computed(() => ({
  tabSize: formatOptions.indentSize,
  insertSpaces: !formatOptions.useTabs
}))

// 方法
const formatCode = async () => {
  if (!inputCode.value.trim()) {
    ElMessage.warning('请输入要格式化的代码')
    return
  }

  try {
    formatting.value = true
    formatError.value = ''
    
    // 模拟异步处理
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const result = CodeFormatter.format(
      inputCode.value,
      selectedLanguage.value,
      formatOptions
    )
    
    if (result.error) {
      formatError.value = result.error
      ElMessage.error('格式化失败: ' + result.error)
    } else {
      outputCode.value = result.formatted
      ElMessage.success('代码格式化完成')
    }
  } catch (error) {
    formatError.value = error instanceof Error ? error.message : '未知错误'
    ElMessage.error('格式化过程中发生错误')
  } finally {
    formatting.value = false
  }
}

const clearInput = () => {
  inputCode.value = ''
  outputCode.value = ''
  formatError.value = ''
}

const copyResult = async () => {
  try {
    await copy(outputCode.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadResult = () => {
  try {
    const blob = new Blob([outputCode.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-code.${getFileExtension(selectedLanguage.value)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('文件下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    css: 'css',
    html: 'html',
    json: 'json'
  }
  return extensions[language] || 'txt'
}

const handleInputChange = () => {
  formatError.value = ''
}

// 设置默认示例代码
const setExampleCode = () => {
  const examples: Record<string, string> = {
    javascript: `function hello(name){if(name){console.log("Hello, "+name+"!");}else{console.log("Hello, World!");}}`,
    typescript: `interface User{name:string;age:number;}function greet(user:User):string{return \`Hello, \${user.name}!\`;}`,
    css: `.container{display:flex;justify-content:center;align-items:center;}.item{padding:10px;margin:5px;background-color:#f0f0f0;}`,
    html: `<div class="container"><h1>Title</h1><p>This is a paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul></div>`
  }
  
  inputCode.value = examples[selectedLanguage.value] || ''
}

// 监听语言变化，设置示例代码
watch(() => selectedLanguage.value, () => {
  if (!inputCode.value.trim()) {
    setExampleCode()
  }
}, { immediate: true })
</script>

<style scoped>
.code-formatter-container {
  padding: 24px;
  max-width: 100%;
  height: 100vh;
  overflow: auto;
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

.formatter-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: calc(100vh - 120px);
}

@media (max-width: 1200px) {
  .formatter-content {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.config-panel {
  height: fit-content;
}

.config-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.config-form {
  padding: 8px 0;
}

.editor-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

@media (max-width: 768px) {
  .editor-section {
    grid-template-columns: 1fr;
  }
}

.editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.editor-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.error-alert {
  margin-top: 16px;
  border-radius: 8px;
}

/* 动画效果 */
.code-formatter-container {
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

.editor-container {
  transition: all 0.3s ease;
}

.editor-container:hover {
  border-color: var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .config-card {
    border-color: var(--el-border-color-dark);
  }

  .editor-container {
    border-color: var(--el-border-color-dark);
    background: var(--el-bg-color-page);
  }

  .editor-header {
    background: var(--el-fill-color-dark);
    border-bottom-color: var(--el-border-color-dark);
  }
}
</style>
