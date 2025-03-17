/**
 * 格式化JSON字符串
 * @param jsonStr JSON字符串
 * @param indent 缩进空格数
 * @returns 格式化后的JSON字符串
 */
export function formatJson(jsonStr: string, indent: number = 2): string {
  try {
    // 解析JSON字符串为对象
    const obj = JSON.parse(jsonStr)
    // 将对象转换为格式化的JSON字符串
    return JSON.stringify(obj, null, indent)
  } catch (error) {
    console.error('JSON formatting error:', error)
    throw error
  }
}

/**
 * 压缩JSON字符串
 * @param jsonStr JSON字符串
 * @returns 压缩后的JSON字符串
 */
export function compressJson(jsonStr: string): string {
  try {
    // 解析JSON字符串为对象
    const obj = JSON.parse(jsonStr)
    // 将对象转换为无格式的JSON字符串
    return JSON.stringify(obj)
  } catch (error) {
    console.error('JSON compression error:', error)
    throw error
  }
}

/**
 * 验证JSON字符串是否有效
 * @param jsonStr JSON字符串
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