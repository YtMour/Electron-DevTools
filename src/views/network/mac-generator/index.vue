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
          <div class="card-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="card-title">生成选项</div>
        </div>
        
        <div class="generator-section">
          <div class="format-options">
            <div class="option-label">格式</div>
            <div class="format-buttons">
              <div 
                class="format-button" 
                :class="{ active: formatType === 'noSeparator' }"
                @click="formatType = 'noSeparator'"
              >
                XXXXXXXXXXXX
              </div>
              <div 
                class="format-button" 
                :class="{ active: formatType === 'colon' }"
                @click="formatType = 'colon'"
              >
                XX:XX:XX:XX:XX:XX
              </div>
              <div 
                class="format-button" 
                :class="{ active: formatType === 'hyphen' }"
                @click="formatType = 'hyphen'"
              >
                XX-XX-XX-XX-XX-XX
              </div>
              <div 
                class="format-button" 
                :class="{ active: formatType === 'dot' }"
                @click="formatType = 'dot'"
              >
                XXXX.XXXX.XXXX
              </div>
            </div>
            
            <div class="option-label">大小写</div>
            <div class="case-buttons">
              <el-button 
                :type="letterCase === 'upper' ? 'primary' : 'default'" 
                @click="letterCase = 'upper'"
                :plain="letterCase !== 'upper'"
              >
                大写
              </el-button>
              <el-button 
                :type="letterCase === 'lower' ? 'primary' : 'default'" 
                @click="letterCase = 'lower'"
                :plain="letterCase !== 'lower'"
              >
                小写
              </el-button>
            </div>
          </div>
          
          <div class="mac-type">
            <div class="type-label">地址类型</div>
            <div class="type-options">
              <el-radio v-model="macType" label="global">全球唯一地址 (UAA)</el-radio>
              <el-radio v-model="macType" label="local">本地管理地址 (LAA)</el-radio>
              <el-radio v-model="macType" label="multicast">组播地址</el-radio>
              <el-radio v-model="macType" label="random">完全随机</el-radio>
            </div>
          </div>
          
          <div class="mac-count">
            <div class="option-label">生成数量</div>
            <el-slider v-model="macCount" :min="1" :max="10" show-stops :marks="{1: '1', 5: '5', 10: '10'}" />
          </div>
          
          <div class="actions">
            <el-button type="primary" @click="generateMac">
              <el-icon><RefreshRight /></el-icon> 生成地址
            </el-button>
            <el-button type="danger" @click="clearResults" :disabled="!macAddresses.length">
              <el-icon><Delete /></el-icon> 清空结果
            </el-button>
          </div>
        </div>
      </el-card>

      <el-card class="result-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><List /></el-icon>
          </div>
          <div class="card-title">生成结果</div>
          <div class="card-actions">
            <el-button 
              type="primary" 
              plain 
              size="small" 
              @click="copyAllAddresses" 
              :disabled="!macAddresses.length"
              class="copy-all-button"
            >
              <el-icon><CopyDocument /></el-icon>
              复制所有
            </el-button>
          </div>
        </div>
        
        <div class="result-section">
          <div class="result-table">
            <el-table 
              :data="macAddresses" 
              style="width: 100%" 
              :empty-text="macAddresses.length === 0 ? '点击生成按钮创建MAC地址' : '加载中...'"
            >
              <el-table-column prop="index" label="#" width="60" />
              <el-table-column prop="address" label="MAC 地址">
                <template #default="scope">
                  <span class="mac-value">{{ scope.row.address }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120">
                <template #default="scope">
                  <el-tag v-if="scope.row.type === 'global'" type="success" size="small">全球唯一</el-tag>
                  <el-tag v-else-if="scope.row.type === 'local'" type="warning" size="small">本地管理</el-tag>
                  <el-tag v-else-if="scope.row.type === 'multicast'" type="danger" size="small">组播地址</el-tag>
                  <el-tag v-else type="info" size="small">随机</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="70">
                <template #default="scope">
                  <el-button 
                    type="primary" 
                    link 
                    size="small" 
                    @click="copyAddress(scope.row.address)"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>
    </div>

    <div class="info-section">
      <el-card class="info-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">MAC 地址信息</div>
        </div>
        
        <div class="info-content">
          <h4>MAC 地址类型</h4>
          <p>全球唯一地址 vs 本地管理地址：</p>
          <ul>
            <li><strong>全球唯一地址 (UAA)：</strong> 由IEEE分配给设备制造商的唯一地址，第一个字节的第二低位为0</li>
            <li><strong>本地管理地址 (LAA)：</strong> 由本地网络管理员分配的地址，第一个字节的第二低位为1</li>
          </ul>
          
          <h4>单播地址 vs 组播地址：</h4>
          <ul>
            <li><strong>单播地址：</strong> 标识网络上的单个接口，第一个字节的最低位为0</li>
            <li><strong>组播地址：</strong> 标识多个网络接口，第一个字节的最低位为1</li>
          </ul>
          
          <h4>特殊的MAC地址</h4>
          <ul>
            <li><strong>FF:FF:FF:FF:FF:FF</strong> - 广播地址，用于向网络中的所有设备发送数据</li>
            <li><strong>00:00:00:00:00:00</strong> - 零地址，通常表示未分配或未知的MAC地址</li>
            <li><strong>01:00:5E:xx:xx:xx</strong> - IPv4组播地址</li>
            <li><strong>33:33:xx:xx:xx:xx</strong> - IPv6组播地址</li>
          </ul>
          
          <h4>MAC地址格式</h4>
          <p>MAC地址是48位（6字节）标识符，通常表示为十六进制数字，不同格式包括：</p>
          <ul>
            <li><code>XX:XX:XX:XX:XX:XX</code> - 冒号分隔（常见于Unix/Linux系统）</li>
            <li><code>XX-XX-XX-XX-XX-XX</code> - 连字符分隔（常见于Windows系统）</li>
            <li><code>XXXX.XXXX.XXXX</code> - 点分隔（常见于Cisco设备）</li>
            <li><code>XXXXXXXXXXXX</code> - 无分隔符</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, List, InfoFilled, CopyDocument, RefreshRight, Delete } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import { generateRandomMacAddress } from '@/utils/network/mac';

const { copy } = useClipboard();

// 格式选项
const formatType = ref('colon');  // 'noSeparator', 'colon', 'hyphen', 'dot'
const letterCase = ref('upper'); // 'upper', 'lower'
const macType = ref('global');   // 'global', 'local', 'multicast', 'random'
const macCount = ref(3);         // 默认生成3个地址

// 已生成的MAC地址列表
const macAddresses = ref<{ index: number; address: string; type: string }[]>([]);

// 格式化MAC地址
const formatMacAddress = (mac: string): string => {
  // 先移除所有分隔符，转为纯十六进制
  const pureMac = mac.replace(/[^0-9a-fA-F]/g, '');
  
  // 根据大小写处理
  const formattedCase = letterCase.value === 'upper' 
    ? pureMac.toUpperCase() 
    : pureMac.toLowerCase();
  
  // 根据格式类型添加分隔符
  switch (formatType.value) {
    case 'colon':
      return formattedCase.match(/.{2}/g)?.join(':') || formattedCase;
    case 'hyphen':
      return formattedCase.match(/.{2}/g)?.join('-') || formattedCase;
    case 'dot':
      return formattedCase.match(/.{4}/g)?.join('.') || formattedCase;
    case 'noSeparator':
    default:
      return formattedCase;
  }
};

// 生成MAC地址
const generateMac = () => {
  const newAddresses = [];
  
  for (let i = 0; i < macCount.value; i++) {
    // 生成MAC地址
    let macAddress = generateRandomMacAddress();
    
    // 处理地址类型
    if (macType.value !== 'random') {
      // 提取第一个字节的十六进制值并转为二进制
      const firstByte = parseInt(macAddress.substring(0, 2), 16);
      let newFirstByte = firstByte;
      
      if (macType.value === 'global') {
        // 全球唯一: 第二低位为0，最低位为0（单播）
        newFirstByte = (firstByte & 0xFC) | 0x00;
      } else if (macType.value === 'local') {
        // 本地管理: 第二低位为1，最低位为0（单播）
        newFirstByte = (firstByte & 0xFC) | 0x02;
      } else if (macType.value === 'multicast') {
        // 组播: 最低位为1
        newFirstByte = (firstByte & 0xFE) | 0x01;
      }
      
      // 替换第一个字节
      macAddress = newFirstByte.toString(16).padStart(2, '0') + macAddress.substring(2);
    }
    
    // 格式化地址并添加到列表
    const formattedMac = formatMacAddress(macAddress);
    
    // 确定类型标签
    const firstByte = parseInt(macAddress.substring(0, 2), 16);
    let type = 'random';
    
    if ((firstByte & 0x02) === 0 && (firstByte & 0x01) === 0) {
      type = 'global';
    } else if ((firstByte & 0x02) === 2 && (firstByte & 0x01) === 0) {
      type = 'local';
    } else if ((firstByte & 0x01) === 1) {
      type = 'multicast';
    }
    
    newAddresses.push({
      index: i + 1,
      address: formattedMac,
      type
    });
  }
  
  macAddresses.value = newAddresses;
  ElMessage.success(`已生成 ${macCount.value} 个MAC地址`);
};

// 清空结果
const clearResults = () => {
  macAddresses.value = [];
  ElMessage.info('已清空所有MAC地址');
};

// 复制单个地址
const copyAddress = (mac: string) => {
  copy(mac);
  ElMessage.success('MAC地址已复制到剪贴板');
};

// 复制所有地址
const copyAllAddresses = () => {
  if (macAddresses.value.length === 0) return;
  
  const allMacs = macAddresses.value.map(item => item.address).join('\n');
  copy(allMacs);
  ElMessage.success(`已复制全部 ${macAddresses.value.length} 个MAC地址到剪贴板`);
};

// 初始化生成一些随机MAC地址
generateMac();
</script>

<style lang="scss" scoped>
.mac-generator-page {
  max-width: 100%;
  overflow-x: hidden;
  
  .page-header {
    margin-bottom: 24px;
    
    .header-title {
      h2 {
        font-size: 26px;
        font-weight: 600;
        margin-bottom: 6px;
        background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-5));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
      }
      
      .header-desc {
        font-size: 15px;
        color: var(--el-text-color-secondary);
        margin: 0;
      }
    }
  }
  
  .page-content {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 24px;
    margin-bottom: 24px;
  }
  
  .generator-card, .result-card, .info-card {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 12px;
    border: 1px solid transparent;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background-color: var(--el-bg-color);
    
    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px dashed var(--el-border-color-light);
    
    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--el-color-primary-light-9);
      margin-right: 12px;
      
      .el-icon {
        font-size: 18px;
        color: var(--el-color-primary);
      }
    }
    
    .card-title {
      font-size: 17px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      flex: 1;
    }
    
    .card-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .generator-section {
    .format-options {
      margin-bottom: 24px;
      
      .option-label {
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 10px;
      }
      
      .format-buttons {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        
        .format-button {
          flex: 1;
          text-align: center;
          padding: 10px;
          border: 1px solid var(--el-border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--el-fill-color-light);
          font-family: var(--el-font-family-monospace, monospace);
          
          &.active {
            border-color: var(--el-color-primary);
            background: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
            font-weight: 500;
            box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
          }
          
          &:hover:not(.active) {
            border-color: var(--el-color-primary-light-5);
            background: var(--el-fill-color);
          }
          
          :root.dark & {
            background-color: #2a2b2f;
            border-color: #444;
            color: #e0e0e0;
            
            &.active {
              background-color: rgba(64, 158, 255, 0.25);
              border-color: var(--el-color-primary, #409eff);
              color: var(--el-color-primary-light-3, #79bbff);
              box-shadow: 0 0 0 1px var(--el-color-primary-dark-2, #0a60bd), 
                        0 0 8px 0 rgba(64, 158, 255, 0.6);
            }
            
            &:hover:not(.active) {
              background-color: #32353a;
              border-color: var(--el-color-primary-light-5, #a0cfff);
              color: var(--el-color-primary-light-5, #a0cfff);
            }
          }
        }
      }
      
      .case-buttons {
        display: flex;
        gap: 8px;
        
        .el-button {
          flex: 1;
          
          &.is-plain:not(.is-disabled) {
            &:hover {
              color: var(--el-color-primary);
              border-color: var(--el-color-primary-light-5);
              background-color: var(--el-color-primary-light-9);
            }
          }
          
          &.el-button--primary.is-plain {
            background-color: var(--custom-action-primary-bg, var(--el-color-primary-light-9));
            border-color: var(--custom-action-primary-color, var(--el-color-primary));
            color: var(--custom-action-primary-color, var(--el-color-primary));
            
            &:hover {
              background-color: var(--el-color-primary-light-8);
            }
          }
          
          // 深色模式下专门的样式
          :root.dark & {
            &.el-button--primary.is-plain {
              background-color: rgba(64, 158, 255, 0.15);
              border-color: var(--el-color-primary, #409eff);
              color: var(--el-color-primary-light-3, #79bbff);
              
              &:hover {
                background-color: var(--el-color-primary-dark-2, #0a60bd);
                border-color: var(--el-color-primary, #409eff);
                color: #ffffff;
              }
            }
            
            &.el-button--default {
              background-color: #2a2b2f;
              border-color: #444;
              color: #e0e0e0;
              
              &:hover {
                border-color: var(--el-color-primary, #409eff);
                color: var(--el-color-primary-light-3, #79bbff);
              }
              
              &.is-plain {
                background-color: transparent;
                border-color: #555;
                color: #bbb;
                
                &:hover {
                  border-color: var(--el-color-primary, #409eff);
                  color: var(--el-color-primary-light-3, #79bbff);
                }
              }
            }
          }
        }
      }
    }
    
    .mac-type {
      margin-bottom: 24px;
      
      .type-label {
        font-size: 15px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 10px;
      }
      
      .type-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .el-radio {
          margin-right: 0;
          
          &.is-checked {
            .el-radio__label {
              color: var(--el-color-primary);
              font-weight: 500;
            }
          }
        }
      }
    }
    
    .actions {
      display: flex;
      gap: 12px;
      
      .el-button {
        flex: 1;
      }
    }
  }
  
  .result-section {
    .result-table {
      margin-bottom: 16px;
      
      .el-table {
        --el-table-border-color: var(--el-border-color-lighter);
        border-radius: 8px;
        overflow: hidden;
        
        :deep(th.el-table__cell) {
          background-color: var(--el-fill-color-light);
          color: var(--el-text-color-regular);
          font-weight: 600;
          padding: 12px 8px;
        }
        
        :deep(td.el-table__cell) {
          padding: 12px 8px;
        }
        
        :deep(.cell) {
          word-break: break-all;
        }
      }
    }
    
    .mac-value {
      font-family: var(--el-font-family-monospace, monospace);
      word-break: break-all;
    }
    
    .copy-all-button {
      width: 100%;
      margin-top: 8px;
    }
  }
  
  .info-section {
    margin-top: 24px;
    
    .info-card {
      width: 100%;
    }
    
    .info-content {
      color: var(--el-text-color-regular);
      font-size: 14px;
      line-height: 1.6;
      
      h4 {
        color: var(--el-text-color-primary);
        font-size: 16px;
        font-weight: 600;
        margin: 16px 0 10px;
        
        &:first-of-type {
          margin-top: 0;
        }
      }
      
      p {
        margin: 0 0 12px;
      }
      
      ul {
        padding-left: 20px;
        margin: 12px 0;
        
        li {
          margin-bottom: 6px;
          position: relative;
          
          &::marker {
            color: var(--el-color-primary);
          }
          
          strong {
            color: var(--el-text-color-primary);
            font-weight: 600;
          }
        }
      }
      
      code {
        background-color: var(--el-fill-color-light);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--el-font-family-monospace, monospace);
        font-size: 13px;
        color: var(--el-color-danger);
      }
    }
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  @media (max-width: 1200px) {
    .page-content {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  @media (max-width: 991px) {
    .page-content {
      grid-template-columns: 1fr;
    }
    
    .result-card {
      order: 2;
    }
    
    .info-section {
      order: 3;
    }
  }
  
  @media (max-width: 767px) {
    .page-header {
      .header-title {
        h2 {
          font-size: 22px;
        }
        
        .header-desc {
          font-size: 14px;
        }
      }
    }
    
    .card-header {
      flex-wrap: wrap;
      
      .card-actions {
        margin-top: 8px;
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
  
  @media (max-width: 480px) {
    :deep(.el-card__body) {
      padding: 16px;
    }
    
    .page-header {
      .header-title {
        h2 {
          font-size: 20px;
        }
      }
    }
    
    .card-header {
      margin-bottom: 16px;
      
      .card-icon {
        width: 32px;
        height: 32px;
        
        .el-icon {
          font-size: 16px;
        }
      }
      
      .card-title {
        font-size: 16px;
      }
    }
    
    .format-options {
      .option-label {
        font-size: 14px;
      }
      
      .format-buttons {
        .format-button {
          font-size: 12px;
          padding: 6px 4px;
        }
      }
    }
    
    .mac-type {
      .type-label {
        font-size: 14px;
      }
    }
    
    .actions {
      flex-direction: column;
      
      .el-button {
        margin-left: 0 !important;
      }
    }
    
    .result-section {
      .result-table {
        font-size: 13px;
        
        :deep(th.el-table__cell) {
          padding: 8px 6px;
        }
        
        :deep(td.el-table__cell) {
          padding: 8px 6px;
        }
      }
    }
    
    .info-section {
      .info-content {
        font-size: 13px;
        
        h4 {
          font-size: 15px;
        }
        
        code {
          font-size: 12px;
        }
      }
    }
  }
}
</style> 