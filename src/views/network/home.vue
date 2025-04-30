<template>
  <div class="network-page">
    <div class="page-header">
      <div class="header-title">
        <h2>网络工具</h2>
        <p class="header-desc">提供各种网络信息查询、地址计算和网络测试工具</p>
      </div>
    </div>
    
    <div class="tools-grid">
      <!-- 网络信息查询卡片（替代原有的IP查询和域名查询） -->
      <router-link to="/network/unified-lookup" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Search /></el-icon>
            </div>
            <h3 class="tool-title">网络信息查询</h3>
            <p class="tool-desc">查询IP地址或域名信息，包含地理位置、DNS记录、Whois信息和连通性测试</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <!-- 保留其他工具卡片 -->
      <router-link to="/network/ipv4-subnet" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Grid /></el-icon>
            </div>
            <h3 class="tool-title">IPv4子网计算器</h3>
            <p class="tool-desc">计算IPv4子网的网络地址、广播地址和可用主机范围</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <router-link to="/network/ipv4-converter" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Refresh /></el-icon>
            </div>
            <h3 class="tool-title">IPv4地址转换器</h3>
            <p class="tool-desc">在十进制、十六进制和二进制格式之间转换IPv4地址</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <router-link to="/network/ipv4-range" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <h3 class="tool-title">IPv4范围扩展器</h3>
            <p class="tool-desc">生成指定范围内的所有IPv4地址列表</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <router-link to="/network/mac-lookup" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <h3 class="tool-title">MAC地址查找</h3>
            <p class="tool-desc">查询MAC地址的制造商信息和详细数据</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <router-link to="/network/mac-generator" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><MagicStick /></el-icon>
            </div>
            <h3 class="tool-title">MAC地址生成器</h3>
            <p class="tool-desc">生成随机MAC地址和特定格式的MAC地址</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <router-link to="/network/ipv6-ula" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <h3 class="tool-title">IPv6 ULA生成器</h3>
            <p class="tool-desc">生成唯一本地IPv6地址(ULA)</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
      
      <router-link to="/network/port-scanner" class="tool-card-link">
        <el-card class="tool-card">
          <div class="tool-content">
            <div class="tool-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <h3 class="tool-title">端口扫描器</h3>
            <p class="tool-desc">扫描主机上开放的TCP端口</p>
            <el-button type="primary" plain>使用工具</el-button>
          </div>
        </el-card>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Search, Grid, Refresh, Plus, Monitor, 
  MagicStick, Cpu, Aim 
} from '@element-plus/icons-vue';
</script>

<style scoped>
.network-page {
  margin: 0 auto;
  max-width: 1280px;
  padding: 0 16px;
}

.page-header {
  margin-bottom: 32px;
}

.header-title {
  margin-bottom: 16px;
}

.header-title h2 {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin: 0 0 8px 0;
}

.header-desc {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.tool-card-link {
  text-decoration: none;
}

.tool-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--el-color-primary-light-7);
}

.tool-content {
  padding: 20px;
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  margin-bottom: 16px;
}

.tool-icon .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.tool-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.tool-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;
  min-height: 42px;
}

@media screen and (max-width: 767px) {
  .page-header {
    margin-bottom: 24px;
  }
  
  .header-title h2 {
    font-size: 24px;
  }
  
  .header-desc {
    font-size: 14px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  .tool-card:hover {
    transform: translateY(-4px);
  }
  
  .tool-content {
    padding: 16px;
  }
  
  .tool-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }
  
  .tool-icon .el-icon {
    font-size: 20px;
  }
  
  .tool-title {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .tool-desc {
    font-size: 13px;
    margin-bottom: 16px;
    min-height: auto;
  }
}
</style> 