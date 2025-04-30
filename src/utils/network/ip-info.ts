/**
 * IP信息查询工具
 * 使用IPinfo API获取IP地址的详细信息
 */

/**
 * 地理位置信息
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
}

/**
 * IP信息类型
 */
export interface IPInfo {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  location?: LocationInfo;
  org?: string;
  postal?: string;
  timezone?: string;
  isp?: string;
  asn?: string;
  isVPN?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  isHosting?: boolean;
  domains?: string[];
}

/**
 * IPinfo API响应类型
 */
export interface IPInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  asn?: {
    asn: string;
    name: string;
    domain: string;
    route: string;
    type: string;
  };
  company?: {
    name: string;
    domain: string;
    type: string;
  };
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
    hosting: boolean;
    service: string;
  };
  abuse?: {
    address: string;
    country: string;
    email: string;
    name: string;
    network: string;
    phone: string;
  };
  domains?: {
    ip: string;
    total: number;
    domains: string[];
  };
}

/**
 * IPinfo API Token
 * 请替换为您的实际token
 */
const IPINFO_TOKEN = ''; // 可以设置为空字符串使用免费额度

/**
 * 从IPinfo查询IP地址信息
 * @param ip IP地址或域名
 * @returns 处理后的IP信息
 */
export async function lookupIPInfo(ip: string): Promise<IPInfo> {
  try {
    // 构建请求URL
    let url = `https://ipinfo.io/${ip}/json`;
    if (IPINFO_TOKEN) {
      url += `?token=${IPINFO_TOKEN}`;
    }
    
    // 发送请求
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`查询失败: ${response.status} ${response.statusText}`);
    }
    
    const data: IPInfoResponse = await response.json();
    
    // 提取位置信息
    let latitude: number | undefined;
    let longitude: number | undefined;
    
    if (data.loc) {
      const [lat, lon] = data.loc.split(',');
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    }
    
    // 提取ASN信息
    const asnInfo = data.asn ? `${data.asn.asn} ${data.asn.name}` : undefined;
    
    // 返回处理后的数据结构
    return {
      ip: data.ip,
      hostname: data.hostname,
      city: data.city,
      region: data.region,
      country: data.country,
      location: (latitude && longitude) ? {
        latitude,
        longitude
      } : undefined,
      org: data.org,
      isp: data.org?.split(' ').slice(1).join(' ') || data.company?.name,
      asn: asnInfo,
      timezone: data.timezone,
      isProxy: data.privacy?.proxy,
      isVPN: data.privacy?.vpn,
      isTor: data.privacy?.tor,
      isHosting: data.privacy?.hosting,
      postal: data.postal,
      domains: data.domains?.domains
    };
  } catch (error) {
    console.error('IP信息查询失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户的IP地址
 * @returns 当前用户的IP地址信息
 */
export async function getMyIPInfo(): Promise<IPInfo> {
  try {
    return await lookupIPInfo('');
  } catch (error) {
    console.error('获取当前IP信息失败:', error);
    throw error;
  }
}

/**
 * 获取地图URL
 * @param latitude 纬度
 * @param longitude 经度
 * @param zoom 缩放级别
 * @returns 地图URL
 */
export function getMapUrl(latitude: number, longitude: number, zoom: number = 13): string {
  // 高德地图静态图API
  const key = '8325164e247e15eea68b59e89200988b'; // 应替换为实际的API密钥
  
  // 高德地图接口使用经度在前，纬度在后
  return `https://restapi.amap.com/v3/staticmap?location=${longitude},${latitude}&zoom=${zoom}&size=600x300&markers=mid,,A:${longitude},${latitude}&key=${key}`;
} 