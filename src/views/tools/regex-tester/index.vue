<template>
  <div class="regex-tester-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Search /></el-icon>
        正则表达式测试器
      </h1>
      <p class="page-description">
        强大的正则表达式测试和学习工具，支持实时匹配和语法高亮
      </p>
    </div>

    <div class="tester-layout">
      <!-- 正则表达式输入区 -->
      <div class="regex-section">
        <el-card shadow="never" class="regex-card">
          <template #header>
            <div class="card-header">
              <el-icon><Edit /></el-icon>
              <span>正则表达式</span>
            </div>
          </template>

          <div class="regex-input-section">
            <div class="regex-input-wrapper">
              <span class="regex-delimiter">/</span>
              <el-input
                v-model="regexPattern"
                placeholder="请输入正则表达式，例如: \d{3}-\d{4}-\d{4}"
                class="regex-input"
                @input="testRegex"
              />
              <span class="regex-delimiter">/</span>
              <el-input
                v-model="regexFlags"
                placeholder="flags"
                class="flags-input"
                maxlength="6"
                @input="testRegex"
              />
            </div>

            <div class="regex-flags">
              <span class="flags-label">标志:</span>
              <el-checkbox v-model="flags.global" @change="updateFlags">g (全局)</el-checkbox>
              <el-checkbox v-model="flags.ignoreCase" @change="updateFlags">i (忽略大小写)</el-checkbox>
              <el-checkbox v-model="flags.multiline" @change="updateFlags">m (多行)</el-checkbox>
              <el-checkbox v-model="flags.dotAll" @change="updateFlags">s (单行)</el-checkbox>
              <el-checkbox v-model="flags.unicode" @change="updateFlags">u (Unicode)</el-checkbox>
              <el-checkbox v-model="flags.sticky" @change="updateFlags">y (粘性)</el-checkbox>
            </div>

            <div class="regex-info" v-if="regexError">
              <el-alert
                :title="regexError"
                type="error"
                show-icon
                :closable="false"
              />
            </div>

            <div class="regex-info" v-else-if="regexPattern">
              <el-alert
                title="正则表达式有效"
                type="success"
                show-icon
                :closable="false"
              />
            </div>
          </div>
        </el-card>
      </div>

      <!-- 测试文本区 -->
      <div class="test-section">
        <el-card shadow="never" class="test-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>测试文本</span>
              <div class="test-actions">
                <el-button type="text" size="small" @click="clearText">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
                <el-button type="text" size="small" @click="loadSampleText">
                  <el-icon><Magic /></el-icon>
                  示例
                </el-button>
              </div>
            </div>
          </template>

          <div class="test-input-section">
            <el-input
              v-model="testText"
              type="textarea"
              :rows="12"
              placeholder="请输入要测试的文本..."
              @input="testRegex"
            />
          </div>
        </el-card>
      </div>

      <!-- 匹配结果区 -->
      <div class="results-section">
        <el-card shadow="never" class="results-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>匹配结果</span>
              <div class="results-stats" v-if="matches.length > 0">
                <el-tag type="success" effect="light">
                  {{ matches.length }} 个匹配
                </el-tag>
              </div>
            </div>
          </template>

          <div class="results-content">
            <div v-if="matches.length > 0" class="matches-list">
              <div
                v-for="(match, index) in matches"
                :key="index"
                class="match-item"
              >
                <div class="match-header">
                  <span class="match-index">匹配 {{ index + 1 }}</span>
                  <span class="match-position">位置: {{ match.index }}-{{ match.index + match[0].length }}</span>
                </div>
                
                <div class="match-content">
                  <div class="match-full">
                    <span class="match-label">完整匹配:</span>
                    <code class="match-value">{{ match[0] }}</code>
                  </div>
                  
                  <div v-if="match.length > 1" class="match-groups">
                    <div class="groups-title">捕获组:</div>
                    <div
                      v-for="(group, groupIndex) in match.slice(1)"
                      :key="groupIndex"
                      class="group-item"
                    >
                      <span class="group-label">组 {{ groupIndex + 1 }}:</span>
                      <code class="group-value">{{ group || '(未匹配)' }}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="regexPattern && testText" class="no-matches">
              <el-empty description="没有找到匹配项" :image-size="80" />
            </div>

            <div v-else class="empty-state">
              <el-empty description="输入正则表达式和测试文本开始测试" :image-size="100" />
            </div>
          </div>
        </el-card>
      </div>

      <!-- 替换功能区 -->
      <div class="replace-section">
        <el-card shadow="never" class="replace-card">
          <template #header>
            <div class="card-header">
              <el-icon><Refresh /></el-icon>
              <span>替换功能</span>
            </div>
          </template>

          <div class="replace-content">
            <div class="replace-input">
              <el-input
                v-model="replaceText"
                placeholder="请输入替换文本，支持 $1, $2 等捕获组引用"
                @input="performReplace"
              >
                <template #prepend>替换为</template>
              </el-input>
            </div>

            <div class="replace-result" v-if="replacedText">
              <h4>替换结果:</h4>
              <div class="result-display">
                <pre class="result-text">{{ replacedText }}</pre>
              </div>
              
              <div class="replace-actions">
                <el-button type="primary" @click="copyReplaceResult">
                  <el-icon><CopyDocument /></el-icon>
                  复制结果
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 常用正则表达式库 -->
    <div class="regex-library">
      <el-card shadow="never" class="library-card">
        <template #header>
          <div class="card-header">
            <el-icon><Collection /></el-icon>
            <span>常用正则表达式</span>
          </div>
        </template>

        <div class="library-content">
          <div class="library-grid">
            <div
              v-for="(item, index) in regexLibrary"
              :key="index"
              class="library-item"
              @click="useLibraryRegex(item)"
            >
              <div class="library-title">{{ item.name }}</div>
              <div class="library-pattern">{{ item.pattern }}</div>
              <div class="library-description">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Edit,
  Document,
  Delete,
  Magic,
  DataAnalysis,
  Refresh,
  CopyDocument,
  Collection
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'

// 接口定义
interface RegexFlags {
  global: boolean
  ignoreCase: boolean
  multiline: boolean
  dotAll: boolean
  unicode: boolean
  sticky: boolean
}

interface LibraryItem {
  name: string
  pattern: string
  description: string
  example?: string
}

// 响应式数据
const regexPattern = ref('')
const regexFlags = ref('')
const testText = ref('')
const replaceText = ref('')
const regexError = ref('')
const matches = ref<RegExpMatchArray[]>([])
const replacedText = ref('')

const flags = reactive<RegexFlags>({
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  unicode: false,
  sticky: false
})

// 使用剪贴板
const { copy } = useClipboard()

// 常用正则表达式库
const regexLibrary: LibraryItem[] = [
  {
    name: '邮箱地址',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    description: '匹配标准邮箱地址格式'
  },
  {
    name: '手机号码',
    pattern: '1[3-9]\\d{9}',
    description: '匹配中国大陆手机号码'
  },
  {
    name: 'URL 地址',
    pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?',
    description: '匹配 HTTP/HTTPS URL'
  },
  {
    name: 'IPv4 地址',
    pattern: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
    description: '匹配 IPv4 地址'
  },
  {
    name: '身份证号',
    pattern: '[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]',
    description: '匹配中国身份证号码'
  },
  {
    name: '日期格式',
    pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}',
    description: '匹配 YYYY-MM-DD 或 YYYY/MM/DD 格式'
  },
  {
    name: '时间格式',
    pattern: '([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?',
    description: '匹配 HH:MM 或 HH:MM:SS 格式'
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    description: '匹配中文字符'
  },
  {
    name: '数字',
    pattern: '-?\\d+(\\.\\d+)?',
    description: '匹配整数或小数'
  },
  {
    name: 'HTML 标签',
    pattern: '<[^>]+>',
    description: '匹配 HTML 标签'
  }
]

// 计算属性
const currentRegex = computed(() => {
  if (!regexPattern.value) return null
  
  try {
    return new RegExp(regexPattern.value, regexFlags.value)
  } catch (error) {
    return null
  }
})

// 方法
const updateFlags = () => {
  let flagsStr = ''
  if (flags.global) flagsStr += 'g'
  if (flags.ignoreCase) flagsStr += 'i'
  if (flags.multiline) flagsStr += 'm'
  if (flags.dotAll) flagsStr += 's'
  if (flags.unicode) flagsStr += 'u'
  if (flags.sticky) flagsStr += 'y'
  
  regexFlags.value = flagsStr
  testRegex()
}

const testRegex = () => {
  regexError.value = ''
  matches.value = []
  
  if (!regexPattern.value || !testText.value) {
    return
  }
  
  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value)
    
    if (flags.global) {
      const allMatches: RegExpMatchArray[] = []
      let match: RegExpExecArray | null
      
      while ((match = regex.exec(testText.value)) !== null) {
        allMatches.push(match as RegExpMatchArray)
        if (!flags.global) break
      }
      
      matches.value = allMatches
    } else {
      const match = testText.value.match(regex)
      if (match) {
        matches.value = [match]
      }
    }
    
    performReplace()
  } catch (error) {
    regexError.value = error instanceof Error ? error.message : '正则表达式语法错误'
  }
}

const performReplace = () => {
  if (!regexPattern.value || !testText.value || !replaceText.value) {
    replacedText.value = ''
    return
  }
  
  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value)
    replacedText.value = testText.value.replace(regex, replaceText.value)
  } catch (error) {
    replacedText.value = ''
  }
}

const clearText = () => {
  testText.value = ''
  matches.value = []
  replacedText.value = ''
}

const loadSampleText = () => {
  testText.value = `这是一个测试文本，包含各种格式：
邮箱: user@example.com, admin@test.org
手机: 13812345678, 15987654321
网址: https://www.example.com, http://test.org
日期: 2023-12-25, 2024/01/01
时间: 14:30:00, 09:15
数字: 123, -45.67, 3.14159
中文: 你好世界，正则表达式测试
HTML: <div class="test">内容</div>`
  
  testRegex()
}

const useLibraryRegex = (item: LibraryItem) => {
  regexPattern.value = item.pattern
  
  // 设置合适的标志
  flags.global = true
  flags.ignoreCase = false
  flags.multiline = true
  updateFlags()
  
  ElMessage.success(`已应用正则表达式: ${item.name}`)
}

const copyReplaceResult = async () => {
  if (!replacedText.value) return
  
  try {
    await copy(replacedText.value)
    ElMessage.success('替换结果已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.regex-tester-container {
  padding: 24px;
  max-width: 100%;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.title-icon {
  color: var(--el-color-primary);
  font-size: 28px;
}

.page-description {
  color: var(--el-text-color-secondary);
  margin: 0;
  font-size: 14px;
}

.tester-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .tester-layout {
    grid-template-columns: 1fr;
  }
}

.regex-card,
.test-card,
.results-card,
.replace-card,
.library-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.test-actions,
.results-stats {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.regex-input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.regex-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.regex-delimiter {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-color-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.regex-input {
  flex: 1;
}

.flags-input {
  width: 80px;
}

.regex-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.flags-label {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.regex-info {
  margin-top: 8px;
}

.test-input-section {
  position: relative;
}

.results-content {
  max-height: 400px;
  overflow-y: auto;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-item {
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.match-index {
  font-weight: 600;
  color: var(--el-color-primary);
}

.match-position {
  color: var(--el-text-color-secondary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.match-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-full {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  min-width: 80px;
}

.match-value {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.match-groups {
  margin-top: 8px;
}

.groups-title {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.group-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  min-width: 60px;
  font-size: 13px;
}

.group-value {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.no-matches,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.replace-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.replace-result h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.result-display {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.result-text {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.replace-actions {
  display: flex;
  gap: 8px;
}

.library-content {
  max-height: 300px;
  overflow-y: auto;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.library-item {
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.2s ease;
}

.library-item:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.library-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.library-pattern {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-bg-color);
  padding: 4px 6px;
  border-radius: 3px;
  margin-bottom: 6px;
  word-break: break-all;
}

.library-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .regex-tester-container {
    padding: 16px;
  }

  .regex-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .regex-flags {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .match-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .match-full,
  .group-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .library-grid {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
.regex-tester-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.match-item {
  animation: slideInUp 0.3s ease-in-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .regex-card,
  .test-card,
  .results-card,
  .replace-card,
  .library-card {
    border-color: var(--el-border-color-dark);
  }

  .regex-flags,
  .match-item,
  .result-display,
  .library-item {
    background: var(--el-fill-color-dark);
    border-color: var(--el-border-color-dark);
  }

  .library-item:hover {
    background: var(--el-color-primary-light-8);
  }
}
</style>
