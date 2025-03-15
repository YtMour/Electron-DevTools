import { XMLParser, XMLBuilder } from 'fast-xml-parser'

interface XmlSerializeOptions {
  indent?: string
  newline?: string
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
})

/**
 * 解析 XML 字符串为对象或 DOM 文档
 * @param xml XML 字符串
 * @param useDom 是否使用 DOM 解析（默认为 false）
 * @returns 解析后的对象或 DOM 文档
 */
export function parseXml(xml: string, useDom = false): any {
  if (useDom) {
    const domParser = new DOMParser()
    const doc = domParser.parseFromString(xml, 'text/xml')
    
    // 检查解析错误
    const parseError = doc.getElementsByTagName('parsererror')
    if (parseError.length > 0) {
      throw new Error('XML 解析错误：' + parseError[0].textContent)
    }
    
    return doc
  }

  try {
    return parser.parse(xml)
  } catch (error) {
    console.error('XML parsing error:', error)
    throw error
  }
}

/**
 * 序列化对象或 DOM 文档为 XML 字符串
 * @param input 要序列化的对象或 DOM 文档
 * @param options 序列化选项
 * @returns XML 字符串
 */
export function serializeXml(input: any, options: XmlSerializeOptions = {}): string {
  try {
    let result: string
    
    if (input instanceof Document) {
      const serializer = new XMLSerializer()
      result = serializer.serializeToString(input)
    } else {
      result = builder.build(input)
    }
    
    if (options.indent || options.newline) {
      return formatXml(result, options)
    }
    
    return result
  } catch (error) {
    console.error('XML serialization error:', error)
    throw error
  }
}

/**
 * 格式化 XML 字符串
 * @param xml XML 字符串
 * @param options 格式化选项
 * @returns 格式化后的 XML 字符串
 */
function formatXml(xml: string, options: XmlSerializeOptions): string {
  const indent = options.indent || '  '
  const newline = options.newline || '\n'
  let formatted = ''
  let depth = 0
  let lastChar = ''
  let inTag = false
  let inContent = false
  let inQuote: string | false = false
  let preserveSpace = false
  
  // 遍历每个字符
  for (let i = 0; i < xml.length; i++) {
    const char = xml.charAt(i)
    
    // 处理引号
    if (char === '"' || char === "'") {
      if (!inQuote) {
        inQuote = char
      } else if (inQuote === char) {
        inQuote = false
      }
    }
    
    // 如果在引号内，直接添加字符
    if (inQuote) {
      formatted += char
      continue
    }
    
    // 处理标签
    switch (char) {
      case '<':
        if (xml.charAt(i + 1) === '!') {
          // 注释或 CDATA
          preserveSpace = true
        } else if (xml.charAt(i + 1) === '/') {
          // 结束标签
          depth--
        } else {
          // 开始标签
          if (!inTag) depth++
        }
        if (inContent) {
          formatted += newline + indent.repeat(depth)
        }
        inTag = true
        inContent = false
        formatted += char
        break
        
      case '>':
        inTag = false
        formatted += char
        if (xml.charAt(i - 1) === '/') {
          // 自闭合标签
          depth--
        }
        if (!preserveSpace && i + 1 < xml.length && xml.charAt(i + 1) !== '<') {
          // 如果下一个字符不是标签开始，说明是内容
          inContent = true
          if (xml.charAt(i + 1).trim()) {
            formatted += newline + indent.repeat(depth)
          }
        }
        break
        
      case ' ':
      case '\t':
      case '\n':
      case '\r':
        // 处理空白字符
        if (inTag || preserveSpace) {
          formatted += char
        } else if (lastChar !== ' ' && lastChar !== '>') {
          formatted += ' '
        }
        break
        
      default:
        if (!inTag && lastChar === '>') {
          inContent = true
        }
        formatted += char
    }
    
    // 更新上一个字符
    if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
      lastChar = char
    }
    
    // 重置保留空白标记
    if (preserveSpace && char === '>') {
      preserveSpace = false
    }
  }
  
  return formatted
} 