<template>
  <div class="general-info-container">
    <!-- IP信息区域 -->
    <div class="ip-section" v-if="ipInfo">
      <div class="section-head">IP地址信息</div>
      
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">IP地址</div>
          <div class="detail-value highlight">{{ ipInfo.ip }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">主机名</div>
          <div class="detail-value" :class="{ empty: !ipInfo.hostname }">
            {{ ipInfo.hostname || '未知' }}
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">地理位置</div>
          <div class="detail-value" :class="{ empty: !ipInfo.country }">
            {{ formatLocation(ipInfo) }}
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">ISP</div>
          <div class="detail-value" :class="{ empty: !ipInfo.isp }">
            {{ ipInfo.isp || '未知' }}
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">组织</div>
          <div class="detail-value" :class="{ empty: !ipInfo.org }">
            {{ ipInfo.org || '未知' }}
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">AS号</div>
          <div class="detail-value" :class="{ empty: !ipInfo.asn }">
            {{ ipInfo.asn || '未知' }}
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">时区</div>
          <div class="detail-value" :class="{ empty: !ipInfo.timezone }">
            {{ ipInfo.timezone || '未知' }}
          </div>
        </div>
      </div>
      
      <!-- 安全信息 -->
      <div class="security-section" v-if="hasSecurityInfo">
        <div class="section-head">安全信息</div>
        <div class="security-tags">
          <el-tag v-if="ipInfo.isProxy" type="danger" effect="dark">代理</el-tag>
          <el-tag v-if="ipInfo.isVPN" type="danger" effect="dark">VPN</el-tag>
          <el-tag v-if="ipInfo.isTor" type="danger" effect="dark">Tor网络</el-tag>
          <el-tag v-if="ipInfo.isHosting" type="info">数据中心</el-tag>
        </div>
      </div>
      
      <!-- 地图显示 -->
      <div v-if="hasLocation" class="map-section">
        <div class="section-head">地理位置</div>
        <div class="map-container" ref="mapContainer"></div>
        <div class="location-details" v-if="ipLocation">
          <div class="detail-item">
            <div class="detail-label">经纬度</div>
            <div class="detail-value">{{ ipLocation.latitude }}, {{ ipLocation.longitude }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 域名信息区域 -->
    <div class="domain-section" v-if="isDomain && domainInfo">
      <div class="section-head">域名信息</div>
      
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">域名</div>
          <div class="detail-value highlight">{{ domainInfo.domain }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">解析IP</div>
          <div class="detail-value" :class="{ empty: !domainInfo.resolvedIp }">
            {{ domainInfo.resolvedIp || '未能解析' }}
          </div>
        </div>
        
        <div class="detail-item" v-if="domainInfo.whois?.domainName">
          <div class="detail-label">注册商</div>
          <div class="detail-value" :class="{ empty: !domainInfo.whois?.registrar }">
            {{ domainInfo.whois?.registrar || '未知' }}
          </div>
        </div>
        
        <div class="detail-item" v-if="domainInfo.whois?.creationDate">
          <div class="detail-label">注册日期</div>
          <div class="detail-value">
            {{ formatDate(domainInfo.whois?.creationDate) }}
          </div>
        </div>
        
        <div class="detail-item" v-if="domainInfo.whois?.expirationDate">
          <div class="detail-label">到期日期</div>
          <div class="detail-value">
            {{ formatDate(domainInfo.whois?.expirationDate) }}
          </div>
        </div>
        
        <div class="detail-item" v-if="hasNameServers">
          <div class="detail-label">域名服务器</div>
          <div class="detail-value">
            {{ formatNameServers() }}
          </div>
        </div>
      </div>
      
      <!-- DNS记录计数 -->
      <div class="dns-summary" v-if="hasDnsRecords">
        <div class="section-head">DNS记录摘要</div>
        <div class="dns-types">
          <el-tag 
            v-for="(records, type) in domainInfo.dns" 
            :key="type"
            class="dns-type-tag"
            :type="getDnsTagType(String(type))"
          >
            {{ String(type).toUpperCase() }}: {{ records ? records.length : 0 }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <!-- 无数据显示 -->
    <el-empty v-if="!ipInfo && !domainInfo" description="没有查询数据"></el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import type { IPInfo } from '@/utils/network/ip-info';
import type { DomainInfo } from '@/utils/network/domain-info';
import { getMapUrl } from '@/utils/network/ip-info';

const props = defineProps<{
  ipInfo?: IPInfo;
  domainInfo?: DomainInfo;
  type?: 'ip' | 'domain';
}>();

// 计算属性：是否为域名查询
const isDomain = computed(() => props.type === 'domain');

// 计算属性：是否有安全信息
const hasSecurityInfo = computed(() => {
  if (!props.ipInfo) return false;
  return props.ipInfo.isProxy || props.ipInfo.isVPN || 
         props.ipInfo.isTor || props.ipInfo.isHosting;
});

// 计算属性：是否有DNS记录
const hasDnsRecords = computed(() => {
  if (!props.domainInfo?.dns) return false;
  return Object.keys(props.domainInfo.dns).length > 0;
});

// 计算属性：是否有名称服务器
const hasNameServers = computed(() => {
  if (!props.domainInfo?.whois?.nameServers) return false;
  return props.domainInfo.whois.nameServers.length > 0;
});

// 计算属性：是否有位置信息
const hasLocation = computed(() => {
  return props.ipInfo?.location && 
         props.ipInfo.location.latitude && 
         props.ipInfo.location.longitude;
});

// 获取IP位置
const ipLocation = computed(() => props.ipInfo?.location);

// 地图相关
const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let marker: any = null;
const mapInitialized = ref(false);
const usingStaticMap = ref(false);

// 为Leaflet添加声明以解决类型错误
type LeafletTileLayer = any;

// 动态加载Leaflet库和样式
const loadLeaflet = async () => {
  if (window.L) return Promise.resolve(window.L);
  
  // 加载Leaflet CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  
  // 加载Leaflet JS
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 修改后的初始化地图函数
const initMap = async () => {
  if (!hasLocation.value || !mapContainer.value) return;
  
  // 纯前端解决方案，无需外部地图API，避免CORS问题
  renderLocationInfo();
};

// 清除地图资源的函数
const clearMap = () => {
  if (mapContainer.value) {
    mapContainer.value.innerHTML = '';
  }
  
  // 重置状态
  map = null;
  marker = null;
  mapInitialized.value = false;
  usingStaticMap.value = false;
};

// 使用纯前端方案展示位置信息
const renderLocationInfo = () => {
  if (!mapContainer.value || !props.ipInfo?.location) return;
  
  // 清除之前的内容
  mapContainer.value.innerHTML = '';
  
  const { latitude, longitude } = props.ipInfo.location;
  const country = props.ipInfo.country || '未知';
  const city = props.ipInfo.city || '';
  const region = props.ipInfo.region || '';
  const isp = props.ipInfo.isp || '未知';
  
  // 创建内容
  const content = document.createElement('div');
  content.className = 'location-info-container';
  
  // 创建静态地图区域
  const mapSection = document.createElement('div');
  mapSection.className = 'static-map-container';
  
  // 使用OpenStreetMap静态地图API (最可靠的选择，无需API密钥)
  // 格式: https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=400&center=lonlat:103.8501,1.2897&zoom=14&marker=lonlat:103.8501,1.2897;color:%23ff0000;size:large&apiKey=YOUR_API_KEY
  // 备选方案: https://staticmap.openstreetmap.de/staticmap.php?center=1.2897,103.8501&zoom=14&size=600x300&markers=1.2897,103.8501,ol-marker
  
  // 为了更好的可靠性，使用mapbox静态图API，它支持CORS且有免费配额
  const mapboxToken = 'pk.eyJ1IjoieXRtb3VyIiwiYSI6ImNsem95c3NuYzE0M2Qyanc4ajhiMmNtamIifQ.4SkJKw3KXrHk51rHViyXPQ';
  const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+f74e4e(${longitude},${latitude})/${longitude},${latitude},12,0/640x300?access_token=${mapboxToken}`;
  
  // 备用图片链接 (应对上述API不可用的情况)
  const fallbackImageUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=13&size=640x300&markers=${latitude},${longitude},ol-marker-blue`;
  
  // 创建地图内容
  mapSection.innerHTML = `
    <div class="static-map">
      <img 
        src="${mapImageUrl}" 
        alt="位置地图" 
        class="map-image"
        onerror="this.onerror=null; this.src='${fallbackImageUrl}';"
      />
      <div class="map-overlay">
        <div class="location-pin"></div>
        <div class="location-pulse"></div>
      </div>
      <div class="map-info">
        <div class="map-info-content">
          <div class="map-title">${country} ${region} ${city}</div>
          <div class="map-coordinates">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</div>
        </div>
      </div>
    </div>
  `;
  
  // 位置信息卡片
  const infoCard = document.createElement('div');
  infoCard.className = 'location-info-card';
  
  // 创建信息卡片内容
  infoCard.innerHTML = `
    <div class="info-card-header">
      <i class="el-icon location"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path fill="currentColor" d="M800 416a288 288 0 10-576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416zM512 960C277.312 746.688 160 565.312 160 416a352 352 0 01704 0c0 149.312-117.312 330.688-352 544z"></path><path fill="currentColor" d="M512 512a96 96 0 100-192 96 96 0 000 192zm0 64a160 160 0 110-320 160 160 0 010 320z"></path></svg></i>
      <span>${country} ${region} ${city}</span>
    </div>
    <div class="info-card-body">
      <div class="info-item">
        <span class="info-label">IP地址:</span>
        <span class="info-value">${props.ipInfo.ip}</span>
      </div>
      <div class="info-item">
        <span class="info-label">坐标:</span>
        <span class="info-value">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">ISP:</span>
        <span class="info-value">${isp}</span>
      </div>
      <div class="info-item">
        <span class="info-label">时区:</span>
        <span class="info-value">${props.ipInfo.timezone || '未知'}</span>
      </div>
    </div>
    <div class="info-card-footer">
      <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" class="external-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        Google Maps
      </a>
      <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=14" target="_blank" class="external-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        OpenStreetMap
      </a>
    </div>
  `;
  
  // 添加到容器
  content.appendChild(mapSection);
  content.appendChild(infoCard);
  mapContainer.value.appendChild(content);
};

// 监听属性变化并更新地图，使用清理和重建的方式
watch(() => props.ipInfo, (newVal, oldVal) => {
  // 如果位置信息发生变化，则重新初始化地图
  if (
    hasLocation.value && 
    (!oldVal?.location || 
     newVal?.location?.latitude !== oldVal.location.latitude ||
     newVal?.location?.longitude !== oldVal.location.longitude)
  ) {
    // 先清除现有地图
    clearMap();
    
    // 使用nextTick确保DOM已更新
    nextTick(() => {
      initMap();
    });
  }
}, { deep: true });

// 组件挂载后初始化地图
onMounted(() => {
  if (hasLocation.value) {
    nextTick(() => {
      initMap();
    });
  }
});

// 组件卸载前清理地图资源
onBeforeUnmount(() => {
  clearMap();
});

// 格式化地理位置信息
const formatLocation = (info: IPInfo): string => {
  if (!info.country) return '未知';
  
  let location = info.country;
  if (info.region) location += `, ${info.region}`;
  if (info.city) location += `, ${info.city}`;
  
  return location;
};

// 格式化日期
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '未知';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  } catch {
    return dateStr;
  }
};

// 格式化域名服务器
const formatNameServers = (): string => {
  if (!props.domainInfo?.whois?.nameServers || 
      props.domainInfo.whois.nameServers.length === 0) {
    return '未知';
  }
  
  return props.domainInfo.whois.nameServers.slice(0, 3).join(', ') + 
         (props.domainInfo.whois.nameServers.length > 3 ? '...' : '');
};

// 获取DNS记录标签类型
const getDnsTagType = (type: string): '' | 'success' | 'info' | 'warning' | 'danger' | 'primary' => {
  const typesMap: Record<string, '' | 'success' | 'info' | 'warning' | 'danger' | 'primary'> = {
    a: 'primary',
    aaaa: 'success',
    mx: 'warning',
    txt: 'info',
    ns: 'success',
    cname: 'warning',
    ptr: 'info',
    soa: 'danger',
    srv: 'warning'
  };
  
  return typesMap[type.toLowerCase()] || '';
};
</script>

<style scoped>
.general-info-container {
  padding: 12px 0;
}

.ip-section, .domain-section, .security-section, .map-section, .dns-summary {
  margin-bottom: 24px;
}

.section-head {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-value {
  font-size: 14px;
  word-break: break-word;
}

.detail-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.detail-value.empty {
  color: var(--el-text-color-disabled);
  font-style: italic;
}

.security-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.map-container {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-light);
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dns-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dns-type-tag {
  min-width: 70px;
  text-align: center;
}

/* 静态地图样式 */
.static-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
}

/* 位置信息展示样式 */
.location-info-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.static-map-container {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.static-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 12px;
  font-size: 12px;
}

.map-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.map-coordinates {
  font-size: 11px;
  opacity: 0.9;
}

.location-info-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-primary);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.info-card-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.info-value {
  font-size: 14px;
  word-break: break-word;
}

.info-card-footer {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 4px;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s;
}

.external-link:hover {
  background-color: var(--el-color-primary-light-8);
}
</style>

<script lang="ts">
// 添加全局类型声明
declare global {
  interface Window {
    L: any; // Leaflet库
  }
}
</script> 