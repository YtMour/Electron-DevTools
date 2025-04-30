<template>
  <div class="network-tool-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv4 范围扩展器</h2>
        <p class="header-desc">生成指定范围内的所有IP地址</p>
      </div>
    </div>

    <div class="page-content main-sidebar">
      <div class="main-content-left">
        <el-card class="network-card config-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><SetUp /></el-icon>
            </div>
            <div class="card-title">设置IP地址范围</div>
          </div>

          <div class="form-group">
            <label>起始IP地址</label>
            <el-input
              v-model="form.startIP"
              placeholder="例如：192.168.1.1"
              @input="validateInput('start')"
            />
            <div v-if="validationError.startIP" class="validation-error">
              {{ validationError.startIP }}
            </div>
          </div>

          <div class="form-group">
            <label>结束IP地址</label>
            <el-input
              v-model="form.endIP"
              placeholder="例如：192.168.1.10"
              @input="validateInput('end')"
            />
            <div v-if="validationError.endIP" class="validation-error">
              {{ validationError.endIP }}
            </div>
          </div>

          <div class="action-buttons">
            <el-button 
              type="primary" 
              @click="generateRange" 
              :disabled="!isFormValid || loading"
              style="width: 100%"
            >
              <el-icon><Connection /></el-icon>
              生成地址范围
            </el-button>
          </div>
        </el-card>

        <el-card class="network-card result-card" v-if="result.length">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><List /></el-icon>
            </div>
            <div class="card-title">IP地址列表</div>
            <div class="header-actions">
              <el-button type="primary" plain size="small" @click="handleCopy">
                <el-icon><CopyDocument /></el-icon>
                复制所有地址
              </el-button>
            </div>
          </div>

          <div class="result-content">
            <div class="range-info">
              范围内包含 <strong>{{ result.length }}</strong> 个IP地址
            </div>

            <div class="table-container">
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
          </div>
        </el-card>
      </div>

      <el-card class="network-card info-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">使用帮助</div>
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

.validation-error {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.result-content {
  padding: 20px;
}

.range-info {
  margin-bottom: 16px;
  font-size: 15px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  
  strong {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.table-container {
  width: 100%;
  overflow-x: auto;
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
  
  .range-info {
    font-size: 14px;
  }
  
  .header-actions {
    position: relative;
    margin-top: 10px;
  }
}
</style> 