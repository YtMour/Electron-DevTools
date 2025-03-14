<template>
  <div class="aes-page">
    <div class="page-header">
      <div class="header-title">
        <h2>AES 加密</h2>
        <p class="header-desc">支持 AES-128、AES-192、AES-256 加密解密，支持多种加密模式</p>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="encrypt">加密</el-radio-button>
          <el-radio-button label="decrypt">解密</el-radio-button>
        </el-radio-group>
        <el-tooltip content="上传文件">
          <el-upload
            class="upload-btn"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange">
            <el-button type="primary" plain>
              <el-icon><Upload /></el-icon>
            </el-button>
          </el-upload>
        </el-tooltip>
      </div>
    </div>

    <div class="page-content">
      <el-form :model="form" label-width="80px">
        <el-form-item label="密钥">
          <el-input
            v-model="form.key"
            :type="showKey ? 'text' : 'password'"
            placeholder="请输入加密密钥">
            <template #append>
              <el-button @click="showKey = !showKey">
                <el-icon>
                  <component :is="showKey ? 'Hide' : 'View'" />
                </el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="输入">
          <div
            class="input-area"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent>
            <el-input
              v-model="form.input"
              type="textarea"
              :rows="8"
              :placeholder="mode === 'encrypt' ? '请输入要加密的文本，或拖放文件到此处' : '请输入要解密的文本'"
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
            :rows="8"
            readonly
            :placeholder="mode === 'encrypt' ? '加密结果' : '解密结果'"
          />
          <div class="output-controls">
            <div class="output-stats" v-if="form.output">
              <span>字符数：{{ form.output.length }}</span>
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
            <el-button type="primary" @click="handleProcess">
              {{ mode === 'encrypt' ? '加密' : '解密' }}
            </el-button>
            <el-button @click="handleClear">清空</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy, View, Hide } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import CryptoJS from 'crypto-js'

const { copy } = useClipboard()
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const showKey = ref(false)

const form = reactive({
  key: '',
  input: '',
  output: ''
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
        form.input = e.target.result as string
        handleProcess()
      }
    }
    reader.readAsText(file)
  } catch (error) {
    ElMessage.error('文件处理失败')
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
  if (form.input && form.key) {
    handleProcess()
  } else {
    form.output = ''
  }
}

const handleProcess = () => {
  if (!form.input || !form.key) {
    ElMessage.warning('请输入完整信息')
    return
  }

  try {
    if (mode.value === 'encrypt') {
      form.output = CryptoJS.AES.encrypt(form.input, form.key).toString()
    } else {
      const bytes = CryptoJS.AES.decrypt(form.input, form.key)
      form.output = bytes.toString(CryptoJS.enc.Utf8)
    }
  } catch (error) {
    ElMessage.error(mode.value === 'encrypt' ? '加密失败' : '解密失败，请检查输入是否正确')
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
    const blob = new Blob([form.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aes_${mode.value === 'encrypt' ? 'encrypted' : 'decrypted'}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}
</script>

<style lang="scss" scoped>
.aes-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    margin-bottom: 24px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .header-title {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .header-desc {
        margin: 8px 0 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .page-content {
    flex: 1;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
  }

  .input-area {
    border: 2px dashed var(--el-border-color);
    border-radius: 4px;
    transition: all 0.3s;

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

  .upload-btn {
    display: inline-block;
    
    :deep(.el-upload) {
      display: block;
    }
  }
}
</style> 