<template>
  <div class="convert-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>格式转换</h3>
        </div>
      </template>

      <div class="convert-content">
        <div class="controls-wrapper">
          <div class="mode-controls">
            <el-radio-group v-model="mode" size="small">
              <el-radio-button label="xml2json">XML 转 JSON</el-radio-button>
              <el-radio-button label="json2xml">JSON 转 XML</el-radio-button>
            </el-radio-group>
          </div>
          <div class="upload-control">
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

        <div class="editor-container">
          <div class="editor-section">
            <div class="section-header">
              <div class="section-title">{{ mode === 'xml2json' ? '输入 XML' : '输入 JSON' }}</div>
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
                :placeholder="mode === 'xml2json' ? '请输入要转换的 XML 文本，或拖放文件到此处' : '请输入要转换的 JSON 文本，或拖放文件到此处'"
                @input="handleInput"
              />
            </div>
            <div class="editor-footer">
              <span>字符数：{{ input.length }}</span>
            </div>
          </div>

          <div class="editor-section">
            <div class="section-header">
              <div class="section-title">{{ mode === 'xml2json' ? '输出 JSON' : '输出 XML' }}</div>
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
                :placeholder="'转换结果将显示在这里'"
              />
            </div>
            <div class="editor-footer">
              <span>字符数：{{ output.length }}</span>
            </div>
          </div>
        </div>

        <div class="options-panel">
          <div class="section-header">
            <div class="section-title">转换选项</div>
          </div>
          <div class="options-content">
            <el-form :model="options" label-width="120px" size="small">
              <el-form-item label="缩进空格数">
                <el-input-number
                  v-model="options.indentSize"
                  :min="0"
                  :max="8"
                  :step="2"
                />
              </el-form-item>
              <el-form-item label="排序键">
                <el-switch v-model="options.sortKeys" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleProcess">转换</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy, Delete } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { parseXml, serializeXml } from '@/utils/xml'
import { xml2json, json2xml } from '@/utils/convert'

const { copy } = useClipboard()
const mode = ref<'xml2json' | 'json2xml'>('xml2json')
const input = ref('')
const output = ref('')

const options = reactive({
  indentSize: 2,
  sortKeys: false
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

// 处理格式转换
const handleProcess = () => {
  if (!input.value) {
    ElMessage.warning('请输入要转换的文本')
    return
  }

  try {
    if (mode.value === 'xml2json') {
      // XML 转 JSON
      const result = xml2json(input.value)
      output.value = JSON.stringify(result, options.sortKeys ? Object.keys(result).sort() : null, options.indentSize)
    } else {
      // JSON 转 XML
      const obj = JSON.parse(input.value)
      output.value = json2xml(obj, {
        indent: options.indentSize > 0 ? ' '.repeat(options.indentSize) : '',
        newline: options.indentSize > 0 ? '\n' : ''
      })
    }
  } catch (error) {
    ElMessage.error('转换失败，请检查输入格式是否正确')
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
    const blob = new Blob([output.value], { type: mode.value === 'xml2json' ? 'application/json' : 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode.value === 'xml2json' ? `xml2json_${Date.now()}.json` : `json2xml_${Date.now()}.xml`
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
.convert-page {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  
  :deep(.el-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    
    .el-card__header {
      padding: 12px 20px;
      min-height: 40px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background-color: var(--el-fill-color-light);
      border-radius: 8px 8px 0 0;
    }
    
    .el-card__body {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .convert-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow-y: auto;
    gap: 20px;
    background-color: var(--el-bg-color);
  }

  .controls-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 4px;
  }

  .editor-container {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .editor-section, .options-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    background-color: var(--el-bg-color);
  }
  
  .options-panel {
    flex: 0 0 auto;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-align: left;
    }
  }

  .editor-area {
    flex: 1;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    :deep(.el-textarea) {
      height: 100%;
      
      .el-textarea__inner {
        height: 100%;
        border: none;
        resize: none;
        border-radius: 0;
        padding: 12px;
        font-family: monospace;
        line-height: 1.6;
      }
    }
  }

  .editor-footer {
    padding: 8px 12px;
    background-color: var(--el-fill-color-light);
    font-size: 12px;
    color: var(--el-text-color-secondary);
    display: flex;
    justify-content: space-between;
  }
  
  .options-content {
    padding: 16px;
  }
  
  .editor-controls {
    display: flex;
    gap: 8px;
    
    .el-button {
      padding: 6px 12px;
      
      .el-icon {
        margin-right: 0;
      }
    }
  }
}
</style> 