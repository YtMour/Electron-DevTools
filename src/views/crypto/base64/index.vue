<template>
  <div class="base64-page">
    <div class="page-header">
      <div class="header-title">
        <h2>Base64 编解码</h2>
        <p class="header-desc">支持文本和文件的 Base64 编码与解码，支持中文字符</p>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="encode">编码</el-radio-button>
          <el-radio-button label="decode">解码</el-radio-button>
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
              :placeholder="mode === 'encode' ? '请输入要编码的文本，或拖放文件到此处' : '请输入要解码的 Base64 文本'"
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
            :placeholder="mode === 'encode' ? '编码结果' : '解码结果'"
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
            <el-button type="primary" @click="handleConvert">转换</el-button>
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
import { Upload, Download, DocumentCopy, Delete } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import * as DiffLib from 'diff'

const { copy } = useClipboard()
const mode = ref<'encode' | 'decode'>('encode')

const form = reactive({
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

    if (mode.value === 'encode') {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64String = (e.target.result as string).split(',')[1]
          form.input = base64String
          handleConvert()
        }
      }
      reader.readAsDataURL(file)
    } else {
      const text = await file.text()
      form.input = text
      handleConvert()
    }
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
    handleConvert()
  } else {
    form.output = ''
  }
}

const handleConvert = () => {
  if (!form.input) {
    form.output = ''
    return
  }

  try {
    if (mode.value === 'encode') {
      form.output = btoa(unescape(encodeURIComponent(form.input)))
    } else {
      form.output = decodeURIComponent(escape(atob(form.input)))
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
    const blob = new Blob([form.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base64_${mode.value === 'encode' ? 'encoded' : 'decoded'}_${Date.now()}.txt`
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
    return ''
  }

  try {
    const diff = DiffLib.diffLines(leftText.value, rightText.value)
    let html = ''

    for (const part of diff) {
      const color = part.added ? 'var(--el-color-success-light-9)' :
                   part.removed ? 'var(--el-color-danger-light-9)' :
                   'transparent'
      const borderColor = part.added ? 'var(--el-color-success)' :
                         part.removed ? 'var(--el-color-danger)' :
                         'transparent'
      html += `<div style="background-color: ${color}; border-left: 2px solid ${borderColor}; padding: 0 8px;">${
        part.value.replace(/\n$/, '')
          .split('\n')
          .map((line: string) => line || '&nbsp;')
          .join('\n')
      }</div>`
    }

    return html
  } catch (error) {
    ElMessage.error('差异对比失败')
    return ''
  }
})
</script>

<style lang="scss" scoped>
.base64-page {
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