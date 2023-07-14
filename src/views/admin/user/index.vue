<template>
  <div class="container">
    <a-layout style="padding: 0 18px">
      <Breadcrumb :items="[$t('menu.system'), $t('menu.system.sysUser')]" />
      <a-card :title="$t('menu.system.sysUser')" class="general-card">
        <a-row>
          <a-col :flex="62">
            <a-form
              :auto-label-width="true"
              :model="formModel"
              label-align="right"
            >
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-form-item :label="$t('admin.user.form.dept')" field="name">
                    <a-tree-select
                      v-model="formModel.dept"
                      :placeholder="$t('admin.user.form.dept.placeholder')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item
                    :label="$t('admin.user.form.username')"
                    field="leader"
                  >
                    <a-input
                      v-model="formModel.username"
                      :placeholder="$t('admin.user.form.username.placeholder')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item
                    :label="$t('admin.user.form.phone')"
                    field="phone"
                  >
                    <a-input
                      v-model="formModel.phone"
                      :placeholder="$t('admin.user.form.phone.placeholder')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item
                    :label="$t('admin.dept.form.status')"
                    field="status"
                  >
                    <a-select
                      v-model="formModel.status"
                      :options="statusOptions"
                      :placeholder="$t('admin.dept.form.selectDefault')"
                      allow-clear
                      @clear="resetStatus"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-col>
          <a-divider direction="vertical" style="height: 30px" />
          <a-col :span="6">
            <a-space :size="'medium'" direction="horizontal">
              <a-button type="primary" @click="search">
                <template #icon>
                  <icon-search />
                </template>
                {{ $t('admin.dept.form.search') }}
              </a-button>
              <a-button @click="resetSelect">
                <template #icon>
                  <icon-refresh />
                </template>
                {{ $t('admin.dept.form.reset') }}
              </a-button>
            </a-space>
          </a-col>
        </a-row>
        <a-divider />
        <div class="content">
          <a-table
            :bordered="false"
            :columns="(showColumns as TableColumnData[])"
            :data="renderData"
            :loading="loading"
            :pagination="pagination"
            :scroll="{ x: 2000 }"
            :size="size"
            row-key="id"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #dept="{ record }">
              {{ record.dept?.name }}
            </template>
            <template #roles="{ record }">
              <a-popconfirm
                :content="$t('admin.user.columns.updateUserRoles.placeholder')"
                @ok="updateRole(record.username, record.id)"
              >
                <a-input-tag
                  :model-value="roleNameList(record.roles)"
                  :readonly="true"
                />
              </a-popconfirm>
            </template>
            <template #avatar="{ record }">
              <a-avatar
                v-if="record.avatar"
                :image-url="record.avatar"
                trigger-type="mask"
                @click="updateAvatar(record.username)"
              >
                <template #trigger-icon>
                  <IconEdit />
                </template>
              </a-avatar>
              <a-avatar
                v-else
                :style="{ backgroundColor: avatarColor }"
                trigger-type="mask"
                @click="updateAvatar(record.username)"
              >
                {{ record.username[0] }}
                <template #trigger-icon>
                  <IconEdit />
                </template>
              </a-avatar>
            </template>
            <template #status="{ record }">
              <a-switch
                v-model:model-value="record.status"
                :checked-text="$t(`admin.user.form.status.${record.status}`)"
                :checked-value="1"
                :disabled="switchStatus"
                :loading="loading"
                :unchecked-text="$t(`admin.user.form.status.${record.status}`)"
                :unchecked-value="0"
                @change="changeStatus(record.id)"
              />
            </template>
            <template #is_superuser="{ record }">
              <a-switch
                v-model:model-value="record.is_superuser"
                :checked-text="
                  $t(`admin.user.columns.switch.${record.is_superuser}`)
                "
                :disabled="switchStatus"
                :loading="loading"
                :unchecked-text="
                  $t(`admin.user.columns.switch.${record.is_superuser}`)
                "
                @change="changeSuper(record.id)"
              />
            </template>
            <template #is_multi_login="{ record }">
              <a-switch
                v-model:model-value="record.is_multi_login"
                :checked-text="
                  $t(`admin.user.columns.switch.${record.is_multi_login}`)
                "
                :disabled="switchStatus"
                :loading="loading"
                :unchecked-text="
                  $t(`admin.user.columns.switch.${record.is_multi_login}`)
                "
                @change="changeMultiLogin(record.id)"
              />
            </template>
            <template #operate="{ record }">
              <a-space>
                <a-link @click="EditUser(record.username)">
                  {{ $t(`admin.user.columns.edit`) }}
                </a-link>
                <a-link @click="DeleteUser(record.username)">
                  {{ $t(`admin.user.columns.delete`) }}
                </a-link>
              </a-space>
            </template>
          </a-table>
        </div>
        <div class="content-modal">
          <a-modal
            :closable="false"
            :on-before-ok="handleAvatarBeforeOk"
            :title="drawerTitle"
            :visible="openAvatar"
            @cancel="closeAvatar"
            @ok="submitUserAvatar"
          >
            <a-form ref="formAvatarRef" :model="formAvatar">
              <a-form-item
                :feedback="true"
                :label="$t('admin.user.form.avatar')"
                :rules="[
                  {
                    required: true,
                    message: $t('admin.user.form.avatar.required'),
                  },
                ]"
                :tooltip="$t('admin.user.form.avatar.help')"
                field="url"
              >
                <a-input
                  v-model="formAvatar.url"
                  :placeholder="$t('admin.user.form.avatar.placeholder')"
                />
              </a-form-item>
            </a-form>
          </a-modal>
          <a-modal
            :closable="false"
            :on-before-ok="handleUserInfoBeforeOk"
            :title="drawerTitle"
            :visible="openEdit"
            @cancel="closeEdit"
            @ok="submitUserInfo"
          >
            <a-form ref="formUserInfoRef" :model="formUserInfo">
              <a-form-item :label="$t('admin.user.form.dept')" field="dept_id">
                <a-tree-select
                  v-model="formUserInfo.dept_id"
                  :allow-clear="true"
                  :allow-search="true"
                  :data="deptTreeData"
                  :field-names="selectDeptTreeFieldNames"
                  :loading="loading"
                  :placeholder="$t('admin.user.form.dept.placeholder')"
                ></a-tree-select>
              </a-form-item>
              <a-form-item
                :feedback="true"
                :label="$t('admin.user.form.username')"
                :rules="[
                  {
                    required: true,
                    message: $t('admin.user.form.username.required'),
                  },
                ]"
                field="username"
              >
                <a-input
                  v-model="formUserInfo.username"
                  :placeholder="$t('admin.user.form.username.placeholder')"
                />
              </a-form-item>
              <a-form-item
                :feedback="true"
                :label="$t('admin.user.form.nickname')"
                :rules="[
                  {
                    required: true,
                    message: $t('admin.user.form.nickname.required'),
                  },
                ]"
                field="nickname"
              >
                <a-input
                  v-model="formUserInfo.nickname"
                  :placeholder="$t('admin.user.form.nickname.placeholder')"
                />
              </a-form-item>
              <a-form-item
                :feedback="true"
                :label="$t('admin.user.form.email')"
                :rules="[
                  {
                    required: true,
                    message: $t('admin.user.form.email.required'),
                  },
                ]"
                field="email"
              >
                <a-input
                  v-model="formUserInfo.email"
                  :placeholder="$t('admin.user.form.email.placeholder')"
                />
              </a-form-item>
            </a-form>
          </a-modal>
          <a-modal
            :closable="false"
            :title="`${$t('modal.title.tips')}`"
            :visible="openDelete"
            :width="360"
            @cancel="closeDelete"
            @ok="submitDeleteUser"
          >
            <a-space>
              <icon-exclamation-circle-fill size="24" style="color: #e6a23c" />
              {{ $t('modal.title.tips.delete') }}
            </a-space>
          </a-modal>
          <a-modal
            :closable="false"
            :title="drawerTitle"
            :visible="openEditUserRole"
            @cancel="closeEditUserRole"
            @ok="submitUserRole"
          >
            <a-select
              v-model="formUserRole.roles"
              :allow-clear="true"
              :loading="loading"
              :multiple="true"
              :options="roleOptions"
              :placeholder="$t('admin.user.form.role.placeholder')"
              :width="360"
            ></a-select>
          </a-modal>
        </div>
      </a-card>
    </a-layout>
  </div>
  <div class="footer">
    <Footer />
  </div>
</template>

<script lang="ts" setup>
  import Footer from '@/components/footer/index.vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useLoading from '@/hooks/loading';
  import {
    changeUserMulti,
    changeUserStatus,
    changeUserSuper,
    deleteUser,
    getUser,
    getUserList,
    SysUserAvatarReq,
    SysUserInfoReq,
    SysUserParams,
    SysUserRes,
    SysUserRoleReq,
    updateUser,
    updateUserAvatar,
    updateUserRole,
  } from '@/api/user';
  import { computed, reactive, ref, watch } from 'vue';
  import {
    SelectOptionData,
    TableColumnData,
    TreeFieldNames,
  } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { cloneDeep } from 'lodash';
  import { Pagination } from '@/types/global';
  import { useUserStore } from '@/store';
  import {
    querySysRoleAll,
    querySysRoleAllBySysUser,
    SysRoleRes,
  } from '@/api/role';
  import getRandomColor from '@/utils/color';
  import { querySysDeptTree, SysDeptTreeParams } from '@/api/dept';

  type Column = TableColumnData & { checked?: true };
  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  const { loading, setLoading } = useLoading(true);
  const { t } = useI18n();

  // 表单
  const generateFormModel = () => {
    return {
      dept: undefined,
      username: undefined,
      phone: undefined,
      status: undefined,
    };
  };
  const formModel = ref(generateFormModel());
  const statusOptions = computed<SelectOptionData[]>(() => [
    {
      label: t('admin.user.form.status.1'),
      value: 1,
    },
    {
      label: t('admin.user.form.status.0'),
      value: 0,
    },
  ]);
  const formAvatar = reactive<SysUserAvatarReq>({
    url: '',
  });
  const formUserInfo = reactive<SysUserInfoReq>({
    dept_id: 0,
    username: '',
    nickname: '',
    email: '',
    phone: undefined,
  });
  const formUserRole = reactive<SysUserRoleReq>({
    roles: [],
  });
  const userRoleData = ref<SysRoleRes[]>([]);
  const roleOptions = computed<SelectOptionData[]>(() => {
    return userRoleData.value.map((item) => {
      return {
        value: item.id,
        label: item.name,
        disabled: Boolean(!item.status),
      };
    });
  });
  const deptTreeData = ref();
  const selectDeptTreeFieldNames: TreeFieldNames = {
    key: 'id',
    title: 'name',
    children: 'children',
  };

  // 表格
  const userStore = useUserStore();
  const currentUser = userStore.userInfo;
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const renderData = ref<SysUserRes[]>([]);
  const size = ref<SizeProps>('medium');
  const operateUsername = ref<string>('');
  const basePagination: Pagination = {
    current: 1,
    defaultPageSize: 20,
    showTotal: true,
    showPageSize: true,
    bufferSize: 3,
  };
  const pagination: Pagination = reactive({
    ...basePagination,
  });
  const EditUser = async (username: string) => {
    operateUsername.value = username;
    drawerTitle.value = t('admin.user.columns.edit.userinfo');
    await fetchUser(username);
    await fetchDeptTree();
    openEdit.value = true;
  };
  const DeleteUser = async (username: string) => {
    operateUsername.value = username;
    openDelete.value = true;
  };
  const updateAvatar = async (username: string) => {
    operateUsername.value = username;
    drawerTitle.value = t('admin.user.columns.edit.avatar');
    openAvatar.value = true;
  };
  const updateRole = async (username: string, pk: number) => {
    operateUsername.value = username;
    drawerTitle.value = t('admin.user.columns.edit.role');
    await fetchUserRole(pk);
    await fetchAllRole();
    openEditUserRole.value = true;
  };
  const switchStatus = ref<boolean>(!currentUser.is_superuser);
  const roleNameList = (roleList: SysRoleRes[]) => {
    const nameList: string[] = [];
    roleList.forEach((item) => {
      nameList.push(item.name);
    });
    return nameList;
  };
  const avatarColor = getRandomColor();
  const columns = computed<TableColumnData[]>(() => [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      slotName: 'uuid',
      ellipsis: true,
      tooltip: true,
      width: 168,
    },
    {
      title: t('admin.user.columns.avatar'),
      dataIndex: 'avatar',
      slotName: 'avatar',
      align: 'center',
      width: 100,
    },
    {
      title: t('admin.user.columns.username'),
      dataIndex: 'username',
      slotName: 'username',
      ellipsis: true,
      tooltip: true,
      width: 100,
    },
    {
      title: t('admin.user.columns.nickname'),
      dataIndex: 'nickname',
      slotName: 'nickname',
      ellipsis: true,
      tooltip: true,
      width: 120,
    },
    {
      title: t('admin.user.columns.dept'),
      dataIndex: 'dept',
      slotName: 'dept',
      ellipsis: true,
      tooltip: true,
      width: 150,
    },
    {
      title: t('admin.user.columns.roles'),
      dataIndex: 'roles',
      slotName: 'roles',
      width: 200,
    },
    {
      title: t('admin.user.columns.email'),
      dataIndex: 'email',
      slotName: 'email',
      ellipsis: true,
      tooltip: true,
      width: 180,
    },
    {
      title: t('admin.user.columns.phone'),
      dataIndex: 'phone',
      slotName: 'phone',
      ellipsis: true,
      tooltip: true,
      width: 150,
    },
    {
      title: t('admin.user.columns.join_time'),
      dataIndex: 'join_time',
      slotName: 'join_time',
    },
    {
      title: t('admin.user.columns.last_login_time'),
      dataIndex: 'last_login_time',
      slotName: 'last_login_time',
    },
    {
      title: t('admin.user.columns.status'),
      dataIndex: 'status',
      slotName: 'status',
      align: 'center',
      fixed: 'right',
      width: 100,
    },
    {
      title: t('admin.user.columns.is_superuser'),
      dataIndex: 'is_superuser',
      slotName: 'is_superuser',
      align: 'center',
      fixed: 'right',
      width: 120,
    },
    {
      title: t('admin.user.columns.is_multi_login'),
      dataIndex: 'is_multi_login',
      slotName: 'is_multi_login',
      fixed: 'right',
      width: 100,
    },
    {
      title: t('admin.user.columns.operate'),
      dataIndex: 'operate',
      slotName: 'operate',
      align: 'center',
      fixed: 'right',
      width: 120,
    },
  ]);

  // 对话框
  const drawerTitle = ref<string>('');
  const openEdit = ref<boolean>(false);
  const openDelete = ref<boolean>(false);
  const openAvatar = ref<boolean>(false);
  const openEditUserRole = ref<boolean>(false);
  const formAvatarRef = ref();
  const formUserInfoRef = ref();
  const closeAvatar = () => {
    formAvatar.url = '';
    openAvatar.value = false;
  };
  const closeEdit = () => {
    openEdit.value = false;
    resetUserInfoForm(formUserInfo);
  };
  const closeDelete = () => {
    openDelete.value = false;
  };
  const closeEditUserRole = () => {
    formUserRole.roles = [];
    openEditUserRole.value = false;
  };

  // 表单校验
  const handleAvatarBeforeOk = async (done: any) => {
    const res = await formAvatarRef.value?.validate();
    if (!res) {
      done(true);
    }
    done(false);
  };
  const handleUserInfoBeforeOk = async (done: any) => {
    const res = await formUserInfoRef.value?.validate();
    if (!res) {
      done(true);
    }
    done(false);
  };

  // 请求用户列表
  const fetchUserList = async (params: SysUserParams = {}) => {
    setLoading(true);
    try {
      const res = await getUserList(params);
      renderData.value = res.items;
      pagination.total = res.total;
      pagination.current = params.page;
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };
  fetchUserList();

  // 请求用户信息
  const fetchUser = async (username = '') => {
    setLoading(true);
    try {
      const res = await getUser(username);
      resetUserInfoForm(res);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 请求部门树
  const fetchDeptTree = async (params: SysDeptTreeParams = {}) => {
    setLoading(true);
    try {
      deptTreeData.value = await querySysDeptTree(params);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 请求所有角色
  const fetchAllRole = async () => {
    setLoading(true);
    try {
      userRoleData.value = await querySysRoleAll();
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 请求用户角色
  const fetchUserRole = async (pk: number) => {
    setLoading(true);
    try {
      const res = await querySysRoleAllBySysUser(pk);
      formUserRole.roles = res.map((item) => item.id);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户头像
  const submitUserAvatar = async () => {
    setLoading(true);
    try {
      await updateUserAvatar(operateUsername.value, formAvatar);
      closeAvatar();
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户角色
  const submitUserRole = async () => {
    setLoading(true);
    try {
      await updateUserRole(operateUsername.value, formUserRole);
      closeEditUserRole();
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 修改用户状态
  const changeStatus = async (pk: number) => {
    setLoading(true);
    try {
      await changeUserStatus(pk);
    } catch (error) {
      // console.log(error);
    } finally {
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
      setLoading(false);
    }
  };

  // 修改用户超级权限
  const changeSuper = async (pk: number) => {
    setLoading(true);
    try {
      await changeUserSuper(pk);
    } catch (error) {
      // console.log(error);
    } finally {
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
      setLoading(false);
    }
  };

  // 修改用户多点登录
  const changeMultiLogin = async (pk: number) => {
    setLoading(true);
    try {
      await changeUserMulti(pk);
    } catch (error) {
      // console.log(error);
    } finally {
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
      setLoading(false);
    }
  };

  // 更新用户信息
  const submitUserInfo = async () => {
    setLoading(true);
    try {
      await updateUser(operateUsername.value, formUserInfo);
      closeEdit();
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const submitDeleteUser = async () => {
    setLoading(true);
    try {
      await deleteUser(operateUsername.value);
      closeDelete();
      await fetchUserList({
        page: pagination.current,
        size: pagination.pageSize,
      });
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 事件: 分页
  const onPageChange = async (current: number) => {
    await fetchUserList({ page: current, size: pagination.pageSize });
  };

  // 事件: 分页大小
  const onPageSizeChange = async (pageSize: number) => {
    pagination.pageSize = pageSize;
    await fetchUserList({ page: 1, size: pageSize });
  };

  // 搜索
  const search = async () => {
    await fetchUserList({
      ...formModel.value,
    } as unknown as SysUserParams);
  };

  // 重置
  const resetSelect = () => {
    formModel.value = generateFormModel();
  };

  // 重置状态
  const resetStatus = () => {
    formModel.value.status = undefined;
  };

  // 重置表单
  const resetUserInfoForm = (data: Record<any, any>) => {
    Object.keys(data).forEach((key) => {
      // @ts-ignore
      formUserInfo[key] = data[key];
    });
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
    name: 'SysUser',
  };
</script>

<style lang="less" scoped></style>
