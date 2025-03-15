<template>
  <div class="rsa-container">
    <div class="header">
      <h2>RSA 加密</h2>
      <el-alert
        title="RSA 算法说明"
        type="info"
        description="RSA 是一种非对称加密算法，使用公钥和私钥对。公钥用于加密数据，只有使用对应的私钥才能解密；私钥用于解密数据，保证了数据传输的安全性。请注意保管好您的私钥，不要泄露给他人。"
        show-icon
        :closable="false"
        class="rsa-info"
      />
    </div>

    <div class="options">
      <div class="option-row">
        <el-radio-group v-model="mode" class="mode-select">
          <el-radio-button label="generate">生成密钥</el-radio-button>
          <el-radio-button label="encrypt">加密</el-radio-button>
          <el-radio-button label="decrypt">解密</el-radio-button>
        </el-radio-group>

        <div class="upload-btn" v-if="mode !== 'generate'">
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
        <template v-if="mode === 'generate'">
          <el-form-item label="密钥长度">
            <el-select v-model="form.keySize" placeholder="选择密钥长度">
              <el-option label="1024 位" :value="1024" />
              <el-option label="2048 位" :value="2048" />
              <el-option label="4096 位" :value="4096" />
            </el-select>
          </el-form-item>

          <el-form-item label="公钥">
            <el-input
              v-model="form.publicKey"
              type="textarea"
              :rows="3"
              readonly
              placeholder="生成的公钥将显示在这里"
            />
            <div class="output-controls" v-if="form.publicKey">
              <div class="output-stats">
                <span>RSA 公钥</span>
              </div>
              <div class="output-actions">
                <el-button-group>
                  <el-button type="primary" @click="handleCopyPublic">
                    <el-icon><DocumentCopy /></el-icon> 复制
                  </el-button>
                  <el-button type="primary" @click="handleDownloadPublic">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="私钥">
            <el-input
              v-model="form.privateKey"
              type="textarea"
              :rows="3"
              readonly
              show-password
              placeholder="生成的私钥将显示在这里"
            />
            <div class="output-controls" v-if="form.privateKey">
              <div class="output-stats">
                <span>RSA 私钥</span>
              </div>
              <div class="output-actions">
                <el-button-group>
                  <el-button type="primary" @click="handleCopyPrivate">
                    <el-icon><DocumentCopy /></el-icon> 复制
                  </el-button>
                  <el-button type="primary" @click="handleDownloadPrivate">
                    <el-icon><Download /></el-icon> 下载
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="handleGenerate">生成密钥对</el-button>
              <el-button @click="handleClear">清空</el-button>
            </el-button-group>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item :label="mode === 'encrypt' ? '公钥' : '私钥'">
            <el-input
              v-model="form.key"
              type="textarea"
              :rows="3"
              :placeholder="mode === 'encrypt' ? '请输入 RSA 公钥' : '请输入 RSA 私钥'"
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
              <el-button type="primary" @click="handleProcess" :disabled="!form.key">
                {{ mode === 'encrypt' ? '加密' : '解密' }}
              </el-button>
              <el-button @click="handleClear">清空</el-button>
            </el-button-group>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import JSEncrypt from 'jsencrypt'

const { copy } = useClipboard()
const mode = ref<'encrypt' | 'decrypt' | 'generate'>('encrypt')

const form = reactive({
  keySize: 2048,
  key: '',
  publicKey: '',
  privateKey: '',
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

// 生成密钥对
const handleGenerate = () => {
  try {
    ElMessage.info('正在生成密钥对，请稍候...')
    const encrypt = new JSEncrypt({ default_key_size: form.keySize.toString() })
    form.publicKey = encrypt.getPublicKey() || ''
    form.privateKey = encrypt.getPrivateKey() || ''
    
    if (form.publicKey && form.privateKey) {
      ElMessage.success('密钥对生成成功')
    } else {
      throw new Error('生成失败')
    }
  } catch (error) {
    ElMessage.error('生成密钥对失败')
    form.publicKey = ''
    form.privateKey = ''
  }
}

// 加密解密处理
const handleProcess = () => {
  if (!form.input || !form.key) {
    ElMessage.warning('请输入完整信息')
    return
  }

  try {
    const encrypt = new JSEncrypt()
    if (mode.value === 'encrypt') {
      encrypt.setPublicKey(form.key)
      const encrypted = encrypt.encrypt(form.input)
      if (encrypted) {
        form.output = encrypted
      } else {
        throw new Error('加密失败')
      }
    } else {
      encrypt.setPrivateKey(form.key)
      const decrypted = encrypt.decrypt(form.input)
      if (decrypted) {
        form.output = decrypted
      } else {
        throw new Error('解密失败')
      }
    }
  } catch (error) {
    ElMessage.error(mode.value === 'encrypt' ? '加密失败' : '解密失败，请检查输入是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  if (mode.value === 'generate') {
    form.publicKey = ''
    form.privateKey = ''
  } else {
    form.key = ''
    form.input = ''
    form.output = ''
  }
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

// 复制公钥
const handleCopyPublic = async () => {
  try {
    await copy(form.publicKey)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 复制私钥
const handleCopyPrivate = async () => {
  try {
    await copy(form.privateKey)
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
    a.download = `rsa_${mode.value === 'encrypt' ? 'encrypted' : 'decrypted'}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 下载公钥
const handleDownloadPublic = () => {
  try {
    const blob = new Blob([form.publicKey], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsa_public_key_${Date.now()}.pem`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 下载私钥
const handleDownloadPrivate = () => {
  try {
    const blob = new Blob([form.privateKey], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsa_private_key_${Date.now()}.pem`
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
.rsa-container {
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

    .rsa-info {
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
    background-color: var(--el-bg-color);
    border-radius: 8px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    overflow-y: auto;

    :deep(.el-form-item__content) {
      width: 100%;
    }

    :deep(.el-textarea__inner) {
      font-family: var(--el-font-family);
      font-size: 14px;
      line-height: 1.6;
    }

    :deep(.el-button) {
      display: none;
    }

    .input-area {
      width: 100%;
      border: 2px dashed var(--el-border-color);
      border-radius: 4px;
      transition: all 0.3s;

      :deep(.el-textarea__inner) {
        border: none;
        
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
  }
}
</style> 