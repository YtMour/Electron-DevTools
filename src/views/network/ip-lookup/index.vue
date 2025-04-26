<template>
  <div class="ip-lookup-container">
    <div class="header">
      <h1>IP 地址查询</h1>
      <p>查询 IP 地址的详细信息，包括地理位置、ISP 提供商和网络信息</p>
    </div>
    
    <div class="main-content">
      <div class="lookup-section">
        <div class="panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><Search /></el-icon>
            </span>
            <span class="title">输入 IP 地址</span>
          </div>
          
          <div class="panel-body">
            <div class="form-group">
              <label>IP 地址或域名</label>
              <el-input 
                v-model="ipAddress" 
                placeholder="例如: 8.8.8.8 或 example.com"
                @keyup.enter="lookupIP"
              />
              <div class="error-message" v-if="validationError">
                {{ validationError }}
              </div>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="lookupIP" :loading="loading" class="lookup-button">
                <el-icon><Search /></el-icon>
                查询 IP 信息
              </el-button>
              <el-button @click="useMyIP" :disabled="loading" class="my-ip-button">
                <el-icon><Monitor /></el-icon>
                使用我的 IP
              </el-button>
            </div>
            
            <div v-if="recentSearches.length > 0" class="recent-searches">
              <div class="recent-title">最近查询</div>
              <div class="recent-list">
                <el-tag
                  v-for="ip in recentSearches"
                  :key="ip"
                  @click="selectRecentIP(ip)"
                  class="recent-tag"
                  :effect="ip === ipAddress ? 'dark' : 'plain'"
                >
                  {{ ip }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="ipResult" class="panel result-panel">
          <div class="panel-header">
            <span class="icon">
              <el-icon><DataAnalysis /></el-icon>
            </span>
            <span class="title">IP 地址信息</span>
            <el-button type="primary" plain size="small" class="copy-button" @click="copyResults">
              复制结果
            </el-button>
          </div>
          
          <div class="panel-body">
            <div class="result-section">
              <div class="section-title">基本信息</div>
              <div class="detail-list">
                <div class="detail-item">
                  <div class="detail-label">IP 地址</div>
                  <div class="detail-value">{{ ipResult.ip }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">归属地</div>
                  <div class="detail-value" :class="{ empty: !ipResult.country }">
                    {{ ipResult.country || '未知' }}
                    <span v-if="ipResult.city">, {{ ipResult.city }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">ISP 提供商</div>
                  <div class="detail-value" :class="{ empty: !ipResult.isp }">
                    {{ ipResult.isp || '未知' }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">组织</div>
                  <div class="detail-value" :class="{ empty: !ipResult.org }">
                    {{ ipResult.org || '未知' }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="result-section">
              <div class="section-title">网络信息</div>
              <div class="detail-list">
                <div class="detail-item">
                  <div class="detail-label">地区代码</div>
                  <div class="detail-value" :class="{ empty: !ipResult.regionCode }">
                    {{ ipResult.regionCode || '未知' }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">时区</div>
                  <div class="detail-value" :class="{ empty: !ipResult.timezone }">
                    {{ ipResult.timezone || '未知' }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">AS 号码</div>
                  <div class="detail-value" :class="{ empty: !ipResult.as }">
                    {{ ipResult.as || '未知' }}
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">主机名</div>
                  <div class="detail-value" :class="{ empty: !ipResult.hostname }">
                    {{ ipResult.hostname || '未知' }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="result-section">
              <div class="section-title">地理位置</div>
              <div class="map-container" id="ip-map">
                <el-empty v-if="!ipResult.lat || !ipResult.lon" description="无法显示地图，缺少位置数据"></el-empty>
                <!-- 地图将在此处渲染 -->
              </div>
              <div class="location-details detail-list" v-if="ipResult.lat && ipResult.lon">
                <div class="detail-item">
                  <div class="detail-label">纬度</div>
                  <div class="detail-value">{{ ipResult.lat }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">经度</div>
                  <div class="detail-value">{{ ipResult.lon }}</div>
                </div>
              </div>
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
              <h3>什么是 IP 地址查询?</h3>
              <p>
                IP 地址查询工具可以帮助您获取某个 IP 地址的详细信息，包括地理位置、网络服务提供商、
                组织归属等信息，对网络诊断和安全分析很有帮助。
              </p>
              
              <h3>使用方法</h3>
              <ol>
                <li>在输入框中输入要查询的 IP 地址（IPv4 或 IPv6）或域名</li>
                <li>点击"查询 IP 信息"按钮</li>
                <li>查看查询结果</li>
              </ol>
              
              <h3>支持的查询类型</h3>
              <ul>
                <li><strong>IPv4 地址</strong>: 例如 8.8.8.8</li>
                <li><strong>IPv6 地址</strong>: 例如 2001:4860:4860::8888</li>
                <li><strong>域名</strong>: 例如 google.com（将自动解析为 IP）</li>
              </ul>
              
              <h3>提供的信息</h3>
              <ul>
                <li><strong>地理位置</strong>: 国家/地区、城市</li>
                <li><strong>网络信息</strong>: ISP、AS 号码、组织</li>
                <li><strong>地理坐标</strong>: 纬度和经度，以及地图显示</li>
                <li><strong>其他信息</strong>: 时区、主机名等</li>
              </ul>
              
              <h3>注意事项</h3>
              <p>
                IP 地址的地理位置信息仅供参考，其精确度可能受多种因素影响。
                例如，移动设备的 IP 可能显示为网络运营商的位置，而不是设备的实际物理位置。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Monitor, DataAnalysis, InfoFilled } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 输入的IP地址
const ipAddress = ref('');
const validationError = ref('');
const loading = ref(false);

// 查询结果
const ipResult = ref<any>(null);

// 最近查询
const recentSearches = ref<string[]>([]);
const MAX_RECENT_SEARCHES = 5;

// 初始化
onMounted(() => {
  // 从本地存储加载最近查询记录
  const savedSearches = localStorage.getItem('recentIPSearches');
  if (savedSearches) {
    try {
      recentSearches.value = JSON.parse(savedSearches);
    } catch (error) {
      // 静默处理解析错误，重置为空数组
      recentSearches.value = [];
    }
  }
});

// 保存最近查询
const saveRecentSearch = (ip: string) => {
  if (!ip) return;
  
  // 移除已存在的相同IP
  const index = recentSearches.value.indexOf(ip);
  if (index !== -1) {
    recentSearches.value.splice(index, 1);
  }
  
  // 添加到开头
  recentSearches.value.unshift(ip);
  
  // 限制数量
  if (recentSearches.value.length > MAX_RECENT_SEARCHES) {
    recentSearches.value = recentSearches.value.slice(0, MAX_RECENT_SEARCHES);
  }
  
  // 保存到本地存储
  localStorage.setItem('recentIPSearches', JSON.stringify(recentSearches.value));
};

// 选择最近查询的IP
const selectRecentIP = (ip: string) => {
  ipAddress.value = ip;
  lookupIP();
};

// 验证IP地址
const validateIPAddress = (ip: string): boolean => {
  // 检查非空
  if (!ip.trim()) {
    validationError.value = '请输入 IP 地址或域名';
    return false;
  }
  
  // IP地址和域名的正则表达式验证
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  // 如果输入不符合IP地址或域名格式，则显示错误
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip) && !domainRegex.test(ip)) {
    validationError.value = '请输入有效的IP地址或域名';
    return false;
  }
  
  validationError.value = '';
  return true;
};

// 查询IP信息
const lookupIP = async () => {
  if (!validateIPAddress(ipAddress.value)) return;
  
  loading.value = true;
  
  try {
    // 这里应该是实际的API调用，这里用模拟数据演示
    // const response = await fetch(`https://api.example.com/ip/${ipAddress.value}`);
    // const data = await response.json();
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData = {
      ip: ipAddress.value,
      country: '中国',
      city: '上海',
      isp: '中国电信',
      org: 'China Telecom',
      regionCode: 'CN-SH',
      timezone: 'Asia/Shanghai',
      as: 'AS4134 CHINANET-BACKBONE',
      hostname: ipAddress.value === '8.8.8.8' ? 'dns.google' : null,
      lat: 31.2222,
      lon: 121.4581
    };
    
    ipResult.value = mockData;
    saveRecentSearch(ipAddress.value);
    
    // 显示成功消息
    ElMessage.success('IP 信息查询成功');
    
    // 如果有地图元素，这里应该初始化地图
    if (mockData.lat && mockData.lon) {
      initMap(mockData.lat, mockData.lon);
    }
  } catch (error) {
    ElMessage.error('查询失败: ' + (error as Error).message);
    // 不输出到控制台
  } finally {
    loading.value = false;
  }
};

// 使用我的IP
const useMyIP = async () => {
  loading.value = true;
  
  try {
    // 这里应该是实际的API调用
    // const response = await fetch('https://api.example.com/myip');
    // const data = await response.json();
    
    // 模拟API响应
    await new Promise(resolve => setTimeout(resolve, 500));
    ipAddress.value = '58.34.100.1'; // 模拟的本机IP
    
    ElMessage.success('已获取您的公网IP地址');
    lookupIP();
  } catch (error) {
    ElMessage.error('获取IP失败: ' + (error as Error).message);
    loading.value = false;
  }
};

// 初始化地图 (示例函数)
const initMap = (lat: number, lon: number) => {
  // 实际项目中，这里应该是地图API的调用
  
  // 例如，如果使用Leaflet:
  // const map = L.map('ip-map').setView([lat, lon], 13);
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  // L.marker([lat, lon]).addTo(map);
};

// 复制结果
const copyResults = async () => {
  if (!ipResult.value) return;
  
  const text = `
IP地址: ${ipResult.value.ip}
国家/地区: ${ipResult.value.country || '未知'}${ipResult.value.city ? ', ' + ipResult.value.city : ''}
ISP提供商: ${ipResult.value.isp || '未知'}
组织: ${ipResult.value.org || '未知'}
AS号码: ${ipResult.value.as || '未知'}
主机名: ${ipResult.value.hostname || '未知'}
地理位置: ${ipResult.value.lat ? `${ipResult.value.lat}, ${ipResult.value.lon}` : '未知'}
时区: ${ipResult.value.timezone || '未知'}
  `.trim();
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};
</script>

<style scoped>
.ip-lookup-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: var(--el-text-color-primary);
}

.header {
  margin-bottom: 24px;
  text-align: left;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.header p {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}

.lookup-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel {
  background-color: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
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
  border-bottom: 1px solid var(--el-border-color-light);
  position: relative;
}

.panel-header .icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.panel-header .title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
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
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.error-message {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.lookup-button {
  flex: 2;
  height: 40px;
}

.my-ip-button {
  flex: 1;
  height: 40px;
}

.recent-searches {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed var(--el-border-color-light);
}

.recent-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-tag {
  cursor: pointer;
  font-family: monospace;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.detail-list {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  border-bottom: 1px solid var(--el-border-color-light);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  width: 30%;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  font-weight: 500;
  color: var(--el-text-color-secondary);
  border-right: 1px solid var(--el-border-color-light);
}

.detail-value {
  width: 70%;
  padding: 12px 16px;
  word-break: break-word;
}

.detail-value.empty {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.map-container {
  height: 300px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.result-section {
  margin-bottom: 24px;
}

.result-section:last-child {
  margin-bottom: 0;
}

.help-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 10px;
  color: var(--el-text-color-primary);
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content p {
  margin: 0 0 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.help-content ul, .help-content ol {
  padding-left: 20px;
  margin: 12px 0;
}

.help-content li {
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.help-content strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .ip-lookup-container {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .header p {
    font-size: 14px;
  }
  
  .panel-header {
    padding: 12px 15px;
  }
  
  .panel-body {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .panel-header .copy-button {
    position: relative;
    right: auto;
    margin-top: 10px;
    width: 100%;
  }
  
  .detail-item {
    flex-direction: column;
  }
  
  .detail-label, .detail-value {
    width: 100%;
    border-right: none;
  }
  
  .detail-label {
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 8px;
  }
  
  .map-container {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .recent-list {
    gap: 6px;
  }
  
  .recent-tag {
    font-size: 12px;
  }
  
  .section-title {
    font-size: 15px;
  }
  
  .detail-label, .detail-value {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .map-container {
    height: 200px;
  }
  
  .help-content h3 {
    font-size: 15px;
  }
  
  .help-content p, .help-content li {
    font-size: 13px;
  }
}
</style> 