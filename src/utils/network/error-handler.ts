/**
 * 网络错误处理工具
 * 提供用户友好的错误处理和日志记录
 */

export interface NetworkError {
  type: 'cors' | 'timeout' | 'network' | 'api' | 'unknown';
  message: string;
  userMessage: string;
  canRetry: boolean;
  suggestions: string[];
}

/**
 * 分析网络错误类型
 * @param error 错误对象
 * @param context 错误上下文
 * @returns 网络错误信息
 */
export function analyzeNetworkError(error: any, context: string = ''): NetworkError {
  const errorMessage = error?.message || error?.toString() || '未知错误';
  
  // CORS 错误
  if (errorMessage.includes('CORS') || 
      errorMessage.includes('Access-Control-Allow-Origin') ||
      errorMessage.includes('cross-origin')) {
    return {
      type: 'cors',
      message: errorMessage,
      userMessage: '跨域访问被阻止',
      canRetry: false,
      suggestions: [
        '这是浏览器安全策略的正常行为',
        '应用会自动使用备用方法获取数据',
        '如需真实数据，请使用专业的网络工具'
      ]
    };
  }
  
  // 超时错误
  if (errorMessage.includes('timeout') || 
      errorMessage.includes('TimeoutError') ||
      errorMessage.includes('ERR_TIMED_OUT')) {
    return {
      type: 'timeout',
      message: errorMessage,
      userMessage: '请求超时',
      canRetry: true,
      suggestions: [
        '检查网络连接是否稳定',
        '稍后重试',
        '尝试使用其他网络环境'
      ]
    };
  }
  
  // 网络连接错误
  if (errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
      errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
      errorMessage.includes('ERR_CONNECTION')) {
    return {
      type: 'network',
      message: errorMessage,
      userMessage: '网络连接失败',
      canRetry: true,
      suggestions: [
        '检查网络连接',
        '确认域名或IP地址正确',
        '尝试重启网络适配器',
        '联系网络管理员'
      ]
    };
  }
  
  // API 错误
  if (errorMessage.includes('401') || 
      errorMessage.includes('403') ||
      errorMessage.includes('429') ||
      errorMessage.includes('500')) {
    return {
      type: 'api',
      message: errorMessage,
      userMessage: 'API 服务暂时不可用',
      canRetry: true,
      suggestions: [
        '稍后重试',
        '应用会使用模拟数据代替',
        '如需准确数据，请使用官方工具'
      ]
    };
  }
  
  // 未知错误
  return {
    type: 'unknown',
    message: errorMessage,
    userMessage: '操作失败',
    canRetry: true,
    suggestions: [
      '请重试操作',
      '如问题持续，请检查网络设置',
      '联系技术支持'
    ]
  };
}

/**
 * 静默记录错误（仅在开发模式下显示）
 * @param error 错误对象
 * @param context 错误上下文
 */
export function silentLog(error: any, context: string = ''): void {
  if (import.meta.env.DEV) {
    console.debug(`[${context}]`, error);
  }
}

/**
 * 记录用户友好的错误信息
 * @param error 错误对象
 * @param context 错误上下文
 */
export function logUserFriendlyError(error: any, context: string = ''): NetworkError {
  const networkError = analyzeNetworkError(error, context);
  
  // 只有严重错误才在控制台显示
  if (networkError.type === 'network' || networkError.type === 'unknown') {
    console.warn(`[${context}] ${networkError.userMessage}:`, networkError.message);
  } else {
    silentLog(error, context);
  }
  
  return networkError;
}

/**
 * 检查错误是否为可忽略的错误
 * @param error 错误对象
 * @returns 是否可忽略
 */
export function isIgnorableError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  
  // 可忽略的错误类型
  const ignorablePatterns = [
    'CORS',
    'Access-Control-Allow-Origin',
    'ERR_BLOCKED_BY_CLIENT',
    'ERR_BLOCKED_BY_RESPONSE',
    'net::ERR_FAILED 401',
    'net::ERR_FAILED 403',
    'net::ERR_FAILED 429'
  ];
  
  return ignorablePatterns.some(pattern => errorMessage.includes(pattern));
}

/**
 * 格式化错误消息供用户显示
 * @param error 错误对象
 * @param context 错误上下文
 * @returns 格式化的错误消息
 */
export function formatErrorForUser(error: any, context: string = ''): string {
  const networkError = analyzeNetworkError(error, context);
  
  let message = networkError.userMessage;
  
  if (networkError.suggestions.length > 0) {
    message += '\n\n建议：\n' + networkError.suggestions.map(s => `• ${s}`).join('\n');
  }
  
  return message;
}

/**
 * 创建重试函数
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delay 重试延迟（毫秒）
 * @returns 带重试功能的函数
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): () => Promise<T> {
  return async (): Promise<T> => {
    let lastError: any;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        const networkError = analyzeNetworkError(error);
        
        // 如果不能重试或已达到最大重试次数，抛出错误
        if (!networkError.canRetry || i === maxRetries) {
          throw error;
        }
        
        // 等待后重试
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  };
}

/**
 * 网络操作包装器，提供统一的错误处理
 * @param operation 网络操作函数
 * @param context 操作上下文
 * @param fallback 失败时的回退值
 * @returns 操作结果或回退值
 */
export async function safeNetworkOperation<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const networkError = logUserFriendlyError(error, context);
    
    // 如果有回退值且错误可忽略，返回回退值
    if (fallback !== undefined && isIgnorableError(error)) {
      return fallback;
    }
    
    // 对于严重错误，重新抛出
    if (networkError.type === 'network') {
      throw error;
    }
    
    return fallback;
  }
}

/**
 * 批量网络操作，部分失败不影响整体
 * @param operations 操作列表
 * @param context 操作上下文
 * @returns 成功的结果列表
 */
export async function batchNetworkOperations<T>(
  operations: (() => Promise<T>)[],
  context: string
): Promise<T[]> {
  const results: T[] = [];
  
  for (const operation of operations) {
    try {
      const result = await safeNetworkOperation(operation, context);
      if (result !== undefined) {
        results.push(result);
      }
    } catch (error) {
      // 继续执行其他操作
      silentLog(error, `${context} - 批量操作`);
    }
  }
  
  return results;
}
