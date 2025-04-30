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
 * 安全地处理位置信息，避免地图加载错误
 * 
 * @param response 服务器响应数据
 * @returns 处理后的位置信息，如果解析失败则返回undefined
 */
function safeParseLocation(locString?: string): LocationInfo | undefined {
  if (!locString) return undefined;
  
  try {
    const [lat, lon] = locString.split(',');
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return undefined;
    }
    
    return { latitude, longitude };
  } catch (error) {
    console.error('解析位置信息失败:', error);
    return undefined;
  }
}

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
    
    // 提取位置信息 - 使用安全解析
    const location = safeParseLocation(data.loc);
    
    // 提取ASN信息
    const asnInfo = data.asn ? `${data.asn.asn} ${data.asn.name}` : undefined;
    
    // 返回处理后的数据结构
    return {
      ip: data.ip,
      hostname: data.hostname,
      city: data.city,
      region: data.region,
      country: data.country,
      location,
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