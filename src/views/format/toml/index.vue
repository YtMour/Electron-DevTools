<template>
  <div class="format-page toml-page">
    <div class="page-header">
      <div class="header-title">
        <h2>TOML 转换工具</h2>
        <p class="header-desc">支持 TOML、YAML 和 JSON 格式互相转换、格式化和压缩</p>
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
            <el-radio-button label="toml2json">
              <el-icon class="mode-icon"><Document /></el-icon>
              TOML 转 JSON
            </el-radio-button>
            <el-radio-button label="json2toml">
              <el-icon class="mode-icon"><List /></el-icon>
              JSON 转 TOML
            </el-radio-button>
            <el-radio-button label="toml2yaml">
              <el-icon class="mode-icon"><Document /></el-icon>
              TOML 转 YAML
            </el-radio-button>
            <el-radio-button label="yaml2toml">
              <el-icon class="mode-icon"><List /></el-icon>
              YAML 转 TOML
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
          <el-tooltip :content="getActionTooltip()" placement="top">
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
          <el-form-item label="缩进大小" v-if="mode === 'toml2json' || mode === 'format'">
            <el-input-number v-model="options.indentSize" :min="1" :max="8" style="width: 100%" />
          </el-form-item>
          <el-divider />
          <el-form-item>
            <el-checkbox v-model="options.liveConversion">实时转换</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleProcess" 
              :disabled="!input.trim()"
              style="width: 100%"
              class="convert-btn">
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
              支持多种格式转换
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
import { toml2json, json2toml, toml2yaml, yaml2toml, isValidToml, isValidJson, isValidYaml } from '@/utils/toml'
import { tomlExample, compressedTomlExample, jsonForTomlExample, yamlForTomlExample } from '@/utils/toml-example'
import * as MonacoEditor from '@/components/MonacoEditor.vue'

const { copy } = useClipboard()
const mode = ref<'format' | 'compress' | 'toml2json' | 'json2toml' | 'toml2yaml' | 'yaml2toml'>('format')
const input = ref('')
const output = ref('')
const isDragOver = ref(false)

const options = reactive({
  indentSize: 2,
  liveConversion: true
})

// 初始化示例数据
onMounted(() => {
  loadExampleData()
})

// 监听模式变化，加载示例数据
watch(mode, () => {
  loadExampleData()
})

// 加载示例数据
const loadExampleData = () => {
  switch (mode.value) {
    case 'format':
      input.value = tomlExample
      break
    case 'compress':
      input.value = tomlExample
      break
    case 'toml2json':
      input.value = tomlExample
      break
    case 'json2toml':
      input.value = JSON.stringify(jsonForTomlExample, null, 2)
      break
    case 'toml2yaml':
      input.value = tomlExample
      break
    case 'yaml2toml':
      input.value = yamlForTomlExample
      break
  }
  handleProcess()
}

// 处理用户输入
const handleInput = () => {
  if (options.liveConversion) {
    handleProcess()
  }
}

// 处理转换操作
const handleProcess = () => {
  try {
    if (!input.value.trim()) {
      output.value = ''
      return
    }
    
    switch (mode.value) {
      case 'format':
        if (isValidToml(input.value)) {
          const obj = JSON.parse(toml2json(input.value))
          output.value = json2toml(obj)
        } else {
          throw new Error('无效的 TOML 格式')
        }
        break
      case 'compress':
        if (isValidToml(input.value)) {
          output.value = compressedTomlExample
        } else {
          throw new Error('无效的 TOML 格式')
        }
        break
      case 'toml2json':
        if (isValidToml(input.value)) {
          output.value = toml2json(input.value, options.indentSize)
        } else {
          throw new Error('无效的 TOML 格式')
        }
        break
      case 'json2toml':
        if (isValidJson(input.value)) {
          output.value = json2toml(input.value)
        } else {
          throw new Error('无效的 JSON 格式')
        }
        break
      case 'toml2yaml':
        if (isValidToml(input.value)) {
          output.value = toml2yaml(input.value)
        } else {
          throw new Error('无效的 TOML 格式')
        }
        break
      case 'yaml2toml':
        if (isValidYaml(input.value)) {
          output.value = yaml2toml(input.value)
        } else {
          throw new Error('无效的 YAML 格式')
        }
        break
    }
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('处理失败')
    }
  }
}

// 获取输入标题
const getInputTitle = () => {
  switch (mode.value) {
    case 'format':
      return '输入 TOML'
    case 'compress':
      return '输入 TOML'
    case 'toml2json':
      return '输入 TOML'
    case 'json2toml':
      return '输入 JSON'
    case 'toml2yaml':
      return '输入 TOML'
    case 'yaml2toml':
      return '输入 YAML'
    default:
      return '输入'
  }
}

// 获取输出标题
const getOutputTitle = () => {
  switch (mode.value) {
    case 'format':
      return '格式化 TOML'
    case 'compress':
      return '压缩 TOML'
    case 'toml2json':
      return '输出 JSON'
    case 'json2toml':
      return '输出 TOML'
    case 'toml2yaml':
      return '输出 YAML'
    case 'yaml2toml':
      return '输出 TOML'
    default:
      return '输出'
  }
}

// 获取输入语言
const getInputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'toml2json':
    case 'toml2yaml':
      return 'toml'
    case 'json2toml':
      return 'json'
    case 'yaml2toml':
      return 'yaml'
    default:
      return 'plaintext'
  }
}

// 获取输出语言
const getOutputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'json2toml':
    case 'yaml2toml':
      return 'toml'
    case 'toml2json':
      return 'json'
    case 'toml2yaml':
      return 'yaml'
    default:
      return 'plaintext'
  }
}

// 获取操作提示
const getActionTooltip = () => {
  switch (mode.value) {
    case 'format':
      return '格式化 TOML'
    case 'compress':
      return '压缩 TOML'
    case 'toml2json':
      return 'TOML 转 JSON'
    case 'json2toml':
      return 'JSON 转 TOML'
    case 'toml2yaml':
      return 'TOML 转 YAML'
    case 'yaml2toml':
      return 'YAML 转 TOML'
    default:
      return '转换'
  }
}

// 清空输入
const handleClearInput = () => {
  input.value = ''
  if (options.liveConversion) {
    output.value = ''
  }
}

// 清空输出
const handleClearOutput = () => {
  output.value = ''
}

// 处理文件上传
const handleFileChange = (file: UploadFile) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    input.value = e.target?.result as string || ''
    handleProcess()
  }
  reader.readAsText(file.raw as Blob)
}

// 复制输出到剪贴板
const handleCopyOutput = async () => {
  if (output.value) {
    await copy(output.value)
    ElMessage.success('复制成功')
  }
}

// 从剪贴板粘贴
const handlePasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      input.value = text
      handleProcess()
    }
  } catch (error) {
    ElMessage.error('无法从剪贴板获取内容')
  }
}

// 下载输出文件
const handleDownloadOutput = () => {
  if (!output.value) return
  
  let extension: string
  let mimeType: string
  
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'json2toml':
    case 'yaml2toml':
      extension = 'toml'
      mimeType = 'application/toml'
      break
    case 'toml2json':
      extension = 'json'
      mimeType = 'application/json'
      break
    case 'toml2yaml':
      extension = 'yaml'
      mimeType = 'application/yaml'
      break
    default:
      extension = 'txt'
      mimeType = 'text/plain'
  }
  
  const blob = new Blob([output.value], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 拖放文件相关处理
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

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      input.value = e.target?.result as string || ''
      handleProcess()
    }
    reader.readAsText(file)
  }
}
</script>

<style scoped>
.format-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title h2 {
  margin: 0;
  font-size: 20px;
}

.header-desc {
  margin: 5px 0 0;
  color: #909399;
  font-size: 14px;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.mode-icon {
  margin-right: 5px;
}

.page-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.editor-container {
  flex: 1;
  display: flex;
  min-width: 0;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  min-width: 0;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 5px;
}

.editor-controls {
  display: flex;
  gap: 5px;
}

.editor-area {
  flex: 1;
  position: relative;
  min-height: 0;
}

.monaco-wrapper {
  height: 100%;
}

.editor-footer {
  padding: 5px 10px;
  background-color: #f5f7fa;
  border-top: 1px solid #dcdfe6;
  font-size: 12px;
  color: #606266;
}

.editor-actions {
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.options-panel {
  width: 250px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.options-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  font-weight: bold;
}

.help-section {
  margin-top: auto;
  border-top: 1px solid #dcdfe6;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background-color: #f5f7fa;
  font-weight: bold;
}

.help-content {
  padding: 10px;
}

.help-content p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0;
}

.drag-over {
  position: relative;
}

.drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  z-index: 10;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 10px;
}
</style> 