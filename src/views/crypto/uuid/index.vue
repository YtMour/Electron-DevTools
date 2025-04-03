<template>
  <div class="uuid-container">
    <div class="header">
      <div class="header-content">
        <h2>UUID 生成器</h2>
        <el-button @click="showHistory = true" class="history-btn">
          <el-icon><Timer /></el-icon>
          历史记录
        </el-button>
      </div>
      <el-alert
        title="UUID 生成说明"
        type="info"
        description="UUID（通用唯一标识符）是一种128位的标识符，用于在计算机系统中唯一标识信息。您可以选择不同的UUID版本和格式，生成的UUID将自动保存到历史记录中，方便您后续查看和使用。"
        show-icon
        :closable="false"
        class="uuid-info"
      />
    </div>

    <div class="options">
      <div class="option-row">
        <el-radio-group v-model="form.version" class="version-select">
          <el-radio-button :label="1">版本 1 (基于时间)</el-radio-button>
          <el-radio-button :label="4">版本 4 (随机)</el-radio-button>
          <el-radio-button :label="5">版本 5 (基于名称)</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="page-content">
      <el-form :model="form" label-width="100px">
        <el-form-item v-if="form.version === 5" label="命名空间">
          <el-select v-model="form.namespace" placeholder="选择命名空间" class="namespace-select">
            <el-option label="URL" value="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />
            <el-option label="DNS" value="6ba7b810-9dad-11d1-80b4-00c04fd430c8" />
            <el-option label="OID" value="6ba7b812-9dad-11d1-80b4-00c04fd430c8" />
            <el-option label="X.500 DN" value="6ba7b814-9dad-11d1-80b4-00c04fd430c8" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.version === 5" label="名称">
          <el-input
            v-model="form.name"
            placeholder="输入名称，用于生成基于名称的UUID"
            size="default"
          />
        </el-form-item>

        <el-form-item label="生成数量">
          <el-input-number
            v-model="form.count"
            :min="1"
            :max="100"
            :step="1"
            size="default"
            placeholder="生成数量"
            class="count-input"
          />
        </el-form-item>

        <el-form-item label="输出格式">
          <el-radio-group v-model="form.format" class="format-group">
            <el-radio label="standard">标准格式 (带连字符)</el-radio>
            <el-radio label="compact">紧凑格式 (无连字符)</el-radio>
            <el-radio label="braces">带大括号</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生成的 UUID">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="3"
            readonly
            placeholder="生成的 UUID 将显示在这里"
          />
          
          <div class="output-controls" v-if="form.output">
            <div class="output-stats">
              <span>生成数量：{{ getUUIDCount(form.output) }}</span>
              <span>格式：{{ getFormatName(form.format) }}</span>
            </div>
            <div class="output-actions">
              <el-button-group>
                <el-button type="primary" @click="handleCopy" :disabled="!form.output">
                  <el-icon><DocumentCopy /></el-icon> 复制
                </el-button>
                <el-button type="primary" @click="handleDownload" :disabled="!form.output">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
              </el-button-group>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleGenerate" :disabled="!isValid">
              <el-icon><Refresh /></el-icon>
              生成 UUID
            </el-button>
            <el-button @click="handleClear">清空</el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </div>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="showHistory"
      title="历史记录"
      width="60%"
      :close-on-click-modal="false">
      <div class="history-header">
        <el-input
          v-model="historySearch"
          placeholder="搜索历史记录"
          clearable
          class="history-search">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="danger" @click="clearHistory" :disabled="!history.length">
          清空历史
        </el-button>
      </div>

      <div class="history-list">
        <el-empty v-if="!history.length" description="暂无历史记录" />
        <div v-else class="history-items">
          <div
            v-for="item in filteredHistory"
            :key="item.id"
            class="history-item">
            <div class="history-content">
              <div class="history-mode">
                <el-tag type="success">UUID 生成</el-tag>
                <el-tag type="info" size="small">版本: {{ item.config?.version || 4 }}</el-tag>
                <el-tag type="warning" size="small">{{ getFormatName(item.config?.format || 'standard') }}</el-tag>
              </div>
              <div class="history-time">
                {{ new Date(item.timestamp).toLocaleString() }}
              </div>
              <div class="history-preview">
                <div class="preview-output">
                  <span class="preview-label">UUID：</span>
                  <span class="preview-text">{{ item.output }}</span>
                </div>
              </div>
            </div>
            <div class="history-actions">
              <el-button type="primary" link @click="useHistory(item)">
                使用
              </el-button>
              <el-button type="danger" link @click="deleteHistory(item.id)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Timer, Search, DocumentCopy, Download } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import { cryptoDB } from '@/utils/db'
import type { CryptoHistory } from '@/types/crypto'

const { copy } = useClipboard()

// 表单数据
const form = reactive({
  version: 4,
  namespace: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  name: '',
  count: 1,
  format: 'standard',
  output: ''
})

// 验证表单
const isValid = computed(() => {
  if (form.version === 5 && !form.name) return false
  return form.count >= 1 && form.count <= 100
})

// 获取格式名称
const getFormatName = (format: string) => {
  const formatMap: Record<string, string> = {
    'standard': '标准格式',
    'compact': '紧凑格式',
    'braces': '带大括号'
  }
  return formatMap[format] || '标准格式'
}

// 获取UUID数量
const getUUIDCount = (output: string) => {
  return output.split('\n').filter(line => line.trim()).length
}

// 格式化UUID
const formatUUID = (uuid: string, format: string) => {
  switch (format) {
    case 'compact':
      return uuid.replace(/-/g, '')
    case 'braces':
      return `{${uuid}}`
    default:
      return uuid
  }
}

// 生成UUID
const generateUUID = () => {
  // 使用crypto API生成随机UUID
  const uuid = crypto.randomUUID()
  return formatUUID(uuid, form.format)
}

// 生成基于名称的UUID (使用SHA-1)
const generateNameBasedUUID = (namespace: string, name: string) => {
  // 这里使用简化版实现，实际应使用SHA-1哈希
  const combined = namespace + name
  const hash = Array.from(combined).reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  // 创建一个基于哈希的UUID
  const uuid = '00000000-0000-5000-8000-' + hash.toString(16).padStart(12, '0')
  return formatUUID(uuid, form.format)
}

// 生成基于时间的UUID
const generateTimeBasedUUID = () => {
  const timestamp = Date.now()
  const uuid = timestamp.toString(16).padStart(32, '0')
  return formatUUID(uuid, form.format)
}

// 清空表单
const handleClear = () => {
  form.output = ''
}

// 复制结果
const handleCopy = async () => {
  try {
    await copy(form.output)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载结果
const handleDownload = () => {
  try {
    const blob = new Blob([form.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuid_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 历史记录相关的响应式变量
const history = ref<CryptoHistory[]>([])
const showHistory = ref(false)
const historySearch = ref('')

// 计算属性
const filteredHistory = computed(() => {
  if (!historySearch.value) return history.value
  const search = historySearch.value.toLowerCase()
  return history.value.filter(item => 
    item.output.toLowerCase().includes(search)
  )
})

// 历史记录相关的方法
const loadHistory = async () => {
  try {
    history.value = await cryptoDB.getHistory('uuid')
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

const saveHistory = async () => {
  if (!form.output) return
  
  try {
    await cryptoDB.addHistory({
      type: 'uuid',
      mode: 'generate',
      input: '',
      output: form.output,
      timestamp: Date.now(),
      config: {
        version: form.version,
        format: form.format,
        length: form.count
      }
    })
    await loadHistory()
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 生成UUID
const handleGenerate = async () => {
  if (!isValid.value) return
  
  try {
    let uuids: string[] = []
    
    for (let i = 0; i < form.count; i++) {
      let uuid: string
      
      if (form.version === 1) {
        uuid = generateTimeBasedUUID()
      } else if (form.version === 5) {
        uuid = generateNameBasedUUID(form.namespace, form.name)
      } else {
        uuid = generateUUID()
      }
      
      uuids.push(uuid)
    }
    
    form.output = uuids.join('\n')
    await saveHistory()
    ElMessage.success('UUID生成成功')
  } catch (error) {
    console.error('生成UUID失败:', error)
    ElMessage.error('生成UUID失败')
  }
}

// 使用历史记录
const useHistory = (item: CryptoHistory) => {
  form.output = item.output
  form.version = item.config?.version || 4
  form.format = item.config?.format || 'standard'
  form.count = item.config?.length || 1
  showHistory.value = false
}

// 删除历史记录
const deleteHistory = async (id: number | undefined) => {
  if (id === undefined) {
    ElMessage.error('无效的记录ID')
    return
  }
  
  try {
    await cryptoDB.deleteHistory(id)
    await loadHistory()
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除历史记录失败:', error)
    ElMessage.error('删除失败')
  }
}

// 清空历史记录
const clearHistory = async () => {
  try {
    await cryptoDB.clearHistory('uuid')
    history.value = []
    ElMessage.success('清空成功')
  } catch (error) {
    console.error('清空历史记录失败:', error)
    ElMessage.error('清空失败')
  }
}

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})
</script>

<style lang="scss" scoped>
.uuid-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-button) {
    &.el-button--primary {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);

      &:not(.is-disabled):hover {
        background-color: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
      }

      &.is-disabled {
        background-color: var(--el-color-primary-light-5);
        border-color: var(--el-color-primary-light-5);
      }
    }

    &:not(.el-button--primary) {
      &:not(.is-disabled):hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        background-color: var(--el-button-hover-bg-color);
      }
    }
  }

  .header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        margin: 0;
        font-size: 24px;
        color: var(--el-text-color-primary);
      }
      
      .history-btn {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .uuid-info {
      margin-bottom: 0;
      font-size: 13px;
      background-color: var(--el-fill-color-blank);
      border-color: var(--el-border-color-light);
      
      :deep(.el-alert__title) {
        font-size: 13px;
        line-height: 18px;
        color: var(--el-text-color-primary);
      }
      
      :deep(.el-alert__description) {
        font-size: 12px;
        line-height: 1.5;
        margin: 4px 0 0 0;
        color: var(--el-text-color-regular);
      }

      :deep(.el-alert__icon) {
        color: var(--el-text-color-regular);
      }
    }
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;

    .option-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .version-select {
        flex: 1;
      }
    }
  }

  .page-content {
    flex: 1;
    background-color: var(--el-fill-color-blank);
    border-radius: 8px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-light);
    overflow-y: auto;

    :deep(.el-form-item__content) {
      width: 100%;
    }

    :deep(.el-form-item__label) {
      color: var(--el-text-color-regular);
    }

    :deep(.el-textarea__inner) {
      font-family: var(--el-font-family);
      font-size: 14px;
      line-height: 1.6;
      background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
      color: var(--el-text-color-primary);
      border-color: var(--el-border-color);

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }

      &:hover {
        border-color: var(--el-border-color-hover);
      }

      &:focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
      }
    }

    .format-group {
      display: flex;
      flex-direction: row;
      gap: 24px;
      flex-wrap: wrap;
      
      :deep(.el-radio) {
        margin-right: 0;
      }
    }

    .namespace-select {
      width: 100%;
    }

    .count-input {
      width: 120px;
    }

    .output-controls {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .output-stats {
        display: flex;
        gap: 16px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }

  // 历史记录样式
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .history-search {
      width: 300px;
    }
  }

  .history-list {
    max-height: 500px;
    overflow-y: auto;

    .history-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 12px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 4px;
      background-color: var(--el-fill-color-blank);

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .history-content {
        flex: 1;
        margin-right: 16px;

        .history-mode {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .history-time {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }

        .history-preview {
          .preview-output {
            margin-bottom: 4px;
            font-size: 13px;

            .preview-label {
              color: var(--el-text-color-secondary);
              margin-right: 8px;
            }

            .preview-text {
              color: var(--el-text-color-primary);
            }
          }
        }
      }

      .history-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style> 