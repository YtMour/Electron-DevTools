<template>
  <div class="yaml-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>YAML/JSON 转换</h3>
          <el-radio-group v-model="mode" size="small">
            <el-radio-button label="yaml2json">YAML 转 JSON</el-radio-button>
            <el-radio-button label="json2yaml">JSON 转 YAML</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="输入">
          <el-input
            v-model="form.input"
            type="textarea"
            :rows="12"
            :placeholder="mode === 'yaml2json' ? '请输入 YAML 文本' : '请输入 JSON 文本'"
            @input="handleInput"
          />
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="12"
            readonly
            :placeholder="mode === 'yaml2json' ? 'JSON 结果' : 'YAML 结果'"
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
import * as yaml from 'js-yaml'

const mode = ref<'yaml2json' | 'json2yaml'>('yaml2json')

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
    if (mode.value === 'yaml2json') {
      const obj = yaml.load(form.input)
      form.output = JSON.stringify(obj, null, 2)
    } else {
      const json = JSON.parse(form.input)
      form.output = yaml.dump(json, {
        indent: 2,
        lineWidth: -1
      })
    }
  } catch (error) {
    ElMessage.error('转换失败，请检查输入格式是否正确')
    form.output = ''
  }
}

const handleClear = () => {
  form.input = ''
  form.output = ''
}
</script>

<style lang="scss" scoped>
.yaml-page {
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