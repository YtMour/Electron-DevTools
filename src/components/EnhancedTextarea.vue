<template>
  <div class="enhanced-textarea-container" :class="{ 'theme-dark': theme === 'vs-dark' }">
    <textarea
      ref="textarea"
      :value="modelValue"
      @input="onInput"
      :placeholder="placeholder"
      :style="textareaStyle"
      :spellcheck="false"
      :read-only="readOnly"
      class="enhanced-textarea"
    ></textarea>
    <div v-if="lineNumbers" class="line-numbers">
      <div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'text'
  },
  theme: {
    type: String,
    default: 'vs'
  },
  lineNumbers: {
    type: Boolean,
    default: true
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '100%'
  },
  width: {
    type: String,
    default: '100%'
  },
  fontSize: {
    type: [String, Number],
    default: 14
  }
});

const emit = defineEmits(['update:modelValue', 'change']);
const textarea = ref<HTMLTextAreaElement | null>(null);
const lineCount = computed(() => {
  const text = props.modelValue || '';
  return text.split('\n').length;
});

const textareaStyle = computed(() => {
  return {
    height: props.height,
    width: props.width,
    fontSize: typeof props.fontSize === 'number' ? `${props.fontSize}px` : props.fontSize,
    paddingLeft: props.lineNumbers ? '40px' : '10px'
  };
});

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  emit('change', target.value);
};

// 添加tab键支持
function handleTabKey(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    
    // 缩进逻辑
    const newValue = target.value.substring(0, start) + '  ' + target.value.substring(end);
    target.value = newValue;
    emit('update:modelValue', newValue);
    
    // 重新设置光标位置
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + 2;
    }, 0);
  }
}

onMounted(() => {
  if (textarea.value) {
    // 添加Tab键处理
    textarea.value.addEventListener('keydown', handleTabKey);
  }
});

// 格式化代码的简单实现
function formatCode() {
  if (!props.modelValue) return;
  
  let formatted = props.modelValue;
  
  // 根据语言类型进行简单格式化
  if (props.language === 'json') {
    try {
      const parsed = JSON.parse(formatted);
      formatted = JSON.stringify(parsed, null, 2);
      emit('update:modelValue', formatted);
    } catch (e) {
      // 解析错误，不做任何操作
      console.error('JSON parse error:', e);
    }
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => textarea.value?.focus(),
  formatCode
});
</script>

<style scoped>
.enhanced-textarea-container {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f8f8;
}

.theme-dark {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.enhanced-textarea {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
  background-color: transparent;
  color: inherit;
  overflow: auto;
}

/* 自定义滚动条样式 */
.enhanced-textarea::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.enhanced-textarea::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.enhanced-textarea::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.4);
  border-radius: 6px;
  border: 3px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.2s ease;
}

.enhanced-textarea::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 100, 100, 0.7);
}

.enhanced-textarea::-webkit-scrollbar-thumb:active {
  background-color: rgba(100, 100, 100, 0.8);
}

.enhanced-textarea::-webkit-scrollbar-corner {
  background: transparent;
}

.line-numbers {
  position: absolute;
  top: 10px;
  left: 0;
  width: 30px;
  height: calc(100% - 20px);
  overflow: hidden;
  text-align: right;
  padding-right: 5px;
  box-sizing: border-box;
  color: #858585;
  user-select: none;
  font-size: 90%;
  border-right: 1px solid var(--el-border-color-light);
  background-color: rgba(0, 0, 0, 0.03);
}

.theme-dark .line-numbers {
  background-color: rgba(255, 255, 255, 0.03);
}

.line-number {
  line-height: 1.5;
}
</style> 