/**
 * Ping测试工具
 */

import { silentLog, isIgnorableError } from './error-handler'

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
    // 使用多种方法尝试连接测试
    const methods = [
      () => testWithFetch(host, timeout),
      () => testWithImage(host, timeout),
      () => testWithWebSocket(host, timeout)
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result.success) {
          const end = performance.now();
          return {
            host,
            latency: Math.round(end - start),
            success: true,
            timestamp
          };
        }
      } catch (error) {
        continue;
      }
    }

    // 所有方法都失败，返回失败结果
    const end = performance.now();
    return {
      host,
      latency: Math.round(end - start),
      success: false,
      timestamp
    };
  } catch (error) {
    const end = performance.now();
    return {
      host,
      latency: timeout,
      success: false,
      timestamp
    };
  }
}

/**
 * 使用 Fetch API 测试连接
 */
async function testWithFetch(host: string, timeout: number): Promise<{ success: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let url = host;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${host}`;
    }

    // 尝试使用 no-cors 模式，即使失败也可能表示服务器可达
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    // 对于 no-cors 模式，即使抛出错误也可能表示服务器是可达的
    // 只有网络完全不通才会抛出特定的网络错误
    const errorMessage = (error as Error).message;

    // 使用新的错误处理工具
    silentLog(error, `Fetch测试 (${host})`);

    // 如果是可忽略的错误，认为连接成功
    if (isIgnorableError(error)) {
      return { success: true };
    }

    if (errorMessage.includes('ERR_NETWORK_CHANGED') ||
        errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
        errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
      throw error;
    }
    // 其他错误（如 CORS、连接被拒绝等）可能表示服务器是可达的
    return { success: true };
  }
}

/**
 * 使用图片加载测试连接
 */
async function testWithImage(host: string, timeout: number): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
      reject(new Error('Image loading timeout'));
    }, timeout);

    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({ success: true });
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      // 即使图片加载失败，也可能表示服务器是可达的
      // 404 错误表示服务器响应了，只是资源不存在
      resolve({ success: true });
    };

    // 尝试加载常见的图片资源，使用更可靠的路径
    let url = host;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${host}`;
    }

    // 使用 Google 的公共服务来测试连接性
    if (host.includes('baidu') || host.includes('china')) {
      // 对于中国的网站，使用不同的测试方法
      img.src = `${url}/favicon.ico?_t=${Date.now()}`;
    } else {
      // 对于其他网站，尝试 favicon
      img.src = `${url}/favicon.ico?_t=${Date.now()}`;
    }
  });
}

/**
 * 使用 WebSocket 测试连接（仅用于支持的主机）
 */
async function testWithWebSocket(host: string, timeout: number): Promise<{ success: boolean }> {
  return new Promise((resolve, reject) => {
    try {
      let wsUrl = host;
      if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        wsUrl = `wss://${host}`;
      }

      const ws = new WebSocket(wsUrl);
      const timeoutId = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket timeout'));
      }, timeout);

      ws.onopen = () => {
        clearTimeout(timeoutId);
        ws.close();
        resolve({ success: true });
      };

      ws.onerror = () => {
        clearTimeout(timeoutId);
        ws.close();
        reject(new Error('WebSocket error'));
      };
    } catch (error) {
      reject(error);
    }
  });
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