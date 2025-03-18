<template>
  <div class="pdf-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>PDF 处理</h3>
          <div class="header-controls">
            <el-radio-group v-model="mode" size="small">
              <el-radio-button label="merge">合并</el-radio-button>
              <el-radio-button label="split">拆分</el-radio-button>
              <el-radio-button label="compress">压缩</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div class="pdf-content">
        <el-upload
          class="pdf-uploader"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="true"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="mode === 'merge' ? 10 : 1"
          accept=".pdf">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              <template v-if="mode === 'merge'">
                支持上传多个PDF文件进行合并
              </template>
              <template v-else>
                支持上传单个PDF文件进行{{ mode === 'split' ? '拆分' : '压缩' }}
              </template>
            </div>
          </template>
        </el-upload>

        <div v-if="mode === 'split'" class="operation-options">
          <el-divider content-position="left">拆分选项</el-divider>
          <el-form :model="splitForm" label-width="100px">
            <el-form-item label="页码范围">
              <el-input
                v-model="splitForm.pages"
                placeholder="例如：1-3,5,7-9"
              />
            </el-form-item>
            <el-form-item label="输出文件名">
              <el-input
                v-model="splitForm.filename"
                placeholder="保存的文件名"
              />
            </el-form-item>
          </el-form>
        </div>

        <div v-if="mode === 'compress'" class="operation-options">
          <el-divider content-position="left">压缩选项</el-divider>
          <el-form :model="compressForm" label-width="100px">
            <el-form-item label="压缩质量">
              <div class="quality-slider">
                <el-slider
                  v-model="compressForm.quality"
                  :min="0"
                  :max="100"
                  :step="10"
                  :format-tooltip="formatQuality"
                  :marks="qualityMarks"
                />
              </div>
            </el-form-item>
            <el-form-item label="输出文件名">
              <el-input
                v-model="compressForm.filename"
                placeholder="保存的文件名"
              />
            </el-form-item>
          </el-form>
        </div>

        <div v-if="mode === 'merge'" class="operation-options">
          <el-divider content-position="left">合并选项</el-divider>
          <el-form :model="mergeForm" label-width="100px">
            <el-form-item label="合并顺序">
              <el-tooltip content="拖拽文件调整合并顺序" placement="top">
                <el-radio-group v-model="mergeForm.sortBy" size="small">
                  <el-radio-button label="name">按文件名</el-radio-button>
                  <el-radio-button label="upload">按上传顺序</el-radio-button>
                  <el-radio-button label="custom">自定义顺序</el-radio-button>
                </el-radio-group>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="输出文件名">
              <el-input
                v-model="mergeForm.filename"
                placeholder="保存的文件名"
              />
            </el-form-item>
          </el-form>
        </div>

        <div v-if="processedFile" class="result-section">
          <el-divider content-position="left">处理结果</el-divider>
          <div class="result-info">
            <span class="result-icon"><el-icon><Document /></el-icon></span>
            <div class="result-details">
              <div class="filename">{{ processedFile.name }}</div>
              <div class="filesize">{{ formatFileSize(processedFile.size) }}</div>
            </div>
            <div class="result-actions">
              <el-button type="primary" size="small" @click="handleDownload" class="download-btn">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
        </div>

        <div class="action-section">
          <el-button
            type="primary"
            @click="handleProcess"
            :loading="processing"
            :disabled="!canProcess">
            <el-icon>
              <component :is="actionIcon" />
            </el-icon>
            {{ actionText }}
          </el-button>
          <el-button @click="handleClear">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Download, Delete, ScaleToOriginal, Scissor, Compass } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'

interface ProcessedFile {
  name: string;
  size: number;
  url: string;
}

const mode = ref<'merge' | 'split' | 'compress'>('merge')
const fileList = ref<UploadFile[]>([])
const processing = ref(false)
const processedFile = ref<ProcessedFile | null>(null)

const splitForm = reactive({
  pages: '',
  filename: ''
})

const compressForm = reactive({
  quality: 80,
  filename: ''
})

const mergeForm = reactive({
  sortBy: 'upload',
  filename: ''
})

const qualityMarks = {
  0: '低',
  50: '中',
  100: '高'
}

const formatQuality = (val: number) => {
  return `${val}%`
}

const actionText = computed(() => {
  switch (mode.value) {
    case 'merge': return '合并PDF'
    case 'split': return '拆分PDF'
    case 'compress': return '压缩PDF'
    default: return '处理'
  }
})

const actionIcon = computed(() => {
  switch (mode.value) {
    case 'merge': return ScaleToOriginal
    case 'split': return Scissor
    case 'compress': return Compass
    default: return Document
  }
})

const canProcess = computed(() => {
  if (!fileList.value.length) return false
  
  switch (mode.value) {
    case 'merge':
      return fileList.value.length >= 2 && !!mergeForm.filename
    case 'split':
      return !!splitForm.pages && !!splitForm.filename
    case 'compress':
      return !!compressForm.filename
    default:
      return false
  }
})

const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw as File
  if (!file) return

  if (file.type !== 'application/pdf') {
    ElMessage.error('只支持 PDF 格式文件')
    return
  }

  if (mode.value !== 'merge' && fileList.value.length > 0) {
    // 非合并模式下只允许一个文件
    fileList.value = []
  }

  const timestamp = Date.now()
  const rawFile = Object.assign(file, { uid: timestamp }) as UploadRawFile
  
  fileList.value.push({
    name: file.name,
    uid: timestamp,
    size: file.size,
    status: 'success',
    raw: rawFile
  })

  // 设置默认输出文件名
  const outputFilename = file.name.replace(/\.pdf$/i, '')
  if (mode.value === 'split') {
    splitForm.filename = `${outputFilename}_split.pdf`
  } else if (mode.value === 'compress') {
    compressForm.filename = `${outputFilename}_compressed.pdf`
  } else if (mode.value === 'merge' && fileList.value.length === 1) {
    mergeForm.filename = `merged_documents.pdf`
  }
}

const handleProcess = async () => {
  if (!fileList.value.length) return

  try {
    processing.value = true;
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    switch (mode.value) {
      case 'merge':
        await handleMerge()
        break
      case 'split':
        await handleSplit()
        break
      case 'compress':
        await handleCompress()
        break
    }
  } catch (error) {
    ElMessage.error('处理失败，请检查文件是否正确')
    processedFile.value = null
  } finally {
    processing.value = false
  }
}

const handleMerge = async () => {
  // TODO: 实现 PDF 合并功能
  // 模拟生成的文件
  const totalSize = fileList.value.reduce((sum, file) => sum + (file.size || 0), 0)
  processedFile.value = {
    name: mergeForm.filename.endsWith('.pdf') ? mergeForm.filename : `${mergeForm.filename}.pdf`,
    size: totalSize,
    url: URL.createObjectURL(new Blob([]))
  }
  ElMessage.success('PDF合并成功')
}

const handleSplit = async () => {
  if (!splitForm.pages) {
    ElMessage.warning('请输入页码范围')
    return
  }
  // TODO: 实现 PDF 拆分功能
  // 模拟生成的文件
  const originalSize = fileList.value[0].size || 0
  processedFile.value = {
    name: splitForm.filename.endsWith('.pdf') ? splitForm.filename : `${splitForm.filename}.pdf`,
    size: Math.round(originalSize * 0.6), // 假设拆分后文件大小是原来的60%
    url: URL.createObjectURL(new Blob([]))
  }
  ElMessage.success('PDF拆分成功')
}

const handleCompress = async () => {
  // TODO: 实现 PDF 压缩功能
  // 模拟生成的文件
  const originalSize = fileList.value[0].size || 0
  const compressionRatio = compressForm.quality / 100
  processedFile.value = {
    name: compressForm.filename.endsWith('.pdf') ? compressForm.filename : `${compressForm.filename}.pdf`,
    size: Math.round(originalSize * compressionRatio), // 压缩后大小与质量成正比
    url: URL.createObjectURL(new Blob([]))
  }
  ElMessage.success('PDF压缩成功')
}

const handleDownload = () => {
  if (!processedFile.value) return
  
  const link = document.createElement('a')
  link.href = processedFile.value.url
  link.download = processedFile.value.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleClear = () => {
  fileList.value = []
  splitForm.pages = ''
  splitForm.filename = ''
  compressForm.quality = 80
  compressForm.filename = ''
  mergeForm.filename = ''
  processedFile.value = null
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }
}
</script>

<style lang="scss" scoped>
.pdf-page {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  
  :deep(.el-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .el-card__body {
      flex: 1;
      overflow: auto;
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }
    
    .header-controls {
      display: flex;
      gap: 12px;
    }
  }
  
  .pdf-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .pdf-uploader {
    margin-bottom: 20px;
    
    :deep(.el-upload-list) {
      margin-top: 16px;
    }
  }

  .operation-options {
    margin: 10px 0 20px;
    
    .el-divider {
      margin: 16px 0;
      
      &__text {
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
    
    .quality-slider {
      display: flex;
      align-items: center;
      
      .el-slider {
        flex: 1;
      }
    }
  }

  .result-section {
    margin: 20px 0;
    
    .result-info {
      display: flex;
      align-items: center;
      padding: 16px;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;
      
      .result-icon {
        font-size: 24px;
        margin-right: 16px;
        color: var(--el-color-primary);
      }
      
      .result-details {
        flex: 1;
        
        .filename {
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--el-text-color-primary);
        }
        
        .filesize {
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
      
      .result-actions {
        .download-btn {
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .action-section {
    margin-top: auto;
    padding-top: 20px;
    text-align: center;
    border-top: 1px solid var(--el-border-color-light);
    
    .el-button {
      margin: 0 6px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}
</style> 