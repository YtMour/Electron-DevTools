/**
 * 网络相关类型定义
 */

// 重新导出IP信息相关类型
export type { IPInfo, IPInfoResponse } from '@/utils/network/ip-info';

// 重新导出域名信息相关类型
export type { DNSRecord, WhoisInfo, DomainInfo } from '@/utils/network/domain-info';

// 端口扫描结果
export interface PortScanResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
  banner?: string;
}

// 子网计算结果
export interface SubnetCalculationResult {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  cidr: number;
  firstUsableHost: string;
  lastUsableHost: string;
  totalHosts: number;
  usableHosts: number;
  binaryNetworkAddress: string;
  binarySubnetMask: string;
  addressClass: string;
  isPrivate: boolean;
}

// MAC地址信息
export interface MacAddress {
  address: string;
  type: 'global' | 'local' | 'multicast' | 'random';
  vendor?: string;
} 