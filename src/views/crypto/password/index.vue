<template>
  <div class="password-generator">
    <div class="header">
      <div class="header-content">
        <h2>密码生成器</h2>
        <el-button @click="showHistory = true" class="history-btn">
          <el-icon><Timer /></el-icon>
          历史记录
        </el-button>
      </div>
      <el-alert
        title="密码生成说明"
        type="info"
        description="使用密码生成器可以生成符合特定要求的随机密码。您可以选择密码长度、包含的字符类型，以及是否包含特殊字符。生成的密码将自动保存到历史记录中，方便您后续查看和使用。"
        show-icon
        :closable="false"
        class="password-info"
      />
    </div>

    <div class="page-content">
      <el-form :model="form" label-width="100px">
        <el-form-item label="密码长度">
          <el-input-number
            v-model="form.length"
            :min="8"
            :max="64"
            :step="1"
            size="default"
            placeholder="密码长度"
            class="length-input"
          />
          <span class="length-tip">建议长度: 12-16位</span>
        </el-form-item>

        <el-form-item label="字符类型">
          <el-checkbox-group v-model="form.options" class="options-group">
            <el-checkbox label="uppercase">大写字母 (A-Z)</el-checkbox>
            <el-checkbox label="lowercase">小写字母 (a-z)</el-checkbox>
            <el-checkbox label="numbers">数字 (0-9)</el-checkbox>
            <el-checkbox label="symbols">特殊字符 (!@#$%^&*)</el-checkbox>
            <el-checkbox label="custom">自定义字符</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="form.options.includes('custom')" label="自定义字符">
          <el-input
            v-model="form.customChars"
            placeholder="输入自定义字符集，例如：!@#$%^&*"
            size="default"
          />
        </el-form-item>

        <el-form-item label="排除字符">
          <el-input
            v-model="form.exclude"
            placeholder="输入要排除的字符，例如：0O1l"
            size="default"
          />
        </el-form-item>

        <el-form-item label="生成的密码">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="2"
            readonly
            placeholder="生成的密码将显示在这里"
          />
          
          <div class="password-strength" v-if="form.output">
            <span class="strength-label">密码强度：</span>
            <span class="strength-value" :class="'strength-' + passwordStrength.status">
              {{ passwordStrength.text }}
            </span>
            <div class="strength-bar">
              <div 
                class="strength-indicator" 
                :style="{ width: passwordStrength.score + '%' }"
                :class="'strength-' + passwordStrength.status"
              ></div>
            </div>
          </div>

          <div class="output-stats" v-if="form.output">
            <span>密码长度：{{ form.output.length }}</span>
            <span>字符类型：{{ getPasswordTypes(form.output) }}</span>
          </div>
        </el-form-item>

        <el-form-item label="操作">
          <el-button-group>
            <el-button type="primary" @click="handleGenerate" :disabled="!isValid">
              <el-icon><Refresh /></el-icon>
              生成密码
            </el-button>
            <el-button @click="handleClear">清空</el-button>
          </el-button-group>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleCopy" :disabled="!form.output">
              <el-icon><DocumentCopy /></el-icon> 复制
            </el-button>
            <el-button type="primary" @click="handleDownload" :disabled="!form.output">
              <el-icon><Download /></el-icon> 下载
            </el-button>
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
                <el-tag type="success">密码生成</el-tag>
                <el-tag type="info" size="small">长度: {{ item.length }}</el-tag>
                <el-tag type="warning" size="small">{{ getPasswordTypes(item.output) }}</el-tag>
              </div>
              <div class="history-time">
                {{ new Date(item.timestamp).toLocaleString() }}
              </div>
              <div class="history-preview">
                <div class="preview-output">
                  <span class="preview-label">密码：</span>
                  <span class="preview-text">{{ item.output }}</span>
                </div>
                <div class="preview-strength">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :style="{width: `${getPasswordStrength(item.output).score}%`}"
                      :class="'strength-' + getPasswordStrength(item.output).status"
                    ></div>
                  </div>
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
import { Refresh, Timer, Search, DocumentCopy, Download, Lock, Warning, InfoFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import { cryptoDB, type CryptoHistory } from '@/utils/db'

const { copy } = useClipboard()

// 表单数据
const form = reactive({
  length: 16,
  options: ['uppercase', 'lowercase', 'numbers'] as string[],
  customChars: '',
  exclude: '',
  output: ''
})

// 验证表单
const isValid = computed(() => {
  return form.options.length > 0 && form.length >= 8 && form.length <= 64
})

// 获取字符集
const getCharset = () => {
  let charset = ''
  if (form.options.includes('uppercase')) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (form.options.includes('lowercase')) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (form.options.includes('numbers')) charset += '0123456789'
  if (form.options.includes('symbols')) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (form.options.includes('custom')) charset += form.customChars
  
  // 排除指定字符
  if (form.exclude) {
    charset = charset.replace(new RegExp(`[${form.exclude}]`, 'g'), '')
  }
  
  return charset
}

// 密码强度评估
const getPasswordStrength = (password: string) => {
  let score = 0
  let status: 'success' | 'warning' | 'exception' = 'exception'
  let color = '#F56C6C'
  let text = '弱'

  // 长度检查
  if (password.length >= 12) score += 25
  else if (password.length >= 8) score += 15

  // 字符类型检查
  if (/[A-Z]/.test(password)) score += 20
  if (/[a-z]/.test(password)) score += 20
  if (/[0-9]/.test(password)) score += 20
  if (/[^A-Za-z0-9]/.test(password)) score += 20

  // 设置状态和颜色
  if (score >= 80) {
    status = 'success'
    color = '#67C23A'
    text = '强'
  } else if (score >= 60) {
    status = 'warning'
    color = '#E6A23C'
    text = '中'
  }

  return { score, status, color, text }
}

// 获取密码类型
const getPasswordTypes = (password: string) => {
  const types = []
  if (/[A-Z]/.test(password)) types.push('大写字母')
  if (/[a-z]/.test(password)) types.push('小写字母')
  if (/[0-9]/.test(password)) types.push('数字')
  if (/[^A-Za-z0-9]/.test(password)) types.push('特殊字符')
  return types.join('、')
}

// 计算当前密码强度
const passwordStrength = computed(() => {
  if (!form.output) return { score: 0, status: 'exception', color: '#F56C6C', text: '弱' }
  return getPasswordStrength(form.output)
})

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
    a.download = `password_${Date.now()}.txt`
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
    history.value = await cryptoDB.getHistory('password')
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

const saveHistory = async () => {
  if (!form.output) return
  
  try {
    await cryptoDB.addHistory({
      tool: 'password',
      mode: 'generate',
      input: '',
      output: form.output,
      length: form.length,
      timestamp: Date.now()
    })
    await loadHistory()
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 生成密码
const handleGenerate = async () => {
  if (!isValid.value) return
  
  try {
    const charset = getCharset()
    if (!charset) {
      ElMessage.warning('请至少选择一种字符类型')
      return
    }

    let password = ''
    const array = new Uint32Array(form.length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < form.length; i++) {
      password += charset[array[i] % charset.length]
    }

    form.output = password
    await saveHistory()
    ElMessage.success('密码生成成功')
  } catch (error) {
    console.error('生成密码失败:', error)
    ElMessage.error('生成密码失败')
  }
}

// 使用历史记录
const useHistory = (item: CryptoHistory) => {
  form.output = item.output
  form.length = item.length || 16
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
    await cryptoDB.clearHistory('password')
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
.password-generator {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h2 {
        margin: 0;
      }
      
      .history-btn {
        margin-left: auto;
      }
    }
    
    .password-info {
      margin-bottom: 16px;
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

    .length-input {
      margin-right: 10px;
    }

    .length-tip {
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }

    .options-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .history-btn {
      margin-left: 12px;
    }

    .output-stats {
      margin-top: 8px;
      display: flex;
      gap: 16px;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }

    .password-strength {
      margin-top: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;

      .strength-label {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }

      .strength-value {
        font-size: 13px;
        font-weight: 500;
        margin-right: 8px;

        &.strength-exception {
          color: var(--el-color-danger);
        }

        &.strength-warning {
          color: var(--el-color-warning);
        }

        &.strength-success {
          color: var(--el-color-success);
        }
      }

      .strength-bar {
        flex: 1;
        min-width: 150px;
        height: 6px;
        background-color: var(--el-fill-color-darker);
        border-radius: 3px;
        overflow: hidden;

        .strength-indicator {
          height: 100%;
          width: 0%;
          display: block;

          &.strength-exception {
            background-color: var(--el-color-danger);
          }

          &.strength-warning {
            background-color: var(--el-color-warning);
          }

          &.strength-success {
            background-color: var(--el-color-success);
          }
        }
      }
    }

    :deep(.el-textarea__inner) {
      font-family: monospace;
      font-size: 14px;
      line-height: 1.6;
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
          margin-bottom: 8px;
          font-size: 13px;

          .preview-label {
            color: var(--el-text-color-secondary);
            margin-right: 8px;
          }

          .preview-text {
            color: var(--el-text-color-primary);
            font-family: monospace;
          }
        }

        .preview-strength {
          .strength-bar {
            height: 4px;
            background-color: var(--el-fill-color-darker);
            border-radius: 2px;
            overflow: hidden;
            
            .strength-fill {
              height: 100%;
              
              &.strength-exception {
                background-color: var(--el-color-danger);
              }
              
              &.strength-warning {
                background-color: var(--el-color-warning);
              }
              
              &.strength-success {
                background-color: var(--el-color-success);
              }
            }
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
</style> 