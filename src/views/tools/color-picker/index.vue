<template>
  <div class="color-picker-container">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon class="title-icon"><Brush /></el-icon>
        颜色选择器
      </h1>
      <p class="page-description">
        专业的颜色选择和转换工具，支持多种颜色格式和调色板
      </p>
    </div>

    <div class="picker-layout">
      <!-- 颜色选择区 -->
      <div class="color-section">
        <el-card shadow="never" class="color-card">
          <template #header>
            <div class="card-header">
              <el-icon><Palette /></el-icon>
              <span>颜色选择</span>
            </div>
          </template>

          <div class="color-picker-section">
            <!-- 主颜色选择器 -->
            <div class="main-picker">
              <el-color-picker
                v-model="currentColor"
                size="large"
                show-alpha
                @change="onColorChange"
                class="color-picker-main"
              />
              <div class="color-display">
                <div
                  class="color-preview"
                  :style="{ backgroundColor: currentColor }"
                ></div>
                <div class="color-info">
                  <div class="color-name">{{ getColorName(currentColor) }}</div>
                  <div class="color-brightness">亮度: {{ getBrightness(currentColor) }}%</div>
                </div>
              </div>
            </div>

            <!-- 颜色格式输出 -->
            <div class="color-formats">
              <div class="format-item">
                <label class="format-label">HEX:</label>
                <el-input
                  v-model="colorFormats.hex"
                  readonly
                  class="format-input"
                >
                  <template #append>
                    <el-button @click="copyFormat('hex')" :icon="CopyDocument" />
                  </template>
                </el-input>
              </div>

              <div class="format-item">
                <label class="format-label">RGB:</label>
                <el-input
                  v-model="colorFormats.rgb"
                  readonly
                  class="format-input"
                >
                  <template #append>
                    <el-button @click="copyFormat('rgb')" :icon="CopyDocument" />
                  </template>
                </el-input>
              </div>

              <div class="format-item">
                <label class="format-label">HSL:</label>
                <el-input
                  v-model="colorFormats.hsl"
                  readonly
                  class="format-input"
                >
                  <template #append>
                    <el-button @click="copyFormat('hsl')" :icon="CopyDocument" />
                  </template>
                </el-input>
              </div>

              <div class="format-item">
                <label class="format-label">HSV:</label>
                <el-input
                  v-model="colorFormats.hsv"
                  readonly
                  class="format-input"
                >
                  <template #append>
                    <el-button @click="copyFormat('hsv')" :icon="CopyDocument" />
                  </template>
                </el-input>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 调色板区 -->
      <div class="palette-section">
        <el-card shadow="never" class="palette-card">
          <template #header>
            <div class="card-header">
              <el-icon><Grid /></el-icon>
              <span>调色板</span>
              <div class="palette-actions">
                <el-button type="text" size="small" @click="generatePalette">
                  <el-icon><Refresh /></el-icon>
                  生成
                </el-button>
                <el-button type="text" size="small" @click="savePalette">
                  <el-icon><Plus /></el-icon>
                  保存
                </el-button>
              </div>
            </div>
          </template>

          <div class="palette-content">
            <!-- 生成的调色板 -->
            <div class="generated-palette">
              <h4>基于当前颜色的调色板</h4>
              <div class="palette-grid">
                <div
                  v-for="(color, index) in generatedPalette"
                  :key="index"
                  class="palette-color"
                  :style="{ backgroundColor: color }"
                  @click="selectColor(color)"
                  :title="color"
                >
                  <span class="color-code">{{ color }}</span>
                </div>
              </div>
            </div>

            <!-- 保存的调色板 -->
            <div class="saved-palettes" v-if="savedPalettes.length > 0">
              <h4>保存的调色板</h4>
              <div class="saved-palette-list">
                <div
                  v-for="(palette, index) in savedPalettes"
                  :key="index"
                  class="saved-palette-item"
                >
                  <div class="palette-header">
                    <span class="palette-name">调色板 {{ index + 1 }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      @click="deletePalette(index)"
                      :icon="Delete"
                    />
                  </div>
                  <div class="palette-colors">
                    <div
                      v-for="(color, colorIndex) in palette"
                      :key="colorIndex"
                      class="saved-color"
                      :style="{ backgroundColor: color }"
                      @click="selectColor(color)"
                      :title="color"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 颜色工具区 -->
      <div class="tools-section">
        <el-card shadow="never" class="tools-card">
          <template #header>
            <div class="card-header">
              <el-icon><Tools /></el-icon>
              <span>颜色工具</span>
            </div>
          </template>

          <div class="tools-content">
            <!-- 颜色混合 -->
            <div class="tool-item">
              <h4>颜色混合</h4>
              <div class="color-blend">
                <div class="blend-inputs">
                  <el-color-picker
                    v-model="blendColor1"
                    @change="updateBlend"
                    size="small"
                  />
                  <span class="blend-operator">+</span>
                  <el-color-picker
                    v-model="blendColor2"
                    @change="updateBlend"
                    size="small"
                  />
                  <span class="blend-operator">=</span>
                  <div
                    class="blend-result"
                    :style="{ backgroundColor: blendResult }"
                    @click="selectColor(blendResult)"
                    :title="blendResult"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 对比度检查 -->
            <div class="tool-item">
              <h4>对比度检查</h4>
              <div class="contrast-check">
                <div class="contrast-inputs">
                  <el-color-picker
                    v-model="contrastColor1"
                    @change="updateContrast"
                    size="small"
                  />
                  <el-color-picker
                    v-model="contrastColor2"
                    @change="updateContrast"
                    size="small"
                  />
                </div>
                <div class="contrast-result">
                  <div class="contrast-ratio">
                    对比度: {{ contrastRatio }}
                  </div>
                  <div class="contrast-preview">
                    <div
                      class="contrast-sample"
                      :style="{
                        backgroundColor: contrastColor1,
                        color: contrastColor2
                      }"
                    >
                      示例文本
                    </div>
                  </div>
                  <div class="contrast-rating">
                    <el-tag :type="getContrastRating(contrastRatio).type">
                      {{ getContrastRating(contrastRatio).text }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 颜色历史 -->
            <div class="tool-item">
              <h4>颜色历史</h4>
              <div class="color-history">
                <div class="history-colors">
                  <div
                    v-for="(color, index) in colorHistory"
                    :key="index"
                    class="history-color"
                    :style="{ backgroundColor: color }"
                    @click="selectColor(color)"
                    :title="color"
                  ></div>
                </div>
                <el-button
                  type="text"
                  size="small"
                  @click="clearHistory"
                  :disabled="colorHistory.length === 0"
                >
                  清空历史
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 预设颜色库 -->
    <div class="presets-section">
      <el-card shadow="never" class="presets-card">
        <template #header>
          <div class="card-header">
            <el-icon><Collection /></el-icon>
            <span>预设颜色</span>
          </div>
        </template>

        <div class="presets-content">
          <el-tabs v-model="activePresetTab" class="presets-tabs">
            <el-tab-pane
              v-for="(preset, key) in colorPresets"
              :key="key"
              :label="preset.name"
              :name="key"
            >
              <div class="preset-colors">
                <div
                  v-for="(color, index) in preset.colors"
                  :key="index"
                  class="preset-color"
                  :style="{ backgroundColor: color.value }"
                  @click="selectColor(color.value)"
                  :title="`${color.name}: ${color.value}`"
                >
                  <span class="preset-color-name">{{ color.name }}</span>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Brush,
  Palette,
  Grid,
  Refresh,
  Plus,
  Delete,
  Tools,
  Collection,
  CopyDocument
} from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'

// 接口定义
interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  hsv: string
}

interface ColorPreset {
  name: string
  value: string
}

interface PresetCategory {
  name: string
  colors: ColorPreset[]
}

// 响应式数据
const currentColor = ref('#409eff')
const blendColor1 = ref('#ff0000')
const blendColor2 = ref('#0000ff')
const blendResult = ref('#800080')
const contrastColor1 = ref('#ffffff')
const contrastColor2 = ref('#000000')
const contrastRatio = ref('21.00')
const activePresetTab = ref('material')

const colorFormats = reactive<ColorFormats>({
  hex: '#409eff',
  rgb: 'rgb(64, 158, 255)',
  hsl: 'hsl(213, 100%, 63%)',
  hsv: 'hsv(213, 75%, 100%)'
})

const generatedPalette = ref<string[]>([])
const savedPalettes = ref<string[][]>([])
const colorHistory = ref<string[]>([])

// 使用剪贴板
const { copy } = useClipboard()

// 预设颜色库
const colorPresets: Record<string, PresetCategory> = {
  material: {
    name: 'Material Design',
    colors: [
      { name: 'Red 500', value: '#f44336' },
      { name: 'Pink 500', value: '#e91e63' },
      { name: 'Purple 500', value: '#9c27b0' },
      { name: 'Deep Purple 500', value: '#673ab7' },
      { name: 'Indigo 500', value: '#3f51b5' },
      { name: 'Blue 500', value: '#2196f3' },
      { name: 'Light Blue 500', value: '#03a9f4' },
      { name: 'Cyan 500', value: '#00bcd4' },
      { name: 'Teal 500', value: '#009688' },
      { name: 'Green 500', value: '#4caf50' },
      { name: 'Light Green 500', value: '#8bc34a' },
      { name: 'Lime 500', value: '#cddc39' },
      { name: 'Yellow 500', value: '#ffeb3b' },
      { name: 'Amber 500', value: '#ffc107' },
      { name: 'Orange 500', value: '#ff9800' },
      { name: 'Deep Orange 500', value: '#ff5722' }
    ]
  },
  flat: {
    name: 'Flat UI',
    colors: [
      { name: 'Turquoise', value: '#1abc9c' },
      { name: 'Emerald', value: '#2ecc71' },
      { name: 'Peter River', value: '#3498db' },
      { name: 'Amethyst', value: '#9b59b6' },
      { name: 'Wet Asphalt', value: '#34495e' },
      { name: 'Green Sea', value: '#16a085' },
      { name: 'Nephritis', value: '#27ae60' },
      { name: 'Belize Hole', value: '#2980b9' },
      { name: 'Wisteria', value: '#8e44ad' },
      { name: 'Midnight Blue', value: '#2c3e50' },
      { name: 'Sun Flower', value: '#f1c40f' },
      { name: 'Carrot', value: '#e67e22' },
      { name: 'Alizarin', value: '#e74c3c' },
      { name: 'Clouds', value: '#ecf0f1' },
      { name: 'Concrete', value: '#95a5a6' },
      { name: 'Orange', value: '#f39c12' }
    ]
  },
  web: {
    name: 'Web Safe',
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'Navy', value: '#000080' },
      { name: 'Dark Blue', value: '#00008b' },
      { name: 'Medium Blue', value: '#0000cd' },
      { name: 'Blue', value: '#0000ff' },
      { name: 'Dark Green', value: '#006400' },
      { name: 'Green', value: '#008000' },
      { name: 'Teal', value: '#008080' },
      { name: 'Dark Cyan', value: '#008b8b' },
      { name: 'Deep Sky Blue', value: '#00bfff' },
      { name: 'Dark Turquoise', value: '#00ced1' },
      { name: 'Medium Spring Green', value: '#00fa9a' },
      { name: 'Lime', value: '#00ff00' },
      { name: 'Spring Green', value: '#00ff7f' },
      { name: 'Cyan', value: '#00ffff' },
      { name: 'Midnight Blue', value: '#191970' }
    ]
  }
}

// 计算属性和方法
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, v = max
  
  const d = max - min
  s = max === 0 ? 0 : d / max
  
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  }
}

const updateColorFormats = (color: string) => {
  colorFormats.hex = color
  
  const rgb = hexToRgb(color)
  if (rgb) {
    colorFormats.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    colorFormats.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    colorFormats.hsv = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
  }
}

const onColorChange = (color: string) => {
  updateColorFormats(color)
  addToHistory(color)
  generatePalette()
}

const addToHistory = (color: string) => {
  if (!colorHistory.value.includes(color)) {
    colorHistory.value.unshift(color)
    if (colorHistory.value.length > 20) {
      colorHistory.value.pop()
    }
  }
}

const selectColor = (color: string) => {
  currentColor.value = color
  onColorChange(color)
}

const getColorName = (color: string): string => {
  // 简单的颜色名称映射
  const colorNames: Record<string, string> = {
    '#ff0000': '红色',
    '#00ff00': '绿色',
    '#0000ff': '蓝色',
    '#ffff00': '黄色',
    '#ff00ff': '洋红',
    '#00ffff': '青色',
    '#000000': '黑色',
    '#ffffff': '白色',
    '#808080': '灰色'
  }
  
  return colorNames[color.toLowerCase()] || '自定义颜色'
}

const getBrightness = (color: string): number => {
  const rgb = hexToRgb(color)
  if (!rgb) return 0
  
  // 使用相对亮度公式
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return Math.round((brightness / 255) * 100)
}

const generatePalette = () => {
  const rgb = hexToRgb(currentColor.value)
  if (!rgb) return
  
  const palette: string[] = []
  
  // 生成不同亮度的变体
  for (let i = 0; i < 5; i++) {
    const factor = 0.2 + (i * 0.2)
    const r = Math.round(rgb.r * factor)
    const g = Math.round(rgb.g * factor)
    const b = Math.round(rgb.b * factor)
    palette.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
  }
  
  // 生成互补色
  const complementR = 255 - rgb.r
  const complementG = 255 - rgb.g
  const complementB = 255 - rgb.b
  palette.push(`#${complementR.toString(16).padStart(2, '0')}${complementG.toString(16).padStart(2, '0')}${complementB.toString(16).padStart(2, '0')}`)
  
  generatedPalette.value = palette
}

const savePalette = () => {
  if (generatedPalette.value.length > 0) {
    savedPalettes.value.push([...generatedPalette.value])
    ElMessage.success('调色板已保存')
  }
}

const deletePalette = (index: number) => {
  savedPalettes.value.splice(index, 1)
  ElMessage.success('调色板已删除')
}

const updateBlend = () => {
  const rgb1 = hexToRgb(blendColor1.value)
  const rgb2 = hexToRgb(blendColor2.value)
  
  if (rgb1 && rgb2) {
    const r = Math.round((rgb1.r + rgb2.r) / 2)
    const g = Math.round((rgb1.g + rgb2.g) / 2)
    const b = Math.round((rgb1.b + rgb2.b) / 2)
    blendResult.value = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
}

const updateContrast = () => {
  const rgb1 = hexToRgb(contrastColor1.value)
  const rgb2 = hexToRgb(contrastColor2.value)
  
  if (rgb1 && rgb2) {
    // 计算相对亮度
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)
    contrastRatio.value = ratio.toFixed(2)
  }
}

const getContrastRating = (ratio: string) => {
  const r = parseFloat(ratio)
  if (r >= 7) return { type: 'success', text: 'AAA级 (优秀)' }
  if (r >= 4.5) return { type: 'warning', text: 'AA级 (良好)' }
  if (r >= 3) return { type: 'danger', text: 'A级 (一般)' }
  return { type: 'danger', text: '不合格' }
}

const copyFormat = async (format: keyof ColorFormats) => {
  try {
    await copy(colorFormats[format])
    ElMessage.success(`${format.toUpperCase()} 格式已复制到剪贴板`)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearHistory = () => {
  colorHistory.value = []
  ElMessage.success('颜色历史已清空')
}

// 初始化
onColorChange(currentColor.value)
updateBlend()
updateContrast()
</script>

<style scoped>
.color-picker-container {
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

.picker-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .picker-layout {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .picker-layout {
    grid-template-columns: 1fr;
  }
}

.color-card,
.palette-card,
.tools-card,
.presets-card {
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

.palette-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.color-picker-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-picker {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-picker-main {
  transform: scale(1.5);
}

.color-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.color-brightness {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.color-formats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.format-label {
  min-width: 50px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.format-input {
  flex: 1;
}

.palette-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.generated-palette h4,
.saved-palettes h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.palette-color {
  aspect-ratio: 1;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.palette-color:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-code {
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.palette-color:hover .color-code {
  opacity: 1;
}

.saved-palette-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saved-palette-item {
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.palette-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.palette-colors {
  display: flex;
  gap: 4px;
}

.saved-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.saved-color:hover {
  transform: scale(1.2);
}

.tools-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tool-item h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.blend-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blend-operator {
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.blend-result {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
}

.contrast-check {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contrast-inputs {
  display: flex;
  gap: 8px;
}

.contrast-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contrast-ratio {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.contrast-preview {
  border-radius: 4px;
  overflow: hidden;
}

.contrast-sample {
  padding: 8px 12px;
  text-align: center;
  font-weight: 500;
}

.color-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.history-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.history-color:hover {
  transform: scale(1.2);
}

.presets-content {
  max-height: 300px;
  overflow-y: auto;
}

.presets-tabs {
  width: 100%;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.preset-color {
  aspect-ratio: 2;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-color:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.preset-color-name {
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preset-color:hover .preset-color-name {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .color-picker-container {
    padding: 16px;
  }

  .main-picker {
    flex-direction: column;
    align-items: flex-start;
  }

  .color-display {
    flex-direction: column;
    align-items: flex-start;
  }

  .format-item {
    flex-direction: column;
    align-items: stretch;
  }

  .blend-inputs {
    flex-wrap: wrap;
  }

  .contrast-inputs {
    flex-direction: column;
  }

  .palette-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .preset-colors {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 动画效果 */
.color-picker-container {
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

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .color-card,
  .palette-card,
  .tools-card,
  .presets-card {
    border-color: var(--el-border-color-dark);
  }

  .saved-palette-item {
    background: var(--el-fill-color-dark);
    border-color: var(--el-border-color-dark);
  }
}
</style>
