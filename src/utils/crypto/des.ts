import CryptoJS from 'crypto-js';
import type { DESOptions, DESResult, TripleDESOptions, TripleDESResult } from '@/types/crypto';

type PaddingType = 'Pkcs7' | 'Iso10126' | 'Iso97971' | 'ZeroPadding' | 'NoPadding';

export class DESUtil {
  /**
   * DES 加密
   * @param text 要加密的文本
   * @param key 密钥（16位十六进制）
   * @param options 加密选项
   * @returns 加密结果
   */
  static encrypt(text: string, key: string, options: DESOptions): DESResult {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const iv = options.iv ? CryptoJS.enc.Hex.parse(options.iv) : undefined;

    const config = {
      mode: CryptoJS.mode[options.mode],
      padding: CryptoJS.pad[this.getPaddingName(options.padding) as PaddingType],
      iv: iv,
    };

    const encrypted = CryptoJS.DES.encrypt(text, keyHex, config);
    const decrypted = CryptoJS.DES.decrypt(encrypted, keyHex, config);

    return {
      encrypted: encrypted.toString(),
      decrypted: decrypted.toString(CryptoJS.enc.Utf8),
    };
  }

  /**
   * DES 解密
   * @param encrypted 加密文本
   * @param key 密钥（16位十六进制）
   * @param options 解密选项
   * @returns 解密结果
   */
  static decrypt(encrypted: string, key: string, options: DESOptions): DESResult {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const iv = options.iv ? CryptoJS.enc.Hex.parse(options.iv) : undefined;

    const config = {
      mode: CryptoJS.mode[options.mode],
      padding: CryptoJS.pad[this.getPaddingName(options.padding) as PaddingType],
      iv: iv,
    };

    const decrypted = CryptoJS.DES.decrypt(encrypted, keyHex, config);

    return {
      encrypted: encrypted,
      decrypted: decrypted.toString(CryptoJS.enc.Utf8),
    };
  }

  /**
   * 3DES 加密
   * @param text 要加密的文本
   * @param key 密钥（32位或48位十六进制）
   * @param options 加密选项
   * @returns 加密结果
   */
  static tripleEncrypt(text: string, key: string, options: TripleDESOptions): TripleDESResult {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const iv = options.iv ? CryptoJS.enc.Hex.parse(options.iv) : undefined;

    const config = {
      mode: CryptoJS.mode[options.mode],
      padding: CryptoJS.pad[this.getPaddingName(options.padding) as PaddingType],
      iv: iv,
    };

    const encrypted = CryptoJS.TripleDES.encrypt(text, keyHex, config);
    const decrypted = CryptoJS.TripleDES.decrypt(encrypted, keyHex, config);

    return {
      encrypted: encrypted.toString(),
      decrypted: decrypted.toString(CryptoJS.enc.Utf8),
    };
  }

  /**
   * 3DES 解密
   * @param encrypted 加密文本
   * @param key 密钥（32位或48位十六进制）
   * @param options 解密选项
   * @returns 解密结果
   */
  static tripleDecrypt(encrypted: string, key: string, options: TripleDESOptions): TripleDESResult {
    const keyHex = CryptoJS.enc.Hex.parse(key);
    const iv = options.iv ? CryptoJS.enc.Hex.parse(options.iv) : undefined;

    const config = {
      mode: CryptoJS.mode[options.mode],
      padding: CryptoJS.pad[this.getPaddingName(options.padding) as PaddingType],
      iv: iv,
    };

    const decrypted = CryptoJS.TripleDES.decrypt(encrypted, keyHex, config);

    return {
      encrypted: encrypted,
      decrypted: decrypted.toString(CryptoJS.enc.Utf8),
    };
  }

  /**
   * 生成随机密钥
   * @returns 16位十六进制密钥
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(8).toString();
  }

  /**
   * 生成随机 IV
   * @returns 16位十六进制 IV
   */
  static generateIV(): string {
    return CryptoJS.lib.WordArray.random(8).toString();
  }

  /**
   * 获取填充方式名称
   * @param padding 填充方式
   * @returns CryptoJS 填充方式名称
   */
  private static getPaddingName(padding: DESOptions['padding']): PaddingType {
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
} 