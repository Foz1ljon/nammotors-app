<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRoute, useRouter } from "vue-router";
  import IconMenuFold from "~icons/ph/caret-line-left-duotone";
  import IconMenuUnfold from "~icons/ph/caret-line-right-duotone";
  import IconMenu from "~icons/ph/list-duotone";
  import IconUser from "~icons/ph/user-circle-duotone";
  import IconSun from "~icons/ph/sun-duotone";
  import IconMoon from "~icons/ph/moon-duotone";
  import IconFullscreen from "~icons/ph/corners-out-duotone";
  import IconFullscreenExit from "~icons/ph/arrows-in-duotone";
  import IconGlobe from "~icons/ph/globe-duotone";
  import IconBell from "~icons/ph/bell-duotone";
  import IconDoor from "~icons/ph/sign-out-duotone";
  import IconCross from "~icons/ph/x-circle-duotone";
  import IconWarning from "~icons/ph/warning-duotone";
  import { useAuthStore } from "@/stores/auth";
  import { useThemeStore } from "@/stores/theme";
  import { useLocaleStore } from "@/stores/locale";
  import { useProductsStore, type Product, type ProductCategory } from "@/stores/products";
  import type { PermissionKey } from "@/stores/employees";
  import { useIsMobile } from "@/composables/useIsMobile";
  import { useFullscreen } from "@/composables/useFullscreen";
  import type { MenuInfo } from "ant-design-vue/es/menu/src/interface";
  import SidebarContent from "./SidebarContent.vue";

  const { t } = useI18n();
  const collapsed = ref(false);
  const mobileMenuOpen = ref(false);
  const notifOpen = ref(false);
  const isMobile = useIsMobile();
  const route = useRoute();
  const router = useRouter();
  const auth = useAuthStore();
  const themeStore = useThemeStore();
  const localeStore = useLocaleStore();
  const productsStore = useProductsStore();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const selectedKeys = computed(() => [route.name as string]);

  const categoryPermission: Record<ProductCategory, PermissionKey> = {
    tayyor: "products.tayyor",
    yarim: "products.yarim",
    xomashyo: "products.xomashyo",
  };
  const categoryRoute: Record<ProductCategory, string> = {
    tayyor: "products-tayyor",
    yarim: "products-yarim",
    xomashyo: "products-xomashyo",
  };

  const notifications = computed(() =>
    productsStore.items
      .filter((p) => auth.hasPermission(categoryPermission[p.category]))
      .filter((p) => productsStore.statusOf(p) !== "yetarli")
      .sort((a, b) => a.quantity - b.quantity),
  );

  function goToNotification(p: Product) {
    notifOpen.value = false;
    router.push({ name: categoryRoute[p.category] });
  }

  watch(isMobile, (mobile) => {
    if (!mobile) mobileMenuOpen.value = false;
  });

  watch(
    () => route.fullPath,
    () => {
      mobileMenuOpen.value = false;
    },
  );

  function handleNavigate(key: string) {
    router.push({ name: key });
  }

  function handleTriggerClick() {
    if (isMobile.value) {
      mobileMenuOpen.value = true;
    } else {
      collapsed.value = !collapsed.value;
    }
  }

  function handleUserMenuClick({ key }: MenuInfo) {
    if (key === "logout") {
      auth.logout();
      router.push({ name: "login" });
    }
  }

  const pageTitle = computed(() => t((route.meta.titleKey as string) || "sidebar.dashboard"));

  function handleLocaleClick({ key }: MenuInfo) {
    localeStore.setLocale(key as "latin" | "cyrillic");
  }
</script>

<template>
  <a-layout class="root-layout">
    <a-layout-sider v-if="!isMobile" v-model:collapsed="collapsed" :trigger="null" collapsible width="248" theme="dark" class="desktop-sider">
      <SidebarContent :collapsed="collapsed" :selected-keys="selectedKeys" @navigate="handleNavigate" />
    </a-layout-sider>

    <a-drawer v-if="isMobile" v-model:open="mobileMenuOpen" placement="left" :width="248" :closable="false" :body-style="{ padding: 0 }" class="mobile-drawer">
      <SidebarContent :selected-keys="selectedKeys" show-close @navigate="handleNavigate" @close="mobileMenuOpen = false" />
    </a-drawer>

    <a-layout class="content-layout">
      <a-layout-header class="app-header">
        <div class="header-left">
          <component :is="isMobile ? IconMenu : collapsed ? IconMenuUnfold : IconMenuFold" class="collapse-trigger" @click="handleTriggerClick" />
          <span class="page-title">{{ pageTitle }}</span>
        </div>

        <div class="header-right">
          <a-dropdown trigger="click">
            <button type="button" class="icon-btn">
              <IconGlobe class="header-icon" />
            </button>
            <template #overlay>
              <a-menu @click="handleLocaleClick">
                <a-menu-item key="latin">{{ t("lang.latin") }}</a-menu-item>
                <a-menu-item key="cyrillic">{{ t("lang.cyrillic") }}</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-tooltip v-if="!isMobile" :title="isFullscreen ? t('header.exitFullscreen') : t('header.fullscreen')">
            <button type="button" class="icon-btn" @click="toggleFullscreen">
              <component :is="isFullscreen ? IconFullscreenExit : IconFullscreen" class="header-icon" />
            </button>
          </a-tooltip>

          <a-tooltip :title="themeStore.mode === 'dark' ? t('theme.light') : t('theme.dark')">
            <a-switch :checked="themeStore.mode === 'dark'" class="theme-switch" @change="themeStore.toggle()">
              <template #checkedChildren><IconMoon /></template>
              <template #unCheckedChildren><IconSun /></template>
            </a-switch>
          </a-tooltip>

          <a-popover v-model:open="notifOpen" trigger="click" placement="bottomRight" overlay-class-name="notif-popover">
            <template #title>
              <div class="notif-title">
                {{ t("header.notifications") }}
                <a-tag v-if="notifications.length" color="warning">{{ notifications.length }}</a-tag>
              </div>
            </template>
            <template #content>
              <div class="notif-list">
                <div v-if="!notifications.length" class="notif-empty">{{ t("header.noNotifications") }}</div>
                <div v-for="n in notifications" :key="n.id" class="notif-item" @click="goToNotification(n)">
                  <span class="notif-icon-badge" :class="productsStore.statusOf(n)">
                    <component :is="productsStore.statusOf(n) === 'tugagan' ? IconCross : IconWarning" />
                  </span>
                  <div class="notif-body">
                    <div class="notif-name">{{ n.name }}</div>
                    <div class="notif-meta">{{ productsStore.statusOf(n) === "tugagan" ? t("header.outOfStock") : t("header.lowStock") }} · {{ n.quantity }} {{ n.unit }}</div>
                  </div>
                </div>
              </div>
            </template>
            <button type="button" class="icon-btn">
              <a-badge :count="notifications.length" size="small">
                <IconBell class="header-icon" />
              </a-badge>
            </button>
          </a-popover>

          <a-dropdown>
            <div class="user-chip">
              <a-avatar class="flex! items-center! justify-center!" style="background-color: #0e5c97">
                <template #icon><IconUser /></template>
              </a-avatar>
              <div class="user-meta">
                <div class="user-role">{{ auth.user?.role }}</div>
              </div>
            </div>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="logout">
                  <template #icon><IconDoor /></template>
                  {{ t("header.logout") }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
  .root-layout {
    height: 100vh;
    overflow: hidden;
  }

  :deep(.ant-layout-sider.desktop-sider) {
    background: #0a2a43 !important;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  :deep(.mobile-drawer .ant-drawer-body) {
    background: #0a2a43;
  }

  .content-layout {
    height: 100vh;
    overflow: hidden;
  }

  .app-header {
    background: var(--color-surface);
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-border);
    flex: 0 0 auto;
    z-index: 10;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
  }

  .collapse-trigger {
    font-size: 18px;
    cursor: pointer;
    color: var(--color-text-secondary);
    flex: 0 0 auto;
  }

  .page-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 22px;
    flex: 0 0 auto;
  }

  .header-icon {
    font-size: 19px;
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .icon-btn:hover {
    background: var(--color-surface-alt);
  }

  .icon-btn:hover .header-icon {
    color: var(--color-primary, #0e5c97);
  }

  .theme-switch {
    background: var(--color-track);
  }

  .theme-switch.ant-switch-checked {
    background: #0e5c97;
  }

  .theme-switch :deep(.ant-switch-inner-checked),
  .theme-switch :deep(.ant-switch-inner-unchecked) {
    display: flex;
    align-items: center;
  }

  .theme-switch :deep(svg) {
    display: block;
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .user-role {
    font-size: 11px;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .notif-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--color-text);
  }

  .notif-list {
    width: 300px;
    max-height: 320px;
    overflow-y: auto;
    margin: -4px -12px;
  }

  .notif-empty {
    padding: 24px 12px;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 13px;
  }

  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .notif-item:hover {
    background: var(--color-surface-alt);
  }

  .notif-icon-badge {
    width: 30px;
    height: 30px;
    min-width: 30px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    margin-top: 1px;
  }

  .notif-icon-badge.tugagan {
    color: #e0483e;
    background: rgba(224, 72, 62, 0.12);
  }

  .notif-icon-badge.kam {
    color: #f2971d;
    background: rgba(242, 151, 29, 0.14);
  }

  .notif-name {
    font-size: 13px;
    color: var(--color-text);
    font-weight: 500;
    line-height: 1.3;
  }

  .notif-meta {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 2px;
  }

  .app-content {
    padding: 24px;
    flex: 1 1 auto;
    overflow-y: auto;
  }

  .page-fade-enter-active,
  .page-fade-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .page-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }

  .page-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    .app-header {
      padding: 0 12px;
    }

    .header-right {
      gap: 14px;
    }

    .user-meta {
      display: none;
    }

    .app-content {
      padding: 14px;
    }

    .page-title {
      max-width: 45vw;
    }
  }
</style>
