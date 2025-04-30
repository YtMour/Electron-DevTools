<template>
  <div class="ping-test-container">
    <div v-if="!pingStats && !isPinging" class="start-test">
      <div class="ping-intro">
        <p>Ping测试可以测量到目标主机的网络延迟和连通性。</p>
        <p>点击下方按钮开始测试。</p>
      </div>
      <el-button type="primary" @click="$emit('start-ping')" :disabled="!host">
        <el-icon><Video Play /></el-icon>
        开始Ping测试
      </el-button>
    </div>
    
    <div v-else-if="isPinging" class="pinging">
      <div class="pinging-animation">
        <el-icon class="pinging-icon"><Loading /></el-icon>
        <div class="pinging-text">
          正在测试 {{ host }} 的网络连通性...
        </div>
      </div>
    </div>
    
    <div v-else-if="pingStats" class="ping-results">
      <!-- 延迟走势图 -->
      <div class="ping-chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
      
      <!-- Ping测试统计 -->
      <div class="ping-stats-container">
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-label">主机</div>
            <div class="stats-value">{{ pingStats.host }}</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-label">发送包数</div>
            <div class="stats-value">{{ pingStats.sent }}</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-label">接收包数</div>
            <div class="stats-value">{{ pingStats.received }}</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-label">丢包率</div>
            <div class="stats-value" :class="{ 'high-loss': pingStats.lossRate > 0.1 }">
              {{ (pingStats.lossRate * 100).toFixed(1) }}%
            </div>
          </div>
          
          <div class="stats-item">
            <div class="stats-label">最小延迟</div>
            <div class="stats-value">{{ pingStats.min }} ms</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-label">最大延迟</div>
            <div class="stats-value">{{ pingStats.max }} ms</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-label">平均延迟</div>
            <div 
              class="stats-value" 
              :class="{
                'good-latency': pingStats.avg < 100,
                'medium-latency': pingStats.avg >= 100 && pingStats.avg < 200,
                'high-latency': pingStats.avg >= 200
              }"
            >
              {{ pingStats.avg }} ms
            </div>
          </div>
        </div>
        
        <!-- 详细结果 -->
        <div class="ping-details">
          <div class="details-title">测试详情</div>
          <div class="details-list">
            <div 
              v-for="(result, index) in pingStats.results" 
              :key="index"
              class="detail-item"
              :class="{ 'failed': !result.success }"
            >
              <span class="detail-index">#{{ index + 1 }}</span>
              <span class="detail-time">
                {{ new Date(result.timestamp).toLocaleTimeString() }}
              </span>
              <span class="detail-result">
                {{ result.success ? `${result.latency} ms` : '超时' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="ping-actions">
          <el-button type="primary" @click="$emit('start-ping')" :disabled="isPinging">
            再次测试
          </el-button>
        </div>
      </div>
    </div>
    
    <el-empty v-else description="无Ping测试数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, watchEffect, nextTick } from 'vue';
import { VideoPlay, Loading } from '@element-plus/icons-vue';
import type { PingStatistics } from '@/utils/network/ping';
import Chart from 'chart.js/auto';

const props = defineProps<{
  host?: string;
  pingStats?: PingStatistics | null;
  isPinging: boolean;
}>();

const emit = defineEmits<{
  'start-ping': [];
}>();

// 图表引用
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chart = ref<Chart | null>(null);

// 每当pingStats改变时更新图表
watchEffect(() => {
  if (props.pingStats && chartCanvas.value) {
    nextTick(() => {
      renderChart();
    });
  }
});

// 渲染图表
const renderChart = () => {
  if (!props.pingStats || !chartCanvas.value) return;
  
  // 如果已经有图表，先销毁
  if (chart.value) {
    chart.value.destroy();
  }
  
  // 准备数据
  const labels = props.pingStats.results.map((_, i) => `#${i + 1}`);
  const data = props.pingStats.results.map(r => r.success ? r.latency : null);
  
  // 创建图表
  chart.value = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '延迟 (ms)',
        data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
        pointBackgroundColor: data.map(val => 
          val === null ? 'rgb(255, 99, 132)' : 
          val < 100 ? 'rgb(75, 192, 192)' : 
          val < 200 ? 'rgb(255, 205, 86)' : 
          'rgb(255, 99, 132)'
        ),
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Ping: ${props.pingStats.host}`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const dataIndex = context.dataIndex;
              const result = props.pingStats!.results[dataIndex];
              
              if (!result.success) {
                return '超时';
              }
              
              return `延迟: ${result.latency} ms`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '延迟 (ms)'
          },
          ticks: {
            callback: (value: any) => `${value} ms`
          }
        }
      }
    }
  });
};
</script>

<style scoped>
.ping-test-container {
  padding: 12px 0;
}

.start-test {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.ping-intro {
  text-align: center;
  margin-bottom: 20px;
  color: var(--el-text-color-secondary);
}

.pinging {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pinging-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pinging-icon {
  font-size: 36px;
  color: var(--el-color-primary);
  animation: spin 1.5s linear infinite;
}

.pinging-text {
  margin-top: 16px;
  color: var(--el-text-color-primary);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ping-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ping-chart-container {
  height: 240px;
  position: relative;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.stats-item {
  display: flex;
  flex-direction: column;
}

.stats-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stats-value {
  font-size: 16px;
  font-weight: 500;
}

.good-latency {
  color: var(--el-color-success);
}

.medium-latency {
  color: var(--el-color-warning);
}

.high-latency {
  color: var(--el-color-danger);
}

.high-loss {
  color: var(--el-color-danger);
}

.ping-details {
  margin-top: 16px;
}

.details-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.detail-item {
  display: flex;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: var(--el-fill-color-lighter);
  font-size: 13px;
}

.detail-item.failed {
  background-color: var(--el-color-danger-light-9);
}

.detail-index {
  width: 30px;
  font-weight: 600;
}

.detail-time {
  flex: 1;
  color: var(--el-text-color-secondary);
}

.detail-result {
  font-weight: 500;
}

.detail-item.failed .detail-result {
  color: var(--el-color-danger);
}

.ping-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 