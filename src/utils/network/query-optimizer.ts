/**
 * 智能查询优化器
 * 基于历史性能数据优化 API 调用顺序和策略
 */

import { whoisAPIMonitor, dnsAPIMonitor, type APIMonitor } from './api-monitor';

export interface QueryStrategy {
  name: string;
  description: string;
  providerOrder: string[];
  maxConcurrent: number;
  timeoutMs: number;
  retryCount: number;
}

export interface OptimizationConfig {
  preferFastAPIs: boolean;
  preferReliableAPIs: boolean;
  enableConcurrentQueries: boolean;
  adaptiveTimeout: boolean;
  learningEnabled: boolean;
}

/**
 * 查询优化器
 */
export class QueryOptimizer {
  private config: OptimizationConfig = {
    preferFastAPIs: true,
    preferReliableAPIs: true,
    enableConcurrentQueries: false,
    adaptiveTimeout: true,
    learningEnabled: true
  };

  private strategies = new Map<string, QueryStrategy>();

  constructor() {
    this.initializeStrategies();
  }

  /**
   * 初始化查询策略
   */
  private initializeStrategies(): void {
    // 快速优先策略
    this.strategies.set('fast', {
      name: 'fast',
      description: '优先使用响应速度快的 API',
      providerOrder: [],
      maxConcurrent: 2,
      timeoutMs: 5000,
      retryCount: 1
    });

    // 可靠性优先策略
    this.strategies.set('reliable', {
      name: 'reliable',
      description: '优先使用成功率高的 API',
      providerOrder: [],
      maxConcurrent: 1,
      timeoutMs: 10000,
      retryCount: 2
    });

    // 平衡策略
    this.strategies.set('balanced', {
      name: 'balanced',
      description: '平衡速度和可靠性',
      providerOrder: [],
      maxConcurrent: 2,
      timeoutMs: 8000,
      retryCount: 1
    });

    // 并发策略
    this.strategies.set('concurrent', {
      name: 'concurrent',
      description: '并发查询多个 API，使用最快响应',
      providerOrder: [],
      maxConcurrent: 3,
      timeoutMs: 15000,
      retryCount: 0
    });
  }

  /**
   * 获取优化的 Whois 查询策略
   */
  getOptimizedWhoisStrategy(domain: string): QueryStrategy {
    const monitor = whoisAPIMonitor;
    const baseStrategy = this.getBaseStrategy();
    
    return {
      ...baseStrategy,
      providerOrder: this.optimizeProviderOrder(monitor, baseStrategy.name),
      timeoutMs: this.getAdaptiveTimeout(monitor, baseStrategy.timeoutMs)
    };
  }

  /**
   * 获取优化的 DNS 查询策略
   */
  getOptimizedDNSStrategy(domain: string): QueryStrategy {
    const monitor = dnsAPIMonitor;
    const baseStrategy = this.getBaseStrategy();
    
    return {
      ...baseStrategy,
      providerOrder: this.optimizeProviderOrder(monitor, baseStrategy.name),
      timeoutMs: this.getAdaptiveTimeout(monitor, baseStrategy.timeoutMs)
    };
  }

  /**
   * 获取基础策略
   */
  private getBaseStrategy(): QueryStrategy {
    if (this.config.enableConcurrentQueries) {
      return this.strategies.get('concurrent')!;
    }
    
    if (this.config.preferFastAPIs && this.config.preferReliableAPIs) {
      return this.strategies.get('balanced')!;
    }
    
    if (this.config.preferFastAPIs) {
      return this.strategies.get('fast')!;
    }
    
    if (this.config.preferReliableAPIs) {
      return this.strategies.get('reliable')!;
    }
    
    return this.strategies.get('balanced')!;
  }

  /**
   * 优化 API 提供商顺序
   */
  private optimizeProviderOrder(monitor: APIMonitor, strategyName: string): string[] {
    const allMetrics = monitor.getAllMetrics();
    
    if (allMetrics.length === 0) {
      return []; // 没有历史数据，使用默认顺序
    }

    // 过滤健康的 API
    const healthyAPIs = allMetrics.filter(m => m.isHealthy && m.totalRequests >= 2);
    
    if (healthyAPIs.length === 0) {
      return allMetrics.map(m => m.name); // 如果没有健康的 API，返回所有 API
    }

    // 根据策略排序
    switch (strategyName) {
      case 'fast':
        return healthyAPIs
          .sort((a, b) => a.averageResponseTime - b.averageResponseTime)
          .map(m => m.name);
      
      case 'reliable':
        return healthyAPIs
          .sort((a, b) => b.successRate - a.successRate)
          .map(m => m.name);
      
      case 'balanced':
      case 'concurrent':
      default:
        // 综合评分：成功率权重 70%，响应时间权重 30%
        return healthyAPIs
          .map(m => ({
            ...m,
            score: m.successRate * 0.7 + (1 - Math.min(m.averageResponseTime / 10000, 1)) * 0.3
          }))
          .sort((a, b) => b.score - a.score)
          .map(m => m.name);
    }
  }

  /**
   * 获取自适应超时时间
   */
  private getAdaptiveTimeout(monitor: APIMonitor, baseTimeout: number): number {
    if (!this.config.adaptiveTimeout) {
      return baseTimeout;
    }

    const summary = monitor.getSummary();
    
    if (summary.totalRequests === 0) {
      return baseTimeout;
    }

    // 基于平均响应时间调整超时
    const avgResponseTime = summary.averageResponseTime;
    const adaptiveTimeout = Math.max(
      baseTimeout * 0.5, // 最小不低于基础超时的 50%
      Math.min(
        baseTimeout * 2, // 最大不超过基础超时的 200%
        avgResponseTime * 3 + 2000 // 平均响应时间的 3 倍 + 2 秒缓冲
      )
    );

    return Math.round(adaptiveTimeout);
  }

  /**
   * 记录查询结果用于学习
   */
  recordQueryResult(
    provider: string,
    success: boolean,
    responseTime: number,
    errorType?: string
  ): void {
    if (!this.config.learningEnabled) {
      return;
    }

    // 这里可以添加更复杂的学习逻辑
    // 例如：调整权重、更新策略参数等
  }

  /**
   * 获取查询建议
   */
  getQueryRecommendations(): {
    whois: {
      recommendedStrategy: string;
      topProviders: string[];
      estimatedTime: number;
    };
    dns: {
      recommendedStrategy: string;
      topProviders: string[];
      estimatedTime: number;
    };
  } {
    const whoisStrategy = this.getOptimizedWhoisStrategy('example.com');
    const dnsStrategy = this.getOptimizedDNSStrategy('example.com');

    const whoisSummary = whoisAPIMonitor.getSummary();
    const dnsSummary = dnsAPIMonitor.getSummary();

    return {
      whois: {
        recommendedStrategy: whoisStrategy.name,
        topProviders: whoisStrategy.providerOrder.slice(0, 3),
        estimatedTime: whoisSummary.averageResponseTime || whoisStrategy.timeoutMs
      },
      dns: {
        recommendedStrategy: dnsStrategy.name,
        topProviders: dnsStrategy.providerOrder.slice(0, 3),
        estimatedTime: dnsSummary.averageResponseTime || dnsStrategy.timeoutMs
      }
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    whoisStats: ReturnType<APIMonitor['getSummary']>;
    dnsStats: ReturnType<APIMonitor['getSummary']>;
    optimizationImpact: {
      estimatedSpeedImprovement: number;
      estimatedReliabilityImprovement: number;
    };
  } {
    const whoisStats = whoisAPIMonitor.getSummary();
    const dnsStats = dnsAPIMonitor.getSummary();

    // 估算优化效果（简化计算）
    const estimatedSpeedImprovement = this.config.preferFastAPIs ? 0.2 : 0;
    const estimatedReliabilityImprovement = this.config.preferReliableAPIs ? 0.15 : 0;

    return {
      whoisStats,
      dnsStats,
      optimizationImpact: {
        estimatedSpeedImprovement,
        estimatedReliabilityImprovement
      }
    };
  }

  /**
   * 重置优化器
   */
  reset(): void {
    whoisAPIMonitor.reset();
    dnsAPIMonitor.reset();
    this.initializeStrategies();
  }
}

// 全局优化器实例
export const queryOptimizer = new QueryOptimizer();

/**
 * 智能查询包装器
 */
export async function optimizedQuery<T>(
  queryType: 'whois' | 'dns',
  domain: string,
  queryFunction: (strategy: QueryStrategy) => Promise<T>
): Promise<T> {
  const strategy = queryType === 'whois' 
    ? queryOptimizer.getOptimizedWhoisStrategy(domain)
    : queryOptimizer.getOptimizedDNSStrategy(domain);

  const startTime = performance.now();
  
  try {
    const result = await queryFunction(strategy);
    const responseTime = performance.now() - startTime;
    
    // 记录成功结果
    queryOptimizer.recordQueryResult('optimized', true, responseTime);
    
    return result;
  } catch (error: any) {
    const responseTime = performance.now() - startTime;
    const errorType = error?.name || error?.constructor?.name || 'Unknown';
    
    // 记录失败结果
    queryOptimizer.recordQueryResult('optimized', false, responseTime, errorType);
    
    throw error;
  }
}
