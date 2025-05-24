<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getServerMonitorApi } from '#/api';

const loading = ref<boolean>(false);

const setServerData = ref<Record<string, any>>({});

const diskData = ref<any[]>([]);

const cpuData = computed(() => {
  return {
    usage: setServerData.value.cpu?.usage,
    current_freq: setServerData.value.cpu?.current_freq,
    max_freq: setServerData.value.cpu?.max_freq,
    min_freq: setServerData.value.cpu?.min_freq,
    logical_num: setServerData.value.cpu?.logical_num,
    physical_num: setServerData.value.cpu?.physical_num,
  };
});

const memData = computed(() => {
  return {
    total: setServerData.value.memory?.total,
    used: setServerData.value.memory?.used,
    free: setServerData.value.memory?.free,
    usage: setServerData.value.memory?.usage,
  };
});

const serviceData = computed(() => {
  const data: any[] = [];
  if (setServerData.value.service) {
    Object.keys(setServerData.value.service).forEach((key) => {
      data.push({
        label: key,
        value: setServerData.value.service[key],
      });
    });
  }
  return data;
});

const osData = computed(() => {
  const data: any[] = [];
  if (setServerData.value.system) {
    Object.keys(setServerData.value.system).forEach((key) => {
      data.push({
        label: key,
        value: setServerData.value.system[key],
      });
    });
  }
  return data;
});

const usageStyle = (type: string) => {
  let num = 0;
  if (type === 'cpu') {
    num = cpuData.value.usage;
  } else if (type === 'memory') {
    num = memData.value.usage;
  }
  if (num < 50) {
    return { color: '#32CD32' };
  }
  if (num < 80) {
    return { color: '#FFD700' };
  }
  return { color: '#DC143C' };
};

const fetchServerData = async () => {
  loading.value = true;
  try {
    const res = await getServerMonitorApi();
    setServerData.value.cpu = res.cpu;
    setServerData.value.memory = res.mem;
    setServerData.value.system = res.sys;
    setServerData.value.service = res.service;
    diskData.value = res.disk;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'dir', title: $t('page.monitor.server.disk.dir') },
      { field: 'type', title: $t('page.monitor.server.disk.type') },
      { field: 'device', title: $t('page.monitor.server.disk.device') },
      { field: 'total', title: $t('page.monitor.server.disk.total') },
      { field: 'free', title: $t('page.monitor.server.disk.free') },
      { field: 'used', title: $t('page.monitor.server.disk.used') },
      { field: 'usage', title: $t('page.monitor.server.disk.usage') },
    ],
    stripe: true,
    pagerConfig: {
      enabled: false,
    },
  },
});

onMounted(async () => {
  await fetchServerData();
  gridApi.setGridOptions({ data: diskData.value });
});
</script>

<template>
  <div class="flex flex-col items-center px-6">
    <div class="mt-6 flex w-full space-x-6">
      <div class="flex-1">
        <a-card :loading="loading" title="CPU">
          <div class="mt-6 flex w-full space-x-6 px-6">
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.cpu.usage')"
                :value="cpuData.usage"
                :value-style="usageStyle('cpu')"
                suffix=" %"
              />
            </div>
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.cpu.current_freq')"
                :value="cpuData.current_freq"
                suffix=" MHz"
              />
            </div>
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.cpu.logical_num')"
                :value="cpuData.logical_num"
              />
            </div>
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.cpu.physical_num')"
                :value="cpuData.physical_num"
              />
            </div>
          </div>
        </a-card>
      </div>
      <div class="flex-1">
        <a-card
          :loading="loading"
          :title="$t('page.monitor.server.memory.title')"
        >
          <div class="mt-6 flex w-full space-x-6 px-6">
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.memory.total')"
                :value="memData.total"
                suffix=" GB"
              />
            </div>
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.memory.used')"
                :value="memData.used"
                suffix=" GB"
              />
            </div>
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.memory.free')"
                :value="memData.free"
                suffix=" GB"
              />
            </div>
            <div class="flex-1">
              <a-statistic
                :title="$t('page.monitor.server.memory.usage')"
                :value="memData.usage"
                :value-style="usageStyle('memory')"
                suffix=" %"
              />
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <div class="mt-6 w-full space-y-6">
      <a-card :loading="loading" :title="$t('page.monitor.server.service')">
        <a-descriptions>
          <a-descriptions-item
            v-for="item in serviceData"
            :label="item.label"
            :key="item.label"
          >
            {{ item.value }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
      <a-card :loading="loading" :title="$t('page.monitor.server.system')">
        <a-descriptions size="middle" :column="4">
          <a-descriptions-item
            v-for="item in osData"
            :label="item.label"
            :key="item.label"
          >
            {{ item.value }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
      <a-card :loading="loading" :title="$t('page.monitor.server.disk.title')">
        <Grid />
      </a-card>
    </div>
  </div>
</template>
