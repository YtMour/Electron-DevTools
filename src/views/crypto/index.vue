<template>
  <div class="crypto-page">
    <div class="crypto-header" v-if="$route.path === '/crypto'">
      <h2>加密解密工具</h2>
      <el-alert
        title="欢迎使用加密解密工具集"
        type="info"
        description="本工具集提供多种加密解密和编码功能，包括Base64编解码、哈希计算、AES加密和RSA非对称加密。所有操作均在本地完成，保证您的数据安全。"
        show-icon
        :closable="false"
        class="crypto-info"
      />
      
      <div class="tool-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" @click="navigateTo('/crypto/base64')">
              <div class="tool-card-content">
                <h3>Base64 编解码</h3>
                <p>文本与二进制数据的编码转换工具，支持文件处理和自定义选项</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="navigateTo('/crypto/hash')">
              <div class="tool-card-content">
                <h3>哈希计算器</h3>
                <p>支持MD5、SHA系列等多种哈希算法，提供文件校验和值对比功能</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="navigateTo('/crypto/aes')">
              <div class="tool-card-content">
                <h3>AES 加密</h3>
                <p>对称加密算法，支持多种密钥长度和加密模式，适用于敏感数据保护</p>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="navigateTo('/crypto/rsa')">
              <div class="tool-card-content">
                <h3>RSA 加密</h3>
                <p>非对称加密算法，支持密钥对生成、加密解密功能，适用于安全通信</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.crypto-page {
  height: 100%;
  padding: 16px;
}

.crypto-header {
  margin-bottom: 24px;
  
  h2 {
    margin-bottom: 16px;
    font-size: 24px;
  }
}

.crypto-info {
  margin-bottom: 24px;
}

.tool-cards {
  margin-top: 24px;
  
  .tool-card-content {
    text-align: center;
    cursor: pointer;
    padding: 8px;
    
    h3 {
      margin-bottom: 8px;
      color: var(--el-color-primary);
    }
    
    p {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      line-height: 1.5;
    }
  }
}
</style> 