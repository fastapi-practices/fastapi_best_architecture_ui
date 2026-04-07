import { ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import { notification } from 'antdv-next';
import { defineStore } from 'pinia';

import {
  getWorkflowTodoCountApi,
  getWorkflowUnreadCountApi,
} from '#/plugins/workflow/api';
import { useWebSocketStore } from '#/store';

export const useWorkflowStore = defineStore('workflow', () => {
  const unreadCount = ref(0);
  const todoCount = ref(0);
  const initialized = ref(false);
  let cleanup: (() => void) | null = null;

  function syncMenuBadge() {
    const accessStore = useAccessStore();
    accessStore.setMenuBadgeByPath(
      '/plugins/workflow/message',
      unreadCount.value > 0 ? String(unreadCount.value) : undefined,
      'normal',
      'destructive',
    );
    accessStore.setMenuBadgeByPath(
      '/plugins/workflow/my-todo',
      todoCount.value > 0 ? String(todoCount.value) : undefined,
      'normal',
      'primary',
    );
  }

  async function refreshUnreadCount() {
    unreadCount.value = await getWorkflowUnreadCountApi();
    syncMenuBadge();
    return unreadCount.value;
  }

  async function refreshTodoCount() {
    todoCount.value = await getWorkflowTodoCountApi();
    syncMenuBadge();
    return todoCount.value;
  }

  async function refreshCounts() {
    await Promise.all([refreshUnreadCount(), refreshTodoCount()]);
  }

  function handleSocketPayload(payload: any) {
    if (typeof payload?.unread_count === 'number') {
      unreadCount.value = payload.unread_count;
    }
    if (typeof payload?.todo_count === 'number') {
      todoCount.value = payload.todo_count;
    }
    syncMenuBadge();
  }

  function bindSocket() {
    const wsStore = useWebSocketStore();
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    cleanup = wsStore.on('workflow_message', (payload: any) => {
      handleSocketPayload(payload);
      if (payload?.type === 'READ') {
        return;
      }
      if (payload?.title) {
        notification.info({
          title: payload.title,
          description: payload.content || '',
          duration: 3,
        });
      }
    });
  }

  async function init() {
    if (!initialized.value) {
      bindSocket();
      initialized.value = true;
    }
    await refreshCounts();
  }

  function reset() {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    unreadCount.value = 0;
    todoCount.value = 0;
    syncMenuBadge();
    initialized.value = false;
  }

  return {
    unreadCount,
    todoCount,
    initialized,
    init,
    refreshCounts,
    refreshTodoCount,
    refreshUnreadCount,
    reset,
  };
});
