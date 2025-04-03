import CryptoJS from 'crypto-js';

export class BlowfishUtil {
  /**
   * 加密文本
   * @param text 要加密的文本
   * @param key 密钥
   * @param options 加密选项
   * @returns 加密后的文本
   */
  static encrypt(
    text: string,
    key: string,
    options: {
      mode?: any;
      iv?: string;
      padding?: any;
    } = {}
  ): string {
    const { mode = CryptoJS.mode.CBC, iv, padding = CryptoJS.pad.Pkcs7 } = options;

    if (mode !== CryptoJS.mode.ECB && !iv) {
      throw new Error('IV is required for non-ECB mode');
    }

    const keyWordArray = CryptoJS.enc.Utf8.parse(key);
    const ivWordArray = iv ? CryptoJS.enc.Utf8.parse(iv) : undefined;
    const textWordArray = CryptoJS.enc.Utf8.parse(text);

    const encrypted = CryptoJS.Blowfish.encrypt(textWordArray, keyWordArray, {
      iv: ivWordArray,
      mode,
      padding
    });

    return encrypted.toString();
  }

  /**
   * 解密文本
   * @param encryptedText 加密后的文本
   * @param key 密钥
   * @param options 解密选项
   * @returns 解密后的文本
   */
  static decrypt(
    encryptedText: string,
    key: string,
    options: {
      mode?: any;
      iv?: string;
      padding?: any;
    } = {}
  ): string {
    const { mode = CryptoJS.mode.CBC, iv, padding = CryptoJS.pad.Pkcs7 } = options;

    if (mode !== CryptoJS.mode.ECB && !iv) {
      throw new Error('IV is required for non-ECB mode');
    }

    const keyWordArray = CryptoJS.enc.Utf8.parse(key);
    const ivWordArray = iv ? CryptoJS.enc.Utf8.parse(iv) : undefined;

    const decrypted = CryptoJS.Blowfish.decrypt(encryptedText, keyWordArray, {
      iv: ivWordArray,
      mode,
      padding
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 生成随机密钥
   * @param length 密钥长度（字节）
   * @returns 随机密钥
   */
  static generateKey(length: number = 16): string {
    const words = CryptoJS.lib.WordArray.random(length);
    return CryptoJS.enc.Base64.stringify(words);
  }

  /**
   * 生成随机IV
   * @param length IV长度（字节）
   * @returns 随机IV
   */
  static generateIV(length: number = 8): string {
    const words = CryptoJS.lib.WordArray.random(length);
    return CryptoJS.enc.Base64.stringify(words);
  }
} 