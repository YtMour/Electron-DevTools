/**
 * 统一查询工具
 * 整合IP地址查询和域名查询功能
 */
import type { IPInfo, LocationInfo } from './ip-info'
import type { DomainInfo } from './domain-info'
import { lookupDomainInfo, resolveDomain } from './domain-info'

/**
 * 查询结果类型
 */
export interface LookupResult {
  query: string;
  type: 'ip' | 'domain';
  ipInfo?: IPInfo;
  domainInfo?: DomainInfo;
}

/**
 * 判断输入是IP还是域名
 * @param input 用户输入
 */
export function identifyInputType(input: string): 'ip' | 'domain' | 'invalid' {
  // IPv4地址正则
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6地址正则
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  // 域名正则
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  if (ipv4Regex.test(input) || ipv6Regex.test(input)) {
    return 'ip';
  } else if (domainRegex.test(input)) {
    return 'domain';
  } else {
    return 'invalid';
  }
}

/**
 * 执行统一查询
 * @param query 查询内容(IP或域名)
 */
export async function unifiedLookup(query: string): Promise<LookupResult> {
  // 去除首尾空格
  query = query.trim();
  
  // 判断是IP还是域名
  const isIP = isValidIP(query);
  const isDomain = isValidDomain(query);
  
  if (!isIP && !isDomain) {
    throw new Error('无效的IP地址或域名格式');
  }
  
  if (isIP) {
    // 查询IP信息
    const ipInfo = await fetchIpInfo(query);
    return {
      query,
      type: 'ip',
      ipInfo
    };
  } else {
    // 查询域名信息
    const domainInfo = await fetchDomainInfo(query);
    // 同时查询解析出的IP信息
    let ipInfo: IPInfo | undefined = undefined;
    
    if (domainInfo.resolvedIp) {
      try {
        ipInfo = await fetchIpInfo(domainInfo.resolvedIp);
      } catch (error) {
        console.error('获取域名解析IP信息失败:', error);
      }
    }
    
    return {
      query,
      type: 'domain',
      domainInfo,
      ipInfo
    };
  }
}

/**
 * 获取当前用户的IP信息
 */
export async function getMyCurrentInfo(): Promise<LookupResult> {
  try {
    // 获取当前IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ip = data.ip;
    
    // 获取IP信息
    return await unifiedLookup(ip);
  } catch (error) {
    throw new Error('获取当前IP信息失败: ' + (error as Error).message);
  }
}

/**
 * 验证IP地址格式
 * @param ip IP地址
 */
function isValidIP(ip: string): boolean {
  // IPv4正则验证
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6正则验证 (简化版)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * 验证域名格式
 * @param domain 域名
 */
function isValidDomain(domain: string): boolean {
  // 支持多级域名和国际化域名
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * 获取IP信息
 * @param ip IP地址
 */
async function fetchIpInfo(ip: string): Promise<IPInfo> {
  try {
    // 使用ipinfo.io API查询IP信息
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    
    if (!response.ok) {
      throw new Error(`网络错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 处理位置信息
    let location: LocationInfo | undefined = undefined;
    if (data.loc) {
      const [latitude, longitude] = data.loc.split(',').map(Number);
      location = { latitude, longitude };
    }
    
    // 返回格式化的数据
    return {
      ip: data.ip,
      hostname: data.hostname || undefined,
      city: data.city || undefined,
      region: data.region || undefined,
      country: data.country || undefined,
      location,
      org: data.org || undefined,
      postal: data.postal || undefined,
      timezone: data.timezone || undefined,
      isp: data.org ? extractISP(data.org) : undefined,
      asn: data.org ? extractASN(data.org) : undefined,
      isVPN: false, // 需要专门的API
      isProxy: false, // 需要专门的API
      isTor: false, // 需要专门的API
      isHosting: false // 需要专门的API
    };
  } catch (error) {
    throw new Error('获取IP信息失败: ' + (error as Error).message);
  }
}

/**
 * 从组织信息中提取ISP名称
 * @param org 组织信息
 */
function extractISP(org: string): string {
  // 组织信息通常是 "AS123 Company Name"
  const parts = org.split(' ');
  if (parts.length > 1 && parts[0].startsWith('AS')) {
    return parts.slice(1).join(' ');
  }
  return org;
}

/**
 * 从组织信息中提取ASN
 * @param org 组织信息
 */
function extractASN(org: string): string | undefined {
  // 组织信息通常是 "AS123 Company Name"
  const parts = org.split(' ');
  if (parts.length > 0 && parts[0].startsWith('AS')) {
    return parts[0];
  }
  return undefined;
}

/**
 * 获取域名信息
 * @param domain 域名
 */
async function fetchDomainInfo(domain: string): Promise<DomainInfo> {
  try {
    // 使用真实DNS查询替代模拟
    const domainInfo = await lookupDomainInfo(domain, {
      dns: true,
      whois: true,
      ip: false // IP信息将在主流程中单独获取
    });
    
    return domainInfo;
  } catch (error) {
    throw new Error('获取域名信息失败: ' + (error as Error).message);
  }
} 