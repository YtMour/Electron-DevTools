<template>
  <div class="ipv4-subnet-page format-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv4 子网计算器</h2>
        <p class="header-desc">计算IPv4子网的网络地址、广播地址、可用主机数等信息</p>
      </div>
    </div>

    <div class="page-content">
      <div class="subnet-calculator">
        <el-card class="input-card">
          <div class="input-header">
            <el-icon><EditPen /></el-icon>
            <span>输入IP地址和子网掩码</span>
          </div>

          <el-form :model="form" label-position="top" size="default">
            <el-form-item label="IP地址">
              <el-input
                v-model="form.ipAddress"
                placeholder="例如：192.168.1.1"
                @input="validateInput"
              />
              <div v-if="validationError.ipAddress" class="validation-error">
                {{ validationError.ipAddress }}
              </div>
            </el-form-item>

            <el-form-item label="子网掩码">
              <div class="subnet-mask-input">
                <div class="subnet-select">
                  <el-select 
                    v-model="form.cidr" 
                    placeholder="CIDR" 
                    @change="handleCidrChange"
                  >
                    <el-option 
                      v-for="i in 33" 
                      :key="i-1" 
                      :label="`/${i-1}`" 
                      :value="i-1" 
                    />
                  </el-select>
                </div>
                <div class="mask-input">
                  <el-input
                    v-model="form.subnetMask"
                    placeholder="例如：255.255.255.0"
                    @input="handleMaskInput"
                  />
                </div>
              </div>
              <div v-if="validationError.subnetMask" class="validation-error">
                {{ validationError.subnetMask }}
              </div>
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="calculateSubnet" 
                :disabled="!isFormValid"
                style="width: 100%"
              >
                <el-icon><Operation /></el-icon>
                计算子网
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="result-card" v-if="result">
          <div class="result-header">
            <el-icon><Histogram /></el-icon>
            <span>子网计算结果</span>
            <div class="result-actions">
              <el-button type="primary" plain size="small" @click="handleCopy">
                <el-icon><CopyDocument /></el-icon>
                复制结果
              </el-button>
            </div>
          </div>

          <div class="result-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="IP地址">
                {{ form.ipAddress }}
              </el-descriptions-item>
              <el-descriptions-item label="子网掩码">
                {{ form.subnetMask }} ({{ form.cidr ? '/' + form.cidr : '' }})
              </el-descriptions-item>
              <el-descriptions-item label="网络地址">
                {{ result.networkAddress }}
              </el-descriptions-item>
              <el-descriptions-item label="广播地址">
                {{ result.broadcastAddress }}
              </el-descriptions-item>
              <el-descriptions-item label="可用主机范围">
                {{ result.firstHost }} - {{ result.lastHost }}
              </el-descriptions-item>
              <el-descriptions-item label="可用主机数">
                {{ result.usableHosts.toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item label="总主机数">
                {{ result.totalHosts.toLocaleString() }}
              </el-descriptions-item>
              <el-descriptions-item label="网络类型">
                {{ getNetworkClass() }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <el-card class="help-card">
        <div class="help-header">
          <el-icon><InfoFilled /></el-icon>
          <span>使用帮助</span>
        </div>
        <div class="help-content">
          <h4>什么是子网？</h4>
          <p>子网是将IP网络划分为较小网络的方法，通过子网掩码来定义。</p>
          
          <h4>CIDR表示法</h4>
          <p>CIDR（无类域间路由）使用"/"后跟一个数字来表示网络前缀的位数，例如192.168.1.0/24。</p>
          
          <h4>常用子网掩码</h4>
          <el-table :data="commonSubnets" stripe>
            <el-table-column prop="cidr" label="CIDR" width="70" />
            <el-table-column prop="mask" label="子网掩码" />
            <el-table-column prop="hosts" label="主机数" />
          </el-table>
          
          <h4>IP地址类别</h4>
          <ul>
            <li><strong>A类</strong>: 1.0.0.0 - 126.255.255.255 (/8)</li>
            <li><strong>B类</strong>: 128.0.0.0 - 191.255.255.255 (/16)</li>
            <li><strong>C类</strong>: 192.0.0.0 - 223.255.255.255 (/24)</li>
            <li><strong>D类</strong>: 224.0.0.0 - 239.255.255.255 (组播)</li>
            <li><strong>E类</strong>: 240.0.0.0 - 255.255.255.255 (实验)</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { EditPen, Operation, Histogram, InfoFilled, CopyDocument } from '@element-plus/icons-vue';
import { IPv4Address } from '@/utils/network/ipv4';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  ipAddress: '',
  subnetMask: '',
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
    
    ElMessage.success('子网计算成功');
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

<style lang="scss" scoped>
.ipv4-subnet-page {
  .page-content {
    display: flex;
    gap: 20px;
    
    .subnet-calculator {
      flex: 3;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .help-card {
      flex: 1;
      align-self: flex-start;
      
      .help-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--el-text-color-primary);
        font-size: 16px;
        
        .el-icon {
          color: var(--el-color-info);
        }
      }
      
      .help-content {
        font-size: 14px;
        color: var(--el-text-color-regular);
        
        h4 {
          margin: 16px 0 8px 0;
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
        
        p {
          margin: 8px 0;
          line-height: 1.5;
        }
        
        ul {
          padding-left: 20px;
          margin: 8px 0;
        }
        
        li {
          margin-bottom: 4px;
        }
      }
    }
  }
  
  .input-card, .result-card {
    width: 100%;
    
    .input-header, .result-header {
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
      
      .result-actions {
        margin-left: auto;
      }
    }
  }
  
  .subnet-mask-input {
    display: flex;
    gap: 12px;
    
    .subnet-select {
      width: 120px;
    }
    
    .mask-input {
      flex: 1;
    }
  }
  
  .validation-error {
    color: var(--el-color-danger);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .result-content {
    :deep(.el-descriptions__label) {
      width: 120px;
      text-align: right;
      font-weight: 600;
    }
  }
}

@media (max-width: 768px) {
  .ipv4-subnet-page {
    .page-content {
      flex-direction: column;
    }
  }
}
</style> 