<template>
  <div class="format-page xml-page">
    <div class="page-header">
      <div class="header-title">
        <h2>XML/JSON 转换</h2>
        <p class="header-desc">支持 XML 和 JSON 格式互相转换、格式化和压缩</p>
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
            <el-radio-button label="xml2json">
              <el-icon class="mode-icon"><Document /></el-icon>
              XML 转 JSON
            </el-radio-button>
            <el-radio-button label="json2xml">
              <el-icon class="mode-icon"><List /></el-icon>
              JSON 转 XML
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
                <el-button type="success" plain size="small" class="copy-btn" @click="handleCopy" :disabled="!output">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="下载文件" placement="top">
                <el-button type="primary" plain size="small" class="download-btn" @click="handleDownload" :disabled="!output">
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
          <span>处理选项</span>
        </div>
        <el-form :model="options" label-position="top" size="default">
          <el-form-item label="缩进空格数" v-if="mode !== 'compress'">
            <el-input-number
              v-model="options.indentSize"
              :min="0"
              :max="8"
              :step="2"
              style="width: 100%"
            />
          </el-form-item>
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
              {{ getActionButtonText() }}
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
              支持格式化与压缩
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持XML与JSON互转
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
  Setting, InfoFilled, Check, Refresh, Menu, Fold, Document, List
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { parseXml, serializeXml, xml2json, json2xml, isValidXml, isValidJson } from '@/utils/xml'
import { xmlExample, compressedXmlExample, jsonForXmlExample } from '@/utils/xml-example'
import MonacoEditor from '@/components/MonacoEditor.vue'

const { copy } = useClipboard()
const mode = ref<'format' | 'compress' | 'xml2json' | 'json2xml'>('format')
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

// 监听模式变化，清空输入输出并加载示例数据
watch(mode, () => {
  loadExampleData()
})

// 加载示例数据
const loadExampleData = () => {
  switch (mode.value) {
    case 'format':
      input.value = xmlExample
      break
    case 'compress':
      input.value = xmlExample
      break
    case 'xml2json':
      input.value = xmlExample
      break
    case 'json2xml':
      input.value = JSON.stringify(jsonForXmlExample, null, 2)
      break
  }
  handleProcess()
}

// 获取输入标题
const getInputTitle = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'xml2json':
      return '输入 XML'
    case 'json2xml':
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
    case 'xml2json':
      return '输出 JSON'
    case 'json2xml':
      return '输出 XML'
    default:
      return '输出结果'
  }
}

// 获取输入占位符
const getInputPlaceholder = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'xml2json':
      return '请输入要处理的 XML 文本，或拖放文件到此处'
    case 'json2xml':
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
    case 'xml2json':
      return 'JSON 结果将显示在这里'
    case 'json2xml':
      return 'XML 结果将显示在这里'
    default:
      return '处理结果将显示在这里'
  }
}

// 获取操作按钮文本
const getActionButtonText = () => {
  switch (mode.value) {
    case 'format':
      return '格式化'
    case 'compress':
      return '压缩'
    case 'xml2json':
      return 'XML 转 JSON'
    case 'json2xml':
      return 'JSON 转 XML'
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
    case 'xml2json':
      return 'XML 转 JSON'
    case 'json2xml':
      return 'JSON 转 XML'
    default:
      return '处理'
  }
}

// 处理输入变化
const handleInput = () => {
  if (options.liveConversion && input.value) {
    handleProcess()
  } else if (!input.value) {
    output.value = ''
  }
}

// 处理格式化/压缩/转换
const handleProcess = () => {
  if (!input.value) {
    ElMessage.warning('请输入要处理的文本')
    return
  }

  try {
    switch (mode.value) {
      case 'format':
      case 'compress':
        // 先尝试解析 XML
        if (!isValidXml(input.value)) {
          ElMessage.error('XML 格式错误，请检查输入')
          return
        }
        const doc = parseXml(input.value)
        
        // 格式化或压缩
        output.value = serializeXml(doc, {
          indent: mode.value === 'format' ? ' '.repeat(options.indentSize) : '',
          newline: mode.value === 'format' ? '\n' : ''
        })
        break
        
      case 'xml2json':
        // XML 转 JSON
        if (!isValidXml(input.value)) {
          ElMessage.error('XML 格式错误，请检查输入')
          return
        }
        output.value = xml2json(input.value, options.indentSize)
        break
        
      case 'json2xml':
        // JSON 转 XML
        if (!isValidJson(input.value)) {
          ElMessage.error('JSON 格式错误，请检查输入')
          return
        }
        output.value = json2xml(input.value, {
          indent: ' '.repeat(options.indentSize),
          newline: '\n'
        })
        break
    }
  } catch (error) {
    ElMessage.error(`处理失败: ${(error as Error).message}`)
    output.value = ''
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
  const files = e.dataTransfer?.files
  if (files?.length) {
    const rawFile = files[0] as UploadRawFile
    rawFile.uid = Date.now()
    handleFileChange({ raw: rawFile } as UploadFile)
    ElMessage.success(`文件 "${files[0].name}" 已成功加载`)
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

// 粘贴输入
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

// 复制结果
const handleCopy = async () => {
  if (!output.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await copy(output.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载结果
const handleDownload = () => {
  if (!output.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }

  try {
    let mimeType = 'text/plain'
    let extension = 'txt'
    
    switch (mode.value) {
      case 'format':
      case 'compress':
      case 'json2xml':
        mimeType = 'application/xml'
        extension = 'xml'
        break
      case 'xml2json':
        mimeType = 'application/json'
        extension = 'json'
        break
    }
    
    const blob = new Blob([output.value], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output_${Date.now()}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success(`已下载为 output_${Date.now()}.${extension}`)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 获取输入语言
const getInputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
    case 'xml2json':
      return 'xml'
    case 'json2xml':
      return 'json'
    default:
      return 'xml'
  }
}

// 获取输出语言
const getOutputLanguage = () => {
  switch (mode.value) {
    case 'format':
    case 'compress':
      return 'xml'
    case 'xml2json':
      return 'json'
    case 'json2xml':
      return 'xml'
    default:
      return 'xml'
  }
}
</script>

<style lang="scss" scoped>
.xml-page {
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