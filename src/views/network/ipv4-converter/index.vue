<template>
  <div class="network-tool-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv4地址转换器</h2>
        <p class="header-desc">在不同表示格式间转换IPv4地址</p>
      </div>
    </div>

    <div class="page-content main-sidebar">
      <div class="main-content-left">
        <el-card class="network-card config-card">
        <div class="card-header">
            <div class="card-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="card-title">地址转换器</div>
        </div>

          <div class="form-group">
            <label>输入IPv4地址</label>
            <el-input
              v-model="ipInput"
              placeholder="输入IP地址 (如: 192.168.1.1, 3232235777, 0xC0A80101 或二进制)"
              @input="onInputChange"
              @keydown.enter="convert"
            >
              <template #prepend>
                <el-select 
                  v-model="inputFormat" 
                  placeholder="格式" 
                  @change="onFormatChange"
                  class="format-select"
                >
                  <el-option label="点分十进制" value="dotted" />
                  <el-option label="十进制" value="decimal" />
                  <el-option label="十六进制" value="hex" />
                  <el-option label="二进制" value="binary" />
                  <el-option label="自动检测" value="auto" />
                </el-select>
              </template>
              <template #append>
                <el-button @click="convert">转换</el-button>
              </template>
            </el-input>
            <div class="validation-error" v-if="validationError">
              {{ validationError }}
          </div>
        </div>

          <div class="result-table" v-if="conversionResults.valid">
            <div class="table-header">转换结果</div>
            <el-table :data="resultTableData" border stripe style="width: 100%">
              <el-table-column prop="format" label="格式" width="150" />
              <el-table-column prop="value" label="值">
                <template #default="scope">
                  <div class="result-value">
                    <span>{{ scope.row.value }}</span>
              <el-button
                type="primary"
                      text
                size="small"
                      class="copy-button"
                      @click="copyToClipboard(scope.row.value)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
        </div>
      </el-card>
      </div>

      <el-card class="network-card info-card">
        <div class="card-header">
          <div class="card-icon">
          <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">使用说明</div>
        </div>

        <div class="help-content">
          <h4>IPv4地址格式</h4>
          <p>IPv4地址可以用多种格式表示，此工具支持以下格式之间的转换：</p>
          
          <ul>
            <li>
              <strong>点分十进制</strong>: 最常见的格式，如 <code>192.168.1.1</code>
            </li>
            <li>
              <strong>十进制</strong>: 32位整数表示，如 <code>3232235777</code>
            </li>
            <li>
              <strong>十六进制</strong>: 以0x开头的十六进制表示，如 <code>0xC0A80101</code>
            </li>
            <li>
              <strong>二进制</strong>: 32位二进制表示，通常分组显示
            </li>
          </ul>

          <h4>使用方法</h4>
          <ol>
            <li>选择输入格式（或使用自动检测）</li>
            <li>输入要转换的IP地址</li>
            <li>点击"转换"按钮</li>
            <li>查看所有格式的转换结果</li>
          </ol>
          
          <h4>自动检测规则</h4>
          <p>自动检测功能根据以下规则识别IP格式：</p>
          <ul>
            <li>包含点(.)的视为点分十进制格式</li>
            <li>以0x开头的视为十六进制格式</li>
            <li>只包含0和1且长度为32的视为二进制格式</li>
            <li>其他纯数字视为十进制整数格式</li>
          </ul>
          
          <h4>常见示例</h4>
          <div class="examples">
            <div class="example-item">
              <div class="example-label">点分十进制:</div>
              <div class="example-value">192.168.1.1</div>
            </div>
            <div class="example-item">
              <div class="example-label">十进制整数:</div>
              <div class="example-value">3232235777</div>
            </div>
            <div class="example-item">
              <div class="example-label">十六进制:</div>
              <div class="example-value">0xC0A80101</div>
            </div>
            <div class="example-item">
              <div class="example-label">二进制:</div>
              <div class="example-value">11000000101010000000000100000001</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <div class="quick-examples" v-if="!conversionResults.valid">
      <div class="examples-header">常用IP地址示例：</div>
      <div class="quick-examples-buttons">
        <el-button size="small" @click="setExample('192.168.1.1')">192.168.1.1</el-button>
        <el-button size="small" @click="setExample('127.0.0.1')">127.0.0.1</el-button>
        <el-button size="small" @click="setExample('10.0.0.1')">10.0.0.1</el-button>
        <el-button size="small" @click="setExample('3232235777')">3232235777</el-button>
        <el-button size="small" @click="setExample('0xC0A80101')">0xC0A80101</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, InfoFilled, CopyDocument, Histogram, Aim } from '@element-plus/icons-vue';
import { IPv4Address } from '@/utils/network/ipv4';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

const ipInput = ref('');
const inputFormat = ref('auto');
const validationError = ref('');

// 转换结果
const conversionResults = reactive({
  valid: false,
  dotted: '',
  decimal: '',
  hex: '',
  binary: ''
});

// 表格数据
const resultTableData = computed(() => {
  if (!conversionResults.valid) return [];
  
  return [
    { format: '点分十进制', value: conversionResults.dotted },
    { format: '十进制', value: conversionResults.decimal },
    { format: '十六进制', value: conversionResults.hex },
    { format: '二进制', value: conversionResults.binary }
  ];
});

// 格式改变处理
function onFormatChange() {
  if (ipInput.value) {
    convert();
  }
}

// 输入变化处理
function onInputChange() {
  // 如果是自动检测模式，尝试自动识别格式
  if (inputFormat.value === 'auto' && ipInput.value) {
    detectFormat();
  }
  
  if (ipInput.value === '') {
    validationError.value = '';
    conversionResults.valid = false;
  }
}

// 自动检测格式
function detectFormat() {
  const input = ipInput.value.trim();
  
  if (input.includes('.')) {
    inputFormat.value = 'dotted';
  } else if (input.startsWith('0x') || input.startsWith('0X')) {
    inputFormat.value = 'hex';
  } else if (/^[01]{32}$/.test(input)) {
    inputFormat.value = 'binary';
  } else if (/^\d+$/.test(input)) {
    inputFormat.value = 'decimal';
  }
}

// 转换IP地址
function convert() {
  validationError.value = '';
  conversionResults.valid = false;
  
  if (!ipInput.value) {
    validationError.value = '请输入IP地址';
    return;
  }

  try {
    let ipAddress: IPv4Address;
    const input = ipInput.value.trim();
    
    // 如果是自动检测，先尝试识别格式
    if (inputFormat.value === 'auto') {
      detectFormat();
    }
    
    // 根据选择的格式创建IPv4Address对象
    switch (inputFormat.value) {
      case 'dotted':
        ipAddress = IPv4Address.fromDottedDecimal(input);
        break;
      case 'decimal':
        ipAddress = IPv4Address.fromDecimal(parseInt(input, 10));
        break;
      case 'hex':
        // 处理带0x和不带0x的情况
        const hexValue = input.startsWith('0x') || input.startsWith('0X') 
          ? input.substring(2)
          : input;
        ipAddress = IPv4Address.fromHex(hexValue);
        break;
      case 'binary':
        ipAddress = IPv4Address.fromBinary(input);
        break;
      default:
        validationError.value = '无法识别输入格式';
        return;
    }

    // 更新转换结果
    conversionResults.dotted = ipAddress.toDottedDecimal();
    conversionResults.decimal = ipAddress.toDecimal().toString();
    conversionResults.hex = '0x' + ipAddress.toHex().toUpperCase();
    conversionResults.binary = ipAddress.toBinary();
    conversionResults.valid = true;
    
  } catch (error: any) {
    validationError.value = `格式错误: ${error.message || '无效的IP地址格式'}`;
  }
}

// 复制到剪贴板
function copyToClipboard(text: string) {
  copy(text);
      ElMessage.success('已复制到剪贴板');
}

// 设置示例IP地址
function setExample(example: string) {
  ipInput.value = example;

  // 自动检测格式
  if (example.includes('.')) {
    inputFormat.value = 'dotted';
  } else if (example.startsWith('0x')) {
    inputFormat.value = 'hex';
  } else if (/^[01]{32}$/.test(example)) {
    inputFormat.value = 'binary';
  } else {
    inputFormat.value = 'decimal';
  }
  
  convert();
}

// 页面加载时，预设一个默认例子
onMounted(() => {
  ipInput.value = '192.168.1.1';
  inputFormat.value = 'dotted';
  convert();
});
</script>

<style lang="scss" scoped>
.network-tool-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
  display: block;
        font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
    }

/* 修复选择框宽度问题 */
:deep(.format-select) {
  width: 120px;
  
  @media (max-width: 768px) {
    width: 110px;
    }
    
  @media (max-width: 480px) {
    width: 90px;
  }
  
  .el-input__wrapper {
    width: 100%;
      }
      
  .el-select__popper {
    min-width: 120px !important;
          }
        }

.validation-error {
    color: var(--el-color-danger);
    font-size: 12px;
  margin-top: 5px;
  }
  
.result-content {
  padding: 20px;
    }
    
    .result-value {
  font-family: var(--el-font-family-monospace, monospace);
      word-break: break-all;
      font-size: 15px;
      background-color: var(--el-fill-color-light);
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
  max-width: calc(100% - 40px);
      overflow-x: auto;
    }
    
    .copy-format {
      margin-left: 8px;
      transition: all 0.2s;
      
      &:hover {
        transform: scale(1.1);
      }
    }

.table-header {
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 16px;
  }
  
.examples {
  margin-top: 15px;
  }
  
.example-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.example-label {
  min-width: 100px;
  font-weight: 500;
}

.example-value {
  font-family: var(--el-font-family-monospace, monospace);
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
  padding: 0 4px;
  border-radius: 2px;
}

.help-content {
  font-size: 14px;
  
  h4 {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  
  ul, ol {
    padding-left: 20px;
    margin-bottom: 10px;
  }
  
  li {
    margin-bottom: 4px;
  }
  
  p {
    margin-bottom: 10px;
  }
  
  code {
    font-family: var(--el-font-family-monospace, monospace);
    background: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--el-color-primary);
    font-size: 13px;
  }
}

.quick-examples {
  margin-top: 20px;
      background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
    }

.examples-header {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  }

.quick-examples-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 1200px) {
    .page-content {
      grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .network-tool-page {
    padding: 15px;
  }
  
  .result-value {
    font-size: 13px;
    max-width: calc(100% - 35px);
    }
    
  .header-actions {
    position: relative;
    margin-top: 10px;
  }
  
  .quick-examples-buttons {
    flex-direction: column;
    align-items: flex-start;
      
    .el-button {
      margin: 0;
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .el-input-group__prepend {
    padding-right: 0;
    }
    
  .el-input__wrapper {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style> 