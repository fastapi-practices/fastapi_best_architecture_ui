<script setup lang="ts">
import type { ConfigResult } from '#/plugins/config/api';

import { ref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { getAllConfigApi, updateConfigApi } from '#/plugins/config/api';
import { loginSchema } from '#/plugins/config/views/data';

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: loginSchema,
  commonConfig: {
    componentProps: {
      class: 'w-1/4',
    },
    disabled: true,
    labelClass: 'justify-start ml-2 self-start',
    labelWidth: 120,
    wrapperClass: 'flex-col items-start',
    hideRequiredMark: true,
  },
});

const editButtonShow = ref<boolean>(true);
const loading = ref<boolean>(false);

const loginData = ref<ConfigResult[]>([]);
const fetchConfigList = async () => {
  loading.value = true;
  try {
    loginData.value = await getAllConfigApi({ type: 'LOGIN' });
    loginData.value.forEach((config: any) => {
      formApi.setState((prev: any) => {
        return {
          schema: prev.schema?.map((item: any) => {
            if (item.fieldName === config.key) {
              return {
                ...item,
                label: config.name,
              };
            }
            return item;
          }),
        };
      });
      formApi.setValues({ [config.key]: config.value });
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveLoginConfig = async () => {
  const { valid } = await formApi.validate();
  if (valid) {
    const data: Record<string, any> = await formApi.getValues();
    loginData.value.forEach((config: any) => {
      if (Object.prototype.hasOwnProperty.call(data, config.key)) {
        config.value = data[config.key];
      }
    });
    try {
      await updateConfigApi(loginData.value);
      message.success($t('ui.actionMessage.operationSuccess'));
      editButtonShow.value = true;
      formApi.setState({ commonConfig: { disabled: true } });
      await fetchConfigList();
    } catch (error) {
      console.error(error);
    }
  }
};

defineExpose({
  fetchConfigList,
});
</script>

<template>
  <a-spin :spinning="loading">
    <div>
      <Form />
      <VbenButton
        v-show="editButtonShow"
        class="ml-1.5 mt-3"
        @click="
          () => {
            editButtonShow = false;
            formApi.setState({ commonConfig: { disabled: false } });
          }
        "
      >
        <MaterialSymbolsEdit class="mr-1" />
        修改
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-1.5 mt-3"
        @click="saveLoginConfig"
      >
        <MaterialSymbolsEdit class="mr-1" />
        保存
      </VbenButton>
      <VbenButton
        v-show="!editButtonShow"
        class="ml-5 mt-5"
        variant="outline"
        @click="
          () => {
            editButtonShow = true;
            formApi.setState({ commonConfig: { disabled: true } });
            fetchConfigList();
          }
        "
      >
        <MaterialSymbolsEdit class="mr-1" />
        取消
      </VbenButton>
    </div>
  </a-spin>
</template>
