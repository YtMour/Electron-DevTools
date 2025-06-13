/**
 * 全局错误处理系统
 * 提供统一的错误处理、日志记录和用户反馈机制
 */

import { ElMessage, ElNotification } from 'element-plus'

export interface ErrorInfo {
  id: string
  message: string
  stack?: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  source: string
  userAgent?: string
  url?: string
  userId?: string
  context?: Record<string, any>
}

export interface ErrorHandlerOptions {
  enableConsoleLog?: boolean
  enableNotification?: boolean
  enableLocalStorage?: boolean
  maxStoredErrors?: number
  reportToServer?: boolean
  serverEndpoint?: string
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private options: Required<ErrorHandlerOptions>
  private errors: ErrorInfo[] = []

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      enableConsoleLog: true,
      enableNotification: true,
      enableLocalStorage: true,
      maxStoredErrors: 100,
      reportToServer: false,
      serverEndpoint: '',
      ...options
    }

    this.loadStoredErrors()
    this.setupGlobalHandlers()
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers() {
    // 处理未捕获的 JavaScript 错误
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        source: 'javascript',
        url: event.filename,
        context: {
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // 处理未捕获的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        source: 'promise',
        context: {
          reason: event.reason
        }
      })
    })

    // 处理资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          message: `Resource loading failed: ${(event.target as any)?.src || (event.target as any)?.href}`,
          source: 'resource',
          level: 'warning',
          context: {
            tagName: (event.target as any)?.tagName,
            src: (event.target as any)?.src,
            href: (event.target as any)?.href
          }
        })
      }
    }, true)
  }

  /**
   * 处理错误
   */
  handleError(errorData: Partial<ErrorInfo>) {
    const error: ErrorInfo = {
      id: this.generateErrorId(),
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      timestamp: Date.now(),
      level: errorData.level || 'error',
      source: errorData.source || 'unknown',
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: errorData.context,
      ...errorData
    }

    // 添加到错误列表
    this.addError(error)

    // 控制台日志
    if (this.options.enableConsoleLog) {
      this.logToConsole(error)
    }

    // 用户通知
    if (this.options.enableNotification) {
      this.showNotification(error)
    }

    // 本地存储
    if (this.options.enableLocalStorage) {
      this.saveToLocalStorage()
    }

    // 上报到服务器
    if (this.options.reportToServer && this.options.serverEndpoint) {
      this.reportToServer(error)
    }

    return error
  }

  /**
   * 生成错误 ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 添加错误到列表
   */
  private addError(error: ErrorInfo) {
    this.errors.unshift(error)
    
    // 保持错误数量在限制内
    if (this.errors.length > this.options.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.options.maxStoredErrors)
    }
  }

  /**
   * 控制台日志
   */
  private logToConsole(error: ErrorInfo) {
    const logMethod = error.level === 'error' ? 'error' : 
                     error.level === 'warning' ? 'warn' : 'info'
    
    console[logMethod](`[${error.source}] ${error.message}`, {
      id: error.id,
      timestamp: new Date(error.timestamp).toISOString(),
      stack: error.stack,
      context: error.context
    })
  }

  /**
   * 显示用户通知
   */
  private showNotification(error: ErrorInfo) {
    const message = this.getUserFriendlyMessage(error)
    
    if (error.level === 'error') {
      ElMessage.error(message)
    } else if (error.level === 'warning') {
      ElMessage.warning(message)
    } else {
      ElMessage.info(message)
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  private getUserFriendlyMessage(error: ErrorInfo): string {
    // 根据错误类型返回用户友好的消息
    const friendlyMessages: Record<string, string> = {
      'network': '网络连接出现问题，请检查网络设置',
      'resource': '资源加载失败，请刷新页面重试',
      'javascript': '应用出现异常，请刷新页面重试',
      'promise': '操作失败，请重试',
      'validation': '输入数据有误，请检查后重试'
    }

    return friendlyMessages[error.source] || '操作失败，请重试'
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage() {
    try {
      const data = {
        errors: this.errors.slice(0, 50), // 只保存最近 50 个错误
        timestamp: Date.now()
      }
      localStorage.setItem('yt-tools-errors', JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save errors to localStorage:', error)
    }
  }

  /**
   * 从本地存储加载错误
   */
  private loadStoredErrors() {
    try {
      const data = localStorage.getItem('yt-tools-errors')
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.errors && Array.isArray(parsed.errors)) {
          this.errors = parsed.errors
        }
      }
    } catch (error) {
      console.warn('Failed to load errors from localStorage:', error)
    }
  }

  /**
   * 上报错误到服务器
   */
  private async reportToServer(error: ErrorInfo) {
    try {
      await fetch(this.options.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error)
      })
    } catch (reportError) {
      console.warn('Failed to report error to server:', reportError)
    }
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour

    const recentErrors = this.errors.filter(e => now - e.timestamp < oneHour)
    const todayErrors = this.errors.filter(e => now - e.timestamp < oneDay)

    const errorsByLevel = this.errors.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorsBySource = this.errors.reduce((acc, error) => {
      acc[error.source] = (acc[error.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: this.errors.length,
      recent: recentErrors.length,
      today: todayErrors.length,
      byLevel: errorsByLevel,
      bySource: errorsBySource
    }
  }

  /**
   * 清空错误记录
   */
  clearErrors() {
    this.errors = []
    this.saveToLocalStorage()
  }

  /**
   * 导出错误数据
   */
  exportErrors(): string {
    return JSON.stringify({
      errors: this.errors,
      stats: this.getErrorStats(),
      exportTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2)
  }

  /**
   * 手动记录错误
   */
  logError(message: string, context?: Record<string, any>, level: 'error' | 'warning' | 'info' = 'error') {
    return this.handleError({
      message,
      context,
      level,
      source: 'manual'
    })
  }

  /**
   * 记录警告
   */
  logWarning(message: string, context?: Record<string, any>) {
    return this.logError(message, context, 'warning')
  }

  /**
   * 记录信息
   */
  logInfo(message: string, context?: Record<string, any>) {
    return this.logError(message, context, 'info')
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new ErrorHandler({
  enableConsoleLog: true,
  enableNotification: true,
  enableLocalStorage: true,
  maxStoredErrors: 100
})

// 导出便捷函数
export const logError = (message: string, context?: Record<string, any>) => 
  globalErrorHandler.logError(message, context)

export const logWarning = (message: string, context?: Record<string, any>) => 
  globalErrorHandler.logWarning(message, context)

export const logInfo = (message: string, context?: Record<string, any>) => 
  globalErrorHandler.logInfo(message, context)
