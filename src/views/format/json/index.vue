<template>
  <div class="json-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>JSON 格式化</h3>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="format">格式化</el-radio-button>
            <el-radio-button label="compress">压缩</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="输入">
          <el-input
            v-model="form.input"
            type="textarea"
            :rows="12"
            placeholder="请输入 JSON 文本"
            @input="handleInput"
          />
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="12"
            readonly
            placeholder="格式化/压缩结果"
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

const mode = ref<'format' | 'compress'>('format')

const form = reactive({
  input: '',
  output: ''
})

const handleInput = () => {
  if (form.input) {
    handleConvert()
  } else {
    form.output = ''
  }
}

const handleConvert = () => {
  if (!form.input) {
    form.output = ''
    return
  }

  try {
    const json = JSON.parse(form.input)
    form.output = mode.value === 'format'
      ? JSON.stringify(json, null, 2)
      : JSON.stringify(json)
  } catch (error) {
    ElMessage.error('JSON 格式错误，请检查输入')
    form.output = ''
  }
}

const handleClear = () => {
  form.input = ''
  form.output = ''
}
</script>

<style lang="scss" scoped>
.json-page {
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