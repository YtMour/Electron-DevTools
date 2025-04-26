<template>
  <div class="ipv4-converter-page format-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv4 地址转换器</h2>
        <p class="header-desc">在不同表示格式之间转换IPv4地址</p>
      </div>
    </div>

    <div class="page-content">
      <el-card class="converter-card">
        <div class="card-header">
          <el-icon><Connection /></el-icon>
          <span>输入IP地址</span>
        </div>

        <el-form :model="form" label-position="top">
          <el-form-item label="IP地址">
            <el-input
              v-model="form.ipAddress"
              :placeholder="getPlaceholder(form.inputFormat)"
              @input="convertAddress"
            />
            <div v-if="error" class="error-message">{{ error }}</div>
          </el-form-item>

          <el-form-item label="输入格式">
            <el-radio-group v-model="form.inputFormat" @change="convertAddress">
              <el-radio-button label="dotted-decimal">点分十进制</el-radio-button>
              <el-radio-button label="decimal">十进制</el-radio-button>
              <el-radio-button label="hex">十六进制</el-radio-button>
              <el-radio-button label="binary">二进制</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="results-card" v-if="!error && results.ipDecimal">
        <div class="card-header">
          <el-icon><Histogram /></el-icon>
          <span>转换结果</span>
          <div class="copy-button">
            <el-button type="primary" plain size="small" @click="copyResults">
              <el-icon><CopyDocument /></el-icon>
              复制结果
            </el-button>
          </div>
        </div>

        <div class="results-container">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="点分十进制">
              <span class="result-value">{{ results.ipDotted }}</span>
              <el-button
                type="primary"
                link
                size="small"
                @click="copyFormat('dotted-decimal')"
                class="copy-format"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-descriptions-item>
            
            <el-descriptions-item label="十进制">
              <span class="result-value">{{ results.ipDecimal }}</span>
              <el-button
                type="primary"
                link
                size="small"
                @click="copyFormat('decimal')"
                class="copy-format"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-descriptions-item>
            
            <el-descriptions-item label="十六进制">
              <span class="result-value">{{ results.ipHex }}</span>
              <el-button
                type="primary"
                link
                size="small"
                @click="copyFormat('hex')"
                class="copy-format"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-descriptions-item>
            
            <el-descriptions-item label="二进制">
              <span class="result-value">{{ results.ipBinary }}</span>
              <el-button
                type="primary"
                link
                size="small"
                @click="copyFormat('binary')"
                class="copy-format"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <el-card class="info-card">
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>使用说明</span>
        </div>

        <div class="info-content">
          <h4>支持的格式</h4>
          <ul>
            <li>
              <strong>点分十进制：</strong>
              最常见的IP地址格式，例如 <code>192.168.1.1</code>
            </li>
            <li>
              <strong>十进制：</strong>
              32位无符号整数表示，例如 <code>3232235777</code>
            </li>
            <li>
              <strong>十六进制：</strong>
              以十六进制表示，例如 <code>0xC0A80101</code> 或 <code>C0A80101</code>
            </li>
            <li>
              <strong>二进制：</strong>
              以32位二进制表示，例如 <code>11000000101010000000000100000001</code>
            </li>
          </ul>

          <h4>常见转换</h4>
          <el-table :data="commonExamples" stripe>
            <el-table-column prop="dotted" label="点分十进制" />
            <el-table-column prop="decimal" label="十进制" />
            <el-table-column prop="hex" label="十六进制" />
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, InfoFilled, CopyDocument, Histogram } from '@element-plus/icons-vue';
import { IPv4Address } from '@/utils/network/ipv4';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  ipAddress: '',
  inputFormat: 'dotted-decimal' as 'dotted-decimal' | 'decimal' | 'hex' | 'binary',
});

// 结果
const results = reactive({
  ipDotted: '',
  ipDecimal: '',
  ipHex: '',
  ipBinary: '',
});

// 错误信息
const error = ref('');

// 获取输入占位符
const getPlaceholder = (format: string) => {
  switch (format) {
    case 'dotted-decimal':
      return '例如：192.168.1.1';
    case 'decimal':
      return '例如：3232235777';
    case 'hex':
      return '例如：C0A80101 或 0xC0A80101';
    case 'binary':
      return '例如：11000000101010000000000100000001';
    default:
      return '';
  }
};

// 常见例子
const commonExamples = [
  { dotted: '192.168.1.1', decimal: '3232235777', hex: 'C0A80101' },
  { dotted: '10.0.0.1', decimal: '167772161', hex: '0A000001' },
  { dotted: '127.0.0.1', decimal: '2130706433', hex: '7F000001' },
  { dotted: '8.8.8.8', decimal: '134744072', hex: '08080808' },
];

// 转换地址
const convertAddress = () => {
  if (!form.ipAddress) {
    resetResults();
    error.value = '';
    return;
  }

  try {
    let numericIp: number;

    switch (form.inputFormat) {
      case 'dotted-decimal':
        numericIp = IPv4Address.parseAddress(form.ipAddress);
        break;
      case 'decimal':
        numericIp = parseInt(form.ipAddress, 10);
        if (isNaN(numericIp) || numericIp < 0 || numericIp > 0xffffffff) {
          throw new Error('无效的十进制IP地址');
        }
        break;
      case 'hex':
        let hexStr = form.ipAddress.startsWith('0x') 
          ? form.ipAddress.substring(2) 
          : form.ipAddress;
        
        if (!/^[0-9A-Fa-f]{1,8}$/.test(hexStr)) {
          throw new Error('无效的十六进制IP地址');
        }
        
        numericIp = parseInt(hexStr, 16);
        break;
      case 'binary':
        if (!/^[01]{1,32}$/.test(form.ipAddress)) {
          throw new Error('无效的二进制IP地址');
        }
        numericIp = parseInt(form.ipAddress, 2);
        break;
      default:
        throw new Error('未知格式');
    }

    // 确保在有效范围内
    if (numericIp < 0 || numericIp > 0xffffffff) {
      throw new Error('IP地址超出范围');
    }

    // 更新结果
    const ipObj = new IPv4Address(numericIp);
    results.ipDotted = ipObj.toString();
    results.ipDecimal = numericIp.toString();
    results.ipHex = numericIp.toString(16).toUpperCase().padStart(8, '0');
    results.ipBinary = numericIp.toString(2).padStart(32, '0');
    error.value = '';
  } catch (e) {
    resetResults();
    error.value = (e as Error).message;
  }
};

// 重置结果
const resetResults = () => {
  results.ipDotted = '';
  results.ipDecimal = '';
  results.ipHex = '';
  results.ipBinary = '';
};

// 复制特定格式
const copyFormat = async (format: string) => {
  let textToCopy = '';
  
  switch (format) {
    case 'dotted-decimal':
      textToCopy = results.ipDotted;
      break;
    case 'decimal':
      textToCopy = results.ipDecimal;
      break;
    case 'hex':
      textToCopy = results.ipHex;
      break;
    case 'binary':
      textToCopy = results.ipBinary;
      break;
  }
  
  if (textToCopy) {
    try {
      await copy(textToCopy);
      ElMessage.success('已复制到剪贴板');
    } catch (error) {
      ElMessage.error('复制失败');
    }
  }
};

// 复制所有结果
const copyResults = async () => {
  const text = `
点分十进制: ${results.ipDotted}
十进制值: ${results.ipDecimal}
十六进制: ${results.ipHex}
二进制: ${results.ipBinary}
`.trim();

  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};
</script>

<style lang="scss" scoped>
.ipv4-converter-page {
  .page-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-size: 16px;
    
    .el-icon {
      color: var(--el-color-primary);
    }
    
    .copy-button {
      margin-left: auto;
    }
  }
  
  .info-card {
    grid-column: 1 / -1;
    
    .info-content {
      font-size: 14px;
      color: var(--el-text-color-regular);
      
      h4 {
        margin: 16px 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      
      ul {
        padding-left: 20px;
        margin: 8px 0;
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
      }
      
      code {
        font-family: monospace;
        background: var(--el-fill-color-light);
        padding: 2px 4px;
        border-radius: 3px;
        color: var(--el-color-primary);
      }
    }
  }
  
  .error-message {
    color: var(--el-color-danger);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .results-container {
    .result-value {
      font-family: monospace;
      word-break: break-all;
    }
    
    .copy-format {
      margin-left: 8px;
    }
  }
}

@media (max-width: 768px) {
  .ipv4-converter-page {
    .page-content {
      grid-template-columns: 1fr;
    }
  }
}
</style> 