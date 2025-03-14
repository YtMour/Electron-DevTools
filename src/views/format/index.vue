<template>
  <div class="format-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-menu
          :default-active="activeMenu"
          class="format-menu"
          router>
          <el-menu-item index="/format/json">
            <el-icon><Document /></el-icon>
            <span>JSON 格式化</span>
          </el-menu-item>
          <el-menu-item index="/format/xml">
            <el-icon><Connection /></el-icon>
            <span>XML/JSON 转换</span>
          </el-menu-item>
          <el-menu-item index="/format/yaml">
            <el-icon><List /></el-icon>
            <span>YAML/JSON 转换</span>
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
import { Document, Connection, List } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.format-page {
  .format-menu {
    height: 100%;
    border-right: 1px solid var(--el-border-color-light);
  }
}
</style> 