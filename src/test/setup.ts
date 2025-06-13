import { vi } from 'vitest'
import { ref } from 'vue'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElNotification: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}))

// Mock VueUse
vi.mock('@vueuse/core', () => ({
  useClipboard: () => ({
    copy: vi.fn().mockResolvedValue(true),
    copied: ref(false),
    isSupported: ref(true)
  })
}))

// Mock crypto-js
vi.mock('crypto-js', () => ({
  default: {
    enc: {
      Utf8: {
        parse: vi.fn(),
        stringify: vi.fn()
      },
      Base64: {
        parse: vi.fn(),
        stringify: vi.fn()
      }
    },
    AES: {
      encrypt: vi.fn(),
      decrypt: vi.fn()
    },
    MD5: vi.fn(),
    SHA1: vi.fn(),
    SHA256: vi.fn(),
    SHA512: vi.fn()
  }
}))

// Global test utilities
global.btoa = vi.fn((str: string) => Buffer.from(str).toString('base64'))
global.atob = vi.fn((str: string) => Buffer.from(str, 'base64').toString())

// Mock window.electron (for Electron APIs)
Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      invoke: vi.fn(),
      send: vi.fn(),
      on: vi.fn(),
      removeAllListeners: vi.fn()
    }
  },
  writable: true
})
