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
      },
      {
        path: 'password',
        name: 'Password',
        component: () => import('../views/crypto/password/index.vue'),
        meta: {
          title: '密码生成器'
        }
      },
      {
        path: 'uuid',
        name: 'UUID',
        component: () => import('../views/crypto/uuid/index.vue'),
        meta: {
          title: 'UUID 生成器'
        }
      },
      {
        path: 'des',
        name: 'DES',
        component: () => import('../views/crypto/des/index.vue'),
        meta: {
          title: 'DES / 3DES 加密'
        }
      },
      {
        path: 'blowfish',
        name: 'Blowfish',
        component: () => import('../views/crypto/blowfish/index.vue'),
        meta: {
          title: 'Blowfish 加密'
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
      },
      {
        path: 'csv',
        name: 'CSV',
        component: () => import('../views/format/csv/index.vue'),
        meta: {
          title: 'CSV/JSON 转换'
        }
      },
      {
        path: 'toml',
        name: 'TOML',
        component: () => import('../views/format/toml/index.vue'),
        meta: {
          title: 'TOML 格式转换'
        }
      }
    ]
  },
  {
    path: '/file',
    name: 'file',
    component: () => import('../views/file/index.vue'),
    meta: {
      title: '文件工具'
    },
    children: [
      {
        path: 'process',
        name: 'file-process',
        component: () => import('../views/file/process/index.vue'),
        meta: {
          title: '文件处理'
        }
      },
      {
        path: 'image',
        name: 'file-image',
        component: () => import('../views/file/image/index.vue'),
        meta: {
          title: '图片工具'
        }
      },
      {
        path: 'pdf',
        name: 'file-pdf',
        component: () => import('../views/file/pdf/index.vue'),
        meta: {
          title: 'PDF工具'
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
  document.title = `${to.meta.title} - Yt Tools`
  next()
})

export default router 