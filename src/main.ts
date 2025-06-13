// 导入Node.js polyfill
import './polyfills/global'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// 延迟加载图标和错误处理，避免阻塞启动
Promise.resolve().then(async () => {
  // 动态导入图标
  const ElementPlusIconsVue = await import('@element-plus/icons-vue')
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 动态导入错误处理
  const { globalErrorHandler } = await import('./utils/error-handler')

  // 添加全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    const error = err as Error
    globalErrorHandler.handleError({
      message: error?.message || 'Vue application error',
      stack: error?.stack,
      source: 'vue',
      level: 'error',
      context: {
        componentInfo: info,
        componentName: instance?.$options?.name || 'Unknown'
      }
    })
  }
})

// 挂载应用
app.mount('#app')
