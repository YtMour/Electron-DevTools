<template>
  <div class="format-page yaml-page">
    <div class="page-header">
      <div class="header-title">
        <h2>YAML/JSON 转换</h2>
        <p class="header-desc">支持 YAML 和 JSON 格式互相转换、格式化和压缩</p>
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
            <el-radio-button label="yaml2json">
              <el-icon class="mode-icon"><Document /></el-icon>
              YAML 转 JSON
            </el-radio-button>
            <el-radio-button label="json2yaml">
              <el-icon class="mode-icon"><List /></el-icon>
              JSON 转 YAML
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
          <el-form-item label="缩进大小" v-if="mode === 'yaml2json'">
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
              支持双向转换
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
import { yaml2json, json2yaml, isValidYaml, isValidJson } from '@/utils/yaml'
import { yamlExample, compressedYamlExample, jsonForYamlExample } from '@/utils/yaml-example'
import MonacoEditor from '@/components/MonacoEditor.vue'

const { copy } = useClipboard()
const mode = ref<'format' | 'compress' | 'yaml2json' | 'json2yaml'>('format')
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
      input.value = yamlExample
      break
    case 'compress':
      input.value = yamlExample
      break
    case 'yaml2json':
      input.value = yamlExample
      break
    case 'json2yaml':
      input.value = JSON.stringify(jsonForYamlExample, null, 2)
      break
  }
  handleProcess()
}

// 获取输入标题
const getInputTitle = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'yaml2json':
      return '输入 YAML'
    case 'json2yaml':
      return '输入 JSON'
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
    case 'yaml2json':
      return '输出 JSON'
    case 'json2yaml':
      return '输出 YAML'
    default:
      return '输出结果'
  }
}

// 获取输入占位符
const getInputPlaceholder = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'yaml2json':
      return '请输入要处理的 YAML 文本，或拖放文件到此处'
    case 'json2yaml':
      return '请输入要处理的 JSON 文本，或拖放文件到此处'
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
    case 'yaml2json':
      return 'JSON 结果将显示在这里'
    case 'json2yaml':
      return 'YAML 结果将显示在这里'
    default:
      return '处理结果将显示在这里'
  }
}

// 获取输入语言
const getInputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'yaml2json':
      return 'yaml'
    case 'json2yaml':
      return 'json'
    default:
      return 'yaml'
  }
}

// 获取输出语言
const getOutputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
      return 'yaml'
    case 'yaml2json':
      return 'json'
    case 'json2yaml':
      return 'yaml'
    default:
      return 'yaml'
  }
}

// 获取操作按钮文本
const getActionButtonText = () => {
  switch (mode.value) {
    case 'format':
      return '格式化'
    case 'compress':
      return '压缩'
    case 'yaml2json':
      return 'YAML 转 JSON'
    case 'json2yaml':
      return 'JSON 转 YAML'
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
    case 'yaml2json':
      return 'YAML 转 JSON'
    case 'json2yaml':
      return 'JSON 转 YAML'
    default:
      return '处理'
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
        // 格式化 YAML
        if (!isValidYaml(input.value)) {
          ElMessage.error('无效的 YAML 格式')
          return
        }
        // 先转为 JSON 再转回 YAML 以实现格式化
        const jsonData = yaml2json(input.value, 0)
        output.value = json2yaml(jsonData, true, options.indentSize)
        break
        
      case 'compress':
        // 压缩 YAML
        if (!isValidYaml(input.value)) {
          ElMessage.error('无效的 YAML 格式')
          return
        }
        // 先转为 JSON 再转回 YAML 以实现压缩
        const compressedJson = yaml2json(input.value, 0)
        output.value = json2yaml(compressedJson, false)
        break
        
      case 'yaml2json':
        if (!isValidYaml(input.value)) {
          ElMessage.error('无效的 YAML 格式')
          return
        }
        output.value = yaml2json(input.value, options.indentSize)
        break
        
      case 'json2yaml':
        if (!isValidJson(input.value)) {
          ElMessage.error('无效的 JSON 格式')
          return
        }
        output.value = json2yaml(input.value, true, options.indentSize)
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

// 处理拖放
const handleDrop = (e: DragEvent) => {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        input.value = e.target.result as string
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
  a.download = mode.value === 'yaml2json' ? 'output.json' : 'output.yaml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success(`已下载为 ${mode.value === 'yaml2json' ? 'output.json' : 'output.yaml'}`)
}
</script>

<style lang="scss" scoped>
.yaml-page {
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
  min-height: 400px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  flex: 1;
}

.editor-area {
  flex: 1;
  display: flex;
  height: 100%;
}

.editor-header,
.editor-footer {
  flex-shrink: 0;
}
</style> 