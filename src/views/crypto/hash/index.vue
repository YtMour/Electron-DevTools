<template>
  <div class="hash-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Hash 计算器</h3>
          <el-select v-model="algorithm" size="small" placeholder="选择算法">
            <el-option label="MD5" value="md5" />
            <el-option label="SHA-1" value="sha1" />
            <el-option label="SHA-256" value="sha256" />
            <el-option label="SHA-384" value="sha384" />
            <el-option label="SHA-512" value="sha512" />
          </el-select>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="输入">
          <el-input
            v-model="form.input"
            type="textarea"
            :rows="6"
            placeholder="请输入要计算哈希值的文本"
            @input="handleInput"
          />
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="6"
            readonly
            placeholder="哈希计算结果"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleCalculate">计算</el-button>
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

const algorithm = ref('md5')

const form = reactive({
  input: '',
  output: ''
})

const handleInput = () => {
  if (form.input) {
    handleCalculate()
  } else {
    form.output = ''
  }
}

const handleCalculate = () => {
  if (!form.input) {
    form.output = ''
    return
  }

  try {
    const hash = crypto.createHash(algorithm.value)
    hash.update(form.input)
    form.output = hash.digest('hex')
  } catch (error) {
    ElMessage.error('计算失败，请检查输入是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  form.input = ''
  form.output = ''
}
</script>

<style lang="scss" scoped>
.hash-page {
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