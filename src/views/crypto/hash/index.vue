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
              </el-button-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleCalculate">
              {{ mode === 'calculate' ? '计算' : '验证' }}
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
import { Upload, DocumentCopy } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import CryptoJS from 'crypto-js'

const { copy } = useClipboard()
const mode = ref<'calculate' | 'verify'>('calculate')
const algorithm = ref<'md5' | 'sha1' | 'sha256' | 'sha512'>('md5')

const form = reactive({
  input: '',
  hash: '',
  output: ''
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

const handleCalculate = () => {
  if (!form.input) {
    form.output = ''
    return
  }

  try {
    if (mode.value === 'calculate') {
      form.output = calculateHash(form.input)
    } else {
      if (!form.hash) {
        ElMessage.warning('请输入要验证的哈希值')
        return
      }
      const calculatedHash = calculateHash(form.input)
      form.output = calculatedHash
    }
  } catch (error) {
    ElMessage.error('计算失败')
    form.output = ''
  }
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
</script>

<style lang="scss" scoped>
.hash-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: 20px;

    h2 {
      margin-bottom: 12px;
      color: var(--el-text-color-primary);
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

    .input-area {
      width: 100%;
      border: 2px dashed var(--el-border-color);
      border-radius: 4px;
      transition: all 0.3s;
      background-color: var(--el-input-bg-color, var(--el-fill-color-blank));

      :deep(.el-textarea__inner) {
        border: none;
        background-color: transparent;
        
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

  :deep(.el-radio-button__inner) {
    background-color: var(--el-button-bg-color, var(--el-fill-color-blank));
    color: var(--el-text-color-regular);
    border-color: var(--el-border-color);

    &:hover {
      color: var(--el-color-primary);
    }
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    border-color: var(--el-color-primary);
  }

  :deep(.el-button) {
    background-color: var(--el-button-bg-color, var(--el-fill-color-blank));
    border-color: var(--el-border-color);
    color: var(--el-text-color-regular);

    &:not(.is-disabled):hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &.el-button--primary {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);

      &:not(.is-disabled):hover {
        background-color: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
        color: var(--el-color-white);
      }
    }
  }

  :deep(.el-tag) {
    background-color: var(--el-fill-color-blank);
    border-color: var(--el-border-color);

    &.el-tag--success {
      background-color: var(--el-color-success-light-9);
      border-color: var(--el-color-success-light-5);
      color: var(--el-color-success);
    }

    &.el-tag--danger {
      background-color: var(--el-color-danger-light-9);
      border-color: var(--el-color-danger-light-5);
      color: var(--el-color-danger);
    }
  }
}
</style> 