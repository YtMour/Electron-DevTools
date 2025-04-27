<template>
  <div class="network-tool-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv6 ULA 生成器</h2>
        <p class="header-desc">生成用于本地网络的IPv6唯一本地地址(ULA)</p>
      </div>
    </div>
    
    <div class="page-content main-sidebar">
      <div class="generator-section">
        <el-card class="network-card generator-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="card-title">生成IPv6 ULA</div>
          </div>
          
          <div class="form-group">
            <label>前缀选项</label>
            <div class="option-selector">
              <div 
                class="option-item" 
                :class="{ active: prefix === 'fd' }"
                @click="prefix = 'fd'"
              >
                fd00::/8 (推荐)
              </div>
              <div 
                class="option-item" 
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
            <div class="validation-error" v-if="errors.subnetId">
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
            <div class="validation-error" v-if="errors.interfaceId">
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
        </el-card>
        
        <el-card v-if="ulaAddress" class="network-card result-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="card-title">ULA地址结果</div>
          </div>
          
          <div class="result-content">
            <div class="ipv6-address">{{ ulaAddress }}</div>
          </div>
          
          <div class="ula-structure">
            <table class="result-table">
              <tr>
                <th>前缀</th>
                <td>{{ prefix === 'fd' ? 'fd' : 'fc' }}</td>
              </tr>
              <tr>
                <th>全局ID</th>
                <td>{{ globalId || '随机生成' }}</td>
              </tr>
              <tr>
                <th>子网ID</th>
                <td>{{ form.subnetId || '0000' }}</td>
              </tr>
              <tr>
                <th>接口ID</th>
                <td>{{ form.interfaceId || '自动生成' }}</td>
              </tr>
            </table>
          </div>
        </el-card>
      </div>
      
      <el-card class="network-card help-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">ULA 地址说明</div>
        </div>
        
        <div class="help-content">
          <h4>什么是ULA?</h4>
          <p>
            IPv6唯一本地地址(Unique Local Address, ULA)是用于本地通信的IPv6地址，
            类似于IPv4中的私有地址(如192.168.x.x)。ULA地址在RFC 4193中定义，
            它们不可在全球互联网上路由，仅用于本地网络。
          </p>
          
          <h4>ULA地址特点</h4>
          <ul>
            <li>前缀为<code>fc00::/7</code>，通常使用<code>fd00::/8</code></li>
            <li>全局ID部分(40位)能够在站点间提供唯一性</li>
            <li>子网ID(16位)允许在组织内创建多达65536个子网</li>
            <li>接口ID(64位)用于标识网络接口</li>
            <li>在没有互联网连接的情况下也可使用</li>
            <li>可以在多个站点之间合并网络而不会产生地址冲突</li>
            <li>不易被意外路由到互联网</li>
          </ul>
          
          <h4>ULA地址格式</h4>
          <p>
            ULA地址的格式为: <code>prefix:global-id:subnet-id:interface-id</code>
          </p>
          <ul>
            <li><strong>前缀</strong>: fd或fc (fd更常用，表示本地分配)</li>
            <li><strong>全局ID</strong>: 随机生成的40位值，算法在RFC 4193中定义</li>
            <li><strong>子网ID</strong>: 16位值，用于创建子网</li>
            <li><strong>接口ID</strong>: 64位值，通常使用EUI-64或随机生成</li>
          </ul>
          
          <h4>使用场景</h4>
          <ul>
            <li>家庭网络和小型办公室网络</li>
            <li>没有全球IPv6连接的企业网络</li>
            <li>测试环境和实验室</li>
            <li>需要IPv6但不需要全球路由的封闭网络</li>
            <li>位置之间通过VPN或其他隧道互连的网络</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, Operation, InfoFilled, CopyDocument, SetUp, DataAnalysis } from '@element-plus/icons-vue';
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

<style lang="scss" scoped>
.ipv6-address {
  padding: 12px 16px;
  font-family: monospace;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-color-primary);
  word-break: break-all;
  text-align: center;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.result-table th, .result-table td {
  padding: 12px 15px;
  text-align: left;
  border: 1px solid var(--el-border-color-light);
}

.result-table th {
  width: 30%;
  background-color: var(--el-fill-color-light);
  font-weight: 600;
}

.result-table td {
  font-family: monospace;
  word-break: break-all;
}

.generator-card, .result-card {
  margin-bottom: 24px;
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
</style> 