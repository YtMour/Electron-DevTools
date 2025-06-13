<template>
  <div class="network-tool-page">
    <div class="page-header">
      <div class="header-title">
        <h2>网络信息查询</h2>
        <p class="header-desc">查询IP地址或域名的详细信息，包括地理位置、DNS记录、Whois信息及网络连通性</p>
      </div>
    </div>

    <div class="page-content main-sidebar">
      <div class="main-content-left">
        <!-- 查询输入区域 -->
        <el-card class="network-card config-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><Search /></el-icon>
            </div>
            <div class="card-title">查询工具</div>
          </div>

          <div class="form-group">
            <label>IP地址或域名</label>
            <el-input 
              v-model="queryInput" 
              placeholder="输入IP地址或域名，如: 8.8.8.8 或 example.com"
              @keyup.enter="performLookup"
              :disabled="isLoading"
            >
              <template #append>
                <el-button @click="performLookup" :loading="isLoading">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <div class="validation-error" v-if="validationError">
              {{ validationError }}
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="performLookup" :loading="isLoading">
              <el-icon><Search /></el-icon> 查询
            </el-button>
            <el-button @click="useMyIP" :disabled="isLoading">
              <el-icon><Monitor /></el-icon> 我的IP
            </el-button>
            <el-button @click="resetForm" :disabled="isLoading">
              <el-icon><Delete /></el-icon> 清除
            </el-button>
          </div>
          
          <div v-if="recentSearches.length > 0" class="recent-searches">
            <div class="recent-title">最近查询</div>
            <div class="recent-list">
              <el-tag
                v-for="item in recentSearches"
                :key="item"
                @click="selectRecentSearch(item)"
                class="recent-tag"
                :effect="item === queryInput ? 'dark' : 'plain'"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 结果显示区域 -->
        <div v-if="lookupResult" class="results-section">
          <el-card class="network-card result-card">
            <div class="card-header">
              <div class="card-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="card-title">查询结果: {{ lookupResult.query }}</div>
              <div class="header-actions">
                <el-button type="primary" plain size="small" @click="copyFullResults">
                  <el-icon><CopyDocument /></el-icon> 复制全部
                </el-button>
              </div>
            </div>
            
            <el-tabs v-model="activeOption" class="result-tabs">
              <!-- 基本信息标签页 -->
              <el-tab-pane name="general" lazy>
                <template #label>
                  <div class="tab-label">
                    <el-icon><InfoFilled /></el-icon>
                    <span>基本信息</span>
                  </div>
                </template>
                <GeneralInfo 
                  :ip-info="lookupResult.ipInfo" 
                  :domain-info="lookupResult.domainInfo"
                  :type="lookupResult.type"
                />
              </el-tab-pane>
              
              <!-- DNS记录标签页 -->
              <el-tab-pane name="dns" lazy v-if="lookupResult.type === 'domain'">
                <template #label>
                  <div class="tab-label">
                    <el-icon><Connection /></el-icon>
                    <span>DNS记录</span>
                  </div>
                </template>
                <DnsRecords 
                  :dns="lookupResult.domainInfo?.dns"
                />
              </el-tab-pane>
              
              <!-- Whois信息标签页 -->
              <el-tab-pane name="whois" lazy v-if="lookupResult.type === 'domain'">
                <template #label>
                  <div class="tab-label">
                    <el-icon><Document /></el-icon>
                    <span>Whois信息</span>
                  </div>
                </template>
                <WhoisInfo 
                  :whois="lookupResult.domainInfo?.whois"
                />
              </el-tab-pane>
              
              <!-- Ping测试标签页 -->
              <el-tab-pane name="ping" lazy>
                <template #label>
                  <div class="tab-label">
                    <el-icon><Clock /></el-icon>
                    <span>Ping测试</span>
                  </div>
                </template>
                <PingTest
                  :host="lookupResult.query"
                  :ping-stats="pingStats"
                  :is-pinging="isPinging"
                  @start-ping="startPingTest"
                />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>

      <!-- 帮助信息侧边栏 -->
      <el-card class="network-card info-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">工具说明</div>
        </div>
        
        <div class="help-content">
          <h4>什么是网络信息查询?</h4>
          <p>
            网络信息查询工具可以帮助您获取IP地址或域名的详细信息，用于网络诊断、开发调试和安全分析。
          </p>
          
          <h4>支持的查询类型</h4>
          <ul>
            <li><strong>IPv4地址</strong>: 例如 8.8.8.8</li>
            <li><strong>IPv6地址</strong>: 例如 2001:4860:4860::8888</li>
            <li><strong>域名</strong>: 例如 example.com</li>
          </ul>
          
          <h4>提供的信息</h4>
          <ul>
            <li><strong>基本信息</strong>: 地理位置、ISP、网络信息等</li>
            <li><strong>DNS记录</strong>: A、AAAA、MX、TXT等DNS记录</li>
            <li><strong>Whois信息</strong>: 域名注册信息、到期日期等</li>
            <li><strong>Ping测试</strong>: 网络连通性和延迟测试</li>
          </ul>
          
          <h4>使用方法</h4>
          <ol>
            <li>在输入框中输入IP地址或域名</li>
            <li>点击"查询"按钮</li>
            <li>查看不同标签页中的详细信息</li>
          </ol>
          
          <h4>注意事项</h4>
          <p>
            IP地址的地理位置信息仅供参考，精确度会受到多种因素影响。
            Ping测试在浏览器环境下为模拟测试，延迟结果可能与实际网络状态有差异。
          </p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, defineAsyncComponent } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Search, InfoFilled, Connection, Document, Monitor, Delete, Clock,
  CopyDocument, DataAnalysis
} from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import { unifiedLookup, getMyCurrentInfo, LookupResult } from '@/utils/network/unified-lookup';
import { pingMultiple, PingStatistics, formatPingStatistics } from '@/utils/network/ping';
import { reliablePing, testNetworkConnectivity } from '@/utils/network/reliable-ping';

// 使用异步组件导入方式
const GeneralInfo = defineAsyncComponent(() => import('./general-info.vue'));
const DnsRecords = defineAsyncComponent(() => import('./dns-records.vue'));
const WhoisInfo = defineAsyncComponent(() => import('./whois-info.vue'));
const PingTest = defineAsyncComponent(() => import('./ping-test.vue'));

const { copy } = useClipboard();

// 查询状态
const queryInput = ref('');
const validationError = ref('');
const isLoading = ref(false);
const activeOption = ref('general');
const lookupResult = ref<LookupResult | null>(null);
const recentSearches = ref<string[]>([]);

// Ping相关状态
const isPinging = ref(false);
const pingStats = ref<PingStatistics | null>(null);

// 在组件挂载时从localStorage加载最近的查询
onMounted(() => {
  const savedSearches = localStorage.getItem('recentNetworkLookups');
  if (savedSearches) {
    try {
      recentSearches.value = JSON.parse(savedSearches).slice(0, 5);
    } catch (e) {
      console.error('Failed to parse saved searches:', e);
    }
  }
});

// 从最近查询中选择
const selectRecentSearch = (item: string) => {
  queryInput.value = item;
  performLookup();
};

// 执行查询
const performLookup = async () => {
  if (!queryInput.value.trim()) {
    validationError.value = '请输入IP地址或域名';
    return;
  }
  
  isLoading.value = true;
  validationError.value = '';
  
  try {
    const result = await unifiedLookup(queryInput.value.trim());
    lookupResult.value = result;
    
    // 添加到最近查询
    addToRecentSearches(queryInput.value.trim());
    
    // 根据查询类型调整活动选项卡
    if (result.type === 'ip') {
      // IP地址没有DNS和Whois信息
      if (activeOption.value === 'dns' || activeOption.value === 'whois') {
        activeOption.value = 'general';
      }
    }
    
    ElMessage.success('查询成功');
  } catch (error) {
    validationError.value = (error as Error).message;
    ElMessage.error('查询失败: ' + (error as Error).message);
    lookupResult.value = null;
  } finally {
    isLoading.value = false;
  }
};

// 使用我的IP
const useMyIP = async () => {
  isLoading.value = true;
  
  try {
    const result = await getMyCurrentInfo();
    lookupResult.value = result;
    queryInput.value = result.query;
    
    // 添加到最近查询
    addToRecentSearches(result.query);
    
    ElMessage.success('获取当前IP信息成功');
  } catch (error) {
    ElMessage.error('获取当前IP信息失败: ' + (error as Error).message);
  } finally {
    isLoading.value = false;
  }
};

// 开始Ping测试
const startPingTest = async () => {
  if (!lookupResult.value) return;

  isPinging.value = true;

  try {
    // 首先检查网络连通性
    const isConnected = await testNetworkConnectivity(3000);
    if (!isConnected) {
      ElMessage.warning('网络连接异常，建议检查网络设置');
    }

    // 使用更可靠的 ping 方法
    pingStats.value = await pingMultiple(lookupResult.value.query, 4, 1000);
    ElMessage.success('Ping测试完成');
  } catch (error) {
    console.error('Ping测试错误:', error);
    ElMessage.error('Ping测试失败，请检查网络连接或尝试其他主机');
  } finally {
    isPinging.value = false;
  }
};

// 复制完整结果
const copyFullResults = () => {
  if (!lookupResult.value) return;
  
  let textResult = `查询结果: ${lookupResult.value.query}\n\n`;
  
  // 基本信息
  textResult += `--- 基本信息 ---\n`;
  if (lookupResult.value.type === 'ip') {
    const ip = lookupResult.value.ipInfo;
    if (ip) {
      textResult += `IP地址: ${ip.ip}\n`;
      textResult += `国家/地区: ${ip.country || '未知'}\n`;
      textResult += `城市: ${ip.city || '未知'}\n`;
      textResult += `ISP: ${ip.isp || '未知'}\n`;
      textResult += `组织: ${ip.org || '未知'}\n`;
      textResult += `时区: ${ip.timezone || '未知'}\n`;
    }
  } else if (lookupResult.value.type === 'domain') {
    const domain = lookupResult.value.domainInfo;
    if (domain) {
      textResult += `域名: ${domain.domain}\n`;
      textResult += `解析IP: ${domain.resolvedIp || '未知'}\n`;
      
      if (lookupResult.value.ipInfo) {
        const ip = lookupResult.value.ipInfo;
        textResult += `IP位置: ${ip.country || '未知'}${ip.city ? ', ' + ip.city : ''}\n`;
        textResult += `ISP: ${ip.isp || '未知'}\n`;
      }
    }
  }

  copy(textResult);
  ElMessage.success('已复制到剪贴板');
};

// 重置表单
const resetForm = () => {
  queryInput.value = '';
  validationError.value = '';
  lookupResult.value = null;
  pingStats.value = null;
};

// 添加到最近查询
const addToRecentSearches = (query: string) => {
  if (!recentSearches.value.includes(query)) {
    recentSearches.value.unshift(query);
    if (recentSearches.value.length > 5) {
      recentSearches.value = recentSearches.value.slice(0, 5);
    }
    
    // 保存到localStorage
    localStorage.setItem('recentNetworkLookups', JSON.stringify(recentSearches.value));
  }
};
</script>

<style scoped>
.network-tool-page {
  margin: 0 auto;
  max-width: 1280px;
  padding: 0 16px;
}

.page-header {
  margin-bottom: 24px;
}

.header-title h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin: 0 0 8px 0;
}

.header-desc {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

.main-sidebar {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 24px;
}

.main-content-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.network-card {
  margin-bottom: 0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  margin-right: 12px;
}

.card-icon .el-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-actions {
  margin-left: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.validation-error {
  margin-top: 8px;
  color: var(--el-color-danger);
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.recent-searches {
  margin-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

.recent-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-tag {
  cursor: pointer;
}

.result-tabs {
  margin-top: 8px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-label .el-icon {
  font-size: 16px;
}

.help-content {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.help-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--el-text-color-primary);
}

.help-content h4:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.help-content ul, 
.help-content ol {
  padding-left: 20px;
  margin: 12px 0;
}

.help-content li {
  margin-bottom: 6px;
  line-height: 1.6;
}

@media screen and (max-width: 768px) {
  .main-sidebar {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .action-buttons .el-button {
    flex: 1 0 calc(50% - 6px);
  }
}
</style> 