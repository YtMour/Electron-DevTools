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
          </div>
          
          <div class="panel-body">
            <div class="form-group">
              <label>目标主机</label>
              <el-input 
                v-model="host" 
                placeholder="例如: example.com 或 192.168.1.1"
                @keyup.enter="startPing"
              />
              <div class="error-message" v-if="validationError">
                {{ validationError }}
              </div>
            </div>
            
            <div class="form-group">
              <label>选项</label>
              <div class="options-row">
                <div class="option-item">
                  <span class="option-label">数据包数量</span>
                  <el-input-number 
                    v-model="packetCount" 
                    :min="1" 
                    :max="50"
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
            </div>
          </div>
        </div>
        
        <div class="panel result-panel" v-show="pingStarted">
          <div class="panel-header">
            <span class="icon">
              <el-icon><DataLine /></el-icon>
            </span>
            <span class="title">测试结果</span>
            <el-button 
              type="primary" 
              plain 
              size="small" 
              class="copy-button" 
              @click="copyResults"
            >
              复制结果
            </el-button>
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
            </div>
            
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
import { ref, computed, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection, VideoPlay, VideoPause, Refresh, DataLine, InfoFilled } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const host = ref('');
const packetCount = ref(4);
const interval = ref(1.0);
const timeout = ref(3);
const validationError = ref('');

// Ping状态
const pinging = ref(false);
const pingStarted = ref(false);
const pingCompleted = ref(false);
const pingInterval = ref<number | null>(null);
const currentPacket = ref(0);
const packetsSent = ref(0);
const packetsReceived = ref(0);
const latencies = ref<number[]>([]);

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

// 在组件卸载前清除定时器
onBeforeUnmount(() => {
  if (pingInterval.value !== null) {
    clearInterval(pingInterval.value);
    pingInterval.value = null;
  }
});

// 验证输入
const validateHost = (): boolean => {
  if (!host.value.trim()) {
    validationError.value = '请输入目标主机';
    return false;
  }
  
  // 简单的域名或IP验证
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  if (!domainRegex.test(host.value) && !ipRegex.test(host.value)) {
    validationError.value = '请输入有效的域名或IP地址';
    return false;
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
  validationError.value = '';
  pingOutput.value = [];
  pingStarted.value = false;
  pingCompleted.value = false;
  currentPacket.value = 0;
  packetsSent.value = 0;
  packetsReceived.value = 0;
  latencies.value = [];
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
  
  // 添加初始输出
  pingOutput.value.push({ 
    text: `PING ${host.value} 请求数据...`, 
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
          text: `往返时间: 最小 = ${minLatency.value}ms, 最大 = ${maxLatency.value}ms, 平均 = ${avgLatency.value}ms`, 
          success: true 
        });
      }
    }
  }, interval.value * 1000);
};

// 发送Ping请求
const sendPingRequest = () => {
  currentPacket.value++;
  packetsSent.value++;
  
  // 这里是模拟Ping，实际项目中应该使用真实的API
  const startTime = Date.now();
  const responseTime = simulatePingResponse();
  
  if (responseTime !== null) {
    // 成功收到响应
    packetsReceived.value++;
    latencies.value.push(responseTime);
    
    const ttl = Math.floor(Math.random() * 64) + 1; // 模拟TTL值
    pingOutput.value.push({ 
      text: `收到来自 ${host.value} 的响应: 字节=32 时间=${responseTime}ms TTL=${ttl}`, 
      success: true 
    });
  } else {
    // 请求超时
    pingOutput.value.push({ 
      text: `请求超时。`, 
      success: false 
    });
  }
};

// 模拟Ping响应
const simulatePingResponse = (): number | null => {
  // 模拟响应时间和偶尔的超时
  const random = Math.random();
  
  if (random < 0.1) {
    // 模拟10%的丢包率
    return null;
  }
  
  // 模拟响应时间 (10-200ms)
  const baseLatency = 10 + Math.floor(Math.random() * 40);
  
  // 偶尔添加一些抖动
  if (random > 0.8) {
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
</script>

<style scoped>
.ping-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header {
  margin-bottom: 24px;
  text-align: left;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  background: linear-gradient(90deg, #409eff, #79bbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}

.ping-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.panel:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.panel-header .icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  background-color: #ecf5ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.panel-header .title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.panel-header .copy-button {
  position: absolute;
  right: 20px;
  padding: 6px 12px;
}

.panel-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.option-label {
  font-size: 13px;
  color: #606266;
}

.input-number {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.ping-button {
  flex: 2;
}

.stop-button, .reset-button {
  flex: 1;
}

.ping-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-label {
  font-size: 13px;
  color: #909399;
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  font-family: monospace;
}

.stats-error {
  color: #f56c6c;
}

.ping-terminal {
  font-family: 'Courier New', monospace;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  padding: 16px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  position: relative;
}

.terminal-line {
  line-height: 1.6;
  margin-bottom: 4px;
}

.success-line {
  color: #98c379;
}

.error-line {
  color: #e06c75;
}

.terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background-color: #d4d4d4;
  animation: blink 1s step-end infinite;
  margin-left: 4px;
  vertical-align: middle;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.help-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 10px;
  color: #303133;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #606266;
}

.help-content ul, .help-content ol {
  padding-left: 20px;
  margin: 12px 0;
}

.help-content li {
  margin-bottom: 8px;
  color: #606266;
  line-height: 1.6;
}

.help-content strong {
  color: #303133;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ping-container {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .header p {
    font-size: 14px;
  }
  
  .options-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .option-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .ping-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .ping-terminal {
    min-height: 200px;
  }
  
  .panel-header .copy-button {
    position: relative;
    right: auto;
    margin-top: 10px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .ping-stats {
    grid-template-columns: 1fr;
  }
  
  .stats-item {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .ping-terminal {
    font-size: 13px;
    padding: 12px;
  }
  
  .help-content h3 {
    font-size: 15px;
  }
  
  .help-content p, .help-content li {
    font-size: 13px;
  }
}
</style> 