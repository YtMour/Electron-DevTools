import * as yaml from 'js-yaml'

/**
 * YAML 转 JSON
 * @param yamlStr YAML 字符串
 * @param indent 缩进空格数
 * @returns JSON 字符串
 */
export function yaml2json(yamlStr: string, indent: number = 2): string {
  try {
    // 解析 YAML 为 JavaScript 对象
    const obj = yaml.load(yamlStr)
    // 将对象转换为格式化的 JSON 字符串
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    console.error('YAML to JSON conversion error:', error)
    throw error
  }
}

/**
 * JSON 转 YAML
 * @param jsonStr JSON 字符串
 * @param format 是否格式化
 * @param indent 缩进空格数
 * @returns YAML 字符串
 */
export function json2yaml(jsonStr: string, format: boolean = true, indent: number = 2): string {
  try {
    // 解析 JSON 为 JavaScript 对象
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    // 将对象转换为 YAML 字符串
    return yaml.dump(obj, {
      indent: format ? indent : 0,
      lineWidth: format ? -1 : 1000, // 格式化时禁用行宽限制，压缩时使用大值
      noRefs: true, // 避免使用引用标记
      sortKeys: false, // 保持键的原始顺序
      flowLevel: format ? -1 : 0 // 格式化时使用块样式，压缩时使用流样式
    })
  } catch (error) {
    console.error('JSON to YAML conversion error:', error)
    throw error
  }
}

/**
 * 验证 YAML 字符串是否有效
 * @param yamlStr YAML 字符串
 * @returns 是否有效
 */
export function isValidYaml(yamlStr: string): boolean {
  try {
    yaml.load(yamlStr)
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