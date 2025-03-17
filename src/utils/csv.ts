import * as Papa from 'papaparse'

interface CsvOptions {
  delimiter?: string
  header?: boolean
  dynamicTyping?: boolean
  skipEmptyLines?: boolean
}

// 定义 PapaParse 错误类型
interface PapaError {
  type: string
  code: string
  message: string
  row?: number
}

/**
 * CSV 转 JSON
 * @param csvStr CSV 字符串
 * @param firstRowAsHeader 首行是否为表头
 * @param delimiter 分隔符
 * @param autoTypeConversion 是否自动类型转换
 * @param indentSize 缩进空格数
 * @returns JSON 字符串
 */
export function csv2json(
  csvStr: string, 
  firstRowAsHeader: boolean = true, 
  delimiter: string = ',', 
  autoTypeConversion: boolean = true,
  indentSize: number = 2
): string {
  try {
    // 如果分隔符为auto，自动检测
    if (delimiter === 'auto') {
      delimiter = detectDelimiter(csvStr)
    }

    // 解析 CSV
    const result = Papa.parse(csvStr, {
      header: firstRowAsHeader,
      delimiter: delimiter,
      dynamicTyping: autoTypeConversion,
      skipEmptyLines: true
    })

    if (result.errors && result.errors.length > 0) {
      throw new Error(`CSV 解析错误: ${result.errors[0].message}`)
    }

    // 将解析结果转换为 JSON 字符串
    return JSON.stringify(result.data, null, indentSize)
  } catch (error) {
    console.error('CSV to JSON conversion error:', error)
    throw error
  }
}

/**
 * JSON 转 CSV
 * @param jsonStr JSON 字符串
 * @param firstRowAsHeader 首行是否为表头
 * @param delimiter 分隔符
 * @returns CSV 字符串
 */
export function json2csv(
  jsonStr: string, 
  firstRowAsHeader: boolean = true, 
  delimiter: string = ','
): string {
  try {
    // 解析 JSON 为 JavaScript 对象
    const data = JSON.parse(jsonStr)
    
    if (!Array.isArray(data)) {
      throw new Error('JSON 必须是数组格式')
    }
    
    // 将对象转换为 CSV 字符串
    const result = Papa.unparse(data, {
      delimiter: delimiter,
      header: firstRowAsHeader
    })
    
    return result
  } catch (error) {
    console.error('JSON to CSV conversion error:', error)
    throw error
  }
}

/**
 * 验证 CSV 字符串是否有效
 * @param csvStr CSV 字符串
 * @returns 是否有效
 */
export function isValidCsv(csvStr: string): boolean {
  try {
    const result = Papa.parse(csvStr, {
      header: true,
      skipEmptyLines: true
    })
    return result.errors.length === 0 || result.errors.every((e: any) => e.type === 'FieldMismatch')
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
 * 检测 CSV 分隔符
 * @param csvStr CSV 字符串
 * @returns 检测到的分隔符
 */
function detectDelimiter(csvStr: string): string {
  const firstLine = csvStr.split('\n')[0]
  const delimiters = [',', ';', '\t', '|']
  let bestDelimiter = ','
  let maxCount = 0
  
  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(delimiter, 'g')) || []).length
    if (count > maxCount) {
      maxCount = count
      bestDelimiter = delimiter
    }
  }
  
  return bestDelimiter
} 