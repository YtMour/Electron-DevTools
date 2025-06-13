import type { MenuItem } from '@/types/menu'

const menuConfig: MenuItem[] = [
  {
    path: '/crypto',
    name: '加密解密',
    icon: 'Lock',
    children: [
      {
        path: '/crypto/base64',
        name: 'Base64'
      },
      {
        path: '/crypto/hash',
        name: 'Hash'
      },
      {
        path: '/crypto/aes',
        name: 'AES'
      },
      {
        path: '/crypto/rsa',
        name: 'RSA'
      },
      {
        path: '/crypto/des',
        name: 'DES/3DES'
      },
      {
        path: '/crypto/blowfish',
        name: 'Blowfish'
      },
      {
        path: '/crypto/uuid',
        name: 'UUID'
      },
      {
        path: '/crypto/password',
        name: '密码生成器'
      }
    ]
  },
  {
    path: '/format',
    name: '格式转换',
    icon: 'Document',
    children: [
      {
        path: '/format/json',
        name: 'JSON'
      },
      {
        path: '/format/xml',
        name: 'XML'
      },
      {
        path: '/format/yaml',
        name: 'YAML'
      },
      {
        path: '/format/csv',
        name: 'CSV'
      },
      {
        path: '/format/toml',
        name: 'TOML'
      },
      {
        path: '/format/markdown',
        name: 'Markdown'
      },
      {
        path: '/format/code-formatter',
        name: '代码格式化'
      }
    ]
  },
  {
    path: '/file',
    name: '文件工具',
    icon: 'Folder',
    children: [
      {
        path: '/file/process',
        name: '文件处理'
      },
      {
        path: '/file/image',
        name: '图片转换'
      },
      {
        path: '/file/pdf',
        name: 'PDF处理'
      }
    ]
  },
  {
    path: '/network',
    name: '网络工具',
    icon: 'Connection',
    children: [
      {
        path: '/network/unified-lookup',
        name: '网络信息查询'
      },
      {
        path: '/network/ipv4-subnet',
        name: 'IPv4子网计算器'
      },
      {
        path: '/network/ipv4-converter',
        name: 'IPv4地址转换器'
      },
      {
        path: '/network/ipv4-range',
        name: 'IPv4范围扩展器'
      },
      {
        path: '/network/port-scanner',
        name: '端口扫描器'
      },
      {
        path: '/network/network-diagnostics',
        name: '网络诊断工具'
      },
      {
        path: '/network/mac-lookup',
        name: 'MAC地址查找'
      },
      {
        path: '/network/mac-generator',
        name: 'MAC地址生成器'
      },
      {
        path: '/network/ipv6-ula',
        name: 'IPv6 ULA生成器'
      }
    ]
  },
  {
    path: '/tools',
    name: '系统工具',
    icon: 'Tools',
    children: [
      {
        path: '/tools/performance-monitor',
        name: '性能监控'
      },
      {
        path: '/tools/api-tester',
        name: 'API 测试工具'
      },
      {
        path: '/tools/regex-tester',
        name: '正则表达式测试器'
      },
      {
        path: '/tools/color-picker',
        name: '颜色选择器'
      }
    ]
  }
]

export default menuConfig