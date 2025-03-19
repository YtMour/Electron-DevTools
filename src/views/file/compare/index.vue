<template>
  <div class="compare-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>文本对比</h3>
        </div>
      </template>

      <div class="compare-content">
        <!-- 操作指引提示 -->
        <el-alert
          v-if="!leftText && !rightText"
          type="info"
          show-icon
          :closable="false"
          class="guide-alert">
          <template #title>
            <span class="alert-title">使用指南</span>
          </template>
          <div class="alert-content">
            <p><b>输入方式：</b></p>
            <p>1. <b>文件上传模式</b>：通过拖拽文件或点击上传按钮添加文本文件</p>
            <p>2. <b>手动输入模式</b>：直接在文本框中输入或从剪贴板粘贴内容</p>
            <p><b>对比操作：</b></p>
            <p>3. 选择对比类型和显示方式，系统会自动显示差异结果</p>
            <p>4. 您可以随时使用界面上的<b>清空</b>按钮重置内容</p>
            <p><b>差异显示：</b></p>
            <p>5. 支持三种显示模式：背景高亮、文字颜色和混合模式</p>
            <p>6. 绿色表示新增内容，红色表示删除内容</p>
          </div>
        </el-alert>

        <!-- 输入模式切换 -->
        <div class="input-mode-switcher">
          <div class="mode-title">输入模式：</div>
          <div class="mode-buttons">
            <el-radio-group v-model="inputMode" size="default" @change="handleInputModeChange">
              <el-radio-button label="upload">
                <el-icon><Upload /></el-icon>
                文件上传
              </el-radio-button>
              <el-radio-button label="manual">
                <el-icon><EditPen /></el-icon>
                手动输入
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="global-actions">
            <el-button 
              type="danger" 
              class="clear-button"
              size="small" 
              @click="handleClearAll" 
              :disabled="!leftText && !rightText">
              <el-icon><Delete /></el-icon>
              清空所有
            </el-button>
          </div>
        </div>
        
        <!-- 增强上传区域 -->
        <div class="upload-section" v-if="inputMode === 'upload'">
          <div class="upload-container" :class="{'has-files': leftText || rightText}">
            <div class="upload-item">
              <el-upload
                class="text-uploader"
                drag
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleLeftFileChange">
                <template #trigger>
                  <div class="upload-area">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="upload-text">
                      <span class="upload-title">左侧文本</span>
                      <div class="upload-desc">
                        拖拽文件到此处或<em>点击上传</em>
                      </div>
                    </div>
                  </div>
                </template>
              </el-upload>
              <div v-if="leftFile" class="file-info">
                <el-tag size="small" type="info">{{ leftFile.name }}</el-tag>
                <el-button type="danger" class="clear-button" size="small" @click="handleClearLeft">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
            
            <div class="upload-separator">
              <el-divider direction="vertical" />
            </div>
            
            <div class="upload-item">
              <el-upload
                class="text-uploader"
                drag
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleRightFileChange">
                <template #trigger>
                  <div class="upload-area">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="upload-text">
                      <span class="upload-title">右侧文本</span>
                      <div class="upload-desc">
                        拖拽文件到此处或<em>点击上传</em>
                      </div>
                    </div>
                  </div>
                </template>
              </el-upload>
              <div v-if="rightFile" class="file-info">
                <el-tag size="small" type="info">{{ rightFile.name }}</el-tag>
                <el-button type="danger" class="clear-button" size="small" @click="handleClearRight">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 手动输入区域 -->
        <div class="manual-input-section" v-if="inputMode === 'manual'">
          <div class="manual-input-container">
            <div class="manual-input-item">
              <div class="manual-input-header">
                <span class="manual-input-title">左侧文本</span>
                <el-button 
                  type="primary" 
                  class="paste-button"
                  size="small"
                  @click="handlePasteLeft">
                  <el-icon><DocumentCopy /></el-icon>
                  从剪贴板粘贴
                </el-button>
              </div>
              <div class="manual-input-area">
                <el-input
                  v-model="leftText"
                  type="textarea"
                  :rows="10"
                  placeholder="请在此输入或粘贴左侧文本内容"
                  @input="debouncedCompare"
                />
              </div>
            </div>
            
            <div class="input-separator">
              <el-divider direction="vertical" />
            </div>
            
            <div class="manual-input-item">
              <div class="manual-input-header">
                <span class="manual-input-title">右侧文本</span>
                <el-button 
                  type="primary"
                  class="paste-button" 
                  size="small"
                  @click="handlePasteRight">
                  <el-icon><DocumentCopy /></el-icon>
                  从剪贴板粘贴
                </el-button>
              </div>
              <div class="manual-input-area">
                <el-input
                  v-model="rightText"
                  type="textarea"
                  :rows="10"
                  placeholder="请在此输入或粘贴右侧文本内容"
                  @input="debouncedCompare"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 对比选项区域 -->
        <div class="compare-options" v-if="leftText || rightText">
          <div class="section-header">
            <div class="section-title">对比选项</div>
          </div>
          <div class="options-content">
            <div class="options-row">
              <div class="option-item">
                <span class="option-label">对比类型</span>
                <el-radio-group v-model="compareMode" size="small">
                  <el-radio-button label="line">逐行对比</el-radio-button>
                  <el-radio-button label="word">逐词对比</el-radio-button>
                  <el-radio-button label="char">逐字对比</el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="option-item">
                <span class="option-label">显示方式</span>
                <el-radio-group v-model="displayMode" size="small">
                  <el-radio-button label="background">背景高亮</el-radio-button>
                  <el-radio-button label="text">文字颜色</el-radio-button>
                  <el-radio-button label="mixed">混合模式</el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="option-item">
                <span class="option-label">忽略大小写</span>
                <el-switch v-model="ignoreCase" />
              </div>
              
              <div class="option-item">
                <span class="option-label">忽略空白</span>
                <el-switch v-model="ignoreWhitespace" />
              </div>
              
              <div class="option-item action-buttons">
                <el-button type="primary" size="small" @click="handleCompare">
                  <el-icon><RefreshRight /></el-icon>
                  比较
                </el-button>
                <el-button type="danger" class="clear-button" size="small" @click="handleClearAll">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑区域 -->
        <div class="editor-container" v-if="leftText || rightText">
          <div class="editor-section">
            <div class="section-header">
              <div class="section-title">左侧文本</div>
              <div class="editor-controls">
                <span class="editor-info">{{ leftText.length }} 字符</span>
                <el-button-group>
                  <el-button size="small" @click="handlePasteLeft" title="粘贴">
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
                :rows="12"
                :placeholder="'请输入或拖放左侧文本文件'"
                @input="debouncedCompare"
              />
            </div>
          </div>

          <div class="editor-section">
            <div class="section-header">
              <div class="section-title">右侧文本</div>
              <div class="editor-controls">
                <span class="editor-info">{{ rightText.length }} 字符</span>
                <el-button-group>
                  <el-button size="small" @click="handlePasteRight" title="粘贴">
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
                :rows="12"
                :placeholder="'请输入或拖放右侧文本文件'"
                @input="debouncedCompare"
              />
            </div>
          </div>
        </div>

        <!-- 差异结果区域 -->
        <div class="diff-panel" v-if="leftText && rightText">
          <div class="section-header">
            <div class="section-title">差异对比</div>
            <div class="diff-controls">
              <div class="diff-stats" v-if="diffStat">
                <el-tag type="success" size="small">+{{ diffStat.additions }}</el-tag>
                <el-tag type="danger" size="small">-{{ diffStat.deletions }}</el-tag>
                <el-tag type="info" size="small">={{ diffStat.unchanged }}</el-tag>
              </div>
              <el-button-group>
                <el-button size="small" @click="handleCopyDiff" title="复制差异结果">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
                <el-button size="small" @click="handleDownloadDiff" title="下载差异结果">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" @click="showLineNumbers = !showLineNumbers" :type="showLineNumbers ? 'primary' : 'default'" title="显示/隐藏行号">
                  <el-icon><Operation /></el-icon>
                  行号
                </el-button>
              </el-button-group>
            </div>
          </div>
          <div class="diff-content">
            <div v-if="comparing" class="diff-loading">
              <el-loading :visible="true" element-loading-text="正在分析差异..." />
            </div>
            <div v-else-if="diffResult" class="diff-result" :class="{'with-line-numbers': showLineNumbers}">
              <div class="diff-legend">
                <div class="legend-item">
                  <span class="legend-color addition"></span>
                  <span class="legend-text">新增内容</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color deletion"></span>
                  <span class="legend-text">删除内容</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color unchanged"></span>
                  <span class="legend-text">未变内容</span>
                </div>
                <div class="legend-item">
                  <span class="legend-label">显示模式:</span>
                  <span class="legend-text">{{ 
                    displayMode === 'background' ? '背景高亮' : 
                    displayMode === 'text' ? '文字颜色' : '混合模式' 
                  }}</span>
                </div>
              </div>
              <div v-html="diffResult"></div>
            </div>
            <div v-else class="diff-placeholder">
              <el-empty description="请输入要比较的文本" />
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Download, DocumentCopy, Delete, RefreshRight, Operation, UploadFilled, EditPen } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { diffLines, diffWords, diffChars, Change } from 'diff'
import { debounce } from 'lodash-es'

interface DiffStat {
  additions: number;
  deletions: number;
  unchanged: number;
}

const { copy } = useClipboard()
const leftFile = ref<UploadFile | null>(null)
const rightFile = ref<UploadFile | null>(null)
const leftText = ref('')
const rightText = ref('')
const compareMode = ref<'line' | 'word' | 'char'>('line')
const displayMode = ref<'background' | 'text' | 'mixed'>('background')
const ignoreCase = ref(false)
const ignoreWhitespace = ref(false)
const showLineNumbers = ref(true)
const comparing = ref(false)
const diffStat = ref<DiffStat | null>(null)
const inputMode = ref<'upload' | 'manual'>('upload')

// 防抖处理对比函数
const debouncedCompare = debounce(() => {
  if (leftText.value && rightText.value) {
    handleCompare()
  }
}, 1000)

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

    if (file.size > 1024 * 1024 * 5) { // 5MB限制
      ElMessage.warning('文件过大，可能会影响性能')
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
        // 自动进行对比
        if (leftText.value && rightText.value) {
          handleCompare()
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

// 清空左侧文本
const handleClearLeft = () => {
  leftText.value = ''
  leftFile.value = null
}

// 清空右侧文本
const handleClearRight = () => {
  rightText.value = ''
  rightFile.value = null
}

// 清空所有
const handleClearAll = () => {
  handleClearLeft()
  handleClearRight()
  diffStat.value = null
  diffResult.value = ''
  ElMessage.success('已清空所有内容')
}

// 粘贴左侧文本
const handlePasteLeft = async () => {
  try {
    const text = await navigator.clipboard.readText()
    leftText.value = text
    if (leftText.value && rightText.value) {
      handleCompare()
    }
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 粘贴右侧文本
const handlePasteRight = async () => {
  try {
    const text = await navigator.clipboard.readText()
    rightText.value = text
    if (leftText.value && rightText.value) {
      handleCompare()
    }
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 执行差异对比
const handleCompare = async () => {
  if (!leftText.value || !rightText.value) {
    ElMessage.warning('请先输入左右两侧文本')
    return
  }
  
  comparing.value = true
  await nextTick()
  
  try {
    // 处理对比选项
    let left = leftText.value
    let right = rightText.value
    
    if (ignoreCase.value) {
      left = left.toLowerCase()
      right = right.toLowerCase()
    }
    
    if (ignoreWhitespace.value) {
      left = left.replace(/\s+/g, ' ').trim()
      right = right.replace(/\s+/g, ' ').trim()
    }
    
    // 选择对比方法
    let diff: Change[]
    if (compareMode.value === 'line') {
      diff = diffLines(left, right)
    } else if (compareMode.value === 'word') {
      diff = diffWords(left, right)
    } else {
      diff = diffChars(left, right)
    }
    
    // 计算差异统计
    const stat = {
      additions: 0,
      deletions: 0,
      unchanged: 0
    }
    
    // 生成差异HTML
    let html = ''
    let lineNumber = 1
    
    for (const part of diff) {
      const type = part.added ? 'addition' : part.removed ? 'deletion' : 'unchanged'
      const lines = part.value.split('\n')
      
      if (type === 'addition') {
        stat.additions += part.count || 0
      } else if (type === 'deletion') {
        stat.deletions += part.count || 0
      } else {
        stat.unchanged += part.count || 0
      }
      
      // 根据显示模式设置样式类
      const styleClass = `${type} ${displayMode.value}-mode`
      
      // 生成HTML，添加行号支持
      if (compareMode.value === 'line') {
        for (let i = 0; i < lines.length; i++) {
          const isLastLine = i === lines.length - 1 && lines[i] === ''
          if (!isLastLine) {
            const lineContent = lines[i] || '&nbsp;'
            html += `<div class="diff-line ${styleClass}">
              ${showLineNumbers.value ? `<span class="line-number">${lineNumber}</span>` : ''}
              <span class="line-content">${lineContent}</span>
            </div>`
            lineNumber++
          }
        }
      } else {
        html += `<span class="${styleClass}">${part.value}</span>`
      }
    }
    
    diffStat.value = stat
    diffResult.value = html
  } catch (error) {
    console.error('对比失败:', error)
    ElMessage.error('文本对比失败')
  } finally {
    comparing.value = false
  }
}

const diffResult = ref('')

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

// 监听模式变更
watch([compareMode, displayMode, ignoreCase, ignoreWhitespace], () => {
  if (leftText.value && rightText.value) {
    handleCompare()
  }
})

// 处理输入模式切换
const handleInputModeChange = (mode: 'upload' | 'manual') => {
  // 使用Element Plus的消息提示
  ElMessage({
    message: mode === 'upload' ? '已切换到文件上传模式' : '已切换到手动输入模式',
    type: 'success',
    duration: 2000,
    showClose: true,
    offset: 80
  })
}
</script>

<style lang="scss" scoped>
.compare-page {
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
  
  .compare-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow-y: auto;
    gap: 20px;
    background-color: var(--el-bg-color);
  }

  // 上传区域样式改进
  .upload-section {
    margin-bottom: 16px;
  }
  
  .guide-alert {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    
    :deep(.el-alert__content) {
      padding: 12px 16px;
    }
    
    :deep(.el-alert__title) {
      font-size: 16px;
      font-weight: 600;
    }
    
    :deep(.el-alert__icon) {
      margin-top: 7px;
      font-size: 18px;
    }
    
    .alert-content {
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
      
      p {
        margin: 4px 0;
      }
      
      b {
        color: var(--el-text-color-primary);
        font-weight: 600;
      }
    }
  }
  
  .upload-container {
    display: flex;
    align-items: stretch;
    width: 100%;
    transition: all 0.3s ease;
    
    &.has-files {
      max-height: 180px;
    }
  }
  
  .upload-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .file-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
      padding: 0 16px;
      
      .el-tag {
        padding: 6px 10px;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .el-button {
        font-weight: 500;
        transition: all 0.3s ease;
        border-radius: 4px;
        padding: 6px 12px;
        height: auto;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .el-icon {
          margin-right: 4px;
          font-size: 16px;
        }
      }
    }
  }
  
  .upload-separator {
    display: flex;
    align-items: center;
    padding: 0 16px;
    
    .el-divider {
      height: 80%;
    }
  }
  
  .text-uploader {
    width: 100%;
    
    :deep(.el-upload) {
      width: 100%;
      display: block;
    }
    
    :deep(.el-upload-dragger) {
      width: 100%;
      height: auto;
      min-height: 160px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.3s ease;
      border: 2px dashed var(--el-border-color);
      background-color: var(--el-fill-color-light);
      border-radius: 8px;
      
      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
  
  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .el-icon--upload {
      font-size: 32px;
      color: var(--el-color-primary);
      margin-bottom: 16px;
    }
    
    .upload-text {
      text-align: center;
      
      .upload-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        display: block;
      }
      
      .upload-desc {
        font-size: 14px;
        color: var(--el-text-color-regular);
        
        em {
          color: var(--el-color-primary);
          font-style: normal;
          font-weight: 500;
        }
      }
    }
  }

  // 选项区域样式
  .compare-options {
    width: 100%;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    background-color: var(--el-bg-color);
  }
  
  .options-content {
    padding: 16px;
  }
  
  .options-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
  
  .option-item {
    display: flex;
    align-items: center;
    
    .option-label {
      margin-right: 12px;
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
    
    &.action-buttons {
      margin-left: auto;
      display: flex;
      gap: 8px;
      
      .el-button {
        font-weight: 500;
        transition: all 0.3s ease;
        border-radius: 4px;
        padding: 6px 12px;
        height: auto;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .el-icon {
          margin-right: 4px;
          font-size: 16px;
        }
      }
      
      @media (max-width: 768px) {
        margin-left: 0;
        width: 100%;
        justify-content: flex-end;
      }
    }
  }

  // 编辑器区域样式
  .editor-container {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .editor-section, .diff-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    background-color: var(--el-bg-color);
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

  .editor-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .editor-info {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
    
    .el-button {
      padding: 6px 12px;
      height: auto;
      
      .el-icon {
        margin-right: 0;
        font-size: 16px;
      }
      
      &:hover {
        transform: translateY(-2px);
      }
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

  // 差异显示区域改进
  .diff-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .diff-stats {
      display: flex;
      gap: 8px;
      
      .el-tag {
        padding: 0 8px;
      }
    }
    
    .el-button-group {
      display: flex;
      
      .el-button {
        font-weight: 500;
        transition: all 0.3s ease;
        padding: 6px 12px;
        height: auto;
        
        &:hover {
          transform: translateY(-2px);
          z-index: 1;
        }
        
        .el-icon {
          margin-right: 4px;
          font-size: 16px;
        }
      }
    }
  }

  .diff-content {
    flex: 1;
    overflow-y: auto;
    position: relative;
    
    .diff-legend {
      display: flex;
      gap: 16px;
      padding: 12px 16px;
      background-color: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          
          &.addition {
            background-color: var(--el-color-success-light-9);
            border-left: 3px solid var(--el-color-success);
          }
          
          &.deletion {
            background-color: var(--el-color-danger-light-9);
            border-left: 3px solid var(--el-color-danger);
          }
          
          &.unchanged {
            background-color: transparent;
            border-left: 3px solid transparent;
          }
        }
        
        
        .legend-text {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .diff-result {
      padding: 0;
      margin: 0;
      font-family: monospace;
      line-height: 1.6;
      
      &.with-line-numbers {
        .diff-line {
          display: flex;
          
          .line-number {
            flex-shrink: 0;
            width: 40px;
            text-align: right;
            padding-right: 8px;
            color: var(--el-text-color-secondary);
            border-right: 1px solid var(--el-border-color-lighter);
            margin-right: 8px;
            user-select: none;
          }
          
          .line-content {
            flex: 1;
            min-width: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
      }
      
      .diff-line {
        padding: 2px 16px;
        white-space: pre-wrap;
        word-break: break-all;
      }
      
      // 背景高亮模式
      .addition.background-mode {
        background-color: var(--el-color-success-light-9);
        border-left: 3px solid var(--el-color-success);
      }
      
      .deletion.background-mode {
        background-color: var(--el-color-danger-light-9);
        border-left: 3px solid var(--el-color-danger);
      }
      
      .unchanged.background-mode {
        border-left: 3px solid transparent;
      }
      
      // 文字颜色模式
      .addition.text-mode {
        color: var(--el-color-success);
        font-weight: bold;
        background-color: transparent;
        border-left: 3px solid var(--el-color-success-light-5);
      }
      
      .deletion.text-mode {
        color: var(--el-color-danger);
        font-weight: bold;
        background-color: transparent;
        border-left: 3px solid var(--el-color-danger-light-5);
        text-decoration: line-through;
      }
      
      .unchanged.text-mode {
        border-left: 3px solid transparent;
      }
      
      // 混合模式
      .addition.mixed-mode {
        color: var(--el-color-success-dark-2);
        background-color: var(--el-color-success-light-9);
        font-weight: bold;
        border-left: 3px solid var(--el-color-success);
        text-decoration: underline;
      }
      
      .deletion.mixed-mode {
        color: var(--el-color-danger-dark-2);
        background-color: var(--el-color-danger-light-9);
        font-weight: bold;
        border-left: 3px solid var(--el-color-danger);
        text-decoration: line-through;
      }
      
      .unchanged.mixed-mode {
        border-left: 3px solid transparent;
      }
    }
    
    .diff-placeholder {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    
    .diff-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .alert-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    
    p {
      margin: 4px 0;
    }
  }
  
  .alert-title {
    font-weight: bold;
    font-size: 15px;
  }

  // 输入模式切换样式
  .input-mode-switcher {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 16px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .mode-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-regular);
      margin-right: 8px;
    }
    
    .mode-buttons {
      display: flex;
      flex-grow: 1;
    }
    
    .global-actions {
      display: flex;
      align-items: center;
      margin-left: auto;
      
      @media (max-width: 768px) {
        margin-left: 0;
        margin-top: 12px;
        width: 100%;
      }
      
      .clear-button {
        padding: 6px 12px;
      }
    }
    
    .el-radio-group {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      background-color: white;
    }
    
    :deep(.el-radio-button) {
      min-width: 130px;
      text-align: center;
      position: relative;
      
      &:first-child {
        .el-radio-button__inner {
          border-radius: 4px 0 0 4px;
        }
      }
      
      &:not(:first-child)::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 1px;
        height: 100%;
        background-color: var(--el-border-color);
        z-index: 1;
      }
      
      &:last-child .el-radio-button__inner {
        border-radius: 0 4px 4px 0;
      }
    }
    
    :deep(.el-radio-button__inner) {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 16px;
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid var(--el-border-color);
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      
      .el-icon {
        margin-right: 0;
        font-size: 14px;
      }
    }
    
    :deep(.el-radio-button__original) {
      opacity: 0;
    }
    
    :deep(.el-radio-button.is-active) {
      &::before {
        background-color: var(--el-color-primary);
        z-index: 2;
      }
      
      .el-radio-button__inner {
        box-shadow: none !important;
        background-color: var(--el-color-primary);
        color: white;
        border-color: var(--el-color-primary);
        z-index: 2;
      }
    }
    
    :deep(.el-radio-button:not(.is-active):hover) {
      z-index: 1;
      
      .el-radio-button__inner {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary-light-5);
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
  
  // 手动输入区域样式
  .manual-input-section {
    margin-bottom: 16px;
  }
  
  .manual-input-container {
    display: flex;
    align-items: stretch;
    width: 100%;
    gap: 16px;
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  
  .manual-input-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--el-bg-color);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    
    .manual-input-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      .manual-input-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      
      .el-button {
        font-weight: 500;
        transition: all 0.3s ease;
        border-radius: 4px;
        padding: 6px 12px;
        height: auto;
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: white;
        }
        
        .el-icon {
          margin-right: 4px;
          font-size: 16px;
        }
      }
    }
    
    .manual-input-area {
      padding: 12px;
      flex: 1;
      background-color: var(--el-fill-color-blank);
      
      :deep(.el-textarea) {
        height: 100%;
      }
      
      :deep(.el-textarea__inner) {
        border-radius: 4px;
        font-family: monospace;
        line-height: 1.6;
        min-height: 240px;
        transition: all 0.3s ease;
        box-shadow: 0 0 0 1px var(--el-border-color-lighter) inset;
        background-color: var(--el-bg-color);
        
        &:focus {
          box-shadow: 0 0 0 1px var(--el-color-primary-light-3) inset;
        }
        
        &::placeholder {
          color: var(--el-text-color-placeholder);
          font-style: italic;
        }
      }
    }
  }
  
  .input-separator {
    display: none;
  }

  // 删除模式切换提示样式
  .mode-switch-tip {
    display: none;
  }

  // 全局共享的按钮样式，确保整个页面按钮风格统一
  :deep(.el-button) {
    &.el-button--primary {
      color: white !important;
      background-color: var(--el-color-primary);
      
      &:hover, &:focus {
        background-color: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
        color: white !important;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    &.el-button--success, &.el-button--danger {
      color: white !important;
      
      &:not(.is-plain):hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        color: white !important;
      }
    }
  }

  // 粘贴按钮特殊样式
  .paste-button {
    background-color: var(--el-color-primary);
    color: white;
    border-color: var(--el-color-primary);
    
    &:hover, &:focus {
      background-color: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
      color: white;
    }
  }

  // 清空按钮共享样式
  .clear-button {
    font-weight: 500;
    transition: all 0.3s ease;
    border-radius: 4px;
    height: 32px; /* Element Plus小按钮标准高度 */
    line-height: 32px;
    font-size: 12px;
    
    &:hover, &:focus {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .el-icon {
      margin-right: 4px;
      font-size: 14px;
    }
  }

  // 全局清空按钮特殊样式
  .global-actions {
    display: flex;
    align-items: center;
    
    .clear-button {
      padding: 0 12px; /* 小按钮内边距 */
    }
  }
}
</style> 


