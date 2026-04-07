<script lang="ts" setup>
import type {
  WorkflowDefinitionEditorValue,
  WorkflowFlowConfig,
} from '#/plugins/workflow/types';

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, VbenButton } from '@vben/common-ui';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import {
  buildWorkflowDefinitionEditorValue,
  createWorkflowDefinitionApi,
  getWorkflowCategoryOptionsApi,
  getWorkflowDefinitionDetailApi,
  updateWorkflowDefinitionApi,
} from '#/plugins/workflow/api';
import FlowDesigner from '#/plugins/workflow/components/FlowDesigner/index.vue';
import {
  CONDITION_WORKFLOW_FLOW_TEMPLATE,
  DEFAULT_WORKFLOW_FLOW_CONFIG,
  PARALLEL_WORKFLOW_FLOW_TEMPLATE,
  SERIAL_WORKFLOW_FLOW_TEMPLATE,
  TRIGGER_WORKFLOW_FLOW_TEMPLATE,
} from '#/plugins/workflow/types';

import { createWorkflowDefinitionBaseSchema } from './data';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const categoryOptions = ref<Array<{ label: string; value: number }>>([]);
const definitionId = computed(() => {
  const rawId = route.params.definitionId;
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  return Number.isFinite(id) && id > 0 ? id : undefined;
});
const selectedNodeId = ref('approve_1');
const currentDefinition = ref<WorkflowDefinitionEditorValue>(
  buildWorkflowDefinitionEditorValue(),
);

const flowTemplates: Array<{
  description: string;
  key: 'condition' | 'default' | 'parallel' | 'serial' | 'trigger';
  label: string;
  value: WorkflowFlowConfig;
}> = [
  {
    key: 'default',
    label: '默认模板',
    description: '开始 → 单审批 → 结束',
    value: DEFAULT_WORKFLOW_FLOW_CONFIG,
  },
  {
    key: 'serial',
    label: '串行模板',
    description: '开始 → 一级审批 → 二级审批 → 结束',
    value: SERIAL_WORKFLOW_FLOW_TEMPLATE,
  },
  {
    key: 'parallel',
    label: '并行模板',
    description: '开始 → 并行分支 → 双审批汇聚到结束',
    value: PARALLEL_WORKFLOW_FLOW_TEMPLATE,
  },
  {
    key: 'condition',
    label: '条件模板',
    description: '开始 → 审批 → 条件判断 → 经理审批/抄送财务 → 结束',
    value: CONDITION_WORKFLOW_FLOW_TEMPLATE,
  },
  {
    key: 'trigger',
    label: '触发器模板',
    description: '开始 → 审批 → 触发器 → 结束',
    value: TRIGGER_WORKFLOW_FLOW_TEMPLATE,
  },
];

const [DefinitionForm, definitionFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: createWorkflowDefinitionBaseSchema([]),
});

async function ensureCategoryOptionsLoaded() {
  categoryOptions.value = await getWorkflowCategoryOptionsApi();
  await definitionFormApi.updateSchema([
    {
      componentProps: {
        allowClear: true,
        options: categoryOptions.value,
      },
      fieldName: 'category_id',
    },
  ]);
}

async function loadDefinition() {
  loading.value = true;
  try {
    await ensureCategoryOptionsLoaded();
    await definitionFormApi.resetForm();
    if (definitionId.value) {
      const detail = await getWorkflowDefinitionDetailApi(definitionId.value);
      currentDefinition.value = buildWorkflowDefinitionEditorValue(detail);
    } else {
      currentDefinition.value = buildWorkflowDefinitionEditorValue();
    }
    selectedNodeId.value =
      currentDefinition.value.flow_config.nodes[0]?.id || '';
    await definitionFormApi.setValues({
      allow_urge: currentDefinition.value.allow_urge,
      allow_withdraw: currentDefinition.value.allow_withdraw,
      category_id: currentDefinition.value.category_id,
      code: currentDefinition.value.code,
      description: currentDefinition.value.description,
      name: currentDefinition.value.name,
      status: currentDefinition.value.status,
    });
  } finally {
    loading.value = false;
  }
}

const formFieldOptions = computed(() => {
  return currentDefinition.value.form_config.fields.map((item) => ({
    label: item.label,
    value: item.field,
  }));
});

function cloneFlowConfig(value: WorkflowFlowConfig) {
  return structuredClone(value);
}

function applyFlowTemplate(value: WorkflowFlowConfig) {
  currentDefinition.value = {
    ...currentDefinition.value,
    flow_config: cloneFlowConfig(value),
  };
  selectedNodeId.value = currentDefinition.value.flow_config.nodes[0]?.id || '';
  message.success('已应用流程模板');
}

function onFlowConfigChange(
  value: WorkflowDefinitionEditorValue['flow_config'],
) {
  currentDefinition.value = {
    ...currentDefinition.value,
    flow_config: value,
  };
  if (!value.nodes.some((item) => item.id === selectedNodeId.value)) {
    selectedNodeId.value = value.nodes[0]?.id || '';
  }
}

async function saveDefinition() {
  const { valid } = await definitionFormApi.validate();
  if (!valid) {
    return;
  }
  const values =
    await definitionFormApi.getValues<WorkflowDefinitionEditorValue>();
  const payload = {
    ...values,
    flow_config: currentDefinition.value.flow_config,
    form_config: currentDefinition.value.form_config,
  };
  await (definitionId.value
    ? updateWorkflowDefinitionApi(definitionId.value, payload)
    : createWorkflowDefinitionApi(payload));
  message.success('流程已保存');
  await router.push('/plugins/workflow/definition');
}

function goToDefinitionList() {
  router.push('/plugins/workflow/definition');
}

function goToFormEditor() {
  if (!definitionId.value) {
    message.warning('请先保存流程后再设计表单');
    return;
  }
  router.push(`/plugins/workflow/design/form-editor/${definitionId.value}`);
}

loadDefinition();
</script>

<template>
  <Page auto-content-height>
    <div v-loading="loading" class="space-y-4">
      <a-card :bordered="false">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-lg font-semibold">
              {{ definitionId ? '流程设计器' : '新建流程' }}
            </div>
            <div class="text-sm text-[var(--ant-color-text-secondary)]">
              左侧维护基础信息，中间编辑画布，节点配置改为在画布中右击编辑。
            </div>
          </div>
          <a-space wrap>
            <a-button @click="goToDefinitionList">返回列表</a-button>
            <a-button @click="goToFormEditor">表单设计</a-button>
            <VbenButton @click="saveDefinition">保存流程</VbenButton>
          </a-space>
        </div>
      </a-card>

      <div class="workflow-editor-layout">
        <div class="workflow-editor-side">
          <a-card title="基础信息" size="small">
            <DefinitionForm />
          </a-card>
          <a-card v-if="!definitionId" title="流程模板" size="small">
            <a-space direction="vertical" class="w-full">
              <a-button
                v-for="template in flowTemplates"
                :key="template.key"
                block
                @click="applyFlowTemplate(template.value)"
              >
                {{ template.label }}
              </a-button>
            </a-space>
            <a-list class="mt-3" size="small">
              <a-list-item
                v-for="template in flowTemplates"
                :key="`${template.key}-desc`"
              >
                <div>
                  <div class="font-medium">{{ template.label }}</div>
                  <div class="text-[var(--ant-color-text-secondary)]">
                    {{ template.description }}
                  </div>
                </div>
              </a-list-item>
            </a-list>
          </a-card>
        </div>

        <a-card class="workflow-editor-canvas" title="流程画布" size="small">
          <FlowDesigner
            :model-value="currentDefinition.flow_config"
            :selected-node-id="selectedNodeId"
            :form-field-options="formFieldOptions"
            @selectNode="(nodeId) => (selectedNodeId = nodeId)"
            @update:model-value="onFlowConfigChange"
          />
        </a-card>

        <div class="workflow-editor-side">
          <a-card title="页面操作" size="small">
            <a-space direction="vertical" class="w-full">
              <a-alert
                type="info"
                show-icon
                message="节点配置已移动到画布节点右键菜单中的“编辑节点”。"
              />
              <a-button block @click="goToFormEditor">进入表单设计器</a-button>
              <a-button block @click="goToDefinitionList">
                返回流程定义列表
              </a-button>
            </a-space>
          </a-card>
          <a-card title="节点说明" size="small">
            <a-list size="small">
              <a-list-item>开始节点：流程入口</a-list-item>
              <a-list-item>
                审批节点：支持指定用户/角色/发起人相关来源
              </a-list-item>
              <a-list-item>条件节点：根据表单值选择分支</a-list-item>
              <a-list-item>
                并行节点：可同时派发多个分支任务，待全部分支完成后再汇聚
              </a-list-item>
              <a-list-item>触发器节点：自动跳过并进入下游</a-list-item>
              <a-list-item>抄送节点：发送消息通知</a-list-item>
              <a-list-item>结束节点：流程结束</a-list-item>
            </a-list>
          </a-card>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.workflow-editor-layout {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 16px;
}

.workflow-editor-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workflow-editor-canvas {
  min-height: 720px;
}
</style>
