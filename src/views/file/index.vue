<template>
  <div class="file-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-menu
          :default-active="activeMenu"
          class="file-menu"
          router>
          <el-menu-item index="/file/image">
            <el-icon><Picture /></el-icon>
            <span>图片转换</span>
          </el-menu-item>
          <el-menu-item index="/file/pdf">
            <el-icon><Document /></el-icon>
            <span>PDF 处理</span>
          </el-menu-item>
          <el-menu-item index="/file/diff">
            <el-icon><Edit /></el-icon>
            <span>文本对比</span>
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
import { Picture, Document, Edit } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.file-page {
  .file-menu {
    height: 100%;
    border-right: 1px solid var(--el-border-color-light);
  }
}
</style> 