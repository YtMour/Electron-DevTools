# 创建新的分屏对比组件
<template>
  <div class="diff-viewer">
    <div class="diff-header">
      <div class="file-info left">
        <span class="file-name">{{ leftTitle }}</span>
        <span class="file-meta" v-if="leftMeta">{{ leftMeta }}</span>
      </div>
      <div class="file-info right">
        <span class="file-name">{{ rightTitle }}</span>
        <span class="file-meta" v-if="rightMeta">{{ rightMeta }}</span>
      </div>
    </div>
    
    <div class="diff-container">
      <!-- 行号列 -->
      <div class="line-numbers left" ref="leftLineNumbers">
        <div v-for="n in leftLineCount" :key="n" class="line-number">{{ n }}</div>
      </div>
      
      <!-- 左侧内容 -->
      <div class="content left" ref="leftContent" @scroll="handleLeftScroll">
        <pre><code :class="codeLanguage" v-html="highlightedLeft"></code></pre>
      </div>
      
      <!-- 中间差异指示器 -->
      <div class="diff-gutter">
        <div v-for="(mark, index) in diffMarks" 
             :key="index" 
             class="diff-mark"
             :class="mark.type">
          {{ mark.symbol }}
        </div>
      </div>
      
      <!-- 右侧内容 -->
      <div class="content right" ref="rightContent" @scroll="handleRightScroll">
        <pre><code :class="codeLanguage" v-html="highlightedRight"></code></pre>
      </div>
      
      <!-- 右侧行号 -->
      <div class="line-numbers right" ref="rightLineNumbers">
        <div v-for="n in rightLineCount" :key="n" class="line-number">{{ n }}</div>
      </div>
    </div>
    
    <!-- 差异导航 -->
    <div class="diff-nav">
      <div class="diff-stats">
        <span class="added">+{{ stats.additions }}</span>
        <span class="removed">-{{ stats.deletions }}</span>
        <span class="modified">~{{ stats.modifications }}</span>
      </div>
      <div class="nav-controls">
        <el-button-group>
          <el-button size="small" @click="navigateDiff('prev')" :disabled="!hasPrevDiff">
            <el-icon><ArrowUp /></el-icon>
          </el-button>
          <el-button size="small" @click="navigateDiff('next')" :disabled="!hasNextDiff">
            <el-icon><ArrowDown /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DiffViewer'
}
</script>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { diffLines, Change } from 'diff'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// Props
const props = defineProps({
  leftContent: {
    type: String,
    required: true
  },
  rightContent: {
    type: String,
    required: true
  },
  leftTitle: {
    type: String,
    default: '原始文本'
  },
  rightTitle: {
    type: String,
    default: '对比文本'
  },
  leftMeta: {
    type: String,
    default: ''
  },
  rightMeta: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: ''
  }
})

// Refs
const leftContent = ref<HTMLElement | null>(null)
const rightContent = ref<HTMLElement | null>(null)
const leftLineNumbers = ref<HTMLElement | null>(null)
const rightLineNumbers = ref<HTMLElement | null>(null)

// State
const differences = ref<Change[]>([])
const currentDiffIndex = ref(-1)
const isScrolling = ref(false)

// Computed
const codeLanguage = computed(() => props.language ? `language-${props.language}` : '')

const diffMarks = computed(() => {
  return differences.value.map(diff => ({
    type: diff.added ? 'added' : diff.removed ? 'removed' : 'unchanged',
    symbol: diff.added ? '+' : diff.removed ? '-' : ' '
  }))
})

const diffResult = computed(() => {
  const diffs = diffLines(props.leftContent, props.rightContent)
  differences.value = diffs
  
  let leftHtml = ''
  let rightHtml = ''
  
  diffs.forEach(part => {
    const content = hljs.highlightAuto(part.value).value
    if (part.added) {
      rightHtml += `<div class="line added">${content}</div>`
    } else if (part.removed) {
      leftHtml += `<div class="line removed">${content}</div>`
    } else {
      leftHtml += `<div class="line">${content}</div>`
      rightHtml += `<div class="line">${content}</div>`
    }
  })
  
  return {
    highlightedLeft: leftHtml,
    highlightedRight: rightHtml
  }
})

const highlightedLeft = computed(() => diffResult.value.highlightedLeft)
const highlightedRight = computed(() => diffResult.value.highlightedRight)

const stats = computed(() => {
  return differences.value.reduce((acc, curr) => {
    if (curr.added) acc.additions++
    if (curr.removed) acc.deletions++
    if (!curr.added && !curr.removed) acc.modifications++
    return acc
  }, { additions: 0, deletions: 0, modifications: 0 })
})

const leftLineCount = computed(() => props.leftContent.split('\n').length)
const rightLineCount = computed(() => props.rightContent.split('\n').length)

const hasPrevDiff = computed(() => currentDiffIndex.value > 0)
const hasNextDiff = computed(() => {
  return currentDiffIndex.value < differences.value.filter(d => d.added || d.removed).length - 1
})

// Methods
const handleLeftScroll = (e: Event) => {
  if (isScrolling.value) return
  isScrolling.value = true
  
  const target = e.target as HTMLElement
  if (rightContent.value) {
    rightContent.value.scrollTop = target.scrollTop
  }
  if (leftLineNumbers.value) {
    leftLineNumbers.value.scrollTop = target.scrollTop
  }
  
  isScrolling.value = false
}

const handleRightScroll = (e: Event) => {
  if (isScrolling.value) return
  isScrolling.value = true
  
  const target = e.target as HTMLElement
  if (leftContent.value) {
    leftContent.value.scrollTop = target.scrollTop
  }
  if (rightLineNumbers.value) {
    rightLineNumbers.value.scrollTop = target.scrollTop
  }
  
  isScrolling.value = false
}

const navigateDiff = (direction: 'prev' | 'next') => {
  const diffLines = differences.value.filter(d => d.added || d.removed)
  if (!diffLines.length) return
  
  if (direction === 'next') {
    currentDiffIndex.value = Math.min(currentDiffIndex.value + 1, diffLines.length - 1)
  } else {
    currentDiffIndex.value = Math.max(currentDiffIndex.value - 1, 0)
  }
  
  // 滚动到对应的差异位置
  const diff = diffLines[currentDiffIndex.value]
  const lineElement = diff.added ? 
    rightContent.value?.querySelector(`.line:nth-child(${currentDiffIndex.value + 1})`) :
    leftContent.value?.querySelector(`.line:nth-child(${currentDiffIndex.value + 1})`)
    
  lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Lifecycle
onMounted(() => {
  // 初始化代码高亮
  if (props.language) {
    hljs.configure({ languages: [props.language] })
  }
})

// Watch
watch([() => props.leftContent, () => props.rightContent], () => {
  currentDiffIndex.value = -1
})
</script>

<style lang="scss" scoped>
.diff-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
  
  .diff-header {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    background-color: var(--el-bg-color-page);
    border-bottom: 1px solid var(--el-border-color-light);
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .file-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .file-meta {
        color: var(--el-text-color-secondary);
        font-size: 12px;
      }
    }
  }
  
  .diff-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    
    .line-numbers {
      padding: 8px 8px;
      background-color: var(--el-fill-color-lighter);
      border-right: 1px solid var(--el-border-color-light);
      user-select: none;
      overflow-y: hidden;
      
      .line-number {
        font-family: monospace;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 1.6;
        text-align: right;
        padding: 0 4px;
      }
    }
    
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 16px;
      
      pre {
        margin: 0;
        
        code {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
        }
      }
      
      .line {
        &.added {
          background-color: var(--el-color-success-light-9);
        }
        
        &.removed {
          background-color: var(--el-color-danger-light-9);
        }
      }
    }
    
    .diff-gutter {
      width: 50px;
      background-color: var(--el-fill-color-lighter);
      border-right: 1px solid var(--el-border-color-light);
      border-left: 1px solid var(--el-border-color-light);
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .diff-mark {
        height: 21px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        
        &.added {
          color: var(--el-color-success);
        }
        
        &.removed {
          color: var(--el-color-danger);
        }
      }
    }
  }
  
  .diff-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background-color: var(--el-bg-color-page);
    border-top: 1px solid var(--el-border-color-light);
    
    .diff-stats {
      display: flex;
      gap: 16px;
      
      span {
        font-size: 13px;
        
        &.added {
          color: var(--el-color-success);
        }
        
        &.removed {
          color: var(--el-color-danger);
        }
        
        &.modified {
          color: var(--el-color-warning);
        }
      }
    }
  }
}

// 暗色主题适配
:deep(.dark) {
  .diff-viewer {
    .content {
      .line {
        &.added {
          background-color: var(--el-color-success-light-9);
        }
        
        &.removed {
          background-color: var(--el-color-danger-light-9);
        }
      }
    }
  }
}
</style> 