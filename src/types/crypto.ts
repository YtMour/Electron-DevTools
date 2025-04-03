export interface DESOptions {
  mode?: any;
  padding?: any;
  iv?: string;
}

export interface DESResult {
  encrypted: string;
  decrypted: string;
}

export interface TripleDESOptions extends DESOptions {
  keySize?: number;
}

export interface TripleDESResult extends DESResult {}

export interface CryptoHistory {
  id?: number;
  tool: string;
  mode: 'encrypt' | 'decrypt' | 'generate' | 'encode' | 'decode' | 'hash';
  input: string;
  output: string;
  timestamp: number;
  params?: {
    algorithm?: string;
    mode?: string;
    padding?: string;
    keySize?: number;
    length?: number;
    key?: string;
    iv?: string;
    publicKey?: string;
    privateKey?: string;
    version?: number;
    format?: string;
    urlSafe?: boolean;
    fileType?: string;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    [key: string]: any;
  };
  
  // 向后兼容旧版本
  type?: string; // 旧版本使用type，新版本使用tool
  algorithm?: string;
  key?: string;
  iv?: string;
  keySize?: number;
  publicKey?: string;
  privateKey?: string;
  length?: number;
  urlSafe?: boolean;
  fileType?: string;
  config?: {
    mode?: string;
    padding?: string;
    key?: string;
    iv?: string;
    length?: number;
    version?: number;
    format?: string;
  };
  options?: string;
} 