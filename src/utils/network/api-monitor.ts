/**
 * API 健康监控和性能统计
 */

export interface APIMetrics {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastSuccessTime?: number;
  lastFailureTime?: number;
  errorTypes: Record<string, number>;
  successRate: number;
  isHealthy: boolean;
}

export interface APICall {
  provider: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  errorType?: string;
  responseTime?: number;
}

/**
 * API 监控器
 */
export class APIMonitor {
  private metrics = new Map<string, APIMetrics>();
  private recentCalls: APICall[] = [];
  private maxRecentCalls = 100;

  /**
   * 记录 API 调用开始
   */
  startCall(provider: string): APICall {
    const call: APICall = {
      provider,
      startTime: performance.now(),
      success: false
    };
    
    this.recentCalls.push(call);
    
    // 保持最近调用记录在限制范围内
    if (this.recentCalls.length > this.maxRecentCalls) {
      this.recentCalls.shift();
    }
    
    return call;
  }

  /**
   * 记录 API 调用完成
   */
  endCall(call: APICall, success: boolean, errorType?: string): void {
    call.endTime = performance.now();
    call.responseTime = call.endTime - call.startTime;
    call.success = success;
    call.errorType = errorType;

    this.updateMetrics(call);
  }

  /**
   * 更新指标
   */
  private updateMetrics(call: APICall): void {
    let metrics = this.metrics.get(call.provider);
    
    if (!metrics) {
      metrics = {
        name: call.provider,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        errorTypes: {},
        successRate: 0,
        isHealthy: true
      };
      this.metrics.set(call.provider, metrics);
    }

    metrics.totalRequests++;
    
    if (call.success) {
      metrics.successfulRequests++;
      metrics.lastSuccessTime = Date.now();
    } else {
      metrics.failedRequests++;
      metrics.lastFailureTime = Date.now();
      
      if (call.errorType) {
        metrics.errorTypes[call.errorType] = (metrics.errorTypes[call.errorType] || 0) + 1;
      }
    }

    // 计算平均响应时间
    if (call.responseTime) {
      const totalTime = metrics.averageResponseTime * (metrics.totalRequests - 1) + call.responseTime;
      metrics.averageResponseTime = totalTime / metrics.totalRequests;
    }

    // 计算成功率
    metrics.successRate = metrics.successfulRequests / metrics.totalRequests;
    
    // 判断健康状态（最近10次调用的成功率）
    const recentCallsForProvider = this.recentCalls
      .filter(c => c.provider === call.provider)
      .slice(-10);
    
    if (recentCallsForProvider.length >= 5) {
      const recentSuccessRate = recentCallsForProvider.filter(c => c.success).length / recentCallsForProvider.length;
      metrics.isHealthy = recentSuccessRate >= 0.3; // 30% 成功率认为健康
    }
  }

  /**
   * 获取所有 API 指标
   */
  getAllMetrics(): APIMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * 获取特定 API 指标
   */
  getMetrics(provider: string): APIMetrics | undefined {
    return this.metrics.get(provider);
  }

  /**
   * 获取健康的 API 列表
   */
  getHealthyAPIs(): string[] {
    return Array.from(this.metrics.values())
      .filter(m => m.isHealthy)
      .sort((a, b) => b.successRate - a.successRate)
      .map(m => m.name);
  }

  /**
   * 获取推荐的 API（按性能排序）
   */
  getRecommendedAPIs(): string[] {
    return Array.from(this.metrics.values())
      .filter(m => m.isHealthy && m.totalRequests >= 3)
      .sort((a, b) => {
        // 综合考虑成功率和响应时间
        const scoreA = a.successRate * 1000 - a.averageResponseTime;
        const scoreB = b.successRate * 1000 - b.averageResponseTime;
        return scoreB - scoreA;
      })
      .map(m => m.name);
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.metrics.clear();
    this.recentCalls = [];
  }

  /**
   * 获取统计摘要
   */
  getSummary(): {
    totalAPIs: number;
    healthyAPIs: number;
    totalRequests: number;
    overallSuccessRate: number;
    averageResponseTime: number;
  } {
    const allMetrics = Array.from(this.metrics.values());
    
    if (allMetrics.length === 0) {
      return {
        totalAPIs: 0,
        healthyAPIs: 0,
        totalRequests: 0,
        overallSuccessRate: 0,
        averageResponseTime: 0
      };
    }

    const totalRequests = allMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
    const totalSuccessful = allMetrics.reduce((sum, m) => sum + m.successfulRequests, 0);
    const totalResponseTime = allMetrics.reduce((sum, m) => sum + (m.averageResponseTime * m.totalRequests), 0);

    return {
      totalAPIs: allMetrics.length,
      healthyAPIs: allMetrics.filter(m => m.isHealthy).length,
      totalRequests,
      overallSuccessRate: totalRequests > 0 ? totalSuccessful / totalRequests : 0,
      averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0
    };
  }

  /**
   * 导出统计数据
   */
  exportData(): {
    metrics: APIMetrics[];
    recentCalls: APICall[];
    summary: ReturnType<APIMonitor['getSummary']>;
    exportTime: string;
  } {
    return {
      metrics: this.getAllMetrics(),
      recentCalls: [...this.recentCalls],
      summary: this.getSummary(),
      exportTime: new Date().toISOString()
    };
  }
}

// 全局监控实例
export const whoisAPIMonitor = new APIMonitor();
export const dnsAPIMonitor = new APIMonitor();

/**
 * 监控装饰器 - 自动监控 API 调用
 */
export function monitorAPICall(monitor: APIMonitor, provider: string) {
  return function <T>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<T>>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = async function (...args: any[]): Promise<T> {
      const call = monitor.startCall(provider);
      
      try {
        const result = await method.apply(this, args);
        monitor.endCall(call, true);
        return result;
      } catch (error) {
        const errorType = error?.name || error?.constructor?.name || 'Unknown';
        monitor.endCall(call, false, errorType);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * 获取 API 健康报告
 */
export function getAPIHealthReport(): {
  whois: ReturnType<APIMonitor['getSummary']>;
  dns: ReturnType<APIMonitor['getSummary']>;
  recommendations: {
    whoisAPIs: string[];
    dnsAPIs: string[];
  };
} {
  return {
    whois: whoisAPIMonitor.getSummary(),
    dns: dnsAPIMonitor.getSummary(),
    recommendations: {
      whoisAPIs: whoisAPIMonitor.getRecommendedAPIs(),
      dnsAPIs: dnsAPIMonitor.getRecommendedAPIs()
    }
  };
}
