<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import IconPlus from "~icons/ph/plus-duotone";
  import IconEdit from "~icons/ph/pencil-simple-duotone";
  import IconDelete from "~icons/ph/trash-duotone";
  import { message, Modal } from "ant-design-vue";
  import { useEmployeesStore, permissionMeta, ALL_PERMISSIONS, type Employee, type PermissionKey } from "@/stores/employees";
  import { useWarehousesStore } from "@/stores/warehouses";
  import { useAuthStore } from "@/stores/auth";
  import { useSuppliersStore, type Supplier } from "@/stores/suppliers";
  import { useIsMobile } from "@/composables/useIsMobile";
  import TableActions, { type RowAction } from "@/components/TableActions.vue";

  const { t } = useI18n();
  const store = useEmployeesStore();
  const warehousesStore = useWarehousesStore();
  const auth = useAuthStore();
  const suppliersStore = useSuppliersStore();
  const compactActions = useIsMobile(1300);

  function editDeleteActions(): RowAction[] {
    return [
      { key: "edit", label: t("common.edit"), icon: IconEdit },
      { key: "delete", label: t("common.deleteAction"), icon: IconDelete, danger: true },
    ];
  }

  const permissionOptions = ALL_PERMISSIONS.map((key) => ({ label: permissionMeta[key], value: key }));

  const modalOpen = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive({
    fullName: "",
    username: "",
    password: "",
    role: "",
    warehouse: "",
    permissions: [] as PermissionKey[],
    active: true,
  });

  function resetForm() {
    form.fullName = "";
    form.username = "";
    form.password = "";
    form.role = "";
    form.warehouse = "";
    form.permissions = [];
    form.active = true;
  }

  function openAdd() {
    editingId.value = null;
    resetForm();
    modalOpen.value = true;
  }

  function openEdit(record: Employee) {
    editingId.value = record.id;
    form.fullName = record.fullName;
    form.username = record.username;
    form.password = record.password;
    form.role = record.role;
    form.warehouse = record.warehouse;
    form.permissions = [...record.permissions];
    form.active = record.active;
    modalOpen.value = true;
  }

  function handleOk() {
    if (!form.fullName.trim() || !form.username.trim() || !form.password.trim()) {
      message.error(t("employees.requireFields"));
      return;
    }
    const existing = store.findByUsername(form.username);
    if (existing && existing.id !== editingId.value) {
      message.error(t("employees.usernameTaken"));
      return;
    }
    if (editingId.value) {
      store.updateEmployee(editingId.value, { ...form });
      message.success(t("employees.updated"));
    } else {
      store.addEmployee({ ...form });
      message.success(t("employees.added"));
    }
    modalOpen.value = false;
  }

  function handleDelete(record: Employee) {
    if (record.username === auth.user?.username) {
      message.warning(t("employees.cantDeleteSelf"));
      return;
    }
    Modal.confirm({
      title: t("employees.deleteTitle"),
      content: t("employees.deleteContent", { name: record.fullName }),
      okText: t("common.deleteAction"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk() {
        store.removeEmployee(record.id);
        message.success(t("employees.deleted"));
      },
    });
  }

  const supplierModalOpen = ref(false);
  const editingSupplierId = ref<string | null>(null);
  const supplierForm = reactive({
    companyName: "",
    contactPerson: "",
    phone: "",
    username: "",
    password: "",
    active: true,
  });

  function resetSupplierForm() {
    supplierForm.companyName = "";
    supplierForm.contactPerson = "";
    supplierForm.phone = "";
    supplierForm.username = "";
    supplierForm.password = "";
    supplierForm.active = true;
  }

  function openAddSupplier() {
    editingSupplierId.value = null;
    resetSupplierForm();
    supplierModalOpen.value = true;
  }

  function openEditSupplier(record: Supplier) {
    editingSupplierId.value = record.id;
    supplierForm.companyName = record.companyName;
    supplierForm.contactPerson = record.contactPerson;
    supplierForm.phone = record.phone;
    supplierForm.username = record.username;
    supplierForm.password = record.password;
    supplierForm.active = record.active;
    supplierModalOpen.value = true;
  }

  function handleSupplierOk() {
    if (!supplierForm.companyName.trim() || !supplierForm.username.trim() || !supplierForm.password.trim()) {
      message.error(t("suppliersAdmin.requireFields"));
      return;
    }
    const existing = suppliersStore.findByUsername(supplierForm.username);
    if (existing && existing.id !== editingSupplierId.value) {
      message.error(t("suppliersAdmin.usernameTaken"));
      return;
    }
    if (editingSupplierId.value) {
      suppliersStore.updateSupplier(editingSupplierId.value, { ...supplierForm });
      message.success(t("suppliersAdmin.updated"));
    } else {
      suppliersStore.addSupplier({ ...supplierForm });
      message.success(t("suppliersAdmin.added"));
    }
    supplierModalOpen.value = false;
  }

  function handleDeleteSupplier(record: Supplier) {
    Modal.confirm({
      title: t("suppliersAdmin.deleteTitle"),
      content: t("suppliersAdmin.deleteContent", { name: record.companyName }),
      okText: t("common.deleteAction"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk() {
        suppliersStore.removeSupplier(record.id);
        message.success(t("suppliersAdmin.deleted"));
      },
    });
  }
</script>

<template>
  <div>
    <a-tabs>
      <a-tab-pane key="employees" :tab="t('employees.tabEmployees')">
        <a-card :bordered="false" class="toolbar-card">
          <div class="toolbar">
            <div>
              <div class="toolbar-title">{{ t("employees.title") }}</div>
              <div class="toolbar-sub">{{ t("employees.subtitle", { n: store.items.length }) }}</div>
            </div>
            <a-button type="primary" class="flex! justify-center! items-center!" @click="openAdd">
              <template #icon><IconPlus /></template>
              {{ t("employees.add") }}
            </a-button>
          </div>
        </a-card>

        <a-card :bordered="false" style="margin-top: 16px">
          <a-table :data-source="store.items" row-key="id" size="middle" :pagination="{ pageSize: 10 }" :scroll="{ x: 1100 }">
            <a-table-column :title="t('employees.colFullName')" data-index="fullName" :width="180" />
            <a-table-column :title="t('employees.colUsername')" data-index="username" :width="120" />
            <a-table-column :title="t('employees.colRole')" data-index="role" :width="180" />
            <a-table-column :title="t('employees.colWarehouse')" :width="120">
              <template #default="{ record }">
                <span v-if="record.warehouse">{{ record.warehouse }}</span>
                <span v-else class="muted">{{ t("employees.noWarehouse") }}</span>
              </template>
            </a-table-column>
            <a-table-column :title="t('employees.colPermissions')" :width="320">
              <template #default="{ record }">
                <a-space wrap>
                  <a-tag v-for="p in record.permissions as PermissionKey[]" :key="p" color="blue">
                    {{ t(permissionMeta[p]) }}
                  </a-tag>
                  <span v-if="!record.permissions.length" class="muted">{{ t("employees.noPermissions") }}</span>
                </a-space>
              </template>
            </a-table-column>
            <a-table-column :title="t('employees.colStatus')" :width="100">
              <template #default="{ record }">
                <a-tag :color="record.active ? 'success' : 'default'">{{ record.active ? t("employees.active") : t("employees.inactive") }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('products.colActions')" :width="compactActions ? 70 : 100" fixed="right">
              <template #default="{ record }">
                <TableActions :actions="editDeleteActions()" :compact="compactActions" @action="(key) => (key === 'edit' ? openEdit(record) : handleDelete(record))" />
              </template>
            </a-table-column>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="suppliers" :tab="t('employees.tabSuppliers')">
        <a-card :bordered="false" class="toolbar-card">
          <div class="toolbar">
            <div>
              <div class="toolbar-title">{{ t("suppliersAdmin.title") }}</div>
              <div class="toolbar-sub">{{ t("suppliersAdmin.subtitle", { n: suppliersStore.items.length }) }}</div>
            </div>
            <a-button type="primary" @click="openAddSupplier">
              <template #icon><IconPlus /></template>
              {{ t("suppliersAdmin.add") }}
            </a-button>
          </div>
        </a-card>

        <a-card :bordered="false" style="margin-top: 16px">
          <a-table :data-source="suppliersStore.items" row-key="id" size="middle" :pagination="{ pageSize: 10 }" :scroll="{ x: 900 }">
            <a-table-column :title="t('suppliersAdmin.colCompany')" data-index="companyName" />
            <a-table-column :title="t('suppliersAdmin.colContact')" data-index="contactPerson" />
            <a-table-column :title="t('suppliersAdmin.colPhone')" data-index="phone" />
            <a-table-column :title="t('employees.colUsername')" data-index="username" :width="140" />
            <a-table-column :title="t('employees.colStatus')" :width="100">
              <template #default="{ record }">
                <a-tag :color="record.active ? 'success' : 'default'">{{ record.active ? t("employees.active") : t("employees.inactive") }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column :title="t('products.colActions')" :width="compactActions ? 70 : 100" fixed="right">
              <template #default="{ record }">
                <TableActions :actions="editDeleteActions()" :compact="compactActions" @action="(key) => (key === 'edit' ? openEditSupplier(record) : handleDeleteSupplier(record))" />
              </template>
            </a-table-column>
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>

    <a-modal v-model:open="modalOpen" :title="editingId ? t('employees.editTitle') : t('employees.addTitle')" :ok-text="t('common.save')" :cancel-text="t('common.cancel')" width="520px" @ok="handleOk">
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('employees.fullNameLabel')">
              <a-input v-model:value="form.fullName" :placeholder="t('employees.fullNamePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('employees.roleLabel')">
              <a-input v-model:value="form.role" :placeholder="t('employees.rolePlaceholder')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('employees.usernameLabel')">
              <a-input v-model:value="form.username" :placeholder="t('employees.usernamePlaceholder')" autocomplete="off" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('employees.passwordLabel')">
              <a-input-password v-model:value="form.password" :placeholder="t('employees.passwordPlaceholder')" autocomplete="new-password" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('employees.warehouseLabel')">
              <a-select v-model:value="form.warehouse" :placeholder="t('employees.warehousePlaceholder')" allow-clear :options="warehousesStore.items.map((w) => ({ value: w.name, label: w.name }))" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('employees.statusLabel')">
              <a-switch v-model:checked="form.active" :checked-children="t('employees.active')" :un-checked-children="t('employees.inactive')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :label="t('employees.permissionsLabel')">
          <a-checkbox-group v-model:value="form.permissions" class="permission-grid">
            <a-checkbox v-for="opt in permissionOptions" :key="opt.value" :value="opt.value">{{ t(opt.label) }}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="supplierModalOpen"
      :title="editingSupplierId ? t('suppliersAdmin.editTitle') : t('suppliersAdmin.addTitle')"
      :ok-text="t('common.save')"
      :cancel-text="t('common.cancel')"
      width="520px"
      @ok="handleSupplierOk"
    >
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('suppliersAdmin.companyLabel')">
              <a-input v-model:value="supplierForm.companyName" :placeholder="t('suppliersAdmin.companyPlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('suppliersAdmin.contactLabel')">
              <a-input v-model:value="supplierForm.contactPerson" :placeholder="t('suppliersAdmin.contactPlaceholder')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('suppliersAdmin.phoneLabel')">
              <a-input v-model:value="supplierForm.phone" :placeholder="t('suppliersAdmin.phonePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('employees.statusLabel')">
              <a-switch v-model:checked="supplierForm.active" :checked-children="t('employees.active')" :un-checked-children="t('employees.inactive')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('employees.usernameLabel')">
              <a-input v-model:value="supplierForm.username" :placeholder="t('employees.usernamePlaceholder')" autocomplete="off" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('employees.passwordLabel')">
              <a-input-password v-model:value="supplierForm.password" :placeholder="t('employees.passwordPlaceholder')" autocomplete="new-password" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
  .toolbar-card :deep(.ant-card-body) {
    padding: 18px 20px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
  }

  .toolbar-sub {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .muted {
    color: var(--color-text-faint);
    font-size: 12px;
  }

  .permission-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  @media (max-width: 480px) {
    .permission-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
