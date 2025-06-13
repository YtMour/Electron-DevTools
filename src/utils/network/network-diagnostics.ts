/**
 * 网络诊断工具
 * 提供网络连接测试和问题诊断功能
 */

export interface NetworkDiagnosticResult {
  test: string;
  success: boolean;
  message: string;
  latency?: number;
  details?: any;
}

export interface NetworkDiagnosticReport {
  overall: 'success' | 'warning' | 'error';
  results: NetworkDiagnosticResult[];
  recommendations: string[];
}

/**
 * 执行网络诊断
 */
export async function runNetworkDiagnostics(): Promise<NetworkDiagnosticReport> {
  const results: NetworkDiagnosticResult[] = [];
  
  // 测试基本网络连接
  results.push(await testBasicConnectivity());
  
  // 测试DNS解析
  results.push(await testDNSResolution());
  
  // 测试HTTPS连接
  results.push(await testHTTPSConnection());
  
  // 测试API可用性
  results.push(await testAPIAvailability());
  
  // 分析结果
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  let overall: 'success' | 'warning' | 'error';
  if (successCount === totalCount) {
    overall = 'success';
  } else if (successCount >= totalCount / 2) {
    overall = 'warning';
  } else {
    overall = 'error';
  }
  
  // 生成建议
  const recommendations = generateRecommendations(results);
  
  return {
    overall,
    results,
    recommendations
  };
}

/**
 * 测试基本网络连接
 */
async function testBasicConnectivity(): Promise<NetworkDiagnosticResult> {
  const start = performance.now();
  
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    
    const latency = Math.round(performance.now() - start);
    
    return {
      test: '基本网络连接',
      success: true,
      message: '网络连接正常',
      latency
    };
  } catch (error) {
    return {
      test: '基本网络连接',
      success: false,
      message: '网络连接失败，请检查网络设置',
      details: error
    };
  }
}

/**
 * 测试DNS解析
 */
async function testDNSResolution(): Promise<NetworkDiagnosticResult> {
  const start = performance.now();
  
  try {
    const response = await fetch('https://cloudflare-dns.com/dns-query?name=google.com&type=A', {
      headers: {
        'Accept': 'application/dns-json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DNS查询失败: ${response.status}`);
    }
    
    const data = await response.json();
    const latency = Math.round(performance.now() - start);
    
    if (data.Answer && data.Answer.length > 0) {
      return {
        test: 'DNS解析',
        success: true,
        message: 'DNS解析正常',
        latency,
        details: data.Answer
      };
    } else {
      return {
        test: 'DNS解析',
        success: false,
        message: 'DNS解析无结果',
        details: data
      };
    }
  } catch (error) {
    return {
      test: 'DNS解析',
      success: false,
      message: 'DNS解析失败，可能是DNS服务器问题',
      details: error
    };
  }
}

/**
 * 测试HTTPS连接
 */
async function testHTTPSConnection(): Promise<NetworkDiagnosticResult> {
  const start = performance.now();
  
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      cache: 'no-store'
    });
    
    const latency = Math.round(performance.now() - start);
    
    if (response.ok) {
      return {
        test: 'HTTPS连接',
        success: true,
        message: 'HTTPS连接正常',
        latency
      };
    } else {
      return {
        test: 'HTTPS连接',
        success: false,
        message: `HTTPS连接异常: ${response.status}`,
        details: { status: response.status, statusText: response.statusText }
      };
    }
  } catch (error) {
    return {
      test: 'HTTPS连接',
      success: false,
      message: 'HTTPS连接失败，可能是证书或代理问题',
      details: error
    };
  }
}

/**
 * 测试API可用性
 */
async function testAPIAvailability(): Promise<NetworkDiagnosticResult> {
  const apis = [
    { name: 'IP查询API', url: 'https://ipinfo.io/json' },
    { name: 'DNS查询API', url: 'https://cloudflare-dns.com/dns-query?name=example.com&type=A' }
  ];
  
  const results = [];
  
  for (const api of apis) {
    const start = performance.now();
    try {
      const response = await fetch(api.url, {
        headers: api.name.includes('DNS') ? { 'Accept': 'application/dns-json' } : {}
      });
      
      const latency = Math.round(performance.now() - start);
      
      if (response.ok) {
        results.push({
          name: api.name,
          success: true,
          latency
        });
      } else {
        results.push({
          name: api.name,
          success: false,
          status: response.status
        });
      }
    } catch (error) {
      results.push({
        name: api.name,
        success: false,
        error: error
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  return {
    test: 'API可用性',
    success: successCount > 0,
    message: `${successCount}/${totalCount} 个API可用`,
    details: results
  };
}

/**
 * 生成建议
 */
function generateRecommendations(results: NetworkDiagnosticResult[]): string[] {
  const recommendations: string[] = [];
  
  const failedTests = results.filter(r => !r.success);
  
  if (failedTests.length === 0) {
    recommendations.push('网络状态良好，所有功能应该正常工作');
    return recommendations;
  }
  
  for (const test of failedTests) {
    switch (test.test) {
      case '基本网络连接':
        recommendations.push('检查网络连接，确保设备已连接到互联网');
        recommendations.push('尝试重启路由器或联系网络服务提供商');
        break;
      case 'DNS解析':
        recommendations.push('尝试更换DNS服务器（如8.8.8.8或1.1.1.1）');
        recommendations.push('清除DNS缓存或重启网络适配器');
        break;
      case 'HTTPS连接':
        recommendations.push('检查系统时间是否正确');
        recommendations.push('检查防火墙或代理设置');
        break;
      case 'API可用性':
        recommendations.push('某些网络工具功能可能受限');
        recommendations.push('尝试使用VPN或等待网络状况改善');
        break;
    }
  }
  
  return recommendations;
}

/**
 * 快速网络测试
 */
export async function quickNetworkTest(): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store'
    });
    return true;
  } catch (error) {
    return false;
  }
}
