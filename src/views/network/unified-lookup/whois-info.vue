<template>
  <div class="whois-info-container">
    <div v-if="whois && hasWhoisData">
      <!-- 基本信息 -->
      <div class="whois-section">
        <div class="section-head">基本信息</div>
        <div class="detail-grid">
          <div class="detail-item" v-if="whois.domainName">
            <div class="detail-label">域名</div>
            <div class="detail-value highlight">{{ whois.domainName }}</div>
          </div>
          
          <div class="detail-item" v-if="whois.registrar">
            <div class="detail-label">注册商</div>
            <div class="detail-value">{{ whois.registrar }}</div>
          </div>
          
          <div class="detail-item" v-if="whois.creationDate">
            <div class="detail-label">创建日期</div>
            <div class="detail-value">{{ formatDate(whois.creationDate) }}</div>
          </div>
          
          <div class="detail-item" v-if="whois.expirationDate">
            <div class="detail-label">到期日期</div>
            <div class="detail-value" :class="{'expired': isExpired}">
              {{ formatDate(whois.expirationDate) }}
              <el-tag v-if="isExpired" type="danger" size="small">已过期</el-tag>
              <el-tag v-else-if="isExpiringSoon" type="warning" size="small">即将过期</el-tag>
            </div>
          </div>
          
          <div class="detail-item" v-if="whois.updatedDate">
            <div class="detail-label">更新日期</div>
            <div class="detail-value">{{ formatDate(whois.updatedDate) }}</div>
          </div>
          
          <div class="detail-item" v-if="whois.whoisServer">
            <div class="detail-label">Whois服务器</div>
            <div class="detail-value">{{ whois.whoisServer }}</div>
          </div>
        </div>
      </div>
      
      <!-- 状态信息 -->
      <div class="whois-section" v-if="whois.status && whois.status.length">
        <div class="section-head">域名状态</div>
        <div class="status-tags">
          <el-tag 
            v-for="(status, index) in whois.status" 
            :key="index"
            :type="getStatusType(status)"
            class="status-tag"
          >
            {{ formatStatus(status) }}
          </el-tag>
        </div>
      </div>
      
      <!-- 域名服务器 -->
      <div class="whois-section" v-if="whois.nameServers && whois.nameServers.length">
        <div class="section-head">域名服务器</div>
        <div class="nameservers-list">
          <div 
            v-for="(ns, index) in whois.nameServers" 
            :key="index"
            class="nameserver-item"
          >
            <el-icon><Connection /></el-icon>
            <span>{{ ns }}</span>
          </div>
        </div>
      </div>
      
      <!-- 注册人信息 -->
      <div class="whois-section" v-if="hasRegistrantInfo">
        <div class="section-head">注册人信息</div>
        <div class="contact-info">
          <div class="detail-item" v-if="whois.registrantName">
            <div class="detail-label">名称</div>
            <div class="detail-value">{{ whois.registrantName }}</div>
          </div>
          
          <div class="detail-item" v-if="whois.registrantOrganization">
            <div class="detail-label">组织</div>
            <div class="detail-value">{{ whois.registrantOrganization }}</div>
          </div>
          
          <div class="detail-item" v-if="whois.registrantEmail">
            <div class="detail-label">邮箱</div>
            <div class="detail-value protected">{{ whois.registrantEmail }}</div>
          </div>
        </div>
      </div>
      
      <!-- 隐私提示 -->
      <div class="privacy-notice" v-if="hasMaskedInfo">
        <el-alert
          title="隐私保护"
          type="info"
          show-icon
          :closable="false"
        >
          <p>部分联系信息已被隐私保护服务隐藏或替换。这是正常的域名隐私保护措施。</p>
        </el-alert>
      </div>
    </div>
    
    <el-empty v-else description="未找到Whois信息" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'; 
import { Connection } from '@element-plus/icons-vue';
import type { WhoisInfo } from '@/utils/network/domain-info';

export default defineComponent({
  name: 'WhoisInfo',
  props: {
    whois: {
      type: Object as () => WhoisInfo | undefined,
      required: false
    }
  },
  setup(props) {
    // 计算属性
    const hasWhoisData = computed(() => {
      if (!props.whois) return false;
      return Object.keys(props.whois).length > 0;
    });
    
    const hasRegistrantInfo = computed(() => {
      if (!props.whois) return false;
      return props.whois.registrantName || 
             props.whois.registrantOrganization || 
             props.whois.registrantEmail;
    });
    
    const hasMaskedInfo = computed(() => {
      if (!props.whois) return false;
      
      // 检查常见隐私保护邮箱模式
      const privacyPatterns = [
        /privacy/i, 
        /protected/i, 
        /redacted/i, 
        /private/i, 
        /proxy/i,
        /mask/i
      ];
      
      const email = props.whois.registrantEmail || '';
      return privacyPatterns.some(pattern => pattern.test(email));
    });
    
    const isExpired = computed(() => {
      if (!props.whois?.expirationDate) return false;
      
      const expDate = new Date(props.whois.expirationDate);
      return expDate < new Date();
    });
    
    const isExpiringSoon = computed(() => {
      if (!props.whois?.expirationDate || isExpired.value) return false;
      
      const expDate = new Date(props.whois.expirationDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      return expDate <= thirtyDaysFromNow;
    });

    // 方法
    const formatDate = (date?: string) => {
      if (!date) return '未知';
      try {
        return new Date(date).toLocaleDateString('zh-CN');
      } catch (e) {
        return date;
      }
    };
    
    const getStatusType = (status: string) => {
      status = status.toLowerCase();
      
      if (status.includes('delete') || status.includes('redempt')) {
        return 'danger';
      }
      
      if (status.includes('prohibit') || status.includes('lock')) {
        return 'warning';
      }
      
      if (status.includes('ok') || status.includes('active')) {
        return 'success';
      }
      
      return 'info';
    };
    
    const formatStatus = (status: string) => {
      // 移除常见的前缀
      status = status.replace(/^(client|server)/i, '');
      
      // 首字母大写
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return {
      hasWhoisData,
      hasRegistrantInfo,
      hasMaskedInfo,
      isExpired,
      isExpiringSoon,
      formatDate,
      getStatusType,
      formatStatus
    };
  }
});
</script>

<style scoped>
.whois-info-container {
  padding: 12px 0;
}

.whois-section {
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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

.detail-value.expired {
  color: var(--el-color-danger);
}

.detail-value.protected {
  color: var(--el-color-info);
  font-style: italic;
}

.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tag {
  margin: 0;
}

.nameservers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nameserver-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privacy-notice {
  margin-top: 24px;
}
</style> 