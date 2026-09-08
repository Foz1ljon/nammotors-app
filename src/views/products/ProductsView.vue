<script setup lang="ts">
  import { computed, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import IconPlus from "~icons/ph/plus-duotone";
  import IconEdit from "~icons/ph/pencil-simple-duotone";
  import IconDelete from "~icons/ph/trash-duotone";
  import IconSearch from "~icons/ph/magnifying-glass-duotone";
  import IconImage from "~icons/ph/image-duotone";
  import IconUpload from "~icons/ph/upload-simple-duotone";
  import IconExcel from "~icons/ph/file-xls-duotone";
  import IconCart from "~icons/ph/shopping-cart-simple-duotone";
  import IconSwap from "~icons/ph/arrows-left-right-duotone";
  import IconEye from "~icons/ph/eye-duotone";
  import IconPlusCircle from "~icons/ph/plus-circle-duotone";
  import { message, Modal } from "ant-design-vue";
  import { useProductsStore, categoryMeta, type Product, type ProductCategory } from "@/stores/products";
  import { useModelsStore } from "@/stores/models";
  import { useWarehousesStore } from "@/stores/warehouses";
  import { useAuthStore } from "@/stores/auth";
  import { useActivityLogStore } from "@/stores/activityLog";
  import { useCustomersStore } from "@/stores/customers";
  import { exportProductsToExcel } from "@/utils/excel";
  import { useIsMobile } from "@/composables/useIsMobile";
  import TableActions, { type RowAction } from "@/components/TableActions.vue";

  const props = defineProps<{ category: ProductCategory }>();

  const { t } = useI18n();
  const store = useProductsStore();
  const modelsStore = useModelsStore();
  const warehousesStore = useWarehousesStore();
  const auth = useAuthStore();
  const activityLog = useActivityLogStore();
  const customersStore = useCustomersStore();
  const search = ref("");
  const exporting = ref(false);
  const compactActions = useIsMobile(1300);

  function rowActions(record: Product): RowAction[] {
    return [
      { key: "view", label: t("products.viewTooltip"), tooltip: t("products.viewTooltip"), icon: IconEye },
      { key: "restock", label: t("products.restockTooltip"), tooltip: t("products.restockTooltip"), icon: IconPlusCircle },
      {
        key: "sell",
        label: t("products.sellTooltip"),
        tooltip: t("products.sellTooltip"),
        icon: IconCart,
        disabled: record.quantity <= 0,
      },
      {
        key: "transfer",
        label: t("products.transferTooltip"),
        tooltip: t("products.transferTooltip"),
        icon: IconSwap,
        disabled: record.quantity <= 0,
      },
      { key: "edit", label: t("common.edit"), icon: IconEdit },
      { key: "delete", label: t("common.deleteAction"), icon: IconDelete, danger: true },
    ];
  }

  function handleRowAction(key: string, record: Product) {
    if (key === "view") openViewModal(record);
    else if (key === "restock") openRestockModal(record);
    else if (key === "sell") openSellModal(record);
    else if (key === "transfer") openTransferModal(record);
    else if (key === "edit") openEditModal(record);
    else if (key === "delete") handleDelete(record);
  }

  const units = ["dona", "kg", "litr", "m"];

  const items = computed(() =>
    store.items
      .filter((p) => p.category === props.category)
      .filter((p) => {
        const q = search.value.trim().toLowerCase();
        if (!q) return true;
        const fields = [p.name, p.code, p.model, p.unit, p.warehouse, p.kvt != null ? String(p.kvt) : "", p.rpm != null ? String(p.rpm) : "", String(p.quantity), String(p.price)];
        return fields.some((f) => f.toLowerCase().includes(q));
      }),
  );

  const meta = computed(() => categoryMeta[props.category]);

  function fmt(n: number) {
    return new Intl.NumberFormat("uz-UZ").format(n);
  }

  function statusTag(status: "tugagan" | "kam" | "yetarli") {
    if (status === "tugagan") return { color: "error", text: t("status.tugagan") };
    if (status === "kam") return { color: "warning", text: t("status.kam") };
    return { color: "success", text: t("status.yetarli") };
  }

  async function handleExport() {
    exporting.value = true;
    try {
      await exportProductsToExcel(items.value, t(meta.value.short), (p) => statusTag(store.statusOf(p)).text, t);
    } finally {
      exporting.value = false;
    }
  }

  const modalOpen = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive({
    code: "",
    name: "",
    image: "",
    model: "",
    kvt: undefined as number | undefined,
    rpm: undefined as number | undefined,
    unit: "dona",
    quantity: 0,
    minStock: 0,
    price: 0,
    warehouse: "",
  });

  function resetForm() {
    form.code = "";
    form.name = "";
    form.image = "";
    form.model = "";
    form.kvt = undefined;
    form.rpm = undefined;
    form.unit = "dona";
    form.quantity = 0;
    form.minStock = 0;
    form.price = 0;
    form.warehouse = "";
  }

  function openAddModal() {
    editingId.value = null;
    resetForm();
    modalOpen.value = true;
  }

  function openEditModal(record: Product) {
    editingId.value = record.id;
    form.code = record.code;
    form.name = record.name;
    form.image = record.image;
    form.model = record.model;
    form.kvt = record.kvt;
    form.rpm = record.rpm;
    form.unit = record.unit;
    form.quantity = record.quantity;
    form.minStock = record.minStock;
    form.price = record.price;
    form.warehouse = record.warehouse;
    modalOpen.value = true;
  }

  function logEvent(action: "added" | "sold" | "updated" | "deleted", record: { code: string; name: string }, quantity?: number, note?: string) {
    if (!auth.user) return;
    activityLog.record({
      username: auth.user.username,
      userFullName: auth.user.fullName,
      action,
      productCode: record.code,
      productName: record.name,
      category: props.category,
      quantity,
      note,
    });
  }

  function handleOk() {
    if (!form.name.trim() || !form.code.trim()) {
      message.error(t("products.requireNameCode"));
      return;
    }
    if (editingId.value) {
      store.updateProduct(editingId.value, { ...form, category: props.category });
      logEvent("updated", form);
      message.success(t("products.updated"));
    } else {
      store.addProduct({ ...form, category: props.category });
      logEvent("added", form, form.quantity);
      message.success(t("products.added"));
    }
    modalOpen.value = false;
  }

  function handleDelete(record: Product) {
    Modal.confirm({
      title: t("products.deleteTitle"),
      content: t("products.deleteContent", { name: record.name }),
      okText: t("common.deleteAction"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk() {
        store.removeProduct(record.id);
        logEvent("deleted", record);
        message.success(t("products.deleted"));
      },
    });
  }

  const viewModalOpen = ref(false);
  const viewingRecord = ref<Product | null>(null);

  function openViewModal(record: Product) {
    viewingRecord.value = record;
    viewModalOpen.value = true;
  }

  const restockModalOpen = ref(false);
  const restockingRecord = ref<Product | null>(null);
  const restockQty = ref(1);

  function openRestockModal(record: Product) {
    restockingRecord.value = record;
    restockQty.value = 1;
    restockModalOpen.value = true;
  }

  function handleRestockOk() {
    const record = restockingRecord.value;
    if (!record) return;
    if (!restockQty.value || restockQty.value <= 0) {
      message.error(t("products.invalidQuantity"));
      return;
    }
    store.updateProduct(record.id, { quantity: record.quantity + restockQty.value });
    logEvent("added", record, restockQty.value);
    message.success(t("products.restockSuccess"));
    restockModalOpen.value = false;
  }

  const sellModalOpen = ref(false);
  const sellingRecord = ref<Product | null>(null);
  const sellQty = ref(1);
  const sellPaymentType = ref<"naqd" | "nasiya">("naqd");
  const sellCustomerId = ref<string | undefined>(undefined);

  const sellTotal = computed(() => (sellingRecord.value ? sellQty.value * sellingRecord.value.price : 0));
  const customerOptions = computed(() => customersStore.items.map((c) => ({ value: c.id, label: c.name })));

  function openSellModal(record: Product) {
    sellingRecord.value = record;
    sellQty.value = 1;
    sellPaymentType.value = "naqd";
    sellCustomerId.value = undefined;
    sellModalOpen.value = true;
  }

  function handleSellOk() {
    const record = sellingRecord.value;
    if (!record) return;
    if (!sellQty.value || sellQty.value <= 0) {
      message.error(t("products.invalidQuantity"));
      return;
    }
    if (sellQty.value > record.quantity) {
      message.error(t("products.insufficientStock"));
      return;
    }
    if (sellPaymentType.value === "nasiya" && !sellCustomerId.value) {
      message.error(t("products.selectCustomerForCredit"));
      return;
    }

    store.updateProduct(record.id, { quantity: record.quantity - sellQty.value });

    let note: string | undefined;
    if (sellCustomerId.value) {
      const customer = customersStore.items.find((c) => c.id === sellCustomerId.value);
      if (customer) {
        note = customer.name;
        if (sellPaymentType.value === "nasiya") {
          customersStore.adjustDebt(customer.id, sellTotal.value);
        }
      }
    }

    logEvent("sold", record, sellQty.value, note);
    message.success(t("products.soldSuccess"));
    sellModalOpen.value = false;
  }

  const newCustomerName = ref("");
  function addCustomerInline() {
    if (!newCustomerName.value.trim()) return;
    const trimmed = newCustomerName.value.trim();
    const existing = customersStore.items.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      sellCustomerId.value = existing.id;
    } else {
      customersStore.addCustomer({ name: trimmed, contactPerson: "", phone: "", address: "", debt: 0, notes: "" });
      sellCustomerId.value = customersStore.items[0]?.id;
    }
    newCustomerName.value = "";
  }

  const transferModalOpen = ref(false);
  const transferringRecord = ref<Product | null>(null);
  const transferQty = ref(1);
  const transferDestination = ref("");

  const transferDestinationOptions = computed(() => warehousesStore.items.filter((w) => w.name !== transferringRecord.value?.warehouse).map((w) => ({ value: w.name, label: w.name })));

  function openTransferModal(record: Product) {
    transferringRecord.value = record;
    transferQty.value = 1;
    transferDestination.value = "";
    transferModalOpen.value = true;
  }

  function handleTransferOk() {
    const record = transferringRecord.value;
    if (!record) return;
    if (!transferQty.value || transferQty.value <= 0) {
      message.error(t("products.invalidQuantity"));
      return;
    }
    if (transferQty.value > record.quantity) {
      message.error(t("products.insufficientStock"));
      return;
    }
    if (!transferDestination.value || transferDestination.value === record.warehouse) {
      message.error(t("products.sameWarehouseDestination"));
      return;
    }

    store.updateProduct(record.id, { quantity: record.quantity - transferQty.value });

    const existing = store.items.find((p) => p.code === record.code && p.warehouse === transferDestination.value);
    if (existing) {
      store.updateProduct(existing.id, { quantity: existing.quantity + transferQty.value });
    } else {
      const { id: _id, updatedAt: _updatedAt, ...rest } = record;
      store.addProduct({ ...rest, quantity: transferQty.value, warehouse: transferDestination.value });
    }

    if (auth.user) {
      activityLog.record({
        username: auth.user.username,
        userFullName: auth.user.fullName,
        action: "transferred",
        productCode: record.code,
        productName: record.name,
        category: props.category,
        quantity: transferQty.value,
        fromWarehouse: record.warehouse,
        toWarehouse: transferDestination.value,
      });
    }

    message.success(t("products.transferSuccess"));
    transferModalOpen.value = false;
  }

  function handleImageSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      form.image = reader.result as string;
    };
    reader.readAsDataURL(file);
    return false;
  }

  const newModelName = ref("");
  function addModelInline() {
    if (!newModelName.value.trim()) return;
    const created = modelsStore.addModel(newModelName.value);
    form.model = created.name;
    newModelName.value = "";
  }

  const newWarehouseName = ref("");
  function addWarehouseInline() {
    if (!newWarehouseName.value.trim()) return;
    const created = warehousesStore.addWarehouse(newWarehouseName.value);
    form.warehouse = created.name;
    newWarehouseName.value = "";
  }

  // reset search when switching category
  watch(
    () => props.category,
    () => {
      search.value = "";
    },
  );
</script>

<template>
  <div>
    <a-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <div>
          <div class="toolbar-title">{{ t(meta.label) }}</div>
          <div class="toolbar-sub">{{ items.length }} {{ t("products.positionsCount") }}</div>
        </div>
        <div class="toolbar-actions">
          <a-input v-model:value="search" :placeholder="t('products.searchPlaceholder')" allow-clear class="search-input">
            <template #prefix><IconSearch style="color: rgba(0, 0, 0, 0.3)" /></template>
          </a-input>
          <a-button :loading="exporting" class="flex! justify-center! items-center!" @click="handleExport">
            <template #icon><IconExcel /></template>
            {{ t("products.export") }}
          </a-button>
          <a-button type="primary" class="flex! justify-center! items-center!" @click="openAddModal">
            <template #icon><IconPlus /></template>
            {{ t("products.addProduct") }}
          </a-button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" style="margin-top: 16px">
      <a-table :data-source="items" row-key="id" size="middle" :pagination="{ pageSize: 10 }" :scroll="{ x: 760 }">
        <a-table-column :title="t('products.colImage')" :width="64">
          <template #default="{ record }">
            <a-avatar v-if="record.image" shape="square" :size="40" :src="record.image" />
            <a-avatar v-else shape="square" :size="40" class="no-image">
              <template #icon><IconImage /></template>
            </a-avatar>
          </template>
        </a-table-column>
        <a-table-column :title="t('products.colName')" data-index="name">
          <template #default="{ record }">
            <div class="name-cell">
              <span class="name-text">{{ record.name }}</span>
              <span class="name-code"
                >{{ record.code }}<template v-if="record.model"> · {{ record.model }}</template></span
              >
            </div>
          </template>
        </a-table-column>
        <a-table-column :title="t('products.colQuantity')" :width="140">
          <template #default="{ record }">
            <a-tag :color="statusTag(store.statusOf(record)).color">{{ fmt(record.quantity) }} {{ record.unit }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column :title="t('products.colPrice')" :width="160">
          <template #default="{ record }">{{ fmt(record.price) }}</template>
        </a-table-column>
        <a-table-column :title="t('products.colActions')" :width="compactActions ? 70 : 200" fixed="right">
          <template #default="{ record }">
            <TableActions :actions="rowActions(record)" :compact="compactActions" @action="(key) => handleRowAction(key, record)" />
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="editingId ? t('products.editTitle') : t('products.addTitle', { cat: t(meta.short) })"
      :ok-text="t('common.save')"
      :cancel-text="t('common.cancel')"
      width="560px"
      @ok="handleOk"
    >
      <a-form layout="vertical">
        <a-form-item :label="t('products.imageLabel')">
          <div class="image-field">
            <a-avatar v-if="form.image" shape="square" :size="64" :src="form.image" />
            <a-avatar v-else shape="square" :size="64" class="no-image">
              <template #icon><IconImage /></template>
            </a-avatar>
            <a-upload :show-upload-list="false" :before-upload="handleImageSelect" accept="image/*">
              <a-button size="small"
                ><template #icon><IconUpload /></template>{{ t("products.uploadImage") }}</a-button
              >
            </a-upload>
            <a-button v-if="form.image" size="small" type="text" danger @click="form.image = ''">{{ t("products.removeImage") }}</a-button>
          </div>
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('products.codeLabel')">
              <a-input v-model:value="form.code" :placeholder="t('products.codePlaceholder')" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('products.unitLabel')">
              <a-select v-model:value="form.unit" :options="units.map((u) => ({ value: u, label: u }))" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :label="t('products.nameLabel')">
          <a-input v-model:value="form.name" :placeholder="t('products.namePlaceholder')" />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('products.modelLabel')">
              <a-select v-model:value="form.model" :placeholder="t('products.modelPlaceholder')" allow-clear :options="modelsStore.items.map((m) => ({ value: m.name, label: m.name }))">
                <template #dropdownRender="{ menuNode }">
                  <component :is="menuNode" />
                  <a-divider style="margin: 4px 0" />
                  <div class="inline-add" @mousedown.prevent>
                    <a-input v-model:value="newModelName" size="small" :placeholder="t('products.newModelPlaceholder')" @keydown.enter.prevent="addModelInline" />
                    <a-button size="small" type="primary" @click="addModelInline">{{ t("products.addInline") }}</a-button>
                  </div>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('products.warehouseLabel')">
              <a-select v-model:value="form.warehouse" :placeholder="t('products.warehousePlaceholder')" :options="warehousesStore.items.map((w) => ({ value: w.name, label: w.name }))">
                <template #dropdownRender="{ menuNode }">
                  <component :is="menuNode" />
                  <a-divider style="margin: 4px 0" />
                  <div class="inline-add" @mousedown.prevent>
                    <a-input v-model:value="newWarehouseName" size="small" :placeholder="t('products.newWarehousePlaceholder')" @keydown.enter.prevent="addWarehouseInline" />
                    <a-button size="small" type="primary" @click="addWarehouseInline">{{ t("products.addInline") }}</a-button>
                  </div>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('products.kvtLabel')">
              <a-input-number v-model:value="form.kvt" :min="0" :step="0.1" style="width: 100%" placeholder="-" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('products.rpmLabel')">
              <a-input-number v-model:value="form.rpm" :min="0" style="width: 100%" placeholder="-" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item :label="t('products.quantityLabel')">
              <a-input-number v-if="!editingId" v-model:value="form.quantity" :min="0" style="width: 100%" />
              <div v-else class="readonly-quantity">
                {{ fmt(form.quantity) }} {{ form.unit }}
                <div class="readonly-quantity-hint">{{ t("products.quantityEditHint") }}</div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('products.minStockLabel')">
              <a-input-number v-model:value="form.minStock" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item :label="t('products.priceLabel')">
          <a-input-number v-model:value="form.price" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="viewModalOpen" :title="t('products.viewTitle')" :footer="null" width="520px">
      <div v-if="viewingRecord" class="view-details">
        <div class="view-header">
          <a-avatar v-if="viewingRecord.image" shape="square" :size="72" :src="viewingRecord.image" />
          <a-avatar v-else shape="square" :size="72" class="no-image">
            <template #icon><IconImage /></template>
          </a-avatar>
          <div>
            <div class="view-name">{{ viewingRecord.name }}</div>
            <a-tag :color="statusTag(store.statusOf(viewingRecord)).color">{{ statusTag(store.statusOf(viewingRecord)).text }}</a-tag>
          </div>
        </div>

        <div class="view-grid">
          <div class="view-field">
            <span>{{ t("products.colCode") }}</span
            ><b>{{ viewingRecord.code }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colModel") }}</span
            ><b>{{ viewingRecord.model || "-" }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colKvt") }}</span
            ><b>{{ viewingRecord.kvt != null ? viewingRecord.kvt : "-" }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colRpm") }}</span
            ><b>{{ viewingRecord.rpm != null ? fmt(viewingRecord.rpm) : "-" }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colUnit") }}</span
            ><b>{{ viewingRecord.unit }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colQuantity") }}</span
            ><b>{{ fmt(viewingRecord.quantity) }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colPrice") }}</span
            ><b>{{ fmt(viewingRecord.price) }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colTotal") }}</span
            ><b>{{ fmt(viewingRecord.price * viewingRecord.quantity) }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colMinStock") }}</span
            ><b>{{ fmt(viewingRecord.minStock) }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.colWarehouse") }}</span
            ><b>{{ viewingRecord.warehouse }}</b>
          </div>
          <div class="view-field">
            <span>{{ t("products.updatedAtLabel") }}</span
            ><b>{{ viewingRecord.updatedAt }}</b>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal v-model:open="restockModalOpen" :title="t('products.restockTitle')" :ok-text="t('products.restockConfirm')" :cancel-text="t('common.cancel')" width="400px" @ok="handleRestockOk">
      <div v-if="restockingRecord" class="sell-info">
        <div class="sell-name">{{ restockingRecord.name }}</div>
        <div class="sell-stock">{{ t("products.stockLabel") }}: {{ fmt(restockingRecord.quantity) }} {{ restockingRecord.unit }}</div>
      </div>
      <a-form layout="vertical">
        <a-form-item :label="t('products.restockQuantityLabel')">
          <a-input-number v-model:value="restockQty" :min="1" style="width: 100%" autofocus />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="sellModalOpen" :title="t('products.sellTitle')" :ok-text="t('products.sellConfirm')" :cancel-text="t('common.cancel')" width="400px" @ok="handleSellOk">
      <div v-if="sellingRecord" class="sell-info">
        <div class="sell-name">{{ sellingRecord.name }}</div>
        <div class="sell-stock">{{ t("products.stockLabel") }}: {{ fmt(sellingRecord.quantity) }} {{ sellingRecord.unit }}</div>
      </div>
      <a-form layout="vertical">
        <a-form-item :label="t('products.sellQuantityLabel')">
          <a-input-number v-model:value="sellQty" :min="1" :max="sellingRecord?.quantity" style="width: 100%" autofocus />
        </a-form-item>
        <a-form-item :label="t('products.paymentTypeLabel')">
          <a-radio-group v-model:value="sellPaymentType">
            <a-radio-button value="naqd">{{ t("products.paymentCash") }}</a-radio-button>
            <a-radio-button value="nasiya">{{ t("products.paymentCredit") }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('products.customerLabel')">
          <a-select v-model:value="sellCustomerId" :placeholder="t('products.customerPlaceholder')" allow-clear :options="customerOptions">
            <template #dropdownRender="{ menuNode }">
              <component :is="menuNode" />
              <a-divider style="margin: 4px 0" />
              <div class="inline-add" @mousedown.prevent>
                <a-input v-model:value="newCustomerName" size="small" :placeholder="t('products.newCustomerPlaceholder')" @keydown.enter.prevent="addCustomerInline" />
                <a-button size="small" type="primary" @click="addCustomerInline">{{ t("products.addInline") }}</a-button>
              </div>
            </template>
          </a-select>
        </a-form-item>
        <div class="sell-total">
          {{ t("products.colTotal") }}: <b>{{ fmt(sellTotal) }} {{ t("common.som") }}</b>
        </div>
      </a-form>
    </a-modal>

    <a-modal v-model:open="transferModalOpen" :title="t('products.transferTitle')" :ok-text="t('products.transferConfirm')" :cancel-text="t('common.cancel')" width="400px" @ok="handleTransferOk">
      <div v-if="transferringRecord" class="sell-info">
        <div class="sell-name">{{ transferringRecord.name }}</div>
        <div class="sell-stock">{{ t("products.stockLabel") }}: {{ fmt(transferringRecord.quantity) }} {{ transferringRecord.unit }} — {{ transferringRecord.warehouse }}</div>
      </div>
      <a-form layout="vertical">
        <a-form-item :label="t('products.destinationLabel')">
          <a-select v-model:value="transferDestination" :placeholder="t('products.destinationPlaceholder')" :options="transferDestinationOptions" />
        </a-form-item>
        <a-form-item :label="t('products.transferQuantityLabel')">
          <a-input-number v-model:value="transferQty" :min="1" :max="transferringRecord?.quantity" style="width: 100%" />
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

  .search-input {
    width: 280px;
    max-width: 100%;
  }

  .no-image {
    background: var(--color-track);
    color: var(--color-text-faint);
  }

  .name-cell {
    display: flex;
    flex-direction: column;
  }

  .name-text {
    font-size: 13px;
    color: var(--color-text);
    font-weight: 500;
  }

  .name-code {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .image-field {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .inline-add {
    display: flex;
    gap: 8px;
    padding: 4px 8px;
  }

  .sell-info {
    margin-bottom: 16px;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--color-surface-alt);
  }

  .sell-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
  }

  .sell-stock {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .sell-total {
    font-size: 13px;
    color: var(--color-text);
    margin-top: 4px;
  }

  .readonly-quantity {
    padding: 4px 11px;
    font-size: 14px;
    color: var(--color-text);
  }

  .readonly-quantity-hint {
    font-size: 12px;
    color: var(--color-text-faint);
    margin-top: 2px;
  }

  .view-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .view-header {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .view-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 6px;
  }

  .view-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .view-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--color-surface-alt);
  }

  .view-field span {
    font-size: 11px;
    color: var(--color-text-muted);
  }

  .view-field b {
    font-size: 13px;
    color: var(--color-text);
    font-weight: 600;
  }

  @media (max-width: 480px) {
    .view-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 576px) {
    .toolbar-actions {
      width: 100%;
    }

    .search-input {
      width: 100%;
      order: -1;
    }

    .toolbar-actions .ant-btn {
      flex: 1;
    }
  }
</style>
