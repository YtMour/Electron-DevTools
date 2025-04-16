import * as toml from '@iarna/toml'
import * as tomlBrowser from './toml-browser'

// 确保只使用字符串解析功能，避免使用stream解析
const parseString = (tomlStr: string) => {
  try {
    // 尝试使用@iarna/toml解析
    try {
      return toml.parse(tomlStr)
    } catch (error) {
      console.warn('使用@iarna/toml解析失败，回退到浏览器解析器:', error)
      // 如果失败，回退到浏览器兼容的解析器
      return tomlBrowser.parse(tomlStr)
    }
  } catch (error) {
    console.error('TOML parse error:', error)
    throw error
  }
}

// 确保只使用字符串序列化功能
const stringifyToml = (obj: any) => {
  try {
    // 尝试使用@iarna/toml序列化
    try {
      return toml.stringify(obj)
    } catch (error) {
      console.warn('使用@iarna/toml序列化失败，回退到浏览器序列化器:', error)
      // 如果失败，回退到浏览器兼容的序列化器
      return tomlBrowser.stringify(obj)
    }
  } catch (error) {
    console.error('TOML stringify error:', error)
    throw error
  }
}

/**
 * TOML 转 JSON
 * @param tomlStr TOML 字符串
 * @param indent 缩进空格数
 * @returns JSON 字符串
 */
export function toml2json(tomlStr: string, indent: number = 2): string {
  try {
    // 解析 TOML 为 JavaScript 对象
    const obj = parseString(tomlStr)
    // 将对象转换为格式化的 JSON 字符串
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    console.error('TOML to JSON conversion error:', error)
    throw error
  }
}

/**
 * JSON 转 TOML
 * @param jsonStr JSON 字符串
 * @returns TOML 字符串
 */
export function json2toml(jsonStr: string): string {
  try {
    // 解析 JSON 为 JavaScript 对象
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    // 将对象转换为 TOML 字符串
    return stringifyToml(obj)
  } catch (error) {
    console.error('JSON to TOML conversion error:', error)
    throw error
  }
}

/**
 * TOML 转 YAML
 * @param tomlStr TOML 字符串
 * @param format 是否格式化
 * @param indent 缩进空格数
 * @returns YAML 字符串
 */
export function toml2yaml(tomlStr: string, format: boolean = true, indent: number = 2): string {
  try {
    // 先将 TOML 转为对象
    const obj = parseString(tomlStr)
    
    // 导入yaml模块并转换为YAML
    const yaml = require('js-yaml')
    return yaml.dump(obj, {
      indent: format ? indent : 0,
      lineWidth: format ? -1 : 1000,
      noRefs: true,
      sortKeys: false,
      flowLevel: format ? -1 : 0
    })
  } catch (error) {
    console.error('TOML to YAML conversion error:', error)
    throw error
  }
}

/**
 * YAML 转 TOML
 * @param yamlStr YAML 字符串
 * @returns TOML 字符串
 */
export function yaml2toml(yamlStr: string): string {
  try {
    // 先将 YAML 转为对象
    const yaml = require('js-yaml')
    const obj = yaml.load(yamlStr)
    
    // 将对象转为 TOML
    return stringifyToml(obj)
  } catch (error) {
    console.error('YAML to TOML conversion error:', error)
    throw error
  }
}

/**
 * 验证 TOML 字符串是否有效
 * @param tomlStr TOML 字符串
 * @returns 是否有效
 */
export function isValidToml(tomlStr: string): boolean {
  try {
    parseString(tomlStr)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 验证 JSON 字符串是否有效
 * @param jsonStr JSON 字符串
 * @returns 是否有效
 */
export function isValidJson(jsonStr: string): boolean {
  try {
    JSON.parse(jsonStr)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 验证 YAML 字符串是否有效
 * @param yamlStr YAML 字符串
 * @returns 是否有效
 */
export function isValidYaml(yamlStr: string): boolean {
  try {
    const yaml = require('js-yaml')
    yaml.load(yamlStr)
    return true
  } catch (error) {
    return false
  }
} 