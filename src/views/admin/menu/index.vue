<template>
  <div class="container">
    <a-layout style="padding: 0 18px">
      <Breadcrumb :items="[$t('menu.system'), $t('menu.system.sysMenu')]" />
      <a-card :title="$t('menu.system.sysMenu')" class="general-card">
        <a-row>
          <a-col :span="12">
            <a-form
              :auto-label-width="true"
              :label-col-props="{ span: 6 }"
              :model="formModel"
              label-align="right"
            >
              <a-row>
                <a-col :span="12">
                  <a-form-item
                    :label="$t('admin.menu.form.title')"
                    field="name"
                  >
                    <a-input
                      v-model="formModel.title"
                      :placeholder="$t('admin.menu.form.title.placeholder')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    :label="$t('admin.menu.form.status')"
                    field="status"
                  >
                    <a-select
                      v-model="formModel.status"
                      :options="statusOptions"
                      :placeholder="$t('admin.menu.form.selectDefault')"
                      allow-clear
                      @clear="resetStatus"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-col>
          <a-divider direction="vertical" style="height: 30px" />
          <a-col :span="8">
            <a-space :size="'medium'" direction="horizontal">
              <a-button type="primary" @click="search">
                <template #icon>
                  <icon-search />
                </template>
                {{ $t('admin.menu.form.search') }}
              </a-button>
              <a-button @click="resetSelect">
                <template #icon>
                  <icon-refresh />
                </template>
                {{ $t('admin.menu.form.reset') }}
              </a-button>
            </a-space>
          </a-col>
        </a-row>
        <a-divider />
        <a-space :size="'medium'">
          <a-button type="primary" @click="NewMenu()">
            <template #icon>
              <icon-plus />
            </template>
            {{ $t('admin.menu.button.create') }}
          </a-button>
          <a-button @click="expand">
            {{ $t('admin.menu.button.collapse') }}
          </a-button>
        </a-space>
        <div class="content">
          <a-table
            ref="tableRef"
            :bordered="false"
            :columns="(cloneColumns as TableColumnData[])"
            :data="renderData"
            :loading="loading"
            :pagination="false"
            :size="size"
            row-key="id"
          >
            <template #menu_type="{ record }">
              <a-tag v-if="record.menu_type === 0" :color="`orange`" bordered>
                {{ $t(`admin.menu.columns.type.${record.menu_type}`) }}
              </a-tag>
              <a-tag
                v-else-if="record.menu_type === 1"
                :color="`purple`"
                bordered
              >
                {{ $t(`admin.menu.columns.type.${record.menu_type}`) }}
              </a-tag>
              <a-tag v-else :color="`blue`" bordered>
                {{ $t(`admin.menu.columns.type.${record.menu_type}`) }}
              </a-tag>
            </template>
            <template #icon="{ record }">
              <component :is="record.icon" :size="20"></component>
            </template>
            <template #show="{ record }">
              <a-badge v-if="record.show === 1" :status="'success'" />
              <a-badge v-else :status="'danger'" />
            </template>
            <template #status="{ record }">
              <a-tag v-if="record.status === 1" :color="`green`" bordered>
                {{ $t(`admin.menu.form.status.${record.status}`) }}
              </a-tag>
              <a-tag v-else :color="`red`" bordered>
                {{ $t(`admin.menu.form.status.${record.status}`) }}
              </a-tag>
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-link @click="NewMenu(record.id)">
                  {{ $t(`admin.menu.columns.new`) }}
                </a-link>
                <a-link @click="EditMenu(record.id)">
                  {{ $t(`admin.menu.columns.edit`) }}
                </a-link>
                <a-link :status="'danger'" @click="DeleteMenu(record.id)">
                  {{ $t(`admin.menu.columns.delete`) }}
                </a-link>
              </a-space>
            </template>
          </a-table>
        </div>
      </a-card>
    </a-layout>
  </div>
  <div class="content-modal">
    <a-modal
      :closable="false"
      :on-before-ok="beforeSubmit"
      :title="drawerTitle"
      :visible="openNewOrEdit"
      :width="550"
      @cancel="cancelReq"
      @ok="submitNewOrEdit"
    >
      <a-form ref="formRef" :model="form">
        <a-form-item :label="$t('admin.menu.columns.type')" field="menu_type">
          <a-radio-group
            v-model="form.menu_type"
            v-model:model-value="menuType"
          >
            <a-radio :value="0">
              {{ $t('admin.menu.columns.type.0') }}
            </a-radio>
            <a-radio :default-checked="true" :value="1">
              {{ $t('admin.menu.columns.type.1') }}
            </a-radio>
            <a-radio :value="2">
              {{ $t('admin.menu.columns.type.2') }}
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('admin.menu.columns.parent_name')"
          field="parent_id"
        >
          <a-tree-select
            v-model="form.parent_id"
            v-model:model-value="form.parent_id"
            :allow-clear="true"
            :allow-search="true"
            :data="treeSelectData"
            :field-names="selectTreeFieldNames"
            :loading="loading"
            :placeholder="$t('admin.menu.form.parent_id.placeholder')"
          ></a-tree-select>
        </a-form-item>
        <a-form-item
          :feedback="true"
          :label="$t('admin.menu.columns.title')"
          :rules="[
            { required: true, message: $t('admin.menu.form.title.help') },
          ]"
          field="title"
        >
          <a-input
            v-model="form.title"
            :placeholder="$t('admin.menu.form.title.placeholder')"
          ></a-input>
        </a-form-item>
        <a-form-item
          v-if="menuType === 0 || menuType === 1"
          :feedback="true"
          :label="$t('admin.menu.columns.name')"
          :rules="[
            { required: true, message: $t('admin.menu.form.name.help') },
          ]"
          field="name"
        >
          <a-input
            v-model="form.name"
            :placeholder="$t('admin.menu.form.name.placeholder')"
          ></a-input>
        </a-form-item>
        <a-form-item
          v-if="menuType === 0 || menuType === 1"
          :label="$t('admin.menu.columns.icon')"
          field="icon"
          prop="menuIcon"
        >
          <IconPicker v-model:icon-value="form.icon"></IconPicker>
        </a-form-item>
        <a-form-item
          v-if="menuType === 0 || menuType === 1"
          :label="$t('admin.menu.columns.path')"
          :tooltip="$t('admin.menu.form.path.help')"
          field="path"
        >
          <a-input
            v-model="form.path"
            :placeholder="$t('admin.menu.form.path.placeholder')"
          ></a-input>
        </a-form-item>
        <a-form-item
          v-if="menuType === 1"
          :label="$t('admin.menu.columns.component')"
          :tooltip="$t('admin.menu.form.component.help')"
          field="component"
        >
          <a-input
            v-model="form.component"
            :placeholder="$t('admin.menu.form.component.placeholder')"
          ></a-input>
        </a-form-item>
        <a-form-item
          v-if="menuType === 1 || menuType === 2"
          :label="$t('admin.menu.columns.perms')"
          :tooltip="$t('admin.menu.form.perms.help')"
          field="perms"
        >
          <a-input
            v-model="form.perms"
            :placeholder="$t('admin.menu.form.perms.placeholder')"
          ></a-input>
        </a-form-item>
        <a-form-item :label="$t('admin.menu.columns.remark')" field="remark">
          <a-textarea
            v-model="form.remark"
            :placeholder="$t('admin.menu.form.remark.placeholder')"
          ></a-textarea>
        </a-form-item>
        <a-form-item
          v-if="menuType === 1"
          :label="$t('admin.menu.columns.cache')"
          :required="true"
          field="cache"
        >
          <a-switch
            v-model="form.cache"
            v-model:model-value="switchCache"
            :checked-text="$t('switch.open')"
            :unchecked-text="$t('switch.close')"
          />
        </a-form-item>
        <a-form-item
          v-if="menuType === 0 || menuType === 1"
          :label="$t('admin.menu.columns.show')"
          :required="true"
          field="show"
        >
          <a-switch
            v-model="form.show"
            v-model:model-value="switchShow"
            :checked-text="$t('switch.open')"
            :unchecked-text="$t('switch.close')"
          />
        </a-form-item>
        <a-form-item
          v-if="menuType === 0 || menuType === 1"
          :label="$t('admin.menu.columns.status')"
          :required="true"
          field="status"
        >
          <a-switch
            v-model="form.status"
            v-model:model-value="switchStatus"
            :checked-text="$t('switch.open')"
            :unchecked-text="$t('switch.close')"
          />
        </a-form-item>
        <a-form-item
          :label="$t('admin.menu.columns.sort')"
          :required="true"
          field="sort"
        >
          <a-input-number
            v-model="form.sort"
            v-model:model-value="form.sort"
            :default-value="0"
            :mode="'button'"
            :placeholder="$t('admin.menu.columns.sort')"
            style="width: 35%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      :closable="false"
      :title="`${$t('modal.title.tips')}`"
      :visible="openDelete"
      :width="360"
      @cancel="cancelReq"
      @ok="submitDelete"
    >
      <a-space>
        <icon-exclamation-circle-fill size="24" style="color: #e6a23c" />
        {{ $t('modal.title.tips.delete') }}
      </a-space>
    </a-modal>
  </div>
  <div class="footer">
    <Footer />
  </div>
</template>

<script lang="ts" setup>
  import Footer from '@/components/footer/index.vue';
  import IconPicker from '@/components/icon-picker/index.vue';
  import { computed, reactive, ref, watch } from 'vue';
  import {
    Message,
    SelectOptionData,
    TableColumnData,
    TreeFieldNames,
  } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import {
    createSysMenu,
    deleteSysMenu,
    querySysMenuDetail,
    querySysMenuTree,
    SysMenuReq,
    SysMenuTreeParams,
    SysMenuTreeRes,
    updateSysMenu,
  } from '@/api/menu';
  import { cloneDeep } from 'lodash';
  import { treeSelectDataType } from '@/types/global';

  type Column = TableColumnData & { checked?: true };
  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  const { t } = useI18n();
  const { loading, setLoading } = useLoading(true);

  // 表单
  const generateFormModel = () => {
    return {
      title: undefined,
      status: undefined,
    };
  };
  const formModel = ref(generateFormModel());
  const statusOptions = computed<SelectOptionData[]>(() => [
    {
      label: t('admin.menu.form.status.1'),
      value: 1,
    },
    {
      label: t('admin.menu.form.status.0'),
      value: 0,
    },
  ]);

  // 表格
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const renderData = ref<SysMenuTreeRes[]>([]);
  const size = ref<SizeProps>('medium');
  const tableRef = ref();
  const expandAll = ref<boolean>(false);
  const operateRow = ref<number>(0);
  const NewMenu = (pk?: number) => {
    buttonStatus.value = 'new';
    drawerTitle.value = t('admin.menu.columns.new.drawer');
    resetForm(formDefaultValues);
    menuType.value = 1;
    form.parent_id = pk;
    openNewOrEdit.value = true;
  };
  const EditMenu = async (pk: number) => {
    buttonStatus.value = 'edit';
    operateRow.value = pk;
    drawerTitle.value = t('admin.menu.columns.edit.drawer');
    await fetchMenuDetail(pk);
    openNewOrEdit.value = true;
  };
  const DeleteMenu = (pk: number) => {
    operateRow.value = pk;
    drawerTitle.value = t('admin.menu.columns.delete.drawer');
    openDelete.value = true;
  };
  const columns = computed<TableColumnData[]>(() => [
    {
      title: t('admin.menu.columns.title'),
      dataIndex: 'title',
      slotName: 'title',
      ellipsis: true,
      tooltip: true,
      width: 150,
    },
    {
      title: t('admin.menu.columns.name'),
      dataIndex: 'name',
      slotName: 'name',
      width: 150,
    },
    {
      title: t('admin.menu.columns.type'),
      dataIndex: 'menu_type',
      slotName: 'menu_type',
      align: 'center',
      width: 100,
    },
    {
      title: t('admin.menu.columns.icon'),
      dataIndex: 'icon',
      slotName: 'icon',
      align: 'center',
      width: 100,
    },
    {
      title: t('admin.menu.columns.perms'),
      dataIndex: 'perms',
      slotName: 'perms',
      ellipsis: true,
      tooltip: true,
      width: 200,
    },
    {
      title: t('admin.menu.columns.sort'),
      dataIndex: 'sort',
      slotName: 'sort',
      align: 'center',
      width: 100,
    },
    {
      title: t('admin.menu.columns.show'),
      dataIndex: 'show',
      slotName: 'show',
      align: 'center',
      width: 100,
    },
    {
      title: t('admin.menu.columns.status'),
      dataIndex: 'status',
      slotName: 'status',
      align: 'center',
      width: 100,
    },
    {
      title: t('admin.menu.columns.remark'),
      dataIndex: 'remark',
      slotName: 'remark',
      ellipsis: true,
      tooltip: true,
      width: 250,
    },
    {
      title: t('admin.menu.columns.created_time'),
      dataIndex: 'created_time',
      slotName: 'created_time',
      width: 180,
    },
    {
      title: t('admin.menu.columns.operate'),
      dataIndex: 'operate',
      slotName: 'operate',
      width: 160,
    },
  ]);

  // 对话框
  const openNewOrEdit = ref<boolean>(false);
  const openDelete = ref<boolean>(false);
  const drawerTitle = ref<string>('');
  const cancelReq = () => {
    openNewOrEdit.value = false;
    openDelete.value = false;
  };
  const menuType = ref<number>(1);
  const formDefaultValues: SysMenuReq = {
    title: '',
    name: '',
    parent_id: undefined,
    sort: 0,
    icon: undefined,
    path: undefined,
    menu_type: 1,
    component: undefined,
    perms: undefined,
    status: 1,
    show: 1,
    cache: 1,
    remark: undefined,
  };
  const form = reactive<SysMenuReq>({ ...formDefaultValues });
  const switchStatus = ref<boolean>(Boolean(form.status));
  const switchShow = ref<boolean>(Boolean(form.show));
  const switchCache = ref<boolean>(Boolean(form.cache));
  const treeSelectData = ref();
  const selectTreeFieldNames: TreeFieldNames = {
    key: 'id',
    title: 'title',
    children: 'children',
    icon: 'iconRender',
  };
  const buttonStatus = ref<string>();
  const formRef = ref();

  // 表单校验
  const beforeSubmit = async (done: any) => {
    const res = await formRef.value?.validate();
    if (!res) {
      done(true);
    }
    done(false);
  };

  // 提交按钮
  const submitNewOrEdit = async () => {
    setLoading(true);
    try {
      if (buttonStatus.value === 'new') {
        await createSysMenu(form);
        cancelReq();
        Message.success(t('submit.create.success'));
        await fetchMenuTree();
      } else {
        await updateSysMenu(operateRow.value, form);
        cancelReq();
        Message.success(t('submit.update.success'));
        await fetchMenuTree();
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 删除按钮
  const submitDelete = async () => {
    setLoading(true);
    try {
      await deleteSysMenu(operateRow.value);
      cancelReq();
      Message.success(t('submit.delete.success'));
      await fetchMenuTree();
    } catch (error) {
      openDelete.value = false;
      // console.log(error);
    } finally {
      openDelete.value = false;
      setLoading(false);
    }
  };

  // 请求目录树
  const fetchMenuTree = async (params: SysMenuTreeParams = {}) => {
    setLoading(true);
    try {
      const res = await querySysMenuTree(params);
      renderData.value = res;
      treeSelectData.value = transformMenuData(res);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };
  fetchMenuTree();

  // 请求目录详情
  const fetchMenuDetail = async (pk: number) => {
    setLoading(true);
    try {
      const res = await querySysMenuDetail(pk);
      resetForm(res);
      menuType.value = res.menu_type;
      switchStatus.value = Boolean(res.status);
      switchShow.value = Boolean(res.show);
      switchCache.value = Boolean(res.cache);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const search = async () => {
    await fetchMenuTree({
      ...formModel.value,
    } as unknown as SysMenuTreeParams);
  };

  // 重置
  const resetSelect = () => {
    formModel.value = generateFormModel();
  };

  // 重置状态
  const resetStatus = () => {
    formModel.value.status = undefined;
  };

  // 展开/收起
  const expand = () => {
    expandAll.value = !expandAll.value;
    tableRef.value.expandAll(expandAll.value);
  };

  // 重置表单
  const resetForm = (data: Record<any, any>) => {
    Object.keys(data).forEach((key) => {
      // @ts-ignore
      form[key] = data[key];
    });
  };

  // 转换菜单数据结构
  const transformMenuData = (data: SysMenuTreeRes[]) => {
    const result: treeSelectDataType[] = [
      {
        id: null,
        title: '顶级',
        disabled: true,
        children: [],
      },
    ];
    data.forEach((item) => {
      result[0].children.push(item);
    });
    return result;
  };

  // 监听columns变化
  watch(
    () => columns.value,
    (val) => {
      cloneColumns.value = cloneDeep(val);
      cloneColumns.value.forEach((item, index) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );
</script>

<script lang="ts">
  export default {
    name: 'SysMenu',
  };
</script>

<style lang="less" scoped>
  .content {
    padding-top: 20px;
  }
</style>
