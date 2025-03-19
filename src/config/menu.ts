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
        path: '/file/compare',
        name: '文本对比'
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
  }
]

export default menuConfig 