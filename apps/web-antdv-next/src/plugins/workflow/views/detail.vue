<script lang="ts" setup>
import type { WorkflowInstanceResult } from '#/plugins/workflow/api';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { confirm, Page } from '@vben/common-ui';

import { message } from 'antdv-next';

import {
  approveWorkflowTaskApi,
  getWorkflowInstanceDetailApi,
  rejectWorkflowTaskApi,
  urgeWorkflowInstanceApi,
  withdrawWorkflowInstanceApi,
} from '#/plugins/workflow/api';
import { useWorkflowStore } from '#/store';

import {
  workflowFormDataText,
  workflowMessageTypeLabel,
  workflowStatusLabel,
} from './data';

const route = useRoute();
const router = useRouter();
const workflowStore = useWorkflowStore();
const loading = ref(false);
const actionLoading = ref(false);
const instance = ref<null | WorkflowInstanceResult>(null);
const actionComment = ref('');

const formDataText = computed(() =>
  workflowFormDataText(instance.value?.form_data),
);
const messages = computed(() => instance.value?.messages ?? []);
const currentStatus = computed(() =>
  workflowStatusLabel(instance.value?.status ?? '-'),
);
const currentTaskId = computed(() => instance.value?.current_task_id ?? null);
const from = computed(() => String(route.query.from ?? ''));
const back = computed(() => String(route.query.back ?? ''));
const isMyApplyEntry = computed(() => from.value === 'my-apply');
const isMyTodoEntry = computed(() => from.value === 'my-todo');
const showApprovalActions = computed(
  () => isMyTodoEntry.value && Boolean(currentTaskId.value),
);
const canWithdraw = computed(
  () =>
    isMyApplyEntry.value &&
    instance.value?.status === 'RUNNING' &&
    instance.value?.allow_withdraw === true,
);
const canUrge = computed(
  () =>
    isMyApplyEntry.value &&
    instance.value?.status === 'RUNNING' &&
    instance.value?.allow_urge === true &&
    Boolean(instance.value?.current_task_id),
);
const backText = computed(() => {
  if (from.value === 'my-apply') {
    return '返回我的申请';
  }
  if (from.value === 'my-todo') {
    return '返回待我审批';
  }
  if (from.value === 'message') {
    return '返回审批消息';
  }
  return '返回列表';
});
const displayFormDataText = computed(() => {
  const formData = instance.value?.form_data;
  if (formData && typeof formData === 'object' && !Array.isArray(formData)) {
    const filtered = Object.fromEntries(
      Object.entries(formData).filter(
        ([key]) => key !== '__self_select_assignees__',
      ),
    );
    return workflowFormDataText(filtered);
  }
  return formDataText.value;
});

function buildBackRoute(query: Record<string, any> = {}) {
  if (back.value) {
    return back.value;
  }
  if (from.value === 'my-apply') {
    return { path: '/plugins/workflow/my-apply', query };
  }
  if (from.value === 'my-todo') {
    return { path: '/plugins/workflow/my-todo', query };
  }
  if (from.value === 'message') {
    return { path: '/plugins/workflow/message', query };
  }
  return { path: '/plugins/workflow/my-apply', query };
}

function goToBack() {
  if (back.value) {
    router.push(back.value);
    return;
  }
  router.push(buildBackRoute());
}

function goToMessageCenter() {
  router.push('/plugins/workflow/message');
}

async function refreshLinkedState(type: 'action' | 'urge') {
  if (type === 'urge') {
    await workflowStore.refreshUnreadCount();
    return;
  }
  await workflowStore.refreshCounts();
}

async function goBackWithRefresh() {
  if (back.value) {
    const separator = back.value.includes('?') ? '&' : '?';
    await router.push(`${back.value}${separator}refresh=1`);
    return;
  }
  await router.push(buildBackRoute({ refresh: '1' }));
}

async function loadDetail() {
  const pk = Number(route.params.id);
  if (!pk) {
    message.error('流程实例参数无效');
    return;
  }
  loading.value = true;
  try {
    instance.value = await getWorkflowInstanceDetailApi(pk);
  } finally {
    loading.value = false;
  }
}

async function approve() {
  if (!currentTaskId.value) {
    message.warning('当前没有可审批任务');
    return;
  }
  actionLoading.value = true;
  try {
    await approveWorkflowTaskApi(currentTaskId.value, {
      comment: actionComment.value || '同意',
    });
    message.success('审批通过');
    actionComment.value = '';
    await loadDetail();
    await refreshLinkedState('action');
  } finally {
    actionLoading.value = false;
  }
}

async function reject() {
  if (!currentTaskId.value) {
    message.warning('当前没有可审批任务');
    return;
  }
  actionLoading.value = true;
  try {
    await rejectWorkflowTaskApi(currentTaskId.value, {
      comment: actionComment.value || '拒绝',
    });
    message.success('审批已拒绝');
    actionComment.value = '';
    await loadDetail();
    await refreshLinkedState('action');
  } finally {
    actionLoading.value = false;
  }
}

async function urge() {
  const pk = Number(route.params.id);
  if (!pk) {
    message.error('流程实例参数无效');
    return;
  }
  confirm({
    title: '确认催办',
    content: '确认向当前审批人发送催办提醒吗？',
  }).then(async () => {
    actionLoading.value = true;
    try {
      await urgeWorkflowInstanceApi(pk);
      message.success('催办提醒已发送');
      await loadDetail();
      await refreshLinkedState('urge');
    } finally {
      actionLoading.value = false;
    }
  });
}

async function withdraw() {
  const pk = Number(route.params.id);
  if (!pk) {
    message.error('流程实例参数无效');
    return;
  }
  confirm({
    title: '确认撤回',
    content: '撤回后当前待办会被取消，确认继续吗？',
  }).then(async () => {
    actionLoading.value = true;
    try {
      instance.value = await withdrawWorkflowInstanceApi(pk);
      message.success('流程已撤回');
      await refreshLinkedState('action');
    } finally {
      actionLoading.value = false;
    }
  });
}

function showUnsupportedAction(action: string) {
  message.info(`${action}功能后端接口暂未接入，当前先保留页面入口。`);
}

onMounted(loadDetail);
</script>

<template>
  <Page auto-content-height>
    <div v-loading="loading" class="space-y-4">
      <a-card :bordered="false">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold">
              {{ instance?.title || '流程详情' }}
            </div>
            <div class="mt-1 text-sm text-[var(--ant-color-text-secondary)]">
              实例编号：{{ instance?.instance_no || '-' }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a-button @click="goToBack">{{ backText }}</a-button>
            <a-button v-if="from" type="link" @click="goBackWithRefresh">
返回并刷新
</a-button>
            <a-tag color="processing">{{ currentStatus }}</a-tag>
          </div>
        </div>
      </a-card>

      <div class="workflow-detail-layout">
        <div class="space-y-4">
          <a-card title="流程进度">
            <a-timeline>
              <a-timeline-item>
                <div class="font-medium">发起申请</div>
                <div class="text-sm text-[var(--ant-color-text-secondary)]">
                  发起人ID：{{ instance?.initiator_id || '-' }}
                </div>
              </a-timeline-item>
              <a-timeline-item v-for="item in messages" :key="item.id">
                <div class="flex items-center gap-2">
                  <strong>{{ item.title }}</strong>
                  <a-tag>
{{
                    workflowMessageTypeLabel(item.message_type)
                  }}
</a-tag>
                </div>
                <div
                  class="mt-1 text-sm text-[var(--ant-color-text-secondary)]"
                >
                  {{ item.content }}
                </div>
                <div class="mt-1 text-xs text-[var(--ant-color-text-tertiary)]">
                  {{ item.created_time }}
                </div>
              </a-timeline-item>
            </a-timeline>
          </a-card>
        </div>

        <div class="space-y-4">
          <a-card title="申请信息">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="标题">
{{
                instance?.title || '-'
              }}
</a-descriptions-item>
              <a-descriptions-item label="流程定义ID">
{{
                instance?.definition_id || '-'
              }}
</a-descriptions-item>
              <a-descriptions-item label="发起人ID">
{{
                instance?.initiator_id || '-'
              }}
</a-descriptions-item>
              <a-descriptions-item label="当前任务ID">
{{
                instance?.current_task_id || '-'
              }}
</a-descriptions-item>
              <a-descriptions-item label="允许撤回">
{{
                instance?.allow_withdraw ? '是' : '否'
              }}
</a-descriptions-item>
              <a-descriptions-item label="允许催办">
{{
                instance?.allow_urge ? '是' : '否'
              }}
</a-descriptions-item>
              <a-descriptions-item label="备注" :span="2">
{{
                instance?.remark || '-'
              }}
</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="表单数据">
            <pre
              class="m-0 overflow-auto rounded bg-[var(--ant-color-fill-quaternary)] p-4 text-sm"
              >{{ displayFormDataText }}</pre>
          </a-card>

          <a-card title="审批操作">
            <a-form layout="vertical">
              <a-alert
                v-if="isMyTodoEntry && !showApprovalActions"
                type="info"
                show-icon
                message="当前实例没有可由你处理的待办任务。"
                class="mb-4"
              />
              <a-alert
                v-else-if="isMyApplyEntry && !canWithdraw && !canUrge"
                type="info"
                show-icon
                message="当前流程定义或实例状态下不可撤回、不可催办。"
                class="mb-4"
              />
              <a-form-item label="审批意见">
                <a-textarea
                  v-model:value="actionComment"
                  :rows="3"
                  placeholder="请输入审批意见"
                  :disabled="!showApprovalActions"
                />
              </a-form-item>
              <a-space wrap>
                <template v-if="isMyTodoEntry">
                  <a-button
                    type="primary"
                    :loading="actionLoading"
                    :disabled="!showApprovalActions"
                    @click="approve"
                    >
通过
</a-button>
                  <a-button
                    danger
                    :loading="actionLoading"
                    :disabled="!showApprovalActions"
                    @click="reject"
                    >
拒绝
</a-button>
                  <a-button
                    :disabled="!showApprovalActions"
                    @click="showUnsupportedAction('转审')"
                    >
转审
</a-button>
                  <a-button
                    :disabled="!showApprovalActions"
                    @click="showUnsupportedAction('加签')"
                    >
加签
</a-button>
                </template>
                <template v-if="isMyApplyEntry">
                  <a-button
                    :loading="actionLoading"
                    :disabled="!canUrge"
                    @click="urge"
                    >
催办
</a-button>
                  <a-button
                    danger
                    ghost
                    :loading="actionLoading"
                    :disabled="!canWithdraw"
                    @click="withdraw"
                    >
撤回
</a-button>
                </template>
                <a-button @click="goToBack">{{ backText }}</a-button>
              </a-space>
            </a-form>
          </a-card>

          <a-card title="流程消息">
            <template #extra>
              <a-button size="small" @click="goToMessageCenter">
消息中心
</a-button>
            </template>
            <a-empty v-if="messages.length === 0" description="暂无流程消息" />
            <a-list v-else :data-source="messages" size="small">
              <template #renderItem="{ item }">
                <a-list-item>
                  <div class="w-full">
                    <div class="flex items-center gap-2">
                      <strong>{{ item.title }}</strong>
                      <a-tag>
{{
                        workflowMessageTypeLabel(item.message_type)
                      }}
</a-tag>
                    </div>
                    <div class="mt-1 text-[var(--ant-color-text-secondary)]">
                      {{ item.content }}
                    </div>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.workflow-detail-layout {
  display: grid;
  grid-template-columns: minmax(320px, 40%) minmax(0, 1fr);
  gap: 16px;
}
</style>
