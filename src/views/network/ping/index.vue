<template>
  <div class="ping-container">
    <div class="header">
      <h1>Ping测试</h1>
      <p>检测与目标主机的网络连接状态和延迟</p>
    </div>
    
    <div class="main-content">
      <div class="ping-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><Connection /></el-icon>
            </span>
            <span class="title">Ping测试</span>
            <el-tooltip content="展开高级选项" placement="top" v-if="!showAdvanced">
              <el-button type="primary" text @click="showAdvanced = true">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="收起高级选项" placement="top" v-else>
              <el-button type="primary" text @click="showAdvanced = false">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          
          <div class="panel-body">
            <div class="form-group">
              <label>目标主机</label>
              <el-input 
                v-model="host" 
                placeholder="例如: example.com 或 192.168.1.1"
                @keyup.enter="startPing"
              >
                <template #prepend>
                  <el-select v-model="targetProtocol" style="width: 100px;">
                    <el-option label="IPv4" value="ipv4" />
                    <el-option label="IPv6" value="ipv6" />
                  </el-select>
                </template>
              </el-input>
              <div class="error-message" v-if="validationError">
                {{ validationError }}
              </div>
            </div>
            
            <div class="form-group">
              <label>基本选项</label>
              <div class="options-row">
                <div class="option-item">
                  <span class="option-label">数据包数量</span>
                  <el-input-number 
                    v-model="packetCount" 
                    :min="1" 
                    :max="100"
                    :step="1"
                    size="default"
                    class="input-number"
                  />
                </div>
                
                <div class="option-item">
                  <span class="option-label">间隔(秒)</span>
                  <el-input-number 
                    v-model="interval" 
                    :min="0.2" 
                    :max="5"
                    :step="0.2"
                    :precision="1"
                    size="default"
                    class="input-number"
                  />
                </div>
                
                <div class="option-item">
                  <span class="option-label">超时(秒)</span>
                  <el-input-number 
                    v-model="timeout" 
                    :min="1" 
                    :max="10"
                    :step="1"
                    size="default"
                    class="input-number"
                  />
                </div>
              </div>
            </div>
            
            <div v-if="showAdvanced" class="form-group advanced-options">
              <label>高级选项</label>
              <div class="options-row">
                <div class="option-item">
                  <span class="option-label">数据包大小</span>
                  <el-input-number 
                    v-model="packetSize" 
                    :min="32" 
                    :max="1472"
                    :step="32"
                    size="default"
                    class="input-number"
                  />
                </div>
                
                <div class="option-item">
                  <span class="option-label">TTL</span>
                  <el-input-number 
                    v-model="ttl" 
                    :min="1" 
                    :max="255"
                    :step="1"
                    size="default"
                    class="input-number"
                  />
                </div>
                
                <div class="option-item">
                  <span class="option-label">模拟丢包率(%)</span>
                  <el-slider 
                    v-model="simulatedPacketLoss" 
                    :min="0" 
                    :max="100"
                    :step="5"
                    size="default"
                    show-stops
                  />
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button 
                type="primary" 
                @click="startPing" 
                :loading="pinging" 
                :disabled="pinging" 
                class="ping-button"
              >
                <el-icon><VideoPlay /></el-icon>
                开始测试
              </el-button>
              <el-button 
                @click="stopPing" 
                :disabled="!pinging" 
                class="stop-button"
              >
                <el-icon><VideoPause /></el-icon>
                停止测试
              </el-button>
              <el-button 
                @click="resetForm" 
                :disabled="pinging" 
                class="reset-button"
              >
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
              <el-button 
                @click="addToFavorites" 
                :disabled="!host.trim()" 
                class="favorite-button"
              >
                <el-icon><StarFilled /></el-icon>
                收藏
              </el-button>
            </div>
            
            <div v-if="favorites.length > 0" class="favorites-section">
              <div class="favorites-header">
                <span>常用主机</span>
              </div>
              <div class="favorites-list">
                <el-tag 
                  v-for="(fav, index) in favorites" 
                  :key="index" 
                  closable
                  @click="selectFavorite(fav)"
                  @close="removeFavorite(index)"
                  class="favorite-tag"
                >
                  {{ fav }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel result-panel" v-show="pingStarted">
          <div class="panel-header">
            <span class="icon">
              <el-icon><DataLine /></el-icon>
            </span>
            <span class="title">测试结果</span>
            <div class="panel-actions">
              <el-button 
                type="primary" 
                plain 
                size="small" 
                class="copy-button" 
                @click="copyResults"
              >
                复制结果
              </el-button>
              <el-tooltip content="切换视图" placement="top">
                <el-button
                  type="primary"
                  text
                  @click="toggleResultView"
                >
                  <el-icon v-if="resultView === 'text'"><PieChart /></el-icon>
                  <el-icon v-else><Document /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
          
          <div class="panel-body">
            <div class="ping-stats" v-if="pingCompleted">
              <div class="stats-item">
                <div class="stats-label">发送</div>
                <div class="stats-value">{{ packetsSent }}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">接收</div>
                <div class="stats-value">{{ packetsReceived }}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">丢包率</div>
                <div class="stats-value" :class="{'stats-error': packetLoss > 0}">
                  {{ packetLoss }}%
                </div>
              </div>
              <div class="stats-item">
                <div class="stats-label">最小延迟</div>
                <div class="stats-value">{{ minLatency }}ms</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">最大延迟</div>
                <div class="stats-value">{{ maxLatency }}ms</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">平均延迟</div>
                <div class="stats-value">{{ avgLatency }}ms</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">抖动</div>
                <div class="stats-value">{{ jitter }}ms</div>
              </div>
            </div>
            
            <template v-if="resultView === 'text'">
              <div class="ping-terminal">
                <div 
                  v-for="(line, index) in pingOutput" 
                  :key="index" 
                  class="terminal-line"
                  :class="{'success-line': line.success, 'error-line': !line.success}"
                >
                  {{ line.text }}
                </div>
                <div class="terminal-cursor" v-if="pinging"></div>
              </div>
            </template>
            <template v-else>
              <div class="chart-container" v-if="latencies.length > 0">
                <div class="chart-title">延迟时间走势图 (ms)</div>
                <div class="latency-chart">
                  <el-skeleton v-if="chartLoading" :rows="6" animated />
                  <div v-else ref="chartRef" class="chart"></div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      
      <div class="info-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><InfoFilled /></el-icon>
            </span>
            <span class="title">工具说明</span>
          </div>
          
          <div class="panel-body">
            <div class="help-content">
              <h3>什么是Ping测试?</h3>
              <p>
                Ping是一种网络诊断工具，用于测试与目标主机之间的网络连接和延迟。
                它通过发送ICMP Echo请求数据包并等待响应来工作，这有助于确定网络连接的可用性和质量。
              </p>
              
              <h3>Ping测试的用途</h3>
              <ul>
                <li>检查与目标主机的网络连接是否正常</li>
                <li>测量网络延迟和数据包往返时间</li>
                <li>检测网络丢包率</li>
                <li>帮助诊断网络问题</li>
              </ul>
              
              <h3>使用方法</h3>
              <ol>
                <li>输入要测试的目标主机（域名或IP地址）</li>
                <li>调整测试选项（如需要）</li>
                <li>点击"开始测试"按钮</li>
                <li>查看实时测试结果</li>
                <li>测试完成后分析统计数据</li>
              </ol>
              
              <h3>结果解读</h3>
              <ul>
                <li><strong>延迟时间</strong>: 数据包往返所需的时间，较低的值表示更好的连接</li>
                <li><strong>丢包率</strong>: 发送但未收到回复的数据包百分比，较低的值表示更稳定的连接</li>
                <li><strong>TTL</strong>: 生存时间，表示数据包可以经过的最大路由器数量</li>
                <li><strong>抖动</strong>: 延迟波动范围，越小表示连接越稳定</li>
              </ul>
              
              <h3>注意事项</h3>
              <p>
                请注意，某些网络可能会限制或阻止ICMP数据包，这可能导致Ping测试失败，
                即使目标主机实际上是可达的。此外，此工具使用基于Web的模拟实现，
                与操作系统提供的原生Ping工具相比可能会有一些限制。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Connection, 
  VideoPlay, 
  VideoPause, 
  Refresh, 
  DataLine, 
  InfoFilled, 
  StarFilled, 
  ArrowDown, 
  ArrowUp, 
  PieChart, 
  Document 
} from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
// 简化ECharts导入
import * as echarts from 'echarts';

const { copy } = useClipboard();

// 表单数据
const host = ref('');
const packetCount = ref(4);
const interval = ref(1.0);
const timeout = ref(3);
const validationError = ref('');
const showAdvanced = ref(false);
const packetSize = ref(32);
const ttl = ref(64);
const simulatedPacketLoss = ref(10);
const targetProtocol = ref('ipv4');
const favorites = ref<string[]>([]);
const resultView = ref<'text' | 'chart'>('text');
const chartRef = ref<HTMLElement | null>(null);
const chartInstance = ref<echarts.ECharts | null>(null);
const chartLoading = ref(false);

// Ping状态
const pinging = ref(false);
const pingStarted = ref(false);
const pingCompleted = ref(false);
const pingInterval = ref<number | null>(null);
const currentPacket = ref(0);
const packetsSent = ref(0);
const packetsReceived = ref(0);
const latencies = ref<number[]>([]);
const packetTimes = ref<number[]>([]);

// 输出
const pingOutput = ref<Array<{ text: string; success: boolean }>>([]);

// 计算属性
const packetLoss = computed(() => {
  if (packetsSent.value === 0) return 0;
  return Math.round(((packetsSent.value - packetsReceived.value) / packetsSent.value) * 100);
});

const minLatency = computed(() => {
  if (latencies.value.length === 0) return 0;
  return Math.min(...latencies.value);
});

const maxLatency = computed(() => {
  if (latencies.value.length === 0) return 0;
  return Math.max(...latencies.value);
});

const avgLatency = computed(() => {
  if (latencies.value.length === 0) return 0;
  const sum = latencies.value.reduce((a, b) => a + b, 0);
  return Math.round(sum / latencies.value.length);
});

// 计算抖动 - 延迟的标准差，表示网络稳定性
const jitter = computed(() => {
  if (latencies.value.length <= 1) return 0;
  const avg = avgLatency.value;
  const squareDiffs = latencies.value.map(value => {
    const diff = value - avg;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.round(Math.sqrt(avgSquareDiff));
});

// 生命周期钩子
onMounted(() => {
  // 从本地存储加载收藏的主机
  const savedFavorites = localStorage.getItem('pingFavorites');
  if (savedFavorites) {
    try {
      favorites.value = JSON.parse(savedFavorites);
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }
});

// 在组件卸载前清除定时器和图表实例
onBeforeUnmount(() => {
  if (pingInterval.value !== null) {
    clearInterval(pingInterval.value);
    pingInterval.value = null;
  }
  
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
});

// 切换结果视图
const toggleResultView = async () => {
  resultView.value = resultView.value === 'text' ? 'chart' : 'text';
  
  if (resultView.value === 'chart' && latencies.value.length > 0) {
    chartLoading.value = true;
    await nextTick();
    initChart();
    chartLoading.value = false;
  }
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  
  chartInstance.value = echarts.init(chartRef.value);
  
  const successData = latencies.value.map((latency, index) => [index + 1, latency]);
  const timeoutData = [];
  
  for (let i = 0; i < packetsSent.value; i++) {
    if (i >= latencies.value.length || latencies.value[i] === 0) {
      timeoutData.push([i + 1, null]);
    }
  }
  
  const option = {
    title: {
      text: '响应时间统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        if (latencies.value[dataIndex]) {
          return `第 ${dataIndex + 1} 个包<br/>响应时间: ${latencies.value[dataIndex]}ms`;
        } else {
          return `第 ${dataIndex + 1} 个包<br/>超时`;
        }
      }
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '数据包序号',
      nameLocation: 'middle',
      nameGap: 30,
      minInterval: 1
    },
    yAxis: {
      type: 'value',
      name: '响应时间 (ms)',
      nameLocation: 'middle',
      nameGap: 50,
      min: 0
    },
    series: [
      {
        name: '响应时间',
        type: 'line',
        symbolSize: 8,
        data: successData,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        },
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '超时',
        type: 'scatter',
        symbolSize: 8,
        data: timeoutData,
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  };
  
  chartInstance.value.setOption(option);
  
  // 响应容器大小变化
  window.addEventListener('resize', () => {
    chartInstance.value?.resize();
  });
};

// 验证输入
const validateHost = (): boolean => {
  if (!host.value.trim()) {
    validationError.value = '请输入目标主机';
    return false;
  }
  
  // 简单的域名或IP验证
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  // 根据所选协议验证
  if (targetProtocol.value === 'ipv4') {
    if (!domainRegex.test(host.value) && !ipv4Regex.test(host.value)) {
      validationError.value = '请输入有效的域名或IPv4地址';
      return false;
    }
  } else {
    if (!domainRegex.test(host.value) && !ipv6Regex.test(host.value)) {
      validationError.value = '请输入有效的域名或IPv6地址';
      return false;
    }
  }
  
  validationError.value = '';
  return true;
};

// 重置表单
const resetForm = () => {
  host.value = '';
  packetCount.value = 4;
  interval.value = 1.0;
  timeout.value = 3;
  packetSize.value = 32;
  ttl.value = 64;
  simulatedPacketLoss.value = 10;
  validationError.value = '';
  pingOutput.value = [];
  pingStarted.value = false;
  pingCompleted.value = false;
  currentPacket.value = 0;
  packetsSent.value = 0;
  packetsReceived.value = 0;
  latencies.value = [];
  packetTimes.value = [];
  
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
};

// 开始Ping测试
const startPing = () => {
  if (!validateHost()) return;
  
  pinging.value = true;
  pingStarted.value = true;
  pingCompleted.value = false;
  pingOutput.value = [];
  currentPacket.value = 0;
  packetsSent.value = 0;
  packetsReceived.value = 0;
  latencies.value = [];
  packetTimes.value = [];
  
  // 添加初始输出
  pingOutput.value.push({ 
    text: `PING ${host.value} (${packetSize.value} 字节)...`, 
    success: true 
  });
  
  // 设置ping间隔
  pingInterval.value = window.setInterval(() => {
    sendPingRequest();
    
    // 检查是否完成
    if (currentPacket.value >= packetCount.value) {
      stopPing();
      pingCompleted.value = true;
      
      // 添加统计信息
      pingOutput.value.push({ 
        text: `\n--- ${host.value} ping 统计 ---`, 
        success: true 
      });
      pingOutput.value.push({ 
        text: `${packetsSent.value} 个包已发送, ${packetsReceived.value} 个包已接收, ${packetLoss.value}% 的丢包率`, 
        success: packetLoss.value === 0 
      });
      
      if (packetsReceived.value > 0) {
        pingOutput.value.push({ 
          text: `往返时间: 最小 = ${minLatency.value}ms, 最大 = ${maxLatency.value}ms, 平均 = ${avgLatency.value}ms, 抖动 = ${jitter.value}ms`, 
          success: true 
        });
      }
      
      // 延迟绘制图表
      if (resultView.value === 'chart') {
        nextTick(() => {
          initChart();
        });
      }
    }
  }, interval.value * 1000);
};

// 发送Ping请求
const sendPingRequest = () => {
  currentPacket.value++;
  packetsSent.value++;
  packetTimes.value.push(Date.now());
  
  // 这里是模拟Ping，实际项目中应该使用真实的API
  const startTime = Date.now();
  const responseTime = simulatePingResponse();
  
  if (responseTime !== null) {
    // 成功收到响应
    packetsReceived.value++;
    latencies.value.push(responseTime);
    
    // 使用设置的TTL值
    pingOutput.value.push({ 
      text: `收到来自 ${host.value} 的响应: 字节=${packetSize.value} 时间=${responseTime}ms TTL=${ttl.value}`, 
      success: true 
    });
  } else {
    // 请求超时
    latencies.value.push(0); // 用0表示超时，便于图表显示
    pingOutput.value.push({ 
      text: `请求超时。`, 
      success: false 
    });
  }
  
  // 如果是图表视图，实时更新
  if (resultView.value === 'chart' && chartInstance.value) {
    updateChart();
  }
};

// 更新图表数据
const updateChart = () => {
  if (!chartInstance.value) return;
  
  const successData = latencies.value.map((latency, index) => 
    latency > 0 ? [index + 1, latency] : null).filter(Boolean);
  
  const timeoutData = latencies.value.map((latency, index) => 
    latency === 0 ? [index + 1, null] : null).filter(Boolean);
  
  chartInstance.value.setOption({
    series: [
      {
        data: successData
      },
      {
        data: timeoutData
      }
    ]
  });
};

// 模拟Ping响应
const simulatePingResponse = (): number | null => {
  // 使用设置的丢包率
  const random = Math.random() * 100;
  
  if (random < simulatedPacketLoss.value) {
    // 模拟丢包
    return null;
  }
  
  // 模拟响应时间 (10-200ms)
  const baseLatency = 10 + Math.floor(Math.random() * 40);
  
  // 偶尔添加一些抖动
  if (random > 80) {
    return baseLatency + Math.floor(Math.random() * 150);
  }
  
  return baseLatency;
};

// 停止Ping测试
const stopPing = () => {
  if (pingInterval.value !== null) {
    clearInterval(pingInterval.value);
    pingInterval.value = null;
  }
  
  pinging.value = false;
};

// 复制结果
const copyResults = async () => {
  if (pingOutput.value.length === 0) return;
  
  const text = pingOutput.value.map(line => line.text).join('\n');
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 添加到收藏
const addToFavorites = () => {
  if (!host.value.trim() || favorites.value.includes(host.value)) return;
  
  favorites.value.push(host.value);
  localStorage.setItem('pingFavorites', JSON.stringify(favorites.value));
  ElMessage.success(`已将 ${host.value} 添加到收藏`);
};

// 从收藏中移除
const removeFavorite = (index: number) => {
  favorites.value.splice(index, 1);
  localStorage.setItem('pingFavorites', JSON.stringify(favorites.value));
  ElMessage.success('已从收藏中移除');
};

// 选择收藏的主机
const selectFavorite = (favorite: string) => {
  host.value = favorite;
};
</script>

<style scoped>
.ping-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: var(--el-text-color-primary);
}

.header {
  margin-bottom: 32px;
  text-align: left;
  position: relative;
  padding-left: 16px;
}

.header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  height: 28px;
  width: 4px;
  background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-3));
  border-radius: 4px;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  position: relative;
}

.header p {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0;
  opacity: 0.85;
}

.main-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 28px;
}

.ping-section {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.panel {
  background-color: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel:hover {
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.08);
  transform: translateY(-4px);
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
  background-color: var(--el-fill-color-light);
}

.panel-header .icon {
  margin-right: 12px;
  width: 32px;
  height: 32px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  transition: transform 0.3s;
}

.panel:hover .panel-header .icon {
  transform: scale(1.1);
}

.panel-header .title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
  background: linear-gradient(90deg, var(--el-text-color-primary), var(--el-text-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.panel-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
  font-weight: 500;
  position: relative;
  padding-left: 12px;
}

.form-group label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  background-color: #409eff;
  border-radius: 2px;
  opacity: 0.7;
}

.error-message {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 6px;
  padding-left: 4px;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.advanced-options {
  background-color: var(--el-fill-color-light);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  border: 1px dashed var(--el-border-color);
  animation: fadeIn 0.3s;
  transition: all 0.3s;
}

.options-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.option-item {
  flex: 1;
  min-width: 150px;
}

.option-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.action-buttons .el-button {
  transition: all 0.3s;
}

.ping-button {
  flex: 2;
  box-shadow: 0 3px 10px rgba(64, 158, 255, 0.2);
}

.ping-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

.stop-button, .reset-button, .favorite-button {
  flex: 1;
}

.favorites-section {
  margin-top: 20px;
  border-top: 1px dashed var(--el-border-color-light);
  padding-top: 20px;
  animation: fadeIn 0.3s;
}

.favorites-header {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
  font-weight: 500;
}

.favorites-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.favorite-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-tag:hover {
  transform: translateY(-2px);
}

.chart-container {
  height: 420px;
  width: 100%;
  animation: fadeIn 0.5s;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.chart {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.ping-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
  background-color: var(--el-fill-color-light);
  border-radius: 12px;
  padding: 20px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
}

.stats-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stats-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.stats-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.stats-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stats-value.success {
  color: var(--el-color-success);
}

.stats-value.warning {
  color: var(--el-color-warning);
}

.stats-value.danger {
  color: var(--el-color-danger);
}

.stats-secondary {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  opacity: 0.8;
}

.stats-error {
  color: var(--el-color-danger);
}

.ping-terminal {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  background-color: var(--el-bg-color-darker, #1a1a1a);
  color: var(--el-text-color-primary, #d4d4d4);
  border-radius: 12px;
  padding: 20px;
  min-height: 320px;
  max-height: 420px;
  overflow-y: auto;
  white-space: pre-wrap;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s;
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) var(--el-bg-color-darker, #1a1a1a);
}

.ping-terminal::-webkit-scrollbar {
  width: 8px;
}

.ping-terminal::-webkit-scrollbar-track {
  background: var(--el-bg-color-darker, #1a1a1a);
  border-radius: 8px;
}

.ping-terminal::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color);
  border-radius: 8px;
  border: 2px solid var(--el-bg-color-darker, #1a1a1a);
}

.terminal-line {
  line-height: 1.6;
  margin-bottom: 6px;
  transition: opacity 0.2s;
  opacity: 0.9;
}

.terminal-line:hover {
  opacity: 1;
}

.success-line {
  color: var(--el-color-success);
}

.error-line {
  color: var(--el-color-danger);
}

.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 18px;
  background-color: var(--el-text-color-primary, rgba(212, 212, 212, 0.8));
  animation: blink 1s step-end infinite;
  margin-left: 4px;
  vertical-align: middle;
  border-radius: 1px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.help-content {
  line-height: 1.7;
}

.help-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px;
  color: var(--el-text-color-primary);
  position: relative;
  padding-left: 16px;
}

.help-content h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 0 0 14px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.help-content ul, .help-content ol {
  padding-left: 20px;
  margin: 14px 0;
}

.help-content li {
  margin-bottom: 10px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
  position: relative;
  padding-left: 5px;
}

.help-content strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
  background-color: var(--el-color-primary-light-9);
  padding: 0 5px;
  border-radius: 3px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .panel {
    border-radius: 12px;
  }
}

@media (max-width: 768px) {
  .ping-container {
    padding: 16px;
  }
  
  .header {
    margin-bottom: 24px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .header p {
    font-size: 14px;
  }
  
  .panel-header {
    padding: 15px 20px;
  }
  
  .panel-body {
    padding: 20px;
  }
  
  .form-group label {
    font-size: 13px;
  }
  
  .options-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .option-item {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .ping-button, .stop-button, .reset-button, .favorite-button {
    width: 100%;
  }
  
  .chart-container {
    height: 360px;
  }
  
  .ping-stats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .ping-stats {
    grid-template-columns: 1fr;
  }
  
  .ping-terminal {
    min-height: 280px;
    padding: 16px;
  }
  
  .chart-container {
    height: 300px;
  }
}

.stat-card {
  padding: 16px;
  border-radius: 10px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.stat-card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  text-align: center;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-blank);
  border-radius: 8px;
  border: 1px dashed var(--el-border-color);
  margin: 20px 0;
}

.empty-text {
  font-size: 15px;
  margin-top: 12px;
  color: var(--el-text-color-secondary);
}

.ping-table-wrapper {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  margin-top: 20px;
}

.ping-table {
  width: 100%;
  border-collapse: collapse;
}

.ping-table th {
  background-color: var(--el-fill-color-light);
  padding: 12px 15px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
}

.ping-table td {
  padding: 12px 15px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.2s;
}

.ping-table tr:hover td {
  background-color: var(--el-fill-color-lighter);
}
</style> 