/**
 * IPv6工具函数
 */

/**
 * 生成全局ID
 * 根据RFC 4193，全局ID是一个随机生成的40位值
 * @returns 全局ID（十六进制字符串）
 */
function generateGlobalId(): string {
  const bytes = new Uint8Array(5); // 40 bits = 5 bytes
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 生成IPv6 ULA（唯一本地地址）
 * 格式: fd00::/8 + 全局ID(40位) + 子网ID(16位) + 接口ID(64位)
 * @param subnetId 子网ID（16位，0-FFFF）
 * @param customGlobalId 自定义全局ID（如果不提供则随机生成）
 * @returns 生成的IPv6 ULA地址
 */
export function generateULA(subnetId: number = 0, customGlobalId?: string): string {
  // 验证子网ID
  if (subnetId < 0 || subnetId > 0xFFFF) {
    throw new Error('子网ID必须在0-65535(FFFF)之间');
  }
  
  // 生成或使用提供的全局ID
  const globalId = customGlobalId || generateGlobalId();
  
  // 验证全局ID格式
  if (!/^[0-9a-f]{10}$/i.test(globalId)) {
    throw new Error('全局ID必须是10个十六进制字符（40位）');
  }
  
  // 格式化子网ID为16位十六进制
  const formattedSubnetId = subnetId.toString(16).padStart(4, '0');
  
  // 生成接口ID（64位随机值）
  const interfaceIdBytes = new Uint8Array(8);
  crypto.getRandomValues(interfaceIdBytes);
  const interfaceId = Array.from(interfaceIdBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // 组装ULA地址
  const prefix = 'fd';
  
  // 格式化为标准IPv6地址格式（使用:分隔的8组16位十六进制数）
  const g1 = prefix + globalId.slice(0, 2);
  const g2 = globalId.slice(2, 6);
  const g3 = globalId.slice(6, 10) + formattedSubnetId.slice(0, 2);
  const g4 = formattedSubnetId.slice(2, 4) + interfaceId.slice(0, 2);
  const g5 = interfaceId.slice(2, 6);
  const g6 = interfaceId.slice(6, 10);
  const g7 = interfaceId.slice(10, 14);
  const g8 = interfaceId.slice(14, 16) + '00';
  
  return `${g1}:${g2}:${g3}:${g4}:${g5}:${g6}:${g7}:${g8}`;
}

/**
 * 格式化IPv6地址
 * @param ipv6 IPv6地址字符串
 * @returns 格式化的IPv6地址
 */
export function formatIPv6(ipv6: string): string {
  // 移除所有空格
  let cleanIPv6 = ipv6.replace(/\s/g, '');
  
  // 处理双冒号压缩格式
  if (cleanIPv6.includes('::')) {
    const parts = cleanIPv6.split('::');
    if (parts.length !== 2) {
      throw new Error('无效的IPv6地址格式');
    }
    
    const leftParts = parts[0] ? parts[0].split(':') : [];
    const rightParts = parts[1] ? parts[1].split(':') : [];
    
    // 计算需要填充的零组数量
    const padCount = 8 - (leftParts.length + rightParts.length);
    if (padCount < 0) {
      throw new Error('无效的IPv6地址格式');
    }
    
    // 填充零组
    const padGroups = Array(padCount).fill('0000');
    
    // 合并所有部分
    const allParts = [
      ...leftParts.map(p => p.padStart(4, '0')),
      ...padGroups,
      ...rightParts.map(p => p.padStart(4, '0'))
    ];
    
    return allParts.join(':');
  } else {
    // 标准格式，确保每组4位十六进制
    const parts = cleanIPv6.split(':');
    if (parts.length !== 8) {
      throw new Error('无效的IPv6地址格式');
    }
    
    return parts.map(p => p.padStart(4, '0')).join(':');
  }
}

/**
 * 压缩IPv6地址（去掉前导零和最长的连续零序列）
 * @param ipv6 完整的IPv6地址
 * @returns 压缩后的IPv6地址
 */
export function compressIPv6(ipv6: string): string {
  try {
    // 先标准化
    const expandedIPv6 = formatIPv6(ipv6);
    const groups = expandedIPv6.split(':');
    
    // 移除每组中的前导零
    const trimmedGroups = groups.map(g => g.replace(/^0+(?=.)/, '') || '0');
    
    // 找出最长的连续零序列
    let longestZeroRun = { start: -1, length: 0 };
    let currentRun = { start: -1, length: 0 };
    
    for (let i = 0; i < trimmedGroups.length; i++) {
      if (trimmedGroups[i] === '0') {
        if (currentRun.start === -1) {
          currentRun = { start: i, length: 1 };
        } else {
          currentRun.length++;
        }
      } else if (currentRun.start !== -1) {
        if (currentRun.length > longestZeroRun.length) {
          longestZeroRun = { ...currentRun };
        }
        currentRun = { start: -1, length: 0 };
      }
    }
    
    // 检查最后的一个零运行
    if (currentRun.start !== -1 && currentRun.length > longestZeroRun.length) {
      longestZeroRun = { ...currentRun };
    }
    
    // 如果找到了一个至少长度为2的零序列，进行压缩
    if (longestZeroRun.length >= 2) {
      const beforeZeros = trimmedGroups.slice(0, longestZeroRun.start);
      const afterZeros = trimmedGroups.slice(longestZeroRun.start + longestZeroRun.length);
      
      if (beforeZeros.length === 0 && afterZeros.length === 0) {
        return '::';
      } else if (beforeZeros.length === 0) {
        return '::' + afterZeros.join(':');
      } else if (afterZeros.length === 0) {
        return beforeZeros.join(':') + '::';
      } else {
        return beforeZeros.join(':') + '::' + afterZeros.join(':');
      }
    }
    
    // 没有可压缩的零序列或只有单个零
    return trimmedGroups.join(':');
  } catch {
    // 如果有任何错误，返回原始地址
    return ipv6;
  }
}

/**
 * 验证IPv6地址是否有效
 * @param ipv6 IPv6地址字符串
 * @returns 是否有效
 */
export function isValidIPv6(ipv6: string): boolean {
  // 移除空格
  const address = ipv6.trim();
  
  // 基本格式检查
  const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$|^::$|^([0-9a-f]{1,4}:){0,6}::([0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4}$/i;
  
  return ipv6Regex.test(address);
}

/**
 * 检查IPv6地址是否为ULA地址
 * @param ipv6 IPv6地址
 * @returns 是否为ULA地址
 */
export function isULA(ipv6: string): boolean {
  try {
    // 标准化地址
    const expandedIPv6 = formatIPv6(ipv6);
    // ULA地址以fd00::/8开头
    return expandedIPv6.toLowerCase().startsWith('fd');
  } catch {
    return false;
  }
} 