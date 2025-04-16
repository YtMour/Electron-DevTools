/**
 * 简单的TOML解析器，用于浏览器环境
 * 注意：这是一个简化版本，只支持基本的TOML语法
 */

/**
 * 解析TOML字符串为JavaScript对象
 * @param tomlStr TOML字符串
 * @returns 解析后的JavaScript对象
 */
export function parse(tomlStr: string): any {
  // 移除注释和空行
  const lines = tomlStr
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  
  const result: any = {};
  let currentSection: any = result;
  let currentSectionName = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 处理表头 [section]
    if (line.startsWith('[') && line.endsWith(']')) {
      const sectionPath = line.slice(1, -1).trim().split('.');
      let targetObj = result;
      
      // 创建嵌套对象结构
      for (let j = 0; j < sectionPath.length - 1; j++) {
        const key = sectionPath[j];
        if (!targetObj[key]) {
          targetObj[key] = {};
        }
        targetObj = targetObj[key];
      }
      
      const lastKey = sectionPath[sectionPath.length - 1];
      if (!targetObj[lastKey]) {
        targetObj[lastKey] = {};
      }
      
      currentSection = targetObj[lastKey];
      currentSectionName = sectionPath.join('.');
      continue;
    }
    
    // 处理键值对
    const equalPos = line.indexOf('=');
    if (equalPos !== -1) {
      const key = line.slice(0, equalPos).trim();
      let value = line.slice(equalPos + 1).trim();
      
      // 递归解析嵌套的键
      if (key.includes('.')) {
        const keyPath = key.split('.');
        let targetObj = currentSection;
        
        for (let j = 0; j < keyPath.length - 1; j++) {
          const nestedKey = keyPath[j];
          if (!targetObj[nestedKey]) {
            targetObj[nestedKey] = {};
          }
          targetObj = targetObj[nestedKey];
        }
        
        const lastKey = keyPath[keyPath.length - 1];
        targetObj[lastKey] = parseValue(value);
      } else {
        currentSection[key] = parseValue(value);
      }
    }
  }
  
  return result;
}

/**
 * 解析TOML值
 * @param value TOML值字符串
 * @returns 解析后的JavaScript值
 */
function parseValue(value: string): any {
  // 字符串
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // 布尔值
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // 数组
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      // 简单解析数组（忽略复杂情况）
      const arrayContent = value.slice(1, -1);
      if (!arrayContent.trim()) return [];
      
      // 分割数组项
      return arrayContent.split(',').map(item => parseValue(item.trim()));
    } catch (e) {
      // 如果解析失败，返回原始字符串
      return value;
    }
  }
  
  // 数字
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  
  // 默认返回字符串
  return value;
}

/**
 * 将JavaScript对象序列化为TOML字符串
 * @param obj JavaScript对象
 * @returns TOML字符串
 */
export function stringify(obj: any): string {
  let result = '';
  
  // 处理基本属性（非嵌套对象）
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || value === null) {
      result += `${key} = ${stringifyValue(value)}\n`;
    }
  }
  
  if (result) result += '\n';
  
  // 处理嵌套对象
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += stringifyObject(key, value);
    }
  }
  
  return result.trim();
}

/**
 * 序列化嵌套对象
 * @param sectionName 节名称
 * @param obj 对象
 * @returns TOML字符串片段
 */
function stringifyObject(sectionName: string, obj: any): string {
  let result = `[${sectionName}]\n`;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      result += `${key} = ${stringifyValue(value)}\n`;
    }
  }
  
  result += '\n';
  
  // 处理嵌套对象
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result += stringifyObject(`${sectionName}.${key}`, value);
    }
  }
  
  return result;
}

/**
 * 序列化TOML值
 * @param value JavaScript值
 * @returns TOML值字符串
 */
function stringifyValue(value: any): string {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    return `[${value.map(stringifyValue).join(', ')}]`;
  }
  
  if (value === null || value === undefined) {
    return '""';
  }
  
  return JSON.stringify(value);
}

export default {
  parse,
  stringify
}; 