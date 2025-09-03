<script setup lang="ts">
import type { CreateTaskSchedulerParams, TaskSchedulerResult } from '#/api';

import { computed, onMounted, onUnmounted, ref } from 'vue';

import {
  confirm,
  EllipsisText,
  Page,
  useVbenModal,
  VbenButton,
} from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  createTaskSchedulerApi,
  deleteTaskSchedulerApi,
  executeTaskSchedulerApi,
  getAllTaskSchedulerApi,
  updateTaskSchedulerApi,
  updateTaskSchedulerStatusApi,
} from '#/api';
import { router } from '#/router';
import { useWebSocketStore } from '#/store';

import { schema } from './data';

const wsStore = useWebSocketStore();

const taskWorkerStatus = ref<any[]>([]);
const taskSchedulerList = ref<TaskSchedulerResult[]>();

const fetchTaskSchedulerList = async () => {
  try {
    taskSchedulerList.value = await getAllTaskSchedulerApi();
  } catch (error) {
    console.error(error);
  }
};

const [Form, formApi] = useVbenForm({
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  showDefaultActions: false,
  schema,
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
      const args = ref();
      if (data.args) {
        try {
          args.value = JSON.parse(data.args);
        } catch {
          const argsStr = data.args.trim().startsWith('[')
            ? data.args.trim().slice(1, -1)
            : data.args;
          args.value = argsStr.split(',').map((item) => {
            const trimmed = item.trim();
            const num = Number(trimmed);
            return Number.isNaN(num) ? trimmed : num;
          });
        }
        data.args = JSON.stringify(args.value);
      }
      try {
        await (formData.value?.id
          ? updateTaskSchedulerApi(formData.value?.id, data)
          : createTaskSchedulerApi(data));
        message.success($t('ui.actionMessage.operationSuccess'));
        await modalApi.close();
        await formApi.resetForm();
        await fetchTaskSchedulerList();
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

function deleteConfirm(pk: number) {
  confirm({
    icon: 'warning',
    content: '确认删除此任务计划吗？',
  }).then(async () => {
    try {
      await deleteTaskSchedulerApi(pk);
      message.success($t('ui.actionMessage.deleteSuccess'));
      await fetchTaskSchedulerList();
    } catch (error) {
      console.error(error);
    }
  });
}

const executeTask = async (pk: number) => {
  try {
    await executeTaskSchedulerApi(pk);
    message.success('执行成功，任务已下发');
  } catch (error) {
    console.error(error);
  }
};

const searchLog = (task: string) => {
  router.replace({ path: `/scheduler/record`, query: { name: task } });
};

const intervalId = ref<any>(null);
const emitTWS = () => {
  wsStore.emit('task_worker_status');
};

onMounted(async () => {
  await fetchTaskSchedulerList();
  wsStore.on('task_worker_status', (data: any[]) => {
    taskWorkerStatus.value = data;
  });
  emitTWS();
  intervalId.value = setInterval(emitTWS, 5000);
});

onUnmounted(() => {
  wsStore.off('task_worker_status', () => {
    taskWorkerStatus.value = [];
  });
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<template>
  <Page>
    <VbenButton @click="() => modalApi.setData(null).open()">
      创建任务
    </VbenButton>
    <Modal :title="modalTitle">
      <Form />
    </Modal>
    <a-alert
      v-if="taskWorkerStatus.length === 0"
      class="mt-4"
      message="任务执行服务暂不可用，请联系系统管理员"
      type="warning"
      show-icon
    />
    <div class="mt-4">
      <!-- 网格容器 -->
      <div class="grid gap-6 lg:grid-cols-4">
        <a-card v-for="ts in taskSchedulerList" :key="ts.name">
          <template #title>
            {{ ts.name }}
          </template>
          <template #extra>
            <a-switch
              v-model:checked="ts.enabled"
              :checked-value="true"
              checked-children="启用"
              un-checked-children="禁用"
              @click="
                updateTaskSchedulerStatusApi(ts.id).then(
                  message.success($t('ui.actionMessage.operationSuccess')),
                )
              "
            />
          </template>
          <template #actions>
            <a-button size="small" danger @click="deleteConfirm(ts.id)">
              删除
            </a-button>
            <a-button size="small" type="text" @click="searchLog(ts.task)">
              日志
            </a-button>
            <a-button size="small" @click="modalApi.setData(ts).open()">
              编辑
            </a-button>
            <a-button
              size="small"
              :disabled="taskWorkerStatus.length === 0"
              @click="executeTask(ts.id)"
            >
              手动执行
            </a-button>
          </template>
          <EllipsisText
            tooltip-when-ellipsis
            :tooltip-overlay-style="{ wordBreak: 'break-all' }"
          >
            <span class="text-gray-500">任务调用：</span>
            {{ ts.task }}
            <template #tooltip>
              {{ ts.task }}
            </template>
          </EllipsisText>
          <p>
            <span class="text-gray-500">开始时间：</span>
            {{ ts.start_time || 'N/A' }}
          </p>
          <p>
            <span class="text-gray-500">过期时间：</span>
            {{ ts.expire_seconds ? `${ts.expire_seconds} seconds` : 'N/A' }}
          </p>
          <p>
            <span class="text-gray-500">触发策略：</span>
            <span v-if="ts.type === 0">
              <a-tag :bordered="false" color="cyan">Interval</a-tag>
              <a-tag>{{ ts.interval_every }} {{ ts.interval_period }} </a-tag>
            </span>
            <span v-else>
              <a-tag :bordered="false" color="purple">Crontab</a-tag>
              <a-tag>{{ ts.crontab }}</a-tag>
            </span>
          </p>
          <p>
            <span class="text-gray-500">最近执行：</span>
            {{ ts.last_run_time || 'N/A' }}
          </p>
          <p>
            <span class="text-gray-500"> 执行总计： </span>
            {{ ts.total_run_count }} 次
          </p>
          <EllipsisText
            tooltip-when-ellipsis
            :tooltip-overlay-style="{ wordBreak: 'break-all' }"
          >
            <span class="text-gray-500">任务描述：</span>
            {{ ts.remark || 'N/A' }}
            <template #tooltip>
              {{ ts.remark }}
            </template>
          </EllipsisText>
        </a-card>
      </div>
    </div>
  </Page>
</template>
