/**
 * IPv4 工具函数
 */

/**
 * IPv4地址类
 */
export class IPv4Address {
  private _address: number = 0;

  constructor(address: string | number) {
    if (typeof address === 'string') {
      this._address = IPv4Address.parseAddress(address);
    } else {
      this._address = address >>> 0; // 确保是无符号32位整数
    }
  }

  /**
   * 将IPv4地址字符串解析为数字表示
   */
  static parseAddress(address: string): number {
    const parts = address.split('.');
    if (parts.length !== 4) {
      throw new Error('无效的IPv4地址格式');
    }

    let result = 0;
    for (let i = 0; i < 4; i++) {
      const octet = parseInt(parts[i], 10);
      if (isNaN(octet) || octet < 0 || octet > 255) {
        throw new Error('无效的IPv4地址值');
      }
      result = (result << 8) | octet;
    }
    return result >>> 0; // 确保是无符号32位整数
  }

  /**
   * 将掩码位数转换为掩码数字
   */
  static cidrToMask(cidr: number): number {
    if (cidr < 0 || cidr > 32) {
      throw new Error('CIDR范围必须在0-32之间');
    }
    return cidr === 0 ? 0 : ((0xffffffff << (32 - cidr)) >>> 0);
  }

  /**
   * 将掩码数字转换为掩码位数
   */
  static maskToCidr(mask: number): number {
    if (mask === 0) return 0;
    let cidr = 0;
    let m = mask;
    for (let i = 31; i >= 0; i--) {
      if ((m & (1 << i)) !== 0) {
        cidr++;
      } else {
        break;
      }
    }
    return cidr;
  }

  /**
   * 获取点分十进制表示
   */
  toString(): string {
    return [
      (this._address >>> 24) & 0xff,
      (this._address >>> 16) & 0xff,
      (this._address >>> 8) & 0xff,
      this._address & 0xff
    ].join('.');
  }
  
  /**
   * 获取十六进制表示
   */
  toHex(): string {
    return '0x' + this._address.toString(16).padStart(8, '0');
  }
  
  /**
   * 获取二进制表示
   */
  toBinary(): string {
    return this._address.toString(2).padStart(32, '0');
  }
  
  /**
   * 获取整数表示
   */
  toInteger(): number {
    return this._address;
  }

  /**
   * 应用子网掩码
   * @param mask 子网掩码或CIDR
   * @returns 网络地址
   */
  applyMask(mask: number | string): IPv4Address {
    let maskNum: number;
    
    if (typeof mask === 'string') {
      // 如果是CIDR表示法 "x.x.x.x/y"
      if (mask.includes('/')) {
        const cidr = parseInt(mask.split('/')[1], 10);
        maskNum = IPv4Address.cidrToMask(cidr);
      } else {
        // 如果是点分十进制掩码
        maskNum = IPv4Address.parseAddress(mask);
      }
    } else if (mask <= 32) {
      // 如果是CIDR位数
      maskNum = IPv4Address.cidrToMask(mask);
    } else {
      // 如果是掩码数字
      maskNum = mask;
    }
    
    return new IPv4Address(this._address & maskNum);
  }

  /**
   * 获取广播地址
   * @param mask 子网掩码或CIDR
   * @returns 广播地址
   */
  getBroadcast(mask: number | string): IPv4Address {
    let maskNum: number;
    
    if (typeof mask === 'string') {
      if (mask.includes('/')) {
        const cidr = parseInt(mask.split('/')[1], 10);
        maskNum = IPv4Address.cidrToMask(cidr);
      } else {
        maskNum = IPv4Address.parseAddress(mask);
      }
    } else if (mask <= 32) {
      maskNum = IPv4Address.cidrToMask(mask);
    } else {
      maskNum = mask;
    }
    
    return new IPv4Address((this._address & maskNum) | (~maskNum >>> 0));
  }

  /**
   * 计算子网相关信息
   * @param cidr CIDR值
   * @returns 子网信息
   */
  calculateSubnet(cidr: number): {
    networkAddress: string;
    broadcastAddress: string;
    firstHost: string;
    lastHost: string;
    subnetMask: string;
    totalHosts: number;
    usableHosts: number;
    cidr: number;
  } {
    if (cidr < 0 || cidr > 32) {
      throw new Error('CIDR范围必须在0-32之间');
    }
    
    const mask = IPv4Address.cidrToMask(cidr);
    const networkAddress = new IPv4Address(this._address & mask);
    const broadcastAddress = new IPv4Address((this._address & mask) | (~mask >>> 0));
    
    // 可用主机数量
    const hostBits = 32 - cidr;
    const totalHosts = Math.pow(2, hostBits);
    const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;
    
    // 第一个可用主机地址
    let firstHost = '';
    if (usableHosts > 0) {
      firstHost = new IPv4Address(networkAddress.toInteger() + 1).toString();
    } else {
      firstHost = networkAddress.toString();
    }
    
    // 最后一个可用主机地址
    let lastHost = '';
    if (usableHosts > 0) {
      lastHost = new IPv4Address(broadcastAddress.toInteger() - 1).toString();
    } else {
      lastHost = broadcastAddress.toString();
    }
    
    return {
      networkAddress: networkAddress.toString(),
      broadcastAddress: broadcastAddress.toString(),
      firstHost,
      lastHost,
      subnetMask: new IPv4Address(mask).toString(),
      totalHosts,
      usableHosts,
      cidr
    };
  }

  /**
   * 生成IPv4地址范围内的所有地址
   * @param start 起始IP地址字符串
   * @param end 结束IP地址字符串
   * @returns IP地址字符串数组
   */
  static generateRange(start: string, end: string): string[] {
    const startIP = new IPv4Address(start);
    const endIP = new IPv4Address(end);
    
    const startNum = startIP.toInteger();
    const endNum = endIP.toInteger();
    
    if (startNum > endNum) {
      throw new Error('起始地址必须小于或等于结束地址');
    }
    
    const result: string[] = [];
    
    // 如果范围太大，限制生成的数量
    const maxGenerateCount = 10000;
    const count = endNum - startNum + 1;
    
    if (count > maxGenerateCount) {
      throw new Error(`地址范围过大。最多支持生成${maxGenerateCount}个地址`);
    }
    
    for (let i = startNum; i <= endNum; i++) {
      result.push(new IPv4Address(i).toString());
    }
    
    return result;
  }

  /**
   * 检查是否是有效的IPv4地址
   * @param address IPv4地址字符串
   * @returns 是否有效
   */
  static isValid(address: string): boolean {
    try {
      IPv4Address.parseAddress(address);
      return true;
    } catch {
      return false;
    }
  }
} 