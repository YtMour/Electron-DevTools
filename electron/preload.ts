import { contextBridge, ipcRenderer } from 'electron'
import * as crypto from 'crypto'

// 暴露加密相关的 API
const cryptoAPI = {
  // Base64
  base64Encode: (str: string) => Buffer.from(str).toString('base64'),
  base64Decode: (str: string) => Buffer.from(str, 'base64').toString('utf-8'),
  
  // Hash
  hash: (algorithm: string, data: string) => {
    const hash = crypto.createHash(algorithm)
    hash.update(data)
    return hash.digest('hex')
  },
  
  // AES
  generateKey: () => crypto.randomBytes(32).toString('hex'),
  generateIV: () => crypto.randomBytes(16).toString('hex'),
  
  aesEncrypt: (data: string, key: string, iv: string) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  },
  
  aesDecrypt: (data: string, key: string, iv: string) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(data, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  },
  
  // RSA
  generateRSAKeyPair: () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    return { publicKey, privateKey }
  },
  
  rsaEncrypt: (data: string, publicKey: string) => {
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(data)
    )
    return encrypted.toString('base64')
  },
  
  rsaDecrypt: (data: string, privateKey: string) => {
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      Buffer.from(data, 'base64')
    )
    return decrypted.toString('utf8')
  }
}

// 暴露到渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC 通信
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  once: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (event, ...args) => func(...args))
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func)
  },
  
  // Crypto API
  crypto: cryptoAPI
})
