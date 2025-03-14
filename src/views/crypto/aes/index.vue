<template>
  <div class="aes-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>AES 加密</h3>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="encrypt">加密</el-radio-button>
            <el-radio-button label="decrypt">解密</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="密钥">
          <el-input
            v-model="form.key"
            type="password"
            placeholder="请输入 16、24 或 32 字节的密钥"
            show-password
          />
        </el-form-item>

        <el-form-item label="IV">
          <el-input
            v-model="form.iv"
            type="password"
            placeholder="请输入 16 字节的 IV（可选）"
            show-password
          />
        </el-form-item>

        <el-form-item label="输入">
          <el-input
            v-model="form.input"
            type="textarea"
            :rows="6"
            :placeholder="mode === 'encrypt' ? '请输入要加密的文本' : '请输入要解密的文本'"
          />
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="6"
            readonly
            :placeholder="mode === 'encrypt' ? '加密结果' : '解密结果'"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleConvert">转换</el-button>
          <el-button @click="handleClear">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import * as crypto from 'crypto'

const mode = ref<'encrypt' | 'decrypt'>('encrypt')

const form = reactive({
  key: '',
  iv: '',
  input: '',
  output: ''
})

const handleConvert = () => {
  if (!form.input || !form.key) {
    ElMessage.warning('请输入密钥和要转换的文本')
    return
  }

  try {
    const key = Buffer.from(form.key)
    const iv = form.iv ? Buffer.from(form.iv) : undefined
    const input = Buffer.from(form.input)

    if (mode.value === 'encrypt') {
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv || crypto.randomBytes(16))
      const encrypted = Buffer.concat([cipher.update(input), cipher.final()])
      form.output = encrypted.toString('base64')
    } else {
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv || crypto.randomBytes(16))
      const decrypted = Buffer.concat([decipher.update(input), decipher.final()])
      form.output = decrypted.toString('utf8')
    }
  } catch (error) {
    ElMessage.error('转换失败，请检查输入是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  form.key = ''
  form.iv = ''
  form.input = ''
  form.output = ''
}
</script>

<style lang="scss" scoped>
.aes-page {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }
  }
}
</style> 