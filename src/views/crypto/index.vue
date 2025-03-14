<template>
  <div class="crypto-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-menu
          :default-active="activeMenu"
          class="crypto-menu"
          router>
          <el-menu-item index="/crypto/base64">
            <el-icon><Document /></el-icon>
            <span>Base64 编解码</span>
          </el-menu-item>
          <el-menu-item index="/crypto/hash">
            <el-icon><Operation /></el-icon>
            <span>Hash 计算器</span>
          </el-menu-item>
          <el-menu-item index="/crypto/aes">
            <el-icon><Lock /></el-icon>
            <span>AES 加密</span>
          </el-menu-item>
          <el-menu-item index="/crypto/rsa">
            <el-icon><Key /></el-icon>
            <span>RSA 加密</span>
          </el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="18">
        <router-view />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Operation, Lock, Key } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.crypto-page {
  .crypto-menu {
    height: 100%;
    border-right: 1px solid var(--el-border-color-light);
  }
}
</style> 