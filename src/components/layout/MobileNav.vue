<template>
  <nav
    class="md:hidden fixed bottom-4.5 left-4.5 right-4.5 flex gap-1 rounded-2xl shadow-[0_12px_24px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] border border-slate-200/50 bg-white/70 backdrop-blur-md p-1.5 z-30 select-none"
  >
    <button
      @click="setTab('dashboard')"
      class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none"
      :class="
        activeTab === 'dashboard'
          ? 'bg-indigo-50 text-indigo-600 font-bold'
          : 'text-slate-400 hover:text-slate-600 bg-transparent'
      "
    >
      <div class="flex h-6 items-center justify-center">
        <span
          class="material-symbols-outlined text-[19px]"
          :style="
            activeTab === 'dashboard'
              ? 'font-variation-settings: \'FILL\' 1;'
              : ''
          "
          >monitoring</span
        >
      </div>
      <span
        class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1"
        >Аналитика</span
      >
    </button>
    <button
      v-if="user && user.Role !== 'Superadmin'"
      @click="setTab('records')"
      class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none"
      :class="
        activeTab === 'records'
          ? 'bg-indigo-50 text-indigo-600 font-bold'
          : 'text-slate-400 hover:text-slate-600 bg-transparent'
      "
    >
      <div class="flex h-6 items-center justify-center">
        <span
          class="material-symbols-outlined text-[19px]"
          :style="
            activeTab === 'records'
              ? 'font-variation-settings: \'FILL\' 1;'
              : ''
          "
          >list_alt</span
        >
      </div>
      <span
        class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1"
        >Записи</span
      >
    </button>
    <button
      v-if="user && user.Role !== 'Master'"
      @click="setTab('refs', 'grid')"
      class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none"
      :class="
        activeTab === 'refs'
          ? 'bg-indigo-50 text-indigo-600 font-bold'
          : 'text-slate-400 hover:text-slate-600 bg-transparent'
      "
    >
      <div class="flex h-6 items-center justify-center">
        <span
          class="material-symbols-outlined text-[19px]"
          :style="
            activeTab === 'refs' ? 'font-variation-settings: \'FILL\' 1;' : ''
          "
          >menu_book</span
        >
      </div>
      <span
        class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1"
        >База</span
      >
    </button>
    <button
      v-if="user && (user.Role === 'Superadmin' || user.Role === 'SenMaster')"
      @click="setTab('users')"
      class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none"
      :class="
        activeTab === 'users'
          ? 'bg-indigo-50 text-indigo-600 font-bold'
          : 'text-slate-400 hover:text-slate-600 bg-transparent'
      "
    >
      <div class="flex h-6 items-center justify-center">
        <span
          class="material-symbols-outlined text-[19px]"
          :style="
            activeTab === 'users' ? 'font-variation-settings: \'FILL\' 1;' : ''
          "
          >groups</span
        >
      </div>
      <span
        class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1"
        >Штат</span
      >
    </button>
    <button
      v-if="user && user.Role === 'Superadmin'"
      @click="setTab('organizations')"
      class="flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none"
      :class="
        activeTab === 'organizations'
          ? 'bg-indigo-50 text-indigo-600 font-bold'
          : 'text-slate-400 hover:text-slate-600 bg-transparent'
      "
    >
      <div class="flex h-6 items-center justify-center">
        <span
          class="material-symbols-outlined text-[19px]"
          :style="
            activeTab === 'organizations' ? 'font-variation-settings: \'FILL\' 1;' : ''
          "
          >domain</span
        >
      </div>
      <span
        class="text-[9px] font-bold tracking-wider uppercase leading-none mt-1"
        >Орг.</span
      >
    </button>
  </nav>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  props: {
    activeTab: {
      type: String,
      required: true,
    },
  },
  emits: ["update:activeTab", "update:refTab"],
  computed: {
    user() {
      const store = useMainStore();
      return store.user;
    },
  },
  methods: {
    setTab(tab, refSubTab = null) {
      this.$emit("update:activeTab", tab);
      if (refSubTab) {
        this.$emit("update:refTab", refSubTab);
      }
    },
  },
};
</script>
