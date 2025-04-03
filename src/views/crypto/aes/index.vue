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

        <el-button @click="showHistory = true">
          <el-icon><Timer /></el-icon>
          历史记录
        </el-button>
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

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="showHistory"
      title="历史记录"
      width="60%"
      :close-on-click-modal="false">
      <div class="history-header">
        <el-input
          v-model="historySearch"
          placeholder="搜索历史记录"
          clearable
          class="history-search">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="danger" @click="clearHistory" :disabled="!history.length">
          清空历史
        </el-button>
      </div>

      <div class="history-list">
        <el-empty v-if="!history.length" description="暂无历史记录" />
        <div v-else class="history-items">
          <div
            v-for="item in filteredHistory"
            :key="item.id"
            class="history-item">
            <div class="history-content">
              <div class="history-mode">
                <el-tag :type="item.mode === 'encrypt' ? 'success' : 'warning'">
                  {{ item.mode === 'encrypt' ? '加密' : '解密' }}
                </el-tag>
                <el-tag type="info" size="small">{{ item.algorithm }}</el-tag>
              </div>
              <div class="history-time">
                {{ new Date(item.timestamp).toLocaleString() }}
              </div>
              <div class="history-preview">
                <div class="preview-input">
                  <span class="preview-label">输入：</span>
                  <span class="preview-text">{{ item.input.slice(0, 50) }}{{ item.input.length > 50 ? '...' : '' }}</span>
                </div>
                <div class="preview-output">
                  <span class="preview-label">输出：</span>
                  <span class="preview-text">{{ item.output.slice(0, 50) }}{{ item.output.length > 50 ? '...' : '' }}</span>
                </div>
              </div>
            </div>
            <div class="history-actions">
              <el-button type="primary" link @click="useHistory(item)">
                使用
              </el-button>
              <el-button type="danger" link @click="deleteHistory(item.id)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, DocumentCopy, Download, Timer, Search } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import CryptoJS from 'crypto-js'
import { cryptoDB, type CryptoHistory, addHistory } from '@/utils/db'
import { encrypt, decrypt } from '@/utils/crypto'

const { copy } = useClipboard()
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const keySize = ref<'128' | '192' | '256'>('128')
const cipherMode = ref<'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'>('CBC')

const form = reactive({
  key: '',
  iv: '',
  input: '',
  output: '',
  algorithm: 'AES-CBC'
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

  // 保存历史记录
  saveHistory()
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
  } else if (isKeyValid.value && (!needIV.value || form.iv)) {
    handleProcess() // 当密钥有效且 IV（如果需要）已填写时，自动处理
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

// 历史记录相关的响应式变量
const history = ref<CryptoHistory[]>([])
const showHistory = ref(false)
const historySearch = ref('')

// 计算属性
const filteredHistory = computed(() => {
  if (!historySearch.value) return history.value
  const search = historySearch.value.toLowerCase()
  return history.value.filter(item => 
    item.input.toLowerCase().includes(search) ||
    item.output.toLowerCase().includes(search)
  )
})

// 历史记录相关的方法
const loadHistory = async () => {
  try {
    history.value = await cryptoDB.getHistory('aes')
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

const saveHistory = async () => {
  if (!form.input || !form.output) return
  
  try {
    await addHistory({
      tool: 'aes',
      mode: mode.value,
      input: form.input,
      output: form.output,
      key: form.key,
      iv: form.iv,
      algorithm: form.algorithm,
      timestamp: Date.now()
    })
    await loadHistory()
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

const useHistory = (item: CryptoHistory) => {
  mode.value = item.mode as 'encrypt' | 'decrypt'
  form.input = item.input
  form.output = item.output
  form.key = item.key || ''
  form.iv = item.iv || ''
  form.algorithm = item.algorithm || 'AES-CBC'
  showHistory.value = false
  handleProcess()
}

const deleteHistory = async (id: number | undefined) => {
  if (id === undefined) return;
  
  try {
    await cryptoDB.history.delete(id);
    await loadHistory();
    ElMessage.success('删除成功');
  } catch (error) {
    console.error('删除历史记录失败:', error);
    ElMessage.error('删除失败');
  }
}

const clearHistory = async () => {
  try {
    await cryptoDB.clearHistory('aes')
    history.value = []
  } catch (error) {
    console.error('清空历史记录失败:', error)
  }
}

// 在组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})
</script>

<style lang="scss" scoped>
.aes-container {
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

    .aes-info {
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
  }
}

// 历史记录样式
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .history-search {
    width: 300px;
  }
}

.history-list {
  max-height: 500px;
  overflow-y: auto;

  .history-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    background-color: var(--el-fill-color-blank);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .history-content {
      flex: 1;
      margin-right: 16px;

      .history-mode {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .history-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }

      .history-preview {
        .preview-input,
        .preview-output {
          margin-bottom: 4px;
          font-size: 13px;

          .preview-label {
            color: var(--el-text-color-secondary);
            margin-right: 8px;
          }

          .preview-text {
            color: var(--el-text-color-primary);
          }
        }
      }
    }

    .history-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style> 