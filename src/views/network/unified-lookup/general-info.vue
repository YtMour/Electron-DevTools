<template>
  <div class="general-info-container">
    <!-- IP信息区域 -->
    <div v-if="ipInfo" class="ip-section">
      <div class="section-head">IP信息</div>
      <div class="details">
        <div class="detail-item">
          <div class="detail-label">IP地址</div>
          <div class="detail-value highlight">{{ ipInfo.ip }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">地理位置</div>
          <div class="detail-value" :class="{ 'empty': !ipInfo.country }">
            {{ formatLocation(ipInfo) }}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">ISP</div>
          <div class="detail-value" :class="{ 'empty': !ipInfo.isp }">
            {{ ipInfo.isp || '未知' }}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">组织</div>
          <div class="detail-value" :class="{ 'empty': !ipInfo.org }">
            {{ ipInfo.org || '未知' }}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">ASN</div>
          <div class="detail-value" :class="{ 'empty': !ipInfo.asn }">
            {{ ipInfo.asn || '未知' }}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">时区</div>
          <div class="detail-value" :class="{ 'empty': !ipInfo.timezone }">
            {{ ipInfo.timezone || '未知' }}
          </div>
        </div>
        <div class="detail-item" v-if="ipInfo.location">
          <div class="detail-label">经纬度</div>
          <div class="detail-value">
            {{ ipInfo.location.latitude }}, {{ ipInfo.location.longitude }}
          </div>
        </div>
      </div>
      
      <div class="security-section" v-if="hasSecurityInfo">
        <div class="section-head">安全信息</div>
        <div class="security-tags">
          <el-tag v-if="ipInfo.isProxy" type="danger" effect="dark">代理</el-tag>
          <el-tag v-if="ipInfo.isVPN" type="danger" effect="dark">VPN</el-tag>
          <el-tag v-if="ipInfo.isTor" type="danger" effect="dark">Tor网络</el-tag>
          <el-tag v-if="ipInfo.isHosting" type="info">数据中心</el-tag>
        </div>
      </div>
    </div>
    
    <!-- 域名信息区域 -->
    <div v-if="isDomain && domainInfo" class="domain-section">
      <div class="section-head">域名信息</div>
      <div class="details">
        <div class="detail-item">
          <div class="detail-label">域名</div>
          <div class="detail-value highlight">{{ domainInfo.domain }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">解析IP</div>
          <div class="detail-value" :class="{ 'empty': !domainInfo.resolvedIp }">
            {{ domainInfo.resolvedIp || '未解析' }}
          </div>
        </div>
        <div class="detail-item" v-if="domainInfo.whois">
          <div class="detail-label">注册商</div>
          <div class="detail-value" :class="{ 'empty': !domainInfo.whois.registrar }">
            {{ domainInfo.whois.registrar || '未知' }}
          </div>
        </div>
        <div class="detail-item" v-if="domainInfo.whois">
          <div class="detail-label">创建日期</div>
          <div class="detail-value" :class="{ 'empty': !domainInfo.whois.creationDate }">
            {{ formatDate(domainInfo.whois.creationDate) }}
          </div>
        </div>
        <div class="detail-item" v-if="domainInfo.whois">
          <div class="detail-label">到期日期</div>
          <div class="detail-value" :class="{ 'empty': !domainInfo.whois.expirationDate }">
            {{ formatDate(domainInfo.whois.expirationDate) }}
          </div>
        </div>
        <div class="detail-item" v-if="hasNameServers">
          <div class="detail-label">域名服务器</div>
          <div class="detail-value">
            {{ formatNameServers() }}
          </div>
        </div>
      </div>
      
      <div class="dns-summary" v-if="hasDnsRecords">
        <div class="section-head">DNS记录摘要</div>
        <div class="dns-types">
          <el-tag 
            v-for="(records, type) in domainInfo.dns" 
            :key="type"
            class="dns-type-tag"
            :type="getDnsTagType(String(type))"
          >
            {{ String(type).toUpperCase() }}: {{ records ? records.length : 0 }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 无数据显示 -->
    <el-empty v-if="!ipInfo && !domainInfo" description="没有查询数据"></el-empty>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import type { IPInfo } from '@/utils/network/ip-info';
import type { DomainInfo } from '@/utils/network/domain-info';

export default defineComponent({
  name: 'GeneralInfo',
  props: {
    ipInfo: {
      type: Object as () => IPInfo | undefined,
      required: false
    },
    domainInfo: {
      type: Object as () => DomainInfo | undefined,
      required: false
    },
    type: {
      type: String as () => 'ip' | 'domain' | undefined,
      required: false
    }
  },
  setup(props) {
    // 计算属性：是否为域名查询
    const isDomain = computed(() => props.type === 'domain');

    // 计算属性：是否有安全信息
    const hasSecurityInfo = computed(() => {
      if (!props.ipInfo) return false;
      return props.ipInfo.isProxy || props.ipInfo.isVPN || 
             props.ipInfo.isTor || props.ipInfo.isHosting;
    });

    // 计算属性：是否有DNS记录
    const hasDnsRecords = computed(() => {
      if (!props.domainInfo?.dns) return false;
      return Object.keys(props.domainInfo.dns).length > 0;
    });

    // 计算属性：是否有名称服务器
    const hasNameServers = computed(() => {
      if (!props.domainInfo?.whois?.nameServers) return false;
      return props.domainInfo.whois.nameServers.length > 0;
    });

    // 格式化地理位置信息
    const formatLocation = (info: IPInfo): string => {
      if (!info.country) return '未知';
      
      let location = info.country;
      if (info.region) location += `, ${info.region}`;
      if (info.city) location += `, ${info.city}`;
      
      return location;
    };

    // 格式化日期
    const formatDate = (dateStr?: string): string => {
      if (!dateStr) return '未知';
      
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN');
      } catch {
        return dateStr;
      }
    };

    // 格式化域名服务器
    const formatNameServers = (): string => {
      if (!props.domainInfo?.whois?.nameServers || 
          props.domainInfo.whois.nameServers.length === 0) {
        return '未知';
      }
      
      return props.domainInfo.whois.nameServers.slice(0, 3).join(', ') + 
             (props.domainInfo.whois.nameServers.length > 3 ? '...' : '');
    };

    // 获取DNS记录标签类型
    const getDnsTagType = (type: string): '' | 'success' | 'info' | 'warning' | 'danger' | 'primary' => {
      const typesMap: Record<string, '' | 'success' | 'info' | 'warning' | 'danger' | 'primary'> = {
        a: 'primary',
        aaaa: 'success',
        mx: 'warning',
        txt: 'info',
        ns: 'success',
        cname: 'warning',
        ptr: 'info',
        soa: 'danger',
        srv: 'warning'
      };
      
      return typesMap[type.toLowerCase()] || '';
    };

    return {
      isDomain,
      hasSecurityInfo,
      hasDnsRecords,
      hasNameServers,
      formatLocation,
      formatDate,
      formatNameServers,
      getDnsTagType
    };
  }
});
</script>

<style scoped>
.general-info-container {
  padding: 12px 0;
}

.ip-section, .domain-section, .security-section, .dns-summary {
  margin-bottom: 24px;
}

.section-head {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-value {
  font-size: 14px;
  word-break: break-word;
}

.detail-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.detail-value.empty {
  color: var(--el-text-color-disabled);
  font-style: italic;
}

.security-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dns-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dns-type-tag {
  min-width: 70px;
  text-align: center;
}
</style> 