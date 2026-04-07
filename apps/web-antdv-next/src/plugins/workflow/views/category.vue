<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
  await router.replace('/plugins/workflow/definition');
});
</script>

<template>
  <div></div>
</template>
