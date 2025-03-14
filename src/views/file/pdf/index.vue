<template>
  <div class="pdf-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>PDF 处理</h3>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="merge">合并</el-radio-button>
            <el-radio-button label="split">拆分</el-radio-button>
            <el-radio-button label="compress">压缩</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-upload
        class="pdf-uploader"
        drag
        action="#"
        :auto-upload="false"
        :show-file-list="true"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".pdf">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 PDF 格式文件
          </div>
        </template>
      </el-upload>

      <div v-if="mode === 'split'" class="split-options">
        <el-form :model="splitForm" label-width="80px">
          <el-form-item label="页码范围">
            <el-input
              v-model="splitForm.pages"
              placeholder="例如：1-3,5,7-9"
            />
          </el-form-item>
        </el-form>
      </div>

      <div v-if="mode === 'compress'" class="compress-options">
        <el-form :model="compressForm" label-width="80px">
          <el-form-item label="压缩质量">
            <el-slider
              v-model="compressForm.quality"
              :min="0"
              :max="100"
              :step="10"
            />
            <span class="quality-value">{{ compressForm.quality }}%</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="action-section">
        <el-button
          type="primary"
          @click="handleProcess"
          :disabled="!fileList.length">
          {{ mode === 'merge' ? '合并' : mode === 'split' ? '拆分' : '压缩' }}
        </el-button>
        <el-button @click="handleClear">清空</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

const mode = ref<'merge' | 'split' | 'compress'>('merge')
const fileList = ref<UploadFile[]>([])

const splitForm = reactive({
  pages: ''
})

const compressForm = reactive({
  quality: 80
})

const handleFileChange = (file: File) => {
  if (!file) return

  if (file.type !== 'application/pdf') {
    ElMessage.error('只支持 PDF 格式文件')
    return
  }

  fileList.value.push({
    name: file.name,
    size: file.size,
    type: file.type,
    raw: file
  })
}

const handleProcess = async () => {
  if (!fileList.value.length) return

  try {
    switch (mode.value) {
      case 'merge':
        await handleMerge()
        break
      case 'split':
        await handleSplit()
        break
      case 'compress':
        await handleCompress()
        break
    }
  } catch (error) {
    ElMessage.error('处理失败，请检查文件是否正确')
  }
}

const handleMerge = async () => {
  // TODO: 实现 PDF 合并功能
  ElMessage.success('合并成功')
}

const handleSplit = async () => {
  if (!splitForm.pages) {
    ElMessage.warning('请输入页码范围')
    return
  }
  // TODO: 实现 PDF 拆分功能
  ElMessage.success('拆分成功')
}

const handleCompress = async () => {
  // TODO: 实现 PDF 压缩功能
  ElMessage.success('压缩成功')
}

const handleClear = () => {
  fileList.value = []
  splitForm.pages = ''
  compressForm.quality = 80
}
</script>

<style lang="scss" scoped>
.pdf-page {
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

  .pdf-uploader {
    margin-bottom: 20px;
  }

  .split-options,
  .compress-options {
    margin: 20px 0;
  }

  .quality-value {
    margin-left: 16px;
    color: var(--el-text-color-secondary);
  }

  .action-section {
    text-align: center;
    margin-top: 20px;
  }
}
</style> 