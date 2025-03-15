<template>
  <div class="compare-page">
    <div class="page-header">
      <div class="header-title">
        <h2>文件比较</h2>
        <p class="header-desc">支持文本文件内容比较和差异高亮</p>
      </div>
      <div class="header-controls">
        <el-button-group>
          <el-tooltip content="上传左侧文件">
            <el-upload
              class="upload-btn"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleLeftFileChange">
              <el-button type="primary" plain>
                <el-icon><Upload /></el-icon> 左侧
              </el-button>
            </el-upload>
          </el-tooltip>
          <el-tooltip content="上传右侧文件">
            <el-upload
              class="upload-btn"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleRightFileChange">
              <el-button type="primary" plain>
                <el-icon><Upload /></el-icon> 右侧
              </el-button>
            </el-upload>
          </el-tooltip>
        </el-button-group>
      </div>
    </div>

    <div class="page-content">
      <div class="editor-container">
        <div class="editor-section">
          <div class="editor-header">
            <span>左侧文本</span>
            <div class="editor-controls">
              <el-button-group>
                <el-button size="small" @click="handleClearLeft">
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button size="small" @click="handlePasteLeft">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div
            class="editor-area"
            @drop.prevent="(e) => handleDrop(e, 'left')"
            @dragover.prevent
            @dragenter.prevent>
            <el-input
              v-model="leftText"
              type="textarea"
              :rows="20"
              :placeholder="'请输入或拖放左侧文本文件'"
              @input="handleInput"
            />
          </div>
          <div class="editor-footer">
            <span>字符数：{{ leftText.length }}</span>
          </div>
        </div>

        <div class="editor-section">
          <div class="editor-header">
            <span>右侧文本</span>
            <div class="editor-controls">
              <el-button-group>
                <el-button size="small" @click="handleClearRight">
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button size="small" @click="handlePasteRight">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div
            class="editor-area"
            @drop.prevent="(e) => handleDrop(e, 'right')"
            @dragover.prevent
            @dragenter.prevent>
            <el-input
              v-model="rightText"
              type="textarea"
              :rows="20"
              :placeholder="'请输入或拖放右侧文本文件'"
              @input="handleInput"
            />
          </div>
          <div class="editor-footer">
            <span>字符数：{{ rightText.length }}</span>
          </div>
        </div>
      </div>

      <div class="diff-panel">
        <div class="diff-header">
          <span>差异对比</span>
          <div class="diff-controls">
            <el-button-group>
              <el-button size="small" @click="handleCopyDiff">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
              <el-button size="small" @click="handleDownloadDiff">
                <el-icon><Download /></el-icon>
              </el-button>
            </el-button-group>
          </div>
        </div>
        <div class="diff-content">
          <pre v-if="diffResult" class="diff-result" v-html="diffResult"></pre>
          <div v-else class="diff-placeholder">
            <el-empty description="请输入要比较的文本" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy, Delete } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadFiles, UploadRawFile } from 'element-plus'
import type { CustomFile } from '@/types/upload'
import { diffLines } from 'diff'

const { copy } = useClipboard()
const leftFile = ref<UploadFile | null>(null)
const rightFile = ref<UploadFile | null>(null)
const leftText = ref('')
const rightText = ref('')

// 处理左侧文件上传
const handleLeftFileChange = (uploadFile: UploadFile) => {
  handleFileChange(uploadFile, 'left')
}

// 处理右侧文件上传
const handleRightFileChange = (uploadFile: UploadFile) => {
  handleFileChange(uploadFile, 'right')
}

// 处理文件上传
const handleFileChange = async (uploadFile: UploadFile, side: 'left' | 'right') => {
  try {
    const file = uploadFile.raw as File
    if (!file) {
      ElMessage.error('文件处理失败')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        const content = e.target.result as string
        if (side === 'left') {
          leftText.value = content
          leftFile.value = uploadFile
        } else {
          rightText.value = content
          rightFile.value = uploadFile
        }
      }
    }
    reader.readAsText(file)
  } catch (error) {
    ElMessage.error('文件处理失败')
  }
}

// 处理文件拖放
const handleDrop = async (e: DragEvent, side: 'left' | 'right') => {
  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files?.length) {
    const file = files[0]
    const timestamp = Date.now()
    const rawFile = Object.assign(file, { uid: timestamp }) as UploadRawFile
    
    const uploadFile: UploadFile = {
      name: file.name,
      uid: timestamp,
      status: 'success',
      raw: rawFile
    }
    
    handleFileChange(uploadFile, side)
  }
}

// 处理输入变化
const handleInput = () => {
  // 输入变化时自动更新差异对比
}

// 清空左侧文本
const handleClearLeft = () => {
  leftText.value = ''
}

// 清空右侧文本
const handleClearRight = () => {
  rightText.value = ''
}

// 粘贴左侧文本
const handlePasteLeft = async () => {
  try {
    const text = await navigator.clipboard.readText()
    leftText.value = text
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 粘贴右侧文本
const handlePasteRight = async () => {
  try {
    const text = await navigator.clipboard.readText()
    rightText.value = text
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 计算差异结果
const diffResult = computed(() => {
  if (!leftText.value && !rightText.value) {
    return ''
  }

  try {
    const diff = diffLines(leftText.value, rightText.value)
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

// 复制差异结果
const handleCopyDiff = async () => {
  if (!diffResult.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    // 创建一个临时元素来获取纯文本内容
    const temp = document.createElement('div')
    temp.innerHTML = diffResult.value
    const text = temp.textContent || temp.innerText
    await copy(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载差异结果
const handleDownloadDiff = () => {
  if (!diffResult.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }

  try {
    // 创建一个临时元素来获取纯文本内容
    const temp = document.createElement('div')
    temp.innerHTML = diffResult.value
    const text = temp.textContent || temp.innerText

    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff_${Date.now()}.txt`
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
.compare-page {
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
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .editor-container {
    display: flex;
    gap: 24px;
    min-height: 0;
    flex: 1;
  }

  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    box-shadow: var(--el-box-shadow-light);
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

  .diff-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    box-shadow: var(--el-box-shadow-light);
    min-height: 0;
  }

  .diff-header {
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--el-fill-color-light);
  }

  .diff-content {
    flex: 1;
    padding: 12px;
    overflow: auto;
  }

  .diff-result {
    margin: 0;
    font-family: monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .diff-placeholder {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-btn {
    display: inline-block;
    
    :deep(.el-upload) {
      display: block;
    }
  }
}
</style> 