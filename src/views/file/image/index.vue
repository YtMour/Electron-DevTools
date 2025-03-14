<template>
  <div class="image-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>图片转换</h3>
          <el-select v-model="format" size="small" placeholder="选择目标格式">
            <el-option label="PNG" value="png" />
            <el-option label="JPEG" value="jpeg" />
            <el-option label="WebP" value="webp" />
            <el-option label="BMP" value="bmp" />
            <el-option label="TIFF" value="tiff" />
          </el-select>
        </div>
      </template>

      <el-upload
        class="image-uploader"
        drag
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 jpg、jpeg、png、gif、bmp、tiff 等格式
          </div>
        </template>
      </el-upload>

      <div v-if="preview" class="preview-section">
        <h4>预览</h4>
        <div class="preview-container">
          <div class="preview-item">
            <span>原图</span>
            <img :src="preview.original" alt="原图" />
          </div>
          <div class="preview-item">
            <span>转换后</span>
            <img :src="preview.converted" alt="转换后" />
          </div>
        </div>
      </div>

      <div class="action-section">
        <el-button type="primary" @click="handleConvert" :disabled="!selectedFile">
          转换
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
import sharp from 'sharp'

const format = ref('png')
const selectedFile = ref<File | null>(null)
const preview = reactive({
  original: '',
  converted: ''
})

const handleFileChange = (file: File) => {
  if (!file) return

  selectedFile.value = file
  preview.original = URL.createObjectURL(file)
  preview.converted = ''
}

const handleConvert = async () => {
  if (!selectedFile.value) return

  try {
    const buffer = await selectedFile.value.arrayBuffer()
    const image = sharp(Buffer.from(buffer))

    switch (format.value) {
      case 'png':
        await image.png().toFile('output.png')
        break
      case 'jpeg':
        await image.jpeg().toFile('output.jpg')
        break
      case 'webp':
        await image.webp().toFile('output.webp')
        break
      case 'bmp':
        await image.bmp().toFile('output.bmp')
        break
      case 'tiff':
        await image.tiff().toFile('output.tiff')
        break
    }

    ElMessage.success('转换成功')
  } catch (error) {
    ElMessage.error('转换失败，请检查文件格式是否正确')
  }
}

const handleClear = () => {
  selectedFile.value = null
  preview.original = ''
  preview.converted = ''
}
</script>

<style lang="scss" scoped>
.image-page {
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

  .image-uploader {
    margin-bottom: 20px;
  }

  .preview-section {
    margin: 20px 0;

    h4 {
      margin: 0 0 16px;
      color: var(--el-text-color-primary);
    }

    .preview-container {
      display: flex;
      gap: 20px;

      .preview-item {
        flex: 1;
        text-align: center;

        span {
          display: block;
          margin-bottom: 8px;
          color: var(--el-text-color-secondary);
        }

        img {
          max-width: 100%;
          max-height: 300px;
          border: 1px solid var(--el-border-color-light);
          border-radius: 4px;
        }
      }
    }
  }

  .action-section {
    text-align: center;
    margin-top: 20px;
  }
}
</style> 