<template>
  <div class="hash-container">
    <div class="header">
      <h2>Hash 计算器</h2>
      <el-alert
        title="哈希算法说明"
        type="info"
        description="哈希（Hash）是一种单向加密算法，具有不可逆性。这意味着通过哈希算法生成的值无法被解密还原为原始数据。我们只能通过比对两个哈希值是否相同来验证数据的完整性和一致性。如果您需要可以解密的加密方式，请使用 AES 或 RSA 加密工具。"
        show-icon
        :closable="false"
        class="hash-info"
      />
    </div>

    <div class="options">
      <div class="option-row">
        <el-radio-group v-model="algorithm">
          <el-radio-button label="md5">MD5</el-radio-button>
          <el-radio-button label="sha1">SHA-1</el-radio-button>
          <el-radio-button label="sha256">SHA-256</el-radio-button>
          <el-radio-button label="sha512">SHA-512</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="option-row">
        <el-radio-group v-model="mode" class="mode-select">
          <el-radio-button label="calculate">计算哈希值</el-radio-button>
          <el-radio-button label="verify">验证哈希值</el-radio-button>
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
              :placeholder="mode === 'calculate' ? '请输入要计算哈希值的文本，或拖放文件到此处' : '请输入要验证的原文本，或拖放文件到此处'"
              @input="handleInput"
            />
          </div>
          <div class="input-stats" v-if="form.input">
            <span>字符数：{{ form.input.length }}</span>
          </div>
        </el-form-item>

        <template v-if="mode === 'verify'">
          <el-form-item label="哈希值">
            <el-input
              v-model="form.hash"
              :placeholder="'请输入要验证的哈希值'"
              @input="handleInput"
            />
          </el-form-item>
        </template>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="3"
            readonly
            :placeholder="mode === 'calculate' ? '哈希计算结果' : '验证结果'"
          />
          <div class="output-controls">
            <div class="output-stats" v-if="form.output">
              <template v-if="mode === 'calculate'">
                <span>{{ algorithm.toUpperCase() }} 哈希值</span>
              </template>
              <template v-else>
                <el-tag :type="verifyResult ? 'success' : 'danger'" size="small">
                  {{ verifyResult ? '验证通过' : '验证失败' }}
                </el-tag>
              </template>
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
            <el-button type="primary" @click="handleCalculate" :disabled="!form.input">
              {{ mode === 'calculate' ? '计算' : '验证' }}
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
                <el-tag type="success">Hash 计算</el-tag>
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
import { Upload, Download, DocumentCopy, Timer, Search } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import CryptoJS from 'crypto-js'
import { cryptoDB, type CryptoHistory, addHistory } from '@/utils/db'
import { hash } from '@/utils/crypto'

const { copy } = useClipboard()
const mode = ref<'calculate' | 'verify'>('calculate')
const algorithm = ref<'md5' | 'sha1' | 'sha256' | 'sha512'>('md5')

const form = reactive({
  input: '',
  hash: '',
  output: '',
  algorithm: 'MD5'
})

const verifyResult = computed(() => {
  if (mode.value === 'verify' && form.input && form.hash) {
    const calculatedHash = calculateHash(form.input)
    return calculatedHash.toLowerCase() === form.hash.toLowerCase()
  }
  return false
})

// 计算哈希值
const calculateHash = (input: string) => {
  switch (algorithm.value) {
    case 'md5':
      return CryptoJS.MD5(input).toString()
    case 'sha1':
      return CryptoJS.SHA1(input).toString()
    case 'sha256':
      return CryptoJS.SHA256(input).toString()
    case 'sha512':
      return CryptoJS.SHA512(input).toString()
    default:
      return ''
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
        handleCalculate() // 文件内容加载后自动计算哈希值
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

const handleCalculate = async () => {
  if (!form.input) {
    form.output = ''
    return
  }

  try {
    if (mode.value === 'calculate') {
      const result = await hash(form.input, form.algorithm)
      form.output = result
      await addHistory({
        tool: 'hash',
        mode: 'generate',
        input: form.input,
        output: result,
        timestamp: Date.now(),
        params: {
          algorithm: form.algorithm
        }
      })
    } else {
      if (!form.hash) {
        ElMessage.warning('请输入要验证的哈希值')
        return
      }
      const calculatedHash = calculateHash(form.input)
      form.output = calculatedHash
    }
  } catch (error) {
    console.error('计算失败:', error)
    ElMessage.error('计算失败')
    form.output = ''
  }

  // 保存历史记录
  saveHistory()
}

const handleClear = () => {
  form.input = ''
  form.hash = ''
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
    a.download = `hash_${algorithm.value}_${Date.now()}.txt`
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
    history.value = await cryptoDB.getHistory('hash')
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

const saveHistory = async () => {
  if (!form.input || !form.output) return
  
  try {
    await cryptoDB.addHistory({
      tool: 'hash',
      mode: 'hash',
      input: form.input,
      output: form.output,
      algorithm: algorithm.value,
      timestamp: Date.now()
    })
    await loadHistory()
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

const useHistory = (item: CryptoHistory) => {
  form.input = item.input
  form.output = item.output
  algorithm.value = item.algorithm as 'md5' | 'sha1' | 'sha256' | 'sha512' || 'md5'
  showHistory.value = false
  handleCalculate()
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
    await cryptoDB.clearHistory('hash')
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
.hash-container {
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

    .hash-info {
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

      .mode-select {
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