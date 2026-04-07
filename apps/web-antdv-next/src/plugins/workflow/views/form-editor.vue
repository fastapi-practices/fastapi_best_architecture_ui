<script lang="ts" setup>
import type {
  WorkflowDefinitionEditorValue,
  WorkflowFormField,
} from '#/plugins/workflow/types';

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, VbenButton } from '@vben/common-ui';

import { message } from 'antdv-next';

import {
  buildWorkflowDefinitionEditorValue,
  getWorkflowDefinitionDetailApi,
  updateWorkflowDefinitionApi,
} from '#/plugins/workflow/api';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const definitionId = computed(() => Number(route.params.definitionId));
const currentDefinition = ref<WorkflowDefinitionEditorValue>(
  buildWorkflowDefinitionEditorValue(),
);
const selectedFieldId = ref('');
const draggingFieldId = ref('');
const dragOverFieldId = ref('');

const selectedField = computed<undefined | WorkflowFormField>(() => {
  return currentDefinition.value.form_config.fields.find(
    (item) => item.id === selectedFieldId.value,
  );
});

async function loadDefinition() {
  if (!definitionId.value) {
    message.error('流程定义参数无效');
    return;
  }
  loading.value = true;
  try {
    const detail = await getWorkflowDefinitionDetailApi(definitionId.value);
    currentDefinition.value = buildWorkflowDefinitionEditorValue(detail);
    selectedFieldId.value =
      currentDefinition.value.form_config.fields[0]?.id || '';
  } finally {
    loading.value = false;
  }
}

function applyFieldOrder(fields: WorkflowFormField[]) {
  currentDefinition.value = {
    ...currentDefinition.value,
    form_config: {
      fields,
    },
  };
}

function selectField(fieldId: string) {
  selectedFieldId.value = fieldId;
}

function onFieldDragStart(fieldId: string) {
  draggingFieldId.value = fieldId;
  selectedFieldId.value = fieldId;
}

function onFieldDragOver(fieldId: string) {
  if (!draggingFieldId.value || draggingFieldId.value === fieldId) {
    return;
  }
  dragOverFieldId.value = fieldId;
}

function onFieldDrop(targetFieldId: string) {
  const sourceFieldId = draggingFieldId.value;
  draggingFieldId.value = '';
  dragOverFieldId.value = '';
  if (!sourceFieldId || sourceFieldId === targetFieldId) {
    return;
  }
  const fields = [...currentDefinition.value.form_config.fields];
  const sourceIndex = fields.findIndex((item) => item.id === sourceFieldId);
  const targetIndex = fields.findIndex((item) => item.id === targetFieldId);
  if (sourceIndex === -1 || targetIndex === -1) {
    return;
  }
  const [field] = fields.splice(sourceIndex, 1);
  if (!field) {
    return;
  }
  fields.splice(targetIndex, 0, field);
  applyFieldOrder(fields);
  selectedFieldId.value = field.id;
}

function onFieldDragEnd() {
  draggingFieldId.value = '';
  dragOverFieldId.value = '';
}

function addFormField() {
  const nextIndex = currentDefinition.value.form_config.fields.length + 1;
  const field: WorkflowFormField = {
    id: `field_${nextIndex}`,
    field: `field_${nextIndex}`,
    label: `字段${nextIndex}`,
    type: 'input',
    required: false,
    placeholder: '',
  };
  currentDefinition.value = {
    ...currentDefinition.value,
    form_config: {
      fields: [...currentDefinition.value.form_config.fields, field],
    },
  };
  selectedFieldId.value = field.id;
}

function updateSelectedField(patch: Partial<WorkflowFormField>) {
  const fieldId = selectedFieldId.value;
  currentDefinition.value = {
    ...currentDefinition.value,
    form_config: {
      fields: currentDefinition.value.form_config.fields.map((item) =>
        item.id === fieldId
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    },
  };
}

function removeSelectedField() {
  if (!selectedFieldId.value) {
    return;
  }
  const nextFields = currentDefinition.value.form_config.fields.filter(
    (item) => item.id !== selectedFieldId.value,
  );
  currentDefinition.value = {
    ...currentDefinition.value,
    form_config: {
      fields: nextFields,
    },
  };
  selectedFieldId.value = nextFields[0]?.id || '';
}

async function saveFormConfig() {
  if (!definitionId.value) {
    return;
  }
  await updateWorkflowDefinitionApi(
    definitionId.value,
    currentDefinition.value,
  );
  message.success('表单配置已保存');
}

function goToEditor() {
  router.push(`/plugins/workflow/design/editor/${definitionId.value}`);
}

loadDefinition();
</script>

<template>
  <Page auto-content-height>
    <div v-loading="loading" class="space-y-4">
      <a-card :bordered="false">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold">表单设计器</div>
            <div class="text-sm text-[var(--ant-color-text-secondary)]">
              独立维护表单字段、排序和属性，不再混在流程定义列表页中。
            </div>
          </div>
          <a-space wrap>
            <a-button @click="goToEditor">返回流程设计</a-button>
            <VbenButton @click="saveFormConfig">保存表单</VbenButton>
          </a-space>
        </div>
      </a-card>

      <div class="workflow-form-layout">
        <a-card title="字段面板" size="small">
          <a-space direction="vertical" class="w-full">
            <a-button block type="dashed" @click="addFormField">
新增输入框
</a-button>
            <a-button block @click="addFormField">新增字段</a-button>
            <a-button block danger @click="removeSelectedField">
删除当前字段
</a-button>
          </a-space>
        </a-card>

        <a-card title="表单预览" size="small">
          <div class="space-y-3">
            <div
              v-for="(item, index) in currentDefinition.form_config.fields"
              :key="item.id"
              class="workflow-form-field-item"
              :class="{
                active: selectedFieldId === item.id,
                dragging: draggingFieldId === item.id,
                'drag-over': dragOverFieldId === item.id,
              }"
              draggable="true"
              @click="selectField(item.id)"
              @dragstart="onFieldDragStart(item.id)"
              @dragover.prevent="onFieldDragOver(item.id)"
              @drop.prevent="onFieldDrop(item.id)"
              @dragend="onFieldDragEnd"
            >
              <div class="mb-2 font-medium">
                {{ index + 1 }}. {{ item.label }}
              </div>
              <a-input :placeholder="item.placeholder || '请输入'" disabled />
              <div class="mt-2 text-xs text-[var(--ant-color-text-secondary)]">
                {{ item.field }} / {{ item.type }}
              </div>
            </div>
            <a-empty
              v-if="currentDefinition.form_config.fields.length === 0"
              description="暂无字段"
            />
          </div>
        </a-card>

        <a-card title="字段配置" size="small">
          <template v-if="selectedField">
            <a-form layout="vertical">
              <a-form-item label="显示名称">
                <a-input
                  :value="selectedField.label"
                  @update:value="
                    (value) => updateSelectedField({ label: value })
                  "
                />
              </a-form-item>
              <a-form-item label="字段标识">
                <a-input
                  :value="selectedField.field"
                  @update:value="
                    (value) => updateSelectedField({ field: value })
                  "
                />
              </a-form-item>
              <a-form-item label="字段类型">
                <a-select
                  :value="selectedField.type"
                  :options="[
                    { label: '输入框', value: 'input' },
                    { label: '多行文本', value: 'textarea' },
                    { label: '数字', value: 'number' },
                  ]"
                  @update:value="
                    (value) =>
                      updateSelectedField({
                        type: String(value) as WorkflowFormField['type'],
                      })
                  "
                />
              </a-form-item>
              <a-form-item label="占位提示">
                <a-input
                  :value="selectedField.placeholder"
                  @update:value="
                    (value) => updateSelectedField({ placeholder: value })
                  "
                />
              </a-form-item>
              <a-form-item label="必填">
                <a-switch
                  :checked="selectedField.required"
                  @update:checked="
                    (value) => updateSelectedField({ required: Boolean(value) })
                  "
                />
              </a-form-item>
            </a-form>
          </template>
          <a-empty v-else description="请选择字段" />
        </a-card>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.workflow-form-layout {
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  gap: 16px;
}

.workflow-form-field-item {
  padding: 12px;
  cursor: grab;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
}

.workflow-form-field-item.active {
  background: rgb(22 119 255 / 8%);
}

.workflow-form-field-item.dragging {
  opacity: 0.5;
}

.workflow-form-field-item.drag-over {
  box-shadow: inset 0 0 0 1px #1677ff;
}
</style>
