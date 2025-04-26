<template>
  <div class="ipv6-ula-page format-page">
    <div class="page-header">
      <div class="header-title">
        <h2>IPv6 ULA 生成器</h2>
        <p class="header-desc">生成唯一本地地址 (Unique Local Address) 前缀</p>
      </div>
    </div>

    <div class="page-content">
      <el-card class="generator-card">
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>生成选项</span>
        </div>

        <el-form :model="form" label-position="top">
          <el-form-item label="生成方式">
            <el-radio-group v-model="form.method">
              <el-radio-button label="random">随机生成</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <template v-if="form.method === 'custom'">
            <el-form-item label="全局ID (40位十六进制数)">
              <el-input
                v-model="form.globalId"
                placeholder="例如: 1a2b3c4d5e"
                :maxlength="10"
                @input="validateInput"
              />
              <div v-if="validationError" class="error-message">
                {{ validationError }}
              </div>
            </el-form-item>

            <el-form-item label="子网ID (16位十六进制数)">
              <el-input
                v-model="form.subnetId"
                placeholder="例如: ffff"
                :maxlength="4"
                @input="validateInput"
              />
              <div v-if="subnetError" class="error-message">
                {{ subnetError }}
              </div>
            </el-form-item>
          </template>

          <el-form-item label="前缀长度">
            <el-select 
              v-model="form.prefixLength" 
              style="width: 100%"
            >
              <el-option label="/48 (推荐站点前缀)" value="48" />
              <el-option label="/56 (典型家庭分配)" value="56" />
              <el-option label="/60 (小型子网)" value="60" />
              <el-option label="/64 (单一子网)" value="64" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateULA" 
              style="width: 100%"
              :disabled="form.method === 'custom' && (!!validationError || !!subnetError)"
            >
              <el-icon><VideoPlay /></el-icon>
              生成 ULA 前缀
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="result-card">
        <div class="card-header">
          <el-icon><List /></el-icon>
          <span>生成结果</span>
          <div class="result-actions">
            <el-button type="primary" plain size="small" @click="copyResult" :disabled="!result.ula">
              <el-icon><CopyDocument /></el-icon>
              复制结果
            </el-button>
          </div>
        </div>

        <div class="result-content">
          <el-empty 
            v-if="!result.ula"
            description="尚未生成ULA前缀"
          />
          <div v-else class="result-details">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="ULA 前缀">
                <span class="ula-value">{{ result.ula }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="前缀长度">
                {{ form.prefixLength }}
              </el-descriptions-item>
              <el-descriptions-item label="全局 ID">
                {{ result.globalId }}
              </el-descriptions-item>
              <el-descriptions-item label="子网 ID">
                {{ result.subnetId }}
              </el-descriptions-item>
              <el-descriptions-item label="设备地址示例">
                {{ result.exampleAddress }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="address-structure">
              <h4>地址结构</h4>
              <div class="structure-diagram">
                <div class="diagram-box fc" title="前缀">
                  <strong>FC00::/7</strong>
                  <span>ULA前缀</span>
                </div>
                <div class="diagram-box l" title="本地位">
                  <strong>1</strong>
                  <span>本地</span>
                </div>
                <div class="diagram-box global-id" title="全局ID">
                  <strong>{{ result.globalId }}</strong>
                  <span>全局ID</span>
                </div>
                <div class="diagram-box subnet-id" title="子网ID">
                  <strong>{{ result.subnetId }}</strong>
                  <span>子网ID</span>
                </div>
                <div class="diagram-box interface-id" title="接口ID">
                  <strong>::</strong>
                  <span>接口ID</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card">
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>IPv6 ULA 信息</span>
        </div>

        <div class="info-content">
          <h4>什么是 IPv6 ULA？</h4>
          <p>
            IPv6 唯一本地地址 (Unique Local Address, ULA) 是IPv6地址的一类，相当于IPv4中的私有地址(如192.168.x.x)。
            ULA地址范围是 fc00::/7，通常看到的格式为 fd00::/8。
          </p>
          
          <h4>ULA 地址结构</h4>
          <p>ULA地址遵循以下结构：</p>
          <ul>
            <li><strong>前缀：</strong> FC00::/7（通常使用FD00::/8）</li>
            <li><strong>L位：</strong> 1位，设置为1表示本地分配</li>
            <li><strong>全局ID：</strong> 40位，应随机生成以确保全局唯一性</li>
            <li><strong>子网ID：</strong> 16位，用于在站点内创建子网</li>
            <li><strong>接口ID：</strong> 64位，标识网络接口</li>
          </ul>
          
          <h4>ULA 使用场景</h4>
          <ul>
            <li>本地网络内部通信</li>
            <li>无需互联网连接的设备间通信</li>
            <li>防止路由泄漏和地址冲突</li>
            <li>VPN和站点间通信</li>
            <li>不依赖ISP的内部网络地址规划</li>
          </ul>
          
          <h4>RFC参考</h4>
          <p>
            IPv6 ULA在<a href="https://tools.ietf.org/html/rfc4193" target="_blank">RFC 4193</a>中定义。
            根据规范，全局ID应通过随机算法生成以确保唯一性。
          </p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Setting, VideoPlay, List, InfoFilled, CopyDocument } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';

const { copy } = useClipboard();

// 表单数据
const form = reactive({
  method: 'random',
  globalId: '',
  subnetId: '0000',
  prefixLength: '48'
});

// 验证错误
const validationError = ref('');
const subnetError = ref('');

// 结果
const result = reactive({
  ula: '',
  globalId: '',
  subnetId: '',
  exampleAddress: ''
});

// 验证输入
const validateInput = () => {
  // 验证全局ID
  if (form.method === 'custom' && form.globalId) {
    if (!/^[0-9a-fA-F]{1,10}$/.test(form.globalId)) {
      validationError.value = '全局ID必须是10位十六进制数';
    } else if (form.globalId.length < 10) {
      validationError.value = '全局ID必须是10位十六进制数';
    } else {
      validationError.value = '';
    }
  } else {
    validationError.value = '';
  }

  // 验证子网ID
  if (form.method === 'custom' && form.subnetId) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(form.subnetId)) {
      subnetError.value = '子网ID必须是4位十六进制数';
    } else if (form.subnetId.length < 4) {
      subnetError.value = '子网ID必须是4位十六进制数';
    } else {
      subnetError.value = '';
    }
  } else {
    subnetError.value = '';
  }
};

// 生成随机字节
const getRandomBytes = (length: number): string => {
  // 在浏览器环境中使用Web Crypto API
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// 生成ULA前缀
const generateULA = () => {
  let globalId: string;
  let subnetId: string;

  if (form.method === 'random') {
    // 生成40位随机全局ID（5字节）
    globalId = getRandomBytes(5);
    // 生成16位随机子网ID（2字节）
    subnetId = form.subnetId === '0000' ? getRandomBytes(2) : form.subnetId.padStart(4, '0');
  } else {
    // 使用用户输入的值
    globalId = form.globalId.toLowerCase().padStart(10, '0');
    subnetId = form.subnetId.toLowerCase().padStart(4, '0');
  }

  // 构建ULA前缀
  // fd + 全局ID（5字节 = 10个十六进制字符）
  const prefix = 'fd' + globalId;
  
  // 格式化为标准IPv6格式
  const formattedPrefix = formatIPv6Address(prefix, subnetId);
  
  // 创建示例地址
  const randomInterfaceId = getRandomBytes(8); // 8字节 = 16个十六进制字符
  const exampleAddress = formatIPv6Address(
    prefix + subnetId + randomInterfaceId.substring(0, 4),
    randomInterfaceId.substring(4)
  );

  // 设置结果
  result.ula = formattedPrefix;
  result.globalId = globalId;
  result.subnetId = subnetId;
  result.exampleAddress = exampleAddress;

  ElMessage.success('ULA前缀生成成功');
};

// 格式化IPv6地址
const formatIPv6Address = (prefix: string, suffix: string = ''): string => {
  // 将整个字符串填充到32个十六进制字符（16字节）
  const fullAddress = (prefix + suffix).padEnd(32, '0');
  
  // 每4个字符（2字节）一组，用冒号分隔
  const groups = [];
  for (let i = 0; i < 8; i++) {
    groups.push(fullAddress.substring(i * 4, (i + 1) * 4));
  }
  
  // 返回格式化的地址
  return groups.join(':');
};

// 复制结果
const copyResult = async () => {
  if (!result.ula) return;
  
  const text = `
ULA前缀: ${result.ula}/${form.prefixLength}
全局ID: ${result.globalId}
子网ID: ${result.subnetId}
示例地址: ${result.exampleAddress}
  `.trim();
  
  try {
    await copy(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};
</script>

<style lang="scss" scoped>
.ipv6-ula-page {
  .page-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    .info-card {
      grid-column: 1 / -1;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-size: 16px;
    
    .el-icon {
      color: var(--el-color-primary);
    }
    
    .result-actions {
      margin-left: auto;
    }
  }
  
  .error-message {
    color: var(--el-color-danger);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .ula-value {
    font-family: monospace;
    font-weight: 600;
    font-size: 16px;
  }
  
  .result-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .address-structure {
    margin-top: 16px;
    
    h4 {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .structure-diagram {
      display: flex;
      flex-wrap: wrap;
      gap: 1px;
      background-color: var(--el-border-color-light);
      border-radius: 4px;
      overflow: hidden;
      
      .diagram-box {
        padding: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--el-fill-color-light);
        
        strong {
          font-family: monospace;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        span {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
        
        &.fc {
          flex: 0 0 30%;
          background-color: var(--el-color-primary-light-9);
        }
        
        &.l {
          flex: 0 0 10%;
          background-color: var(--el-color-success-light-9);
        }
        
        &.global-id {
          flex: 0 0 25%;
          background-color: var(--el-color-warning-light-9);
        }
        
        &.subnet-id {
          flex: 0 0 15%;
          background-color: var(--el-color-danger-light-9);
        }
        
        &.interface-id {
          flex: 0 0 20%;
          background-color: var(--el-color-info-light-9);
        }
      }
    }
  }
  
  .info-content {
    h4 {
      margin: 16px 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    p {
      margin: 8px 0;
      line-height: 1.5;
      color: var(--el-text-color-regular);
    }
    
    ul {
      padding-left: 20px;
      margin: 8px 0;
      color: var(--el-text-color-regular);
      
      li {
        margin-bottom: 6px;
        line-height: 1.5;
      }
    }
    
    a {
      color: var(--el-color-primary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media (max-width: 768px) {
  .ipv6-ula-page {
    .page-content {
      grid-template-columns: 1fr;
    }
  }
}
</style> 