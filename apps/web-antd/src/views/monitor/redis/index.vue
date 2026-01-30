<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { $t } from '@vben/locales';

import { getRedisMonitorApi } from '#/api';
import ActiveSeries from '#/views/monitor/redis/components/active-series.vue';
import CommandsSeries from '#/views/monitor/redis/components/commands-series.vue';

const loading = ref<boolean>(false);
const redisInfo = ref<Record<string, any>>({});
const redisStats = ref<Record<string, any>[]>([]);
const usedMemory = ref<number>(0);
const redisUsedMemory = computed(() => [
  {
    name: $t('page.monitor.redis.info.used_memory_human'),
    value: usedMemory.value,
  },
]);

const fetchRedisData = async () => {
  loading.value = true;
  try {
    const res = await getRedisMonitorApi();
    redisInfo.value = res.info;
    redisStats.value = res.stats;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
fetchRedisData();

const redisDescriptionItems = computed(() => [
  {
    label: $t('page.monitor.redis.info.redis_version'),
    value: redisInfo.value?.redis_version,
  },
  {
    label: $t('page.monitor.redis.info.redis_mode'),
    value: redisInfo.value?.redis_mode,
  },
  {
    label: $t('page.monitor.redis.info.role'),
    value: redisInfo.value?.role,
  },
  {
    label: $t('page.monitor.redis.info.tcp_port'),
    value: redisInfo.value?.tcp_port,
  },
  {
    label: $t('page.monitor.redis.info.uptime_in_days'),
    value: redisInfo.value?.uptime_in_days,
  },
  {
    label: $t('page.monitor.redis.info.connected_clients'),
    value: redisInfo.value?.connected_clients,
  },
  {
    label: $t('page.monitor.redis.info.blocked_clients'),
    value: redisInfo.value?.blocked_clients,
  },
  {
    label: $t('page.monitor.redis.info.used_memory_human'),
    value: redisInfo.value?.used_memory_human,
  },
  {
    label: $t('page.monitor.redis.info.used_memory_rss_human'),
    value: redisInfo.value?.used_memory_rss_human,
  },
  {
    label: $t('page.monitor.redis.info.maxmemory_human'),
    value: redisInfo.value?.maxmemory_human,
  },
  {
    label: $t('page.monitor.redis.info.mem_fragmentation_ratio'),
    value: redisInfo.value?.mem_fragmentation_ratio,
  },
  {
    label: $t('page.monitor.redis.info.total_commands_processed'),
    value: redisInfo.value?.total_commands_processed,
  },
  {
    label: $t('page.monitor.redis.info.instantaneous_ops_per_sec'),
    value: redisInfo.value?.instantaneous_ops_per_sec,
  },
  {
    label: $t('page.monitor.redis.info.rejected_connections'),
    value: redisInfo.value?.rejected_connections,
  },
  {
    label: $t('page.monitor.redis.info.keys_num'),
    value: redisInfo.value?.keys_num,
  },
]);

const parseMemoryToMB = (memStr: string): number => {
  if (!memStr) return 0;
  const match = memStr.match(/^([\d.]+)([BKMG]?)$/i);
  if (!match || !match[1]) return 0;
  const value = Number.parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  switch (unit) {
    case 'G': {
      return value * 1024;
    }
    case 'K': {
      return value / 1024;
    }
    case 'M': {
      return value;
    }
    default: {
      return value / 1024 / 1024;
    }
  }
};

watch(redisInfo, (val) => {
  usedMemory.value = Number.parseFloat(
    parseMemoryToMB(val.used_memory_human).toFixed(2),
  );
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <div class="mt-4 w-full">
      <a-card :title="$t('page.monitor.redis.info.title')" :loading="loading">
        <a-descriptions>
          <a-descriptions-item
            v-for="item in redisDescriptionItems"
            :label="item.label"
            :key="item.label"
          >
            {{ item.value }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
    <div class="mt-4 flex w-full space-x-4">
      <div class="flex-1">
        <a-card
          :title="$t('page.monitor.redis.cards.commands.title')"
          :loading="loading"
        >
          <CommandsSeries :stats="redisStats" />
        </a-card>
      </div>
      <div class="flex-1">
        <a-card
          :title="$t('page.monitor.redis.cards.memory.title')"
          :loading="loading"
        >
          <ActiveSeries :memory="redisUsedMemory" />
        </a-card>
      </div>
    </div>
  </div>
</template>
