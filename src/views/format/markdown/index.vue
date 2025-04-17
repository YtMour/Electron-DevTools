<template>
  <div class="format-page markdown-page">
    <div class="page-header">
      <div class="header-title">
        <h2>Markdown 转换</h2>
        <p class="header-desc">支持 Markdown 转 HTML、格式化及 PDF 导出</p>
      </div>
      <div class="header-controls">
        <div class="mode-controls">
          <el-radio-group v-model="mode" size="default">
            <el-radio-button label="md2html">
              <el-icon class="mode-icon"><Document /></el-icon>
              Markdown 转 HTML
            </el-radio-button>
            <el-radio-button label="preview">
              <el-icon class="mode-icon"><View /></el-icon>
              实时预览
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="operation-controls">
          <el-tooltip content="主题切换" placement="top">
            <el-button type="default" size="small" plain class="theme-btn" @click="toggleTheme">
              <el-icon v-if="isDarkMode"><Moon /></el-icon>
              <el-icon v-else><Sunny /></el-icon>
            </el-button>
          </el-tooltip>
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
    </div>

    <div class="main-content" v-if="mode === 'md2html'">
      <div class="editors-container">
        <div class="editor-section input-section">
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><Edit /></el-icon>
              <span>Markdown</span>
            </span>
            <div class="editor-controls">
              <el-tooltip content="清空" placement="top">
                <el-button type="info" plain size="small" class="delete-btn" @click="handleClearInput">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="粘贴" placement="top">
                <el-button type="warning" plain size="small" class="paste-btn" @click="handlePasteInput">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="加载示例" placement="top">
                <el-button type="success" plain size="small" class="example-btn" @click="loadExample">
                  <el-icon><DataBoard /></el-icon>
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

        <div class="editor-section output-section">
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><View /></el-icon>
              <span>HTML</span>
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
              <el-tooltip content="导出为PDF" placement="top">
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
      </div>

      <div class="options-panel">
        <div class="options-header">
          <el-icon><Setting /></el-icon>
          <span>转换选项</span>
        </div>
        <el-form :model="options" label-position="top" size="default">
          <el-form-item>
            <el-checkbox v-model="options.autoReplace">自动替换特殊字符</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="options.liveConversion">实时转换</el-checkbox>
          </el-form-item>
          <el-divider />
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
              支持常见Markdown语法
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持导出HTML和PDF
            </p>
            <p>
              <el-icon><Check /></el-icon>
              支持实时预览
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content" v-if="mode === 'preview'">
      <div class="preview-container">
        <div class="editor-section input-section">
          <div class="editor-header">
            <span class="editor-title">
              <el-icon><Edit /></el-icon>
              <span>Markdown</span>
            </span>
            <div class="editor-controls">
              <el-tooltip content="清空" placement="top">
                <el-button type="info" plain size="small" class="delete-btn" @click="handleClearInput">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="粘贴" placement="top">
                <el-button type="warning" plain size="small" class="paste-btn" @click="handlePasteInput">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="加载示例" placement="top">
                <el-button type="success" plain size="small" class="example-btn" @click="loadExample">
                  <el-icon><DataBoard /></el-icon>
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

        <div class="preview-section">
          <div class="preview-header">
            <span class="preview-title">
              <el-icon><View /></el-icon>
              <span>预览</span>
            </span>
            <div class="preview-controls">
              <el-tooltip content="打印当前页面" placement="top">
                <el-button type="info" plain size="small" class="print-btn" @click="handlePrint" :disabled="!input">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="导出为PDF" placement="top">
                <el-button type="danger" plain size="small" class="pdf-btn" @click="handleExportPdf" :disabled="!input">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="全屏预览" placement="top">
                <el-button type="primary" plain size="small" class="fullscreen-btn" @click="toggleFullscreen">
                  <el-icon><FullScreen /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="preview-area" ref="previewArea" :class="{ 'fullscreen': isFullscreen }">
            <div class="preview-content" v-html="previewHtml"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Edit, 
  View, 
  Delete, 
  Upload, 
  Download, 
  DocumentCopy, 
  Right, 
  DataBoard, 
  Refresh, 
  InfoFilled, 
  Check, 
  Setting,
  Document,
  Printer,
  FullScreen,
  Moon,
  Sunny
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
const isFullscreen = ref(false)
const previewArea = ref<HTMLElement | null>(null)
const isDarkMode = ref(false)

const options = reactive({
  autoReplace: true,
  liveConversion: true
})

// 实时预览HTML
const previewHtml = computed(() => {
  if (!input.value) return ''
  try {
    return markdown2html(input.value)
  } catch (error) {
    return '<div class="error">预览错误，请检查Markdown语法</div>'
  }
})

// 切换暗色/亮色主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value)
  ElMessage.success(`已切换到${isDarkMode.value ? '暗色' : '亮色'}主题`)
}

// 打印当前页面
const handlePrint = () => {
  if (!previewHtml.value) {
    ElMessage.warning('没有可打印的内容')
    return
  }
  
  // 创建打印窗口
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器设置')
    return
  }
  
  // 添加样式和内容 - 使用字符串拼接避免模板字符串解析问题
  const htmlContent = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <title>Markdown 打印预览</title>',
    '  <style>',
    '    body {',
    '      font-family: Arial, sans-serif;',
    '      line-height: 1.6;',
    '      color: #333;',
    '      max-width: 800px;',
    '      margin: 0 auto;',
    '      padding: 20px;',
    '    }',
    '    h1, h2, h3, h4, h5, h6 {',
    '      margin-top: 24px;',
    '      margin-bottom: 16px;',
    '      font-weight: 600;',
    '      line-height: 1.25;',
    '    }',
    '    h1 {',
    '      font-size: 2em;',
    '      border-bottom: 1px solid #eee;',
    '      padding-bottom: 0.3em;',
    '    }',
    '    h2 {',
    '      font-size: 1.5em;',
    '      border-bottom: 1px solid #eee;',
    '      padding-bottom: 0.3em;',
    '    }',
    '    pre {',
    '      background-color: #f6f8fa;',
    '      border-radius: 6px;',
    '      padding: 16px;',
    '      overflow: auto;',
    '    }',
    '    code {',
    '      font-family: Consolas, Monaco, monospace;',
    '      background-color: #f6f8fa;',
    '      padding: 0.2em 0.4em;',
    '      border-radius: 3px;',
    '    }',
    '    blockquote {',
    '      padding: 0 1em;',
    '      color: #6a737d;',
    '      border-left: 0.25em solid #dfe2e5;',
    '      margin: 0 0 16px 0;',
    '    }',
    '    table {',
    '      border-collapse: collapse;',
    '      width: 100%;',
    '      margin: 16px 0;',
    '    }',
    '    table, th, td {',
    '      border: 1px solid #dfe2e5;',
    '    }',
    '    th, td {',
    '      padding: 8px 12px;',
    '    }',
    '    th {',
    '      background-color: #f6f8fa;',
    '    }',
    '    img {',
    '      max-width: 100%;',
    '    }',
    '    @media print {',
    '      pre {',
    '        white-space: pre-wrap;',
    '      }',
    '    }',
    '  </style>',
    '</head>',
    '<body>',
    previewHtml.value,
    '  <script>window.onload = function() { window.print(); }<\/script>',
    '</body>',
    '</html>'
  ].join('\n');
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
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
  if (options.liveConversion && mode.value === 'md2html') {
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
  
  const blob = new Blob([output.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `markdown-converted-${new Date().getTime()}.html`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('HTML 文件已下载')
}

// 处理转换
const handleProcess = () => {
  if (!input.value.trim()) {
    ElMessage.warning('请先输入Markdown内容')
    return
  }
  
  try {
    // 验证 Markdown 是否有效
    if (!isValidMarkdown(input.value)) {
      ElMessage.error('无效的 Markdown 格式')
      return
    }
    
    // 转换为 HTML
    output.value = markdown2html(input.value)
    ElMessage.success('转换成功')
  } catch (error) {
    ElMessage.error('转换失败，请检查输入')
    console.error('转换错误:', error)
  }
}

// 处理输入变化
const handleInput = () => {
  if (options.liveConversion && mode.value === 'md2html') {
    handleProcess()
  }
}

// 处理 PDF 导出
const handleExportPdf = async () => {
  if (!input.value.trim()) {
    ElMessage.warning('请先输入Markdown内容')
    return
  }
  
  try {
    ElMessage.info({
      message: '正在生成PDF...',
      duration: 0,
      showClose: true
    })
    
    const pdfBlob = await markdown2pdf(input.value, '导出文档')
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `markdown-${new Date().getTime()}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    
    ElMessage.closeAll()
    ElMessage.success('PDF已导出')
  } catch (error) {
    ElMessage.closeAll()
    ElMessage.error('PDF导出失败')
    console.error('PDF导出错误:', error)
  }
}

// 加载示例
const loadExample = () => {
  input.value = markdownExample
  handleProcess()
  ElMessage.success('已加载示例数据')
}

// 全屏预览切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value && previewArea.value) {
    if (previewArea.value.requestFullscreen) {
      previewArea.value.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// 检查系统主题偏好
onMounted(() => {
  // 检测系统颜色模式
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode.value = prefersDarkMode
  document.documentElement.classList.toggle('dark-mode', prefersDarkMode)
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkMode.value = e.matches
    document.documentElement.classList.toggle('dark-mode', e.matches)
  })
  
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // 其他初始化代码
  loadExample()
})

// 监听模式变化
watch(mode, () => {
  // 切换到预览模式时不需要额外处理，因为使用了计算属性
})
</script>

<style lang="scss" scoped>
/* 已经全局导入了format-page.scss，无需重复导入 */

.markdown-page {
  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    gap: 16px;
    
    @media (max-width: 1024px) {
      flex-direction: column;
    }
  }
  
  .editors-container {
    display: flex;
    flex: 1;
    gap: 16px;
    min-width: 0;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  
  .header-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    
    .operation-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .theme-btn {
      border-radius: 50%;
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      
      &:hover {
        transform: rotate(30deg);
      }
    }
  }
  
  .editor-section {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &.input-section {
      border-left: 4px solid var(--el-color-primary);
    }
    
    &.output-section {
      border-left: 4px solid var(--el-color-success);
    }
  }
  
  .monaco-wrapper {
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 300px;
    
    :deep(.monaco-editor) {
      border-radius: 0 0 4px 4px;
      overflow: hidden;
    }
  }
  
  .preview-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    height: 100%;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .preview-section {
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    .preview-header {
      padding: 8px 12px;
      background-color: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .preview-title {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 500;
      }
      
      .preview-controls {
        display: flex;
        gap: 8px;
      }
    }
    
    .preview-area {
      flex: 1;
      overflow: auto;
      padding: 24px;
      background-color: var(--el-bg-color);
      color: var(--el-text-color-primary);
      line-height: 1.6;
      
      &.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        padding: 32px;
        background-color: var(--el-bg-color);
      }
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color-lighter);
        border-radius: 3px;
        
        &:hover {
          background-color: var(--el-border-color);
        }
      }
      
      .preview-content {
        max-width: 900px;
        margin: 0 auto;
        
        // Markdown样式优化
        h1, h2, h3, h4, h5, h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
          color: var(--el-text-color-primary);
        }
        
        h1 {
          font-size: 2em;
          border-bottom: 1px solid var(--el-border-color-light);
          padding-bottom: 0.3em;
        }
        
        h2 {
          font-size: 1.5em;
          border-bottom: 1px solid var(--el-border-color-light);
          padding-bottom: 0.3em;
        }
        
        h3 {
          font-size: 1.25em;
        }
        
        p {
          margin-top: 0;
          margin-bottom: 16px;
          line-height: 1.7;
        }
        
        ul, ol {
          padding-left: 2em;
          margin-top: 0;
          margin-bottom: 16px;
        }
        
        li + li {
          margin-top: 0.25em;
        }
        
        blockquote {
          padding: 0 1em;
          color: var(--el-text-color-secondary);
          border-left: 0.25em solid var(--el-border-color);
          margin: 0 0 16px 0;
        }
        
        pre {
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: var(--el-fill-color-light);
          border-radius: 6px;
          margin-top: 0;
          margin-bottom: 16px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        
        code {
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          background-color: var(--el-fill-color-light);
          border-radius: 3px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }
        
        pre code {
          padding: 0;
          background-color: transparent;
          border-radius: 0;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
          display: block;
          overflow-x: auto;
          
          th, td {
            border: 1px solid var(--el-border-color);
            padding: 8px 12px;
          }
          
          th {
            background-color: var(--el-fill-color-light);
            font-weight: 600;
          }
          
          tr:nth-child(even) {
            background-color: var(--el-fill-color-lighter);
          }
        }
        
        img {
          max-width: 100%;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        hr {
          height: 0.25em;
          padding: 0;
          margin: 24px 0;
          background-color: var(--el-border-color-light);
          border: 0;
        }
        
        a {
          color: var(--el-color-primary);
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
        
        // 任务列表样式
        ul.contains-task-list {
          list-style-type: none;
          padding-left: 0;
          
          li {
            display: flex;
            align-items: flex-start;
            padding: 3px 0;
            
            input[type=checkbox] {
              margin: 0 8px 0 0;
              transform: scale(1.2);
            }
          }
        }
      }
    }
  }
  
  .options-panel {
    border-radius: 8px;
    overflow: hidden;
    min-width: 180px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    @media (max-width: 1024px) {
      flex: 0 0 auto;
    }
    
    .options-header, .help-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: var(--el-fill-color-light);
      font-weight: 600;
      font-size: 14px;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
    }
    
    .help-section {
      margin-top: 16px;
      border-top: 1px solid var(--el-border-color-light);
      
      .help-content {
        padding: 12px;
        
        p {
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        }
      }
    }
  }
  
  // 编辑器动作样式优化
  .editor-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 8px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 8px;
    
    @media (max-width: 768px) {
      flex-direction: row;
      padding: 8px 16px;
    }
    
    .convert-btn {
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  // 拖放区域样式
  .editor-area.drag-over {
    border: 2px dashed var(--el-color-primary);
    background-color: rgba(var(--el-color-primary-rgb), 0.05);
  }
  
  .drop-overlay {
    background-color: rgba(var(--el-color-primary-rgb), 0.1);
    backdrop-filter: blur(2px);
    
    .drop-icon {
      animation: bounce 1s infinite alternate;
    }
    
    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-10px); }
    }
  }
}

// 打印样式
@media print {
  .preview-area {
    padding: 0 !important;
    
    pre {
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
    }
  }
}
</style> 