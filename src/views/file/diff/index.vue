<template>
  <div class="diff-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>文本对比</h3>
          <div class="header-controls">
            <el-radio-group v-model="mode" size="small">
              <el-radio-button label="text">文本</el-radio-button>
              <el-radio-button label="file">文件</el-radio-button>
            </el-radio-group>
            <el-select 
              v-model="language" 
              size="small" 
              placeholder="选择语言"
              clearable>
              <el-option
                v-for="lang in languages"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
              />
            </el-select>
          </div>
        </div>
      </template>

      <div class="diff-content">
        <template v-if="mode === 'text'">
          <el-form :model="textForm" label-width="80px">
            <el-form-item label="文本 1">
              <el-input
                v-model="textForm.text1"
                type="textarea"
                :rows="12"
                placeholder="请输入第一段文本"
              />
            </el-form-item>

            <el-form-item label="文本 2">
              <el-input
                v-model="textForm.text2"
                type="textarea"
                :rows="12"
                placeholder="请输入第二段文本"
              />
            </el-form-item>
          </el-form>
        </template>

        <template v-else>
          <el-upload
            class="diff-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="2">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                最多上传 2 个文件
              </div>
            </template>
          </el-upload>
        </template>

        <div class="action-section">
          <el-button
            type="primary"
            @click="handleCompare"
            :disabled="!canCompare">
            <el-icon><Connection /></el-icon>
            对比
          </el-button>
          <el-button @click="handleClear">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>

        <div v-if="showDiff" class="diff-section">
          <DiffViewer
            :left-content="leftContent"
            :right-content="rightContent"
            :left-title="leftTitle"
            :right-title="rightTitle"
            :left-meta="leftMeta"
            :right-meta="rightMeta"
            :language="language"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Connection, Delete } from '@element-plus/icons-vue'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { default as DiffViewer } from '@/components/DiffViewer.vue'

const mode = ref<'text' | 'file'>('text')
const fileList = ref<UploadFile[]>([])
const showDiff = ref(false)
const language = ref('')

const languages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'XML', value: 'xml' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'SQL', value: 'sql' },
  { label: 'Markdown', value: 'markdown' },
  { label: '纯文本', value: '' }
]

const textForm = reactive({
  text1: '',
  text2: ''
})

const leftContent = ref('')
const rightContent = ref('')
const leftTitle = ref('原始文本')
const rightTitle = ref('对比文本')
const leftMeta = ref('')
const rightMeta = ref('')

const canCompare = computed(() => {
  if (mode.value === 'text') {
    return textForm.text1 && textForm.text2
  } else {
    return fileList.value.length === 2
  }
})

const handleFileChange = (uploadFile: UploadFile) => {
  if (!uploadFile) return

  if (fileList.value.length >= 2) {
    ElMessage.warning('最多只能上传 2 个文件')
    return
  }

  const timestamp = Date.now()
  const file = uploadFile.raw as File
  const rawFile = Object.assign(file, { uid: timestamp }) as UploadRawFile

  fileList.value.push({
    name: file.name,
    uid: timestamp,
    size: file.size,
    status: 'success',
    raw: rawFile
  })
}

const handleCompare = async () => {
  try {
    if (mode.value === 'text') {
      leftContent.value = textForm.text1
      rightContent.value = textForm.text2
      leftTitle.value = '原始文本'
      rightTitle.value = '对比文本'
      leftMeta.value = ''
      rightMeta.value = ''
    } else {
      const [file1, file2] = fileList.value
      leftContent.value = await file1.raw?.text() || ''
      rightContent.value = await file2.raw?.text() || ''
      leftTitle.value = file1.name
      rightTitle.value = file2.name
      leftMeta.value = formatFileSize(file1.size || 0)
      rightMeta.value = formatFileSize(file2.size || 0)
    }
    showDiff.value = true
  } catch (error) {
    ElMessage.error('对比失败，请检查输入是否正确')
    showDiff.value = false
  }
}

const handleClear = () => {
  if (mode.value === 'text') {
    textForm.text1 = ''
    textForm.text2 = ''
  } else {
    fileList.value = []
  }
  showDiff.value = false
  leftContent.value = ''
  rightContent.value = ''
}

const formatFileSize = (size: number | undefined) => {
  if (size === undefined) return '0 B'
  
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}
</script>

<style lang="scss" scoped>
.diff-page {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;

  :deep(.el-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .el-card__body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }

    .header-controls {
      display: flex;
      gap: 12px;
      align-items: center;

      .el-select {
        width: 120px;
      }
    }
  }

  .diff-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 20px;
    
    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 16px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .el-form-item__content {
          .el-textarea {
            .el-textarea__inner {
              resize: none;
            }
          }
        }
      }
    }
  }

  .diff-uploader {
    margin-bottom: 20px;
    
    :deep(.el-upload-list) {
      margin-top: 16px;
    }
  }

  .action-section {
    padding: 16px 0;
    text-align: center;
    border-top: 1px solid var(--el-border-color-light);
    border-bottom: 1px solid var(--el-border-color-light);
    margin: 20px 0;
    
    .el-button {
      margin: 0 6px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .diff-section {
    flex: 1;
    overflow: hidden;
    margin: 0 -20px -20px;
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style> 