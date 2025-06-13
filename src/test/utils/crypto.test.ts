import { describe, it, expect, vi } from 'vitest'
import { Base64, Hash } from '@/utils/crypto'

describe('Crypto Utils', () => {
  describe('Base64', () => {
    it('should encode text correctly', () => {
      const text = 'Hello, World!'
      const encoded = Base64.encode(text)
      expect(encoded).toBe('SGVsbG8sIFdvcmxkIQ==')
    })

    it('should decode text correctly', () => {
      const encoded = 'SGVsbG8sIFdvcmxkIQ=='
      const decoded = Base64.decode(encoded)
      expect(decoded).toBe('Hello, World!')
    })

    it('should handle URL-safe encoding', () => {
      const text = 'Hello+World/Test='
      const encoded = Base64.encode(text, true)
      const decoded = Base64.decode(encoded, true)
      expect(decoded).toBe(text)
    })

    it('should handle empty strings', () => {
      expect(Base64.encode('')).toBe('')
      expect(Base64.decode('')).toBe('')
    })

    it('should handle Unicode characters', () => {
      const text = '你好世界 🌍'
      const encoded = Base64.encode(text)
      const decoded = Base64.decode(encoded)
      expect(decoded).toBe(text)
    })

    it('should throw error for invalid base64', () => {
      expect(() => Base64.decode('invalid-base64!')).toThrow()
    })
  })

  describe('Hash', () => {
    // Mock crypto-js for hash tests
    vi.mock('crypto-js', () => ({
      default: {
        MD5: vi.fn(() => ({ toString: () => 'mocked-md5-hash' })),
        SHA1: vi.fn(() => ({ toString: () => 'mocked-sha1-hash' })),
        SHA256: vi.fn(() => ({ toString: () => 'mocked-sha256-hash' })),
        SHA512: vi.fn(() => ({ toString: () => 'mocked-sha512-hash' }))
      }
    }))

    it('should calculate MD5 hash', () => {
      const result = Hash.md5('test')
      expect(result).toBe('mocked-md5-hash')
    })

    it('should calculate SHA1 hash', () => {
      const result = Hash.sha1('test')
      expect(result).toBe('mocked-sha1-hash')
    })

    it('should calculate SHA256 hash', () => {
      const result = Hash.sha256('test')
      expect(result).toBe('mocked-sha256-hash')
    })

    it('should calculate SHA512 hash', () => {
      const result = Hash.sha512('test')
      expect(result).toBe('mocked-sha512-hash')
    })

    it('should handle empty input', () => {
      const result = Hash.md5('')
      expect(result).toBe('mocked-md5-hash')
    })
  })
})
