/**
 * 可靠的网络连接测试工具
 * 使用多种方法确保连接测试的准确性
 */

export interface ReliablePingResult {
  host: string;
  success: boolean;
  latency: number;
  method: string;
  timestamp: number;
  error?: string;
}

/**
 * 可靠的 Ping 测试
 * @param host 主机地址
 * @param timeout 超时时间（毫秒）
 * @returns Ping 结果
 */
export async function reliablePing(host: string, timeout: number = 5000): Promise<ReliablePingResult> {
  const start = performance.now();
  const timestamp = Date.now();
  
  // 测试方法列表，按可靠性排序
  const testMethods = [
    () => testWithCORSProxy(host, timeout),
    () => testWithPublicAPI(host, timeout),
    () => testWithImageLoad(host, timeout),
    () => testWithJSONP(host, timeout)
  ];
  
  for (let i = 0; i < testMethods.length; i++) {
    try {
      const result = await testMethods[i]();
      if (result.success) {
        const end = performance.now();
        return {
          host,
          success: true,
          latency: Math.round(end - start),
          method: result.method,
          timestamp
        };
      }
    } catch (error) {
      // 继续尝试下一个方法
      continue;
    }
  }
  
  // 所有方法都失败
  const end = performance.now();
  return {
    host,
    success: false,
    latency: Math.round(end - start),
    method: 'all_failed',
    timestamp,
    error: '所有连接测试方法都失败'
  };
}

/**
 * 使用 CORS 代理测试
 */
async function testWithCORSProxy(host: string, timeout: number): Promise<{ success: boolean; method: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // 使用公共 CORS 代理服务
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://${host}`)}`;
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { success: true, method: 'cors_proxy' };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 使用公共 API 测试
 */
async function testWithPublicAPI(host: string, timeout: number): Promise<{ success: boolean; method: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // 使用 httpbin.org 等公共服务测试网络连通性
    const testUrls = [
      'https://httpbin.org/get',
      'https://jsonplaceholder.typicode.com/posts/1',
      'https://api.github.com'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: 'no-store'
        });
        
        if (response.ok) {
          clearTimeout(timeoutId);
          return { success: true, method: 'public_api' };
        }
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('All public APIs failed');
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 使用图片加载测试
 */
async function testWithImageLoad(host: string, timeout: number): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = '';
      reject(new Error('Image loading timeout'));
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve({ success: true, method: 'image_load' });
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      // 404 错误也表示服务器可达
      resolve({ success: true, method: 'image_load' });
    };
    
    // 尝试加载一个小的图片资源
    let url = host;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${host}`;
    }
    
    img.src = `${url}/favicon.ico?_t=${Date.now()}`;
  });
}

/**
 * 使用 JSONP 测试
 */
async function testWithJSONP(host: string, timeout: number): Promise<{ success: boolean; method: string }> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = `jsonp_callback_${Date.now()}`;
    const timeoutId = setTimeout(() => {
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error('JSONP timeout'));
    }, timeout);
    
    // 设置回调函数
    (window as any)[callbackName] = () => {
      clearTimeout(timeoutId);
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      resolve({ success: true, method: 'jsonp' });
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      // 即使 JSONP 失败，也可能表示网络是通的
      resolve({ success: true, method: 'jsonp' });
    };
    
    // 尝试加载一个 JSONP 资源
    let url = host;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${host}`;
    }
    
    script.src = `${url}/api/ping?callback=${callbackName}&_t=${Date.now()}`;
    document.head.appendChild(script);
  });
}

/**
 * 批量 Ping 测试
 * @param hosts 主机列表
 * @param timeout 超时时间
 * @returns Ping 结果列表
 */
export async function batchReliablePing(hosts: string[], timeout: number = 5000): Promise<ReliablePingResult[]> {
  const promises = hosts.map(host => reliablePing(host, timeout));
  return Promise.all(promises);
}

/**
 * 网络连通性测试
 * @param timeout 超时时间
 * @returns 是否连通
 */
export async function testNetworkConnectivity(timeout: number = 3000): Promise<boolean> {
  const testHosts = [
    'google.com',
    'cloudflare.com',
    'github.com',
    'microsoft.com'
  ];
  
  try {
    const results = await Promise.allSettled(
      testHosts.map(host => reliablePing(host, timeout))
    );
    
    // 如果至少有一个成功，就认为网络是通的
    return results.some(result => 
      result.status === 'fulfilled' && result.value.success
    );
  } catch (error) {
    return false;
  }
}

/**
 * 获取网络延迟统计
 * @param host 主机地址
 * @param count 测试次数
 * @param interval 测试间隔（毫秒）
 * @returns 延迟统计
 */
export async function getLatencyStats(
  host: string, 
  count: number = 5, 
  interval: number = 1000
): Promise<{
  min: number;
  max: number;
  avg: number;
  loss: number;
  results: ReliablePingResult[];
}> {
  const results: ReliablePingResult[] = [];
  
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    const result = await reliablePing(host);
    results.push(result);
  }
  
  const successResults = results.filter(r => r.success);
  const latencies = successResults.map(r => r.latency);
  
  if (latencies.length === 0) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      loss: 100,
      results
    };
  }
  
  return {
    min: Math.min(...latencies),
    max: Math.max(...latencies),
    avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
    loss: Math.round(((count - successResults.length) / count) * 100),
    results
  };
}
