<template>
  <div class="aes-page">
    <div class="page-header">
      <div class="header-title">
        <h2>AES 加密</h2>
        <p class="header-desc">支持 AES-128、AES-192、AES-256 加密解密</p>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="encrypt">加密</el-radio-button>
          <el-radio-button label="decrypt">解密</el-radio-button>
        </el-radio-group>
        <el-select v-model="keySize" placeholder="密钥长度">
          <el-option label="AES-128" value="128" />
          <el-option label="AES-192" value="192" />
          <el-option label="AES-256" value="256" />
        </el-select>
        <el-select v-model="cipherMode" placeholder="加密模式">
          <el-option label="CBC" value="CBC" />
          <el-option label="ECB" value="ECB" />
          <el-option label="CFB" value="CFB" />
          <el-option label="OFB" value="OFB" />
          <el-option label="CTR" value="CTR" />
        </el-select>
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
            :placeholder="`请输入${keySize}位密钥`"
            show-password
            @input="validateKey"
          />
          <div class="key-info" v-if="form.key">
            <span>密钥长度：{{ form.key.length * 8 }} 位</span>
            <el-tag :type="isKeyValid ? 'success' : 'danger'" size="small">
              {{ isKeyValid ? '密钥有效' : '密钥长度不符合要求' }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="IV" v-if="needIV">
          <el-input
            v-model="form.iv"
            placeholder="请输入初始化向量 (IV)"
            show-password
          />
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
              :placeholder="mode === 'encrypt' ? '请输入要加密的文本，或拖放文件到此处' : '请输入要解密的文本，或拖放文件到此处'"
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
              <span>{{ mode === 'encrypt' ? '密文' : '明文' }}</span>
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
            <el-button type="primary" @click="handleProcess" :disabled="!isKeyValid">
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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, DocumentCopy, Download } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import CryptoJS from 'crypto-js'

const { copy } = useClipboard()
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const keySize = ref<'128' | '192' | '256'>('128')
const cipherMode = ref<'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'>('CBC')

const form = reactive({
  key: '',
  iv: '',
  input: '',
  output: ''
})

// 计算属性
const needIV = computed(() => cipherMode.value !== 'ECB')
const isKeyValid = computed(() => {
  const requiredLength = parseInt(keySize.value) / 8
  return form.key.length === requiredLength
})

// 验证密钥长度
const validateKey = () => {
  const requiredLength = parseInt(keySize.value) / 8
  if (form.key.length > requiredLength) {
    form.key = form.key.slice(0, requiredLength)
  }
}

// 处理加密解密
const handleProcess = () => {
  if (!form.input || !form.key) {
    ElMessage.warning('请输入完整信息')
    return
  }

  if (!isKeyValid.value) {
    ElMessage.warning(`密钥长度必须为 ${keySize.value} 位`)
    return
  }

  if (needIV.value && !form.iv) {
    ElMessage.warning('请输入初始化向量 (IV)')
    return
  }

  try {
    const key = CryptoJS.enc.Utf8.parse(form.key)
    const options: any = {
      mode: CryptoJS.mode[cipherMode.value],
      padding: CryptoJS.pad.Pkcs7,
    }

    if (needIV.value) {
      options.iv = CryptoJS.enc.Utf8.parse(form.iv)
    }

    if (mode.value === 'encrypt') {
      const encrypted = CryptoJS.AES.encrypt(form.input, key, options)
      form.output = encrypted.toString()
    } else {
      const decrypted = CryptoJS.AES.decrypt(form.input, key, options)
      form.output = decrypted.toString(CryptoJS.enc.Utf8)
    }
  } catch (error) {
    ElMessage.error(mode.value === 'encrypt' ? '加密失败' : '解密失败')
    form.output = ''
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
        form.input = e.target.result as string
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
  form.output = ''
}

const handleClear = () => {
  form.key = ''
  form.iv = ''
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
    a.download = `aes_${mode.value}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
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
  gap: $spacing-large;

  .page-header {
    @include flex-between;
    padding-bottom: $spacing-large;
    border-bottom: 1px solid $border-color-light;

    .header-title {
      h2 {
        margin: 0;
        font-size: $font-size-extra-large;
        color: $text-primary;
      }

      .header-desc {
        margin: $spacing-mini 0 0;
        font-size: $font-size-small;
        color: $text-secondary;
      }
    }

    .header-controls {
      display: flex;
      gap: $spacing-base;
      align-items: center;
    }
  }

  .page-content {
    flex: 1;
    overflow-y: auto;
    @include scrollbar;

    .input-area {
      border: 1px dashed $border-color;
      border-radius: $border-radius-base;
      transition: border-color $transition-duration;

      &:hover {
        border-color: $primary-color;
      }
    }

    .key-info {
      margin-top: $spacing-mini;
      @include flex-between;
      font-size: $font-size-small;
      color: $text-secondary;
    }

    .input-stats,
    .output-stats {
      margin-top: $spacing-mini;
      font-size: $font-size-small;
      color: $text-secondary;
    }

    .output-controls {
      margin-top: $spacing-mini;
      @include flex-between;
    }
  }
}
</style> 