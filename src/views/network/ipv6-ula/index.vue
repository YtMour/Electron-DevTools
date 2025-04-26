<template>
  <div class="ula-generator-container">
    <div class="header">
      <h1>IPv6 ULA 生成器</h1>
      <p>生成用于本地网络的IPv6唯一本地地址(ULA)</p>
    </div>
    
    <div class="main-content">
      <div class="generator-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><Connection /></el-icon>
            </span>
            <span class="title">生成IPv6 ULA</span>
          </div>
          
          <div class="panel-body">
            <div class="form-group">
              <label>前缀选项</label>
              <div class="prefix-options">
                <div 
                  class="prefix-option" 
                  :class="{ active: prefix === 'fd' }"
                  @click="prefix = 'fd'"
                >
                  fd00::/8 (推荐)
                </div>
                <div 
                  class="prefix-option" 
                  :class="{ active: prefix === 'fc' }"
                  @click="prefix = 'fc'"
                >
                  fc00::/8
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>子网ID (可选)</label>
              <el-input 
                v-model="form.subnetId" 
                placeholder="子网ID (例如: 0001)"
                maxlength="4"
                @input="validateSubnetId"
              />
              <div class="error-message" v-if="errors.subnetId">
                {{ errors.subnetId }}
              </div>
            </div>
            
            <div class="form-group">
              <label>接口ID (可选)</label>
              <el-input 
                v-model="form.interfaceId" 
                placeholder="接口ID (例如: 0000:0000:0000:0001)"
                maxlength="19"
                @input="validateInterfaceId"
              />
              <div class="error-message" v-if="errors.interfaceId">
                {{ errors.interfaceId }}
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="generateULA" class="generate-button">
                <el-icon><Operation /></el-icon>
                生成ULA地址
              </el-button>
              <el-button type="success" @click="copyULA" :disabled="!ulaAddress" class="copy-button">
                <el-icon><CopyDocument /></el-icon>
                复制到剪贴板
              </el-button>
            </div>
            
            <div class="result-container" v-if="ulaAddress">
              <div class="result-title">生成的ULA地址:</div>
              <div class="result-value">
                <div class="ipv6-address">{{ ulaAddress }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel ula-structure-panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><SetUp /></el-icon>
            </span>
            <span class="title">ULA地址结构</span>
          </div>
          
          <div class="panel-body">
            <div class="structure-diagram">
              <div class="structure-row">
                <div class="structure-cell">
                  <div class="cell-title">前缀</div>
                  <div class="cell-value">{{ prefix === 'fd' ? 'fd' : 'fc' }}</div>
                </div>
                <div class="structure-cell">
                  <div class="cell-title">全局ID</div>
                  <div class="cell-value">{{ globalId || '随机生成' }}</div>
                </div>
                <div class="structure-cell">
                  <div class="cell-title">子网ID</div>
                  <div class="cell-value">{{ form.subnetId || '0000' }}</div>
                </div>
                <div class="structure-cell">
                  <div class="cell-title">接口ID</div>
                  <div class="cell-value">{{ form.interfaceId || '自动生成' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="explanation-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><InfoFilled /></el-icon>
            </span>
            <span class="title">ULA 地址说明</span>
          </div>
          
          <div class="panel-body">
            <div class="help-content">
              <h3>什么是ULA?</h3>
              <p>
                IPv6唯一本地地址(Unique Local Address, ULA)是用于本地通信的IPv6地址，
                类似于IPv4中的私有地址(如192.168.x.x)。ULA地址在RFC 4193中定义，
                它们不可在全球互联网上路由，仅用于本地网络。
              </p>
              
              <h3>ULA地址特点</h3>
              <ul>
                <li>前缀为<code>fc00::/7</code>，通常使用<code>fd00::/8</code></li>
                <li>全局ID部分(40位)能够在站点间提供唯一性</li>
                <li>子网ID(16位)允许在组织内创建多达65536个子网</li>
                <li>接口ID(64位)用于标识网络接口</li>
                <li>在没有互联网连接的情况下也可使用</li>
                <li>可以在多个站点之间合并网络而不会产生地址冲突</li>
                <li>不易被意外路由到互联网</li>
              </ul>
              
              <h3>ULA地址格式</h3>
              <p>
                ULA地址的格式为: <code>prefix:global-id:subnet-id:interface-id</code>
              </p>
              <ul>
                <li><strong>前缀</strong>: fd或fc (fd更常用，表示本地分配)</li>
                <li><strong>全局ID</strong>: 随机生成的40位值，算法在RFC 4193中定义</li>
                <li><strong>子网ID</strong>: 16位值，用于创建子网</li>
                <li><strong>接口ID</strong>: 64位值，通常使用EUI-64或随机生成</li>
              </ul>
              
              <h3>使用场景</h3>
              <ul>
                <li>家庭网络和小型办公室网络</li>
                <li>没有全球IPv6连接的企业网络</li>
                <li>测试环境和实验室</li>
                <li>需要IPv6但不需要全球路由的封闭网络</li>
                <li>位置之间通过VPN或其他隧道互连的网络</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, Operation, InfoFilled, CopyDocument, SetUp } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  subnetId: '',
  interfaceId: ''
});

// 验证错误
const errors = reactive({
  subnetId: '',
  interfaceId: ''
});

// 前缀选项
const prefix = ref('fd');

// 生成的地址和相关值
const ulaAddress = ref('');
const globalId = ref('');

// 验证输入
const validateSubnetId = () => {
  if (form.subnetId && !/^[0-9a-fA-F]{1,4}$/.test(form.subnetId)) {
    errors.subnetId = '子网ID必须是1-4位十六进制数';
  } else {
    errors.subnetId = '';
  }
};

const validateInterfaceId = () => {
  if (form.interfaceId && !/^[0-9a-fA-F:]{1,19}$/.test(form.interfaceId)) {
    errors.interfaceId = '接口ID必须是十六进制数，最长19位(含冒号)';
  } else {
    errors.interfaceId = '';
  }
};

// 生成随机字节
const getRandomBytes = (length: number): string => {
  // 在浏览器环境中使用Web Crypto API
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// 生成ULA地址
const generateULA = () => {
  // 验证输入
  validateSubnetId();
  validateInterfaceId();
  
  if (errors.subnetId || errors.interfaceId) {
    ElMessage.warning('请修正表单中的错误');
    return;
  }
  
  try {
    // 生成40位随机全局ID（5字节）
    const randomGlobalId = getRandomBytes(5);
    globalId.value = randomGlobalId;
    
    // 使用提供的子网ID或默认值
    const subnetId = form.subnetId ? form.subnetId.toLowerCase().padStart(4, '0') : '0000';
    
    // 使用提供的接口ID或生成随机的
    const interfaceId = form.interfaceId ? 
      form.interfaceId.toLowerCase() : 
      getRandomBytes(8).replace(/(.{4})/g, '$1:').slice(0, -1);
    
    // 构建基本ULA前缀 (fd/fc + globalId)
    const ulaPrefix = prefix.value + randomGlobalId;
    
    // 格式化完整的ULA地址
    ulaAddress.value = formatIPv6Address(`${ulaPrefix}:${subnetId}:${interfaceId}`);
    
    ElMessage.success('ULA地址生成成功');
  } catch (error) {
    ElMessage.error(`生成失败: ${(error as Error).message}`);
  }
};

// 格式化IPv6地址为标准形式
const formatIPv6Address = (address: string): string => {
  // 分割地址并过滤空字符串
  const parts = address.split(':').filter(part => part !== '');
  
  // 确保有8个部分
  if (parts.length > 8) {
    // 如果超过8个部分，截断
    parts.splice(8);
  } else if (parts.length < 8) {
    // 如果少于8个部分，用0填充
    const zerosNeeded = 8 - parts.length;
    for (let i = 0; i < zerosNeeded; i++) {
      parts.push('0');
    }
  }
  
  // 返回格式化的地址
  return parts.join(':');
};

// 复制ULA地址
const copyULA = async () => {
  if (!ulaAddress.value) return;
  
  const text = `
IPv6 ULA地址: ${ulaAddress.value}
前缀: ${prefix.value}
全局ID: ${globalId.value}
子网ID: ${form.subnetId || '0000'}
接口ID: ${form.interfaceId || '自动生成'}
  `.trim();
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};
</script>

<style scoped>
.ula-generator-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 24px;
  text-align: left;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.header p {
  font-size: 16px;
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}

.generator-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background-color: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s;
}

.panel:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.panel-header .icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.panel-header .title {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.panel-body {
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

.error-message {
  font-size: 12px;
  margin-top: 5px;
}

.prefix-options {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.prefix-option {
  flex: 1;
  padding: 10px 16px;
  background-color: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
  transition: all 0.2s ease;
  user-select: none;
}

.prefix-option.active {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  font-weight: 500;
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}

.prefix-option:hover:not(.active) {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-fill-color);
}

/* 深色模式样式加强 */
:root.dark .prefix-option {
  background-color: #2a2b2f;
  border-color: #444;
  color: #e0e0e0;
}

:root.dark .prefix-option.active {
  background-color: rgba(64, 158, 255, 0.25);
  border-color: var(--el-color-primary, #409eff);
  color: var(--el-color-primary-light-3, #79bbff);
  box-shadow: 0 0 0 1px var(--el-color-primary-dark-2, #0a60bd), 
            0 0 8px 0 rgba(64, 158, 255, 0.6);
}

:root.dark .prefix-option:hover:not(.active) {
  background-color: #32353a;
  border-color: var(--el-color-primary-light-5, #a0cfff);
  color: var(--el-color-primary-light-5, #a0cfff);
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.generate-button, .copy-button {
  flex: 1;
  height: 40px;
}

.result-container {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.ipv6-address {
  padding: 12px 16px;
  background-color: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  font-family: monospace;
  font-size: 16px;
  color: var(--el-color-primary);
  word-break: break-all;
  text-align: center;
}

.ula-structure-panel .panel-body {
  padding: 0;
}

.structure-diagram {
  width: 100%;
  overflow-x: auto;
}

.structure-row {
  display: flex;
  width: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.structure-cell {
  flex: 1;
  text-align: center;
  padding: 0;
  border-right: 1px solid var(--el-border-color-light);
}

.structure-cell:last-child {
  border-right: none;
}

.cell-title {
  padding: 10px;
  background-color: var(--el-fill-color-light);
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.cell-value {
  padding: 16px 8px;
  background-color: var(--el-bg-color);
  font-family: monospace;
  word-break: break-all;
  min-height: 25px;
  font-size: 14px;
}

.help-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 10px;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 0 0 12px;
  line-height: 1.6;
}

.help-content ul {
  padding-left: 20px;
  margin: 12px 0;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.help-content strong {
  font-weight: 600;
}

.help-content code {
  background-color: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: var(--el-color-primary);
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ula-generator-container {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .header p {
    font-size: 14px;
  }
  
  .panel-header {
    padding: 12px 15px;
  }
  
  .panel-body {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .prefix-options {
    flex-direction: column;
  }
  
  .structure-diagram {
    overflow-x: auto;
  }
  
  .structure-row {
    min-width: 600px;
  }
}

@media (max-width: 480px) {
  .result-container {
    padding: 12px;
  }
  
  .ipv6-address {
    font-size: 14px;
    padding: 10px;
  }
  
  .structure-cell .cell-title {
    font-size: 13px;
    padding: 8px 4px;
  }
  
  .structure-cell .cell-value {
    font-size: 13px;
    padding: 10px 4px;
  }
  
  .help-content h3 {
    font-size: 15px;
  }
  
  .help-content p, .help-content li {
    font-size: 13px;
  }
  
  .help-content code {
    font-size: 12px;
  }
}
</style> 