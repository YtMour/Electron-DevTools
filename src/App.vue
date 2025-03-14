<template>
  <el-container class="app-container">
    <el-aside width="240px" class="app-aside">
      <div class="logo-container">
        <img src="./assets/logo.png" alt="DevTools Plus" class="logo" />
        <h1>DevTools Plus</h1>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="app-menu"
        :router="true"
        :collapse="isCollapse">
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-sub-menu index="/crypto">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>加密解密工具</span>
          </template>
          <el-menu-item index="/crypto/base64">Base64 编解码</el-menu-item>
          <el-menu-item index="/crypto/hash">Hash 计算器</el-menu-item>
          <el-menu-item index="/crypto/aes">AES 加密</el-menu-item>
          <el-menu-item index="/crypto/rsa">RSA 加密</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/format">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>格式转换工具</span>
          </template>
          <el-menu-item index="/format/json">JSON 格式化</el-menu-item>
          <el-menu-item index="/format/xml">XML/JSON 转换</el-menu-item>
          <el-menu-item index="/format/yaml">YAML/JSON 转换</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/file">
          <template #title>
            <el-icon><Folder /></el-icon>
            <span>文件处理工具</span>
          </template>
          <el-menu-item index="/file/image">图片转换</el-menu-item>
          <el-menu-item index="/file/pdf">PDF 处理</el-menu-item>
          <el-menu-item index="/file/diff">文本对比</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="app-footer">
        <el-button
          type="text"
          class="collapse-btn"
          @click="toggleCollapse">
          <el-icon>
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </el-button>
        <el-switch
          v-model="isDark"
          class="theme-switch"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleTheme"
        />
      </div>
    </el-aside>

    <el-container>
      <el-header height="60px" class="app-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="window-controls">
          <el-button
            type="text"
            class="window-control-btn"
            @click="handleMinimize"
            title="最小化">
            <el-icon><Minus /></el-icon>
          </el-button>
          <el-button
            type="text"
            class="window-control-btn"
            @click="handleMaximize"
            title="最大化">
            <el-icon>
              <FullScreen />
            </el-icon>
          </el-button>
          <el-button
            type="text"
            class="window-control-btn close"
            @click="handleClose"
            title="关闭">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </el-header>

      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Lock,
  Document,
  Folder,
  Moon,
  Sunny,
  Minus,
  FullScreen,
  Close
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapse = ref(false)
const isDark = ref(false)
const isMaximized = ref(false)

// 监听窗口最大化状态
window.ipcRenderer.on('window-maximized-state-changed', (maximized: boolean) => {
  isMaximized.value = maximized
})

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleTheme = (val: string | number | boolean) => {
  // TODO: 实现主题切换逻辑
  console.log('Theme changed:', val)
}

// 窗口控制
const handleMinimize = () => {
  window.ipcRenderer.send('window-minimize')
}

const handleMaximize = () => {
  window.ipcRenderer.send('window-maximize')
}

const handleClose = () => {
  window.ipcRenderer.send('window-close')
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color);

  .app-aside {
    height: 100%;
    background-color: var(--el-menu-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    display: flex;
    flex-direction: column;

    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      background-color: var(--el-color-primary-light-9);

      .logo {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }

      h1 {
        margin: 0;
        font-size: 18px;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }

    .app-menu {
      flex: 1;
      border-right: none;
    }

    .app-footer {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--el-border-color-light);

      .collapse-btn {
        padding: 8px;
        font-size: 20px;
      }

      .theme-switch {
        margin-left: 8px;
      }
    }
  }

  .app-header {
    -webkit-app-region: drag;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    user-select: none;

    .header-left {
      -webkit-app-region: no-drag;
    }

    .window-controls {
      -webkit-app-region: no-drag;
      display: flex;
      gap: 8px;

      .window-control-btn {
        padding: 8px;
        height: 32px;
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-regular);
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.close:hover {
          background-color: #ff4d4f;
          color: #fff;
        }

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }

  .app-main {
    background-color: var(--el-bg-color-page);
    padding: 20px;
    height: calc(100% - 60px);
    overflow-y: auto;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
