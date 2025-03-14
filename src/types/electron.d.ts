interface IpcRenderer {
  send: (channel: string, ...args: any[]) => void
  on: (channel: string, func: (...args: any[]) => void) => void
  once: (channel: string, func: (...args: any[]) => void) => void
  removeListener: (channel: string, func: (...args: any[]) => void) => void
}

interface CryptoAPI {
  // Base64
  base64Encode: (str: string) => string
  base64Decode: (str: string) => string
  
  // Hash
  hash: (algorithm: string, data: string) => string
  
  // AES
  generateKey: () => string
  generateIV: () => string
  aesEncrypt: (data: string, key: string, iv: string) => string
  aesDecrypt: (data: string, key: string, iv: string) => string
  
  // RSA
  generateRSAKeyPair: () => { publicKey: string; privateKey: string }
  rsaEncrypt: (data: string, publicKey: string) => string
  rsaDecrypt: (data: string, privateKey: string) => string
}

interface ElectronAPI {
  send: (channel: string, ...args: any[]) => void
  on: (channel: string, func: (...args: any[]) => void) => void
  once: (channel: string, func: (...args: any[]) => void) => void
  removeListener: (channel: string, func: (...args: any[]) => void) => void
  crypto: CryptoAPI
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
    electronAPI: ElectronAPI
  }
} 