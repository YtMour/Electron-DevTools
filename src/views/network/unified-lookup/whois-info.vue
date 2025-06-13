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

      <!-- 域名分析 -->
      <div class="whois-section">
        <div class="section-head">
          <el-icon class="section-icon"><DataAnalysis /></el-icon>
          域名分析
        </div>
        <div class="analysis-grid">
          <div class="analysis-item">
            <div class="analysis-label">域名年龄</div>
            <div class="analysis-value">
              <el-tag :type="getDomainAgeType(domainAge)" effect="light">
                {{ domainAge }}
              </el-tag>
            </div>
          </div>

          <div class="analysis-item">
            <div class="analysis-label">到期状态</div>
            <div class="analysis-value">
              <el-tag :type="getExpirationStatusType()" effect="light">
                {{ getExpirationStatus() }}
              </el-tag>
            </div>
          </div>

          <div class="analysis-item">
            <div class="analysis-label">DNS 服务器数量</div>
            <div class="analysis-value">
              <el-tag type="info" effect="light">
                {{ whois.nameServers?.length || 0 }} 个
              </el-tag>
            </div>
          </div>

          <div class="analysis-item">
            <div class="analysis-label">域名状态数量</div>
            <div class="analysis-value">
              <el-tag type="info" effect="light">
                {{ whois.status?.length || 0 }} 个
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作工具 -->
      <div class="whois-section">
        <div class="section-head">
          <el-icon class="section-icon"><Tools /></el-icon>
          操作工具
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="exportWhoisData" :icon="Download">
            导出数据
          </el-button>
          <el-button type="success" @click="copyAllData" :icon="CopyDocument">
            复制全部
          </el-button>
          <el-button type="info" @click="checkDomainSecurity" :icon="Lock">
            安全检查
          </el-button>
          <el-button type="warning" @click="showDomainHistory" :icon="Clock">
            历史记录
          </el-button>
        </div>
      </div>

      <!-- 安全信息 -->
      <div class="whois-section" v-if="securityInfo">
        <div class="section-head">
          <el-icon class="section-icon"><Lock /></el-icon>
          安全信息
        </div>
        <div class="security-grid">
          <div class="security-item" v-for="(item, key) in securityInfo" :key="key">
            <div class="security-label">{{ getSecurityLabel(key) }}</div>
            <div class="security-value">
              <el-tag :type="item.type" effect="light">
                {{ item.value }}
              </el-tag>
            </div>
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
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Connection,
  InfoFilled,
  Flag,
  User,
  CopyDocument,
  DataAnalysis,
  Tools,
  Download,
  Lock,
  Clock
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

// 响应式数据
const securityInfo = ref<Record<string, { value: string; type: string }> | null>(null)

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

// 域名年龄计算
const domainAge = computed(() => {
  if (!props.whois?.creationDate) return '未知'

  try {
    const creationDate = new Date(props.whois.creationDate)
    const now = new Date()
    const diffTime = now.getTime() - creationDate.getTime()
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365))
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))

    if (diffYears > 0) {
      return `${diffYears}年${diffMonths > 0 ? diffMonths + '个月' : ''}`
    } else if (diffMonths > 0) {
      return `${diffMonths}个月`
    } else {
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays}天`
    }
  } catch (error) {
    return '未知'
  }
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

// 新增方法
const getDomainAgeType = (age: string): 'success' | 'warning' | 'danger' | 'info' => {
  if (age === '未知') return 'info'

  const years = parseInt(age.match(/(\d+)年/)?.[1] || '0')
  if (years >= 5) return 'success'
  if (years >= 2) return 'warning'
  return 'danger'
}

const getExpirationStatusType = (): 'success' | 'warning' | 'danger' | 'info' => {
  if (isExpired.value) return 'danger'
  if (isExpiringSoon.value) return 'warning'
  return 'success'
}

const getExpirationStatus = (): string => {
  if (isExpired.value) return '已过期'
  if (isExpiringSoon.value) return '即将过期'
  return '正常'
}

const exportWhoisData = () => {
  if (!props.whois) return

  const data = {
    domain: props.whois.domainName,
    registrar: props.whois.registrar,
    creationDate: props.whois.creationDate,
    expirationDate: props.whois.expirationDate,
    updatedDate: props.whois.updatedDate,
    status: props.whois.status,
    nameServers: props.whois.nameServers,
    registrant: {
      name: props.whois.registrantName,
      organization: props.whois.registrantOrganization,
      email: props.whois.registrantEmail
    },
    analysis: {
      domainAge: domainAge.value,
      expirationStatus: getExpirationStatus(),
      nameServerCount: props.whois.nameServers?.length || 0,
      statusCount: props.whois.status?.length || 0
    },
    exportTime: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `whois-${props.whois.domainName || 'domain'}-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('Whois 数据导出成功')
}

const copyAllData = async () => {
  if (!props.whois) return

  const text = `域名信息 - ${props.whois.domainName}

基本信息:
- 域名: ${props.whois.domainName || '未知'}
- 注册商: ${props.whois.registrar || '未知'}
- 创建日期: ${formatDate(props.whois.creationDate)}
- 到期日期: ${formatDate(props.whois.expirationDate)}
- 更新日期: ${formatDate(props.whois.updatedDate)}
- Whois服务器: ${props.whois.whoisServer || '未知'}

域名状态:
${props.whois.status?.map(s => `- ${formatStatus(s)}`).join('\n') || '无'}

域名服务器:
${props.whois.nameServers?.map(ns => `- ${ns}`).join('\n') || '无'}

注册人信息:
- 名称: ${props.whois.registrantName || '未知'}
- 组织: ${props.whois.registrantOrganization || '未知'}
- 邮箱: ${props.whois.registrantEmail || '未知'}

域名分析:
- 域名年龄: ${domainAge.value}
- 到期状态: ${getExpirationStatus()}
- DNS服务器数量: ${props.whois.nameServers?.length || 0}个
- 域名状态数量: ${props.whois.status?.length || 0}个

导出时间: ${new Date().toLocaleString('zh-CN')}`

  try {
    await copy(text)
    ElMessage.success('所有数据已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const checkDomainSecurity = () => {
  if (!props.whois) return

  const security: Record<string, { value: string; type: string }> = {}

  // 检查域名年龄
  const years = parseInt(domainAge.value.match(/(\d+)年/)?.[1] || '0')
  security.domainAge = {
    value: years >= 2 ? '安全' : '风险',
    type: years >= 2 ? 'success' : 'warning'
  }

  // 检查到期状态
  security.expiration = {
    value: isExpired.value ? '已过期' : isExpiringSoon.value ? '即将过期' : '正常',
    type: isExpired.value ? 'danger' : isExpiringSoon.value ? 'warning' : 'success'
  }

  // 检查隐私保护
  security.privacy = {
    value: hasMaskedInfo.value ? '已启用' : '未启用',
    type: hasMaskedInfo.value ? 'success' : 'info'
  }

  // 检查DNS配置
  const nsCount = props.whois.nameServers?.length || 0
  security.dns = {
    value: nsCount >= 2 ? '正常' : '配置不足',
    type: nsCount >= 2 ? 'success' : 'warning'
  }

  securityInfo.value = security
  ElMessage.success('安全检查完成')
}

const showDomainHistory = () => {
  ElMessageBox.alert(
    '域名历史记录功能需要连接到外部API服务。此功能将在后续版本中提供。',
    '功能提示',
    {
      confirmButtonText: '确定',
      type: 'info'
    }
  )
}

const getSecurityLabel = (key: string): string => {
  const labels: Record<string, string> = {
    domainAge: '域名年龄',
    expiration: '到期状态',
    privacy: '隐私保护',
    dns: 'DNS配置'
  }
  return labels[key] || key
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

/* 新增样式 */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
}

.analysis-item:hover {
  border-color: var(--el-border-color-light);
  transform: translateY(-2px);
}

.analysis-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.analysis-value {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-buttons .el-button {
  border-radius: 8px;
  font-weight: 500;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.security-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
}

.security-item:hover {
  border-color: var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.security-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.security-value {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .analysis-grid,
  .security-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .whois-section {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color-dark);
  }

  .detail-item,
  .analysis-item,
  .security-item {
    background: var(--el-bg-color);
    border-color: var(--el-border-color-dark);
  }

  .nameserver-item {
    background-color: var(--el-fill-color-dark);
    border-color: var(--el-border-color-dark);
  }
}
</style>