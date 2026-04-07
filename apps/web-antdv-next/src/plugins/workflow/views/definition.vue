<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type {
  CreateWorkflowCategoryParams,
  UpdateWorkflowCategoryParams,
  WorkflowCategoryResult,
  WorkflowDefinitionResult,
} from '#/plugins/workflow/api';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page, useVbenModal, VbenButton } from '@vben/common-ui';
import { MaterialSymbolsAdd } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  createWorkflowCategoryApi,
  getWorkflowCategoryListApi,
  getWorkflowCategoryOptionsApi,
  getWorkflowDefinitionListApi,
  updateWorkflowCategoryApi,
} from '#/plugins/workflow/api';

import {
  useWorkflowCategoryColumns,
  useWorkflowDefinitionColumns,
  workflowCategoryQuerySchema,
  workflowCategorySchema,
  workflowDefinitionQuerySchema,
} from './data';

const router = useRouter();

const formOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: workflowDefinitionQuerySchema,
};

const categoryOptions = ref<Array<{ label: string; value: number }>>([]);
const categoryMap = computed(
  () => new Map(categoryOptions.value.map((item) => [item.value, item.label])),
);

async function ensureCategoryOptionsLoaded() {
  categoryOptions.value = await getWorkflowCategoryOptionsApi();
}

function normalizeDefinitionItem(item: WorkflowDefinitionResult) {
  return {
    ...item,
    category_name: item.category_id
      ? (categoryMap.value.get(item.category_id) ?? '-')
      : '-',
  };
}

async function goToEditor(id?: number) {
  await router.push(
    id
      ? `/plugins/workflow/design/editor/${id}`
      : '/plugins/workflow/design/editor',
  );
}

async function goToFormEditor(id: number) {
  await router.push(`/plugins/workflow/design/form-editor/${id}`);
}

async function goToStart(id: number) {
  await router.push(`/plugins/workflow/instance/start/${id}`);
}

function onDefinitionActionClick({
  code,
  row,
}: OnActionClickParams<WorkflowDefinitionResult>) {
  if (code === 'edit') {
    goToEditor(row.id);
    return;
  }
  if (code === 'form') {
    goToFormEditor(row.id);
    return;
  }
  if (code === 'start') {
    goToStart(row.id);
  }
}

const definitionGridOptions: VxeTableGridOptions<WorkflowDefinitionResult> = {
  rowConfig: {
    keyField: 'id',
  },
  height: 'auto',
  toolbarConfig: {
    refresh: true,
    refreshOptions: { code: 'query' },
    custom: true,
    zoom: true,
  },
  columns: useWorkflowDefinitionColumns(onDefinitionActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        await ensureCategoryOptionsLoaded();
        const result = await getWorkflowDefinitionListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
        return {
          ...result,
          items: result.items.map((item) => normalizeDefinitionItem(item)),
        };
      },
    },
  },
};

const [DefinitionGrid, definitionGridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions: definitionGridOptions,
});

const categoryFormOptions: VbenFormProps = {
  collapsed: true,
  showCollapseButton: true,
  submitButtonOptions: {
    content: $t('common.form.query'),
  },
  schema: workflowCategoryQuerySchema,
};

function onCategoryActionClick({
  code,
  row,
}: OnActionClickParams<WorkflowCategoryResult>) {
  if (code === 'edit') {
    categoryModalApi.setData(row).open();
  }
}

const categoryGridOptions: VxeTableGridOptions<WorkflowCategoryResult> = {
  rowConfig: {
    keyField: 'id',
  },
  height: 420,
  columns: useWorkflowCategoryColumns(onCategoryActionClick),
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        return await getWorkflowCategoryListApi({
          page: page.currentPage,
          size: page.pageSize,
          ...formValues,
        });
      },
    },
  },
};

const [CategoryGrid, categoryGridApi] = useVbenVxeGrid({
  formOptions: categoryFormOptions,
  gridOptions: categoryGridOptions,
});

const [CategoryForm, categoryFormApi] = useVbenForm({
  layout: 'vertical',
  showDefaultActions: false,
  schema: workflowCategorySchema,
});

interface CategoryFormData extends CreateWorkflowCategoryParams {
  id?: number;
}

const categoryFormData = ref<CategoryFormData>();
const categoryModalTitle = computed(() => {
  return categoryFormData.value?.id ? '编辑流程分类' : '新增流程分类';
});

async function refreshDefinitionData() {
  await ensureCategoryOptionsLoaded();
  await definitionGridApi.query();
}

async function refreshCategoryData() {
  await categoryGridApi.query();
}

const [CategoryModal, categoryModalApi] = useVbenModal({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await categoryFormApi.validate();
    if (!valid) {
      return;
    }
    categoryModalApi.lock();
    const data =
      await categoryFormApi.getValues<CreateWorkflowCategoryParams>();
    try {
      await (categoryFormData.value?.id
        ? updateWorkflowCategoryApi(
            categoryFormData.value.id,
            data as UpdateWorkflowCategoryParams,
          )
        : createWorkflowCategoryApi(data));
      message.success('流程分类已保存');
      await categoryModalApi.close();
      await refreshCategoryData();
      await refreshDefinitionData();
    } finally {
      categoryModalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const data = categoryModalApi.getData<CategoryFormData>();
    categoryFormApi.resetForm();
    categoryFormData.value = data;
    if (data) {
      categoryFormApi.setValues(data);
    }
  },
});

const [CategoryManagerModal, categoryManagerModalApi] = useVbenModal({
  footer: false,
  onOpenChange(isOpen) {
    if (isOpen) {
      refreshCategoryData();
    }
  },
});

function openCategoryManager() {
  categoryManagerModalApi.open();
}

function openCreateCategory() {
  categoryModalApi.setData(null).open();
}
</script>

<template>
  <Page auto-content-height>
    <DefinitionGrid table-title="流程定义">
      <template #toolbar-actions>
        <VbenButton @click="openCategoryManager"> 分类管理 </VbenButton>
        <VbenButton @click="goToEditor()">
          <MaterialSymbolsAdd class="size-5" />
          新增流程
        </VbenButton>
      </template>
    </DefinitionGrid>

    <CategoryManagerModal title="流程分类管理">
      <CategoryGrid table-title="流程分类">
        <template #toolbar-actions>
          <VbenButton @click="openCreateCategory">
            <MaterialSymbolsAdd class="size-5" />
            新增分类
          </VbenButton>
        </template>
      </CategoryGrid>
    </CategoryManagerModal>

    <CategoryModal :title="categoryModalTitle">
      <CategoryForm />
    </CategoryModal>
  </Page>
</template>
