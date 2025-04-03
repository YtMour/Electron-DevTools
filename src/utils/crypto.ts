import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'
import { DESUtil } from './crypto/des'

/**
 * Base64相关操作
 */
export const Base64 = {
  /**
   * Base64编码
   * @param str 要编码的字符串
   * @param urlSafe 是否使用URL安全的Base64（替换+和/为-和_）
   * @returns 编码后的Base64字符串
   */
  encode(str: string, urlSafe = false): string {
    try {
      const encoded = btoa(unescape(encodeURIComponent(str)))
      return urlSafe ? this.toUrlSafe(encoded) : encoded
    } catch (error) {
      console.error('Base64编码错误:', error)
      throw new Error('Base64编码失败')
    }
  },

  /**
   * Base64解码
   * @param base64 Base64编码的字符串
   * @param urlSafe 是否为URL安全的Base64
   * @returns 解码后的字符串
   */
  decode(base64: string, urlSafe = false): string {
    try {
      const str = urlSafe ? this.fromUrlSafe(base64) : base64
      return decodeURIComponent(escape(atob(str)))
    } catch (error) {
      console.error('Base64解码错误:', error)
      throw new Error('Base64解码失败')
    }
  },

  /**
   * 转换为URL安全的Base64编码
   * @param base64 标准Base64字符串
   * @returns URL安全的Base64字符串
   */
  toUrlSafe(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  },

  /**
   * 从URL安全的Base64转换为标准Base64
   * @param urlSafeBase64 URL安全的Base64字符串
   * @returns 标准Base64字符串
   */
  fromUrlSafe(urlSafeBase64: string): string {
    let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) {
      base64 += '='
    }
    return base64
  }
}

/**
 * 哈希算法
 */
export const Hash = {
  /**
   * 计算MD5哈希值
   * @param value 要计算哈希的值
   * @returns MD5哈希值
   */
  md5(value: string): string {
    return CryptoJS.MD5(value).toString()
  },

  /**
   * 计算SHA-1哈希值
   * @param value 要计算哈希的值
   * @returns SHA-1哈希值
   */
  sha1(value: string): string {
    return CryptoJS.SHA1(value).toString()
  },

  /**
   * 计算SHA-256哈希值
   * @param value 要计算哈希的值
   * @returns SHA-256哈希值
   */
  sha256(value: string): string {
    return CryptoJS.SHA256(value).toString()
  },

  /**
   * 计算SHA-512哈希值
   * @param value 要计算哈希的值
   * @returns SHA-512哈希值
   */
  sha512(value: string): string {
    return CryptoJS.SHA512(value).toString()
  },

  /**
   * 计算HMAC
   * @param value 要计算哈希的值
   * @param key 密钥
   * @param algorithm 算法类型
   * @returns HMAC哈希值
   */
  hmac(value: string, key: string, algorithm: 'SHA1' | 'SHA256' | 'SHA512' | 'MD5' = 'SHA256'): string {
    const hmacAlgo = CryptoJS.HmacSHA256
    if (algorithm === 'SHA1') return CryptoJS.HmacSHA1(value, key).toString()
    if (algorithm === 'SHA512') return CryptoJS.HmacSHA512(value, key).toString()
    if (algorithm === 'MD5') return CryptoJS.HmacMD5(value, key).toString()
    return CryptoJS.HmacSHA256(value, key).toString()
  },

  /**
   * 验证哈希值
   * @param value 原始值
   * @param hash 哈希值
   * @param algorithm 算法类型
   * @returns 是否匹配
   */
  verify(value: string, hash: string, algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'): boolean {
    const calculatedHash = this[algorithm](value)
    return calculatedHash.toLowerCase() === hash.toLowerCase()
  }
}

/**
 * AES加密解密
 */
export const AES = {
  /**
   * AES加密
   * @param plaintext 明文
   * @param key 密钥
   * @param iv 初始化向量，ECB模式不需要
   * @param mode 加密模式
   * @returns 密文
   */
  encrypt(
    plaintext: string,
    key: string,
    iv?: string,
    mode: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' = 'CBC'
  ): string {
    try {
      const keyObj = CryptoJS.enc.Utf8.parse(key)
      const options: any = {
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad.Pkcs7
      }

      if (mode !== 'ECB' && iv) {
        options.iv = CryptoJS.enc.Utf8.parse(iv)
      }

      const encrypted = CryptoJS.AES.encrypt(plaintext, keyObj, options)
      return encrypted.toString()
    } catch (error) {
      console.error('AES加密错误:', error)
      throw new Error('AES加密失败')
    }
  },

  /**
   * AES解密
   * @param ciphertext 密文
   * @param key 密钥
   * @param iv 初始化向量，ECB模式不需要
   * @param mode 加密模式
   * @returns 明文
   */
  decrypt(
    ciphertext: string,
    key: string,
    iv?: string,
    mode: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' = 'CBC'
  ): string {
    try {
      const keyObj = CryptoJS.enc.Utf8.parse(key)
      const options: any = {
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad.Pkcs7
      }

      if (mode !== 'ECB' && iv) {
        options.iv = CryptoJS.enc.Utf8.parse(iv)
      }

      const decrypted = CryptoJS.AES.decrypt(ciphertext, keyObj, options)
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('AES解密错误:', error)
      throw new Error('AES解密失败')
    }
  },

  /**
   * 使用PBKDF2从密码生成密钥
   * @param password 密码
   * @param salt 盐值
   * @param keySize 密钥长度 (128/192/256位)
   * @param iterations 迭代次数
   * @returns 生成的密钥
   */
  deriveKey(
    password: string,
    salt: string,
    keySize: 128 | 192 | 256 = 256,
    iterations: number = 1000
  ): string {
    try {
      const key = CryptoJS.PBKDF2(password, salt, {
        keySize: keySize / 32,
        iterations: iterations
      })
      return key.toString()
    } catch (error) {
      console.error('密钥派生错误:', error)
      throw new Error('密钥派生失败')
    }
  }
}

/**
 * RSA加密解密
 */
export const RSA = {
  /**
   * 生成RSA密钥对
   * @param keySize 密钥长度
   * @returns 包含公钥和私钥的对象
   */
  generateKeyPair(keySize: 1024 | 2048 | 4096 = 2048): { publicKey: string; privateKey: string } {
    try {
      const crypt = new JSEncrypt({ default_key_size: `${keySize}` })
      return {
        publicKey: crypt.getPublicKey(),
        privateKey: crypt.getPrivateKey()
      }
    } catch (error) {
      console.error('RSA密钥对生成错误:', error)
      throw new Error('RSA密钥对生成失败')
    }
  },

  /**
   * RSA公钥加密
   * @param plaintext 明文
   * @param publicKey 公钥
   * @returns 密文
   */
  encrypt(plaintext: string, publicKey: string): string {
    try {
      const encrypt = new JSEncrypt()
      encrypt.setPublicKey(publicKey)
      const encrypted = encrypt.encrypt(plaintext)
      if (!encrypted) {
        throw new Error('加密结果为空')
      }
      return encrypted
    } catch (error) {
      console.error('RSA加密错误:', error)
      throw new Error('RSA加密失败')
    }
  },

  /**
   * RSA私钥解密
   * @param ciphertext 密文
   * @param privateKey 私钥
   * @returns 明文
   */
  decrypt(ciphertext: string, privateKey: string): string {
    try {
      const decrypt = new JSEncrypt()
      decrypt.setPrivateKey(privateKey)
      const decrypted = decrypt.decrypt(ciphertext)
      if (!decrypted) {
        throw new Error('解密结果为空')
      }
      return decrypted
    } catch (error) {
      console.error('RSA解密错误:', error)
      throw new Error('RSA解密失败')
    }
  },

  /**
   * RSA签名
   * @param message 要签名的消息
   * @param privateKey 私钥
   * @param hashAlgorithm 哈希算法
   * @returns 签名
   */
  sign(
    message: string, 
    privateKey: string, 
    hashAlgorithm: 'sha1' | 'sha256' | 'sha512' = 'sha256'
  ): string {
    try {
      const sign = new JSEncrypt()
      sign.setPrivateKey(privateKey)
      const signature = sign.sign(message, (str: string) => str, 'sha256')
      return signature || ''
    } catch (error) {
      console.error('签名失败:', error)
      return ''
    }
  },

  /**
   * 验证RSA签名
   * @param message 原始消息
   * @param signature 签名
   * @param publicKey 公钥
   * @param hashAlgorithm 哈希算法
   * @returns 签名是否有效
   */
  verify(
    message: string,
    signature: string,
    publicKey: string,
    hashAlgorithm: 'sha1' | 'sha256' | 'sha512' = 'sha256'
  ): boolean {
    try {
      const verify = new JSEncrypt()
      verify.setPublicKey(publicKey)
      return verify.verify(message, signature, (str: string) => str)
    } catch (error) {
      console.error('验证失败:', error)
      return false
    }
  }
}

/**
 * 密码生成器
 */
export const PasswordGenerator = {
  /**
   * 生成随机密码
   * @param length 密码长度
   * @param options 密码选项
   * @returns 生成的密码
   */
  generate(
    length: number = 16,
    options: {
      lowercase?: boolean;
      uppercase?: boolean;
      numbers?: boolean;
      symbols?: boolean;
    } = {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true
    }
  ): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let chars = ''
    if (options.lowercase) chars += lowercase
    if (options.uppercase) chars += uppercase
    if (options.numbers) chars += numbers
    if (options.symbols) chars += symbols

    if (chars === '') chars = lowercase + uppercase + numbers

    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return password
  },

  /**
   * 评估密码强度
   * @param password 要评估的密码
   * @returns 强度评分 (0-100) 和评级 (weak/medium/strong)
   */
  evaluateStrength(password: string): { score: number; level: 'weak' | 'medium' | 'strong' } {
    if (!password) return { score: 0, level: 'weak' }

    let score = 0
    
    // 长度得分
    score += Math.min(password.length * 4, 40)
    
    // 字符多样性得分
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const hasSymbols = /[^a-zA-Z0-9]/.test(password)
    
    let varietyCount = 0
    if (hasLowercase) varietyCount++
    if (hasUppercase) varietyCount++
    if (hasNumbers) varietyCount++
    if (hasSymbols) varietyCount++
    
    score += varietyCount * 10
    
    // 重复字符扣分
    const repeats = password.length - new Set(password.split('')).size
    score -= repeats * 2
    
    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score))
    
    // 确定强度级别
    let level: 'weak' | 'medium' | 'strong' = 'weak'
    if (score >= 80) level = 'strong'
    else if (score >= 50) level = 'medium'
    
    return { score, level }
  }
}

export const generatePassword = (
  length: number,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeNumbers: boolean,
  includeSymbols: boolean
): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = ''
  if (includeUppercase) charset += uppercase
  if (includeLowercase) charset += lowercase
  if (includeNumbers) charset += numbers
  if (includeSymbols) charset += symbols

  if (!charset) {
    throw new Error('请至少选择一种字符类型')
  }

  let password = ''
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length]
  }

  return password
}

export const encrypt = async (
  input: string,
  key: string,
  algorithm: string,
  mode: string,
  padding: string
): Promise<string> => {
  try {
    switch (algorithm) {
      case 'AES':
        return AES.encrypt(input, key, undefined, mode as any)
      case 'DES':
        return DESUtil.encrypt(input, key, {
          mode: mode as any,
          padding: padding as any
        }).encrypted
      case 'RSA':
        return RSA.encrypt(input, key)
      default:
        throw new Error('不支持的加密算法')
    }
  } catch (error) {
    console.error('加密失败:', error)
    throw error
  }
}

export const decrypt = async (
  input: string,
  key: string,
  algorithm: string,
  mode: string,
  padding: string
): Promise<string> => {
  try {
    switch (algorithm) {
      case 'AES':
        return AES.decrypt(input, key, undefined, mode as any)
      case 'DES':
        return DESUtil.decrypt(input, key, {
          mode: mode as any,
          padding: padding as any
        }).decrypted
      case 'RSA':
        return RSA.decrypt(input, key)
      default:
        throw new Error('不支持的解密算法')
    }
  } catch (error) {
    console.error('解密失败:', error)
    throw error
  }
}

export const hash = async (input: string, algorithm: string): Promise<string> => {
  try {
    switch (algorithm.toLowerCase()) {
      case 'md5':
        return Hash.md5(input)
      case 'sha1':
        return Hash.sha1(input)
      case 'sha256':
        return Hash.sha256(input)
      case 'sha512':
        return Hash.sha512(input)
      default:
        throw new Error('不支持的哈希算法')
    }
  } catch (error) {
    console.error('哈希计算失败:', error)
    throw error
  }
}

export default {
  Base64,
  Hash,
  AES,
  RSA,
  PasswordGenerator
} 