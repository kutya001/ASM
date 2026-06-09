<template>
  <div>
    <!-- Persistent & Uniform Header for Both Mobile and Desktop -->
    <header class="mx-4 md:mx-6 mt-4 mb-2 h-14 md:h-16 flex items-center justify-between shrink-0 z-20 select-none">
      
      <!-- Left side: Current Active Tab Indicator Badge -->
      <div class="flex items-center gap-2 bg-white shadow-md border border-slate-200/50 rounded-xl md:rounded-2xl px-3 h-11 md:h-13">
        <div class="w-7 h-7 md:w-8 md:h-8 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 shadow-xs shadow-indigo-100">
          <i class="bi text-white text-[11px] md:text-sm" :class="getTabIcon(activeTab)"></i>
        </div>
        <span class="font-black text-[10px] md:text-xs.5 tracking-tight text-slate-805 leading-none font-heading uppercase">
          {{ getTabTitle(activeTab) }}
        </span>
      </div>

      <!-- Right side: Control Center (ordered from right to left!) -->
      <div v-if="user" class="flex items-center gap-1 bg-white shadow-md border border-slate-200/50 rounded-xl md:rounded-2xl p-1 h-11 md:h-13">
        
        <!-- 4. Filter Toggle (tune icon) - Visible on all interactive tabs except RefTab -->
        <button
          v-if="activeTab !== 'refs'"
          @click="$emit('toggle-filters')"
          class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition cursor-pointer"
          :class="isFiltersExpanded ? 'bg-indigo-50 text-indigo-700 font-bold' : ''"
          title="Панель фильтров"
          id="btn-header-filters"
        >
          <span class="material-symbols-outlined text-[18px] md:text-[20px]">tune</span>
        </button>

        <!-- 3. Search Toggle & Input Field - Available on ALL tabs -->
        <div class="relative flex items-center" id="search-control-container">
          <!-- Slide open input box -->
          <transition name="expand">
            <input
              v-if="localSearchExpanded"
              ref="searchInput"
              :value="searchQuery"
              @input="onSearchInput"
              class="w-24 sm:w-44 md:w-52 h-8 md:h-10 pl-8 pr-7 rounded-lg md:rounded-xl border border-slate-200 bg-slate-50 text-[10px] md:text-xs font-semibold text-slate-705 outline-none focus:bg-white focus:border-indigo-550 transition-all mr-1"
              :placeholder="getSearchPlaceholder(activeTab)"
            />
          </transition>
          
          <!-- Search Button -->
          <button
            @click="toggleSearch"
            class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition cursor-pointer"
            :class="localSearchExpanded ? 'text-indigo-600 bg-slate-50' : ''"
            :title="localSearchExpanded ? 'Скрыть поиск' : 'Поиск по разделу'"
            id="btn-header-search"
          >
            <span class="material-symbols-outlined text-[18px] md:text-[20px]">
              {{ localSearchExpanded ? 'close' : 'search' }}
            </span>
          </button>
        </div>

        <!-- Vertical Separator Divider -->
        <div class="h-5 w-px bg-slate-200 mx-0.5"></div>

        <!-- 2. Profile Access with Username Indicator & Initials Avatar -->
        <button
          @click="$emit('open-profile')"
          class="flex items-center gap-1.5 hover:bg-slate-50 p-0.5 rounded-lg md:rounded-xl transition cursor-pointer h-8 md:h-10"
          title="Открыть настройки профиля"
          id="btn-header-profile"
        >
          <!-- Username and Role indicator labels on desktop/tablets -->
          <div class="text-right hidden sm:block select-none px-1">
            <div class="text-[10px] md:text-[11px] font-black text-slate-800 leading-tight">
              {{ user.Username }}
            </div>
            <div class="text-[8px] font-bold text-indigo-650 uppercase tracking-wider leading-tight mt-0.5">
              {{ getRoleLabel(user.Role) }}
            </div>
          </div>
          
          <!-- Initials badge circle -->
          <div
            class="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-indigo-50/50 border border-indigo-150/40 flex items-center justify-center text-indigo-700 font-extrabold text-[10px] md:text-xs uppercase"
          >
            {{ user.Username ? user.Username.slice(0, 2).toUpperCase() : "?" }}
          </div>
        </button>

        <!-- Vertical Separator Divider -->
        <div class="h-5 w-px bg-slate-200 mx-0.5"></div>

        <!-- 1. Sync State Indicator Button (Far right edge of panel) -->
        <div
          class="flex items-center justify-center shrink-0 px-2 h-8 md:h-10 cursor-pointer hover:bg-slate-50 rounded-lg md:rounded-xl transition gap-1"
          title="База данных в сети (нажмите для принудительной синхронизации)"
          @click="forceSyncRefresh"
          id="btn-header-sync"
        >
          <template v-if="syncStatus === 'synced' || syncStatus === 'legacy'">
            <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span class="material-symbols-outlined text-emerald-500 text-[16px] md:text-[20px]">cloud_done</span>
          </template>
          <template v-else-if="syncStatus === 'checking'">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span class="material-symbols-outlined text-indigo-500 text-[16px] md:text-[20px] animate-pulse">cloud_sync</span>
          </template>
          <template v-else-if="syncStatus === 'updating'">
            <span class="material-symbols-outlined text-indigo-600 text-[16px] md:text-[20px] animate-spin">sync</span>
          </template>
          <template v-else-if="syncStatus === 'error'">
            <span class="material-symbols-outlined text-red-500 text-[16px] md:text-[20px] font-bold animate-pulse">cloud_off</span>
          </template>
        </div>

      </div>
    </header>
  </div>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  props: {
    activeTab: { type: String, required: true },
    searchQuery: { type: String, default: "" },
    isSearchExpanded: { type: Boolean, default: false },
    isFiltersExpanded: { type: Boolean, default: false },
    isSyncing: { type: Boolean, default: false },
  },
  emits: [
    "update:searchQuery",
    "update:isSearchExpanded",
    "update:isFiltersExpanded",
    "toggle-filters",
    "open-profile",
  ],
  data() {
    return {
      localSearchExpanded: this.isSearchExpanded,
    };
  },
  watch: {
    isSearchExpanded(v) {
      this.localSearchExpanded = v;
    },
    activeTab() {
      // Close search when route switches
      this.closeSearch();
    },
  },
  computed: {
    user() {
      const store = useMainStore();
      return store.user;
    },
    syncStatus() {
      const store = useMainStore();
      return store.syncStatus;
    },
  },
  methods: {
    onSearchInput(e) {
      this.$emit("update:searchQuery", e.target.value);
    },
    forceSyncRefresh() {
      const store = useMainStore();
      store.loadInitialData();
    },
    getTabTitle(tab) {
      switch (tab) {
        case "dashboard":
          return "Аналитика";
        case "records":
          return "Записи";
        case "refs":
          return "Справочники";
        case "users":
          return "Персонал";
        case "applications":
          return "Заявки";
        default:
          return "AutoService";
      }
    },
    getTabIcon(tab) {
      switch (tab) {
        case "dashboard":
          return "bi-pie-chart-fill";
        case "records":
          return "bi-journal-text";
        case "refs":
          return "bi-tools";
        case "users":
          return "bi-people-fill";
        case "applications":
          return "bi-envelope-paper-fill";
        default:
          return "bi-car-front-fill";
      }
    },
    getRoleLabel(role) {
      switch (role) {
        case "Superadmin":
          return "Админ";
        case "SenMaster":
          return "Ст.Мастер";
        default:
          return "Мастер";
      }
    },
    getSearchPlaceholder(tab) {
      switch (tab) {
        case "refs":
          return "Поиск услуг...";
        case "applications":
          return "Поиск заявок...";
        case "users":
          return "Поиск по штату...";
        case "records":
          return "Поиск госномер/имя...";
        default:
          return "Искать...";
      }
    },
    toggleSearch() {
      if (this.localSearchExpanded) {
        this.closeSearch();
      } else {
        this.openSearch();
      }
    },
    openSearch() {
      this.localSearchExpanded = true;
      this.$emit("update:isSearchExpanded", true);
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },
    closeSearch() {
      this.localSearchExpanded = false;
      this.$emit("update:isSearchExpanded", false);
      this.$emit("update:searchQuery", "");
    },
  },
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: max-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  max-width: 0;
  opacity: 0;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-right: 0 !important;
  border-width: 0 !important;
}
.expand-enter-to,
.expand-leave-from {
  max-width: 250px;
  opacity: 1;
}
</style>
