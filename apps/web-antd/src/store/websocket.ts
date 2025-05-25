// stores/websocket.ts
import { computed, ref } from 'vue';

import { useAccessStore } from '@vben/stores';

import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';

export const useWebSocketStore = defineStore('websocket', () => {
  const socket = ref<null | Socket>(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const eventCleanupFunctions = ref<Function[]>([]);

  // 连接配置常量
  const WS_URL = import.meta.env.VITE_GLOB_API_URL;
  const WS_PATH = '/ws/socket.io';

  // 连接配置参数
  const WS_CONFIG = {
    autoConnect: true,
    path: WS_PATH,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    transports: ['websocket'],
  };

  /**
   * 建立 WebSocket 连接
   * @returns {boolean} 连接是否成功
   */
  const connect = () => {
    const accessStore = useAccessStore();

    // 检查登录状态
    if (!accessStore.accessToken) {
      console.warn('用户未登录或登录已过期，无法建立 WebSocket 连接');
      return false;
    }

    // 检查是否已连接
    if (isConnected.value) {
      return true;
    }

    // 如果有 socket 实例但未连接，尝试连接
    if (socket.value && !isConnected.value) {
      socket.value.connect();
      return true;
    }

    try {
      // 创建 Socket 连接，携带认证信息
      socket.value = io(WS_URL, {
        ...WS_CONFIG,
        auth: {
          session_uuid: accessStore.accessSessionUuid,
          token: accessStore.accessToken,
        },
      });

      // 注册核心事件监听器
      registerCoreEvents();
      return true;
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      return false;
    }
  };

  /**
   * 注册核心事件监听器
   */
  const registerCoreEvents = () => {
    if (!socket.value) return;

    socket.value.on('connect', () => {
      // console.log('WebSocket 连接成功');
      isConnected.value = true;
      reconnectAttempts.value = 0;
    });

    socket.value.on('connect_error', (error) => {
      console.error('WebSocket 连接错误:', error);
      handleConnectionError();
    });

    socket.value.on('disconnect', (reason) => {
      // console.log('WebSocket 已断开:', reason);
      isConnected.value = false;

      if (reason !== 'io client disconnect') {
        handleReconnection();
      }
    });
  };

  /**
   * 处理连接错误
   */
  const handleConnectionError = () => {
    const accessStore = useAccessStore();
    if (!accessStore.accessToken) {
      disconnect();
    }
  };

  /**
   * 处理重连机制
   */
  const handleReconnection = () => {
    if (reconnectAttempts.value >= WS_CONFIG.reconnectionAttempts) {
      console.error('已达到最大重连次数，停止重连');
      return;
    }

    reconnectAttempts.value++;
    setTimeout(() => {
      connect();
    }, WS_CONFIG.reconnectionDelay);
  };

  /**
   * 发送消息
   * @param event 事件名称
   * @param data 发送的数据
   */
  const emit = (event: string, data: any): boolean => {
    if (!isConnected.value || !socket.value) {
      console.warn('WebSocket 未连接，无法发送消息');
      return false;
    }

    try {
      socket.value.emit(event, data);
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  };

  /**
   * 监听事件
   * @param event 事件名称
   * @param callback 回调函数
   */
  const on = (event: string, callback: (data: any) => void) => {
    if (!socket.value) {
      console.warn('Socket未连接，无法监听事件');
      return;
    }

    socket.value.on(event, callback);

    // 保存清理函数
    const cleanup = () => {
      socket.value?.off(event, callback);
    };

    eventCleanupFunctions.value.push(cleanup);
    return cleanup; // 返回清理函数，便于手动清理
  };

  /**
   * 移除事件监听
   * @param event 事件名称
   * @param callback 可选，特定回调函数
   */
  const off = (event: string, callback?: any) => {
    if (!socket.value) return;

    if (callback) {
      socket.value.off(event, callback);
    } else {
      socket.value.off(event);
    }
  };

  /**
   * 清理所有注册的事件监听
   */
  const cleanupEvents = () => {
    eventCleanupFunctions.value.forEach((cleanup) => cleanup());
    eventCleanupFunctions.value = [];
  };

  /**
   * 断开 WebSocket 连接
   */
  const disconnect = () => {
    if (socket.value) {
      cleanupEvents();
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  // 连接状态计算属性
  const connectionStatus = computed(() => {
    if (!socket.value) return 'disconnected';
    return isConnected.value ? 'connected' : 'connecting';
  });

  return {
    socket,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    emit,
    on,
    off,
    cleanupEvents,
  };
});
