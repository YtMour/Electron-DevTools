/**
 * 应用配置管理
 * 提供统一的配置存储、读取和管理功能
 */

export interface AppConfig {
  // 主题设置
  theme: {
    mode: 'light' | 'dark' | 'auto'
    primaryColor: string
    fontSize: number
  }
  
  // 编辑器设置
  editor: {
    fontSize: number
    tabSize: number
    wordWrap: boolean
    minimap: boolean
    lineNumbers: boolean
    theme: string
  }
  
  // 工具设置
  tools: {
    autoSave: boolean
    autoFormat: boolean
    showLineNumbers: boolean
    enableSyntaxHighlight: boolean
  }
  
  // 性能设置
  performance: {
    enableMonitoring: boolean
    monitoringInterval: number
    maxHistoryEntries: number
  }
  
  // 网络设置
  network: {
    timeout: number
    retryAttempts: number
    enableCache: boolean
  }
  
  // 用户偏好
  preferences: {
    language: string
    autoCheckUpdates: boolean
    showTips: boolean
    enableNotifications: boolean
  }
}

// 默认配置
const defaultConfig: AppConfig = {
  theme: {
    mode: 'auto',
    primaryColor: '#409eff',
    fontSize: 14
  },
  editor: {
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    theme: 'vs-dark'
  },
  tools: {
    autoSave: true,
    autoFormat: false,
    showLineNumbers: true,
    enableSyntaxHighlight: true
  },
  performance: {
    enableMonitoring: false,
    monitoringInterval: 1000,
    maxHistoryEntries: 100
  },
  network: {
    timeout: 10000,
    retryAttempts: 3,
    enableCache: true
  },
  preferences: {
    language: 'zh-CN',
    autoCheckUpdates: true,
    showTips: true,
    enableNotifications: true
  }
}

/**
 * 配置管理器类
 */
export class ConfigManager {
  private config: AppConfig
  private storageKey = 'yt-tools-config'
  private listeners: ((config: AppConfig) => void)[] = []

  constructor() {
    this.config = this.loadConfig()
  }

  /**
   * 从本地存储加载配置
   */
  private loadConfig(): AppConfig {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        return this.mergeConfig(defaultConfig, parsedConfig)
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error)
    }
    return { ...defaultConfig }
  }

  /**
   * 合并配置对象
   */
  private mergeConfig(defaultConf: AppConfig, userConf: Partial<AppConfig>): AppConfig {
    const merged = { ...defaultConf }
    
    for (const key in userConf) {
      if (key in merged) {
        const userValue = userConf[key as keyof AppConfig]
        if (typeof userValue === 'object' && userValue !== null) {
          merged[key as keyof AppConfig] = {
            ...merged[key as keyof AppConfig],
            ...userValue
          } as any
        } else {
          merged[key as keyof AppConfig] = userValue as any
        }
      }
    }
    
    return merged
  }

  /**
   * 保存配置到本地存储
   */
  private saveConfig() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to save config to localStorage:', error)
    }
  }

  /**
   * 获取完整配置
   */
  getConfig(): AppConfig {
    return { ...this.config }
  }

  /**
   * 获取配置项
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  /**
   * 获取嵌套配置项
   */
  getNested<K extends keyof AppConfig, NK extends keyof AppConfig[K]>(
    key: K,
    nestedKey: NK
  ): AppConfig[K][NK] {
    return this.config[key][nestedKey]
  }

  /**
   * 设置配置项
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    this.config[key] = value
    this.saveConfig()
  }

  /**
   * 设置嵌套配置项
   */
  setNested<K extends keyof AppConfig, NK extends keyof AppConfig[K]>(
    key: K,
    nestedKey: NK,
    value: AppConfig[K][NK]
  ) {
    this.config[key][nestedKey] = value
    this.saveConfig()
  }

  /**
   * 更新配置（部分更新）
   */
  update(updates: Partial<AppConfig>) {
    this.config = this.mergeConfig(this.config, updates)
    this.saveConfig()
  }

  /**
   * 重置配置为默认值
   */
  reset() {
    this.config = { ...defaultConfig }
    this.saveConfig()
  }

  /**
   * 重置特定配置项
   */
  resetSection<K extends keyof AppConfig>(key: K) {
    this.config[key] = { ...defaultConfig[key] }
    this.saveConfig()
  }

  /**
   * 导出配置
   */
  export(): string {
    return JSON.stringify({
      config: this.config,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2)
  }

  /**
   * 导入配置
   */
  import(configData: string): boolean {
    try {
      const data = JSON.parse(configData)
      if (data.config && typeof data.config === 'object') {
        this.config = this.mergeConfig(defaultConfig, data.config)
        this.saveConfig()
        return true
      }
    } catch (error) {
      console.error('Failed to import config:', error)
    }
    return false
  }

  /**
   * 添加配置变更监听器
   */
  addListener(listener: (config: AppConfig) => void) {
    this.listeners.push(listener)
  }

  /**
   * 移除配置变更监听器
   */
  removeListener(listener: (config: AppConfig) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.config)
      } catch (error) {
        console.error('Config listener error:', error)
      }
    })
  }

  /**
   * 验证配置
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证主题设置
    if (!['light', 'dark', 'auto'].includes(this.config.theme.mode)) {
      errors.push('Invalid theme mode')
    }

    // 验证编辑器设置
    if (this.config.editor.fontSize < 8 || this.config.editor.fontSize > 72) {
      errors.push('Editor font size must be between 8 and 72')
    }

    if (this.config.editor.tabSize < 1 || this.config.editor.tabSize > 8) {
      errors.push('Editor tab size must be between 1 and 8')
    }

    // 验证性能设置
    if (this.config.performance.monitoringInterval < 100) {
      errors.push('Monitoring interval must be at least 100ms')
    }

    // 验证网络设置
    if (this.config.network.timeout < 1000) {
      errors.push('Network timeout must be at least 1000ms')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取配置统计信息
   */
  getStats() {
    return {
      totalKeys: Object.keys(this.config).length,
      lastModified: localStorage.getItem(this.storageKey + '_timestamp') || 'Unknown',
      size: new Blob([JSON.stringify(this.config)]).size,
      isDefault: JSON.stringify(this.config) === JSON.stringify(defaultConfig)
    }
  }
}

// 创建全局配置管理器实例
export const globalConfig = new ConfigManager()

// 导出便捷函数
export const getConfig = () => globalConfig.getConfig()
export const setConfig = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => 
  globalConfig.set(key, value)
export const updateConfig = (updates: Partial<AppConfig>) => 
  globalConfig.update(updates)
