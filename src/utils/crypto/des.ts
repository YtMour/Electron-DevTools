import CryptoJS from 'crypto-js';
import type { DESOptions, DESResult, TripleDESOptions, TripleDESResult } from '@/types/crypto';

type PaddingType = 'Pkcs7' | 'Iso10126' | 'Iso97971' | 'ZeroPadding' | 'NoPadding';

export const DESUtil = {
  /**
   * DES 加密
   * @param text 要加密的文本
   * @param key 密钥（16位十六进制）
   * @param options 加密选项
   * @returns 加密结果
   */
  encrypt(plaintext: string, key: string, options: DESOptions = {}): DESResult {
    try {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const config: any = {
        mode: options.mode ? CryptoJS.mode[options.mode as keyof typeof CryptoJS.mode] : CryptoJS.mode.CBC,
        padding: options.padding ? CryptoJS.pad[options.padding as keyof typeof CryptoJS.pad] : CryptoJS.pad.Pkcs7
      };

      if (options.iv) {
        config.iv = CryptoJS.enc.Utf8.parse(options.iv);
      }

      const encrypted = CryptoJS.DES.encrypt(plaintext, keyHex, config);
      return {
        encrypted: encrypted.toString(),
        decrypted: plaintext
      };
    } catch (error) {
      console.error('DES加密错误:', error);
      throw new Error('DES加密失败');
    }
  },

  /**
   * DES 解密
   * @param encrypted 加密文本
   * @param key 密钥（16位十六进制）
   * @param options 解密选项
   * @returns 解密结果
   */
  decrypt(ciphertext: string, key: string, options: DESOptions = {}): DESResult {
    try {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const config: any = {
        mode: options.mode ? CryptoJS.mode[options.mode as keyof typeof CryptoJS.mode] : CryptoJS.mode.CBC,
        padding: options.padding ? CryptoJS.pad[options.padding as keyof typeof CryptoJS.pad] : CryptoJS.pad.Pkcs7
      };

      if (options.iv) {
        config.iv = CryptoJS.enc.Utf8.parse(options.iv);
      }

      const decrypted = CryptoJS.DES.decrypt(ciphertext, keyHex, config);
      return {
        encrypted: ciphertext,
        decrypted: decrypted.toString(CryptoJS.enc.Utf8)
      };
    } catch (error) {
      console.error('DES解密错误:', error);
      throw new Error('DES解密失败');
    }
  },

  /**
   * 3DES 加密
   * @param text 要加密的文本
   * @param key 密钥（32位或48位十六进制）
   * @param options 加密选项
   * @returns 加密结果
   */
  tripleEncrypt(plaintext: string, key: string, options: TripleDESOptions = {}): TripleDESResult {
    try {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const config: any = {
        mode: options.mode ? CryptoJS.mode[options.mode as keyof typeof CryptoJS.mode] : CryptoJS.mode.CBC,
        padding: options.padding ? CryptoJS.pad[options.padding as keyof typeof CryptoJS.pad] : CryptoJS.pad.Pkcs7
      };

      if (options.iv) {
        config.iv = CryptoJS.enc.Utf8.parse(options.iv);
      }

      const encrypted = CryptoJS.TripleDES.encrypt(plaintext, keyHex, config);
      return {
        encrypted: encrypted.toString(),
        decrypted: plaintext
      };
    } catch (error) {
      console.error('3DES加密错误:', error);
      throw new Error('3DES加密失败');
    }
  },

  /**
   * 3DES 解密
   * @param encrypted 加密文本
   * @param key 密钥（32位或48位十六进制）
   * @param options 解密选项
   * @returns 解密结果
   */
  tripleDecrypt(ciphertext: string, key: string, options: TripleDESOptions = {}): TripleDESResult {
    try {
      const keyHex = CryptoJS.enc.Utf8.parse(key);
      const config: any = {
        mode: options.mode ? CryptoJS.mode[options.mode as keyof typeof CryptoJS.mode] : CryptoJS.mode.CBC,
        padding: options.padding ? CryptoJS.pad[options.padding as keyof typeof CryptoJS.pad] : CryptoJS.pad.Pkcs7
      };

      if (options.iv) {
        config.iv = CryptoJS.enc.Utf8.parse(options.iv);
      }

      const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, keyHex, config);
      return {
        encrypted: ciphertext,
        decrypted: decrypted.toString(CryptoJS.enc.Utf8)
      };
    } catch (error) {
      console.error('3DES解密错误:', error);
      throw new Error('3DES解密失败');
    }
  },

  /**
   * 生成随机密钥
   * @returns 16位十六进制密钥
   */
  generateKey(): string {
    return CryptoJS.lib.WordArray.random(8).toString();
  },

  /**
   * 生成随机 IV
   * @returns 16位十六进制 IV
   */
  generateIV(): string {
    return CryptoJS.lib.WordArray.random(8).toString();
  },

  /**
   * 获取填充方式名称
   * @param padding 填充方式
   * @returns CryptoJS 填充方式名称
   */
  getPaddingName(padding: string): PaddingType {
    switch (padding) {
      case 'PKCS7':
        return 'Pkcs7';
      case 'ISO10126':
        return 'Iso10126';
      case 'ISO97971':
        return 'Iso97971';
      case 'ZeroPadding':
        return 'ZeroPadding';
      case 'NoPadding':
        return 'NoPadding';
      default:
        return 'Pkcs7';
    }
  }
}; 