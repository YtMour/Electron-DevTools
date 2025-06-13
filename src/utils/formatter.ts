/**
 * 代码格式化工具
 * 支持多种编程语言的代码格式化
 */

export interface FormatOptions {
  indentSize?: number
  useTabs?: boolean
  insertFinalNewline?: boolean
  trimTrailingWhitespace?: boolean
}

export interface FormatResult {
  formatted: string
  error?: string
  language: string
}

/**
 * JavaScript/TypeScript 格式化器
 */
export class JavaScriptFormatter {
  static format(code: string, options: FormatOptions = {}): FormatResult {
    try {
      const {
        indentSize = 2,
        useTabs = false,
        insertFinalNewline = true,
        trimTrailingWhitespace = true
      } = options

      let formatted = code

      // 基本的格式化逻辑
      if (trimTrailingWhitespace) {
        formatted = formatted.replace(/[ \t]+$/gm, '')
      }

      // 简单的缩进处理
      const indent = useTabs ? '\t' : ' '.repeat(indentSize)
      let indentLevel = 0
      const lines = formatted.split('\n')
      
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        
        if (trimmedLine === '') return ''
        
        // 减少缩进的字符
        if (trimmedLine.includes('}') || trimmedLine.includes(']') || trimmedLine.includes(')')
            || trimmedLine.startsWith('case ') || trimmedLine.startsWith('default:')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const formattedLine = indent.repeat(indentLevel) + trimmedLine
        
        // 增加缩进的字符
        if (trimmedLine.includes('{') || trimmedLine.includes('[') || trimmedLine.includes('(')
            || trimmedLine.endsWith(':') && !trimmedLine.includes('?')) {
          indentLevel++
        }
        
        return formattedLine
      })

      formatted = formattedLines.join('\n')

      if (insertFinalNewline && !formatted.endsWith('\n')) {
        formatted += '\n'
      }

      return {
        formatted,
        language: 'javascript'
      }
    } catch (error) {
      return {
        formatted: code,
        error: error instanceof Error ? error.message : 'Unknown error',
        language: 'javascript'
      }
    }
  }
}

/**
 * CSS 格式化器
 */
export class CSSFormatter {
  static format(code: string, options: FormatOptions = {}): FormatResult {
    try {
      const {
        indentSize = 2,
        useTabs = false,
        insertFinalNewline = true,
        trimTrailingWhitespace = true
      } = options

      let formatted = code

      if (trimTrailingWhitespace) {
        formatted = formatted.replace(/[ \t]+$/gm, '')
      }

      // 基本的CSS格式化
      const indent = useTabs ? '\t' : ' '.repeat(indentSize)
      
      // 处理选择器和属性
      formatted = formatted
        .replace(/\s*{\s*/g, ' {\n')
        .replace(/;\s*/g, ';\n')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/,\s*/g, ',\n')

      // 添加缩进
      const lines = formatted.split('\n')
      let indentLevel = 0
      
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        
        if (trimmedLine === '') return ''
        
        if (trimmedLine === '}') {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const formattedLine = indent.repeat(indentLevel) + trimmedLine
        
        if (trimmedLine.includes('{')) {
          indentLevel++
        }
        
        return formattedLine
      })

      formatted = formattedLines.join('\n').replace(/\n\n+/g, '\n\n')

      if (insertFinalNewline && !formatted.endsWith('\n')) {
        formatted += '\n'
      }

      return {
        formatted,
        language: 'css'
      }
    } catch (error) {
      return {
        formatted: code,
        error: error instanceof Error ? error.message : 'Unknown error',
        language: 'css'
      }
    }
  }
}

/**
 * HTML 格式化器
 */
export class HTMLFormatter {
  static format(code: string, options: FormatOptions = {}): FormatResult {
    try {
      const {
        indentSize = 2,
        useTabs = false,
        insertFinalNewline = true,
        trimTrailingWhitespace = true
      } = options

      let formatted = code

      if (trimTrailingWhitespace) {
        formatted = formatted.replace(/[ \t]+$/gm, '')
      }

      const indent = useTabs ? '\t' : ' '.repeat(indentSize)
      
      // 简单的HTML格式化
      formatted = formatted
        .replace(/>\s*</g, '>\n<')
        .replace(/^\s+|\s+$/g, '')

      const lines = formatted.split('\n')
      let indentLevel = 0
      const selfClosingTags = ['br', 'hr', 'img', 'input', 'meta', 'link']
      
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        
        if (trimmedLine === '') return ''
        
        // 检查是否是结束标签
        if (trimmedLine.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const formattedLine = indent.repeat(indentLevel) + trimmedLine
        
        // 检查是否是开始标签（非自闭合）
        if (trimmedLine.startsWith('<') && !trimmedLine.startsWith('</') && !trimmedLine.endsWith('/>')) {
          const tagName = trimmedLine.match(/<(\w+)/)?.[1]?.toLowerCase()
          if (tagName && !selfClosingTags.includes(tagName)) {
            indentLevel++
          }
        }
        
        return formattedLine
      })

      formatted = formattedLines.join('\n')

      if (insertFinalNewline && !formatted.endsWith('\n')) {
        formatted += '\n'
      }

      return {
        formatted,
        language: 'html'
      }
    } catch (error) {
      return {
        formatted: code,
        error: error instanceof Error ? error.message : 'Unknown error',
        language: 'html'
      }
    }
  }
}

/**
 * 通用格式化器
 */
export class CodeFormatter {
  static format(code: string, language: string, options: FormatOptions = {}): FormatResult {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
        return JavaScriptFormatter.format(code, options)
      
      case 'css':
      case 'scss':
      case 'sass':
        return CSSFormatter.format(code, options)
      
      case 'html':
      case 'htm':
        return HTMLFormatter.format(code, options)
      
      default:
        return {
          formatted: code,
          error: `Unsupported language: ${language}`,
          language
        }
    }
  }

  static getSupportedLanguages(): string[] {
    return [
      'javascript', 'js', 'typescript', 'ts',
      'css', 'scss', 'sass',
      'html', 'htm'
    ]
  }
}
