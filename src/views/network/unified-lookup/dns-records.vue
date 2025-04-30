<template>
  <div class="dns-records-container">
    <div v-if="dns && Object.keys(dns).length > 0" class="dns-records">
      <div v-for="(records, type) in dns" :key="type" class="dns-type">
        <div class="type-header">
          <el-tag :type="getDnsTagType(type)" effect="dark" size="medium">
            {{ type.toUpperCase() }}
          </el-tag>
          <span class="record-count">{{ records.length }} 条记录</span>
        </div>
        
        <div class="records-table">
          <el-table :data="records" stripe border>
            <el-table-column prop="name" label="名称" min-width="180" />
            <el-table-column prop="value" label="值" min-width="220" />
            <el-table-column prop="ttl" label="TTL" width="100" align="center" />
          </el-table>
        </div>
      </div>
    </div>
    <el-empty v-else description="未找到DNS记录" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { DNSRecord } from '@/utils/network/domain-info';

export default defineComponent({
  name: 'DnsRecords',
  props: {
    dns: {
      type: Object as () => Record<string, DNSRecord[]> | undefined,
      required: false
    }
  },
  methods: {
    getDnsTagType(type: string): '' | 'success' | 'info' | 'warning' | 'danger' | 'primary' {
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
    }
  }
});
</script>

<style scoped>
.dns-records-container {
  padding: 12px 0;
}

.dns-type {
  margin-bottom: 24px;
}

.type-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.record-count {
  margin-left: 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.records-table {
  margin-bottom: 20px;
}
</style> 