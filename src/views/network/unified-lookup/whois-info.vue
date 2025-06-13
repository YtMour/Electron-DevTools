<template>
  <div class="whois-info-container">
    <div v-if="whois && hasWhoisData" class="whois-content">
      <!-- 基本信息 -->
      <div class="whois-section">
        <div class="section-head">
          <el-icon class="section-icon"><InfoFilled /></el-icon>
          基本信息
        </div>
        <div class="detail-grid">
          <div class="detail-item" v-if="whois.domainName">
            <div class="detail-label">域名</div>
            <div class="detail-value highlight">
              {{ whois.domainName }}
              <el-button
                type="text"
                size="small"
                @click="copyToClipboard(whois.domainName)"
                class="copy-btn"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="detail-item" v-if="whois.registrar">
            <div class="detail-label">注册商</div>
            <div class="detail-value">{{ whois.registrar }}</div>
          </div>

          <div class="detail-item" v-if="whois.creationDate">
            <div class="detail-label">创建日期</div>
            <div class="detail-value">
              {{ formatDate(whois.creationDate) }}
              <span class="date-relative">({{ getRelativeTime(whois.creationDate) }})</span>
            </div>
          </div>

          <div class="detail-item" v-if="whois.expirationDate">
            <div class="detail-label">到期日期</div>
            <div class="detail-value" :class="{'expired': isExpired, 'expiring-soon': isExpiringSoon}">
              {{ formatDate(whois.expirationDate) }}
              <span class="date-relative">({{ getRelativeTime(whois.expirationDate) }})</span>
              <el-tag v-if="isExpired" type="danger" size="small" class="status-tag">已过期</el-tag>
              <el-tag v-else-if="isExpiringSoon" type="warning" size="small" class="status-tag">即将过期</el-tag>
            </div>
          </div>

          <div class="detail-item" v-if="whois.updatedDate">
            <div class="detail-label">更新日期</div>
            <div class="detail-value">
              {{ formatDate(whois.updatedDate) }}
              <span class="date-relative">({{ getRelativeTime(whois.updatedDate) }})</span>
            </div>
          </div>

          <div class="detail-item" v-if="whois.whoisServer">
            <div class="detail-label">Whois服务器</div>
            <div class="detail-value">{{ whois.whoisServer }}</div>
          </div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div class="whois-section" v-if="whois.status && whois.status.length">
        <div class="section-head">
          <el-icon class="section-icon"><Flag /></el-icon>
          域名状态
        </div>
        <div class="status-tags">
          <el-tag
            v-for="(status, index) in whois.status"
            :key="index"
            :type="getStatusType(status)"
            class="status-tag"
            effect="light"
          >
            {{ formatStatus(status) }}
          </el-tag>
        </div>
      </div>

      <!-- 域名服务器 -->
      <div class="whois-section" v-if="whois.nameServers && whois.nameServers.length">
        <div class="section-head">
          <el-icon class="section-icon"><Connection /></el-icon>
          域名服务器
        </div>
        <div class="nameservers-list">
          <div
            v-for="(ns, index) in whois.nameServers"
            :key="index"
            class="nameserver-item"
          >
            <el-icon class="ns-icon"><Connection /></el-icon>
            <span class="ns-name">{{ ns }}</span>
            <el-button
              type="text"
              size="small"
              @click="copyToClipboard(ns)"
              class="copy-btn"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 注册人信息 -->
      <div class="whois-section" v-if="hasRegistrantInfo">
        <div class="section-head">
          <el-icon class="section-icon"><User /></el-icon>
          注册人信息
        </div>
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
          class="privacy-alert"
        >
          <template #default>
            <p>部分联系信息已被隐私保护服务隐藏或替换。这是正常的域名隐私保护措施。</p>
          </template>
        </el-alert>
      </div>
    </div>

    <el-empty
      v-else
      description="未找到 Whois 信息"
      :image-size="120"
      class="empty-state"
    >
      <template #description>
        <span class="empty-description">未找到 Whois 信息</span>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Connection,
  InfoFilled,
  Flag,
  User,
  CopyDocument
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import type { WhoisInfo } from '@/utils/network/domain-info'

// Props 定义
interface Props {
  whois?: WhoisInfo
}

const props = withDefaults(defineProps<Props>(), {
  whois: undefined
})

// 使用 VueUse 的剪贴板功能
const { copy } = useClipboard()

// 计算属性
const hasWhoisData = computed(() => {
  if (!props.whois) return false
  return Object.keys(props.whois).length > 0
})

const hasRegistrantInfo = computed(() => {
  if (!props.whois) return false
  return !!(
    props.whois.registrantName ||
    props.whois.registrantOrganization ||
    props.whois.registrantEmail
  )
})

const hasMaskedInfo = computed(() => {
  if (!props.whois) return false

  // 检查常见隐私保护邮箱模式
  const privacyPatterns = [
    /privacy/i,
    /protected/i,
    /redacted/i,
    /private/i,
    /proxy/i,
    /mask/i,
    /whoisguard/i,
    /domainprivacy/i
  ]

  const email = props.whois.registrantEmail || ''
  return privacyPatterns.some(pattern => pattern.test(email))
})

const isExpired = computed(() => {
  if (!props.whois?.expirationDate) return false

  const expDate = new Date(props.whois.expirationDate)
  return expDate < new Date()
})

const isExpiringSoon = computed(() => {
  if (!props.whois?.expirationDate || isExpired.value) return false

  const expDate = new Date(props.whois.expirationDate)
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  return expDate <= thirtyDaysFromNow
})

// 工具方法
const formatDate = (date?: string): string => {
  if (!date) return '未知'
  try {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.warn('Date formatting error:', error)
    return date
  }
}

const getRelativeTime = (date?: string): string => {
  if (!date) return ''
  try {
    const targetDate = new Date(date)
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '明天'
    if (diffDays === -1) return '昨天'
    if (diffDays > 0) return `${diffDays}天后`
    return `${Math.abs(diffDays)}天前`
  } catch (error) {
    console.warn('Relative time calculation error:', error)
    return ''
  }
}

const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const lowerStatus = status.toLowerCase()

  if (lowerStatus.includes('delete') || lowerStatus.includes('redempt')) {
    return 'danger'
  }

  if (lowerStatus.includes('prohibit') || lowerStatus.includes('lock')) {
    return 'warning'
  }

  if (lowerStatus.includes('ok') || lowerStatus.includes('active')) {
    return 'success'
  }

  return 'info'
}

const formatStatus = (status: string): string => {
  // 移除常见的前缀并格式化
  let formatted = status.replace(/^(client|server)/i, '').trim()

  // 首字母大写
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)

  // 替换常见的状态词
  const statusMap: Record<string, string> = {
    'TransferProhibited': '禁止转移',
    'UpdateProhibited': '禁止更新',
    'DeleteProhibited': '禁止删除',
    'RenewProhibited': '禁止续费',
    'Hold': '暂停',
    'Lock': '锁定',
    'Ok': '正常',
    'Active': '活跃'
  }

  return statusMap[formatted] || formatted
}

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await copy(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('Copy failed:', error)
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.whois-info-container {
  padding: 16px 0;
  max-width: 100%;
}

.whois-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.whois-section {
  margin-bottom: 32px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.whois-section:hover {
  border-color: var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--el-color-primary-light-8);
}

.section-icon {
  color: var(--el-color-primary);
  font-size: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--el-bg-color);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
}

.detail-item:hover {
  border-color: var(--el-border-color-light);
  transform: translateY(-1px);
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  word-break: break-word;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.detail-value.expired {
  color: var(--el-color-danger);
}

.detail-value.expiring-soon {
  color: var(--el-color-warning);
}

.detail-value.protected {
  color: var(--el-color-info);
  font-style: italic;
}

.date-relative {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.copy-btn {
  padding: 4px;
  margin-left: auto;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.copy-btn:hover {
  opacity: 1;
}

.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.status-tag {
  margin: 0;
  font-weight: 500;
  border-radius: 6px;
  padding: 6px 12px;
}

.nameservers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nameserver-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
}

.nameserver-item:hover {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color-light);
}

.ns-icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.ns-name {
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.privacy-notice {
  margin-top: 24px;
}

.privacy-alert {
  border-radius: 8px;
}

.empty-state {
  margin: 40px 0;
}

.empty-description {
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .whois-section {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color-dark);
  }

  .detail-item {
    background: var(--el-bg-color);
    border-color: var(--el-border-color-dark);
  }

  .nameserver-item {
    background-color: var(--el-fill-color-dark);
    border-color: var(--el-border-color-dark);
  }
}
</style>