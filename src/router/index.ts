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
  {
    path: '/crypto',
    name: 'Crypto',
    component: () => import('../views/crypto/index.vue'),
    meta: {
      title: '加密解密工具'
    },
    children: [
      {
        path: 'base64',
        name: 'Base64',
        component: () => import('../views/crypto/base64/index.vue'),
        meta: {
          title: 'Base64 编解码'
        }
      },
      {
        path: 'hash',
        name: 'Hash',
        component: () => import('../views/crypto/hash/index.vue'),
        meta: {
          title: 'Hash 计算器'
        }
      },
      {
        path: 'aes',
        name: 'AES',
        component: () => import('../views/crypto/aes/index.vue'),
        meta: {
          title: 'AES 加密'
        }
      },
      {
        path: 'rsa',
        name: 'RSA',
        component: () => import('../views/crypto/rsa/index.vue'),
        meta: {
          title: 'RSA 加密'
        }
      }
    ]
  },
  {
    path: '/format',
    name: 'Format',
    component: () => import('../views/format/index.vue'),
    meta: {
      title: '格式转换工具'
    },
    children: [
      {
        path: 'json',
        name: 'JSON',
        component: () => import('../views/format/json/index.vue'),
        meta: {
          title: 'JSON 格式化'
        }
      },
      {
        path: 'xml',
        name: 'XML',
        component: () => import('../views/format/xml/index.vue'),
        meta: {
          title: 'XML/JSON 转换'
        }
      },
      {
        path: 'yaml',
        name: 'YAML',
        component: () => import('../views/format/yaml/index.vue'),
        meta: {
          title: 'YAML/JSON 转换'
        }
      }
    ]
  },
  {
    path: '/file',
    name: 'File',
    component: () => import('../views/file/index.vue'),
    meta: {
      title: '文件处理工具'
    },
    children: [
      {
        path: 'image',
        name: 'Image',
        component: () => import('../views/file/image/index.vue'),
        meta: {
          title: '图片转换'
        }
      },
      {
        path: 'pdf',
        name: 'PDF',
        component: () => import('../views/file/pdf/index.vue'),
        meta: {
          title: 'PDF 处理'
        }
      },
      {
        path: 'diff',
        name: 'Diff',
        component: () => import('../views/file/diff/index.vue'),
        meta: {
          title: '文本对比'
        }
      }
    ]
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