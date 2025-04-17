<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { getRedisMonitor } from '#/api';
import ActiveSeries from '#/views/monitor/redis/components/active-series.vue';
import CommandsSeries from '#/views/monitor/redis/components/commands-series.vue';

const loading = ref<boolean>(false);
const redisInfo = ref<Record<string, any>>({});
const redisStats = ref<Record<string, any>[]>([]);
const usedMemory = ref<number>(0);
const redisUsedMemory = computed(() => [
  {
    name: $t('page.monitor.redis.stats.title.used_memory'),
    value: usedMemory.value,
  },
]);

const fetchRedisData = async () => {
  loading.value = true;
  try {
    const res = await getRedisMonitor();
    redisInfo.value = res.info;
    redisStats.value = res.stats;
  } catch (error) {
    console.error(error);
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
  <div>
    <a-card
      :title="$t('page.monitor.redis.desc.title')"
      :loading="loading"
      class="info-card"
    >
      <a-descriptions>
        <a-descriptions-item label="Test">123</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-space style="padding-top: 22px" />
    <a-row :gutter="20">
      <a-col :span="12">
        <a-card
          :title="$t('page.monitor.redis.cards.commands.title')"
          :loading="loading"
          class="info-card"
        >
          <CommandsSeries :stats="redisStats" />
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card
          :title="$t('page.monitor.redis.cards.memory.title')"
          :loading="loading"
          class="info-card"
        >
          <ActiveSeries :memory="redisUsedMemory" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
