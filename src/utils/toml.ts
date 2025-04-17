// 只导入YAML库用于YAML转换
import * as yaml from 'js-yaml'

/**
 * TOML 转 JSON
 * @param tomlStr TOML 字符串
 * @param indent 缩进空格数
 * @returns JSON 字符串
 */
export function toml2json(tomlStr: string, indent: number = 2): string {
  try {
    // 使用自定义解析器解析TOML
    const obj = simpleTomlParse(tomlStr)
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
 * @param format 是否格式化
 * @returns TOML 字符串
 */
export function json2toml(jsonStr: string, format: boolean = true): string {
  try {
    // 解析 JSON 为 JavaScript 对象
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    // 转换为 TOML
    return simpleJsonToToml(obj, format)
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
    const obj = simpleTomlParse(tomlStr)
    // 将对象转换为 YAML 字符串
    return yaml.dump(obj, {
      indent: format ? indent : 0,
      lineWidth: format ? -1 : 1000, // 格式化时禁用行宽限制，压缩时使用大值
      noRefs: true, // 避免使用引用标记
      sortKeys: false, // 保持键的原始顺序
      flowLevel: format ? -1 : 0 // 格式化时使用块样式，压缩时使用流样式
    })
  } catch (error) {
    console.error('TOML to YAML conversion error:', error)
    throw error
  }
}

/**
 * YAML 转 TOML
 * @param yamlStr YAML 字符串
 * @param format 是否格式化
 * @returns TOML 字符串
 */
export function yaml2toml(yamlStr: string, format: boolean = true): string {
  try {
    // 先将 YAML 转为对象
    const obj = yaml.load(yamlStr)
    // 将对象转换为 TOML 字符串
    return simpleJsonToToml(obj, format)
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
    simpleTomlParse(tomlStr)
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
    yaml.load(yamlStr)
    return true
  } catch (error) {
    return false
  }
}

/**
 * 格式化 TOML 字符串
 * @param tomlStr TOML 字符串
 * @returns 格式化后的 TOML 字符串
 */
export function formatToml(tomlStr: string): string {
  try {
    // 先解析成对象再转回 TOML 以实现格式化
    const obj = simpleTomlParse(tomlStr)
    return simpleJsonToToml(obj, true)
  } catch (error) {
    console.error('TOML formatting error:', error)
    throw error
  }
}

/**
 * 压缩 TOML 字符串
 * @param tomlStr TOML 字符串
 * @returns 压缩后的 TOML 字符串
 */
export function compressToml(tomlStr: string): string {
  try {
    // 先解析成对象再转回 TOML 以实现压缩
    const obj = simpleTomlParse(tomlStr)
    return simpleJsonToToml(obj, false)
  } catch (error) {
    console.error('TOML compression error:', error)
    throw error
  }
}

/**
 * 简单的TOML解析器（替代实际库）
 * 注意：这是简化实现，不支持所有TOML特性
 */
function simpleTomlParse(tomlStr: string): any {
  const result: any = {};
  let currentSection: any = result;
  const sectionStack: any[] = [result];
  
  // 正则表达式：匹配键值对、节、注释和空行
  const lines = tomlStr.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过空行和注释
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    
    // 处理节定义 [section] 或 [[array]]
    if (trimmedLine.startsWith('[')) {
      const isArray = trimmedLine.startsWith('[[') && trimmedLine.endsWith(']]');
      const sectionName = isArray 
        ? trimmedLine.substring(2, trimmedLine.length - 2).trim()
        : trimmedLine.substring(1, trimmedLine.length - 1).trim();
      
      // 处理嵌套节点
      if (sectionName.includes('.')) {
        const parts = sectionName.split('.');
        let container = result;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!container[parts[i]]) {
            container[parts[i]] = {};
          }
          container = container[parts[i]];
        }
        
        const lastPart = parts[parts.length - 1];
        if (isArray) {
          if (!container[lastPart]) {
            container[lastPart] = [];
          }
          const newItem = {};
          container[lastPart].push(newItem);
          currentSection = newItem;
        } else {
          if (!container[lastPart]) {
            container[lastPart] = {};
          }
          currentSection = container[lastPart];
        }
      } else {
        if (isArray) {
          if (!result[sectionName]) {
            result[sectionName] = [];
          }
          const newItem = {};
          result[sectionName].push(newItem);
          currentSection = newItem;
        } else {
          if (!result[sectionName]) {
            result[sectionName] = {};
          }
          currentSection = result[sectionName];
        }
      }
      
      sectionStack.push(currentSection);
      continue;
    }
    
    // 处理键值对
    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // 解析值
      if (value === 'true') {
        currentSection[key] = true;
      } else if (value === 'false') {
        currentSection[key] = false;
      } else if (/^[-+]?\d+$/.test(value)) {
        currentSection[key] = parseInt(value, 10);
      } else if (/^[-+]?\d*\.\d+$/.test(value)) {
        currentSection[key] = parseFloat(value);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        currentSection[key] = value.substring(1, value.length - 1)
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      } else if (value.startsWith("'") && value.endsWith("'")) {
        currentSection[key] = value.substring(1, value.length - 1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          // 简单数组解析
          const arrayStr = value.replace(/\[|\]/g, '')
            .split(',')
            .map(item => item.trim());
            
          currentSection[key] = arrayStr.map(item => {
            if (item === 'true') return true;
            if (item === 'false') return false;
            if (/^[-+]?\d+$/.test(item)) return parseInt(item, 10);
            if (/^[-+]?\d*\.\d+$/.test(item)) return parseFloat(item);
            if (item.startsWith('"') && item.endsWith('"')) {
              return item.substring(1, item.length - 1)
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');
            }
            return item;
          });
        } catch (e) {
          currentSection[key] = value;
        }
      } else {
        currentSection[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * 简单的JSON转TOML转换器（替代实际库）
 * 注意：这是简化实现，不支持所有TOML特性
 */
function simpleJsonToToml(data: any, format: boolean = true): string {
  const indent = format ? '  ' : '';
  const newline = format ? '\n' : '';
  let result = '';
  
  // 递归处理对象
  function processObject(obj: any, path: string = '', inArray: boolean = false): string {
    let output = '';
    const simpleData: Record<string, any> = {};
    const complexData: Record<string, any> = {};
    
    // 分离简单数据和复杂数据
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      // 判断复杂数据
      if (
        typeof value === 'object' && 
        !Array.isArray(value) && 
        Object.keys(value).length > 0
      ) {
        complexData[key] = value;
      } else {
        simpleData[key] = value;
      }
    }
    
    // 处理简单数据
    for (const [key, value] of Object.entries(simpleData)) {
      if (inArray) {
        output += formatKeyValue(key, value, indent) + newline;
      } else {
        output += formatKeyValue(key, value, '') + newline;
      }
    }
    
    // 处理复杂数据
    for (const [key, value] of Object.entries(complexData)) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        // 处理对象数组
        for (const item of value) {
          output += newline + `[[${newPath}]]` + newline;
          output += processObject(item, '', true);
        }
      } else {
        // 处理常规对象
        output += newline + `[${newPath}]` + newline;
        output += processObject(value, '', false);
      }
    }
    
    return output;
  }
  
  // 格式化键值对
  function formatKeyValue(key: string, value: any, padding: string): string {
    if (value === undefined || value === null) return '';
    
    // 特殊处理数组
    if (Array.isArray(value)) {
      return `${padding}${key} = ${formatArray(value)}`;
    }
    
    // 特殊处理字符串
    if (typeof value === 'string') {
      // 如果包含特殊字符，使用双引号
      if (/[\r\n\t"]/.test(value)) {
        return `${padding}${key} = "${value.replace(/"/g, '\\"').replace(/\\/g, '\\\\')}"`;
      }
      return `${padding}${key} = "${value}"`;
    }
    
    // 处理日期
    if (value instanceof Date) {
      return `${padding}${key} = ${value.toISOString()}`;
    }
    
    // 其他类型
    return `${padding}${key} = ${value}`;
  }
  
  // 格式化数组
  function formatArray(array: any[]): string {
    const items = array.map(item => {
      if (typeof item === 'string') {
        return `"${item.replace(/"/g, '\\"')}"`;
      }
      if (typeof item === 'object' && item !== null) {
        return JSON.stringify(item);
      }
      return String(item);
    });
    
    return `[${items.join(', ')}]`;
  }
  
  // 处理根对象
  result = processObject(data);
  return result;
} 