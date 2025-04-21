<template>
  <div class="format-page toml-page">
    <div class="page-header">
      <div class="header-title">
        <h2>TOML 格式转换</h2>
        <p class="header-desc">支持 TOML、JSON 和 YAML 格式互相转换、格式化和压缩</p>
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
              <el-icon class="mode-icon"><Notebook /></el-icon>
              TOML 转 YAML
            </el-radio-button>
            <el-radio-button label="yaml2toml">
              <el-icon class="mode-icon"><Reading /></el-icon>
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
          <el-form-item label="缩进大小" v-if="['toml2json', 'toml2yaml'].includes(mode)">
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
              支持多种格式互转
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
  Setting, InfoFilled, Check, Refresh, Document, List, Menu, Fold,
  Notebook, Reading
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile } from 'element-plus'
import { 
  toml2json, json2toml, toml2yaml, yaml2toml, 
  isValidToml, isValidJson, isValidYaml,
  formatToml, compressToml
} from '@/utils/toml'
import { tomlExample, jsonForTomlExample, yamlForTomlExample } from '@/utils/toml-example'
// @ts-ignore - MonacoEditor组件导入
import MonacoEditor from '@/components/MonacoEditor.vue'

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
    case 'compress':
    case 'toml2json':
    case 'toml2yaml':
      input.value = tomlExample
      break
    case 'json2toml':
      input.value = JSON.stringify(jsonForTomlExample, null, 2)
      break
    case 'yaml2toml':
      input.value = yamlForTomlExample
      break
  }
  handleProcess()
}

// 获取输入标题
const getInputTitle = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'toml2json':
    case 'toml2yaml':
      return '输入 TOML'
    case 'json2toml':
      return '输入 JSON'
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
    case 'compress':
      return '输出结果'
    case 'toml2json':
      return '输出 JSON'
    case 'json2toml':
      return '输出 TOML'
    case 'toml2yaml':
      return '输出 YAML'
    case 'yaml2toml':
      return '输出 TOML'
    default:
      return '输出结果'
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
      return 'toml'
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
      return 'toml'
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
        // 格式化 TOML
        if (!isValidToml(input.value)) {
          ElMessage.error('无效的 TOML 格式')
          return
        }
        output.value = formatToml(input.value)
        break
        
      case 'compress':
        // 压缩 TOML
        if (!isValidToml(input.value)) {
          ElMessage.error('无效的 TOML 格式')
          return
        }
        output.value = compressToml(input.value)
        break
        
      case 'toml2json':
        if (!isValidToml(input.value)) {
          ElMessage.error('无效的 TOML 格式')
          return
        }
        output.value = toml2json(input.value, options.indentSize)
        break
        
      case 'json2toml':
        if (!isValidJson(input.value)) {
          ElMessage.error('无效的 JSON 格式')
          return
        }
        output.value = json2toml(input.value, true)
        break
        
      case 'toml2yaml':
        if (!isValidToml(input.value)) {
          ElMessage.error('无效的 TOML 格式')
          return
        }
        output.value = toml2yaml(input.value, true, options.indentSize)
        break
        
      case 'yaml2toml':
        if (!isValidYaml(input.value)) {
          ElMessage.error('无效的 YAML 格式')
          return
        }
        output.value = yaml2toml(input.value, true)
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
        handleProcess()
        ElMessage.success(`文件 "${file.name}" 已成功加载`)
      }
    }
    reader.readAsText(file)
  } catch (error) {
    ElMessage.error('文件处理失败')
  }
}

// 处理文件拖放
const handleDrop = async (e: DragEvent) => {
  isDragOver.value = false
  e.preventDefault()
  
  const files = e.dataTransfer?.files
  if (files?.length) {
    const file = files[0]
    
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          input.value = e.target.result as string
          handleProcess()
          ElMessage.success(`文件 "${file.name}" 已成功加载`)
        }
      }
      reader.readAsText(file)
    } catch (error) {
      ElMessage.error('文件处理失败')
    }
  }
}

// 处理拖拽进入
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

// 处理拖拽悬停
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

// 处理拖拽离开
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

// 清空输入
const handleClearInput = () => {
  input.value = ''
  output.value = ''
}

// 清空输出
const handleClearOutput = () => {
  output.value = ''
}

// 从剪贴板粘贴到输入
const handlePasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText()
    input.value = text
    handleProcess()
    ElMessage.success('已从剪贴板粘贴内容')
  } catch (error) {
    ElMessage.error('无法读取剪贴板内容')
  }
}

// 复制输出到剪贴板
const handleCopyOutput = () => {
  if (!output.value) return
  
  copy(output.value)
  ElMessage.success('已复制到剪贴板')
}

// 下载输出内容
const handleDownloadOutput = () => {
  if (!output.value) return
  
  const blob = new Blob([output.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const extension = getOutputFileExtension()
  const link = document.createElement('a')
  link.href = url
  link.download = `converted.${extension}`
  link.click()
  
  URL.revokeObjectURL(url)
  ElMessage.success('文件下载已开始')
}

// 获取输出文件扩展名
const getOutputFileExtension = () => {
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
      return 'txt'
  }
}
</script>

<style lang="scss" scoped>
.toml-page {
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