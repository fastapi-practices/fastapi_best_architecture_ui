<script lang="ts" setup>
import type {
  WorkflowDefinitionResult,
  WorkflowPreviewFlowItem,
} from '#/plugins/workflow/api';
import type { WorkflowFormField } from '#/plugins/workflow/types';

import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { message } from 'antdv-next';

import {
  createWorkflowInstanceApi,
  getWorkflowDefinitionAvailableDetailApi,
  getWorkflowDefinitionAvailablePreviewFlowApi,
} from '#/plugins/workflow/api';
import WorkflowUserSelect from '#/plugins/workflow/components/WorkflowUserSelect.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const previewLoading = ref(false);
const definition = ref<null | WorkflowDefinitionResult>(null);
const previewItems = ref<WorkflowPreviewFlowItem[]>([]);
const selfSelectAssignees = reactive<Record<string, number>>({});
const formState = reactive<Record<string, any>>({
  title: '',
  remark: '',
});
const definitionId = computed(() => Number(route.params.definitionId));
const requiredSelfSelectItems = computed(() => {
  return previewItems.value.filter(
    (item) => (item.self_select_options ?? []).length > 0,
  );
});

async function loadDefinition() {
  if (!definitionId.value) {
    message.error('流程定义参数无效');
    return;
  }
  loading.value = true;
  try {
    definition.value = await getWorkflowDefinitionAvailableDetailApi(
      definitionId.value,
    );
    await refreshPreview();
  } finally {
    loading.value = false;
  }
}

function fieldValue(field: WorkflowFormField) {
  return formState[field.field];
}

function selfSelectOptionLabel(item: WorkflowPreviewFlowItem, value: number) {
  const optionLabels = item.self_select_option_labels ?? {};
  return optionLabels[value] || `用户#${value}`;
}

function selectedSelfSelectLabel(item: WorkflowPreviewFlowItem) {
  const selectedValue = selfSelectAssignees[item.node_id];
  if (selectedValue) {
    return selfSelectOptionLabel(item, selectedValue);
  }
  return '待发起人选择';
}

function previewAssigneeText(item: WorkflowPreviewFlowItem) {
  if (item.assignee_name) {
    return item.assignee_name;
  }
  if (item.assignee_id) {
    return `用户#${item.assignee_id}`;
  }
  if ((item.self_select_options ?? []).length > 0) {
    return selectedSelfSelectLabel(item);
  }
  return '运行时待解析';
}

function selfSelectOptions(item: WorkflowPreviewFlowItem) {
  return (item.self_select_options ?? []).map((value) => ({
    label: selfSelectOptionLabel(item, value),
    value,
  }));
}

async function updateField(field: WorkflowFormField, value: any) {
  formState[field.field] = value;
  await refreshPreview();
}

async function updateSelfSelect(nodeId: string, value?: number | number[]) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (normalizedValue === null || normalizedValue === undefined) {
    delete selfSelectAssignees[nodeId];
  } else {
    selfSelectAssignees[nodeId] = Number(normalizedValue);
  }
  await refreshPreview();
}

async function refreshPreview() {
  if (!definitionId.value) {
    return;
  }
  previewLoading.value = true;
  try {
    const data = await getWorkflowDefinitionAvailablePreviewFlowApi(
      definitionId.value,
      Object.fromEntries(
        (definition.value?.form_config?.fields ?? []).map((field) => [
          field.field,
          formState[field.field],
        ]),
      ),
      selfSelectAssignees,
    );
    previewItems.value = data.items ?? [];
  } finally {
    previewLoading.value = false;
  }
}

async function submit() {
  if (!definition.value) {
    return;
  }
  if (!formState.title) {
    message.warning('请输入申请标题');
    return;
  }
  const missingSelfSelectItem = requiredSelfSelectItems.value.find(
    (item) => !selfSelectAssignees[item.node_id],
  );
  if (missingSelfSelectItem) {
    message.warning(`请先为节点“${missingSelfSelectItem.label}”选择审批人`);
    return;
  }
  submitting.value = true;
  try {
    await createWorkflowInstanceApi({
      definition_id: definition.value.id,
      title: String(formState.title),
      remark: formState.remark ? String(formState.remark) : '',
      form_data: Object.fromEntries(
        (definition.value.form_config?.fields ?? []).map((field) => [
          field.field,
          formState[field.field],
        ]),
      ),
      self_select_assignees: { ...selfSelectAssignees },
    });
    message.success('申请已提交');
    await router.push('/plugins/workflow/my-apply');
  } finally {
    submitting.value = false;
  }
}

watch(() => formState.title, refreshPreview);

loadDefinition();
</script>

<template>
  <Page auto-content-height>
    <div v-loading="loading" class="space-y-4">
      <a-card title="发起申请" :bordered="false">
        <a-form layout="vertical">
          <a-form-item label="申请标题" required>
            <a-input
              v-model:value="formState.title"
              placeholder="请输入申请标题"
            />
          </a-form-item>
          <a-form-item label="备注">
            <a-textarea
              v-model:value="formState.remark"
              :rows="3"
              placeholder="请输入备注"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <a-card title="业务表单" :bordered="false">
        <a-form layout="vertical">
          <template
            v-for="field in definition?.form_config?.fields ?? []"
            :key="field.id"
          >
            <a-form-item :label="field.label" :required="field.required">
              <a-input
                v-if="field.type === 'input'"
                :value="fieldValue(field)"
                :placeholder="field.placeholder || '请输入'"
                @update:value="(value) => updateField(field, value)"
              />
              <a-textarea
                v-else-if="field.type === 'textarea'"
                :value="fieldValue(field)"
                :placeholder="field.placeholder || '请输入'"
                :rows="3"
                @update:value="(value) => updateField(field, value)"
              />
              <a-input-number
                v-else
                style="width: 100%"
                :value="fieldValue(field)"
                :placeholder="field.placeholder || '请输入'"
                @update:value="(value) => updateField(field, value)"
              />
            </a-form-item>
          </template>
          <a-empty
            v-if="(definition?.form_config?.fields ?? []).length === 0"
            description="当前流程未配置表单字段"
          />
        </a-form>
      </a-card>

      <a-card title="审批流程预览" :bordered="false">
        <div v-loading="previewLoading">
          <a-empty
            v-if="previewItems.length === 0"
            description="暂无可预览的审批链"
          />
          <a-timeline v-else>
            <a-timeline-item v-for="item in previewItems" :key="item.node_id">
              <div class="flex items-center gap-2">
                <strong>{{ item.label }}</strong>
                <a-tag>{{ item.node_type }}</a-tag>
              </div>
              <div class="mt-1 text-[var(--ant-color-text-secondary)]">
                审批人：{{ previewAssigneeText(item) }}
              </div>
              <div
                v-if="(item.self_select_options ?? []).length > 0"
                class="mt-3 max-w-sm"
              >
                <WorkflowUserSelect
                  :model-value="selfSelectAssignees[item.node_id]"
                  :options="selfSelectOptions(item)"
                  placeholder="请选择审批人"
                  @update:model-value="
                    (value) => updateSelfSelect(item.node_id, value)
                  "
                />
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-card>

      <div class="flex justify-end">
        <a-space>
          <a-button @click="router.push('/plugins/workflow/start')">
取消
</a-button>
          <a-button type="primary" :loading="submitting" @click="submit">
提交申请
</a-button>
        </a-space>
      </div>
    </div>
  </Page>
</template>
