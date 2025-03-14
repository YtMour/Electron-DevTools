<template>
  <div class="home-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <h2>欢迎使用 DevTools Plus</h2>
            </div>
          </template>
          <div class="welcome-content">
            <p>DevTools Plus 是一个强大的开发工具集合，提供多种实用功能，帮助您提高开发效率。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="tool-categories">
      <el-col :span="8">
        <el-card class="tool-card" @click="$router.push('/crypto')">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>加密解密工具</span>
            </div>
          </template>
          <div class="card-content">
            <p>提供 Base64、Hash、AES、RSA 等加密解密功能</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" @click="$router.push('/format')">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>格式转换工具</span>
            </div>
          </template>
          <div class="card-content">
            <p>支持 JSON、XML、YAML 等格式的转换和格式化</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" @click="$router.push('/file')">
          <template #header>
            <div class="card-header">
              <el-icon><Folder /></el-icon>
              <span>文件处理工具</span>
            </div>
          </template>
          <div class="card-content">
            <p>提供图片转换、PDF 处理、文本对比等功能</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Lock, Document, Folder } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.home-page {
  padding: 20px;

  .welcome-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 {
        margin: 0;
        font-size: 24px;
        color: var(--el-text-color-primary);
      }
    }

    .welcome-content {
      font-size: 16px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
    }
  }

  .tool-categories {
    .tool-card {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          font-size: 20px;
          color: var(--el-color-primary);
        }

        span {
          font-size: 18px;
          font-weight: 500;
        }
      }

      .card-content {
        color: var(--el-text-color-secondary);
        line-height: 1.5;
      }
    }
  }
}
</style> 