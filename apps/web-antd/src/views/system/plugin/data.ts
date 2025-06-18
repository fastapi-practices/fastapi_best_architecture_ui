import type { VbenFormSchema } from '#/adapter/form';

import { h } from 'vue';

import { Button } from 'ant-design-vue';

export function userSchema(fileList: any): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      defaultValue: 0,
      componentProps: {
        options: [
          {
            label: '压缩包',
            value: 0,
          },
          {
            label: 'GIT',
            value: 1,
          },
        ],
      },
      fieldName: 'installType',
      label: '安装方式',
    },
    {
      component: 'Upload',
      dependencies: {
        show: (values) => values && values.installType === 0,
        triggerFields: ['installType'],
      },
      componentProps: {
        name: 'file',
        accept: '.zip',
        maxCount: 1,
        multiple: false,
        directory: false,
        fileList: fileList.value,
        beforeUpload: (file: any) => {
          fileList.value = [file];
          return false;
        },
        onRemove: () => {
          fileList.value = [];
        },
      },
      renderComponentContent: () => ({
        default: () => {
          return h(Button, {}, { default: () => 'Upload' });
        },
      }),
      fieldName: 'uploadField',
      label: 'ZIP 压缩包',
      rules: 'required',
      help: '仅能上传一个 zip 压缩包文件，重新上传则覆盖',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => values && values.installType === 1,
        triggerFields: ['installType'],
      },
      fieldName: 'repo_url',
      label: 'GIT 地址',
      rules: 'required',
      help: '仓库内容无法实时检测，请谨慎操作，避免非插件代码植入',
    },
  ];
}
