<script lang="ts" setup>
import type { PropType } from 'vue';

import type { EchartsUIType } from '@vben/plugins/echarts';

import { computed, onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { usePreferences } from '@vben/preferences';

const props = defineProps({
  stats: {
    type: Array as PropType<Record<string, any>[]>,
    required: true,
    default: () => [] as Record<string, any>[],
  },
});

const { isDark } = usePreferences();
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const labelColor = computed(() =>
  isDark.value ? 'rgba(255, 255, 255, 0.7)' : '#1F2329',
);

const renderChart = () => {
  renderEcharts({
    series: [
      {
        type: 'pie',
        data: props.stats,
        label: {
          formatter: '{b}: {d}%',
          fontSize: 14,
          color: labelColor.value,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
  });
};

onMounted(() => {
  renderChart();
});

watch(
  [isDark, () => props.stats],
  () => {
    renderChart();
  },
  { deep: false },
);
</script>

<template>
  <EchartsUI ref="chartRef" height="350px" />
</template>
