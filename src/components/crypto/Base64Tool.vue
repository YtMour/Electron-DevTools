<template>
  <div class="base64-tool">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="tool-card">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>Base64 编解码</span>
            </div>
          </template>
          
          <el-form>
            <el-form-item>
              <el-radio-group v-model="mode" size="large">
                <el-radio-button label="encode">编码</el-radio-button>
                <el-radio-button label="decode">解码</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="8"
                :placeholder="mode === 'encode' ? '请输入要编码的文本' : '请输入要解码的 Base64 文本'"
                @input="handleInput"
              />
            </el-form-item>

            <el-form-item>
              <div class="button-group">
                <el-button type="primary" @click="handleProcess">
                  {{ mode === 'encode' ? '编码' : '解码' }}
                </el-button>
                <el-button @click="handleClear">清空</el-button>
                <el-button @click="handleCopy" :disabled="!outputText">复制结果</el-button>
              </div>
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="outputText"
                type="textarea"
                :rows="8"
                readonly
                :placeholder="mode === 'encode' ? 'Base64 编码结果' : '解码结果'"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useClipboard } from '@vueuse/core'

const { copy } = useClipboard()

const mode = ref<'encode' | 'decode'>('encode')
const inputText = ref('')
const outputText = ref('')

const handleInput = () => {
  if (inputText.value.trim() === '') {
    outputText.value = ''
  }
}

const handleProcess = () => {
  try {
    if (!inputText.value.trim()) {
      ElMessage.warning('请输入需要处理的文本')
      return
    }

    if (mode.value === 'encode') {
      outputText.value = btoa(inputText.value)
    } else {
      outputText.value = atob(inputText.value)
    }
  } catch (error) {
    ElMessage.error(mode.value === 'encode' ? '编码失败' : '解码失败，请确保输入正确的 Base64 文本')
  }
}

const handleClear = () => {
  inputText.value = ''
  outputText.value = ''
}

const handleCopy = async () => {
  try {
    await copy(outputText.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style lang="scss" scoped>
.base64-tool {
  .tool-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: bold;
    }

    .button-group {
      display: flex;
      gap: 12px;
    }
  }
}
</style> 