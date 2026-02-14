<script setup lang="ts">
import { ColPage } from '@vben/common-ui';

import DictData from '#/plugins/dict/views/dict-data.vue';
import DictType from '#/plugins/dict/views/dict-type.vue';
</script>

<template>
  <ColPage
    auto-content-height
    :resizable="false"
    :left-width="40"
    :right-width="60"
  >
    <template #left>
      <div class="mr-2 h-full">
        <DictType />
      </div>
    </template>
    <DictData />
  </ColPage>
</template>
