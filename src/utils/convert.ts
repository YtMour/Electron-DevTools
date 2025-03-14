import { parseXml, serializeXml } from './xml'

interface XmlSerializeOptions {
  indent?: string
  newline?: string
}

/**
 * XML 转 JSON
 * @param xml XML 字符串
 * @returns JSON 对象
 */
export function xml2json(xml: string): any {
  const doc = parseXml(xml)
  return elementToJson(doc.documentElement)
}

/**
 * JSON 转 XML
 * @param json JSON 对象
 * @param options 序列化选项
 * @returns XML 字符串
 */
export function json2xml(json: any, options: XmlSerializeOptions = {}): string {
  const doc = document.implementation.createDocument(null, 'root', null)
  jsonToElement(json, doc.documentElement)
  return serializeXml(doc, options)
}

/**
 * 将 DOM 元素转换为 JSON 对象
 * @param element DOM 元素
 * @returns JSON 对象
 */
function elementToJson(element: Element): any {
  const result: any = {}
  
  // 处理属性
  for (const attr of element.attributes) {
    result[`@${attr.name}`] = attr.value
  }
  
  // 处理子元素
  const children = Array.from(element.childNodes)
  
  if (children.length === 0) {
    // 没有子节点，返回空字符串
    return element.textContent || ''
  } else if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
    // 只有一个文本节点
    return children[0].textContent || ''
  } else {
    // 处理子元素
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element
        const childName = childElement.tagName
        
        if (result[childName]) {
          // 如果已经存在同名子元素，转换为数组
          if (!Array.isArray(result[childName])) {
            result[childName] = [result[childName]]
          }
          result[childName].push(elementToJson(childElement))
        } else {
          result[childName] = elementToJson(childElement)
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim()
        if (text) {
          result['#text'] = text
        }
      }
    }
  }
  
  return result
}

/**
 * 将 JSON 对象转换为 DOM 元素
 * @param json JSON 对象
 * @param element 目标 DOM 元素
 */
function jsonToElement(json: any, element: Element): void {
  if (typeof json === 'string' || typeof json === 'number' || typeof json === 'boolean') {
    // 基本类型，直接设置为文本内容
    element.textContent = String(json)
  } else if (Array.isArray(json)) {
    // 数组类型，创建多个同名子元素
    for (const item of json) {
      const child = document.createElement(element.tagName)
      jsonToElement(item, child)
      element.appendChild(child)
    }
  } else if (json && typeof json === 'object') {
    // 对象类型
    for (const [key, value] of Object.entries(json)) {
      if (key.startsWith('@')) {
        // 属性
        element.setAttribute(key.slice(1), String(value))
      } else if (key === '#text') {
        // 文本节点
        element.textContent = String(value)
      } else {
        // 子元素
        const child = document.createElement(key)
        jsonToElement(value, child)
        element.appendChild(child)
      }
    }
  }
} 