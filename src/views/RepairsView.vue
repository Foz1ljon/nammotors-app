<script setup lang="ts">
  import { computed, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import IconPlus from "~icons/ph/plus-duotone";
  import IconEdit from "~icons/ph/pencil-simple-duotone";
  import IconDelete from "~icons/ph/trash-duotone";
  import { message, Modal } from "ant-design-vue";
  import { useRepairsStore, repairStatusMeta, REPAIR_STATUSES, type RepairOrder, type RepairStatus } from "@/stores/repairs";
  import { useIsMobile } from "@/composables/useIsMobile";
  import TableActions, { type RowAction } from "@/components/TableActions.vue";

  const { t } = useI18n();
  const store = useRepairsStore();
  const compactActions = useIsMobile(1300);

  const editDeleteActions: RowAction[] = [
    { key: "edit", label: t("common.edit"), icon: IconEdit },
    { key: "delete", label: t("common.deleteAction"), icon: IconDelete, danger: true },
  ];

  function fmt(n: number) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }

  const statusFilter = ref<RepairStatus | "all">("all");
  const statusOptions = computed(() => [{ value: "all", label: t("repairs.allStatuses") }, ...REPAIR_STATUSES.map((s) => ({ value: s, label: t(repairStatusMeta[s].label) }))]);

  const entries = computed(() => (statusFilter.value === "all" ? store.items : store.items.filter((r) => r.status === statusFilter.value)));

  const modalOpen = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive({
    customerName: "",
    customerPhone: "",
    equipmentName: "",
    problem: "",
    status: "qabul" as RepairStatus,
    price: 0,
    note: "",
  });

  function resetForm() {
    form.customerName = "";
    form.customerPhone = "";
    form.equipmentName = "";
    form.problem = "";
    form.status = "qabul";
    form.price = 0;
    form.note = "";
  }

  function openAdd() {
    editingId.value = null;
    resetForm();
    modalOpen.value = true;
  }

  function openEdit(record: RepairOrder) {
    editingId.value = record.id;
    form.customerName = record.customerName;
    form.customerPhone = record.customerPhone;
    form.equipmentName = record.equipmentName;
    form.problem = record.problem;
    form.status = record.status;
    form.price = record.price;
    form.note = record.note;
    modalOpen.value = true;
  }

  function handleOk() {
    if (!form.customerName.trim() || !form.equipmentName.trim()) {
      message.error(t("repairs.requireFields"));
      return;
    }
    if (editingId.value) {
      store.updateRepair(editingId.value, { ...form });
      message.success(t("repairs.updated"));
    } else {
      store.addRepair({ ...form, receivedAt: new Date().toISOString().slice(0, 10) });
      message.success(t("repairs.added"));
    }
    modalOpen.value = false;
  }

  function handleDelete(record: RepairOrder) {
    Modal.confirm({
      title: t("repairs.deleteTitle"),
      content: t("repairs.deleteContent", { name: record.equipmentName }),
      okText: t("common.deleteAction"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk() {
        store.removeRepair(record.id);
        message.success(t("repairs.deleted"));
      },
    });
  }

  function handleStatusChange(record: RepairOrder, status: RepairStatus) {
    store.updateRepair(record.id, { status });
    message.success(t("repairs.statusChanged"));
  }
</script>

<template>
  <div>
    <a-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <div>
          <div class="toolbar-title">{{ t("repairs.title") }}</div>
          <div class="toolbar-sub">{{ t("repairs.subtitle", { n: entries.length }) }}</div>
        </div>
        <div class="toolbar-actions">
          <a-select v-model:value="statusFilter" :options="statusOptions" style="width: 180px" />
          <a-button type="primary" class="flex! justify-center! items-center!" @click="openAdd">
            <template #icon><IconPlus /></template>
            {{ t("repairs.add") }}
          </a-button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table :data-source="entries" row-key="id" size="middle" :pagination="{ pageSize: 10 }" :scroll="{ x: 1000 }">
        <a-table-column :title="t('repairs.colReceivedAt')" data-index="receivedAt" :width="120" />
        <a-table-column :title="t('repairs.colCustomer')" :width="200">
          <template #default="{ record }">
            <div class="name-cell">
              <span class="name-text">{{ record.customerName }}</span>
              <span class="name-sub">{{ record.customerPhone }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column :title="t('repairs.colEquipment')" :width="220">
          <template #default="{ record }">
            <div class="name-cell">
              <span class="name-text">{{ record.equipmentName }}</span>
              <span class="name-sub">{{ record.problem }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column :title="t('repairs.colStatus')" :width="170">
          <template #default="{ record }">
            <a-select
              :value="record.status"
              size="small"
              style="width: 150px"
              :options="REPAIR_STATUSES.map((s) => ({ value: s, label: t(repairStatusMeta[s].label) }))"
              @change="(val) => handleStatusChange(record, val as RepairStatus)"
            >
              <template #suffixIcon><a-tag :color="repairStatusMeta[record.status as RepairStatus].color" style="margin: 0" /></template>
            </a-select>
          </template>
        </a-table-column>
        <a-table-column :title="t('repairs.colPrice')" :width="140">
          <template #default="{ record }">{{ record.price > 0 ? fmt(record.price) : "-" }}</template>
        </a-table-column>
        <a-table-column :title="t('products.colActions')" :width="compactActions ? 70 : 100" fixed="right">
          <template #default="{ record }">
            <TableActions :actions="editDeleteActions" :compact="compactActions" @action="(key) => (key === 'edit' ? openEdit(record) : handleDelete(record))" />
          </template>
        </a-table-column>
      </a-table>

      <a-empty v-if="!entries.length" :description="t('repairs.empty')" style="margin: 24px 0" />
    </a-card>

    <a-modal v-model:open="modalOpen" :title="editingId ? t('repairs.editTitle') : t('repairs.addTitle')" :ok-text="t('common.save')" :cancel-text="t('common.cancel')" width="560px" @ok="handleOk">
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('repairs.customerNameLabel')">
              <a-input v-model:value="form.customerName" :placeholder="t('repairs.customerNamePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('repairs.customerPhoneLabel')">
              <a-input v-model:value="form.customerPhone" :placeholder="t('repairs.customerPhonePlaceholder')" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :label="t('repairs.equipmentLabel')">
          <a-input v-model:value="form.equipmentName" :placeholder="t('repairs.equipmentPlaceholder')" />
        </a-form-item>
        <a-form-item :label="t('repairs.problemLabel')">
          <a-textarea v-model:value="form.problem" :rows="2" :placeholder="t('repairs.problemPlaceholder')" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('repairs.colStatus')">
              <a-select v-model:value="form.status" :options="REPAIR_STATUSES.map((s) => ({ value: s, label: t(repairStatusMeta[s].label) }))" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('repairs.priceLabel')">
              <a-input-number v-model:value="form.price" :min="0" style="width: 100%" placeholder="0" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :label="t('repairs.noteLabel')">
          <a-textarea v-model:value="form.note" :rows="2" :placeholder="t('repairs.notePlaceholder')" />
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

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
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

  @media (max-width: 576px) {
    .toolbar-actions {
      width: 100%;
    }
  }
</style>
