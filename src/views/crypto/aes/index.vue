<template>
  <div class="aes-container">
    <div class="header">
      <h2>AES 加密</h2>
      <el-alert
        title="AES 加密说明"
        type="info"
        description="AES 是一种对称加密算法，使用相同的密钥进行加密和解密。支持 128/192/256 位密钥长度和多种加密模式。请妥善保管您的密钥，密钥一旦丢失将无法解密数据。"
        show-icon
        :closable="false"
        class="aes-info"
      />
    </div>

    <div class="options">
      <div class="option-row">
        <el-select v-model="keySize" placeholder="选择密钥长度">
          <el-option label="AES-128" value="128" />
          <el-option label="AES-192" value="192" />
          <el-option label="AES-256" value="256" />
        </el-select>
        
        <el-select v-model="cipherMode" placeholder="选择加密模式">
          <el-option label="CBC" value="CBC" />
          <el-option label="ECB" value="ECB" />
          <el-option label="CFB" value="CFB" />
          <el-option label="OFB" value="OFB" />
          <el-option label="CTR" value="CTR" />
        </el-select>
      </div>
      
      <div class="option-row">
        <el-radio-group v-model="mode" class="operation-select">
          <el-radio-button label="encrypt">加密</el-radio-button>
          <el-radio-button label="decrypt">解密</el-radio-button>
        </el-radio-group>

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
              :rows="3"
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
            :rows="3"
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
        handleProcess() // 文件内容加载后自动进行加密/解密
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
  if (!form.input) {
    form.output = ''
  }
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
.aes-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: 20px;

    h2 {
      margin-bottom: 12px;
    }

    .aes-info {
      margin-bottom: 16px;
      font-size: 13px;
      
      :deep(.el-alert__title) {
        font-size: 13px;
        line-height: 18px;
      }
      
      :deep(.el-alert__description) {
        font-size: 12px;
        line-height: 1.5;
        margin: 4px 0 0 0;
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

      &:first-child {
        margin-bottom: 4px;
      }

      .el-select {
        flex: 1;
      }

      .operation-select {
        flex: 1;
      }

      .upload-btn {
        flex-shrink: 0;
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

    :deep(.el-form-item__label) {
      color: var(--el-text-color-regular);
    }

    :deep(.el-form-item__content) {
      width: 100%;
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

    :deep(.el-input__inner) {
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

    .key-info {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-secondary);
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
  }
}
</style> 