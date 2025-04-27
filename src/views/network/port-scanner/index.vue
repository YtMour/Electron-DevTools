<template>
  <div class="network-tool-page">
    <div class="page-header">
      <div class="header-title">
        <h2>端口扫描器</h2>
        <p class="header-desc">扫描远程主机的开放端口，检测网络服务可用性</p>
      </div>
    </div>
    
    <div class="page-content main-sidebar">
      <div class="main-content-left">
        <el-card class="network-card config-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><ScaleToOriginal /></el-icon>
            </div>
            <div class="card-title">扫描配置</div>
          </div>
          
          <div class="form-group">
            <label>主机地址</label>
            <el-input 
              v-model="form.host" 
              placeholder="例如: example.com 或 192.168.1.1"
              @keyup.enter="startScan"
            />
            <div class="validation-error" v-if="validationErrors.host">
              {{ validationErrors.host }}
            </div>
          </div>
          
          <div class="form-group">
            <label>端口范围</label>
            <div class="port-range-inputs">
              <el-input-number 
                v-model="form.startPort" 
                :min="1" 
                :max="65535"
                :step="1"
                placeholder="开始端口"
                controls-position="right"
                size="default"
                class="port-input"
              />
              <span class="port-range-separator">至</span>
              <el-input-number 
                v-model="form.endPort" 
                :min="1" 
                :max="65535"
                :step="1"
                placeholder="结束端口"
                controls-position="right"
                size="default"
                class="port-input"
              />
            </div>
            <div class="validation-error" v-if="validationErrors.ports">
              {{ validationErrors.ports }}
            </div>
          </div>
          
          <div class="form-group">
            <label>扫描类型</label>
            <el-radio-group v-model="form.scanType">
              <el-radio label="quick">快速扫描（常用端口）</el-radio>
              <el-radio label="custom">自定义端口范围</el-radio>
            </el-radio-group>
          </div>
          
          <div class="form-group" v-if="form.scanType === 'quick'">
            <label>预设端口组</label>
            <el-select v-model="form.portPreset" placeholder="选择预设端口组" class="port-preset-select">
              <el-option label="常用服务端口 (20-25, 80, 443...)" value="common" />
              <el-option label="全部常见端口 (1-1024)" value="wellknown" />
              <el-option label="Web服务 (80, 443, 8080...)" value="web" />
              <el-option label="数据库服务 (3306, 5432...)" value="database" />
              <el-option label="邮件服务 (25, 110, 143...)" value="mail" />
            </el-select>
          </div>
          
          <div class="form-group">
            <label>超时设置 (毫秒)</label>
            <el-slider 
              v-model="form.timeout" 
              :min="500" 
              :max="10000" 
              :step="500"
              :format-tooltip="formatTooltip"
            />
          </div>
          
          <div class="action-buttons">
            <el-button type="primary" @click="startScan" :loading="scanning" :disabled="scanning">
              <el-icon><VideoPlay /></el-icon>
              开始扫描
            </el-button>
            <el-button @click="resetForm" :disabled="scanning">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
          
          <div v-if="scanning" class="scanning-progress">
            <div class="progress-title">
              <span>正在扫描端口: {{ currentPort }}/{{ totalPorts }}</span>
              <span class="progress-percentage">{{ Math.round(scanProgress) }}%</span>
            </div>
            <el-progress :percentage="scanProgress" :stroke-width="10" />
          </div>
        </el-card>
        
        <el-card v-if="scanResults.length > 0" class="network-card result-card">
          <div class="card-header">
            <div class="card-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="card-title">扫描结果</div>
            <div class="header-actions">
              <el-button type="primary" plain size="small" class="copy-button" @click="copyResults">
                <el-icon><CopyDocument /></el-icon>
                复制结果
              </el-button>
            </div>
          </div>
          
          <div class="result-content">
            <div class="scan-info">
              <div class="info-items">
                <div class="info-item">
                  <div class="label">主机</div>
                  <div class="value">{{ form.host }}</div>
                </div>
                <div class="info-item">
                  <div class="label">扫描范围</div>
                  <div class="value">{{ getPortRangeText() }}</div>
                </div>
                <div class="info-item">
                  <div class="label">扫描时间</div>
                  <div class="value">{{ scanDuration }} 秒</div>
                </div>
                <div class="info-item">
                  <div class="label">开放端口</div>
                  <div class="value">{{ getOpenPortsCount() }}</div>
                </div>
              </div>
            </div>
            
            <div class="table-container">
              <el-table 
                :data="scanResults" 
                style="width: 100%"
                :stripe="true"
                class="result-table">
                <el-table-column prop="port" label="端口" width="100" sortable />
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="scope">
                    <span :class="getPortStatusClass(scope.row.status)">{{ scope.row.status }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="service" label="服务" />
                <el-table-column prop="description" label="描述" />
              </el-table>
            </div>
          </div>
        </el-card>
      </div>
      
      <el-card class="network-card info-card">
        <div class="card-header">
          <div class="card-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <div class="card-title">工具说明</div>
        </div>
        
        <div class="help-content">
          <h4>什么是端口扫描?</h4>
          <p>
            端口扫描是一种用于检测服务器或主机上开放的TCP/UDP端口的技术。
            通过扫描可以了解主机上运行的网络服务，帮助诊断网络问题或评估安全状况。
          </p>
          
          <h4>使用方法</h4>
          <ol>
            <li>输入要扫描的主机地址（域名或IP地址）</li>
            <li>选择扫描类型（快速扫描或自定义端口范围）</li>
            <li>设置超时时间（越长越准确，但扫描时间更长）</li>
            <li>点击"开始扫描"按钮</li>
          </ol>
          
          <h4>端口状态说明</h4>
          <ul>
            <li><strong class="status-open">开放</strong>: 端口接受连接，相应服务正在运行</li>
            <li><strong class="status-closed">关闭</strong>: 端口不接受连接，没有服务在监听</li>
            <li><strong class="status-filtered">过滤</strong>: 无法确定端口状态，可能被防火墙过滤</li>
          </ul>
          
          <h4>常见端口及服务</h4>
          <ul>
            <li><strong>20, 21</strong> - FTP (文件传输协议)</li>
            <li><strong>22</strong> - SSH (安全shell)</li>
            <li><strong>23</strong> - Telnet</li>
            <li><strong>25</strong> - SMTP (邮件发送)</li>
            <li><strong>53</strong> - DNS (域名解析)</li>
            <li><strong>80</strong> - HTTP (网页服务)</li>
            <li><strong>443</strong> - HTTPS (安全网页服务)</li>
            <li><strong>3306</strong> - MySQL 数据库</li>
            <li><strong>5432</strong> - PostgreSQL 数据库</li>
            <li><strong>8080</strong> - 常用的替代HTTP端口</li>
          </ul>
          
          <h4>注意事项</h4>
          <p>
            请仅在授权的情况下使用此工具扫描主机。未经授权的端口扫描在某些情况下可能违反法律或服务提供商的使用条款。
            此工具设计用于合法的网络诊断和教育目的。
          </p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { ScaleToOriginal, VideoPlay, Refresh, DataAnalysis, InfoFilled, CopyDocument } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  host: '',
  startPort: 1,
  endPort: 1024,
  scanType: 'quick',
  portPreset: 'common',
  timeout: 2000,
});

// 验证错误
const validationErrors = reactive({
  host: '',
  ports: '',
});

// 扫描状态
const scanning = ref(false);
const scanProgress = ref(0);
const currentPort = ref(0);
const totalPorts = ref(0);
const scanDuration = ref(0);
const scanStartTime = ref(0);

// 扫描结果
const scanResults = ref<Array<{
  port: number;
  status: string;
  service: string;
  description: string;
}>>([]);

// 常用端口和服务映射
const commonServices: Record<number, { service: string; description: string }> = {
  20: { service: 'FTP-DATA', description: 'FTP数据传输' },
  21: { service: 'FTP', description: 'FTP控制' },
  22: { service: 'SSH', description: '安全Shell' },
  23: { service: 'TELNET', description: '远程登录协议' },
  25: { service: 'SMTP', description: '简单邮件传输协议' },
  53: { service: 'DNS', description: '域名服务' },
  80: { service: 'HTTP', description: '超文本传输协议' },
  110: { service: 'POP3', description: '邮局协议版本3' },
  143: { service: 'IMAP', description: '因特网消息访问协议' },
  443: { service: 'HTTPS', description: '安全超文本传输协议' },
  465: { service: 'SMTPS', description: '安全SMTP' },
  587: { service: 'SUBMISSION', description: '邮件提交代理' },
  993: { service: 'IMAPS', description: '安全IMAP' },
  995: { service: 'POP3S', description: '安全POP3' },
  1433: { service: 'MS-SQL', description: 'Microsoft SQL Server' },
  3306: { service: 'MYSQL', description: 'MySQL数据库' },
  5432: { service: 'POSTGRES', description: 'PostgreSQL数据库' },
  8080: { service: 'HTTP-ALT', description: '替代HTTP端口' },
  8443: { service: 'HTTPS-ALT', description: '替代HTTPS端口' },
};

// 预设端口组
const portPresets = {
  common: [21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 465, 587, 993, 995, 1433, 3306, 3389, 5432, 8080, 8443],
  wellknown: Array.from({ length: 1024 }, (_, i) => i + 1),
  web: [80, 443, 8080, 8443, 8000, 8008, 8888, 3000, 4000, 5000],
  database: [1433, 1521, 3306, 5432, 6379, 27017, 5984, 9200],
  mail: [25, 110, 143, 465, 587, 993, 995],
};

// 验证输入
const validateForm = () => {
  let isValid = true;
  
  // 验证主机
  if (!form.host.trim()) {
    validationErrors.host = '请输入主机地址';
    isValid = false;
  } else {
    validationErrors.host = '';
  }
  
  // 验证端口范围
  if (form.scanType === 'custom') {
    if (form.startPort > form.endPort) {
      validationErrors.ports = '起始端口不能大于结束端口';
      isValid = false;
    } else if (form.endPort - form.startPort > 1000) {
      validationErrors.ports = '为提高性能，一次最多扫描1000个端口';
      isValid = false;
    } else {
      validationErrors.ports = '';
    }
  } else {
    validationErrors.ports = '';
  }
  
  return isValid;
};

// 重置表单
const resetForm = () => {
  form.host = '';
  form.startPort = 1;
  form.endPort = 1024;
  form.scanType = 'quick';
  form.portPreset = 'common';
  form.timeout = 2000;
  
  validationErrors.host = '';
  validationErrors.ports = '';
  
  scanResults.value = [];
  scanProgress.value = 0;
  scanDuration.value = 0;
};

// 开始扫描
const startScan = async () => {
  if (!validateForm()) return;
  
  scanning.value = true;
  scanResults.value = [];
  scanProgress.value = 0;
  scanStartTime.value = Date.now();
  
  try {
    // 确定要扫描的端口
    let portsToScan: number[] = [];
    
    if (form.scanType === 'quick') {
      portsToScan = [...portPresets[form.portPreset as keyof typeof portPresets]];
    } else {
      // 生成自定义范围内的端口
      portsToScan = Array.from(
        { length: form.endPort - form.startPort + 1 },
        (_, i) => form.startPort + i
      );
    }
    
    totalPorts.value = portsToScan.length;
    
    // 这里是模拟扫描，实际项目中应该使用真实的端口扫描API
    for (let i = 0; i < portsToScan.length; i++) {
      const port = portsToScan[i];
      currentPort.value = i + 1;
      scanProgress.value = ((i + 1) / portsToScan.length) * 100;
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 模拟随机状态
      const random = Math.random();
      let status: string;
      
      if (port === 80 || port === 443 || port === 22 || random < 0.3) {
        status = '开放';
      } else if (random < 0.7) {
        status = '关闭';
      } else {
        status = '过滤';
      }
      
      // 只添加开放或过滤的端口到结果
      if (status !== '关闭') {
        const serviceInfo = commonServices[port] || { service: 'unknown', description: '未知服务' };
        
        scanResults.value.push({
          port,
          status,
          service: serviceInfo.service,
          description: serviceInfo.description
        });
      }
    }
    
    scanDuration.value = ((Date.now() - scanStartTime.value) / 1000).toFixed(2) as unknown as number;
    ElMessage.success(`端口扫描完成，发现 ${getOpenPortsCount()} 个开放端口`);
    
  } catch (error) {
    ElMessage.error(`扫描失败: ${(error as Error).message}`);
  } finally {
    scanning.value = false;
  }
};

// 获取端口范围文本
const getPortRangeText = () => {
  if (form.scanType === 'quick') {
    if (form.portPreset === 'common') return '常用服务端口';
    if (form.portPreset === 'wellknown') return '全部常见端口 (1-1024)';
    if (form.portPreset === 'web') return 'Web服务端口';
    if (form.portPreset === 'database') return '数据库服务端口';
    if (form.portPreset === 'mail') return '邮件服务端口';
    return '';
  }
  
  return `${form.startPort}-${form.endPort}`;
};

// 获取开放端口数量
const getOpenPortsCount = () => {
  return scanResults.value.filter(r => r.status === '开放').length;
};

// 获取端口状态CSS类
const getPortStatusClass = (status: string) => {
  switch (status) {
    case '开放': return 'port-status-open';
    case '关闭': return 'port-status-closed';
    case '过滤': return 'port-status-filtered';
    default: return '';
  }
};

// 复制结果
const copyResults = async () => {
  if (scanResults.value.length === 0) return;
  
  const text = `
主机: ${form.host}
扫描范围: ${getPortRangeText()}
扫描时间: ${scanDuration} 秒
开放端口: ${getOpenPortsCount()}

端口  状态  服务  描述
${scanResults.value.map(r => `${r.port}  ${r.status}  ${r.service}  ${r.description}`).join('\n')}
  `.trim();
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 格式化工具提示
const formatTooltip = (value: number): string => {
  return `${value} ms`;
};
</script>

<style lang="scss" scoped>
.main-content-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.port-range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.port-range-separator {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.port-input {
  flex: 1;
}

.port-preset-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.scanning-progress {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.progress-percentage {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-left: 10px;
}

.scan-info {
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item .label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  font-family: var(--el-font-family-monospace, monospace);
  font-weight: 500;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.result-table {
  margin-bottom: 16px;
}

.port-status-open {
  color: var(--el-color-success);
  font-weight: 600;
}

.port-status-closed {
  color: var(--el-color-danger);
}

.port-status-filtered {
  color: var(--el-color-warning);
}

.validation-error {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 5px;
}

.status-open {
  color: var(--el-color-success);
}

.status-closed {
  color: var(--el-color-danger);
}

.status-filtered {
  color: var(--el-color-warning);
}

@media (max-width: 1200px) {
  .page-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .port-range-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .port-range-separator {
    text-align: center;
    margin: 5px 0;
  }
  
  .header-actions {
    margin-top: 10px;
  }
  
  .info-items {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .scan-info {
    padding: 12px;
  }
  
  .info-item .label {
    font-size: 12px;
  }
  
  .info-item .value {
    font-size: 13px;
  }
}
</style> 