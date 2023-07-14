<template>
  <router-view v-slot="{ Component, route }" :key="key">
    <transition appear mode="out-in" name="fade">
      <component
        :is="Component"
        v-if="route.meta.ignoreCache"
        :key="route.fullPath"
      />
      <keep-alive v-else :include="cacheList">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useTabBarStore } from '@/store';
  import { useRoute } from 'vue-router';

  const tabBarStore = useTabBarStore();
  const useRoure = useRoute();
  const key = computed(() => {
    return useRoure.path + Math.random();
  });

  const cacheList = computed(() => tabBarStore.getCacheList);
</script>

<style lang="less" scoped></style>
