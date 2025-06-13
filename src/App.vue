<template>
  <AppLoading v-if="isLoading" />
  <el-container v-else class="app-container">
    <el-aside :width="isCollapse ? '64px' : '240px'" class="app-aside">
      <div class="logo-container" :class="{ 'collapsed': isCollapse }">
        <img src="./assets/logo.svg" alt="Yt Tools" class="logo" />
        <transition name="fade-scale">
          <h1 v-if="!isCollapse">Yt Tools</h1>
        </transition>
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

        <template v-for="menu in menuConfig" :key="menu.path">
          <el-sub-menu :index="menu.path">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item 
              v-for="item in menu.children" 
              :key="item.path" 
              :index="item.path"
            >
              {{ item.name }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>

      <div class="app-footer" :class="{ 'collapsed': isCollapse }">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLoading from '@/components/AppLoading.vue'
import menuConfig from '@/config/menu'
import {
  HomeFilled,
  Moon,
  Sunny,
  Minus,
  FullScreen,
  Close
} from '@element-plus/icons-vue'

declare global {
  interface Window {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void
      on: (channel: string, func: (...args: any[]) => void) => void
      once: (channel: string, func: (...args: any[]) => void) => void
      removeListener: (channel: string, func: (...args: any[]) => void) => void
    }
  }
}

const route = useRoute()
const isLoading = ref(true)
const isCollapse = ref(false)
const isDark = ref(false)
const isMaximized = ref(false)

// 主题管理工具
const themeManager = {
  // 设置主题
  setTheme(isDarkMode: boolean) {
    const html = document.documentElement
    const body = document.body
    
    // 设置根元素class
    if (isDarkMode) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    
    // 设置Element Plus组件主题
    body.setAttribute('class', isDarkMode ? 'dark' : '')
    
    // 保存主题设置
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  },
  
  // 获取当前主题
  getCurrentTheme(): boolean {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  
  // 监听系统主题变化
  watchSystemTheme(callback: (isDark: boolean) => void) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        callback(e.matches)
      }
    })
  }
}

// 监听窗口最大化状态
window.ipcRenderer.on('window-maximized-state-changed', (_event, maximized: boolean) => {
  isMaximized.value = maximized
})

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => route)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 主题切换逻辑
const toggleTheme = (val: string | number | boolean) => {
  const isDarkMode = Boolean(val)
  isDark.value = isDarkMode
  themeManager.setTheme(isDarkMode)
}

// 初始化主题和应用
onMounted(() => {
  // 模拟加载过程
  setTimeout(() => {
    isLoading.value = false
  }, 2000)

  const shouldUseDark = themeManager.getCurrentTheme()
  isDark.value = shouldUseDark
  themeManager.setTheme(shouldUseDark)
  themeManager.watchSystemTheme((isDarkMode) => {
    isDark.value = isDarkMode
    themeManager.setTheme(isDarkMode)
  })

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleThemeChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) {
      toggleTheme(e.matches)
    }
  }
  mediaQuery.addEventListener('change', handleThemeChange)
})

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
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    .logo-container {
      height: 60px;
      min-height: 60px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 16px;
      background-color: var(--el-menu-bg-color);
      border-bottom: 1px solid var(--el-border-color-light);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      white-space: nowrap;

      .logo {
        width: 32px;
        height: 32px;
        margin-right: 12px;
        flex-shrink: 0;
        transition: margin 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
        flex-shrink: 0;
        opacity: 1;
        transform: translateX(0);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.collapsed {
        padding: 16px 0;
        justify-content: center;

        .logo {
          margin-right: 0;
        }

        h1 {
          width: 0;
          opacity: 0;
          transform: translateX(-10px);
        }
      }
    }

    .app-menu {
      flex: 1;
      border-right: none;
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background-color: var(--el-scrollbar-thumb-color, var(--el-border-color));

        &:hover {
          background-color: var(--el-border-color-light);
        }
      }

      &::-webkit-scrollbar-track {
        background-color: var(--el-scrollbar-bg-color, var(--el-bg-color));
      }

      :deep(.el-menu-item), :deep(.el-sub-menu__title) {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      :deep(.el-menu-item.is-active) {
        background-color: var(--el-menu-hover-bg-color);
      }

      :deep(.el-menu-item):hover,
      :deep(.el-sub-menu__title):hover {
        background-color: var(--el-menu-hover-bg-color);
      }
    }

    .app-footer {
      height: 60px;
      min-height: 60px;
      flex-shrink: 0;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--el-border-color-light);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      white-space: nowrap;

      .collapse-btn {
        padding: 8px;
        font-size: 20px;
        flex-shrink: 0;
      }

      .theme-switch {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: right;

        :deep(.el-switch__core) {
          background-color: var(--el-border-color-light);
        }
      }

      &.collapsed {
        padding: 16px 0;
        justify-content: center;

        .theme-switch {
          transform: scale(0);
          width: 0;
          margin: 0;
          opacity: 0;
        }
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
          background-color: var(--el-color-danger);
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

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform-origin: left;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scaleX(0);
  width: 0;
  margin: 0;
}

.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scaleX(1);
}
</style>

