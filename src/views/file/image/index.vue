<template>
  <div class="image-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>图片转换</h3>
        </div>
      </template>

      <div class="image-content">
        <!-- 上传区域 -->
        <div class="upload-container" :class="{'has-file': selectedFile}">
          <el-upload
            class="image-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
            accept="image/*">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg、jpeg、png、gif、bmp、tiff 等格式
              </div>
            </template>
          </el-upload>
        </div>

        <!-- 参数设置区域 -->
        <div class="config-section" v-if="selectedFile && !processedFile">
          <div class="config-row">
            <div class="config-label">目标格式</div>
            <div class="config-content format-options">
              <el-radio-group v-model="format" size="small" @change="updateOutputFilename">
                <el-radio-button label="png">PNG</el-radio-button>
                <el-radio-button label="jpeg">JPEG</el-radio-button>
                <el-radio-button label="webp">WebP</el-radio-button>
                <el-radio-button label="bmp">BMP</el-radio-button>
                <el-radio-button label="tiff">TIFF</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">压缩质量</div>
            <div class="config-content quality-slider">
              <div class="slider-marks">
                <span class="mark">低</span>
                <span class="mark">中</span>
                <span class="mark">高</span>
              </div>
              <el-slider
                v-model="quality"
                :min="0.4"
                :max="1"
                :step="0.1"
                :format-tooltip="formatQuality"
                :show-stops="true"
              />
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">尺寸调整</div>
            <div class="config-content resize-options">
              <el-checkbox v-model="resizeEnabled">启用</el-checkbox>
              <div class="resize-controls" v-if="resizeEnabled">
                <el-input-number
                  v-model="maxWidth"
                  :min="100"
                  :max="5000"
                  size="small"
                  placeholder="宽度"
                  controls-position="right"
                />
                <span class="dimension-separator">x</span>
                <el-input-number
                  v-model="maxHeight"
                  :min="100"
                  :max="5000"
                  size="small"
                  placeholder="高度"
                  controls-position="right"
                />
              </div>
            </div>
          </div>

          <div class="config-row">
            <div class="config-label">输出文件名</div>
            <div class="config-content filename-input">
              <el-input
                v-model="outputFilenameBase"
                placeholder="保存的文件名"
                size="default"
                @input="updateOutputFilename"
              />
              <div class="filename-extension">.{{ format }}</div>
            </div>
          </div>
        </div>

        <!-- 转换结果显示区域 -->
        <div v-if="processedFile" class="result-section">
          <div class="result-header">
            <div class="result-title">转换结果</div>
            <div class="result-actions">
              <el-button type="primary" size="small" @click="handleDownload" class="download-btn">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button size="small" @click="handleClear" class="clear-btn">
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
          </div>

          <div class="preview-container">
            <div class="preview-item">
              <div class="preview-label">
                <span>原始图片</span>
                <span class="file-size">{{ formatFileSize(selectedFile?.size || 0) }}</span>
              </div>
              <div class="preview-image">
                <img :src="originalPreview" alt="原图" v-if="originalPreview" />
              </div>
            </div>
            <div class="preview-arrow">
              <el-icon><Right /></el-icon>
            </div>
            <div class="preview-item">
              <div class="preview-label">
                <span>转换后</span>
                <span class="file-size">{{ formatFileSize(processedFile.size) }}</span>
              </div>
              <div class="preview-image">
                <img :src="processedFile.url" alt="转换后" v-if="processedFile.url" />
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="action-section" v-if="selectedFile && !processedFile">
          <el-button 
            type="primary" 
            @click="handleConvert" 
            :loading="processing"
            :disabled="!canProcess">
            <el-icon><PictureFilled /></el-icon>
            转换
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Download, Delete, PictureFilled, Right } from '@element-plus/icons-vue'
import imageCompression from 'browser-image-compression'
import type { UploadFile, UploadRawFile } from 'element-plus'

interface ProcessedFile {
  name: string;
  size: number;
  url: string;
}

const format = ref('png')
const quality = ref(0.8)
const selectedFile = ref<File | null>(null)
const fileList = ref<UploadFile[]>([])
const processing = ref(false)
const processedFile = ref<ProcessedFile | null>(null)
const originalPreview = ref('')
const outputFilenameBase = ref('') // 文件名（不含扩展名）
const resizeEnabled = ref(false)
const maxWidth = ref(1920)
const maxHeight = ref(1080)

// 完整的输出文件名（含扩展名）
const outputFilename = computed(() => {
  return outputFilenameBase.value ? `${outputFilenameBase.value}.${format.value}` : ''
})

const formatQuality = (val: number) => {
  return `${Math.round(val * 100)}%`
}

const canProcess = computed(() => {
  return !!selectedFile.value && !!outputFilenameBase.value
})

// 更新输出文件名
const updateOutputFilename = () => {
  if (!selectedFile.value) return
  
  // 如果首次设置，则使用原文件名作为基础
  if (!outputFilenameBase.value && selectedFile.value) {
    const filename = selectedFile.value.name
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename
    outputFilenameBase.value = `${baseName}_converted`
  }
}

const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw as File
  if (!file) return

  // 检查是否为图片文件
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只支持图片文件')
    return
  }

  // 清空已有文件
  const timestamp = Date.now()
  const rawFile = Object.assign(file, { uid: timestamp }) as UploadRawFile
  fileList.value = [{
    name: file.name,
    uid: timestamp,
    size: file.size,
    status: 'success',
    raw: rawFile
  }]
  
  selectedFile.value = file
  originalPreview.value = URL.createObjectURL(file)
  processedFile.value = null
  
  // 设置默认输出文件名（不含扩展名）
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
  outputFilenameBase.value = `${baseName}_converted`
}

const handleConvert = async () => {
  if (!selectedFile.value) return

  try {
    processing.value = true
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: resizeEnabled.value ? Math.max(maxWidth.value, maxHeight.value) : undefined,
      useWebWorker: true,
      fileType: `image/${format.value}`,
      quality: quality.value
    }

    const compressedFile = await imageCompression(selectedFile.value, options)
    const blob = await imageCompression.getDataUrlFromFile(compressedFile)
    
    // 设置处理结果
    processedFile.value = {
      name: outputFilename.value,
      size: compressedFile.size,
      url: blob
    }
    
    ElMessage.success('图片转换成功')
  } catch (error) {
    ElMessage.error('转换失败，请检查文件格式是否正确')
    console.error(error)
  } finally {
    processing.value = false
  }
}

// 监听格式变化，自动更新处理结果
watch(format, () => {
  if (processedFile.value) {
    handleConvert()
  }
})

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
  selectedFile.value = null
  fileList.value = []
  originalPreview.value = ''
  processedFile.value = null
  outputFilenameBase.value = ''
  quality.value = 0.8
  resizeEnabled.value = false
  maxWidth.value = 1920
  maxHeight.value = 1080
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(1) + ' MB'
  }
}
</script>

<style lang="scss" scoped>
.image-page {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  
  :deep(.el-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .el-card__header {
      padding: 8px 16px;
      min-height: 32px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    
    .el-card__body {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    h3 {
      margin: 0;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }
  }
  
  .image-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow-y: auto;
    gap: 16px;
  }

  .upload-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80%;
    min-height: 300px;
    width: 100%;
    transition: all 0.3s ease;
    
    &.has-file {
      height: auto;
      min-height: auto;
      max-height: 180px;
    }
  }
  
  .image-uploader {
    width: 100%;
    max-width: 80%;
    margin: 0 auto;
    
    :deep(.el-upload) {
      width: 100%;
    }
    
    :deep(.el-upload-dragger) {
      width: 100%;
      height: auto;
      min-height: 260px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.3s ease;
      border: 2px dashed var(--el-border-color);
      
      &:hover {
        border-color: var(--el-color-primary);
      }
    }
    
    :deep(.el-upload-list) {
      margin-top: 8px;
    }

    :deep(.el-icon--upload) {
      margin: 8px auto 16px;
      font-size: 48px;
      color: var(--el-color-primary);
    }

    :deep(.el-upload__text) {
      margin: 16px 0;
      font-size: 18px;
      
      em {
        color: var(--el-color-primary);
        font-style: normal;
        font-weight: 500;
      }
    }
    
    :deep(.el-upload__tip) {
      font-size: 14px;
      margin-top: 12px;
    }
  }
  
  .has-file {
    .image-uploader {
      :deep(.el-upload-dragger) {
        min-height: 100px;
        padding: 10px;
        border-width: 1px;
      }
      
      :deep(.el-icon--upload) {
        margin: 4px auto;
        font-size: 24px;
      }
      
      :deep(.el-upload__text) {
        margin: 4px 0;
        font-size: 14px;
      }
      
      :deep(.el-upload__tip) {
        font-size: 12px;
        margin-top: 4px;
      }
    }
  }

  // 配置区域样式
  .config-section {
    width: 100%;
    max-width: 90%;
    margin: 0 auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    
    .config-row {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
    
    .config-label {
      width: 100px;
      flex-shrink: 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      padding-right: 16px;
    }
    
    .config-content {
      flex: 1;
      min-width: 0;
    }
    
    .format-options {
      :deep(.el-radio-group) {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      
      :deep(.el-radio-button) {
        margin-right: -1px;
        
        &:first-child {
          .el-radio-button__inner {
            border-radius: 4px 0 0 4px;
          }
        }
        
        &:last-child {
          .el-radio-button__inner {
            border-radius: 0 4px 4px 0;
          }
        }
        
        .el-radio-button__inner {
          padding: 8px 16px;
        }
      }
    }
    
    .quality-slider {
      padding: 0 16px;
      
      .slider-marks {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 0 12px;
        
        .mark {
          font-size: 13px;
          color: var(--el-text-color-regular);
          font-weight: 500;
        }
      }
      
      :deep(.el-slider) {
        margin-top: 12px;
        
        .el-slider__button {
          width: 18px;
          height: 18px;
        }
        
        .el-slider__bar {
          height: 8px;
        }
        
        .el-slider__runway {
          height: 8px;
        }
      }
    }
    
    .resize-options {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      
      :deep(.el-checkbox) {
        margin-right: 8px;
        
        .el-checkbox__label {
          font-size: 14px;
          font-weight: 500;
        }
      }
      
      .resize-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .dimension-separator {
          color: var(--el-text-color-secondary);
          font-weight: bold;
        }
        
        :deep(.el-input-number) {
          width: 140px;
          
          .el-input__inner {
            font-size: 14px;
            padding: 0 12px;
          }
        }
      }
    }
    
    .filename-input {
      display: flex;
      align-items: center;
      
      .el-input {
        flex: 1;
      }
      
      :deep(.el-input) {
        .el-input__inner {
          font-size: 14px;
          padding: 0 12px;
          height: 36px;
        }
      }
      
      .filename-extension {
        margin-left: 12px;
        padding: 0 12px;
        height: 36px;
        line-height: 36px;
        background-color: var(--el-fill-color-light);
        border-radius: 4px;
        color: var(--el-text-color-regular);
        font-family: monospace;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }

  // 结果区域样式
  .result-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background-color: var(--el-fill-color-light);
      
      .result-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .result-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .preview-container {
      display: flex;
      align-items: stretch;
      flex: 1;
      min-height: 0;
      padding: 16px;
      
      .preview-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        
        .preview-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          span {
            font-size: 13px;
            color: var(--el-text-color-regular);
            
            &.file-size {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
        
        .preview-image {
          flex: 1;
          min-height: 0;
          border: 1px solid var(--el-border-color-light);
          border-radius: 4px;
          background-color: var(--el-fill-color-lighter);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          
          img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        }
      }
      
      .preview-arrow {
        display: flex;
        align-items: center;
        padding: 0 16px;
        color: var(--el-color-primary);
        font-size: 18px;
      }
    }
  }

  // 操作按钮区域样式
  .action-section {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
    padding-top: 16px;
    flex-shrink: 0;
    
    .el-button {
      padding: 10px 20px;
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}
</style> 