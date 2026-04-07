<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  getWorkflowMyApplyListApi,
  getWorkflowMyTodoListApi,
  getWorkflowTodoCountApi,
} from '#/plugins/workflow/api';

const loading = ref(false);
const todoCount = ref(0);
const applyTotal = ref(0);
const todoTotal = ref(0);
const recentApplyItems = ref<
  Array<{ created_time: string; id: number; status: string; title: string }>
>([]);
const recentTodoItems = ref<
  Array<{ created_time: string; id: number; status: string; title: string }>
>([]);

const completionRate = computed(() => {
  if (applyTotal.value <= 0) {
    return 0;
  }
  return Math.round(
    ((applyTotal.value - todoTotal.value) / applyTotal.value) * 100,
  );
});

async function loadStatistics() {
  loading.value = true;
  try {
    const [count, applyPage, todoPage] = await Promise.all([
      getWorkflowTodoCountApi(),
      getWorkflowMyApplyListApi({ page: 1, size: 5 }),
      getWorkflowMyTodoListApi({ page: 1, size: 5 }),
    ]);
    todoCount.value = count;
    applyTotal.value = applyPage.total;
    todoTotal.value = todoPage.total;
    recentApplyItems.value = applyPage.items.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      created_time: item.created_time,
    }));
    recentTodoItems.value = todoPage.items.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      created_time: item.created_time,
    }));
  } finally {
    loading.value = false;
  }
}

onMounted(loadStatistics);
</script>

<template>
  <Page auto-content-height>
    <div v-loading="loading" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-4">
        <a-card title="当前待办">
          <a-statistic :value="todoCount" />
        </a-card>
        <a-card title="我的申请总数">
          <a-statistic :value="applyTotal" />
        </a-card>
        <a-card title="待处理任务数">
          <a-statistic :value="todoTotal" />
        </a-card>
        <a-card title="办结率">
          <a-statistic suffix="%" :value="completionRate" />
        </a-card>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <a-card title="最近申请">
          <a-empty
            v-if="recentApplyItems.length === 0"
            description="暂无申请数据"
          />
          <a-list v-else :data-source="recentApplyItems" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="w-full">
                  <div class="flex items-center justify-between gap-3">
                    <strong>{{ item.title }}</strong>
                    <a-tag>{{ item.status }}</a-tag>
                  </div>
                  <div
                    class="mt-1 text-xs text-[var(--ant-color-text-secondary)]"
                  >
                    {{ item.created_time }}
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>

        <a-card title="最近待办">
          <a-empty
            v-if="recentTodoItems.length === 0"
            description="暂无待办数据"
          />
          <a-list v-else :data-source="recentTodoItems" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="w-full">
                  <div class="flex items-center justify-between gap-3">
                    <strong>{{ item.title }}</strong>
                    <a-tag color="processing">{{ item.status }}</a-tag>
                  </div>
                  <div
                    class="mt-1 text-xs text-[var(--ant-color-text-secondary)]"
                  >
                    {{ item.created_time }}
                  </div>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </div>

      <a-card title="统计说明" :bordered="false">
        <a-alert
          type="info"
          show-icon
          message="当前统计页已接入真实待办/申请数据汇总，趋势图与排名图等待专用统计接口补齐。"
        />
      </a-card>
    </div>
  </Page>
</template>
