/**
 * 性能监控工具
 * 提供应用性能监控和分析功能
 */

export interface PerformanceMetrics {
  // 内存使用情况
  memory: {
    used: number
    total: number
    percentage: number
  }
  
  // CPU 使用情况（模拟）
  cpu: {
    usage: number
    cores: number
  }
  
  // 网络状态
  network: {
    online: boolean
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
  
  // 页面性能
  page: {
    loadTime: number
    domContentLoaded: number
    firstPaint?: number
    firstContentfulPaint?: number
  }
  
  // 时间戳
  timestamp: number
}

export interface PerformanceHistory {
  metrics: PerformanceMetrics[]
  maxEntries: number
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private history: PerformanceHistory
  private intervalId: number | null = null
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = []

  constructor(maxEntries: number = 100) {
    this.history = {
      metrics: [],
      maxEntries
    }
  }

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): PerformanceMetrics {
    const memory = this.getMemoryInfo()
    const cpu = this.getCPUInfo()
    const network = this.getNetworkInfo()
    const page = this.getPagePerformance()

    return {
      memory,
      cpu,
      network,
      page,
      timestamp: Date.now()
    }
  }

  /**
   * 获取内存信息
   */
  private getMemoryInfo() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
      }
    }
    
    // 模拟数据
    const used = Math.random() * 100 + 50
    const total = 200
    return {
      used: Math.round(used),
      total,
      percentage: Math.round((used / total) * 100)
    }
  }

  /**
   * 获取 CPU 信息（模拟）
   */
  private getCPUInfo() {
    return {
      usage: Math.round(Math.random() * 100), // 模拟 CPU 使用率
      cores: navigator.hardwareConcurrency || 4
    }
  }

  /**
   * 获取网络信息
   */
  private getNetworkInfo() {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    }
  }

  /**
   * 获取页面性能信息
   */
  private getPagePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    let firstPaint: number | undefined
    let firstContentfulPaint: number | undefined

    paint.forEach(entry => {
      if (entry.name === 'first-paint') {
        firstPaint = entry.startTime
      } else if (entry.name === 'first-contentful-paint') {
        firstContentfulPaint = entry.startTime
      }
    })

    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      firstPaint,
      firstContentfulPaint
    }
  }

  /**
   * 开始监控
   */
  startMonitoring(interval: number = 1000) {
    if (this.intervalId) {
      this.stopMonitoring()
    }

    this.intervalId = window.setInterval(() => {
      const metrics = this.getCurrentMetrics()
      this.addMetrics(metrics)
      this.notifyCallbacks(metrics)
    }, interval)
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * 添加性能指标到历史记录
   */
  private addMetrics(metrics: PerformanceMetrics) {
    this.history.metrics.push(metrics)
    
    // 保持历史记录在最大条目数内
    if (this.history.metrics.length > this.history.maxEntries) {
      this.history.metrics.shift()
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(): PerformanceHistory {
    return { ...this.history }
  }

  /**
   * 清空历史记录
   */
  clearHistory() {
    this.history.metrics = []
  }

  /**
   * 添加回调函数
   */
  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback)
  }

  /**
   * 移除回调函数
   */
  removeCallback(callback: (metrics: PerformanceMetrics) => void) {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  /**
   * 通知所有回调函数
   */
  private notifyCallbacks(metrics: PerformanceMetrics) {
    this.callbacks.forEach(callback => {
      try {
        callback(metrics)
      } catch (error) {
        console.error('Performance callback error:', error)
      }
    })
  }

  /**
   * 获取性能统计信息
   */
  getStatistics() {
    const metrics = this.history.metrics
    if (metrics.length === 0) {
      return null
    }

    const memoryUsage = metrics.map(m => m.memory.percentage)
    const cpuUsage = metrics.map(m => m.cpu.usage)

    return {
      memory: {
        avg: Math.round(memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length),
        max: Math.max(...memoryUsage),
        min: Math.min(...memoryUsage)
      },
      cpu: {
        avg: Math.round(cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length),
        max: Math.max(...cpuUsage),
        min: Math.min(...cpuUsage)
      },
      sampleCount: metrics.length,
      timeRange: {
        start: metrics[0].timestamp,
        end: metrics[metrics.length - 1].timestamp
      }
    }
  }

  /**
   * 导出性能数据
   */
  exportData(): string {
    return JSON.stringify({
      history: this.history,
      statistics: this.getStatistics(),
      exportTime: new Date().toISOString()
    }, null, 2)
  }

  /**
   * 销毁监控器
   */
  destroy() {
    this.stopMonitoring()
    this.callbacks = []
    this.clearHistory()
  }
}

// 创建全局性能监控器实例
export const globalPerformanceMonitor = new PerformanceMonitor()

// 性能工具函数
export const PerformanceUtils = {
  /**
   * 测量函数执行时间
   */
  measureFunction: async <T>(fn: () => T | Promise<T>, name?: string): Promise<{ result: T; duration: number }> => {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    
    if (name) {
      console.log(`${name} executed in ${duration.toFixed(2)}ms`)
    }
    
    return { result, duration }
  },

  /**
   * 创建性能标记
   */
  mark: (name: string) => {
    performance.mark(name)
  },

  /**
   * 测量两个标记之间的时间
   */
  measure: (name: string, startMark: string, endMark: string) => {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name, 'measure')[0]
    return measure.duration
  },

  /**
   * 获取资源加载性能
   */
  getResourceTiming: () => {
    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as PerformanceResourceTiming).transferSize || 0,
      type: (entry as PerformanceResourceTiming).initiatorType
    }))
  }
}
