<template>
  <WelcomeScreen
    v-if="showWelcome && user"
    :show="showWelcome"
    @close="dismissWelcome"
  />

  <div
    class="fixed top-4 right-4 z-[9999] flex flex-col gap-1.5 pointer-events-none"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      class="px-3.5 py-1.5 rounded-lg shadow-md text-xs font-semibold text-white flex items-center gap-2 max-w-[280px]"
      :class="t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'"
    >
      <i
        class="bi text-sm shrink-0"
        :class="
          t.type === 'error'
            ? 'bi-exclamation-triangle-fill'
            : 'bi-check-circle-fill'
        "
      ></i>
      <span class="leading-tight">{{ t.msg }}</span>
    </div>
  </div>

  <!-- If login view, just render router-view without layout -->
  <div v-if="!user || $route.name === 'login'" class="w-full h-screen bg-slate-900">
    <router-view />
  </div>

  <!-- Blocking Screen if subscription has expired -->
  <div
    v-else-if="isSubscriptionExpired"
    class="w-full h-screen bg-slate-900 flex items-center justify-center p-4 animate-fade-in"
  >
    <div class="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl border border-slate-100 space-y-6">
      <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <span class="material-symbols-outlined text-3xl font-bold">lock</span>
      </div>
      <div>
        <h3 class="font-heading text-lg font-black text-slate-800 uppercase tracking-wider">Доступ заблокирован</h3>
        <p class="text-xs font-semibold text-slate-550 mt-2 leading-relaxed">
          Срок действия вашей подписки истек. Для разблокировки личного кабинета оплатите подписку и отправьте чек.
        </p>
      </div>
      
      <!-- Subscription status card -->
      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-left">
        <div>
          <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Организация</div>
          <div class="text-xs font-black text-slate-850">{{ userOrganizationName }}</div>
        </div>
        <span class="text-[9px] font-black uppercase bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-150/30">
          {{ subscriptionRemainingText }}
        </span>
      </div>

      <div class="flex flex-col gap-2 pt-2">
        <button
          v-if="user && user.Role === 'SenMaster'"
          @click="openProfileModal('organization', true)"
          class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 border-none cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">autorenew</span>
          Заявка на продление подписки
        </button>
        <a
          :href="payWhatsAppLink"
          target="_blank"
          class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 border-none decoration-none text-center"
        >
          <span class="material-symbols-outlined text-[16px]">payments</span>
          Оплатить через WhatsApp
        </a>
        <button
          v-if="user && user.Role === 'SenMaster'"
          @click="openProfileModal('organization', false)"
          class="w-full py-2.5 bg-transparent hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs tracking-wider uppercase transition border-none cursor-pointer"
        >
          Профиль организации
        </button>
        <button
          @click="logout"
          class="w-full py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs tracking-wider uppercase transition border-none bg-transparent cursor-pointer"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-slate-900 overflow-hidden"
  >
    <Sidebar :active-tab="activeTab" @update:active-tab="activeTab = $event" @logout="logout" @reopen-welcome="showWelcome = true" />

    <main
      class="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0"
    >
      <Header
        :active-tab="activeTab"
        :refs-sub-tab-title="refsSubTabTitle"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        :is-search-expanded="isSearchExpanded"
        @update:is-search-expanded="isSearchExpanded = $event"
        :is-filters-expanded="isFiltersExpanded"
        @update:is-filters-expanded="isFiltersExpanded = $event"
        :is-syncing="isSyncing"
        :is-all-statuses-active="isAllStatusesActive"
        @toggle-filters="isFiltersExpanded = !isFiltersExpanded"
        @set-all-statuses="setAllStatuses"
        @open-profile="openProfileModal"
      />

      <div
        class="flex-1 px-3 pt-1.5 pb-4 md:px-8 overflow-y-auto w-full relative z-0"
      >
        <div v-if="!loading" class="max-w-7xl mx-auto space-y-4 md:space-y-6">
          <div
            v-if="initError"
            class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200"
          >
            <strong>Ошибка при загрузке данных:</strong> {{ initError }}
          </div>

          <router-view v-slot="{ Component }">
            <component 
              :is="Component"
              v-bind="routeProps"
              @toggle-status-filter="toggleStatus"
              @update:adv-filter-master="advFilterMaster = $event"
              @update:adv-filter-service="advFilterService = $event"
              @update:adv-filter-date="advFilterDate = $event"
              @update:adv-filter-brand="advFilterBrand = $event"
              @update:adv-filter-model="advFilterModel = $event"
              @clear-filters="clearAllFilters"
              @open-record="openRecordModal"
              @toggle-status="toggleStatusDirectly"
              @quick-payment="quickPaymentToggle"
              @set-all-statuses="setAllStatuses"
              @del-row="delRow"
              @mass-update="handleMassUpdate"
              @open-ref-modal="openRefModal"
              @open-bulk-modal="openBulkUploadModal"
              @import-modal-toggle="isImportModalOpen = $event"
              @sub-tab-changed="refsSubTabTitle = $event"
              @approve-user="approveUser"
              @open-user-config="openUserConfigModal"
              ref="activeTabRef"
            />
          </router-view>
        </div>

        <div
          v-else
          class="flex flex-col justify-center items-center h-full min-h-[50vh]"
        >
          <div
            class="spinner-border text-indigo-600 mb-4 border-4"
            style="width: 3rem; height: 3rem"
            role="status"
          ></div>
          <span
            class="text-slate-500 font-bold tracking-wider text-sm uppercase"
            >Синхронизация данных...</span
          >
        </div>
      </div>

      <MobileNav v-if="!isImportModalOpen" :active-tab="activeTab" @update:active-tab="activeTab = $event" />
    </main>

    <ProfileModal ref="profileModal" :store="store" @logout="logout" @reopen-welcome="showWelcome = true" @open-tickets-create="handleOpenTicketsCreate" @open-tickets="activeTab = 'tickets'" />
    <RecordModal ref="recordModal" :store="store" :user="user" />
    <UserConfigModal ref="userConfigModal" :store="store" @save="refreshUsers" />
    <RefModal ref="refModal" />
    <BulkUploadModal ref="bulkModal" />
    <GameContainer />

    <!-- Floating Action Button (FAB) for ergonomics -->
    <button
      v-if="showFAB && !isImportModalOpen"
      @click="handleFABClick"
      class="fixed bottom-24 right-6 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/35 border-none cursor-pointer active:scale-95 transition-all"
      id="app-mobile-fab"
    >
      <span class="material-symbols-outlined text-[26px]">add</span>
    </button>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useMainStore } from "./store";
import { getSubscriptionDaysLeft } from "./utils/helpers";

import ProfileModal from "./components/modals/ProfileModal.vue";
import RecordModal from "./components/modals/RecordModal.vue";
import BulkUploadModal from "./components/modals/BulkUploadModal.vue";
import RefModal from "./components/modals/RefModal.vue";
import UserConfigModal from "./components/modals/UserConfigModal.vue";
import WelcomeScreen from "./views/WelcomeScreen.vue";
import Sidebar from "./components/layout/Sidebar.vue";
import Header from "./components/layout/Header.vue";
import MobileNav from "./components/layout/MobileNav.vue";
import GameContainer from "./games/GameContainer.vue";


export default {
  components: {
    ProfileModal,
    RecordModal,
    BulkUploadModal,
    RefModal,
    UserConfigModal,
    WelcomeScreen,
    Sidebar,
    Header,
    MobileNav,
    GameContainer,
  },
  data() {
    return {
      showWelcome: !sessionStorage.getItem("welcome_dismissed"),
      activeTab: "records",
      isSaving: false,
      searchQuery: "",
      isSearchExpanded: false,
      isFiltersExpanded: false,
      activeStatuses: ["Открыт"],
      advFilterMaster: "",
      advFilterService: "",
      advFilterDate: "",
      advFilterBrand: "",
      advFilterModel: "",
      refsSubTabTitle: "",
      isImportModalOpen: false,
    };
  },
  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser && newUser.Role === 'Superadmin' && this.activeTab === 'records') {
          this.activeTab = 'dashboard';
        }
      }
    },
    activeTab(newTab) {
      this.isImportModalOpen = false;
      if (this.$route && this.$route.name !== newTab) {
        this.$router.push({ name: newTab }).catch(() => {});
      }
    },
    $route(to) {
      if (to && to.name && this.activeTab !== to.name) {
        this.activeTab = to.name;
      }
    }
  },
  computed: {
    ...mapState(useMainStore, [
      "user",
      "db",
      "syncQueue",
      "isSyncing",
      "toasts",
      "initError",
      "loading",
      "mastersList",
      "currentUserMasterID",
      "sortedBrands",
      "sortedServices",
    ]),
    routeProps() {
      return {
        filteredRecords: this.filteredRecords,
        isFiltersExpanded: this.isFiltersExpanded,
        activeStatuses: this.activeStatuses,
        advFilterMaster: this.advFilterMaster,
        advFilterService: this.advFilterService,
        advFilterDate: this.advFilterDate,
        advFilterBrand: this.advFilterBrand,
        advFilterModel: this.advFilterModel,
        mastersList: this.mastersList,
        sortedServices: this.sortedServices,
        user: this.user,
        db: this.db,
        currentUserMasterID: this.currentUserMasterID,
        getBrandName: this.getBrandName,
        getMasterName: this.getMasterName,
        getServiceName: this.getServiceName,
        getServicePrice: this.getServicePrice,
        searchQuery: this.searchQuery,
        groupedModels: this.groupedModels,
      };
    },
    isAllStatusesActive() {
      return this.activeStatuses && this.activeStatuses.length === 3;
    },
    isSubscriptionExpired() {
      if (!this.user || this.user.Role === 'Superadmin') return false;
      const org = (this.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      if (!org) return false;
      if (!org.SubscriptionEndsAt) return true;
      return new Date(org.SubscriptionEndsAt) < new Date();
    },
    userOrganizationName() {
      if (!this.user) return '';
      const org = (this.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      return org ? org.Name : '';
    },
    payWhatsAppLink() {
      if (!this.user) return '';
      const orgName = this.userOrganizationName || '';
      const org = (this.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      let subInfoText = "";
      if (org) {
        const info = getSubscriptionDaysLeft(org.SubscriptionEndsAt);
        subInfoText = info.text;
      }
      const message = `Прошу продлить подписку ${orgName}. ${subInfoText}.`;
      const text = encodeURIComponent(message);
      return `https://wa.me/996500888268?text=${text}`;
    },
    subscriptionRemainingText() {
      if (!this.user) return '';
      const org = (this.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      if (!org) return 'не оплачена';
      const info = getSubscriptionDaysLeft(org.SubscriptionEndsAt);
      return info.text;
    },
    filteredRecords() {
      let d = [...this.db.records].sort(
        (a, b) => new Date(b.StartTime || 0) - new Date(a.StartTime || 0),
      );

      if (this.user && this.user.Role === "Master") {
        let myMid = this.currentUserMasterID;
        d = d.filter((r) => r.MasterID === myMid);
      }

      if (this.searchQuery) {
        let q = this.searchQuery.toLowerCase();
        d = d.filter((r) => {
          let s = (
            (r.CarNumber || "") +
            " " +
            (r.ClientName || "")
          ).toLowerCase();
          return s.includes(q);
        });
      }
      if (this.activeStatuses && this.activeStatuses.length > 0) {
        d = d.filter((r) => this.activeStatuses.includes(r.Status));
      } else {
        d = [];
      }

      if (this.advFilterMaster) {
        d = d.filter(
          (r) => String(r.MasterID) === String(this.advFilterMaster),
        );
      }
      if (this.advFilterBrand) {
        d = d.filter((r) => String(r.BrandID) === String(this.advFilterBrand));
      }
      if (this.advFilterModel) {
        d = d.filter((r) => String(r.ModelID) === String(this.advFilterModel));
      }
      if (this.advFilterService) {
        d = d.filter((r) => {
          let s =
            typeof r.ServicesJSON === "string"
              ? JSON.parse(r.ServicesJSON || "[]")
              : r.ServicesJSON || [];
          return s.includes(this.advFilterService);
        });
      }
      if (this.advFilterDate) {
        d = d.filter((r) => {
          if (!r.StartTime) return false;
          return r.StartTime.startsWith(this.advFilterDate);
        });
      }

      return d;
    },
    groupedModels() {
      let brands = this.sortedBrands || [];
      let models = this.db.models || [];
      let result = brands.map((b) => {
        let bModels = models.filter((m) => String(m.BrandID) === String(b.ID));
        let sortedBModels = [...bModels].sort((x, y) =>
          String(x.Name || "")
            .toLowerCase()
            .localeCompare(String(y.Name || "").toLowerCase()),
        );
        return {
          brand: b,
          models: sortedBModels,
        };
      });

      // Unassigned models
      let unassigned = models.filter(
        (m) =>
          !m.BrandID || !brands.find((b) => String(b.ID) === String(m.BrandID)),
      );
      if (unassigned.length > 0) {
        result.push({
          brand: { ID: "", Name: "Без марки" },
          models: unassigned.sort((x, y) =>
            String(x.Name || "")
              .toLowerCase()
              .localeCompare(String(y.Name || "").toLowerCase()),
          ),
        });
      }
      return result;
    },
    showFAB() {
      if (!this.user) return false;
      if (this.activeTab === 'refs') {
        if (this.user.Role === 'Master') return false;
        if (this.refsSubTabTitle === 'Автомобили') return false;
      }
      return ["records", "refs", "users"].includes(this.activeTab);
    }
  },
  mounted() {
    this.loadWelcomeScreenInfo();
    try {
      let savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        this.user = JSON.parse(savedUser);
        this.loadInitialData();
      }
    } catch (e) {
      console.error("Failed to parse saved user", e);
      localStorage.removeItem("currentUser");
    }
  },
  methods: {
    ...mapActions(useMainStore, [
      "showToast",
      "loadWelcomeScreenInfo",
      "loadInitialData",
      "dispatchSync",
      "processSyncQueue",
      "logout",
    ]),
    dismissWelcome() {
      this.showWelcome = false;
      sessionStorage.setItem("welcome_dismissed", "true");
    },

    // HELPERS
    getBrandName(id) {
      let b = this.db.brands.find((x) => x.ID == id);
      return b ? b.Name : "—";
    },
    getMasterName(id) {
      let m = this.db.users.find((x) => x.ID == id);
      return m ? m.Name || m.Username : "Не назначен";
    },
    getServiceName(id) {
      let s = this.db.services.find((x) => x.ID == id);
      return s ? s.Name : "Н/Д";
    },
    getServicePrice(id) {
      let s = this.db.services.find((x) => x.ID == id);
      return s ? s.Price || 0 : 0;
    },

    clearAllFilters() {
      this.advFilterMaster = "";
      this.advFilterService = "";
      this.advFilterDate = "";
      this.advFilterBrand = "";
      this.advFilterModel = "";
      this.activeStatuses = ["Открыт", "Выполнен", "Отменён"];
    },
    toggleStatus(status) {
      this.activeStatuses = [status];
    },
    setAllStatuses() {
      this.activeStatuses = ["Открыт", "Выполнен", "Отменён"];
    },
    async quickStatusChange(record, newStatus) {
      try {
        if (
          this.user &&
          this.user.Role === "Master" &&
          record.Status !== "Открыт"
        ) {
          throw new Error("Мастер не может изменять статус закрытых записей");
        }
        let payload = Object.assign({}, record);
        payload.Status = newStatus;

        let idx = this.db.records.findIndex((x) => x.ID === record.ID);
        if (idx > -1) {
          if (newStatus === "Выполнен" && record.Status !== "Выполнен")
            payload.EndTime = new Date().toISOString();
          else if (newStatus !== "Выполнен") payload.EndTime = "";
          this.db.records[idx] = payload;
        }

        this.dispatchSync("updateRecord", payload);
        this.showToast(`Статус обновлен на "${newStatus}"`);
      } catch (e) {
        this.showToast(e.message, "error");
      }
    },

    async quickPaymentToggle(record) {
      try {
        if (
          this.user &&
          this.user.Role === "Master" &&
          record.Status !== "Открыт"
        ) {
          throw new Error("Мастер не может изменять оплату закрытых записей");
        }
        let payload = Object.assign({}, record);
        payload.IsPaid = !(
          record.IsPaid === true ||
          String(record.IsPaid).toUpperCase() === "TRUE"
        );

        let idx = this.db.records.findIndex((x) => x.ID === record.ID);
        if (idx > -1) {
          this.db.records[idx] = payload;
        }

        this.dispatchSync("updateRecord", payload);
        this.showToast(
          payload.IsPaid
            ? 'Запись отмечена как "Оплачено"'
            : 'Запись отмечена как "Не оплачено"',
        );
      } catch (e) {
        this.showToast(e.message, "error");
      }
    },

    async toggleStatusDirectly(record) {
      let nextStatus = "Открыт";
      if (record.Status === "Открыт") {
        nextStatus = "Выполнен";
      } else if (record.Status === "Выполнен") {
        nextStatus = "Отменён";
      } else {
        nextStatus = "Открыт";
      }
      await this.quickStatusChange(record, nextStatus);
    },

    async handleMassUpdate({ ids, status, isPaid, masterId, brandId, modelId }) {
      if (!this.user || this.user.Role !== "Superadmin") {
        this.showToast("Доступно только администратору", "error");
        return;
      }
      try {
        let count = 0;
        for (const id of ids) {
          let idx = this.db.records.findIndex((x) => x.ID === id);
          if (idx > -1) {
            let record = this.db.records[idx];
            let payload = Object.assign({}, record);
            let hasChanged = false;

            if (status) {
              payload.Status = status;
              if (status === "Выполнен" && record.Status !== "Выполнен") {
                payload.EndTime = new Date().toISOString();
              } else if (status !== "Выполнен") {
                payload.EndTime = "";
              }
              hasChanged = true;
            }

            if (isPaid !== "") {
              payload.IsPaid = isPaid === "true" || isPaid === true;
              hasChanged = true;
            }

            if (masterId !== "") {
              payload.MasterID = masterId === "REMOVE" ? "" : masterId;
              hasChanged = true;
            }

            if (brandId !== "") {
              payload.BrandID = brandId;
              payload.ModelID = modelId || "";
              hasChanged = true;
            }

            if (hasChanged) {
              this.db.records[idx] = payload;
              this.dispatchSync("updateRecord", payload);
              count++;
            }
          }
        }
        this.showToast(`Массовое обновление заверчено. Изменено записей: ${count}`);
      } catch (e) {
        this.showToast(e.message, "error");
      }
    },

    openProfileModal(tab = "personal", openRenewal = false) {
      if (this.$refs.profileModal) {
        this.$refs.profileModal.open(tab, openRenewal);
      }
    },
    handleOpenTicketsCreate() {
      this.activeTab = 'tickets';
      this.$nextTick(() => {
        if (this.$refs.activeTabRef && typeof this.$refs.activeTabRef.openCreateModal === 'function') {
          this.$refs.activeTabRef.openCreateModal();
        }
      });
    },
    openRecordModal(record = null, application = null) {
      if (this.$refs.recordModal) {
        this.$refs.recordModal.open(record, application);
      }
    },
    openRefModal(tab, item = null) {
      if (this.$refs.refModal) {
        this.$refs.refModal.open(tab, item);
      }
    },
    openBulkUploadModal() {
      if (this.$refs.bulkModal) {
        this.$refs.bulkModal.open();
      }
    },
    async delRow(sheet, id, tab) {
      if (confirm("Удалить эту запись без возможности восстановления?")) {
        try {
          if (this.db[tab]) {
            this.db[tab] = this.db[tab].filter((x) => x.ID !== id);
          }
          this.dispatchSync("deleteRow", id, sheet);
          this.showToast("Запись удалена");
        } catch (e) {
          this.showToast(e.message, "error");
        }
      }
    },

    // СУПЕРАДМИН
    async approveUser(id) {
      try {
        const targetUser = this.db.users.find((x) => x.ID === id);
        if (!targetUser) return;

        const orgId = targetUser.OrganizationID;
        const org = (this.db.organizations || []).find(o => String(o.ID) === String(orgId));
        if (org) {
          const maxUsers = org.MaxUsers || 3;
          const approvedCount = this.db.users.filter(u => u.OrganizationID === orgId && u.Status === 'Approved').length;
          if (approvedCount >= maxUsers) {
            throw new Error(`Превышен лимит сотрудников для вашей организации (лимит: ${maxUsers} чел.). Обратитесь к супер-администратору для расширения лимита.`);
          }
        }

        let idx = this.db.users.findIndex((x) => x.ID === id);
        if (idx > -1) {
          this.db.users[idx].Status = "Approved";
        }
        this.dispatchSync(
          "approveUser",
          { id: id, data: { Status: "Approved" } },
          "Users",
        );
        this.showToast("Пользователь подтвержден, синхронизация...");
      } catch (e) {
        this.showToast(e.message, "error");
      }
    },
    openUserConfigModal(u) {
      if (this.$refs.userConfigModal) {
        this.$refs.userConfigModal.open(u);
      }
    },
    handleFABClick() {
      if (this.activeTab === "records") {
        this.openRecordModal(-1);
      } else if (this.activeTab === "refs") {
        if (this.$refs.activeTabRef && typeof this.$refs.activeTabRef.handleFABAction === 'function') {
          this.$refs.activeTabRef.handleFABAction();
        }
      } else if (this.activeTab === "users") {
        this.openUserConfigModal(-1);
      }
    }
  },
};
</script>
