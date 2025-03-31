<template>
  <div class="password-generator-container">
    <div class="header">
      <h2>密码生成器</h2>
      <el-alert
        title="安全密码生成工具"
        type="info"
        description="本工具可以生成随机安全密码，并提供密码强度评估。所有操作均在本地完成，不会发送到网络上，保证您的数据安全。"
        show-icon
        :closable="false"
        class="password-info"
      />
    </div>

    <div class="page-content">
      <el-form :model="form" label-width="120px">
        <el-form-item label="密码长度">
          <el-slider
            v-model="form.length"
            :min="4"
            :max="32"
            :step="1"
            show-input
          />
        </el-form-item>

        <el-form-item label="字符类型">
          <div class="checkbox-group">
            <el-checkbox v-model="form.lowercase">小写字母 (a-z)</el-checkbox>
            <el-checkbox v-model="form.uppercase">大写字母 (A-Z)</el-checkbox>
            <el-checkbox v-model="form.numbers">数字 (0-9)</el-checkbox>
            <el-checkbox v-model="form.symbols">特殊字符 (!@#$%&*等)</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item label="生成的密码">
          <div class="password-input-container">
            <el-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              readonly
              placeholder="点击生成按钮创建密码"
            >
              <template #append>
                <el-button @click="togglePasswordVisibility">
                  <el-icon><View v-if="showPassword" /><Hide v-else /></el-icon>
                </el-button>
              </template>
            </el-input>
            
            <div class="password-strength" v-if="form.password">
              <div class="strength-bar">
                <div 
                  class="strength-indicator" 
                  :style="{ width: passwordStrength.score + '%' }"
                  :class="strengthClass"
                ></div>
              </div>
              <span class="strength-text" :class="strengthClass">
                {{ strengthLabel }}
              </span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="generatePassword">
              <el-icon><Refresh /></el-icon> 生成密码
            </el-button>
            <el-button @click="handleCopy" :disabled="!form.password">
              <el-icon><DocumentCopy /></el-icon> 复制密码
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
      
      <el-divider>密码安全建议</el-divider>
      
      <div class="password-tips">
        <h3>如何创建和使用安全密码</h3>
        <ul>
          <li>使用至少12个字符的密码以增强安全性</li>
          <li>混合使用大小写字母、数字和特殊字符</li>
          <li>避免使用容易猜测的信息（如生日、姓名）</li>
          <li>为不同的网站和应用使用不同的密码</li>
          <li>定期更换重要账户的密码</li>
          <li>考虑使用密码管理器来存储复杂密码</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'
import { View, Hide, Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { PasswordGenerator } from '../../../utils/crypto'

const { copy } = useClipboard()
const showPassword = ref(false)

const form = reactive({
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  password: ''
})

const passwordStrength = computed(() => {
  if (!form.password) return { score: 0, level: 'weak' }
  return PasswordGenerator.evaluateStrength(form.password)
})

const strengthClass = computed(() => {
  return {
    'weak': passwordStrength.value.level === 'weak',
    'medium': passwordStrength.value.level === 'medium',
    'strong': passwordStrength.value.level === 'strong'
  }
})

const strengthLabel = computed(() => {
  switch (passwordStrength.value.level) {
    case 'weak': return '弱'
    case 'medium': return '中等'
    case 'strong': return '强'
    default: return ''
  }
})

const generatePassword = () => {
  // 确保至少选择了一种字符类型
  if (!form.lowercase && !form.uppercase && !form.numbers && !form.symbols) {
    ElMessage.warning('请至少选择一种字符类型')
    form.lowercase = true
    return
  }
  
  try {
    form.password = PasswordGenerator.generate(form.length, {
      lowercase: form.lowercase,
      uppercase: form.uppercase,
      numbers: form.numbers,
      symbols: form.symbols
    })
  } catch (error) {
    ElMessage.error('密码生成失败')
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleCopy = async () => {
  try {
    await copy(form.password)
    ElMessage.success('密码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style lang="scss" scoped>
.password-generator-container {
  padding: 16px;
  
  .header {
    margin-bottom: 24px;
    
    h2 {
      margin-bottom: 16px;
    }
  }
  
  .password-info {
    margin-bottom: 24px;
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
  
  .page-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .password-input-container {
    .password-strength {
      margin-top: 8px;
      
      .strength-bar {
        height: 6px;
        background-color: var(--el-fill-color);
        border-radius: 3px;
        margin-bottom: 4px;
        
        .strength-indicator {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
          
          &.weak {
            background-color: var(--el-color-danger);
          }
          
          &.medium {
            background-color: var(--el-color-warning);
          }
          
          &.strong {
            background-color: var(--el-color-success);
          }
        }
      }
      
      .strength-text {
        font-size: 12px;
        
        &.weak {
          color: var(--el-color-danger);
        }
        
        &.medium {
          color: var(--el-color-warning);
        }
        
        &.strong {
          color: var(--el-color-success);
        }
      }
    }
  }
  
  .password-tips {
    margin-top: 16px;
    padding: 16px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        color: var(--el-text-color-regular);
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

// 暗黑模式下的特殊处理
:global(.dark) {
  .password-info {
    :deep(.el-alert) {
      background-color: var(--el-bg-color-overlay);
      border-color: var(--el-border-color-darker);
    }
  }
  
  .password-tips {
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-darker);
  }
}
</style> 