<template>
  <div class="format-page csv-page">
    <div class="page-header">
      <div class="header-title">
        <h2>CSV/JSON 转换</h2>
        <p class="header-desc">支持 CSV 和 JSON 格式互相转换、格式化和压缩</p>
      </div>
      <div class="header-controls">
        <div class="mode-controls">
          <el-radio-group v-model="mode" size="default">
            <el-radio-button label="format">
              <el-icon class="mode-icon"><Menu /></el-icon>
              格式化
            </el-radio-button>
            <el-radio-button label="compress">
              <el-icon class="mode-icon"><Fold /></el-icon>
              压缩
            </el-radio-button>
            <el-radio-button label="csv2json">
              <el-icon class="mode-icon"><Document /></el-icon>
              CSV 转 JSON
            </el-radio-button>
            <el-radio-button label="json2csv">
              <el-icon class="mode-icon"><List /></el-icon>
              JSON 转 CSV
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="upload-control">
          <el-tooltip content="上传文件" placement="top">
            <el-upload
              class="upload-btn"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange">
              <el-button type="primary" size="default" class="upload-btn">
                <el-icon><Upload /></el-icon>
                上传文件
              </el-button>
            </el-upload>
          </el-tooltip>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="editor-container">
        <div class="editor-section input-section">
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><Edit /></el-icon>
              <span>{{ getInputTitle() }}</span>
            </span>
            <div class="editor-controls">
              <el-tooltip content="清空" placement="top">
                <el-button type="info" plain size="small" class="delete-btn" @click="handleClearInput">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="从剪贴板粘贴" placement="top">
                <el-button type="info" plain size="small" class="copy-btn" @click="handlePasteInput">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div
            class="editor-area"
            @drop.prevent="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragenter.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            :class="{ 'drag-over': isDragOver }">
            <div class="drop-overlay" v-if="isDragOver">
              <el-icon class="drop-icon"><Upload /></el-icon>
              <span>释放文件以上传</span>
            </div>
            <div class="monaco-wrapper">
              <MonacoEditor
                v-model:value="input"
                :language="getInputLanguage()"
                theme="vs-dark"
                @change="handleInput"
              />
            </div>
          </div>
          <div class="editor-footer">
            <span>字符数：{{ input.length }}</span>
          </div>
        </div>

        <div class="editor-actions">
          <el-tooltip content="转换" placement="top">
            <el-button 
              type="primary" 
              size="large" 
              circle 
              class="convert-btn"
              @click="handleProcess"
              :disabled="!input.trim()">
              <el-icon><Right /></el-icon>
            </el-button>
          </el-tooltip>
        </div>

        <div class="editor-section output-section">
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><View /></el-icon>
              <span>{{ getOutputTitle() }}</span>
            </span>
            <div class="editor-controls">
              <el-tooltip content="清空" placement="top">
                <el-button type="info" plain size="small" class="delete-btn" @click="handleClearOutput">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="复制到剪贴板" placement="top">
                <el-button type="success" plain size="small" class="copy-btn" @click="handleCopyOutput" :disabled="!output">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="下载文件" placement="top">
                <el-button type="primary" plain size="small" class="download-btn" @click="handleDownloadOutput" :disabled="!output">
                  <el-icon><Download /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="editor-area output-area">
            <div class="monaco-wrapper">
              <MonacoEditor
                v-model:value="output"
                :language="getOutputLanguage()"
                theme="vs-dark"
                :options="{ readOnly: true }"
              />
            </div>
          </div>
          <div class="editor-footer">
            <span>字符数：{{ output.length }}</span>
          </div>
        </div>
      </div>

      <div class="options-panel">
        <div class="options-header">
          <el-icon><Setting /></el-icon>
          <span>转换选项</span>
        </div>
        <el-form :model="options" label-position="top" size="default">
          <template v-if="mode === 'csv2json'">
            <el-form-item label="分隔符">
              <el-select v-model="options.delimiter" style="width: 100%">
                <el-option label="逗号 ," value="," />
                <el-option label="分号 ;" value=";" />
                <el-option label="制表符 \t" value="\t" />
                <el-option label="竖线 |" value="|" />
                <el-option label="自动检测" value="auto" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-checkbox v-model="options.header">首行为表头</el-checkbox>
                </el-col>
                <el-col :span="12">
                  <el-checkbox v-model="options.dynamicTyping">自动类型转换</el-checkbox>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-checkbox v-model="options.skipEmptyLines">跳过空行</el-checkbox>
                </el-col>
                <el-col :span="12">
                  <el-checkbox v-model="options.liveConversion">实时转换</el-checkbox>
                </el-col>
              </el-row>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="分隔符">
              <el-select v-model="options.delimiter" style="width: 100%">
                <el-option label="逗号 ," value="," />
                <el-option label="分号 ;" value=";" />
                <el-option label="制表符 \t" value="\t" />
                <el-option label="竖线 |" value="|" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-checkbox v-model="options.header">包含表头</el-checkbox>
                </el-col>
                <el-col :span="12">
                  <el-checkbox v-model="options.liveConversion">实时转换</el-checkbox>
                </el-col>
              </el-row>
            </el-form-item>
          </template>
          <el-divider />
          <el-form-item>
            <el-button type="primary" @click="handleProcess" :disabled="!input.trim()" style="width: 100%" class="convert-btn">
              <el-icon><Refresh /></el-icon>
              转换
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="help-section">
          <div class="help-header">
            <el-icon><InfoFilled /></el-icon>
            <span>使用帮助</span>
          </div>
          <div class="help-content">
            <p>
              <el-icon><Check /></el-icon>
              支持文件拖放上传
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持自动检测分隔符
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持实时转换预览
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持一键复制和下载
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Upload, Download, DocumentCopy, Delete, Right, Edit, View, 
  Setting, InfoFilled, Check, Refresh, Document, List, Menu, Fold
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile } from 'element-plus'
import { csv2json, json2csv, isValidCsv, isValidJson } from '@/utils/csv'
import { formatJson, compressJson } from '@/utils/json'
// 导入示例数据
import { csvExample, jsonExample } from '@/utils/csv-example'
import MonacoEditor from '@/components/MonacoEditor.vue'

const { copy } = useClipboard()
const mode = ref<'format' | 'compress' | 'csv2json' | 'json2csv'>('format')
const input = ref('')
const output = ref('')
const isDragOver = ref(false)

const options = reactive({
  delimiter: ',',
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  liveConversion: true,
  indentSize: 2
})

// 使用动态导入 papaparse
import('papaparse').then(papaparseModule => {
  const Papa = papaparseModule.default
  
  // 初始化示例数据
  if (mode.value === 'csv2json') {
    input.value = csvExample
  } else {
    input.value = JSON.stringify(jsonExample, null, 2)
  }
  handleProcess()
})

// 监听模式变化，清空输入输出并加载示例数据
watch(mode, () => {
  if (mode.value === 'csv2json') {
    input.value = csvExample
  } else {
    input.value = JSON.stringify(jsonExample, null, 2)
  }
  handleProcess()
})

// 获取输入标题
const getInputTitle = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'json2csv':
      return '输入 JSON'
    case 'csv2json':
      return '输入 CSV'
    default:
      return '输入'
  }
}

// 获取输出标题
const getOutputTitle = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
      return '输出结果'
    case 'csv2json':
      return '输出 JSON'
    case 'json2csv':
      return '输出 CSV'
    default:
      return '输出结果'
  }
}

// 获取输入占位符
const getInputPlaceholder = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'json2csv':
      return '请输入要处理的 JSON 文本，或拖放文件到此处'
    case 'csv2json':
      return '请输入要处理的 CSV 文本，或拖放文件到此处'
    default:
      return '请输入要处理的文本，或拖放文件到此处'
  }
}

// 获取输出占位符
const getOutputPlaceholder = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
      return '处理结果将显示在这里'
    case 'csv2json':
      return 'JSON 结果将显示在这里'
    case 'json2csv':
      return 'CSV 结果将显示在这里'
    default:
      return '处理结果将显示在这里'
  }
}

// 获取输入语言
const getInputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'json2csv':
      return 'json'
    case 'csv2json':
      return 'csv'
    default:
      return 'plaintext'
  }
}

// 获取输出语言
const getOutputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
      return 'plaintext'
    case 'csv2json':
      return 'json'
    case 'json2csv':
      return 'csv'
    default:
      return 'plaintext'
  }
}

// 处理输入变化
const handleInput = () => {
  if (options.liveConversion) {
    handleProcess()
  }
}

// 处理转换
const handleProcess = () => {
  if (!input.value.trim()) {
    output.value = ''
    return
  }

  try {
    switch (mode.value) {
      case 'format':
        // 格式化 JSON
        if (!isValidJson(input.value)) {
          ElMessage.error('无效的 JSON 格式')
          return
        }
        output.value = formatJson(input.value, options.indentSize)
        break
        
      case 'compress':
        // 压缩 JSON
        if (!isValidJson(input.value)) {
          ElMessage.error('无效的 JSON 格式')
          return
        }
        output.value = compressJson(input.value)
        break
        
      case 'csv2json':
        if (!isValidCsv(input.value)) {
          ElMessage.error('无效的 CSV 格式')
          return
        }
        output.value = csv2json(
          input.value, 
          options.header, 
          options.delimiter, 
          options.dynamicTyping,
          options.indentSize
        )
        break
        
      case 'json2csv':
        if (!isValidJson(input.value)) {
          ElMessage.error('无效的 JSON 格式')
          return
        }
        output.value = json2csv(
          input.value, 
          options.header, 
          options.delimiter
        )
        break
    }
  } catch (error) {
    ElMessage.error(`转换失败: ${(error as Error).message}`)
  }
}

// 处理文件上传
const handleFileChange = async (uploadFile: UploadFile) => {
  try {
    const file = uploadFile.raw
    if (!file) {
      ElMessage.error('文件处理失败')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        input.value = e.target.result as string
        
        // 如果是 CSV 模式且设置为自动检测分隔符
        if (mode.value === 'csv2json' && options.delimiter === 'auto') {
          options.delimiter = detectDelimiter(input.value)
        }
        
        handleProcess()
        ElMessage.success(`文件 "${file.name}" 已成功加载`)
      }
    }
    reader.readAsText(file)
  } catch (error) {
    ElMessage.error('文件处理失败')
  }
}

// 处理拖放
const handleDrop = (e: DragEvent) => {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        input.value = e.target.result as string
        
        // 如果是 CSV 模式且设置为自动检测分隔符
        if (mode.value === 'csv2json' && options.delimiter === 'auto') {
          options.delimiter = detectDelimiter(input.value)
        }
        
        handleProcess()
        ElMessage.success(`文件 "${files[0].name}" 已成功加载`)
      }
    }
    reader.readAsText(files[0])
  }
}

// 拖拽状态处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

// 清空输入
const handleClearInput = () => {
  input.value = ''
  if (options.liveConversion) {
    output.value = ''
  }
  ElMessage.info('输入已清空')
}

// 清空输出
const handleClearOutput = () => {
  output.value = ''
  ElMessage.info('输出已清空')
}

// 粘贴到输入
const handlePasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText()
    input.value = text
    
    // 如果是 CSV 模式且设置为自动检测分隔符
    if (mode.value === 'csv2json' && options.delimiter === 'auto') {
      options.delimiter = detectDelimiter(input.value)
    }
    
    handleProcess()
    ElMessage.success('已从剪贴板粘贴内容')
  } catch (error) {
    ElMessage.error('无法访问剪贴板')
  }
}

// 复制输出
const handleCopyOutput = () => {
  if (!output.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  copy(output.value)
  ElMessage.success('已复制到剪贴板')
}

// 下载输出
const handleDownloadOutput = () => {
  if (!output.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }
  
  const blob = new Blob([output.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = mode.value === 'csv2json' ? 'output.json' : 'output.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success(`已下载为 ${mode.value === 'csv2json' ? 'output.json' : 'output.csv'}`)
}

// 检测 CSV 分隔符
function detectDelimiter(csvStr: string): string {
  const firstLine = csvStr.split('\n')[0]
  const delimiters = [',', ';', '\t', '|']
  let bestDelimiter = ','
  let maxCount = 0
  
  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(delimiter, 'g')) || []).length
    if (count > maxCount) {
      maxCount = count
      bestDelimiter = delimiter
    }
  }
  
  return bestDelimiter
}

// 获取操作按钮文本
const getActionButtonText = () => {
  switch (mode.value) {
    case 'format':
      return '格式化'
    case 'compress':
      return '压缩'
    case 'csv2json':
      return 'CSV 转 JSON'
    case 'json2csv':
      return 'JSON 转 CSV'
    default:
      return '处理'
  }
}

// 获取操作提示文本
const getActionTooltip = () => {
  switch (mode.value) {
    case 'format':
      return '格式化'
    case 'compress':
      return '压缩'
    case 'csv2json':
      return 'CSV 转 JSON'
    case 'json2csv':
      return 'JSON 转 CSV'
    default:
      return '处理'
  }
}
</script>

<style lang="scss" scoped>
.csv-page {
  // 编辑器容器样式优化
  .editor-container {
    display: flex;
    align-items: stretch;
    flex: 1;
    height: calc(100vh - 220px);

    .editor-section {
      max-width: 48%;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .editor-actions {
      padding: 0 4px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .page-content {
    display: flex;
    height: calc(100vh - 160px);
  }
}

.monaco-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  flex: 1;
}

.editor-area {
  flex: 1;
  display: flex;
  max-height: calc(100% - 72px); /* 为底部留出空间 */
}

.editor-header,
.editor-footer {
  flex-shrink: 0;
  min-height: 30px; /* 确保底部高度固定 */
}
</style> 