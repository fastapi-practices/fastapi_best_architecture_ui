<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { Card, Col, Descriptions, Row, Space } from 'ant-design-vue';

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
    <Card title="基本信息" :loading="loading" class="info-card">
      <Descriptions>
        <Descriptions.Item label="Test">123</Descriptions.Item>
      </Descriptions>
    </Card>
    <Space style="padding-top: 22px" />
    <Row :gutter="20">
      <Col :span="12">
        <Card title="命令统计" :loading="loading" class="info-card">
          <CommandsSeries :stats="redisStats" />
        </Card>
      </Col>
      <Col :span="12">
        <Card title="已使用内存" :loading="loading" class="info-card">
          <ActiveSeries :memory="redisUsedMemory" />
        </Card>
      </Col>
    </Row>
  </div>
</template>
