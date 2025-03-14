<template>
  <div class="xml-page">
    <div class="page-header">
      <div class="header-title">
        <h2>XML 格式化</h2>
        <p class="header-desc">支持 XML 格式化、压缩和校验</p>
      </div>
      <div class="header-controls">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="format">格式化</el-radio-button>
          <el-radio-button label="compress">压缩</el-radio-button>
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
            <span>输入 XML</span>
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
              :placeholder="'请输入要处理的 XML 文本，或拖放文件到此处'"
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
          <el-form-item label="缩进空格数">
            <el-input-number
              v-model="options.indentSize"
              :min="0"
              :max="8"
              :step="2"
              :disabled="mode === 'compress'"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleProcess">
              {{ mode === 'format' ? '格式化' : '压缩' }}
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
import { parseXml, serializeXml } from '@/utils/xml'

const { copy, paste } = useClipboard()
const mode = ref<'format' | 'compress'>('format')
const input = ref('')
const output = ref('')

const options = reactive({
  indentSize: 2
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

// 处理输入变化
const handleInput = () => {
  if (input.value) {
    handleProcess()
  } else {
    output.value = ''
  }
}

// 处理格式化/压缩
const handleProcess = () => {
  if (!input.value) {
    ElMessage.warning('请输入要处理的 XML 文本')
    return
  }

  try {
    // 先尝试解析 XML
    const doc = parseXml(input.value)
    
    // 格式化或压缩
    output.value = serializeXml(doc, {
      indent: mode.value === 'format' ? ' '.repeat(options.indentSize) : '',
      newline: mode.value === 'format' ? '\n' : ''
    })
  } catch (error) {
    ElMessage.error('XML 格式错误，请检查输入')
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
    const text = await paste()
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
    const blob = new Blob([output.value], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xml_${mode.value === 'format' ? 'formatted' : 'compressed'}_${Date.now()}.xml`
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
.xml-page {
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