<template>
  <div class="history-table">
    <el-table
      v-loading="loading"
      :data="history"
      style="width: 100%"
      @row-click="handleSelect"
    >
      <el-table-column prop="mode" label="操作" width="100">
        <template #default="{ row }">
          <el-tag :type="row.mode === 'encrypt' ? 'success' : 'warning'">
            {{ row.mode === 'encrypt' ? '加密' : '解密' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="input" label="输入" show-overflow-tooltip />
      <el-table-column prop="output" label="输出" show-overflow-tooltip />
      <el-table-column prop="timestamp" label="时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.timestamp) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            type="danger"
            link
            @click.stop="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { cryptoDB } from '@/utils/db';
import type { CryptoHistory } from '@/types/crypto';

export default defineComponent({
  name: 'HistoryTable',
  props: {
    type: {
      type: String as () => 'aes' | 'des' | 'blowfish' | 'rsa',
      required: true
    }
  },
  emits: ['select', 'delete'],
  setup(props, { emit }) {
    const loading = ref(false);
    const history = ref<CryptoHistory[]>([]);
    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    });

    const loadHistory = async () => {
      try {
        loading.value = true;
        const records = await cryptoDB.getHistory(props.type);
        history.value = records;
        pagination.value.total = records.length;
      } catch (error) {
        console.error('加载历史记录失败:', error);
        ElMessage.error('加载历史记录失败');
      } finally {
        loading.value = false;
      }
    };

    const formatTime = (timestamp: number) => {
      return new Date(timestamp).toLocaleString();
    };

    const handleSelect = (record: CryptoHistory) => {
      emit('select', record);
    };

    const handleDelete = async (id: number) => {
      emit('delete', id);
      await loadHistory();
    };

    const handleSizeChange = (val: number) => {
      pagination.value.pageSize = val;
      loadHistory();
    };

    const handleCurrentChange = (val: number) => {
      pagination.value.currentPage = val;
      loadHistory();
    };

    onMounted(() => {
      loadHistory();
    });

    return {
      loading,
      history,
      pagination,
      formatTime,
      handleSelect,
      handleDelete,
      handleSizeChange,
      handleCurrentChange
    };
  }
});
</script>

<style scoped>
.history-table {
  width: 100%;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 