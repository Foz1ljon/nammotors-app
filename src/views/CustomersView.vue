<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import IconPlus from "~icons/ph/plus-duotone";
  import IconEdit from "~icons/ph/pencil-simple-duotone";
  import IconDelete from "~icons/ph/trash-duotone";
  import IconWallet from "~icons/ph/wallet-duotone";
  import { message, Modal } from "ant-design-vue";
  import { useCustomersStore, type Customer } from "@/stores/customers";
  import { useIsMobile } from "@/composables/useIsMobile";
  import TableActions, { type RowAction } from "@/components/TableActions.vue";

  const { t } = useI18n();
  const store = useCustomersStore();
  const compactActions = useIsMobile(1300);

  function rowActions(record: Customer): RowAction[] {
    return [
      { key: "pay", label: t("customers.payTooltip"), tooltip: t("customers.payTooltip"), icon: IconWallet, disabled: record.debt <= 0 },
      { key: "edit", label: t("common.edit"), icon: IconEdit },
      { key: "delete", label: t("common.deleteAction"), icon: IconDelete, danger: true },
    ];
  }

  function fmt(n: number) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }

  const modalOpen = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    debt: 0,
    notes: "",
  });

  function resetForm() {
    form.name = "";
    form.contactPerson = "";
    form.phone = "";
    form.address = "";
    form.debt = 0;
    form.notes = "";
  }

  function openAdd() {
    editingId.value = null;
    resetForm();
    modalOpen.value = true;
  }

  function openEdit(record: Customer) {
    editingId.value = record.id;
    form.name = record.name;
    form.contactPerson = record.contactPerson;
    form.phone = record.phone;
    form.address = record.address;
    form.debt = record.debt;
    form.notes = record.notes;
    modalOpen.value = true;
  }

  function handleOk() {
    if (!form.name.trim() || !form.phone.trim()) {
      message.error(t("customers.requireFields"));
      return;
    }
    if (editingId.value) {
      store.updateCustomer(editingId.value, { ...form });
      message.success(t("customers.updated"));
    } else {
      store.addCustomer({ ...form });
      message.success(t("customers.added"));
    }
    modalOpen.value = false;
  }

  function handleDelete(record: Customer) {
    Modal.confirm({
      title: t("customers.deleteTitle"),
      content: t("customers.deleteContent", { name: record.name }),
      okText: t("common.deleteAction"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk() {
        store.removeCustomer(record.id);
        message.success(t("customers.deleted"));
      },
    });
  }

  const payModalOpen = ref(false);
  const payingRecord = ref<Customer | null>(null);
  const payAmount = ref(0);

  function openPayModal(record: Customer) {
    payingRecord.value = record;
    payAmount.value = record.debt;
    payModalOpen.value = true;
  }

  function handlePayOk() {
    const record = payingRecord.value;
    if (!record) return;
    if (!payAmount.value || payAmount.value <= 0) {
      message.error(t("customers.invalidAmount"));
      return;
    }
    store.adjustDebt(record.id, -payAmount.value);
    message.success(t("customers.paySuccess"));
    payModalOpen.value = false;
  }
</script>

<template>
  <div>
    <a-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <div>
          <div class="toolbar-title">{{ t("customers.title") }}</div>
          <div class="toolbar-sub">{{ t("customers.subtitle", { n: store.items.length }) }}</div>
        </div>
        <a-button class="flex! justify-center! items-center!" type="primary" @click="openAdd">
          <template #icon><IconPlus /></template>
          {{ t("customers.add") }}
        </a-button>
      </div>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table :data-source="store.items" row-key="id" size="middle" :pagination="{ pageSize: 10 }" :scroll="{ x: 900 }">
        <a-table-column :title="t('customers.colName')" :width="220">
          <template #default="{ record }">
            <div class="name-cell">
              <span class="name-text">{{ record.name }}</span>
              <span v-if="record.contactPerson" class="name-sub">{{ record.contactPerson }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column :title="t('customers.colPhone')" data-index="phone" :width="160" />
        <a-table-column :title="t('customers.colAddress')" data-index="address" />
        <a-table-column :title="t('customers.colDebt')" :width="160">
          <template #default="{ record }">
            <a-tag :color="record.debt > 0 ? 'error' : 'success'">{{ fmt(record.debt) }} {{ t("common.som") }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column :title="t('products.colActions')" :width="compactActions ? 70 : 140" fixed="right">
          <template #default="{ record }">
            <TableActions :actions="rowActions(record)" :compact="compactActions" @action="(key) => (key === 'pay' ? openPayModal(record) : key === 'edit' ? openEdit(record) : handleDelete(record))" />
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <a-modal v-model:open="modalOpen" :title="editingId ? t('customers.editTitle') : t('customers.addTitle')" :ok-text="t('common.save')" :cancel-text="t('common.cancel')" width="520px" @ok="handleOk">
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('customers.nameLabel')">
              <a-input v-model:value="form.name" :placeholder="t('customers.namePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('customers.contactLabel')">
              <a-input v-model:value="form.contactPerson" :placeholder="t('customers.contactPlaceholder')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('customers.phoneLabel')">
              <a-input v-model:value="form.phone" :placeholder="t('customers.phonePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('customers.debtLabel')">
              <a-input-number v-model:value="form.debt" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :label="t('customers.addressLabel')">
          <a-input v-model:value="form.address" :placeholder="t('customers.addressPlaceholder')" />
        </a-form-item>
        <a-form-item :label="t('customers.notesLabel')">
          <a-textarea v-model:value="form.notes" :rows="2" :placeholder="t('customers.notesPlaceholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="payModalOpen" :title="t('customers.payTitle')" :ok-text="t('customers.payConfirm')" :cancel-text="t('common.cancel')" width="400px" @ok="handlePayOk">
      <div v-if="payingRecord" class="pay-info">
        <div class="pay-name">{{ payingRecord.name }}</div>
        <div class="pay-debt">{{ t("customers.colDebt") }}: {{ fmt(payingRecord.debt) }} {{ t("common.som") }}</div>
      </div>
      <a-form layout="vertical">
        <a-form-item :label="t('customers.payAmountLabel')">
          <a-input-number v-model:value="payAmount" :min="1" :max="payingRecord?.debt" style="width: 100%" autofocus />
        </a-form-item>
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

  .name-cell {
    display: flex;
    flex-direction: column;
  }

  .name-text {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
  }

  .name-sub {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .pay-info {
    margin-bottom: 16px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--color-surface-alt);
  }

  .pay-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
  }

  .pay-debt {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 2px;
  }
</style>
