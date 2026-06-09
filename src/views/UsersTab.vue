<template>
  <div class="space-y-4 max-w-2xl mx-auto w-full pb-20 animate-fade-in">
    <!-- Header info line -->
    <div class="flex justify-between items-center px-1">
      <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[16px] text-indigo-500">group</span>
        Штат автосервиса
      </h2>
      <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/40">
        {{ filteredUsers.length }} из {{ db.users ? db.users.length : 0 }} чел.
      </span>
    </div>

    <!-- Info Banner for SenMaster (Invite instructions) -->
    <div v-if="store.user && store.user.Role === 'SenMaster'" class="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl shadow-sm space-y-2">
      <h4 class="text-xs font-black text-indigo-800 uppercase tracking-wider font-heading flex items-center gap-1.5 m-0">
        <span class="material-symbols-outlined text-[15px]">send_to_mobile</span>
        Приглашение мастеров
      </h4>
      <p class="text-[11px] text-indigo-700 leading-relaxed font-semibold m-0">
        Для приглашения новых сотрудников в вашу организацию попросите их зарегистрироваться по ссылке и выбрать вашу организацию:
        <strong class="text-indigo-950 font-black">"{{ organizationName }}"</strong>.
      </p>
    </div>

    <!-- Collapsible Advanced Filters -->
    <div v-if="isFiltersExpanded" class="bg-white border border-slate-150 p-3 rounded-2xl shadow-sm space-y-3 animate-fade-in">
      <div>
        <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Роль</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="r in filteredRolesList"
            :key="r.val"
            @click="selectedRole = r.val"
            class="px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer"
            :class="selectedRole === r.val ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
          >
            {{ r.lbl }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Допуск к системе</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="s in statuses"
            :key="s.val"
            @click="selectedStatus = s.val"
            class="px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer"
            :class="selectedStatus === s.val ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'"
          >
            {{ s.lbl }}
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-2.5">
      <div
        v-for="u in filteredUsers"
        :key="u.ID"
        class="bg-white border border-slate-150/60 hover:border-indigo-150/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div class="flex items-start gap-3 min-w-0 flex-1">
          <!-- Compact initials avatar -->
          <div
            class="w-10 h-10 rounded-xl bg-slate-550/5 flex items-center justify-center text-indigo-700 font-extrabold text-xs tracking-tight shrink-0 border border-slate-200/50 uppercase select-none mt-0.5"
          >
            {{ u.Name ? u.Name.slice(0, 2) : u.Username.slice(0, 2) }}
          </div>
          <!-- Name and detailed badges -->
          <div class="min-w-0 flex-1 space-y-0.5">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h3 class="font-bold text-[13px] md:text-sm text-slate-805 m-0 truncate">
                {{ u.Name || u.Username }}
              </h3>
              <span
                class="px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider font-mono scale-95"
                :class="u.Role === 'Superadmin'
                  ? 'bg-red-50 text-red-600 border border-red-150/40'
                  : u.Role === 'SenMaster'
                    ? 'bg-amber-50 text-amber-600 border border-amber-150/40'
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-150/40'"
              >
                {{
                  u.Role === "Superadmin"
                    ? "Гл.Админ"
                    : u.Role === "SenMaster"
                      ? "Главный мастер"
                      : "Мастер"
                }}
              </span>
            </div>
            <!-- Secondary labels -->
            <div class="flex items-center gap-x-2 gap-y-1 text-[10px] text-slate-400 font-semibold flex-wrap">
              <span class="truncate">@{{ u.Username }}</span>
              <span class="text-slate-300">•</span>
              <a
                v-if="u.Phone"
                :href="'tel:' + u.Phone"
                class="text-indigo-605 hover:text-indigo-700 hover:underline flex items-center gap-0.5 truncate"
              >
                <span class="material-symbols-outlined text-[11px]">phone</span>
                {{ u.Phone }}
              </a>
              <span v-else class="text-slate-300">нет телефона</span>
              
              <template v-if="isGlobalAdmin">
                <span class="text-slate-300">•</span>
                <span class="text-indigo-605 font-bold truncate">Орг: {{ getOrganizationName(u.OrganizationID) }}</span>
              </template>
            </div>

            <!-- Password display for administrators with toggle -->
            <div v-if="isGlobalAdmin" class="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10.5px]">
              <span class="text-slate-400 font-bold">Пароль:</span>
              <span class="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 leading-none">
                {{ visiblePasswords[u.ID] ? (u.Password || '—') : '••••••••' }}
              </span>
              <button
                type="button"
                @click="togglePassword(u.ID)"
                class="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition border-none bg-transparent cursor-pointer flex items-center justify-center"
                title="Показать / скрыть пароль"
              >
                <span class="material-symbols-outlined text-[15px]">
                  {{ visiblePasswords[u.ID] ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right / Bottom actions section -->
        <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0 shrink-0">
          <!-- Status Badge -->
          <span
            class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border font-mono select-none"
            :class="
              u.Status === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-150/30'
                : 'bg-amber-50 text-amber-700 border-amber-150/30'
            "
          >
            {{ u.Status === 'Approved' ? 'Допущен' : 'Ожидает' }}
          </span>

          <!-- Quick Actions -->
          <div class="flex items-center gap-1.5">
            <button
              v-if="u.Status === 'Pending'"
              @click="$emit('approve-user', u.ID)"
              class="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 transition border-none cursor-pointer text-xs font-bold shadow-xs"
              title="Одобрить доступ"
            >
              <span class="material-symbols-outlined text-[15px] font-bold">done</span>
              <span>Одобрить</span>
            </button>
            <button
              @click="$emit('open-user-config', u)"
              class="w-8 h-8 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition border-none cursor-pointer p-0"
              title="Настройки"
            >
              <span class="material-symbols-outlined text-[16px] font-bold">settings</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="filteredUsers.length === 0"
        class="py-10 text-center text-slate-400 font-medium text-xs bg-white rounded-xl border border-slate-100"
      >
        Нет сотрудников, подходящих под критерии
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";

export default {
  name: 'UsersTab',
  props: {
    db: {
      type: Object,
      required: true
    },
    searchQuery: {
      type: String,
      default: ""
    },
    isFiltersExpanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedRole: "all",
      selectedStatus: "all",
      visiblePasswords: {},
      roles: [
        { val: "all", lbl: "Все роли" },
        { val: "Superadmin", lbl: "Админ" },
        { val: "SenMaster", lbl: "Главный мастер" },
        { val: "Master", lbl: "Мастер" }
      ],
      statuses: [
        { val: "all", lbl: "Все статусы" },
        { val: "Approved", lbl: "Допущен" },
        { val: "Pending", lbl: "Ожидающие" }
      ]
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    isGlobalAdmin() {
      return this.store.user && this.store.user.Role === 'Superadmin';
    },
    filteredRolesList() {
      if (this.isGlobalAdmin) return this.roles;
      // SenMaster can only filter by SenMaster and Master roles
      return this.roles.filter(r => r.val !== "Superadmin");
    },
    organizationName() {
      if (!this.store.user || !this.db.organizations) return "—";
      const org = this.db.organizations.find(o => o.ID === this.store.user.OrganizationID);
      return org ? org.Name : "—";
    },
    filteredUsers() {
      let list = this.db.users || [];

      // Filter by organization if not Superadmin
      if (!this.isGlobalAdmin && this.store.user) {
        list = list.filter(u => u.OrganizationID === this.store.user.OrganizationID);
      }

      // Filter by role
      if (this.selectedRole !== "all") {
        list = list.filter(u => u.Role === this.selectedRole);
      }

      // Filter by status
      if (this.selectedStatus !== "all") {
        list = list.filter(u => u.Status === this.selectedStatus);
      }

      // Filter by search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(u => {
          const name = String(u.Name || '').toLowerCase();
          const username = String(u.Username || '').toLowerCase();
          const phone = String(u.Phone || '').toLowerCase();
          const role = String(u.Role || '').toLowerCase();
          return name.includes(q) || username.includes(q) || phone.includes(q) || role.includes(q);
        });
      }

      return list;
    }
  },
  methods: {
    togglePassword(id) {
      this.visiblePasswords[id] = !this.visiblePasswords[id];
    },
    getOrganizationName(orgId) {
      if (!this.db.organizations) return "—";
      const org = this.db.organizations.find(o => o.ID === orgId);
      return org ? org.Name : "—";
    }
  },
  emits: ['approve-user', 'open-user-config']
}
</script>
