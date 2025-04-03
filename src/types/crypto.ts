export interface DESOptions {
  mode: 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR';
  padding: 'PKCS7' | 'ISO10126' | 'ISO97971' | 'ZeroPadding' | 'NoPadding';
  iv?: string;
}

export interface DESResult {
  encrypted: string;
  decrypted: string;
}

export interface TripleDESOptions extends DESOptions {
  keySize: 128 | 192;
}

export interface TripleDESResult extends DESResult {}

export interface CryptoHistory {
  id?: number;
  type: 'aes' | 'des' | 'blowfish' | 'rsa' | 'uuid' | 'password' | 'base64';
  mode: 'encrypt' | 'decrypt' | 'generate' | 'encode' | 'decode';
  input: string;
  output: string;
  timestamp: number;
  fileType?: string;
  urlSafe?: boolean;
  config?: {
    keySize?: number;
    mode?: string;
    padding?: string;
    key?: string;
    iv?: string;
    length?: number;
    version?: number;
    format?: string;
  };
} 