import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'WorkflowStartApply',
    path: '/plugins/workflow/start',
    component: () => import('#/plugins/workflow/views/start-apply.vue'),
    meta: {
      title: '发起申请',
      icon: 'mdi:play-circle-outline',
    },
  },
  {
    name: 'WorkflowDefinition',
    path: '/plugins/workflow/definition',
    component: () => import('#/plugins/workflow/views/definition.vue'),
    meta: {
      title: $t('workflow.definition'),
      icon: 'carbon:flow',
    },
  },
  {
    name: 'WorkflowEditor',
    path: '/plugins/workflow/design/editor/:definitionId?',
    component: () => import('#/plugins/workflow/views/editor.vue'),
    meta: {
      title: '流程设计器',
      hideInMenu: true,
      icon: 'carbon:flow-connection',
    },
  },
  {
    name: 'WorkflowFormEditor',
    path: '/plugins/workflow/design/form-editor/:definitionId',
    component: () => import('#/plugins/workflow/views/form-editor.vue'),
    meta: {
      title: '表单设计器',
      hideInMenu: true,
      icon: 'mdi:form-select',
    },
  },
  {
    name: 'WorkflowTodo',
    path: '/plugins/workflow/my-todo',
    component: () => import('#/plugins/workflow/views/my-todo.vue'),
    meta: {
      title: $t('workflow.todo'),
      icon: 'mdi:clipboard-clock-outline',
    },
  },
  {
    name: 'WorkflowApply',
    path: '/plugins/workflow/my-apply',
    component: () => import('#/plugins/workflow/views/my-apply.vue'),
    meta: {
      title: $t('workflow.apply'),
      icon: 'mdi:file-document-edit-outline',
    },
  },
  {
    name: 'WorkflowStart',
    path: '/plugins/workflow/instance/start/:definitionId',
    component: () => import('#/plugins/workflow/views/start.vue'),
    meta: {
      title: '发起申请',
      hideInMenu: true,
      icon: 'mdi:play-circle-outline',
    },
  },
  {
    name: 'WorkflowMessage',
    path: '/plugins/workflow/message',
    component: () => import('#/plugins/workflow/views/message.vue'),
    meta: {
      title: $t('workflow.message'),
      icon: 'mdi:message-badge-outline',
    },
  },
  {
    name: 'WorkflowStatistics',
    path: '/plugins/workflow/statistics',
    component: () => import('#/plugins/workflow/views/statistics.vue'),
    meta: {
      title: '统计报表',
      icon: 'mdi:chart-box-outline',
    },
  },
  {
    name: 'WorkflowDetail',
    path: '/plugins/workflow/detail/:id',
    component: () => import('#/plugins/workflow/views/detail.vue'),
    meta: {
      title: '流程详情',
      hideInMenu: true,
      icon: 'mdi:file-search-outline',
    },
  },
  {
    name: 'WorkflowInstanceDetail',
    path: '/plugins/workflow/instance/detail/:id',
    component: () => import('#/plugins/workflow/views/detail.vue'),
    meta: {
      title: '流程详情',
      hideInMenu: true,
      icon: 'mdi:file-search-outline',
    },
  },
];

export default routes;
