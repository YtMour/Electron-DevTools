<template>
  <div class="hash-page">
    <div class="page-header">
      <div class="header-title">
        <h2>Hash 计算器</h2>
        <p class="header-desc">支持 MD5、SHA-1、SHA-256、SHA-512 等多种哈希算法</p>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="calculate">计算</el-radio-button>
          <el-radio-button label="verify">验证</el-radio-button>
        </el-radio-group>
        <el-select v-model="algorithm" placeholder="选择算法">
          <el-option label="MD5" value="md5" />
          <el-option label="SHA-1" value="sha1" />
          <el-option label="SHA-256" value="sha256" />
          <el-option label="SHA-512" value="sha512" />
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
            :rows="mode === 'verify' ? 3 : 3"
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
        handleCalculate()
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
  if (form.input) {
    handleCalculate()
  } else {
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
.hash-page {
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