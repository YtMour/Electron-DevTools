/**
 * MAC地址工具函数
 */

/**
 * 生成随机MAC地址
 * @param separator 分隔符
 * @param upperCase 是否使用大写
 * @returns MAC地址字符串
 */
export function generateRandomMAC(separator: string = ':', upperCase: boolean = false): string {
  const hexChars = upperCase ? '0123456789ABCDEF' : '0123456789abcdef';
  
  // 生成随机字节
  const randomByte = () => {
    return hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
  };
  
  // 生成随机MAC地址
  let mac = '';
  for (let i = 0; i < 6; i++) {
    mac += randomByte();
    if (i < 5) mac += separator;
  }
  
  // 确保是本地管理的MAC地址 (第二个字节的第一位为1)
  const parts = mac.split(separator);
  const secondByte = parts[0];
  const secondByteVal = parseInt(secondByte, 16);
  parts[0] = ((secondByteVal | 0x02) & 0xfe).toString(16).padStart(2, '0');
  if (upperCase) {
    parts[0] = parts[0].toUpperCase();
  }
  
  return parts.join(separator);
}

/**
 * 格式化MAC地址
 * @param mac MAC地址字符串
 * @param separator 分隔符
 * @param upperCase 是否使用大写
 * @returns 格式化后的MAC地址
 */
export function formatMAC(mac: string, separator: string = ':', upperCase: boolean = false): string {
  // 移除所有非十六进制字符
  let cleanMAC = mac.replace(/[^0-9a-fA-F]/g, '');
  
  // 确保是12个字符
  if (cleanMAC.length !== 12) {
    throw new Error('无效的MAC地址');
  }
  
  // 转换大小写
  if (upperCase) {
    cleanMAC = cleanMAC.toUpperCase();
  } else {
    cleanMAC = cleanMAC.toLowerCase();
  }
  
  // 格式化为带分隔符的形式
  const result = [];
  for (let i = 0; i < 12; i += 2) {
    result.push(cleanMAC.substr(i, 2));
  }
  
  return result.join(separator);
}

/**
 * 验证MAC地址是否有效
 * @param mac MAC地址字符串
 * @returns 是否有效
 */
export function isValidMAC(mac: string): boolean {
  // 支持常见的MAC地址格式: xx:xx:xx:xx:xx:xx, xx-xx-xx-xx-xx-xx, xxxx.xxxx.xxxx
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/;
  return regex.test(mac);
}

/**
 * 获取标准化的MAC地址 (小写，使用:分隔)
 * @param mac MAC地址字符串
 * @returns 标准化的MAC地址
 */
export function normalizeMAC(mac: string): string {
  try {
    // 提取所有十六进制字符
    const hexChars = mac.match(/[0-9A-Fa-f]/g);
    if (!hexChars || hexChars.length !== 12) {
      throw new Error('无效的MAC地址');
    }
    
    const normalized = [];
    for (let i = 0; i < 12; i += 2) {
      normalized.push(hexChars[i] + hexChars[i + 1]);
    }
    
    return normalized.join(':').toLowerCase();
  } catch {
    throw new Error('无法标准化MAC地址');
  }
}

// MAC厂商数据库接口
interface OUIEntry {
  oui: string;    // 组织唯一标识符
  company: string; // 公司名称
  address?: string; // 公司地址
}

// 模拟查询MAC地址厂商信息
export async function lookupMAC(mac: string): Promise<OUIEntry | null> {
  // 在实际应用中，这里可以从API或本地数据库查询
  // 这里仅作为示例，返回几个常见厂商
  try {
    const normalizedMAC = normalizeMAC(mac);
    const oui = normalizedMAC.slice(0, 8); // 前3个字节
    
    // 模拟一些常见厂商
    const knownOUIs: Record<string, OUIEntry> = {
      '00:50:56': { oui: '00:50:56', company: 'VMware, Inc.' },
      '00:0c:29': { oui: '00:0c:29', company: 'VMware, Inc.' },
      '00:1a:11': { oui: '00:1a:11', company: 'Google, Inc.' },
      '00:1b:44': { oui: '00:1b:44', company: 'Apple, Inc.' },
      '00:25:00': { oui: '00:25:00', company: 'Apple, Inc.' },
      '00:03:93': { oui: '00:03:93', company: 'Apple Computer, Inc.' },
      '00:0d:93': { oui: '00:0d:93', company: 'Apple Computer, Inc.' },
      'ac:de:48': { oui: 'ac:de:48', company: 'Apple, Inc.' },
      '00:1e:c2': { oui: '00:1e:c2', company: 'Apple, Inc.' },
      '00:21:e9': { oui: '00:21:e9', company: 'Apple, Inc.' },
      '00:22:41': { oui: '00:22:41', company: 'Apple, Inc.' },
      '00:23:12': { oui: '00:23:12', company: 'Apple, Inc.' },
      '00:23:32': { oui: '00:23:32', company: 'Apple, Inc.' },
      '00:16:cb': { oui: '00:16:cb', company: 'Apple, Inc.' },
      '00:17:f2': { oui: '00:17:f2', company: 'Apple, Inc.' },
      '00:19:e3': { oui: '00:19:e3', company: 'Apple, Inc.' },
      '00:1c:b3': { oui: '00:1c:b3', company: 'Apple, Inc.' },
      '00:1d:4f': { oui: '00:1d:4f', company: 'Apple, Inc.' },
      '00:1f:5b': { oui: '00:1f:5b', company: 'Apple, Inc.' },
      '00:1f:f3': { oui: '00:1f:f3', company: 'Apple, Inc.' },
      '00:21:27': { oui: '00:21:27', company: 'Cisco Systems, Inc' },
      '00:23:5e': { oui: '00:23:5e', company: 'Cisco Systems, Inc' },
      '00:25:83': { oui: '00:25:83', company: 'Cisco Systems, Inc' },
      '00:26:0b': { oui: '00:26:0b', company: 'Cisco Systems, Inc' },
      '00:1a:a1': { oui: '00:1a:a1', company: 'Cisco Systems, Inc' },
      '00:21:a0': { oui: '00:21:a0', company: 'Cisco Systems, Inc' },
      '00:60:09': { oui: '00:60:09', company: 'Cisco Systems, Inc' },
      '00:40:96': { oui: '00:40:96', company: 'Cisco Systems, Inc' },
      '00:50:f0': { oui: '00:50:f0', company: 'Cisco Systems, Inc' },
      '00:1b:54': { oui: '00:1b:54', company: 'Cisco Systems, Inc' },
      '00:aa:bb': { oui: '00:aa:bb', company: 'Microsoft Corporation' },
      '00:12:5a': { oui: '00:12:5a', company: 'Microsoft Corporation' },
      '00:15:5d': { oui: '00:15:5d', company: 'Microsoft Corporation' },
      '00:17:9a': { oui: '00:17:9a', company: 'D-Link Corporation' },
      '00:21:91': { oui: '00:21:91', company: 'D-Link Corporation' },
      '00:22:b0': { oui: '00:22:b0', company: 'D-Link Corporation' }
    };
    
    // 尝试精确匹配前3个字节
    for (const knownOUI in knownOUIs) {
      if (normalizedMAC.startsWith(knownOUI)) {
        return knownOUIs[knownOUI];
      }
    }
    
    return null; // 未找到匹配的厂商
  } catch {
    return null;
  }
}

/**
 * MAC地址工具类
 */

/**
 * 格式化MAC地址为标准格式（使用冒号分隔）
 * @param mac MAC地址字符串
 * @returns 格式化后的MAC地址
 */
export function formatMacAddress(mac: string): string {
  // 移除所有分隔符和空格
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  
  // 如果长度不足12位，填充为12位
  const paddedMac = cleanMac.padStart(12, '0');
  
  // 每两个字符添加一个冒号
  return paddedMac.replace(/(.{2})(?=.)/g, '$1:');
}

/**
 * 判断MAC地址是否有效
 * @param mac MAC地址字符串
 * @returns 是否有效
 */
export function isMacAddressValid(mac: string): boolean {
  // 移除所有分隔符和空格
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  
  // MAC地址长度应为12个十六进制字符（6个字节）
  // 也可以只检查OUI，长度为6个十六进制字符（3个字节）
  return cleanMac.length === 12 || cleanMac.length === 6;
}

/**
 * 判断MAC地址是否为组播地址
 * 组播MAC地址的第一个字节的最低位为1
 * @param mac MAC地址字符串
 * @returns 是否为组播地址
 */
export function isMacAddressMulticast(mac: string): boolean {
  if (!isMacAddressValid(mac)) return false;
  
  // 移除所有分隔符
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  
  // 提取第一个字节
  const firstByte = parseInt(cleanMac.substring(0, 2), 16);
  
  // 检查最低位是否为1（奇数）
  return (firstByte & 0x01) === 0x01;
}

/**
 * 判断MAC地址是否为单播地址
 * 单播MAC地址的第一个字节的最低位为0
 * @param mac MAC地址字符串
 * @returns 是否为单播地址
 */
export function isMacAddressUnicast(mac: string): boolean {
  if (!isMacAddressValid(mac)) return false;
  
  // 移除所有分隔符
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  
  // 提取第一个字节
  const firstByte = parseInt(cleanMac.substring(0, 2), 16);
  
  // 检查最低位是否为0（偶数）
  return (firstByte & 0x01) === 0x00;
}

/**
 * 判断MAC地址是否为广播地址
 * 广播MAC地址为FF:FF:FF:FF:FF:FF
 * @param mac MAC地址字符串
 * @returns 是否为广播地址
 */
export function isMacAddressBroadcast(mac: string): boolean {
  if (!isMacAddressValid(mac)) return false;
  
  // 移除所有分隔符
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  
  // 检查是否全为F
  return cleanMac.toUpperCase() === 'FFFFFFFFFFFF';
}

/**
 * 判断MAC地址是否为本地管理地址（locally administered）
 * 本地管理地址的第一个字节的第二低位为1
 * @param mac MAC地址字符串
 * @returns 是否为本地管理地址
 */
export function isMacAddressLocallyAdministered(mac: string): boolean {
  if (!isMacAddressValid(mac)) return false;
  
  // 移除所有分隔符
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  
  // 提取第一个字节
  const firstByte = parseInt(cleanMac.substring(0, 2), 16);
  
  // 检查第二低位是否为1
  return (firstByte & 0x02) === 0x02;
}

/**
 * 判断MAC地址是否为全球唯一地址（globally unique）
 * 全球唯一地址的第一个字节的第二低位为0
 * @param mac MAC地址字符串
 * @returns 是否为全球唯一地址
 */
export function isMacAddressGloballyUnique(mac: string): boolean {
  if (!isMacAddressValid(mac)) return false;
  
  // 移除所有分隔符
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  
  // 提取第一个字节
  const firstByte = parseInt(cleanMac.substring(0, 2), 16);
  
  // 检查第二低位是否为0
  return (firstByte & 0x02) === 0x00;
}

/**
 * 生成随机MAC地址
 * @param globallyUnique 是否生成全球唯一地址
 * @param multicast 是否生成组播地址
 * @returns 随机MAC地址
 */
export function generateRandomMacAddress(globallyUnique = true, multicast = false): string {
  // 生成随机的6个字节
  const bytes = new Array(6).fill(0).map(() => Math.floor(Math.random() * 256));
  
  // 设置地址类型标志
  if (globallyUnique) {
    // 全球唯一地址：第一个字节的第二低位为0
    bytes[0] &= ~0x02;
  } else {
    // 本地管理地址：第一个字节的第二低位为1
    bytes[0] |= 0x02;
  }
  
  if (multicast) {
    // 组播地址：第一个字节的最低位为1
    bytes[0] |= 0x01;
  } else {
    // 单播地址：第一个字节的最低位为0
    bytes[0] &= ~0x01;
  }
  
  // 转换为十六进制字符串并格式化
  return bytes.map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
}

/**
 * 从MAC地址中提取OUI（组织唯一标识符）
 * @param mac MAC地址字符串
 * @returns OUI字符串
 */
export function extractOUI(mac: string): string {
  if (!isMacAddressValid(mac)) return '';
  
  // 格式化MAC地址
  const formattedMac = formatMacAddress(mac);
  
  // 提取前三个字节
  return formattedMac.split(':').slice(0, 3).join(':');
} 