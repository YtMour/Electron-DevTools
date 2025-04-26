<template>
  <div class="mac-lookup-page format-page">
    <div class="page-header">
      <div class="header-title">
        <h2>MAC 地址查找</h2>
        <p class="header-desc">查询MAC地址的厂商信息</p>
      </div>
    </div>

    <div class="page-content">
      <el-card class="input-card">
        <div class="card-header">
          <el-icon><Search /></el-icon>
          <span>MAC地址查询</span>
        </div>

        <el-form :model="form" label-position="top">
          <el-form-item label="MAC地址">
            <el-input
              v-model="form.macAddress"
              placeholder="例如：00:1A:2B:3C:4D:5E 或 001A2B3C4D5E"
              @input="validateMac"
              clearable
            />
            <div v-if="validationError" class="error-message">
              {{ validationError }}
            </div>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="lookupMac" 
              :disabled="!isFormValid || loading" 
              :loading="loading"
              style="width: 100%"
            >
              <el-icon><Search /></el-icon>
              查询厂商信息
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="result-card" v-if="result.company">
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>查询结果</span>
          <div class="result-actions">
            <el-button type="primary" plain size="small" @click="copyResult">
              <el-icon><CopyDocument /></el-icon>
              复制结果
            </el-button>
          </div>
        </div>

        <div class="result-content">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="MAC地址">
              <span class="formatted-mac">{{ result.formattedMac }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="厂商名称">
              {{ result.company }}
            </el-descriptions-item>
            <el-descriptions-item label="厂商地址" v-if="result.address">
              {{ result.address }}
            </el-descriptions-item>
            <el-descriptions-item label="国家/地区" v-if="result.country">
              {{ result.country }}
            </el-descriptions-item>
            <el-descriptions-item label="分配块" v-if="result.blockRange">
              {{ result.blockRange }}
            </el-descriptions-item>
            <el-descriptions-item label="类型">
              {{ getMacType(form.macAddress) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <el-card class="recent-searches" v-if="searchHistory.length > 0">
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>最近查询</span>
          <div class="history-actions">
            <el-button type="danger" link size="small" @click="clearHistory">
              清除历史
            </el-button>
          </div>
        </div>

        <div class="history-content">
          <el-table :data="searchHistory" style="width: 100%">
            <el-table-column prop="mac" label="MAC地址" />
            <el-table-column prop="company" label="厂商" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="reloadSearch(scope.row.mac)"
                >
                  重新查询
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <el-card class="help-card">
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>帮助信息</span>
        </div>

        <div class="help-content">
          <h4>什么是MAC地址？</h4>
          <p>
            MAC地址(Media Access Control Address)是网络设备的物理地址，长度为48位(6个字节)，通常表示为12个十六进制数字，
            例如：00:1A:2B:3C:4D:5E。
          </p>

          <h4>MAC地址前缀</h4>
          <p>
            MAC地址的前24位(前3个字节)称为OUI(Organizationally Unique Identifier)，由IEEE分配给不同的设备制造商。
            通过OUI可以识别设备的制造商。
          </p>

          <h4>使用提示</h4>
          <ul>
            <li>支持多种格式输入：带冒号(00:1A:2B:3C:4D:5E)、带连字符(00-1A-2B-3C-4D-5E)或无分隔符(001A2B3C4D5E)</li>
            <li>输入不区分大小写</li>
            <li>可以只输入OUI部分(前6位)进行查询</li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, InfoFilled, CopyDocument, Clock } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import { formatMacAddress, isMacAddressValid, isMacAddressMulticast, isMacAddressUnicast } from '@/utils/network/mac';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  macAddress: ''
});

// 验证错误信息
const validationError = ref('');

// 加载状态
const loading = ref(false);

// 查询结果
const result = reactive({
  formattedMac: '',
  company: '',
  address: '',
  country: '',
  blockRange: ''
});

// 搜索历史
const searchHistory = ref<{ mac: string; company: string }[]>([]);

// 初始化时从本地存储加载历史记录
const initSearchHistory = () => {
  try {
    const savedHistory = localStorage.getItem('mac-search-history');
    if (savedHistory) {
      searchHistory.value = JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error('Failed to load search history', error);
  }
};

// 保存历史记录到本地存储
const saveSearchHistory = () => {
  try {
    // 限制历史记录数量为最近10条
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10);
    }
    localStorage.setItem('mac-search-history', JSON.stringify(searchHistory.value));
  } catch (error) {
    console.error('Failed to save search history', error);
  }
};

// 清除历史记录
const clearHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('mac-search-history');
  ElMessage.success('历史记录已清除');
};

// 加载历史记录
initSearchHistory();

// 验证MAC地址格式
const validateMac = () => {
  if (!form.macAddress) {
    validationError.value = '';
    return;
  }

  if (!isMacAddressValid(form.macAddress)) {
    validationError.value = '无效的MAC地址格式';
  } else {
    validationError.value = '';
  }
};

// 根据MAC地址查询厂商信息
const lookupMac = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请输入有效的MAC地址');
    return;
  }

  loading.value = true;

  try {
    // 格式化MAC地址
    const formattedMac = formatMacAddress(form.macAddress);
    const oui = formattedMac.replace(/:/g, '').substring(0, 6).toUpperCase();

    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));

    // 这里应该调用真实的API或本地数据库查询厂商信息
    // 示例数据
    let companyInfo;
    
    // 根据OUI查询厂商信息（示例数据）
    if (oui === '001A2B') {
      companyInfo = {
        company: 'Example Technologies Co., Ltd.',
        address: '123 Tech Street, Silicon Valley',
        country: 'United States',
        blockRange: '00:1A:2B:00:00:00 - 00:1A:2B:FF:FF:FF'
      };
    } else if (oui === '0050C2') {
      companyInfo = {
        company: 'IEEE Registration Authority',
        address: '445 Hoes Lane, Piscataway NJ 08854',
        country: 'United States',
        blockRange: '00:50:C2:00:00:00 - 00:50:C2:FF:FF:FF'
      };
    } else if (oui === '00005E') {
      companyInfo = {
        company: 'IANA',
        address: 'Internet Assigned Numbers Authority',
        country: 'United States',
        blockRange: '00:00:5E:00:00:00 - 00:00:5E:FF:FF:FF'
      };
    } else if (oui === '001122') {
      companyInfo = {
        company: 'Sample Networking, Inc.',
        address: '456 Network Avenue',
        country: 'Germany',
        blockRange: '00:11:22:00:00:00 - 00:11:22:FF:FF:FF'
      };
    } else {
      companyInfo = {
        company: '未知厂商',
        address: '',
        country: '',
        blockRange: ''
      };
    }

    // 更新结果
    result.formattedMac = formattedMac;
    result.company = companyInfo.company;
    result.address = companyInfo.address;
    result.country = companyInfo.country;
    result.blockRange = companyInfo.blockRange;

    // 添加到历史记录
    // 先检查是否已存在相同MAC地址的记录
    const existingIndex = searchHistory.value.findIndex(item => 
      item.mac.toLowerCase() === formattedMac.toLowerCase()
    );
    
    if (existingIndex > -1) {
      // 如果存在则移除旧记录
      searchHistory.value.splice(existingIndex, 1);
    }
    
    // 添加新记录到顶部
    searchHistory.value.unshift({
      mac: formattedMac,
      company: companyInfo.company
    });
    
    // 保存历史记录
    saveSearchHistory();

    ElMessage.success('查询成功');
  } catch (error) {
    ElMessage.error('查询失败，请重试');
    console.error('MAC lookup error:', error);
  } finally {
    loading.value = false;
  }
};

// 重新加载历史搜索
const reloadSearch = (mac: string) => {
  form.macAddress = mac;
  validateMac();
  lookupMac();
};

// 复制结果
const copyResult = async () => {
  if (!result.company) return;
  
  const text = `
MAC地址: ${result.formattedMac}
厂商名称: ${result.company}
${result.address ? `厂商地址: ${result.address}\n` : ''}
${result.country ? `国家/地区: ${result.country}\n` : ''}
${result.blockRange ? `分配块: ${result.blockRange}\n` : ''}
类型: ${getMacType(form.macAddress)}
`.trim();
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 获取MAC地址类型
const getMacType = (mac: string) => {
  if (!mac || !isMacAddressValid(mac)) return '未知';
  
  if (isMacAddressMulticast(mac)) {
    return '组播地址 (Multicast)';
  } else if (isMacAddressUnicast(mac)) {
    return '单播地址 (Unicast)';
  } else {
    return '广播地址 (Broadcast)';
  }
};

// 表单是否有效
const isFormValid = computed(() => {
  return form.macAddress && !validationError.value;
});
</script>

<style lang="scss" scoped>
.mac-lookup-page {
  .page-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    
    .recent-searches,
    .help-card {
      grid-column: 1 / -1;
    }
  }
  
  .input-card, .result-card, .recent-searches, .help-card {
    transition: all 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
    
    &:hover {
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-size: 16px;
    
    .el-icon {
      color: var(--el-color-primary);
      font-size: 18px;
    }
    
    .result-actions,
    .history-actions {
      margin-left: auto;
    }
  }
  
  .formatted-mac {
    font-family: monospace;
    font-weight: 600;
    letter-spacing: 0.5px;
    font-size: 16px;
    background-color: var(--el-fill-color-light);
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--el-color-primary);
  }
  
  .result-content {
    :deep(.el-descriptions) {
      border-radius: 6px;
      overflow: hidden;
      
      .el-descriptions__label {
        font-weight: 600;
        background-color: var(--el-fill-color-light);
        width: 100px;
      }
      
      .el-descriptions__content {
        line-height: 1.6;
      }
    }
  }
  
  .help-content,
  .history-content {
    margin-top: 12px;
    
    h4 {
      margin: 20px 0 10px 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      
      &:first-child {
        margin-top: 0;
      }
    }
    
    p {
      margin: 10px 0;
      line-height: 1.6;
      color: var(--el-text-color-regular);
    }
    
    ul {
      padding-left: 20px;
      margin: 10px 0;
      color: var(--el-text-color-regular);
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
        position: relative;
        
        &::marker {
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  .error-message {
    color: var(--el-color-danger);
    font-size: 12px;
    margin-top: 4px;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }
  
  :deep(.el-button--primary) {
    transition: all 0.3s ease;
    border-radius: 6px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
    }
  }
  
  :deep(.el-button--primary.is-link) {
    &:hover {
      transform: scale(1.1);
      box-shadow: none;
    }
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
  
  :deep(.el-table) {
    border-radius: 6px;
    overflow: hidden;
    
    th {
      background-color: var(--el-fill-color-light);
      font-weight: 600;
    }
    
    .el-button.el-button--primary.is-link {
      padding: 4px;
    }
  }
}

@media (max-width: 992px) {
  .mac-lookup-page {
    .page-content {
      grid-template-columns: 1fr;
    }
  }
}
</style> 