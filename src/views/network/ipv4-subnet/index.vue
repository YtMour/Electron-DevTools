<template>
  <div class="subnet-calculator-container">
    <div class="header">
      <h1>IPv4 子网计算器</h1>
      <p>计算IPv4子网的网络地址、广播地址、可用主机数等信息</p>
    </div>
    
    <div class="main-content">
      <div class="input-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><Edit /></el-icon>
            </span>
            <span class="title">输入IP地址和子网掩码</span>
          </div>
          
          <div class="panel-body">
            <div class="form-group">
              <label>IP地址</label>
              <el-input v-model="form.ipAddress" placeholder="例如：192.168.1.1" @input="validateInput" />
              <div v-if="validationError.ipAddress" class="error-message">{{ validationError.ipAddress }}</div>
            </div>
            
            <div class="form-group">
              <label>子网掩码</label>
              <div class="input-group">
                <el-input v-model="form.subnetMask" placeholder="例如：255.255.255.0" @input="handleMaskInput" />
                <el-select v-model="form.cidr" placeholder="CIDR" @change="handleCidrChange" style="width: 100px;">
                  <el-option v-for="i in 33" :key="i-1" :label="`/${i-1}`" :value="i-1" />
                </el-select>
              </div>
              <div v-if="validationError.subnetMask" class="error-message">{{ validationError.subnetMask }}</div>
            </div>
            
            <el-button type="primary" @click="calculateSubnet" :disabled="!isFormValid" class="submit-button">
              计算子网
            </el-button>
          </div>
        </div>
        
        <div v-if="result" class="panel result-panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><DataAnalysis /></el-icon>
            </span>
            <span class="title">子网计算结果</span>
            <el-button type="primary" plain size="small" class="copy-button" @click="handleCopy">
              复制结果
            </el-button>
          </div>
          
          <div class="panel-body">
            <div class="result-table-container">
              <table class="result-table">
                <tr>
                  <th>IP地址</th>
                  <td>{{ form.ipAddress }}</td>
                </tr>
                <tr>
                  <th>子网掩码</th>
                  <td>{{ form.subnetMask }} ({{ form.cidr ? '/' + form.cidr : '' }})</td>
                </tr>
                <tr>
                  <th>网络地址</th>
                  <td>{{ result.networkAddress }}</td>
                </tr>
                <tr>
                  <th>广播地址</th>
                  <td>{{ result.broadcastAddress }}</td>
                </tr>
                <tr>
                  <th>可用主机范围</th>
                  <td>{{ result.firstHost }} - {{ result.lastHost }}</td>
                </tr>
                <tr>
                  <th>可用主机数</th>
                  <td>{{ result.usableHosts.toLocaleString() }}</td>
                </tr>
                <tr>
                  <th>总主机数</th>
                  <td>{{ result.totalHosts.toLocaleString() }}</td>
                </tr>
                <tr>
                  <th>网络类型</th>
                  <td>{{ getNetworkClass() }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div class="help-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><InfoFilled /></el-icon>
            </span>
            <span class="title">使用帮助</span>
          </div>
          
          <div class="panel-body">
            <div class="help-content">
              <h3>什么是子网？</h3>
              <p>子网是将IP网络划分为较小网络的方法，通过子网掩码来定义。</p>
              
              <h3>CIDR表示法</h3>
              <p>CIDR（无类域间路由）使用"/"后跟一个数字来表示网络前缀的位数，例如192.168.1.0/24。</p>
              
              <h3>常用子网掩码</h3>
              <table class="subnet-table">
                <thead>
                  <tr>
                    <th>CIDR</th>
                    <th>子网掩码</th>
                    <th>主机数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in commonSubnets" :key="item.cidr">
                    <td>{{ item.cidr }}</td>
                    <td>{{ item.mask }}</td>
                    <td>{{ item.hosts }}</td>
                  </tr>
                </tbody>
              </table>
              
              <h3>IP地址类别</h3>
              <ul>
                <li><strong>A类</strong>: 1.0.0.0 - 126.255.255.255 (/8)</li>
                <li><strong>B类</strong>: 128.0.0.0 - 191.255.255.255 (/16)</li>
                <li><strong>C类</strong>: 192.0.0.0 - 223.255.255.255 (/24)</li>
                <li><strong>D类</strong>: 224.0.0.0 - 239.255.255.255 (组播)</li>
                <li><strong>E类</strong>: 240.0.0.0 - 255.255.255.255 (实验)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Edit, DataAnalysis, InfoFilled } from '@element-plus/icons-vue';
import { IPv4Address } from '@/utils/network/ipv4';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  ipAddress: '192.168.1.1',  // 默认值
  subnetMask: '255.255.255.0',  // 默认值
  cidr: 24, // 默认 /24 (255.255.255.0)
});

// 验证错误信息
const validationError = reactive({
  ipAddress: '',
  subnetMask: '',
});

// 计算结果
const result = ref<{
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  totalHosts: number;
  usableHosts: number;
  cidr: number;
} | null>(null);

// 根据CIDR值更新子网掩码
const handleCidrChange = () => {
  try {
    if (form.cidr >= 0 && form.cidr <= 32) {
      const mask = IPv4Address.cidrToMask(form.cidr);
      form.subnetMask = new IPv4Address(mask).toString();
      validationError.subnetMask = '';
    }
  } catch (error) {
    validationError.subnetMask = (error as Error).message;
  }
};

// 根据输入的子网掩码更新CIDR值
const handleMaskInput = () => {
  try {
    if (form.subnetMask) {
      const mask = IPv4Address.parseAddress(form.subnetMask);
      form.cidr = IPv4Address.maskToCidr(mask);
      validationError.subnetMask = '';
    }
  } catch (error) {
    validationError.subnetMask = '无效的子网掩码格式';
  }
};

// 验证输入
const validateInput = () => {
  try {
    if (form.ipAddress) {
      IPv4Address.parseAddress(form.ipAddress);
      validationError.ipAddress = '';
    } else {
      validationError.ipAddress = '';
    }
  } catch (error) {
    validationError.ipAddress = '无效的IP地址格式';
  }
};

// 计算子网
const calculateSubnet = () => {
  try {
    if (!form.ipAddress || !form.subnetMask) {
      ElMessage.warning('请输入IP地址和子网掩码');
      return;
    }
    
    const ip = new IPv4Address(form.ipAddress);
    result.value = ip.calculateSubnet(form.cidr);

    // 确保结果数值格式化
    if (result.value) {
      result.value.usableHosts = parseInt(result.value.usableHosts.toString(), 10);
      result.value.totalHosts = parseInt(result.value.totalHosts.toString(), 10);
      
      // 防止数值太大导致布局问题
      if (result.value.usableHosts > 1000000) {
        result.value.usableHosts = Math.floor(result.value.usableHosts);
      }
      if (result.value.totalHosts > 1000000) {
        result.value.totalHosts = Math.floor(result.value.totalHosts);
      }
    }
    
    ElMessage.success('子网计算成功');
    
    // 确保内容显示时滚动到结果区域
    setTimeout(() => {
      const resultPanel = document.querySelector('.result-panel');
      if (resultPanel) {
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  } catch (error) {
    ElMessage.error(`计算失败: ${(error as Error).message}`);
    result.value = null;
  }
};

// 复制结果
const handleCopy = async () => {
  if (!result.value) return;
  
  const text = `
IP地址: ${form.ipAddress}
子网掩码: ${form.subnetMask} (/${form.cidr})
网络地址: ${result.value.networkAddress}
广播地址: ${result.value.broadcastAddress}
可用主机范围: ${result.value.firstHost} - ${result.value.lastHost}
可用主机数: ${result.value.usableHosts}
总主机数: ${result.value.totalHosts}
网络类型: ${getNetworkClass()}
`.trim();
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 获取网络类别
const getNetworkClass = () => {
  if (!form.ipAddress) return '';
  
  try {
    const ip = IPv4Address.parseAddress(form.ipAddress);
    const firstOctet = (ip >>> 24) & 0xff;
    
    if (firstOctet >= 1 && firstOctet <= 126) return 'A类网络';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B类网络';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C类网络';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D类网络 (组播)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E类网络 (保留)';
    return '特殊网络';
  } catch {
    return '';
  }
};

// 表单是否有效
const isFormValid = computed(() => {
  return form.ipAddress && form.subnetMask && !validationError.ipAddress && !validationError.subnetMask;
});

// 常用子网掩码
const commonSubnets = [
  { cidr: '/24', mask: '255.255.255.0', hosts: '254' },
  { cidr: '/25', mask: '255.255.255.128', hosts: '126' },
  { cidr: '/26', mask: '255.255.255.192', hosts: '62' },
  { cidr: '/27', mask: '255.255.255.224', hosts: '30' },
  { cidr: '/28', mask: '255.255.255.240', hosts: '14' },
  { cidr: '/29', mask: '255.255.255.248', hosts: '6' },
  { cidr: '/30', mask: '255.255.255.252', hosts: '2' },
  { cidr: '/16', mask: '255.255.0.0', hosts: '65,534' },
];

// 初始化
handleCidrChange();
</script>

<style scoped>
.subnet-calculator-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header {
  margin-bottom: 24px;
  text-align: left;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  background: linear-gradient(90deg, #409eff, #79bbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #ebeef5;
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
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.panel-header .icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  background-color: #ecf5ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.panel-header .title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.panel-header .copy-button {
  position: absolute;
  right: 20px;
  padding: 6px 12px;
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
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-group {
  display: flex;
  gap: 10px;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.submit-button {
  width: 100%;
  height: 40px;
  font-size: 14px;
  margin-top: 10px;
}

.result-table-container {
  overflow-x: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1px solid #ebeef5;
}

.result-table th, .result-table td {
  padding: 12px 15px;
  text-align: left;
  border: 1px solid #ebeef5;
}

.result-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  width: 30%;
  color: #606266;
}

.result-table td {
  background-color: #fff;
  font-family: monospace;
  word-break: break-all;
}

.result-table tr:hover td {
  background-color: #f5f7fa;
}

.help-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 10px;
  color: #303133;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #606266;
}

.subnet-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  border: 1px solid #ebeef5;
}

.subnet-table th, .subnet-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ebeef5;
}

.subnet-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #606266;
}

.subnet-table td {
  background-color: #fff;
}

.subnet-table tr:hover td {
  background-color: #f5f7fa;
}

.help-content ul {
  padding-left: 20px;
  margin: 12px 0;
}

.help-content li {
  margin-bottom: 8px;
  color: #606266;
  line-height: 1.6;
}

.help-content strong {
  color: #303133;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .subnet-calculator-container {
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
  
  .input-group {
    flex-direction: column;
  }
  
  .panel-header .copy-button {
    position: relative;
    right: auto;
    margin-top: 10px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .result-table th, .result-table td,
  .subnet-table th, .subnet-table td {
    padding: 8px;
    font-size: 13px;
  }
  
  .result-table th {
    width: 40%;
  }
  
  .help-content h3 {
    font-size: 15px;
  }
  
  .help-content p, .help-content li {
    font-size: 13px;
  }
}
</style> 