import MarkdownIt from 'markdown-it'
import htmlToPdfMake from 'html-to-pdfmake'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// 初始化 pdfMake
pdfMake.vfs = pdfFonts as unknown as { [file: string]: string }

// 创建 Markdown 解析实例
const md = new MarkdownIt({
  html: true,            // 允许HTML标签
  breaks: true,          // 将换行符转换为<br>
  linkify: true,         // 将URL转换为链接
  typographer: true,     // 启用一些语言中立的替换+引号美化
  highlight: function (str: string, lang: string) {
    // 这里可以集成代码高亮库，如highlight.js
    return `<pre class="language-${lang}"><code>${str}</code></pre>`
  }
})

/**
 * Markdown 转 HTML
 * @param markdownStr Markdown 字符串
 * @returns HTML 字符串
 */
export function markdown2html(markdownStr: string): string {
  try {
    // 解析 Markdown 为 HTML
    return md.render(markdownStr)
  } catch (error) {
    console.error('Markdown to HTML conversion error:', error)
    throw error
  }
}

/**
 * HTML 转 PDF
 * @param htmlStr HTML 字符串
 * @param title 文档标题（可选）
 * @returns PDF Blob 对象
 */
export function html2pdf(htmlStr: string, title: string = 'Document'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 将 HTML 转换为 pdfmake 兼容格式
      const content = htmlToPdfMake(htmlStr, {
        defaultStyles: {
          h1: { fontSize: 24, bold: true, marginBottom: 5 },
          h2: { fontSize: 20, bold: true, marginBottom: 5 },
          h3: { fontSize: 16, bold: true, marginBottom: 5 },
          h4: { fontSize: 14, bold: true, marginBottom: 5 },
          h5: { fontSize: 12, bold: true, marginBottom: 5 },
          h6: { fontSize: 10, bold: true, marginBottom: 5 },
          a: { color: 'blue', decoration: 'underline' }
        }
      })

      // 创建文档定义
      // @ts-ignore - pdfmake类型定义与实际使用不完全匹配
      const docDefinition = {
        info: {
          title: title,
          creator: 'Yt Tools'
        },
        content: content,
        defaultStyle: {
          fontSize: 12,
          lineHeight: 1.5
        },
        styles: {
          'code-block': {
            background: '#f8f8f8',
            padding: [5, 5, 5, 5] as [number, number, number, number],
            margin: [0, 5, 0, 5] as [number, number, number, number],
            fontSize: 10
          }
        }
      }

      // 创建 PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition)
      
      // 获取 Blob
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob)
      })
    } catch (error) {
      console.error('HTML to PDF conversion error:', error)
      reject(error)
    }
  })
}

/**
 * Markdown 转 PDF
 * @param markdownStr Markdown 字符串
 * @param title 文档标题（可选）
 * @returns PDF Blob 对象
 */
export function markdown2pdf(markdownStr: string, title: string = 'Document'): Promise<Blob> {
  try {
    // 先将 Markdown 转换为 HTML
    const html = markdown2html(markdownStr)
    // 再将 HTML 转换为 PDF
    return html2pdf(html, title)
  } catch (error) {
    console.error('Markdown to PDF conversion error:', error)
    return Promise.reject(error)
  }
}

/**
 * 验证 Markdown 字符串是否有效
 * @param markdownStr Markdown 字符串
 * @returns 是否有效
 */
export function isValidMarkdown(markdownStr: string): boolean {
  try {
    // Markdown 几乎总是有效的，但我们可以进行一些基本检查
    // 例如，确保它至少返回一些 HTML 内容
    const html = md.render(markdownStr)
    return html.length > 0
  } catch (error) {
    return false
  }
}

// Markdown 示例
export const markdownExample = `# Markdown 示例文档

## 1. 基本格式

**粗体文本** 和 *斜体文本*，也可以 ~~删除线~~

## 2. 列表

### 无序列表

- 项目 1
- 项目 2
  - 子项目 A
  - 子项目 B

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 3. 链接和图片

[链接文本](https://example.com)

![图片替代文本](https://via.placeholder.com/150)

## 4. 引用

> 这是一段引用的文本。
> 
> 它可以跨越多行。

## 5. 代码

行内代码：\`console.log('Hello World')\`

代码块：

\`\`\`javascript
// 这是一个 JavaScript 代码块
function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));
\`\`\`

## 6. 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 28 | 工程师 |
| 李四 | 32 | 设计师 |
| 王五 | 45 | 经理 |

## 7. 水平线

---

## 8. 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务

## 9. 数学公式（部分解析器支持）

行内公式：$E=mc^2$

独立公式：

$$
F(x) = \\int_{-\\infty}^{\\infty} f(x) e^{-2\\pi i x \\xi} dx
$$
` 