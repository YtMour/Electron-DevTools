<template>
  <div class="diff-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>文本对比</h3>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="text">文本</el-radio-button>
            <el-radio-button label="file">文件</el-radio-button>
          </el-radio-group>
        </div>
      </template>

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
          对比
        </el-button>
        <el-button @click="handleClear">清空</el-button>
      </div>

      <div v-if="diffResult" class="diff-result">
        <h4>对比结果</h4>
        <div class="diff-content" v-html="diffResult"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { diffWords } from 'diff'

const mode = ref<'text' | 'file'>('text')
const fileList = ref<UploadFile[]>([])
const diffResult = ref('')

const textForm = reactive({
  text1: '',
  text2: ''
})

const canCompare = computed(() => {
  if (mode.value === 'text') {
    return textForm.text1 && textForm.text2
  } else {
    return fileList.value.length === 2
  }
})

const handleFileChange = (file: File) => {
  if (!file) return

  if (fileList.value.length >= 2) {
    ElMessage.warning('最多只能上传 2 个文件')
    return
  }

  fileList.value.push({
    name: file.name,
    size: file.size,
    type: file.type,
    raw: file
  })
}

const handleCompare = async () => {
  try {
    let text1 = ''
    let text2 = ''

    if (mode.value === 'text') {
      text1 = textForm.text1
      text2 = textForm.text2
    } else {
      const [file1, file2] = fileList.value
      text1 = await file1.raw?.text() || ''
      text2 = await file2.raw?.text() || ''
    }

    const differences = diffWords(text1, text2)
    diffResult.value = differences.map(part => {
      const color = part.added
        ? 'background-color: #e6ffe6;'
        : part.removed
        ? 'background-color: #ffe6e6;'
        : ''
      return `<span style="${color}">${part.value}</span>`
    }).join('')
  } catch (error) {
    ElMessage.error('对比失败，请检查输入是否正确')
    diffResult.value = ''
  }
}

const handleClear = () => {
  if (mode.value === 'text') {
    textForm.text1 = ''
    textForm.text2 = ''
  } else {
    fileList.value = []
  }
  diffResult.value = ''
}
</script>

<style lang="scss" scoped>
.diff-page {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }
  }

  .diff-uploader {
    margin-bottom: 20px;
  }

  .action-section {
    text-align: center;
    margin: 20px 0;
  }

  .diff-result {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    h4 {
      margin: 0 0 16px;
      color: var(--el-text-color-primary);
    }

    .diff-content {
      white-space: pre-wrap;
      font-family: monospace;
      line-height: 1.5;
    }
  }
}
</style> 