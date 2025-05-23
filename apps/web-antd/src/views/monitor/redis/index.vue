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
    name: $t('page.monitor.redis.stats.title.used_memory'),
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
    label: $t('page.monitor.redis.info.version'),
    value: redisInfo.value?.redis_version,
  },
  {
    label: $t('page.monitor.redis.info.os'),
    value: redisInfo.value?.os,
  },
  {
    label: $t('page.monitor.redis.info.arch'),
    value: redisInfo.value?.arch_bits,
  },
  {
    label: $t('page.monitor.redis.info.mode'),
    value: redisInfo.value?.redis_mode,
  },
  {
    label: $t('page.monitor.redis.info.role'),
    value: redisInfo.value?.role,
  },
  {
    label: $t('page.monitor.redis.info.memory_human'),
    value: redisInfo.value?.used_memory_human,
  },
  {
    label: $t('page.monitor.redis.info.connections_received'),
    value: redisInfo.value?.total_connections_received,
  },
  {
    label: $t('page.monitor.redis.info.clients'),
    value: redisInfo.value?.blocked_clients,
  },
  {
    label: $t('page.monitor.redis.info.rejected_connections'),
    value: redisInfo.value?.rejected_connections,
  },
  {
    label: $t('page.monitor.redis.info.commands_processed'),
    value: redisInfo.value?.total_commands_processed,
  },
  {
    label: $t('page.monitor.redis.info.keys_command_stats'),
    value:
      Number(redisInfo.value?.keyspace_hits) +
      Number(redisInfo.value?.keyspace_misses),
  },
  {
    label: $t('page.monitor.redis.info.keys_num'),
    value: redisInfo.value?.keys_num,
  },
  {
    label: $t('page.monitor.redis.info.used_cpu'),
    value: redisInfo.value?.used_cpu_sys,
  },
  {
    label: $t('page.monitor.redis.info.used_cpu_children'),
    value: redisInfo.value?.used_cpu_sys_children,
  },
  {
    label: $t('page.monitor.redis.info.uptime'),
    value: redisInfo.value?.uptime_in_seconds,
  },
]);

watch(redisInfo, (val) => {
  usedMemory.value = Number.parseFloat(
    (Number(val.used_memory) / 1024 / 1024).toFixed(2),
  );
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <div class="mt-4 w-full">
      <a-card :title="$t('page.monitor.redis.desc.title')" :loading="loading">
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
