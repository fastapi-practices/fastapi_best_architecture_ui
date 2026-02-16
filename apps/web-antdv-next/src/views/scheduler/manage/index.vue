<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { CreateTaskSchedulerParams, TaskSchedulerResult } from '#/api';

import { computed, onMounted, onUnmounted, ref } from 'vue';

import { confirm, Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';
import { Cron } from 'croner';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createTaskSchedulerApi,
  deleteTaskSchedulerApi,
  executeTaskSchedulerApi,
  getTaskSchedulerListApi,
  updateTaskSchedulerApi,
  updateTaskSchedulerStatusApi,
} from '#/api';
import { router } from '#/router';
import { useWebSocketStore } from '#/store';
import CronBuilder from '#/views/scheduler/manage/cron-builder.vue';

import { createSchema, querySchema, useColumns } from './data';

const wsStore = useWebSocketStore();

const taskWorkerStatus = ref<any[]>([]);

const periodLabelMap: Record<string, string> = {
  days: '天',
  hours: '小时',
  minutes: '分钟',
  seconds: '秒',
};

const periodToSeconds: Record<string, number> = {
  days: 86_400,
  hours: 3600,
  minutes: 60,
  seconds: 1,
};

function getScheduleLabel(row: TaskSchedulerResult): string {
  if (row.type === 0) {
    const label =
      periodLabelMap[row.interval_period || 'seconds'] || row.interval_period;
    return `每 ${row.interval_every || '?'} ${label}`;
  }
  return row.crontab || '';
}

function getNextRuns(row: TaskSchedulerResult): Date[] {
  try {
    if (row.type === 0) {
      const every = row.interval_every;
      const period = row.interval_period || 'seconds';
      if (!every || every <= 0) return [];
      const intervalMs = every * (periodToSeconds[period] || 1) * 1000;
      const baseTime = row.last_run_time
        ? new Date(row.last_run_time)
        : new Date();
      return Array.from(
        { length: 5 },
        (_, i) => new Date(baseTime.getTime() + intervalMs * (i + 1)),
      );
    }
    if (!row.crontab) return [];
    return new Cron(row.crontab).nextRuns(5);
  } catch {
    return [];
  }
}

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: querySchema,
};

function onActionClick({
  code,
  row,
}: OnActionClickParams<TaskSchedulerResult>) {
  switch (code) {
    case 'delete': {
      confirm({
        icon: 'warning',
        content: '确认删除此任务计划吗？',
      }).then(async () => {
        try {
          await deleteTaskSchedulerApi(row.id);
          message.success($t('ui.actionMessage.deleteSuccess'));
          onRefresh();
        } catch (error) {
          console.error(error);
        }
      });
      break;
    }
    case 'edit': {
      modalApi.setData(row).open();
      break;
    }
    case 'log': {
      searchLog(row.task);
      break;
    }
  }
}

const gridOptions: VxeTableGridOptions<TaskSchedulerResult> = {
  rowConfig: {
    keyField: 'id',
  },
  checkboxConfig: {
    highlight: true,
  },
  height: 'auto',
  exportConfig: {},
  printConfig: {},
  toolbarConfig: {
    export: true,
    print: true,
    refresh: true,
    refreshOptions: {
      code: 'query',
    },
    custom: true,
    zoom: true,
  },
  columns: useColumns(onActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getTaskSchedulerListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

function onRefresh() {
  gridApi.query();
}

const cronBuilderVisible = ref(false);

function openCrontabBuilder() {
  cronBuilderVisible.value = true;
}

function onCronConfirm(value: string) {
  formApi.setFieldValue('crontab', value);
}

const [Form, formApi] = useVbenForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  showDefaultActions: false,
  schema: createSchema(openCrontabBuilder),
});

interface formTaskSchedulerParams extends CreateTaskSchedulerParams {
  id?: number;
}

const formData = ref<formTaskSchedulerParams>();

const modalTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', ['任务'])
    : $t('ui.actionTitle.create', ['任务']);
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-5/12',
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues<CreateTaskSchedulerParams>();
      try {
        await (formData.value?.id
          ? updateTaskSchedulerApi(formData.value?.id, data)
          : createTaskSchedulerApi(data));
        message.success($t('ui.actionMessage.operationSuccess'));
        await modalApi.close();
        await formApi.resetForm();
        onRefresh();
      } catch (error) {
        console.error(error);
      } finally {
        modalApi.unlock();
      }
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<formTaskSchedulerParams>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        data.crontab = data.id ? data.crontab : '* * * * *';
        if (data.start_time) {
          data.start_time = dayjs(data.start_time, 'YYYY-MM-DD HH:mm:ss');
        }
        if (data.expire_time) {
          data.expire_time = dayjs(data.start_time, 'YYYY-MM-DD HH:mm:ss');
        }
        formApi.setValues(data);
      }
    }
  },
});

const executeTask = async (pk: number) => {
  try {
    await executeTaskSchedulerApi(pk);
    message.success('执行成功，任务已下发');
  } catch (error) {
    console.error(error);
  }
};

const searchLog = (task: string) => {
  router.push({ path: '/scheduler/record', query: { name: task } });
};

const handleStatusChange = async (row: TaskSchedulerResult) => {
  try {
    await updateTaskSchedulerStatusApi(row.id);
    message.success($t('ui.actionMessage.operationSuccess'));
    onRefresh();
  } catch (error) {
    console.error(error);
  }
};

let cleanupWS: (() => void) | null = null;
const intervalId = ref<any>(null);
const emitWS = () => {
  wsStore.emit('task_worker_status');
};

onMounted(async () => {
  cleanupWS = wsStore.on('task_worker_status', (data: any[]) => {
    taskWorkerStatus.value = data;
  });
  emitWS();
  intervalId.value = setInterval(emitWS, 5000);
});

onUnmounted(() => {
  if (cleanupWS) {
    cleanupWS();
  }
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <VbenButton @click="() => modalApi.setData(null).open()">
          <MaterialSymbolsAdd class="size-5" />
          创建任务
        </VbenButton>
      </template>
      <template #schedule="{ row }">
        <a-popover placement="top">
          <template #content>
            <div class="text-sm">
              <div class="mb-1 font-medium">接下来 5 次运行时间：</div>
              <template v-if="getNextRuns(row).length > 0">
                <div
                  v-for="(time, idx) in getNextRuns(row)"
                  :key="idx"
                  class="py-0.5"
                >
                  {{ dayjs(time).format('YYYY-MM-DD HH:mm:ss') }}
                </div>
              </template>
              <div v-else class="text-gray-400">无法计算运行时间</div>
            </div>
          </template>
          <a-tag class="cursor-pointer">
            {{ getScheduleLabel(row) }}
          </a-tag>
        </a-popover>
      </template>
      <template #enabled="{ row }">
        <a-switch
          v-model:checked="row.enabled"
          :checked-value="true"
          checked-children="启用"
          un-checked-children="禁用"
          @click="handleStatusChange(row)"
        />
      </template>
      <template #total_run_count="{ row }">
        {{ row.total_run_count }} 次
      </template>
      <template #execute="{ row }">
        <a-tooltip
          v-if="taskWorkerStatus.length === 0"
          title="任务执行服务暂不可用，请联系系统管理员"
        >
          <a-button size="small" disabled>执行</a-button>
        </a-tooltip>
        <a-button v-else size="small" @click="executeTask(row.id)">
          执行
        </a-button>
      </template>
    </Grid>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <CronBuilder
      v-model:open="cronBuilderVisible"
      :value="formApi.form?.values?.crontab"
      @confirm="onCronConfirm"
    />
  </Page>
</template>
