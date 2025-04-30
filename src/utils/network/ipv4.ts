/**
 * IPv4 工具函数
 */

/**
 * IPv4地址类，用于处理IPv4地址的不同表示形式和转换
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
    if (!address || typeof address !== 'string') {
      throw new Error('无效的IPv4地址：地址不能为空');
    }

    const parts = address.split('.');
    if (parts.length !== 4) {
      throw new Error('无效的IPv4地址格式：应为四段点分十进制格式');
    }

    let result = 0;
    for (let i = 0; i < 4; i++) {
      const octet = parseInt(parts[i], 10);
      if (isNaN(octet) || octet < 0 || octet > 255) {
        throw new Error(`无效的IPv4地址值：第${i+1}个字节 "${parts[i]}" 超出范围`);
      }
      result = (result << 8) | octet;
    }
    return result >>> 0; // 确保是无符号32位整数
  }

  /**
   * 从点分十进制格式创建IPv4地址
   */
  static fromDottedDecimal(address: string): IPv4Address {
    if (!address) {
      throw new Error('点分十进制地址不能为空');
    }
    return new IPv4Address(address);
  }

  /**
   * 从十进制整数格式创建IPv4地址
   */
  static fromDecimal(address: number): IPv4Address {
    if (isNaN(address) || address < 0 || address > 0xffffffff) {
      throw new Error('十进制地址超出有效范围(0-4294967295)');
    }
    return new IPv4Address(address);
  }

  /**
   * 从十六进制格式创建IPv4地址
   */
  static fromHex(hex: string): IPv4Address {
    if (!hex) {
      throw new Error('十六进制地址不能为空');
    }
    
    // 移除可能的0x前缀
    const cleanHex = hex.toLowerCase().startsWith('0x') ? hex.substring(2) : hex;
    
    // 验证十六进制格式
    if (!/^[0-9a-f]{1,8}$/i.test(cleanHex)) {
      throw new Error('无效的十六进制IPv4地址格式');
    }
    
    // 转换为十进制
    const decimal = parseInt(cleanHex, 16);
    if (isNaN(decimal) || decimal < 0 || decimal > 0xffffffff) {
      throw new Error('无效的十六进制IPv4地址：超出有效范围');
    }
    return new IPv4Address(decimal);
  }

  /**
   * 从二进制格式创建IPv4地址
   */
  static fromBinary(binary: string): IPv4Address {
    if (!binary) {
      throw new Error('二进制地址不能为空');
    }
    
    // 移除空格等字符
    const cleanBinary = binary.replace(/\s/g, '');
    
    // 允许不满32位的二进制，自动前补0
    if (!/^[01]+$/.test(cleanBinary)) {
      throw new Error('无效的二进制IPv4地址：只能包含0和1');
    }
    
    if (cleanBinary.length > 32) {
      throw new Error('无效的二进制IPv4地址：长度超过32位');
    }
    
    // 前补0至32位
    const paddedBinary = cleanBinary.padStart(32, '0');
    const decimal = parseInt(paddedBinary, 2);
    return new IPv4Address(decimal);
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
    
    // 验证掩码格式：二进制表示必须是连续的1和连续的0
    const binMask = mask.toString(2).padStart(32, '0');
    if (!/^1*0*$/.test(binMask)) {
      throw new Error('无效的子网掩码：不是连续的1后跟连续的0');
    }
    
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
   * 获取点分十进制表示
   */
  toDottedDecimal(): string {
    return this.toString();
  }
  
  /**
   * 获取十六进制表示
   */
  toHex(): string {
    return this._address.toString(16).padStart(8, '0');
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
   * 获取十进制表示
   */
  toDecimal(): number {
    return this.toInteger();
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
        const parts = mask.split('/');
        if (parts.length !== 2) {
          throw new Error('无效的CIDR格式：应为"x.x.x.x/y"');
        }
        const cidr = parseInt(parts[1], 10);
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
          throw new Error('无效的CIDR值：前缀长度应在0-32之间');
        }
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
        const parts = mask.split('/');
        if (parts.length !== 2) {
          throw new Error('无效的CIDR格式：应为"x.x.x.x/y"');
        }
        const cidr = parseInt(parts[1], 10);
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
          throw new Error('无效的CIDR值：前缀长度应在0-32之间');
        }
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
    if (!start || !end) {
      throw new Error('起始和结束地址都不能为空');
    }

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
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    try {
      IPv4Address.parseAddress(address);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 比较两个IP地址
   * @param other 另一个IP地址
   * @returns 比较结果：-1小于，0等于，1大于
   */
  compareTo(other: IPv4Address): number {
    const thisAddr = this.toInteger();
    const otherAddr = other.toInteger();
    
    if (thisAddr < otherAddr) return -1;
    if (thisAddr > otherAddr) return 1;
    return 0;
  }
  
  /**
   * 检查IP地址是否在给定范围内
   * @param start 范围开始地址
   * @param end 范围结束地址
   * @returns 是否在范围内
   */
  isInRange(start: IPv4Address, end: IPv4Address): boolean {
    const addr = this.toInteger();
    const startAddr = start.toInteger();
    const endAddr = end.toInteger();
    
    return addr >= startAddr && addr <= endAddr;
  }
} 