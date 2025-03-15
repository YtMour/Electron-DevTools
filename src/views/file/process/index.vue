<template>
  <div class="process-page">
    <div class="page-header">
      <div class="header-title">
        <h2>文件处理</h2>
        <p class="header-desc">支持文件编码转换、文本替换等操作</p>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="encode">编码转换</el-radio-button>
          <el-radio-button label="replace">文本替换</el-radio-button>
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
      <div class="editor-container">
        <div class="editor-section">
          <div class="editor-header">
            <span>输入文本</span>
            <div class="editor-controls">
              <el-button-group>
                <el-button size="small" @click="handleClearInput">
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button size="small" @click="handlePasteInput">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div
            class="editor-area"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent>
            <el-input
              v-model="input"
              type="textarea"
              :rows="12"
              :placeholder="'请输入要处理的文本，或拖放文件到此处'"
              @input="handleInput"
            />
          </div>
          <div class="editor-footer">
            <span>字符数：{{ input.length }}</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="editor-header">
            <span>输出结果</span>
            <div class="editor-controls">
              <el-button-group>
                <el-button size="small" @click="handleCopy">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button size="small" @click="handleDownload">
                  <el-icon><Download /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div class="editor-area">
            <el-input
              v-model="output"
              type="textarea"
              :rows="12"
              readonly
              :placeholder="'处理结果将显示在这里'"
            />
          </div>
          <div class="editor-footer">
            <span>字符数：{{ output.length }}</span>
          </div>
        </div>
      </div>

      <div class="options-panel">
        <el-form :model="options" label-width="120px" size="small">
          <template v-if="mode === 'encode'">
            <el-form-item label="输入编码">
              <el-select v-model="options.inputEncoding" placeholder="选择输入编码">
                <el-option label="UTF-8" value="utf-8" />
                <el-option label="GBK" value="gbk" />
                <el-option label="GB2312" value="gb2312" />
                <el-option label="Big5" value="big5" />
                <el-option label="Shift-JIS" value="shift-jis" />
                <el-option label="EUC-JP" value="euc-jp" />
                <el-option label="EUC-KR" value="euc-kr" />
              </el-select>
            </el-form-item>
            <el-form-item label="输出编码">
              <el-select v-model="options.outputEncoding" placeholder="选择输出编码">
                <el-option label="UTF-8" value="utf-8" />
                <el-option label="GBK" value="gbk" />
                <el-option label="GB2312" value="gb2312" />
                <el-option label="Big5" value="big5" />
                <el-option label="Shift-JIS" value="shift-jis" />
                <el-option label="EUC-JP" value="euc-jp" />
                <el-option label="EUC-KR" value="euc-kr" />
              </el-select>
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item label="查找文本">
              <el-input v-model="options.searchText" placeholder="请输入要查找的文本" />
            </el-form-item>
            <el-form-item label="替换文本">
              <el-input v-model="options.replaceText" placeholder="请输入要替换的文本" />
            </el-form-item>
            <el-form-item label="使用正则表达式">
              <el-switch v-model="options.useRegex" />
            </el-form-item>
            <el-form-item label="区分大小写">
              <el-switch v-model="options.caseSensitive" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" @click="handleProcess">
              {{ mode === 'encode' ? '转换编码' : '替换文本' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy, Delete } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'

const { copy } = useClipboard()
const mode = ref<'encode' | 'replace'>('encode')
const input = ref('')
const output = ref('')

const options = reactive({
  // 编码转换选项
  inputEncoding: 'utf-8',
  outputEncoding: 'utf-8',
  // 文本替换选项
  searchText: '',
  replaceText: '',
  useRegex: false,
  caseSensitive: false
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
        input.value = e.target.result as string
        handleProcess()
      }
    }
    reader.readAsText(file, options.inputEncoding)
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

// 处理输入变化
const handleInput = () => {
  if (input.value) {
    handleProcess()
  } else {
    output.value = ''
  }
}

// 处理文本
const handleProcess = () => {
  if (!input.value) {
    ElMessage.warning('请输入要处理的文本')
    return
  }

  try {
    if (mode.value === 'encode') {
      // 编码转换
      const decoder = new TextDecoder(options.inputEncoding)
      const encoder = new TextEncoder()
      const bytes = encoder.encode(input.value)
      output.value = decoder.decode(bytes)
    } else {
      // 文本替换
      if (!options.searchText) {
        ElMessage.warning('请输入要查找的文本')
        return
      }

      if (options.useRegex) {
        // 使用正则表达式
        try {
          const flags = options.caseSensitive ? 'g' : 'gi'
          const regex = new RegExp(options.searchText, flags)
          output.value = input.value.replace(regex, options.replaceText)
        } catch (error) {
          ElMessage.error('正则表达式格式错误')
          return
        }
      } else {
        // 普通文本替换
        const flags = options.caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(options.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
        output.value = input.value.replace(regex, options.replaceText)
      }
    }
  } catch (error) {
    ElMessage.error('处理失败')
    output.value = ''
  }
}

// 清空输入
const handleClearInput = () => {
  input.value = ''
  output.value = ''
}

// 粘贴输入
const handlePasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText()
    input.value = text
    handleProcess()
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 复制结果
const handleCopy = async () => {
  if (!output.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await copy(output.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载结果
const handleDownload = () => {
  if (!output.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }

  try {
    const blob = new Blob([output.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `processed_${Date.now()}.txt`
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
.process-page {
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
    display: flex;
    gap: 24px;
  }

  .editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;
    border: 1px solid var(--el-border-color);
  }

  .editor-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--el-fill-color-light);
  }

  .editor-area {
    flex: 1;
    padding: 12px;

    :deep(.el-textarea__inner) {
      font-family: monospace;
    }
  }

  .editor-footer {
    padding: 8px 12px;
    border-top: 1px solid var(--el-border-color);
    color: var(--el-text-color-secondary);
    font-size: 12px;
    background-color: var(--el-fill-color-light);
  }

  .options-panel {
    width: 280px;
    padding: 16px;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;
    border: 1px solid var(--el-border-color);
  }

  .upload-btn {
    display: inline-block;
    
    :deep(.el-upload) {
      display: block;
    }
  }
}
</style> 