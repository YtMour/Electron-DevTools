/**
 * Ping测试工具
 */

/**
 * Ping测试结果类型
 */
export interface PingResult {
  host: string;
  latency: number; // 延迟时间(毫秒)
  success: boolean; // 是否成功
  timestamp: number; // 时间戳
}

/**
 * Ping统计数据
 */
export interface PingStatistics {
  host: string;
  sent: number;
  received: number;
  lossRate: number;
  min: number;
  max: number;
  avg: number;
  results: PingResult[];
}

/**
 * 执行Ping测试
 * 由于浏览器无法直接执行ping，此处使用HTTP请求模拟
 * @param host 主机名或IP
 * @param timeout 超时时间(毫秒)
 */
export async function pingHost(host: string, timeout: number = 3000): Promise<PingResult> {
  const start = performance.now();
  const timestamp = Date.now();
  
  try {
    // 构建URL：如果是域名，添加协议(如果没有)
    let url = host;
    
    // 对域名和IP使用不同的处理方式
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (isValidDomain(host)) {
        // 域名尝试使用图片请求（更可能成功通过）
        url = `https://${host}/favicon.ico`;
      } else {
        // 对于IP地址，使用JSONP兼容的API
        url = `https://www.cloudflare.com/cdn-cgi/trace`;
      }
    }
    
    // 添加时间戳防止缓存
    url = `${url}${url.includes('?') ? '&' : '?'}_t=${timestamp}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'GET', // 使用GET请求而非HEAD
      cache: 'no-store',
      signal: controller.signal,
      // 移除no-cors模式，让浏览器可以正确判断响应状态
    }).catch(e => {
      // 通过图片加载方式尝试连接
      return new Promise<Response>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(new Response('', { status: 200 }));
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = `https://${host}/favicon.ico?_t=${timestamp}`;
        
        // 设置超时
        setTimeout(() => {
          img.src = '';
          reject(new Error('Image loading timeout'));
        }, timeout);
      });
    });
    
    clearTimeout(timeoutId);
    
    const end = performance.now();
    const latency = Math.round(end - start);
    
    return {
      host,
      latency,
      success: true,
      timestamp
    };
  } catch (error) {
    const end = performance.now();
    const latency = Math.round(end - start);
    
    return {
      host,
      latency: timeout,
      success: false,
      timestamp
    };
  }
}

/**
 * 批量执行Ping测试
 * @param host 主机名或IP
 * @param count 测试次数
 * @param interval 间隔时间(毫秒)
 */
export async function pingMultiple(host: string, count: number = 4, interval: number = 1000): Promise<PingStatistics> {
  const results: PingResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const result = await pingHost(host);
    results.push(result);
    
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  // 计算统计数据
  const successful = results.filter(r => r.success);
  const latencies = successful.map(r => r.latency);
  
  return {
    host,
    sent: results.length,
    received: successful.length,
    lossRate: (results.length - successful.length) / results.length,
    min: latencies.length ? Math.min(...latencies) : 0,
    max: latencies.length ? Math.max(...latencies) : 0,
    avg: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    results
  };
}

/**
 * 格式化Ping统计结果为表格数据
 * @param stats Ping统计数据
 */
export function formatPingStatistics(stats: PingStatistics): string {
  return `
主机: ${stats.host}
发送数据包: ${stats.sent}
接收数据包: ${stats.received}
丢包率: ${(stats.lossRate * 100).toFixed(1)}%
最小延迟: ${stats.min}ms
最大延迟: ${stats.max}ms
平均延迟: ${stats.avg}ms
`.trim();
}

/**
 * 生成Ping测试结果的图表数据
 * @param stats Ping统计数据
 */
export function generateChartData(stats: PingStatistics) {
  return {
    labels: stats.results.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: `延迟 (ms)`,
      data: stats.results.map(r => r.success ? r.latency : null),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false
    }]
  };
}

/**
 * 检查是否为有效域名
 * @param input 输入字符串
 */
function isValidDomain(input: string): boolean {
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(input);
} 