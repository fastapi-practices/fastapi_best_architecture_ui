<script lang="ts" setup>
import type { PropType } from 'vue';

import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const props = defineProps({
  memory: {
    type: Array as PropType<Record<string, any>[]>,
    required: true,
    default: () => [] as Record<string, any>[],
  },
});

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    progress: {
      show: true,
    },
    series: [
      {
        type: 'gauge',
        data: props.memory,
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d'],
            ],
          },
        },
        pointer: {
          itemStyle: {
            color: 'auto',
          },
        },
      },
    ],
    detail: {
      valueAnimation: true,
      formatter: '{value} M',
      color: 'auto',
    },
    tooltip: {
      formatter: '{a} <br/>{b} : {c} M',
    },
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" height="350px" />
</template>
