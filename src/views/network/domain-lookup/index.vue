<template>
  <div class="network-tool-page">
    <div class="page-header">
      <div class="header-title">
        <h2>域名查询工具</h2>
        <p class="header-desc">查询域名的DNS记录，Whois信息和IP地址</p>
      </div>
    </div>

    <div class="page-content main-sidebar">
      <div class="main-content-left">
        <el-card class="network-card lookup-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><Search /></el-icon>
            </div>
            <div class="card-title">域名查询</div>
          </div>
          
          <div class="lookup-section">
            <div class="domain-input">
              <div class="option-label">域名</div>
              <el-input 
                v-model="domainName" 
                placeholder="请输入域名，如：example.com" 
                clearable
                :disabled="isLoading"
                @keyup.enter="performLookup"
              >
                <template #append>
                  <el-button @click="performLookup" :loading="isLoading">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
              <div class="validation-error" v-if="validationError">{{ validationError }}</div>
            </div>
            
            <div class="lookup-options">
              <div class="option-label">查询选项</div>
              <div class="option-selector">
                <div 
                  class="option-item" 
                  :class="{ active: activeTab === 'dns' }"
                  @click="activeTab = 'dns'"
                >
                  <el-icon><Connection /></el-icon>
                  DNS记录
                </div>
                <div 
                  class="option-item" 
                  :class="{ active: activeTab === 'whois' }"
                  @click="activeTab = 'whois'"
                >
                  <el-icon><InfoFilled /></el-icon>
                  Whois信息
                </div>
                <div 
                  class="option-item" 
                  :class="{ active: activeTab === 'ip' }"
                  @click="activeTab = 'ip'"
                >
                  <el-icon><Location /></el-icon>
                  IP地址
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="performLookup" :loading="isLoading">
                <el-icon><Search /></el-icon> 查询
              </el-button>
              <el-button @click="resetForm" :disabled="isLoading">
                <el-icon><Delete /></el-icon> 重置
              </el-button>
            </div>
          </div>
        </el-card>

        <el-card class="network-card result-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-title">查询结果</div>
            <div class="header-actions" v-if="hasResults">
              <el-button 
                type="primary" 
                plain 
                size="small" 
                @click="copyResults"
                class="copy-button"
              >
                <el-icon><CopyDocument /></el-icon>
                复制结果
              </el-button>
            </div>
          </div>
          
          <div class="result-content">
            <el-empty v-if="!hasResults && !isLoading" description="请输入域名并开始查询" />
            <el-skeleton :rows="10" animated v-else-if="isLoading" />
            
            <div v-else-if="hasResults">
              <div class="domain-summary">
                <div class="summary-item">
                  <span class="label">域名：</span>
                  <span class="value">{{ domainResults.domain }}</span>
                </div>
                <div class="summary-item" v-if="domainResults.resolvedIp">
                  <span class="label">解析IP：</span>
                  <span class="value">{{ domainResults.resolvedIp }}</span>
                </div>
              </div>
              
              <div class="result-tabs">
                <!-- DNS记录 -->
                <div v-if="activeTab === 'dns'" class="dns-results">
                  <div v-for="(records, type) in domainResults.dns" :key="type" class="dns-section">
                    <h4>{{ type.toUpperCase() }} 记录</h4>
                    <el-table :data="records" style="width: 100%">
                      <el-table-column prop="name" label="名称" min-width="180" />
                      <el-table-column prop="value" label="数据" min-width="220" />
                      <el-table-column prop="ttl" label="TTL" width="100" />
                    </el-table>
                  </div>
                  <el-empty v-if="!domainResults.dns || Object.keys(domainResults.dns).length === 0" description="未找到DNS记录" />
                </div>
                
                <!-- Whois信息 -->
                <div v-if="activeTab === 'whois'" class="whois-results">
                  <div class="whois-data" v-if="domainResults.whois">
                    <div v-for="(value, key) in domainResults.whois" :key="key" class="whois-item" v-if="value">
                      <div class="whois-label">{{ formatWhoisLabel(key) }}</div>
                      <div class="whois-value">{{ formatWhoisValue(value) }}</div>
                    </div>
                  </div>
                  <el-empty v-else description="未找到Whois信息" />
                </div>
                
                <!-- IP地址 -->
                <div v-if="activeTab === 'ip'" class="ip-results">
                  <div class="ip-data">
                    <div v-if="domainResults.ipInfo" class="ip-info">
                      <div class="ip-map" v-if="domainResults.ipInfo.location">
                        <img :src="getMapImageUrl(domainResults.ipInfo.location)" alt="IP位置地图" />
                      </div>
                      <div class="ip-details">
                        <div class="ip-item">
                          <span class="ip-label">IP地址:</span>
                          <span class="ip-value">{{ domainResults.ipInfo.ip }}</span>
                        </div>
                        <div class="ip-item" v-if="domainResults.ipInfo.country">
                          <span class="ip-label">位置:</span>
                          <span class="ip-value">{{ domainResults.ipInfo.country }}{{ domainResults.ipInfo.region ? ', ' + domainResults.ipInfo.region : '' }}{{ domainResults.ipInfo.city ? ', ' + domainResults.ipInfo.city : '' }}</span>
                        </div>
                        <div class="ip-item" v-if="domainResults.ipInfo.isp">
                          <span class="ip-label">ISP:</span>
                          <span class="ip-value">{{ domainResults.ipInfo.isp }}</span>
                        </div>
                        <div class="ip-item" v-if="domainResults.ipInfo.org">
                          <span class="ip-label">组织:</span>
                          <span class="ip-value">{{ domainResults.ipInfo.org }}</span>
                        </div>
                        <div class="ip-item" v-if="domainResults.ipInfo.asn">
                          <span class="ip-label">AS号:</span>
                          <span class="ip-value">{{ domainResults.ipInfo.asn }}</span>
                        </div>
                        <div class="ip-item" v-if="domainResults.ipInfo.timezone">
                          <span class="ip-label">时区:</span>
                          <span class="ip-value">{{ domainResults.ipInfo.timezone }}</span>
                        </div>
                        
                        <div class="security-section" v-if="domainResults.ipInfo.isProxy || domainResults.ipInfo.isVPN || domainResults.ipInfo.isTor || domainResults.ipInfo.isHosting">
                          <div class="section-title">安全信息</div>
                          <div class="security-item" v-if="domainResults.ipInfo.isProxy">
                            <el-tag type="danger">代理</el-tag>
                          </div>
                          <div class="security-item" v-if="domainResults.ipInfo.isVPN">
                            <el-tag type="danger">VPN</el-tag>
                          </div>
                          <div class="security-item" v-if="domainResults.ipInfo.isTor">
                            <el-tag type="danger">Tor</el-tag>
                          </div>
                          <div class="security-item" v-if="domainResults.ipInfo.isHosting">
                            <el-tag type="info">数据中心</el-tag>
                          </div>
                        </div>
                      </div>
                    </div>
                    <el-empty v-else description="未找到IP信息" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <el-card class="network-card info-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">域名查询指南</div>
        </div>
        
        <div class="help-content">
          <h4>DNS记录类型</h4>
          <ul>
            <li><strong>A记录:</strong> 将域名映射到IPv4地址</li>
            <li><strong>AAAA记录:</strong> 将域名映射到IPv6地址</li>
            <li><strong>CNAME记录:</strong> 创建域名别名，指向另一个域名</li>
            <li><strong>MX记录:</strong> 指定邮件服务器</li>
            <li><strong>TXT记录:</strong> 存储文本信息，常用于域名验证</li>
            <li><strong>NS记录:</strong> 指定域名服务器</li>
            <li><strong>SOA记录:</strong> 存储域名管理信息</li>
            <li><strong>SRV记录:</strong> 指定服务器提供特定服务的位置</li>
          </ul>
          
          <h4>Whois信息</h4>
          <p>Whois包含域名注册信息，如：</p>
          <ul>
            <li>注册商信息</li>
            <li>注册日期和到期日期</li>
            <li>域名服务器</li>
            <li>注册人联系信息（如可用）</li>
          </ul>
          
          <h4>IP地址查询</h4>
          <p>查看与域名关联的IP地址的地理位置和网络提供商信息。</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Connection, InfoFilled, Document, CopyDocument, Delete, Location } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import { lookupDomainInfo, DomainInfo, DNSRecord, WhoisInfo } from '@/utils/network/domain-info';
import { getMapUrl } from '@/utils/network/ip-info';

const { copy } = useClipboard();

// 表单数据
const domainName = ref('');
const validationError = ref('');
const activeTab = ref('dns');
const isLoading = ref(false);

// 查询结果
const domainResults = ref<DomainInfo>({
  domain: ''
});

// 是否有结果
const hasResults = computed(() => {
  return domainResults.value.domain !== '';
});

// 验证域名
const validateDomain = (): boolean => {
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  if (!domainName.value) {
    validationError.value = '请输入域名';
    return false;
  }
  
  if (!domainRegex.test(domainName.value)) {
    validationError.value = '请输入有效的域名';
    return false;
  }
  
  validationError.value = '';
  return true;
};

// 重置表单
const resetForm = () => {
  domainName.value = '';
  validationError.value = '';
  domainResults.value = {
    domain: ''
  };
};

// 格式化Whois标签
const formatWhoisLabel = (key: string): string => {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 格式化Whois值
const formatWhoisValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (value instanceof Date || typeof value === 'string' && !isNaN(Date.parse(value))) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('zh-CN');
    } catch {
      return String(value);
    }
  }
  
  return String(value);
};

// 获取地图URL
const getMapImageUrl = (location?: { latitude: number; longitude: number }) => {
  if (!location) return '';
  return getMapUrl(location.latitude, location.longitude, 6);
};

// 复制结果
const copyResults = () => {
  let text = `域名: ${domainResults.value.domain}\n`;
  text += domainResults.value.resolvedIp ? `解析IP: ${domainResults.value.resolvedIp}\n\n` : '';
  
  if (activeTab.value === 'dns' && domainResults.value.dns) {
    text += `DNS记录:\n`;
    for (const [type, records] of Object.entries(domainResults.value.dns)) {
      if (!records) continue;
      text += `${type.toUpperCase()} 记录:\n`;
      for (const record of records) {
        text += `  名称: ${record.name}, 数据: ${record.value}${record.ttl ? `, TTL: ${record.ttl}` : ''}\n`;
      }
      text += '\n';
    }
  } else if (activeTab.value === 'whois' && domainResults.value.whois) {
    text += `Whois信息:\n`;
    for (const [key, value] of Object.entries(domainResults.value.whois)) {
      if (value) {
        text += `${formatWhoisLabel(key)}: ${formatWhoisValue(value)}\n`;
      }
    }
  } else if (activeTab.value === 'ip' && domainResults.value.ipInfo) {
    const ip = domainResults.value.ipInfo;
    text += `IP信息:\n`;
    text += `IP地址: ${ip.ip}\n`;
    text += ip.country ? `位置: ${ip.country}${ip.region ? ', ' + ip.region : ''}${ip.city ? ', ' + ip.city : ''}\n` : '';
    text += ip.isp ? `ISP: ${ip.isp}\n` : '';
    text += ip.org ? `组织: ${ip.org}\n` : '';
    text += ip.timezone ? `时区: ${ip.timezone}\n` : '';
    text += ip.asn ? `AS号: ${ip.asn}\n` : '';
  }
  
  copy(text);
  ElMessage.success('查询结果已复制到剪贴板');
};

// 执行查询
const performLookup = async () => {
  if (!validateDomain()) return;
  
  isLoading.value = true;
  
  try {
    // 使用域名信息查询工具
    const result = await lookupDomainInfo(domainName.value);
    domainResults.value = result;
    
    ElMessage.success(`成功查询域名: ${domainName.value}`);
  } catch (error) {
    console.error('查询失败:', error);
    ElMessage.error('查询失败，请稍后重试');
  } finally {
    isLoading.value = false;
  }
};

// 初始化页面
</script>

<style lang="scss" scoped>
.main-content-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.domain-input {
  margin-bottom: 20px;
}

.lookup-options {
  margin-bottom: 20px;
}

.option-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.validation-error {
  color: var(--el-color-danger);
  font-size: 14px;
  margin-top: 6px;
}

.domain-summary {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  .summary-item {
    display: flex;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      font-weight: 600;
      min-width: 90px;
      color: var(--el-text-color-primary);
    }
    
    .value {
      font-family: var(--el-font-family-monospace, monospace);
    }
  }
}

.dns-section {
  margin-bottom: 24px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.whois-data {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  
  .whois-item {
    display: flex;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--el-border-color-lighter);
    
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    
    .whois-label {
      font-weight: 600;
      min-width: 160px;
      color: var(--el-text-color-primary);
    }
    
    .whois-value {
      flex: 1;
      word-break: break-word;
    }
  }
}

.ip-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .ip-map {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: auto;
      display: block;
    }
  }
  
  .ip-details {
    background: var(--el-fill-color-light);
    border-radius: 8px;
    padding: 16px;
    
    .ip-item {
      display: flex;
      margin-bottom: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .ip-label {
        font-weight: 600;
        min-width: 80px;
        color: var(--el-text-color-primary);
      }
      
      .ip-value {
        flex: 1;
      }
    }
  }
}

.security-section {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 15px;
}

.security-section .section-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.security-item {
  display: inline-block;
  margin-right: 10px;
  margin-bottom: 10px;
}

@media (max-width: 1200px) {
  .page-content {
    grid-template-columns: 1fr;
  }
  
  .ip-info {
    flex-direction: column;
    
    .ip-map {
      width: 100%;
    }
    
    .ip-details {
      width: 100%;
    }
  }
}

@media (min-width: 768px) {
  .ip-info {
    flex-direction: row;
    
    .ip-map, .ip-details {
      width: 48%;
    }
  }
}
</style> 