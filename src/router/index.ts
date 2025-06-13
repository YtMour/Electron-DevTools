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
        path: 'code-formatter',
        name: 'code-formatter',
        component: () => import('../views/format/code-formatter/index.vue'),
        meta: {
          title: '代码格式化'
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
          title: 'TOML 转换工具'
        }
      },
      {
        path: 'markdown',
        name: 'Markdown',
        component: () => import('../views/format/markdown/index.vue'),
        meta: {
          title: 'Markdown 转换'
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
  },
  {
    path: '/network',
    name: 'network',
    component: () => import('../views/network/index.vue'),
    meta: {
      title: '网络工具'
    },
    children: [
      {
        path: '',
        name: 'network-home',
        component: () => import('../views/network/home.vue'),
        meta: {
          title: '网络工具'
        }
      },
      {
        path: 'unified-lookup',
        name: 'unified-lookup',
        component: () => import('../views/network/unified-lookup/index.vue'),
        meta: {
          title: '网络信息查询'
        }
      },
      {
        path: 'ipv4-subnet',
        name: 'ipv4-subnet',
        component: () => import('../views/network/ipv4-subnet/index.vue'),
        meta: {
          title: 'IPv4子网计算器'
        }
      },
      {
        path: 'ipv4-converter',
        name: 'ipv4-converter',
        component: () => import('../views/network/ipv4-converter/index.vue'),
        meta: {
          title: 'IPv4地址转换器'
        }
      },
      {
        path: 'ipv4-range',
        name: 'ipv4-range',
        component: () => import('../views/network/ipv4-range/index.vue'),
        meta: {
          title: 'IPv4范围扩展器'
        }
      },
      {
        path: 'mac-lookup',
        name: 'mac-lookup',
        component: () => import('../views/network/mac-lookup/index.vue'),
        meta: {
          title: 'MAC地址查找'
        }
      },
      {
        path: 'mac-generator',
        name: 'mac-generator',
        component: () => import('../views/network/mac-generator/index.vue'),
        meta: {
          title: 'MAC地址生成器'
        }
      },
      {
        path: 'ipv6-ula',
        name: 'ipv6-ula',
        component: () => import('../views/network/ipv6-ula/index.vue'),
        meta: {
          title: 'IPv6 ULA生成器'
        }
      },
      {
        path: 'port-scanner',
        name: 'port-scanner',
        component: () => import('../views/network/port-scanner/index.vue'),
        meta: {
          title: '端口扫描器'
        }
      }
    ]
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('../views/tools/index.vue'),
    meta: {
      title: '系统工具'
    },
    children: [
      {
        path: '',
        name: 'tools-home',
        component: () => import('../views/tools/home.vue'),
        meta: {
          title: '系统工具'
        }
      },
      {
        path: 'performance-monitor',
        name: 'performance-monitor',
        component: () => import('../views/tools/performance-monitor/index.vue'),
        meta: {
          title: '性能监控'
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