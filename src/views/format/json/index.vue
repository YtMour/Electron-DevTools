<template>
  <div class="json-page">
    <div class="page-header">
      <div class="header-title">
        <h2>JSON 格式化</h2>
        <p class="header-desc">支持 JSON 格式化、压缩、校验和转换</p>
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
              <el-button type="primary" size="default">
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
              输入 JSON
            </span>
            <div class="editor-controls">
              <el-tooltip content="清空" placement="top">
                <el-button type="info" plain size="small" @click="handleClearInput">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="从剪贴板粘贴" placement="top">
                <el-button type="info" plain size="small" @click="handlePasteInput">
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
            <el-input
              v-model="input"
              type="textarea"
              :rows="15"
              :placeholder="'请输入要处理的 JSON 文本，或拖放文件到此处'"
              @input="handleInput"
              resize="none"
              class="custom-textarea"
            />
          </div>
          <div class="editor-footer">
            <span>字符数：{{ input.length }}</span>
          </div>
        </div>

        <div class="editor-actions">
          <el-tooltip :content="mode === 'format' ? '格式化' : '压缩'" placement="top">
            <el-button 
              type="primary" 
              size="large" 
              circle 
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
              输出结果
            </span>
            <div class="editor-controls">
              <el-tooltip content="清空" placement="top">
                <el-button type="info" plain size="small" @click="handleClearOutput">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="复制到剪贴板" placement="top">
                <el-button type="success" plain size="small" @click="handleCopy" :disabled="!output">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="下载文件" placement="top">
                <el-button type="primary" plain size="small" @click="handleDownload" :disabled="!output">
                  <el-icon><Download /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          <div class="editor-area">
            <el-input
              v-model="output"
              type="textarea"
              :rows="15"
              readonly
              resize="none"
              :placeholder="'处理结果将显示在这里'"
              class="custom-textarea output-textarea"
            />
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
          <el-form-item label="缩进空格数">
            <el-input-number
              v-model="options.indentSize"
              :min="0"
              :max="8"
              :step="2"
              :disabled="mode === 'compress'"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="options.sortKeys">排序键</el-checkbox>
          </el-form-item>
          <el-divider />
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleProcess" 
              :disabled="!input.trim()"
              style="width: 100%">
              <el-icon><Refresh /></el-icon>
              {{ mode === 'format' ? '格式化' : '压缩' }}
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
              支持键值排序
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Upload, Download, DocumentCopy, Delete, Right, Edit, View, 
  Setting, InfoFilled, Check, Refresh, Menu, Fold
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { formattedJsonExample, compressedJsonExample } from '@/utils/json-example'

const { copy } = useClipboard()
const mode = ref<'format' | 'compress'>('format')
const input = ref('')
const output = ref('')
const isDragOver = ref(false)

const options = reactive({
  indentSize: 2,
  sortKeys: false
})

// 初始化示例数据
onMounted(() => {
  if (mode.value === 'format') {
    input.value = formattedJsonExample
  } else {
    input.value = compressedJsonExample
  }
  handleProcess()
})

// 监听模式变化，加载对应的示例数据
watch(mode, () => {
  if (mode.value === 'format') {
    input.value = formattedJsonExample
  } else {
    input.value = compressedJsonExample
  }
  handleProcess()
})

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

// 处理输入变化
const handleInput = () => {
  if (input.value) {
    handleProcess()
  } else {
    output.value = ''
  }
}

// 处理格式化/压缩
const handleProcess = () => {
  if (!input.value) {
    ElMessage.warning('请输入要处理的 JSON 文本')
    return
  }

  try {
    // 先尝试解析 JSON
    const parsed = JSON.parse(input.value)
    
    if (mode.value === 'format') {
      // 格式化
      output.value = JSON.stringify(parsed, options.sortKeys ? Object.keys(parsed).sort() : null, options.indentSize)
    } else {
      // 压缩
      output.value = JSON.stringify(parsed, options.sortKeys ? Object.keys(parsed).sort() : null)
    }
  } catch (error) {
    ElMessage.error('JSON 格式错误，请检查输入')
    output.value = ''
  }
}

// 清空输入
const handleClearInput = () => {
  input.value = ''
  output.value = ''
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
    console.error('Failed to read clipboard:', error)
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
    const blob = new Blob([output.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `json_${mode.value === 'format' ? 'formatted' : 'compressed'}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success(`已下载为 json_${mode.value === 'format' ? 'formatted' : 'compressed'}_${Date.now()}.json`)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}
</script>

<style lang="scss" scoped>
.json-page {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  .header-title {
    h2 {
      font-size: 24px;
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
    }
  }

  .header-desc {
    color: var(--el-text-color-secondary);
    margin: 0 0 16px 0;
  }

  .header-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    
    .mode-controls {
      flex: 1;
      min-width: 0;
      overflow-x: auto;
      padding-bottom: 4px;
      
      .el-radio-group {
        white-space: nowrap;
      }
      
      .mode-icon {
        margin-right: 4px;
      }
    }
    
    .upload-control {
      flex: 0 0 auto;
      
      .upload-btn {
        width: 120px;
      }
    }
  }
}

.page-content {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.editor-container {
  display: flex;
  flex: 1;
  gap: 16px;
  overflow: hidden;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;

  &.input-section {
    border-left: 4px solid var(--el-color-primary);
  }

  &.output-section {
    border-left: 4px solid var(--el-color-success);
  }
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  .editor-title {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-primary);

    .el-icon {
      font-size: 18px;
    }
  }

  .editor-controls {
    display: flex;
    gap: 8px;
  }
}

.editor-area {
  flex: 1;
  padding: 16px;
  position: relative;
  overflow: hidden;

  &.drag-over {
    background-color: var(--el-fill-color-light);
    border: 2px dashed var(--el-color-primary);
  }

  .drop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(var(--el-color-primary-rgb), 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    
    .drop-icon {
      font-size: 48px;
      color: var(--el-color-primary);
      margin-bottom: 16px;
    }
    
    span {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .custom-textarea {
    height: 100%;
    
    :deep(.el-textarea__inner) {
      height: 100%;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      line-height: 1.6;
      padding: 12px;
      background-color: var(--el-bg-color);
      border-radius: 4px;
      transition: all 0.3s;
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2);
      }
    }
  }
  
  .output-textarea {
    :deep(.el-textarea__inner) {
      background-color: var(--el-fill-color-light);
    }
  }
}

.editor-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  display: flex;
  justify-content: flex-end;
}

.editor-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
}

.options-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .options-header {
    padding: 16px;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--el-border-color-light);
    color: var(--el-text-color-primary);
    
    .el-icon {
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }

  .el-form {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
  }

  .help-section {
    margin-top: auto;
    border-top: 1px solid var(--el-border-color-light);
    
    .help-header {
      padding: 12px 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--el-text-color-primary);
      
      .el-icon {
        color: var(--el-color-info);
      }
    }
    
    .help-content {
      padding: 0 16px 16px;
      
      p {
        margin: 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
        
        .el-icon {
          color: var(--el-color-success);
        }
      }
    }
  }
}

.el-divider {
  margin: 16px 0;
}
</style> 