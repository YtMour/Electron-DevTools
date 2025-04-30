// 导入Node.js polyfill
import './polyfills/global'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)

// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('应用错误:', err);
  console.info('错误信息:', info);
};

// 挂载应用
app.mount('#app')
