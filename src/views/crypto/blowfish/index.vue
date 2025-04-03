<template>
  <div class="blowfish-container">
    <div class="header">
      <h2>Blowfish 加密</h2>
      <el-alert
        title="Blowfish 加密说明"
        type="info"
        description="Blowfish 是一种对称加密算法，使用相同的密钥进行加密和解密。支持多种加密模式和填充方式。请妥善保管您的密钥，密钥一旦丢失将无法解密数据。"
        show-icon
        :closable="false"
        class="blowfish-info"
      />
    </div>

    <div class="options">
      <div class="option-row">
        <el-select v-model="form.mode" placeholder="选择加密模式">
          <el-option label="CBC" value="CBC" />
          <el-option label="ECB" value="ECB" />
          <el-option label="CFB" value="CFB" />
          <el-option label="OFB" value="OFB" />
          <el-option label="CTR" value="CTR" />
        </el-select>
        
        <el-select v-model="form.padding" placeholder="选择填充方式">
          <el-option label="PKCS7" value="Pkcs7" />
          <el-option label="NoPadding" value="NoPadding" />
        </el-select>
      </div>
      
      <div class="option-row">
        <el-radio-group v-model="operationMode" class="operation-select">
          <el-radio-button label="encrypt">加密</el-radio-button>
          <el-radio-button label="decrypt">解密</el-radio-button>
        </el-radio-group>

        <div class="upload-btn">
          <el-upload
            ref="upload"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange">
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择文件
            </el-button>
          </el-upload>
        </div>

        <el-button @click="showHistory = true">
          <el-icon><Timer /></el-icon>
          历史记录
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-form :model="form" label-width="80px">
        <el-form-item label="密钥">
          <el-input
            v-model="form.key"
            placeholder="请输入密钥"
            show-password
          >
            <template #append>
              <el-button @click="handleGenerateKey">生成</el-button>
            </template>
          </el-input>
          <div class="key-info" v-if="form.key">
            <span>密钥长度：{{ form.key.length }} 字符</span>
            <el-tag :type="isKeyValid ? 'success' : 'danger'" size="small">
              {{ isKeyValid ? '密钥有效' : '密钥长度不符合要求' }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="IV" v-if="needIV">
          <el-input
            v-model="form.iv"
            placeholder="请输入初始化向量 (IV)"
            show-password
          >
            <template #append>
              <el-button @click="handleGenerateIV">生成</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="输入">
          <div
            class="input-area"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent>
            <el-input
              v-model="form.input"
              type="textarea"
              :rows="3"
              :placeholder="operationMode === 'encrypt' ? '请输入要加密的文本，或拖放文件到此处' : '请输入要解密的文本，或拖放文件到此处'"
              @input="handleInput"
            />
          </div>
          <div class="input-stats" v-if="form.input">
            <span>字符数：{{ form.input.length }}</span>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleProcess" :disabled="!canProcess">
              {{ operationMode === 'encrypt' ? '加密' : '解密' }}
            </el-button>
            <el-button @click="handleClear">清空</el-button>
          </el-button-group>
        </el-form-item>

        <el-form-item label="输出">
          <el-input
            v-model="form.output"
            type="textarea"
            :rows="3"
            readonly
            :placeholder="operationMode === 'encrypt' ? '加密结果' : '解密结果'"
          />
          <div class="output-controls">
            <div class="output-stats" v-if="form.output">
              <span>{{ operationMode === 'encrypt' ? '密文' : '明文' }}</span>
            </div>
            <div class="output-actions">
              <el-button-group>
                <el-button type="primary" @click="handleCopy" :disabled="!form.output">
                  <el-icon><DocumentCopy /></el-icon> 复制
                </el-button>
                <el-button type="primary" @click="handleDownload" :disabled="!form.output">
                  <el-icon><Download /></el-icon> 下载
                </el-button>
              </el-button-group>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="showHistory"
      title="历史记录"
      width="60%"
      :close-on-click-modal="false">
      <div class="history-header">
        <el-input
          v-model="historySearch"
          placeholder="搜索历史记录"
          clearable
          class="history-search">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="danger" @click="clearHistory" :disabled="!history.length">
          清空历史
        </el-button>
      </div>

      <div class="history-list">
        <el-empty v-if="!filteredHistory.length" description="暂无历史记录" />
        <div v-else class="history-items">
          <div
            v-for="item in filteredHistory"
            :key="item.id"
            class="history-item">
            <div class="history-content">
              <div class="history-mode">
                <el-tag :type="item.mode === 'encrypt' ? 'success' : 'warning'">
                  {{ item.mode === 'encrypt' ? '加密' : '解密' }}
                </el-tag>
                <el-tag type="info" size="small">Blowfish-{{ item.config?.mode || 'CBC' }}</el-tag>
              </div>
              <div class="history-time">
                {{ new Date(item.timestamp).toLocaleString() }}
              </div>
              <div class="history-preview">
                <div class="preview-input">
                  <span class="preview-label">输入：</span>
                  <span class="preview-text">{{ item.input.slice(0, 50) }}{{ item.input.length > 50 ? '...' : '' }}</span>
                </div>
                <div class="preview-output">
                  <span class="preview-label">输出：</span>
                  <span class="preview-text">{{ item.output.slice(0, 50) }}{{ item.output.length > 50 ? '...' : '' }}</span>
                </div>
              </div>
            </div>
            <div class="history-actions">
              <el-button type="primary" link @click="useHistory(item)">
                使用
              </el-button>
              <el-button type="danger" link @click="deleteHistory(item.id)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload, DocumentCopy, Download, Timer, Search } from '@element-plus/icons-vue';
import { useClipboard } from '@vueuse/core';
import type { UploadFile, UploadRawFile } from 'element-plus';
import { BlowfishUtil } from '@/utils/crypto/blowfish';
import { cryptoDB } from '@/utils/db';
import { copyToClipboard, downloadText } from '@/utils/common';
import type { CryptoHistory } from '@/types/crypto';

const { copy } = useClipboard();
const operationMode = ref<'encrypt' | 'decrypt'>('encrypt');
const showHistory = ref(false);
const historySearch = ref('');
const history = ref<CryptoHistory[]>([]);

const form = reactive({
  mode: 'CBC',
  padding: 'Pkcs7',
  key: '',
  iv: '',
  input: '',
  output: ''
});

// 计算属性
const needIV = computed(() => form.mode !== 'ECB');
const isKeyValid = computed(() => form.key.length > 0);
const canProcess = computed(() => {
  return isKeyValid.value && form.input && (!needIV.value || form.iv);
});

// 过滤后的历史记录
const filteredHistory = computed(() => {
  if (!historySearch.value) return history.value;
  
  return history.value.filter(item => 
    item.input.includes(historySearch.value) || 
    item.output.includes(historySearch.value)
  );
});

const handleGenerateKey = () => {
  form.key = BlowfishUtil.generateKey();
};

const handleGenerateIV = () => {
  form.iv = BlowfishUtil.generateIV();
};

// 处理加密/解密
const handleProcess = () => {
  try {
    if (operationMode.value === 'encrypt') {
      handleEncrypt();
    } else {
      handleDecrypt();
    }
  } catch (error) {
    ElMessage.error(`操作失败：${(error as Error).message}`);
  }
};

const handleEncrypt = async () => {
  try {
    if (!form.input || !form.key) {
      ElMessage.warning('请输入要加密的文本和密钥');
      return;
    }

    if (form.mode !== 'ECB' && !form.iv) {
      ElMessage.warning('非ECB模式需要IV');
      return;
    }

    const output = BlowfishUtil.encrypt(form.input, form.key, {
      mode: form.mode as any,
      iv: form.iv,
      padding: form.padding as any
    });

    form.output = output;

    // 保存到历史记录
    await cryptoDB.addHistory({
      type: 'blowfish',
      mode: 'encrypt',
      input: form.input,
      output,
      timestamp: Date.now(),
      config: {
        mode: form.mode,
        padding: form.padding,
        key: form.key,
        iv: form.iv
      }
    });

    ElMessage.success('加密成功');
    loadHistory();
  } catch (error) {
    console.error('加密失败:', error);
    ElMessage.error('加密失败');
  }
};

const handleDecrypt = async () => {
  try {
    if (!form.input || !form.key) {
      ElMessage.warning('请输入要解密的文本和密钥');
      return;
    }

    if (form.mode !== 'ECB' && !form.iv) {
      ElMessage.warning('非ECB模式需要IV');
      return;
    }

    const output = BlowfishUtil.decrypt(form.input, form.key, {
      mode: form.mode as any,
      iv: form.iv,
      padding: form.padding as any
    });

    form.output = output;

    // 保存到历史记录
    await cryptoDB.addHistory({
      type: 'blowfish',
      mode: 'decrypt',
      input: form.input,
      output,
      timestamp: Date.now(),
      config: {
        mode: form.mode,
        padding: form.padding,
        key: form.key,
        iv: form.iv
      }
    });

    ElMessage.success('解密成功');
    loadHistory();
  } catch (error) {
    console.error('解密失败:', error);
    ElMessage.error('解密失败');
  }
};

// 文件处理
const handleFileChange = (file: UploadFile) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      form.input = e.target.result as string;
    }
  };
  reader.readAsText(file.raw as Blob);
};

// 拖放文件处理
const handleDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        form.input = e.target.result as string;
      }
    };
    reader.readAsText(files[0]);
  }
};

// 输入处理
const handleInput = () => {
  // 可以在这里添加输入处理逻辑
};

const handleCopy = async () => {
  if (!form.output) {
    ElMessage.warning('没有可复制的内容');
    return;
  }

  try {
    await copy(form.output);
    ElMessage.success('复制成功');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

const handleDownload = () => {
  if (!form.output) {
    ElMessage.warning('没有可下载的内容');
    return;
  }

  downloadText(form.output, `blowfish-${operationMode.value}-${Date.now()}.txt`);
  ElMessage.success('下载成功');
};

const handleClear = () => {
  form.input = '';
  form.output = '';
};

// 历史记录相关方法
const loadHistory = async () => {
  try {
    history.value = await cryptoDB.getHistory('blowfish');
  } catch (error) {
    console.error('加载历史记录失败:', error);
  }
};

const useHistory = (item: CryptoHistory) => {
  operationMode.value = item.mode as 'encrypt' | 'decrypt';
  form.mode = item.config?.mode || 'CBC';
  form.padding = item.config?.padding || 'Pkcs7';
  form.key = item.config?.key || '';
  form.iv = item.config?.iv || '';
  form.input = item.input;
  form.output = item.output;
  showHistory.value = false;
};

const deleteHistory = async (id: number | undefined) => {
  if (id === undefined) return;
  
  try {
    await cryptoDB.deleteHistory(id);
    ElMessage.success('删除成功');
    loadHistory();
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  }
};

const clearHistory = async () => {
  try {
    await cryptoDB.clearHistory('blowfish');
    history.value = [];
    ElMessage.success('已清空历史记录');
  } catch (error) {
    console.error('清空历史记录失败:', error);
    ElMessage.error('清空历史记录失败');
  }
};

// 组件挂载时初始化
onMounted(() => {
  loadHistory();
});
</script>

<style lang="scss" scoped>
.blowfish-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-button) {
    &.el-button--primary {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);

      &:not(.is-disabled):hover {
        background-color: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
      }

      &.is-disabled {
        background-color: var(--el-color-primary-light-5);
        border-color: var(--el-color-primary-light-5);
      }
    }

    &:not(.el-button--primary) {
      &:not(.is-disabled):hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        background-color: var(--el-button-hover-bg-color);
      }
    }
  }

  .header {
    margin-bottom: 20px;

    h2 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .blowfish-info {
      margin-bottom: 16px;
      font-size: 13px;
      background-color: var(--el-fill-color-blank);
      border-color: var(--el-border-color-light);
      
      :deep(.el-alert__title) {
        font-size: 13px;
        line-height: 18px;
        color: var(--el-text-color-primary);
      }
      
      :deep(.el-alert__description) {
        font-size: 12px;
        line-height: 1.5;
        margin: 4px 0 0 0;
        color: var(--el-text-color-regular);
      }

      :deep(.el-alert__icon) {
        color: var(--el-text-color-regular);
      }
    }
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;

    .option-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      &:first-child {
        margin-bottom: 4px;
      }

      .el-select {
        flex: 1;
      }

      .operation-select {
        flex: 1;
      }

      .upload-btn {
        flex-shrink: 0;
        
        :deep(.el-upload) {
          display: block;
        }
      }
    }
  }

  .page-content {
    flex: 1;
    background-color: var(--el-fill-color-blank);
    border-radius: 8px;
    padding: 24px;
    box-shadow: var(--el-box-shadow-light);
    border: 1px solid var(--el-border-color-light);
    overflow-y: auto;

    :deep(.el-form-item__content) {
      width: 100%;
    }

    :deep(.el-form-item__label) {
      color: var(--el-text-color-regular);
    }

    :deep(.el-textarea__inner) {
      font-family: var(--el-font-family);
      font-size: 14px;
      line-height: 1.6;
      background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
      color: var(--el-text-color-primary);
      border-color: var(--el-border-color);

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }

      &:hover {
        border-color: var(--el-border-color-hover);
      }

      &:focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
      }
    }

    .key-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      font-size: 0.9rem;
      color: var(--el-text-color-secondary);
    }

    .input-area {
      width: 100%;
      border: 2px dashed var(--el-border-color);
      border-radius: 4px;
      transition: all 0.3s;
      background-color: var(--el-input-bg-color, var(--el-fill-color-blank));

      :deep(.el-textarea__inner) {
        border: none;
        background-color: transparent;
        width: 100%;
        
        &:focus {
          box-shadow: none;
        }
      }

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .input-stats,
    .output-controls {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }
}

// 历史记录样式
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .history-search {
    width: 300px;
  }
}

.history-list {
  max-height: 500px;
  overflow-y: auto;

  .history-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    background-color: var(--el-fill-color-blank);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .history-content {
      flex: 1;
      margin-right: 16px;

      .history-mode {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .history-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }

      .history-preview {
        .preview-input,
        .preview-output {
          margin-bottom: 4px;
          font-size: 13px;
          word-break: break-all;

          .preview-label {
            color: var(--el-text-color-secondary);
            margin-right: 8px;
          }

          .preview-text {
            color: var(--el-text-color-primary);
          }
        }
      }
    }

    .history-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style> 