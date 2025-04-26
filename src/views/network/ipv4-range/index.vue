<template>
  <div class="ipv4-range-page format-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv4 范围扩展器</h2>
        <p class="header-desc">生成指定范围内的所有IP地址</p>
      </div>
    </div>

    <div class="page-content">
      <el-card class="input-card">
        <div class="card-header">
          <el-icon><SetUp /></el-icon>
          <span>设置IP地址范围</span>
        </div>

        <el-form :model="form" label-position="top">
          <el-form-item label="起始IP地址">
            <el-input
              v-model="form.startIP"
              placeholder="例如：192.168.1.1"
              @input="validateInput('start')"
            />
            <div v-if="validationError.startIP" class="error-message">
              {{ validationError.startIP }}
            </div>
          </el-form-item>

          <el-form-item label="结束IP地址">
            <el-input
              v-model="form.endIP"
              placeholder="例如：192.168.1.10"
              @input="validateInput('end')"
            />
            <div v-if="validationError.endIP" class="error-message">
              {{ validationError.endIP }}
            </div>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateRange" 
              :disabled="!isFormValid || loading"
              style="width: 100%"
            >
              <el-icon><Connection /></el-icon>
              生成地址范围
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="result-card" v-if="result.length">
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>IP地址列表</span>
          <div class="result-actions">
            <el-button type="primary" plain size="small" @click="handleCopy">
              <el-icon><CopyDocument /></el-icon>
              复制所有地址
            </el-button>
          </div>
        </div>

        <div class="range-info">
          范围内包含 <strong>{{ result.length }}</strong> 个IP地址
        </div>

        <div class="result-content">
          <el-table
            :data="result"
            height="400"
            border
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column type="index" width="70" label="序号" />
            <el-table-column prop="ip" label="IP地址" />
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="copyIP(scope.row.ip)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card class="help-card">
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>使用帮助</span>
        </div>

        <div class="help-content">
          <h4>IPv4范围扩展器</h4>
          <p>此工具可以生成指定IP地址范围内的所有IP地址列表。</p>
          
          <h4>使用方法</h4>
          <ol>
            <li>输入起始IP地址（如 192.168.1.1）</li>
            <li>输入结束IP地址（如 192.168.1.10）</li>
            <li>点击"生成地址范围"按钮</li>
          </ol>
          
          <h4>限制说明</h4>
          <p>为了防止过度消耗资源，每次最多可以生成 10,000 个IP地址。如果您需要生成更多地址，请分批进行。</p>
          
          <h4>应用场景</h4>
          <ul>
            <li>网络扫描工具使用</li>
            <li>IP地址资源规划</li>
            <li>批量配置网络设备</li>
            <li>网络监控与管理</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { SetUp, Connection, List, InfoFilled, CopyDocument } from '@element-plus/icons-vue';
import { IPv4Address } from '@/utils/network/ipv4';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  startIP: '',
  endIP: ''
});

// 验证错误信息
const validationError = reactive({
  startIP: '',
  endIP: ''
});

// 结果数据
const result = ref<{ ip: string }[]>([]);

// 加载状态
const loading = ref(false);

// 验证输入
const validateInput = (field: 'start' | 'end') => {
  const value = field === 'start' ? form.startIP : form.endIP;
  const errorField = field === 'start' ? 'startIP' : 'endIP';
  
  try {
    if (value) {
      IPv4Address.parseAddress(value);
      validationError[errorField] = '';
      
      // 如果两个地址都有效，检查起始地址是否小于等于结束地址
      if (form.startIP && form.endIP && 
          !validationError.startIP && !validationError.endIP) {
        checkIPRange();
      }
    } else {
      validationError[errorField] = '';
    }
  } catch (error) {
    validationError[errorField] = '无效的IP地址格式';
  }
};

// 检查IP范围是否有效
const checkIPRange = () => {
  try {
    const startNum = IPv4Address.parseAddress(form.startIP);
    const endNum = IPv4Address.parseAddress(form.endIP);
    
    if (startNum > endNum) {
      validationError.endIP = '结束IP地址必须大于或等于起始IP地址';
      return false;
    } else {
      validationError.endIP = '';
      return true;
    }
  } catch {
    return false;
  }
};

// 生成IP地址范围
const generateRange = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请输入有效的起始IP和结束IP地址');
    return;
  }
  
  try {
    loading.value = true;
    
    // 生成IP地址范围
    const ipList = await new Promise<string[]>((resolve) => {
      // 使用setTimeout来允许UI更新加载状态
      setTimeout(() => {
        const ipAddresses = IPv4Address.generateRange(form.startIP, form.endIP);
        resolve(ipAddresses);
      }, 100);
    });
    
    // 格式化结果
    result.value = ipList.map(ip => ({ ip }));
    
    ElMessage.success(`成功生成${ipList.length}个IP地址`);
  } catch (error) {
    ElMessage.error(`生成失败: ${(error as Error).message}`);
    result.value = [];
  } finally {
    loading.value = false;
  }
};

// 复制单个IP地址
const copyIP = async (ip: string) => {
  try {
    await copy(ip);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 复制所有IP地址
const handleCopy = async () => {
  if (!result.value.length) return;
  
  const text = result.value.map(item => item.ip).join('\n');
  
  try {
    await copy(text);
    ElMessage.success('已复制所有IP地址到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 表单是否有效
const isFormValid = computed(() => {
  return form.startIP && 
         form.endIP && 
         !validationError.startIP && 
         !validationError.endIP &&
         checkIPRange();
});
</script>

<style lang="scss" scoped>
.ipv4-range-page {
  max-width: 100%;
  overflow-x: hidden;
  
  .page-header {
    margin-bottom: 24px;
    
    .header-title {
      h2 {
        font-size: 26px;
        font-weight: 600;
        margin-bottom: 6px;
        background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
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
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-size: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed var(--el-border-color-light);
      
      .el-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-size: 18px;
        margin-right: 8px;
      }
      
      .result-actions {
        margin-left: auto;
      }
    }
    
    .input-card, .result-card, .help-card {
      width: 100%;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 12px;
      border: 1px solid transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      background-color: var(--el-bg-color);
      overflow: hidden;
      margin-bottom: 16px;
      
      &:hover {
        border-color: var(--el-color-primary-light-5);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
    }
    
    .help-card {
      height: fit-content;
      
      .help-content {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.6;
        
        h4 {
          color: var(--el-text-color-primary);
          font-size: 16px;
          font-weight: 600;
          margin: 16px 0 10px;
          
          &:first-child {
            margin-top: 0;
          }
        }
        
        p {
          margin: 0 0 12px;
        }
        
        ol, ul {
          padding-left: 20px;
          margin: 12px 0;
          
          li {
            margin-bottom: 8px;
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
      }
    }
  }
  
  .error-message {
    color: var(--el-color-danger);
    font-size: 12px;
    font-weight: 500;
    margin-top: 4px;
    line-height: 1.4;
  }
  
  .result-content {
    overflow-x: auto;
    border-radius: 8px;
    
    .el-table {
      --el-table-border-color: var(--el-border-color-lighter);
      
      :deep(th.el-table__cell) {
        background-color: var(--el-fill-color-light);
        font-weight: 600;
      }
    }
  }
  
  .range-info {
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-light);
    padding: 12px 16px;
    border-radius: 8px;
    
    strong {
      color: var(--el-color-primary);
      font-weight: 600;
      font-size: 16px;
    }
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  :deep(.el-button--primary) {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
    }
  }
}

@media (max-width: 1200px) {
  .ipv4-range-page {
    .page-content {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .ipv4-range-page {
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
      
      .result-actions {
        margin-left: 0;
        margin-top: 8px;
        width: 100%;
        
        .el-button {
          width: 100%;
        }
      }
    }
    
    .result-content {
      .el-table {
        font-size: 13px;
        
        :deep(th.el-table__cell) {
          padding: 8px 0;
        }
        
        :deep(td.el-table__cell) {
          padding: 6px 0;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .ipv4-range-page {
    .page-header {
      .header-title {
        h2 {
          font-size: 20px;
        }
        
        .header-desc {
          font-size: 13px;
        }
      }
    }
    
    .card-header {
      margin-bottom: 16px;
      font-size: 14px;
      
      .el-icon {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }
    }
    
    .help-card {
      .help-content {
        font-size: 13px;
        
        h4 {
          font-size: 15px;
        }
      }
    }
    
    .result-content {
      .el-table {
        font-size: 12px;
      }
    }
    
    .range-info {
      font-size: 13px;
      padding: 8px 12px;
      
      strong {
        font-size: 14px;
      }
    }
    
    :deep(.el-card__body) {
      padding: 16px;
    }
    
    :deep(.el-form-item__label) {
      padding-bottom: 4px;
      font-size: 13px;
    }
    
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style> 