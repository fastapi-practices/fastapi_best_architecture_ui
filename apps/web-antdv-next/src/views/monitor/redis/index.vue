<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
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
    key: 'redis_version',
    label: $t('page.monitor.redis.info.redis_version'),
    content: redisInfo.value?.redis_version,
  },
  {
    key: 'redis_mode',
    label: $t('page.monitor.redis.info.redis_mode'),
    content: redisInfo.value?.redis_mode,
  },
  {
    key: 'role',
    label: $t('page.monitor.redis.info.role'),
    content: redisInfo.value?.role,
  },
  {
    key: 'tcp_port',
    label: $t('page.monitor.redis.info.tcp_port'),
    content: redisInfo.value?.tcp_port,
  },
  {
    key: 'uptime',
    label: $t('page.monitor.redis.info.uptime'),
    content: redisInfo.value?.uptime,
  },
  {
    key: 'connected_clients',
    label: $t('page.monitor.redis.info.connected_clients'),
    content: redisInfo.value?.connected_clients,
  },
  {
    key: 'blocked_clients',
    label: $t('page.monitor.redis.info.blocked_clients'),
    content: redisInfo.value?.blocked_clients,
  },
  {
    key: 'used_memory_human',
    label: $t('page.monitor.redis.info.used_memory_human'),
    content: redisInfo.value?.used_memory_human,
  },
  {
    key: 'used_memory_rss_human',
    label: $t('page.monitor.redis.info.used_memory_rss_human'),
    content: redisInfo.value?.used_memory_rss_human,
  },
  {
    key: 'maxmemory_human',
    label: $t('page.monitor.redis.info.maxmemory_human'),
    content: redisInfo.value?.maxmemory_human,
  },
  {
    key: 'mem_fragmentation_ratio',
    label: $t('page.monitor.redis.info.mem_fragmentation_ratio'),
    content: redisInfo.value?.mem_fragmentation_ratio,
  },
  {
    key: 'total_commands_processed',
    label: $t('page.monitor.redis.info.total_commands_processed'),
    content: redisInfo.value?.total_commands_processed,
  },
  {
    key: 'instantaneous_ops_per_sec',
    label: $t('page.monitor.redis.info.instantaneous_ops_per_sec'),
    content: redisInfo.value?.instantaneous_ops_per_sec,
  },
  {
    key: 'rejected_connections',
    label: $t('page.monitor.redis.info.rejected_connections'),
    content: redisInfo.value?.rejected_connections,
  },
  {
    key: 'keys_num',
    label: $t('page.monitor.redis.info.keys_num'),
    content: redisInfo.value?.keys_num,
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
  <Page auto-content-height content-class="flex flex-col">
    <a-card :title="$t('page.monitor.redis.info.title')" :loading="loading">
      <a-descriptions :items="redisDescriptionItems" />
    </a-card>
    <div class="mt-4 flex min-h-0 flex-1 space-x-4">
      <div class="flex min-h-0 flex-1 flex-col">
        <a-card
          class="flex flex-1 flex-col"
          :title="$t('page.monitor.redis.cards.commands.title')"
          :loading="loading"
        >
          <CommandsSeries class="min-h-0 flex-1" :stats="redisStats" />
        </a-card>
      </div>
      <div class="flex min-h-0 flex-1 flex-col">
        <a-card
          class="flex flex-1 flex-col"
          :title="$t('page.monitor.redis.cards.memory.title')"
          :loading="loading"
        >
          <ActiveSeries class="min-h-0 flex-1" :memory="redisUsedMemory" />
        </a-card>
      </div>
    </div>
  </Page>
</template>
