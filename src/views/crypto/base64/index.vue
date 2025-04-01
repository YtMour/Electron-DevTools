<template>
  <div class="base64-container">
    <div class="header">
      <h2>Base64 编解码</h2>
      <el-alert
        title="Base64 编码说明"
        type="info"
        description="Base64 是一种基于 64 个可打印字符来表示二进制数据的编码方式。它可以用来传输包含二进制数据的文本，常用于在 URL、Cookie、网页中传输少量二进制数据。注意：Base64 是编码方式而非加密算法，不能用于数据加密。"
        show-icon
        :closable="false"
        class="base64-info"
      />
    </div>

    <div class="options">
      <div class="option-row">
        <el-radio-group v-model="mode" class="mode-select">
          <el-radio-button label="encode">编码</el-radio-button>
          <el-radio-button label="decode">解码</el-radio-button>
        </el-radio-group>

        <el-checkbox v-model="urlSafe" v-if="mode === 'encode'">URL 安全编码</el-checkbox>

        <div class="upload-btn">
          <el-upload
            ref="upload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange">
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
        </div>
      </div>
    </div>

    <div class="page-content">
      <el-form :model="form" label-width="80px">
        <el-form-item label="输入">
          <div
            class="input-area"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent>
            <el-input
              v-model="form.input"
              type="textarea"
              :rows="3"
              :placeholder="mode === 'encode' ? '请输入要编码的文本，或拖放文件到此处' : '请输入要解码的 Base64 文本，或拖放文件到此处'"
              @input="handleInput"
            />
          </div>
          <div class="input-stats" v-if="form.input">
            <span>字符数：{{ form.input.length }}</span>
          </div>
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="3"
            readonly
            :placeholder="mode === 'encode' ? 'Base64 编码结果' : '解码结果'"
          />
          <div class="output-controls">
            <div class="output-stats" v-if="form.output">
              <span>{{ mode === 'encode' ? 'Base64 文本' : '原始文本' }}</span>
            </div>
            <div class="output-actions">
              <el-button-group>
                <el-button type="primary" @click="handleCopy" :disabled="!form.output">
                  <el-icon><DocumentCopy /></el-icon> 复制
                </el-button>
                <el-button type="primary" @click="handleDownload" :disabled="!form.output">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
              </el-button-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleConvert" :disabled="!form.input">
              {{ mode === 'encode' ? '编码' : '解码' }}
            </el-button>
            <el-button @click="handleClear">清空</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>

      <div v-if="processing" class="processing-info">
        <el-progress :percentage="progress" :status="progress === 100 ? 'success' : ''" />
        <div class="processing-text">正在处理文件...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy, Delete } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import * as DiffLib from 'diff'

const { copy } = useClipboard()
const mode = ref<'encode' | 'decode'>('encode')
const urlSafe = ref(false)

const form = reactive({
  input: '',
  output: ''
})

const leftText = ref('')
const rightText = ref('')

const currentFileType = ref('')

const processing = ref(false)
const progress = ref(0)
const chunkSize = 1024 * 1024 // 1MB chunks

// 添加文件处理工具函数
const processFileInChunks = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const chunks: string[] = []
    let offset = 0

    reader.onload = (e) => {
      const chunk = e.target?.result as string
      chunks.push(chunk.split(',')[1])
      offset += chunkSize

      if (offset < file.size) {
        // 继续读取下一块
        readNextChunk()
      } else {
        // 所有块读取完成，合并结果
        resolve(chunks.join(''))
      }
    }

    reader.onerror = reject

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + chunkSize)
      reader.readAsDataURL(slice)
    }

    readNextChunk()
  })
}

// 修改文件处理函数
const handleFileChange = async (uploadFile: UploadFile) => {
  try {
    const file = uploadFile.raw
    if (!file) {
      ElMessage.error('文件处理失败')
      return
    }

    processing.value = true
    progress.value = 0
    currentFileType.value = file.type || 'application/octet-stream'
    ElMessage.success(`文件类型: ${currentFileType.value}`)

    if (mode.value === 'encode') {
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        // 文本文件使用标准方式
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            form.input = e.target.result as string
            handleConvert()
          }
        }
        reader.readAsText(file)
      } else {
        // 大文件使用分块处理
        form.input = await processFileInChunks(file)
        handleConvert()
      }
    } else {
      // 解码模式
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          form.input = e.target.result as string
          handleConvert()
        }
      }
      reader.readAsText(file)
    }
  } catch (error) {
    ElMessage.error('文件处理失败')
  } finally {
    processing.value = false
  }
}

// 处理文件拖放
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files?.length) {
    const rawFile = files[0] as UploadRawFile
    rawFile.uid = Date.now()
    handleFileChange({ raw: rawFile } as UploadFile)
  }
}

const handleInput = () => {
  if (!form.input) {
    form.output = ''
  }
}

// 修改转换函数
const handleConvert = () => {
  if (!form.input) {
    form.output = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      let encoded: string
      if (currentFileType.value.startsWith('text/') || currentFileType.value === 'application/json') {
        // 文本文件使用标准编码
        encoded = btoa(unescape(encodeURIComponent(form.input)))
      } else {
        // 二进制文件直接使用 base64 部分
        encoded = form.input
      }
      form.output = urlSafe.value ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded
    } else {
      let base64 = form.input
      if (urlSafe.value) {
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/')
        while (base64.length % 4 !== 0) {
          base64 += '='
        }
      }
      form.output = decodeURIComponent(escape(atob(base64)))
    }
  } catch (error) {
    ElMessage.error('转换失败，请检查输入是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  form.input = ''
  form.output = ''
}

// 复制结果
const handleCopy = async () => {
  try {
    await copy(form.output)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载结果
const handleDownload = () => {
  try {
    let blob: Blob
    let filename: string

    if (mode.value === 'encode') {
      // 编码模式：下载 base64 文本
      blob = new Blob([form.output], { type: 'text/plain' })
      filename = `base64_encoded_${Date.now()}.txt`
    } else {
      // 解码模式：根据原始文件类型下载
      const mimeType = currentFileType.value || 'application/octet-stream'
      const binary = atob(form.output)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      blob = new Blob([bytes], { type: mimeType })
      filename = `decoded_${Date.now()}.${mimeType.split('/')[1] || 'bin'}`
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 计算差异结果
const diffResult = computed(() => {
  if (!leftText.value && !rightText.value) {
    return []
  }

  try {
    const diff = DiffLib.diffLines(leftText.value, rightText.value)
    return diff
  } catch (error) {
    console.error('Diff error:', error)
    return []
  }
})
</script>

<style lang="scss" scoped>
.base64-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-button) {
    &.el-button--primary {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);

      &:not(.is-disabled):hover {
        background-color: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
      }

      &.is-disabled {
        background-color: var(--el-color-primary-light-5);
        border-color: var(--el-color-primary-light-5);
      }
    }

    &:not(.el-button--primary) {
      &:not(.is-disabled):hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        background-color: var(--el-button-hover-bg-color);
      }
    }
  }

  .header {
    margin-bottom: 20px;

    h2 {
      margin-bottom: 12px;
    }

    .base64-info {
      margin-bottom: 16px;
      font-size: 13px;
      background-color: var(--el-fill-color-blank);
      border-color: var(--el-border-color-light);
      
      :deep(.el-alert__title) {
        font-size: 13px;
        line-height: 18px;
        color: var(--el-text-color-primary);
      }
      
      :deep(.el-alert__description) {
        font-size: 12px;
        line-height: 1.5;
        margin: 4px 0 0 0;
        color: var(--el-text-color-regular);
      }

      :deep(.el-alert__icon) {
        color: var(--el-text-color-regular);
      }
    }
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;

    .option-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .mode-select {
        flex: 1;
      }

      .upload-btn {
        flex-shrink: 0;
        
        :deep(.el-upload) {
          display: block;
        }
      }
    }
  }

  .page-content {
    flex: 1;
    background-color: var(--el-fill-color-blank);
    border-radius: 8px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-light);
    overflow-y: auto;

    :deep(.el-form-item__content) {
      width: 100%;
    }

    :deep(.el-form-item__label) {
      color: var(--el-text-color-regular);
    }

    :deep(.el-textarea__inner) {
      font-family: var(--el-font-family);
      font-size: 14px;
      line-height: 1.6;
      background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
      color: var(--el-text-color-primary);
      border-color: var(--el-border-color);

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }

      &:hover {
        border-color: var(--el-border-color-hover);
      }

      &:focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
      }
    }

    .input-area {
      width: 100%;
      border: 2px dashed var(--el-border-color);
      border-radius: 4px;
      transition: all 0.3s;
      background-color: var(--el-input-bg-color, var(--el-fill-color-blank));

      :deep(.el-textarea__inner) {
        border: none;
        background-color: transparent;
        width: 100%;
        
        &:focus {
          box-shadow: none;
        }
      }

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .input-stats,
    .output-controls {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }

    .processing-info {
      margin-top: 16px;
      text-align: center;

      .processing-text {
        margin-top: 8px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  .processing-info {
    margin-top: 16px;
    text-align: center;

    .processing-text {
      margin-top: 8px;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
}
</style> 