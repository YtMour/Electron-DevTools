<template>
  <div class="rsa-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>RSA 加密</h3>
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
            type="textarea"
            :rows="4"
            :placeholder="mode === 'encrypt' ? '请输入公钥' : '请输入私钥'"
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
          <el-button type="success" @click="handleGenerateKey">生成密钥对</el-button>
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
  input: '',
  output: ''
})

const handleConvert = () => {
  if (!form.input || !form.key) {
    ElMessage.warning('请输入密钥和要转换的文本')
    return
  }

  try {
    const key = form.key
    const input = Buffer.from(form.input)

    if (mode.value === 'encrypt') {
      const encrypted = crypto.publicEncrypt(
        {
          key,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        input
      )
      form.output = encrypted.toString('base64')
    } else {
      const decrypted = crypto.privateDecrypt(
        {
          key,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        input
      )
      form.output = decrypted.toString('utf8')
    }
  } catch (error) {
    ElMessage.error('转换失败，请检查输入是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  form.key = ''
  form.input = ''
  form.output = ''
}

const handleGenerateKey = () => {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })

    ElMessage.success('密钥对生成成功')
    form.key = mode.value === 'encrypt' ? publicKey : privateKey
  } catch (error) {
    ElMessage.error('密钥对生成失败')
  }
}
</script>

<style lang="scss" scoped>
.rsa-page {
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