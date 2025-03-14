import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  // 加密解密工具
  {
    path: '/crypto/base64',
    name: 'Base64',
    component: () => import('../views/crypto/base64/index.vue'),
    meta: {
      title: 'Base64 编解码'
    }
  },
  {
    path: '/crypto/hash',
    name: 'Hash',
    component: () => import('../views/crypto/hash/index.vue'),
    meta: {
      title: 'Hash 计算器'
    }
  },
  {
    path: '/crypto/aes',
    name: 'AES',
    component: () => import('../views/crypto/aes/index.vue'),
    meta: {
      title: 'AES 加密'
    }
  },
  {
    path: '/crypto/rsa',
    name: 'RSA',
    component: () => import('../views/crypto/rsa/index.vue'),
    meta: {
      title: 'RSA 加密'
    }
  },
  // 格式转换工具
  {
    path: '/format/json',
    name: 'JSON',
    component: () => import('../views/format/json/index.vue'),
    meta: {
      title: 'JSON 格式化'
    }
  },
  {
    path: '/format/xml',
    name: 'XML',
    component: () => import('../views/format/xml/index.vue'),
    meta: {
      title: 'XML/JSON 转换'
    }
  },
  {
    path: '/format/yaml',
    name: 'YAML',
    component: () => import('../views/format/yaml/index.vue'),
    meta: {
      title: 'YAML/JSON 转换'
    }
  },
  // 文件处理工具
  {
    path: '/file/image',
    name: 'Image',
    component: () => import('../views/file/image/index.vue'),
    meta: {
      title: '图片转换'
    }
  },
  {
    path: '/file/pdf',
    name: 'PDF',
    component: () => import('../views/file/pdf/index.vue'),
    meta: {
      title: 'PDF 处理'
    }
  },
  {
    path: '/file/diff',
    name: 'Diff',
    component: () => import('../views/file/diff/index.vue'),
    meta: {
      title: '文本对比'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - DevTools Plus`
  next()
})

export default router 