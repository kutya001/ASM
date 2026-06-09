<template>
  <WelcomeScreen
    v-if="showWelcome"
    :show="showWelcome"
    @close="dismissWelcome"
  />

  <div
    class="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      class="px-5 py-3.5 rounded-xl shadow-xl text-sm font-bold text-white flex items-center justify-between min-w-[280px]"
      :class="t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'"
    >
      <div class="flex items-center gap-3">
        <i
          class="bi text-lg"
          :class="
            t.type === 'error'
              ? 'bi-exclamation-triangle-fill'
              : 'bi-check-circle-fill'
          "
        ></i>
        <span>{{ t.msg }}</span>
      </div>
    </div>
  </div>

  <AuthView v-if="!user" />

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

          <div
            v-if="activeTab === 'records'"
            class="max-w-2xl mx-auto w-full space-y-4 pb-20"
          >
            <RecordsTab
              :filtered-records="filteredRecords"
              :is-filters-expanded="isFiltersExpanded"
              :active-statuses="activeStatuses"
              @toggle-status-filter="toggleStatus"
              :adv-filter-master="advFilterMaster"
              @update:adv-filter-master="advFilterMaster = $event"
              :adv-filter-service="advFilterService"
              @update:adv-filter-service="advFilterService = $event"
              :adv-filter-date="advFilterDate"
              @update:adv-filter-date="advFilterDate = $event"
              :adv-filter-brand="advFilterBrand"
              @update:adv-filter-brand="advFilterBrand = $event"
              :adv-filter-model="advFilterModel"
              @update:adv-filter-model="advFilterModel = $event"
              :masters-list="mastersList"
              :sorted-services="sortedServices"
              :user="user"
              :db="db"
              @clear-filters="clearAllFilters"
              @open-record="openRecordModal"
              @toggle-status="toggleStatusDirectly"
              @quick-payment="quickPaymentToggle"
              @set-all-statuses="setAllStatuses"
              @del-row="delRow"
              @mass-update="handleMassUpdate"
            />
          </div>

          <DashboardTab
            v-if="activeTab === 'dashboard'"
            :db="db"
            :user="user"
            :is-filters-expanded="isFiltersExpanded"
            :current-user-master-i-d="currentUserMasterID"
            :masters-list="mastersList"
            :sorted-services="sortedServices"
            :get-brand-name="getBrandName"
            :get-master-name="getMasterName"
            :get-service-name="getServiceName"
            :get-service-price="getServicePrice"
            :search-query="searchQuery"
          />

          <RefsTab
            v-if="activeTab === 'refs' && user.Role !== 'Master'"
            :db="db"
            :grouped-models="groupedModels"
            :get-brand-name="getBrandName"
            :search-query="searchQuery"
            @open-ref-modal="openRefModal"
            @open-bulk-modal="openBulkUploadModal"
            @del-row="delRow"
          />

          <UsersTab
            v-if="activeTab === 'users' && (user.Role === 'Superadmin' || user.Role === 'SenMaster')"
            :db="db"
            :search-query="searchQuery"
            :is-filters-expanded="isFiltersExpanded"
            @approve-user="approveUser"
            @open-user-config="openUserConfigModal"
          />
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

      <MobileNav :active-tab="activeTab" @update:active-tab="activeTab = $event" />
    </main>

    <ProfileModal ref="profileModal" :store="store" @logout="logout" @reopen-welcome="showWelcome = true" />
    <RecordModal ref="recordModal" :store="store" :user="user" />
    <UserConfigModal ref="userConfigModal" :store="store" @save="refreshUsers" />
    <RefModal ref="refModal" />
    <BulkUploadModal ref="bulkModal" />
    <GameContainer />
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useMainStore } from "./store";

import ProfileModal from "./components/modals/ProfileModal.vue";
import RecordModal from "./components/modals/RecordModal.vue";
import BulkUploadModal from "./components/modals/BulkUploadModal.vue";
import RefModal from "./components/modals/RefModal.vue";
import UserConfigModal from "./components/modals/UserConfigModal.vue";
import UsersTab from "./views/UsersTab.vue";
import RefsTab from "./views/RefsTab.vue";
import DashboardTab from "./views/DashboardTab.vue";
import RecordsTab from "./views/RecordsTab.vue";
import WelcomeScreen from "./views/WelcomeScreen.vue";
import AuthView from "./views/AuthView.vue";
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
    UsersTab,
    RefsTab,
    DashboardTab,
    RecordsTab,
    WelcomeScreen,
    AuthView,
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
    };
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
    isAllStatusesActive() {
      return this.activeStatuses && this.activeStatuses.length === 3;
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

    openProfileModal() {
      if (this.$refs.profileModal) {
        this.$refs.profileModal.open();
      }
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
  },
};
</script>
