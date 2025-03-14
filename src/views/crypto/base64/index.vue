<template>
  <div class="base64-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>Base64 编解码</h3>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="encode">编码</el-radio-button>
            <el-radio-button label="decode">解码</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="输入">
          <el-input
            v-model="form.input"
            type="textarea"
            :rows="6"
            :placeholder="mode === 'encode' ? '请输入要编码的文本' : '请输入要解码的 Base64 文本'"
            @input="handleInput"
          />
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="6"
            readonly
            :placeholder="mode === 'encode' ? '编码结果' : '解码结果'"
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

const mode = ref<'encode' | 'decode'>('encode')

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
    if (mode.value === 'encode') {
      form.output = btoa(unescape(encodeURIComponent(form.input)))
    } else {
      form.output = decodeURIComponent(escape(atob(form.input)))
    }
  } catch (error) {
    ElMessage.error('转换失败，请检查输入是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  form.input = ''
  form.output = ''
}
</script>

<style lang="scss" scoped>
.base64-page {
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