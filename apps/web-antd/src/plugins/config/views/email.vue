<script setup lang="ts">
import type { ConfigResult } from '#/plugins/config/api';

import { ref } from 'vue';

import { VbenButton } from '@vben/common-ui';
import { MaterialSymbolsEdit } from '@vben/icons';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getAllConfigApi, updateConfigApi } from '#/plugins/config/api';
import { emailSchema } from '#/plugins/config/views/data';

const [Form, formApi] = useVbenForm({
  showDefaultActions: false,
  schema: emailSchema,
  commonConfig: {
    componentProps: {
      class: 'w-1/4',
    },
    disabled: true,
    labelClass: 'justify-start ml-2',
    labelWidth: 120,
    hideRequiredMark: true,
  },
});

const editButtonShow = ref<boolean>(true);

const emailData = ref<ConfigResult[]>([]);
const fetchConfigList = async () => {
  try {
    emailData.value = await getAllConfigApi({ type: 'EMAIL' });
    emailData.value.forEach((config: any) => {
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
  }
};

const saveEmailConfig = async () => {
  const { valid } = await formApi.validate();
  if (valid) {
    const data: Record<string, any> = await formApi.getValues();
    emailData.value.forEach((config: any) => {
      if (Object.prototype.hasOwnProperty.call(data, config.key)) {
        config.value = data[config.key];
      }
    });
    try {
      await updateConfigApi(emailData.value);
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
      @click="saveEmailConfig"
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
</template>
