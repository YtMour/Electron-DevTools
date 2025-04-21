<template>
  <div class="format-page markdown-page">
    <div class="page-header">
      <div class="header-title">
        <h2>Markdown 转换</h2>
        <p class="header-desc">支持 Markdown 格式转换、预览、导出 HTML 和 PDF</p>
      </div>
      <div class="header-controls">
        <div class="mode-controls">
          <el-radio-group v-model="mode" size="default">
            <el-radio-button label="md2html">
              <el-icon class="mode-icon"><Document /></el-icon>
              转 HTML
            </el-radio-button>
            <el-radio-button label="preview">
              <el-icon class="mode-icon"><View /></el-icon>
              预览
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
              <span>输入 Markdown</span>
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
              <el-tooltip content="加载示例" placement="top">
                <el-button type="info" plain size="small" class="example-btn" @click="handleLoadExample">
                  <el-icon><Memo /></el-icon>
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
                language="markdown"
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

        <div class="editor-section output-section" v-if="mode === 'md2html'">
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><View /></el-icon>
              <span>转换的 HTML</span>
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
              <el-tooltip content="下载 HTML" placement="top">
                <el-button type="primary" plain size="small" class="download-btn" @click="handleDownloadHtml" :disabled="!output">
                  <el-icon><Download /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="导出 PDF" placement="top">
                <el-button type="danger" plain size="small" class="pdf-btn" @click="handleExportPdf" :disabled="!output">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="editor-area output-area">
            <div class="monaco-wrapper">
              <MonacoEditor
                v-model:value="output"
                language="html"
                theme="vs-dark"
                :options="{ readOnly: true }"
              />
            </div>
          </div>
          <div class="editor-footer">
            <span>字符数：{{ output.length }}</span>
          </div>
        </div>

        <div class="editor-section preview-section" v-else>
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </span>
            <div class="editor-controls">
              <el-tooltip content="导出 PDF" placement="top">
                <el-button type="danger" plain size="small" class="pdf-btn" @click="handleExportPdf" :disabled="!input">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="editor-area preview-area">
            <div class="markdown-preview" v-html="output"></div>
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
          <el-form-item label="主题">
            <el-select v-model="options.theme" style="width: 100%">
              <el-option label="默认" value="default" />
              <el-option label="Github" value="github" />
            </el-select>
          </el-form-item>
          <el-divider />
          <el-form-item>
            <el-checkbox v-model="options.livePreview">实时预览</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleProcess" :disabled="!input.trim()" style="width: 100%" class="convert-btn">
              <el-icon><Refresh /></el-icon>
              {{ mode === 'md2html' ? '转换' : '预览' }}
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
              支持转换为HTML
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持导出PDF
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持实时预览
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
  Setting, InfoFilled, Check, Refresh, Document, Printer, Memo
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
// @ts-ignore - MonacoEditor组件导入
import MonacoEditor from '@/components/MonacoEditor.vue'
import { markdown2html, markdown2pdf, markdownExample, isValidMarkdown } from '@/utils/markdown'

const { copy } = useClipboard()
const mode = ref<'md2html' | 'preview'>('md2html')
const input = ref('')
const output = ref('')
const isDragOver = ref(false)

const options = reactive({
  theme: 'default',
  livePreview: true,
})

// 初始化示例数据
onMounted(() => {
  input.value = markdownExample
  handleProcess()
})

// 处理输入变化
const handleInput = () => {
  if (options.livePreview) {
    handleProcess()
  }
}

// 处理格式转换
const handleProcess = () => {
  if (!input.value.trim()) {
    output.value = ''
    return
  }

  try {
    // 验证输入是否是有效的Markdown
    if (!isValidMarkdown(input.value)) {
      ElMessage.error('无效的Markdown格式')
      return
    }

    // 转换Markdown为HTML
    const html = markdown2html(input.value)
    
    output.value = html
  } catch (error) {
    console.error('处理错误:', error)
    ElMessage.error('转换失败')
  }
}

// 处理文件上传
const handleFileChange = async (uploadFile: UploadFile) => {
  try {
    const file = uploadFile.raw as File
    if (!file) {
      ElMessage.error('文件处理失败')
      return
    }

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.markdown')) {
      ElMessage.warning('请上传Markdown文件 (.md, .markdown)')
      return
    }

    // 读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target) {
        input.value = e.target.result as string
        handleProcess()
      }
    }
    reader.onerror = () => {
      ElMessage.error('文件读取失败')
    }
    reader.readAsText(file)
  } catch (error) {
    console.error('文件处理错误:', error)
    ElMessage.error('文件处理失败')
  }
}

// 处理拖放相关事件
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
  
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0]
    
    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.markdown')) {
      ElMessage.warning('请上传Markdown文件 (.md, .markdown)')
      return
    }
    
    // 读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target) {
        input.value = e.target.result as string
        handleProcess()
      }
    }
    reader.onerror = () => {
      ElMessage.error('文件读取失败')
    }
    reader.readAsText(file)
  }
}

// 清空输入
const handleClearInput = () => {
  input.value = ''
  if (options.livePreview) {
    output.value = ''
  }
}

// 清空输出
const handleClearOutput = () => {
  output.value = ''
}

// 从剪贴板粘贴
const handlePasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText()
    input.value = text
    handleProcess()
  } catch (error) {
    console.error('粘贴错误:', error)
    ElMessage.error('从剪贴板粘贴失败')
  }
}

// 复制输出到剪贴板
const handleCopyOutput = () => {
  if (!output.value) return
  
  copy(output.value)
  ElMessage.success('已复制到剪贴板')
}

// 下载HTML文件
const handleDownloadHtml = () => {
  if (!output.value) return
  
  const blob = new Blob([output.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'markdown_output.html'
  a.click()
  
  URL.revokeObjectURL(url)
}

// 导出PDF
const handleExportPdf = async () => {
  if (!input.value) return
  
  try {
    ElMessage.info({
      message: 'PDF 生成中...',
      duration: 0,
      showClose: true,
      // @ts-ignore - Element Plus 类型定义可能不完整
      id: 'pdf-generation'
    })
    
    const blob = await markdown2pdf(input.value, 'Markdown Document')
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown_output.pdf'
    a.click()
    
    URL.revokeObjectURL(url)
    
    ElMessage.closeAll()
    ElMessage.success('PDF 已生成')
  } catch (error) {
    console.error('PDF导出错误:', error)
    ElMessage.closeAll()
    ElMessage.error('PDF 生成失败')
  }
}

// 加载示例数据
const handleLoadExample = () => {
  input.value = markdownExample
  handleProcess()
}

// 当模式更改时自动处理
watch(mode, () => {
  handleProcess()
})
</script>

<style scoped>
/* 已经全局导入了format-page.scss，无需重复导入 */

.markdown-page .preview-area {
  overflow: auto;
}

.markdown-preview {
  padding: 20px;
  background-color: #f5f5f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  overflow-y: auto;
  height: 100%;
  max-height: 100%;
}

.markdown-preview::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.markdown-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.markdown-preview::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.markdown-preview::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Markdown 样式 */
.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-preview h1 {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-preview h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-preview h3 {
  font-size: 1.25em;
}

.markdown-preview h4 {
  font-size: 1em;
}

.markdown-preview h5 {
  font-size: 0.875em;
}

.markdown-preview h6 {
  font-size: 0.85em;
  color: #6a737d;
}

.markdown-preview p,
.markdown-preview blockquote,
.markdown-preview ul,
.markdown-preview ol,
.markdown-preview dl,
.markdown-preview table,
.markdown-preview pre {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-preview blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

.markdown-preview pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

.markdown-preview code {
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

.markdown-preview pre code {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: 0;
}

.markdown-preview table {
  display: block;
  width: 100%;
  overflow: auto;
  border-collapse: collapse;
}

.markdown-preview table th,
.markdown-preview table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-preview table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-preview table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-preview img {
  max-width: 100%;
  box-sizing: content-box;
}

.markdown-preview li + li {
  margin-top: 0.25em;
}

.markdown-preview ul, .markdown-preview ol {
  padding-left: 2em;
}

.markdown-preview hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
  
  .editor-section {
    width: 100%;
  }
  
  .editor-actions {
    flex-direction: row;
    margin: 15px 0;
  }
}
</style> 