<template>
  <div class="dns-records-container">
    <div v-if="hasDnsRecords">
      <div v-for="(records, type) in dns" :key="type" class="record-section">
        <div class="record-type">
          <el-tag :type="getDnsTagType(type)" effect="plain">{{ type.toUpperCase() }}</el-tag>
          <span class="record-count">{{ records?.length || 0 }} 条记录</span>
        </div>
        
        <el-table :data="records || []" stripe style="width: 100%" size="small" v-if="records?.length">
          <el-table-column prop="name" label="名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="value" label="值" min-width="200" show-overflow-tooltip />
          <el-table-column prop="ttl" label="TTL" width="100" align="right" />
          <el-table-column prop="priority" label="优先级" width="100" align="right" v-if="type.toLowerCase() === 'mx'" />
        </el-table>
        
        <el-empty v-else description="无记录" :image-size="60" />
      </div>
      
      <!-- DNS记录说明 -->
      <div class="dns-guide">
        <div class="guide-title">DNS记录说明</div>
        <el-collapse>
          <el-collapse-item title="A记录 - IPv4地址" name="a">
            <div class="guide-content">
              A记录将域名映射到IPv4地址，是最基本的DNS记录类型。
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="AAAA记录 - IPv6地址" name="aaaa">
            <div class="guide-content">
              AAAA记录将域名映射到IPv6地址，用于支持IPv6网络。
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="CNAME记录 - 别名" name="cname">
            <div class="guide-content">
              CNAME记录创建域名别名，将一个域名指向另一个域名。
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="MX记录 - 邮件服务器" name="mx">
            <div class="guide-content">
              MX记录指定负责接收邮件的服务器，优先级值越小越优先使用。
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="TXT记录 - 文本信息" name="txt">
            <div class="guide-content">
              TXT记录存储文本信息，通常用于域名验证、SPF和DKIM等。
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="NS记录 - 名称服务器" name="ns">
            <div class="guide-content">
              NS记录指定域名的DNS服务器，负责解析这个域名的DNS查询。
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="SOA记录 - 权威记录" name="soa">
            <div class="guide-content">
              SOA记录(起始授权记录)包含域名管理信息，如主DNS服务器、管理员邮箱、序列号等。
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    
    <el-empty v-else description="未找到DNS记录" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DNSRecord } from '@/utils/network/domain-info';

const props = defineProps<{
  dns?: Record<string, DNSRecord[] | undefined>;
}>();

// 计算属性：是否有DNS记录
const hasDnsRecords = computed(() => {
  if (!props.dns) return false;
  return Object.keys(props.dns).length > 0;
});

// 获取DNS记录标签类型
const getDnsTagType = (type: string): '' | 'success' | 'info' | 'warning' | 'danger' => {
  const typesMap: Record<string, '' | 'success' | 'info' | 'warning' | 'danger'> = {
    a: '',
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
</script>

<style scoped>
.dns-records-container {
  padding: 12px 0;
}

.record-section {
  margin-bottom: 24px;
}

.record-type {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.record-count {
  margin-left: 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.dns-guide {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color-light);
}

.guide-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.guide-content {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  font-size: 13px;
  padding: 8px;
}
</style> 