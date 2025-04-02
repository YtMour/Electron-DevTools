<template>
  <el-menu
    :default-active="activeMenu"
    class="nav-menu"
    mode="horizontal"
    router
  >
    <el-menu-item index="/des">
      <el-icon><Lock /></el-icon>
      <span>DES / 3DES 加密</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Lock } from '@element-plus/icons-vue';

const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.nav-menu {
  padding: 0 20px;
}
</style> 