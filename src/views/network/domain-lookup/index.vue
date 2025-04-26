<template>
  <div class="domain-lookup-container">
    <div class="header">
      <h1>域名查询</h1>
      <p>查询域名的DNS记录、解析信息和注册信息</p>
    </div>
    
    <div class="main-content">
      <div class="lookup-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><Search /></el-icon>
            </span>
            <span class="title">输入域名</span>
          </div>
          
          <div class="panel-body">
            <div class="form-group">
              <label>域名</label>
              <el-input 
                v-model="domain" 
                placeholder="例如: example.com"
                @keyup.enter="lookupDomain"
              />
              <div class="error-message" v-if="validationError">
                {{ validationError }}
              </div>
            </div>
            
            <div class="form-group">
              <label>查询类型</label>
              <el-select v-model="queryType" placeholder="选择查询类型" style="width: 100%">
                <el-option label="所有记录" value="ALL" />
                <el-option label="A 记录 (IPv4)" value="A" />
                <el-option label="AAAA 记录 (IPv6)" value="AAAA" />
                <el-option label="MX 记录 (邮件服务器)" value="MX" />
                <el-option label="NS 记录 (域名服务器)" value="NS" />
                <el-option label="TXT 记录" value="TXT" />
                <el-option label="CNAME 记录" value="CNAME" />
                <el-option label="SOA 记录" value="SOA" />
                <el-option label="SRV 记录" value="SRV" />
              </el-select>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="lookupDomain" :loading="loading" class="lookup-button">
                <el-icon><Search /></el-icon>
                查询域名信息
              </el-button>
              <el-button @click="resetForm" :disabled="loading" class="reset-button">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
            
            <div v-if="recentSearches.length > 0" class="recent-searches">
              <div class="section-divider"></div>
              <p class="recent-title">最近查询</p>
              <div class="search-tags">
                <el-tag 
                  v-for="(item, index) in recentSearches" 
                  :key="index" 
                  @click="selectRecentSearch(item)"
                  closable
                  @close="removeRecentSearch(index)"
                  class="search-tag"
                >
                  {{ item }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="dnsResult" class="panel result-panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><Document /></el-icon>
            </span>
            <span class="title">DNS 记录查询结果</span>
            <el-button type="primary" plain size="small" class="copy-button" @click="copyResults">
              复制结果
            </el-button>
          </div>
          
          <div class="panel-body">
            <div class="domain-info">
              <div class="domain-title">{{ dnsResult.domain }}</div>
              <div class="domain-status" :class="{ 
                'status-valid': dnsResult.resolvable, 
                'status-invalid': !dnsResult.resolvable 
              }">
                {{ dnsResult.resolvable ? '可解析' : '不可解析' }}
              </div>
            </div>
            
            <div v-if="dnsResult.error" class="error-block">
              <el-alert type="error" :title="dnsResult.error" :closable="false" show-icon />
            </div>
            
            <template v-else>
              <div v-if="dnsResult.a && dnsResult.a.length > 0" class="record-section">
                <div class="record-type">A 记录 (IPv4)</div>
                <el-table :data="dnsResult.a" style="width: 100%">
                  <el-table-column prop="ip" label="IP 地址" />
                  <el-table-column prop="ttl" label="TTL" width="120" />
                </el-table>
              </div>
              
              <div v-if="dnsResult.aaaa && dnsResult.aaaa.length > 0" class="record-section">
                <div class="record-type">AAAA 记录 (IPv6)</div>
                <el-table :data="dnsResult.aaaa" style="width: 100%">
                  <el-table-column prop="ip" label="IPv6 地址" />
                  <el-table-column prop="ttl" label="TTL" width="120" />
                </el-table>
              </div>
              
              <div v-if="dnsResult.mx && dnsResult.mx.length > 0" class="record-section">
                <div class="record-type">MX 记录 (邮件服务器)</div>
                <el-table :data="dnsResult.mx" style="width: 100%">
                  <el-table-column prop="exchange" label="邮件服务器" />
                  <el-table-column prop="priority" label="优先级" width="120" />
                  <el-table-column prop="ttl" label="TTL" width="120" />
                </el-table>
              </div>
              
              <div v-if="dnsResult.ns && dnsResult.ns.length > 0" class="record-section">
                <div class="record-type">NS 记录 (域名服务器)</div>
                <el-table :data="dnsResult.ns" style="width: 100%">
                  <el-table-column prop="nameserver" label="域名服务器" />
                  <el-table-column prop="ttl" label="TTL" width="120" />
                </el-table>
              </div>
              
              <div v-if="dnsResult.txt && dnsResult.txt.length > 0" class="record-section">
                <div class="record-type">TXT 记录</div>
                <el-table :data="dnsResult.txt" style="width: 100%">
                  <el-table-column prop="text" label="文本值" />
                  <el-table-column prop="ttl" label="TTL" width="120" />
                </el-table>
              </div>
              
              <div v-if="dnsResult.cname && dnsResult.cname.length > 0" class="record-section">
                <div class="record-type">CNAME 记录</div>
                <el-table :data="dnsResult.cname" style="width: 100%">
                  <el-table-column prop="target" label="目标域名" />
                  <el-table-column prop="ttl" label="TTL" width="120" />
                </el-table>
              </div>
              
              <div v-if="dnsResult.soa" class="record-section">
                <div class="record-type">SOA 记录</div>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="主域名服务器">{{ dnsResult.soa.primary }}</el-descriptions-item>
                  <el-descriptions-item label="管理员邮箱">{{ dnsResult.soa.admin }}</el-descriptions-item>
                  <el-descriptions-item label="序列号">{{ dnsResult.soa.serial }}</el-descriptions-item>
                  <el-descriptions-item label="刷新时间">{{ dnsResult.soa.refresh }}</el-descriptions-item>
                  <el-descriptions-item label="重试时间">{{ dnsResult.soa.retry }}</el-descriptions-item>
                  <el-descriptions-item label="过期时间">{{ dnsResult.soa.expire }}</el-descriptions-item>
                  <el-descriptions-item label="TTL">{{ dnsResult.soa.ttl }}</el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div v-if="!hasRecords" class="no-records">
                <el-empty description="未找到任何DNS记录" />
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <div class="info-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><InfoFilled /></el-icon>
            </span>
            <span class="title">工具说明</span>
          </div>
          
          <div class="panel-body">
            <div class="help-content">
              <h3>什么是域名查询?</h3>
              <p>
                域名查询工具能够帮助您检索域名的DNS记录和解析信息，可用于网站维护、网络故障排查或教育目的。
              </p>
              
              <h3>DNS记录类型</h3>
              <ul>
                <li><strong>A记录</strong>: 将域名映射到IPv4地址</li>
                <li><strong>AAAA记录</strong>: 将域名映射到IPv6地址</li>
                <li><strong>MX记录</strong>: 指定接收邮件的服务器</li>
                <li><strong>NS记录</strong>: 指定域名的域名服务器</li>
                <li><strong>TXT记录</strong>: 存储文本信息，常用于域名验证和SPF记录</li>
                <li><strong>CNAME记录</strong>: 创建域名别名，指向另一个域名</li>
                <li><strong>SOA记录</strong>: 指定权威性DNS信息，如管理员邮箱、刷新间隔等</li>
              </ul>
              
              <h3>使用方法</h3>
              <ol>
                <li>在输入框中输入要查询的域名</li>
                <li>选择要查询的DNS记录类型（或选择"所有记录"）</li>
                <li>点击"查询域名信息"按钮</li>
                <li>查看查询结果</li>
              </ol>
              
              <h3>注意事项</h3>
              <p>
                由于该工具通过模拟实现，查询结果仅供参考。
                在实际应用中，DNS查询结果可能因DNS缓存、CDN、地区差异等因素而有所不同。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Document, Refresh, InfoFilled } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const domain = ref('');
const queryType = ref('ALL');
const validationError = ref('');
const loading = ref(false);
const recentSearches = ref<string[]>([]);

// DNS查询结果
type DNSRecord = {
  domain: string;
  resolvable: boolean;
  error?: string;
  a?: { ip: string; ttl: number }[];
  aaaa?: { ip: string; ttl: number }[];
  mx?: { exchange: string; priority: number; ttl: number }[];
  ns?: { nameserver: string; ttl: number }[];
  txt?: { text: string; ttl: number }[];
  cname?: { target: string; ttl: number }[];
  soa?: {
    primary: string;
    admin: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    ttl: number;
  };
};

const dnsResult = ref<DNSRecord | null>(null);

// 判断是否有任何记录
const hasRecords = computed(() => {
  if (!dnsResult.value) return false;
  
  return (
    (dnsResult.value.a && dnsResult.value.a.length > 0) ||
    (dnsResult.value.aaaa && dnsResult.value.aaaa.length > 0) ||
    (dnsResult.value.mx && dnsResult.value.mx.length > 0) ||
    (dnsResult.value.ns && dnsResult.value.ns.length > 0) ||
    (dnsResult.value.txt && dnsResult.value.txt.length > 0) ||
    (dnsResult.value.cname && dnsResult.value.cname.length > 0) ||
    dnsResult.value.soa !== undefined
  );
});

// 初始化组件
// 从本地存储加载最近查询
const initComponent = () => {
  const savedSearches = localStorage.getItem('recentDomainLookups');
  if (savedSearches) {
    try {
      recentSearches.value = JSON.parse(savedSearches);
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }
};

// 在组件挂载时执行初始化
initComponent();

// 验证域名
const validateDomain = (): boolean => {
  if (!domain.value.trim()) {
    validationError.value = '请输入域名';
    return false;
  }
  
  // 域名验证正则表达式
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  if (!domainRegex.test(domain.value)) {
    validationError.value = '请输入有效的域名';
    return false;
  }
  
  validationError.value = '';
  return true;
};

// 保存最近查询
const saveRecentSearch = (query: string) => {
  // 如果已经存在，则删除旧的
  const index = recentSearches.value.indexOf(query);
  if (index !== -1) {
    recentSearches.value.splice(index, 1);
  }
  
  // 添加到数组前面
  recentSearches.value.unshift(query);
  
  // 保持最近查询列表不超过5个
  if (recentSearches.value.length > 5) {
    recentSearches.value = recentSearches.value.slice(0, 5);
  }
  
  // 保存到本地存储
  localStorage.setItem('recentDomainLookups', JSON.stringify(recentSearches.value));
};

// 选择最近查询
const selectRecentSearch = (query: string) => {
  domain.value = query;
  lookupDomain();
};

// 移除最近查询
const removeRecentSearch = (index: number) => {
  recentSearches.value.splice(index, 1);
  localStorage.setItem('recentDomainLookups', JSON.stringify(recentSearches.value));
};

// 重置表单
const resetForm = () => {
  domain.value = '';
  queryType.value = 'ALL';
  validationError.value = '';
  dnsResult.value = null;
};

// 查询域名信息
const lookupDomain = async () => {
  if (!validateDomain()) return;
  
  loading.value = true;
  
  try {
    // 这里应该是实际的API调用，这里用模拟数据演示
    // const response = await fetch(`https://api.example.com/dns/${domain.value}?type=${queryType.value}`);
    // const data = await response.json();
    
    // 模拟API响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 构建模拟响应数据
    const mockResult: DNSRecord = {
      domain: domain.value,
      resolvable: true
    };
    
    // 根据查询类型生成模拟数据
    if (queryType.value === 'ALL' || queryType.value === 'A') {
      mockResult.a = [
        { ip: '192.0.2.1', ttl: 3600 },
        { ip: '192.0.2.2', ttl: 3600 }
      ];
    }
    
    if (queryType.value === 'ALL' || queryType.value === 'AAAA') {
      mockResult.aaaa = [
        { ip: '2001:db8::1', ttl: 3600 }
      ];
    }
    
    if (queryType.value === 'ALL' || queryType.value === 'MX') {
      mockResult.mx = [
        { exchange: 'mail1.' + domain.value, priority: 10, ttl: 3600 },
        { exchange: 'mail2.' + domain.value, priority: 20, ttl: 3600 }
      ];
    }
    
    if (queryType.value === 'ALL' || queryType.value === 'NS') {
      mockResult.ns = [
        { nameserver: 'ns1.' + domain.value, ttl: 86400 },
        { nameserver: 'ns2.' + domain.value, ttl: 86400 }
      ];
    }
    
    if (queryType.value === 'ALL' || queryType.value === 'TXT') {
      mockResult.txt = [
        { text: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 },
        { text: 'google-site-verification=abcdefghijklmnopqrstuvwxyz', ttl: 3600 }
      ];
    }
    
    if (queryType.value === 'ALL' || queryType.value === 'CNAME') {
      if (domain.value.startsWith('www.')) {
        const rootDomain = domain.value.substring(4);
        mockResult.cname = [
          { target: rootDomain, ttl: 3600 }
        ];
      } else {
        mockResult.cname = [];
      }
    }
    
    if (queryType.value === 'ALL' || queryType.value === 'SOA') {
      mockResult.soa = {
        primary: 'ns1.' + domain.value,
        admin: 'admin.' + domain.value,
        serial: 2023121401,
        refresh: 7200,
        retry: 3600,
        expire: 1209600,
        ttl: 3600
      };
    }
    
    // 如果是特定查询类型但没有找到记录，显示提示
    if (queryType.value !== 'ALL' && !hasSpecificRecords(mockResult, queryType.value)) {
      mockResult.error = `未找到 ${queryType.value} 类型的记录`;
    }
    
    dnsResult.value = mockResult;
    saveRecentSearch(domain.value);
    
    ElMessage.success('域名查询成功');
  } catch (error) {
    ElMessage.error('查询失败: ' + (error as Error).message);
    dnsResult.value = {
      domain: domain.value,
      resolvable: false,
      error: '查询过程中发生错误: ' + (error as Error).message
    };
  } finally {
    loading.value = false;
  }
};

// 判断是否有特定类型的记录
const hasSpecificRecords = (result: DNSRecord, type: string): boolean => {
  switch (type) {
    case 'A': 
      return result.a !== undefined && result.a.length > 0;
    case 'AAAA': 
      return result.aaaa !== undefined && result.aaaa.length > 0;
    case 'MX': 
      return result.mx !== undefined && result.mx.length > 0;
    case 'NS': 
      return result.ns !== undefined && result.ns.length > 0;
    case 'TXT': 
      return result.txt !== undefined && result.txt.length > 0;
    case 'CNAME': 
      return result.cname !== undefined && result.cname.length > 0;
    case 'SOA': 
      return result.soa !== undefined;
    default: 
      return false;
  }
};

// 复制结果
const copyResults = async () => {
  if (!dnsResult.value) return;
  
  let text = `域名: ${dnsResult.value.domain}\n状态: ${dnsResult.value.resolvable ? '可解析' : '不可解析'}\n\n`;
  
  if (dnsResult.value.error) {
    text += `错误: ${dnsResult.value.error}\n`;
  } else {
    if (dnsResult.value.a && dnsResult.value.a.length > 0) {
      text += `A记录 (IPv4):\n`;
      dnsResult.value.a.forEach(record => {
        text += `- ${record.ip} (TTL: ${record.ttl})\n`;
      });
      text += '\n';
    }
    
    if (dnsResult.value.aaaa && dnsResult.value.aaaa.length > 0) {
      text += `AAAA记录 (IPv6):\n`;
      dnsResult.value.aaaa.forEach(record => {
        text += `- ${record.ip} (TTL: ${record.ttl})\n`;
      });
      text += '\n';
    }
    
    if (dnsResult.value.mx && dnsResult.value.mx.length > 0) {
      text += `MX记录 (邮件服务器):\n`;
      dnsResult.value.mx.forEach(record => {
        text += `- ${record.exchange} (优先级: ${record.priority}, TTL: ${record.ttl})\n`;
      });
      text += '\n';
    }
    
    if (dnsResult.value.ns && dnsResult.value.ns.length > 0) {
      text += `NS记录 (域名服务器):\n`;
      dnsResult.value.ns.forEach(record => {
        text += `- ${record.nameserver} (TTL: ${record.ttl})\n`;
      });
      text += '\n';
    }
    
    if (dnsResult.value.txt && dnsResult.value.txt.length > 0) {
      text += `TXT记录:\n`;
      dnsResult.value.txt.forEach(record => {
        text += `- ${record.text} (TTL: ${record.ttl})\n`;
      });
      text += '\n';
    }
    
    if (dnsResult.value.cname && dnsResult.value.cname.length > 0) {
      text += `CNAME记录:\n`;
      dnsResult.value.cname.forEach(record => {
        text += `- ${record.target} (TTL: ${record.ttl})\n`;
      });
      text += '\n';
    }
    
    if (dnsResult.value.soa) {
      text += `SOA记录:\n`;
      text += `- 主域名服务器: ${dnsResult.value.soa.primary}\n`;
      text += `- 管理员邮箱: ${dnsResult.value.soa.admin}\n`;
      text += `- 序列号: ${dnsResult.value.soa.serial}\n`;
      text += `- 刷新时间: ${dnsResult.value.soa.refresh}\n`;
      text += `- 重试时间: ${dnsResult.value.soa.retry}\n`;
      text += `- 过期时间: ${dnsResult.value.soa.expire}\n`;
      text += `- TTL: ${dnsResult.value.soa.ttl}\n`;
    }
  }
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};
</script>

<style scoped>
.domain-lookup-container {
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

.lookup-section {
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
  border-bottom: 1px solid var(--el-border-color-lighter);
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
  margin-bottom: 8px;
  font-weight: 500;
}

.error-message {
  font-size: 12px;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.lookup-button {
  flex: 2;
}

.reset-button {
  flex: 1;
}

.section-divider {
  height: 1px;
  background-color: var(--el-border-color-lighter);
  margin: 20px 0;
}

.recent-searches {
  margin-top: 12px;
}

.recent-title {
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 500;
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-tag {
  cursor: pointer;
}

.search-tag:hover {
  border-color: var(--el-color-primary-light-5);
}

/* 深色模式样式 */
:root.dark .search-tag {
  background-color: var(--el-fill-color-dark, #2a2a2a);
  border-color: var(--el-border-color-darker);
}

:root.dark .search-tag:hover {
  background-color: var(--el-fill-color-darker, #333);
  border-color: var(--el-color-primary-light-5);
}

.domain-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.domain-title {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.domain-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-valid {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.status-invalid {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.error-block {
  margin-bottom: 20px;
}

.record-section {
  margin-bottom: 24px;
}

.record-type {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.record-type::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: var(--el-color-primary);
  margin-right: 8px;
  border-radius: 2px;
}

.no-records {
  margin: 40px 0;
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

.help-content ul, .help-content ol {
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

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .domain-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .domain-status {
    align-self: flex-start;
  }
}
</style> 