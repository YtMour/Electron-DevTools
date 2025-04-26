<template>
  <div class="mac-generator-page format-page">
    <div class="page-header">
      <div class="header-title">
        <h2>MAC 地址生成器</h2>
        <p class="header-desc">生成随机MAC地址或批量MAC地址</p>
      </div>
    </div>

    <div class="page-content">
      <el-card class="generator-card">
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>生成选项</span>
        </div>

        <el-form :model="form" label-position="top">
          <el-form-item label="格式">
            <el-radio-group v-model="form.format">
              <el-radio-button label=":">XX:XX:XX:XX:XX:XX</el-radio-button>
              <el-radio-button label="-">XX-XX-XX-XX-XX-XX</el-radio-button>
              <el-radio-button label="">XXXXXXXXXXXX</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="大小写">
            <el-radio-group v-model="form.case">
              <el-radio-button label="upper">大写</el-radio-button>
              <el-radio-button label="lower">小写</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="地址类型">
            <el-radio-group v-model="form.addressType">
              <el-radio-button label="global">全球唯一地址</el-radio-button>
              <el-radio-button label="local">本地管理地址</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="传输类型">
            <el-radio-group v-model="form.transmissionType">
              <el-radio-button label="unicast">单播地址</el-radio-button>
              <el-radio-button label="multicast">组播地址</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="生成数量">
            <el-slider 
              v-model="form.count" 
              :min="1" 
              :max="100" 
              :step="1" 
              :show-input="true"
              :marks="{1: '1', 25: '25', 50: '50', 75: '75', 100: '100'}"
            />
          </el-form-item>

          <el-form-item label="厂商前缀 (可选)">
            <el-select 
              v-model="form.vendor" 
              filterable 
              clearable 
              placeholder="选择厂商前缀或保持随机"
              style="width: 100%"
            >
              <el-option 
                v-for="vendor in vendorList"
                :key="vendor.oui"
                :label="`${vendor.company} (${vendor.oui})`"
                :value="vendor.oui"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateMacs" 
              style="width: 100%"
            >
              <el-icon><VideoPlay /></el-icon>
              生成 MAC 地址
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="result-card">
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>生成结果</span>
          <div class="result-actions">
            <el-button type="primary" plain size="small" @click="copyAll">
              <el-icon><CopyDocument /></el-icon>
              复制所有
            </el-button>
          </div>
        </div>

        <div class="result-content">
          <el-table
            :data="generatedMacs"
            border
            style="width: 100%"
            v-loading="loading"
            height="350"
          >
            <el-table-column type="index" width="60" label="#" />
            <el-table-column prop="mac" label="MAC 地址" min-width="180" />
            <el-table-column prop="type" label="类型" min-width="120" />
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="copyMac(scope.row.mac)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card class="info-card">
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>MAC 地址信息</span>
        </div>

        <div class="info-content">
          <h4>MAC 地址类型</h4>
          
          <p><strong>全球唯一地址 vs 本地管理地址：</strong></p>
          <ul>
            <li><strong>全球唯一地址 (UAA)：</strong> 由IEEE分配给设备制造商的唯一地址，第一个字节的第二低位为0</li>
            <li><strong>本地管理地址 (LAA)：</strong> 由本地网络管理员分配的地址，第一个字节的第二低位为1</li>
          </ul>
          
          <p><strong>单播地址 vs 组播地址：</strong></p>
          <ul>
            <li><strong>单播地址：</strong> 标识网络上的单个接口，第一个字节的最低位为0</li>
            <li><strong>组播地址：</strong> 发送到多个接收者的地址，第一个字节的最低位为1</li>
            <li><strong>广播地址：</strong> 特殊地址FF:FF:FF:FF:FF:FF，发送到网络中的所有设备</li>
          </ul>
          
          <h4>常见厂商前缀</h4>
          <p>MAC地址的前24位(前3个字节)称为OUI，由IEEE分配给不同的设备制造商。生成器可以选择特定厂商前缀或随机生成。</p>
          
          <h4>MAC地址格式</h4>
          <p>MAC地址可以有不同的表示格式：</p>
          <ul>
            <li><strong>带冒号：</strong> XX:XX:XX:XX:XX:XX (如 00:1A:2B:3C:4D:5E)</li>
            <li><strong>带连字符：</strong> XX-XX-XX-XX-XX-XX (如 00-1A-2B-3C-4D-5E)</li>
            <li><strong>无分隔符：</strong> XXXXXXXXXXXX (如 001A2B3C4D5E)</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, VideoPlay, List, InfoFilled, CopyDocument } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import { generateRandomMacAddress, formatMacAddress, isMacAddressGloballyUnique, isMacAddressUnicast } from '@/utils/network/mac';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  format: ':',
  case: 'upper',
  addressType: 'global',
  transmissionType: 'unicast',
  count: 10,
  vendor: ''
});

// 常见厂商列表
const vendorList = [
  { oui: '00:50:56', company: 'VMware, Inc.' },
  { oui: '00:0C:29', company: 'VMware, Inc.' },
  { oui: '00:1A:11', company: 'Google, Inc.' },
  { oui: '00:03:93', company: 'Apple, Inc.' },
  { oui: '00:0D:93', company: 'Apple, Inc.' },
  { oui: '00:1E:C2', company: 'Apple, Inc.' },
  { oui: '00:21:E9', company: 'Apple, Inc.' },
  { oui: '00:25:00', company: 'Apple, Inc.' },
  { oui: '00:26:BB', company: 'Apple, Inc.' },
  { oui: '00:21:27', company: 'Cisco Systems, Inc' },
  { oui: '00:23:5E', company: 'Cisco Systems, Inc' },
  { oui: '00:25:83', company: 'Cisco Systems, Inc' },
  { oui: '00:12:5A', company: 'Microsoft Corporation' },
  { oui: '00:15:5D', company: 'Microsoft Corporation' },
  { oui: '00:50:F2', company: 'Microsoft Corporation' },
  { oui: '00:17:9A', company: 'D-Link Corporation' },
  { oui: '00:21:91', company: 'D-Link Corporation' },
  { oui: '00:22:B0', company: 'D-Link Corporation' },
  { oui: '00:1A:4B', company: 'Hewlett Packard' },
  { oui: '00:17:A4', company: 'Hewlett Packard' },
  { oui: '00:0B:CD', company: 'Samsung Electronics' },
  { oui: '00:25:38', company: 'Samsung Electronics' },
  { oui: '00:00:01', company: 'Xerox Corporation' },
  { oui: '00:0A:27', company: 'Apple, Inc.' },
  { oui: '00:1B:63', company: 'Apple, Inc.' },
  { oui: '00:0D:4B', company: 'Roku, Inc.' },
  { oui: '00:24:FE', company: 'AVM GmbH' },
  { oui: '24:4B:FE', company: 'HUAWEI Technologies' },
];

// 生成的MAC地址列表
const generatedMacs = ref<{ mac: string; type: string }[]>([]);

// 加载状态
const loading = ref(false);

// 生成MAC地址
const generateMacs = () => {
  loading.value = true;
  generatedMacs.value = [];
  
  // 使用setTimeout以便UI可以更新加载状态
  setTimeout(() => {
    try {
      const macs = [];
      const isGlobal = form.addressType === 'global';
      const isUnicast = form.transmissionType === 'unicast';
      
      for (let i = 0; i < form.count; i++) {
        // 生成MAC地址
        let macAddress = generateRandomMacAddress(isGlobal, !isUnicast);
        
        // 如果指定了厂商前缀，则替换OUI部分
        if (form.vendor) {
          const vendorOui = form.vendor.replace(/[^a-fA-F0-9]/g, '').substring(0, 6);
          const macParts = macAddress.split(':');
          
          // 保留原始MAC地址的后三个字节
          macParts[0] = vendorOui.substring(0, 2);
          macParts[1] = vendorOui.substring(2, 4);
          macParts[2] = vendorOui.substring(4, 6);
          
          // 重新组合MAC地址
          macAddress = macParts.join(':');
          
          // 如果需要设置地址类型和传输类型的位
          const firstByte = parseInt(macParts[0], 16);
          let newFirstByte = firstByte;
          
          if (isGlobal) {
            // 全球唯一地址：第二低位为0
            newFirstByte &= ~0x02;
          } else {
            // 本地管理地址：第二低位为1
            newFirstByte |= 0x02;
          }
          
          if (isUnicast) {
            // 单播地址：最低位为0
            newFirstByte &= ~0x01;
          } else {
            // 组播地址：最低位为1
            newFirstByte |= 0x01;
          }
          
          macParts[0] = newFirstByte.toString(16).padStart(2, '0');
          macAddress = macParts.join(':');
        }
        
        // 格式化MAC地址
        macAddress = formatMacAddress(macAddress);
        
        // 应用格式设置
        if (form.format !== ':') {
          macAddress = macAddress.replace(/:/g, form.format);
        }
        
        // 应用大小写设置
        macAddress = form.case === 'upper' 
          ? macAddress.toUpperCase() 
          : macAddress.toLowerCase();
        
        // 构造类型描述
        const addressTypeDesc = isMacAddressGloballyUnique(macAddress) 
          ? '全球唯一地址' 
          : '本地管理地址';
        
        const transmissionTypeDesc = isMacAddressUnicast(macAddress) 
          ? '单播地址' 
          : '组播地址';
        
        macs.push({
          mac: macAddress,
          type: `${addressTypeDesc} / ${transmissionTypeDesc}`
        });
      }
      
      generatedMacs.value = macs;
      ElMessage.success(`成功生成 ${macs.length} 个MAC地址`);
    } catch (error) {
      ElMessage.error(`生成失败: ${(error as Error).message}`);
    } finally {
      loading.value = false;
    }
  }, 200);
};

// 复制单个MAC地址
const copyMac = async (mac: string) => {
  try {
    await copy(mac);
    ElMessage.success('MAC地址已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 复制所有MAC地址
const copyAll = async () => {
  if (generatedMacs.value.length === 0) {
    ElMessage.warning('没有MAC地址可复制');
    return;
  }
  
  try {
    const text = generatedMacs.value.map(item => item.mac).join('\n');
    await copy(text);
    ElMessage.success('所有MAC地址已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 初始生成一些MAC地址
generateMacs();
</script>

<style lang="scss" scoped>
.mac-generator-page {
  .page-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    .info-card {
      grid-column: 1 / -1;
    }
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
    
    .result-actions {
      margin-left: auto;
    }
  }
  
  .info-content {
    h4 {
      margin: 16px 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    p {
      margin: 8px 0;
      line-height: 1.5;
      color: var(--el-text-color-regular);
    }
    
    ul {
      padding-left: 20px;
      margin: 8px 0;
      color: var(--el-text-color-regular);
      
      li {
        margin-bottom: 6px;
        line-height: 1.5;
      }
    }
  }
}

@media (max-width: 768px) {
  .mac-generator-page {
    .page-content {
      grid-template-columns: 1fr;
    }
  }
}
</style> 