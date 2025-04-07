<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { getRedisMonitor } from '#/api';
import ActiveSeries from '#/views/monitor/redis/components/active-series.vue';
import CommandsSeries from '#/views/monitor/redis/components/commands-series.vue';

const loading = ref<boolean>(false);
const redisInfo = ref<Record<string, any>>({});
const redisStats = ref<Record<string, any>[]>([]);

const usedMemory = ref<number>(0);
const redisUsedMemory = computed(() => [
  {
    name: '已使用内存',
    value: usedMemory.value,
  },
]);

const fetchRedisData = async () => {
  loading.value = true;
  try {
    const res = await getRedisMonitor();
    redisInfo.value = res.info;
    redisStats.value = res.stats;
  } catch {
    // console.error(err);
  } finally {
    loading.value = false;
  }
};
fetchRedisData();

watch(redisInfo, (val) => {
  usedMemory.value = Number.parseFloat(
    (Number(val.used_memory) / 1024 / 1024).toFixed(2),
  );
});
</script>

<template>
  <a-card title="基本信息" :loading="loading" class="info-card">
    <a-descriptions>
      <a-descriptions-item label="Test">123</a-descriptions-item>
    </a-descriptions>
  </a-card>
  <a-space style="padding-top: 22px" />
  <a-row :gutter="20">
    <a-col :span="12">
      <a-card title="命令统计" :loading="loading" class="info-card">
        <CommandsSeries :stats="redisStats" />
      </a-card>
    </a-col>
    <a-col :span="12">
      <a-card title="已使用内存" :loading="loading" class="info-card">
        <ActiveSeries :memory="redisUsedMemory" />
      </a-card>
    </a-col>
  </a-row>
</template>
