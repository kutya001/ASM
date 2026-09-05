<template>
  <div class="space-y-4 max-w-6xl mx-auto w-full pb-20 animate-fade-in font-sans">
    <!-- Header -->
    <div class="flex justify-between items-center px-1">
      <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[18px] text-indigo-600 font-bold">people</span>
        Управление всеми пользователями
      </h2>
      <div class="flex items-center gap-2">
        <button
          @click="fetchUsers"
          class="h-7 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold uppercase transition border-none cursor-pointer flex items-center gap-1"
          :disabled="isFetching"
        >
          <span class="material-symbols-outlined text-[14px]">refresh</span>
          Обновить
        </button>
        <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/40">
          Всего в базе: {{ filteredUsers.length }} чел.
        </span>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input
          type="text"
          v-model="searchQueryLocal"
          placeholder="Поиск по ФИО, логину, телефону..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-xs text-slate-800 focus:border-indigo-500 transition-all"
        />
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <select
          v-model="filterRole"
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Все роли</option>
          <option value="Superadmin">Гл.Админ</option>
          <option value="SenMaster">Главный мастер</option>
          <option value="Master">Мастер</option>
        </select>

        <select
          v-model="filterStatus"
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Все статусы</option>
          <option value="Approved">Допущен</option>
          <option value="Pending">Ожидает</option>
        </select>

        <select
          v-model="filterOrg"
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 transition max-w-[180px]"
        >
          <option value="all">Все организации</option>
          <option v-for="org in db.organizations" :key="org.ID" :value="org.ID">
            {{ org.Name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Users Table (For Desktop ergonomics) -->
    <div class="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden hidden md:block">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <th class="px-5 py-3">Пользователь</th>
              <th class="px-5 py-3">Логин / Телефон</th>
              <th class="px-5 py-3">Организация</th>
              <th class="px-5 py-3">Роль / Допуск</th>
              <th class="px-5 py-3">Пароль</th>
              <th class="px-5 py-3">Активность</th>
              <th class="px-5 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <tr v-for="u in filteredUsers" :key="u.ID" class="hover:bg-slate-50/50 transition-colors">
              <!-- User Info -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center select-none shrink-0 border border-indigo-100/30 uppercase">
                    {{ (u.Name || u.Username || u.name || u.username || 'US').slice(0, 2) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800">{{ u.Name || u.name || '—' }}</div>
                    <div class="text-[10px] text-slate-400">ID: {{ (u.ID || u.id || '').slice(0, 8) }}...</div>
                  </div>
                </div>
              </td>

              <!-- Credentials -->
              <td class="px-5 py-3.5">
                <div class="font-bold text-slate-700">@{{ u.Username }}</div>
                <div class="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5" v-if="u.Phone">
                  <span class="material-symbols-outlined text-[12px]">phone</span>
                  {{ u.Phone }}
                </div>
              </td>

              <!-- Organization -->
              <td class="px-5 py-3.5">
                <span class="font-bold text-slate-700 bg-slate-100/70 border border-slate-200/40 px-2 py-0.5 rounded-lg">
                  {{ getOrgName(u.OrganizationID) }}
                </span>
              </td>

              <!-- Role & Status -->
              <td class="px-5 py-3.5">
                <div class="space-y-1">
                  <span
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono"
                    :class="u.Role === 'Superadmin'
                      ? 'bg-red-50 text-red-600 border border-red-150/40'
                      : u.Role === 'SenMaster'
                        ? 'bg-amber-50 text-amber-600 border border-amber-150/40'
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-150/40'"
                  >
                    {{ u.Role === "Superadmin" ? "Админ" : u.Role === "SenMaster" ? "Главный" : "Мастер" }}
                  </span>
                  <span
                    class="block text-[9px] font-bold font-mono tracking-wider"
                    :class="u.Status === 'Approved' ? 'text-emerald-600' : 'text-amber-500'"
                  >
                    {{ u.Status === 'Approved' ? 'Допущен' : 'Ожидает' }}
                  </span>
                </div>
              </td>

              <!-- Password reveal -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 leading-none">
                    {{ visiblePasswords[u.ID] ? (u.Password || '—') : '••••••••' }}
                  </span>
                  <button
                    type="button"
                    @click="togglePassword(u.ID)"
                    class="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-650 transition border-none bg-transparent cursor-pointer flex items-center justify-center"
                  >
                    <span class="material-symbols-outlined text-[14px]">
                      {{ visiblePasswords[u.ID] ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </td>

              <!-- Activity Log -->
              <td class="px-5 py-3.5">
                <div class="text-[10px] font-bold text-slate-700">
                  {{ u.LastLoginAt ? formatFullDate(u.LastLoginAt) : 'Никогда' }}
                </div>
                <div class="text-[9px] text-slate-400 mt-0.5">Создан: {{ formatSubDate(u.CreatedAt) }}</div>
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="u.Status === 'Pending'"
                    @click="approveUser(u.ID)"
                    class="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1 transition border-none cursor-pointer text-[10px] font-bold shadow-xs"
                  >
                    <span class="material-symbols-outlined text-[13px] font-bold">done</span>
                    Одобрить
                  </button>
                  <button
                    @click="editUser(u)"
                    class="w-7 h-7 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 rounded-lg flex items-center justify-center transition border-none cursor-pointer p-0"
                    title="Редактировать пароль / данные"
                  >
                    <span class="material-symbols-outlined text-[14px] font-bold">edit</span>
                  </button>
                  <button
                    v-if="store.user && u.ID !== store.user.ID"
                    @click="confirmDeleteUser(u)"
                    class="w-7 h-7 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg flex items-center justify-center transition border-none cursor-pointer p-0"
                    title="Удалить пользователя"
                  >
                    <span class="material-symbols-outlined text-[14px] font-bold">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Fallback Cards for Mobile/Small Screens -->
    <div class="space-y-2.5 md:hidden">
      <div v-for="u in filteredUsers" :key="u.ID" class="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm flex flex-col gap-3 text-left">
        <div class="flex gap-2.5 items-start">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center uppercase shrink-0">
            {{ (u.Name || u.Username || u.name || u.username || 'US').slice(0, 2) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <h4 class="font-bold text-sm text-slate-800 m-0 truncate">{{ u.Name || u.Username }}</h4>
              <span
                class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono scale-95"
                :class="u.Role === 'Superadmin' ? 'bg-red-50 text-red-600 border border-red-150/40' : 'bg-indigo-50 text-indigo-650'"
              >
                {{ u.Role === "Superadmin" ? "Админ" : u.Role === "SenMaster" ? "Главный" : "Мастер" }}
              </span>
            </div>
            <div class="text-[10px] text-slate-400 mt-1 flex flex-col gap-0.5">
              <span>Логин: @{{ u.Username }}</span>
              <span>Орг: {{ getOrgName(u.OrganizationID) }}</span>
              <span v-if="u.Phone">Тел: {{ u.Phone }}</span>
              <span>Был: {{ u.LastLoginAt ? formatFullDate(u.LastLoginAt) : 'Никогда' }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-slate-100 pt-2.5">
          <!-- Status -->
          <span
            class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border font-mono select-none"
            :class="u.Status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-150/30' : 'bg-amber-50 text-amber-700 border-amber-150/30'"
          >
            {{ u.Status === 'Approved' ? 'Допущен' : 'Ожидает' }}
          </span>

          <!-- Actions -->
          <div class="flex items-center gap-1.5">
            <button
              v-if="u.Status === 'Pending'"
              @click="approveUser(u.ID)"
              class="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 transition border-none cursor-pointer text-xs font-bold"
            >
              <span class="material-symbols-outlined text-[14px]">done</span>
              Одобрить
            </button>
            <button
              @click="editUser(u)"
              class="w-8 h-8 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-655 rounded-xl flex items-center justify-center transition border-none cursor-pointer"
            >
              <span class="material-symbols-outlined text-[15px]">edit</span>
            </button>
            <button
              v-if="store.user && u.ID !== store.user.ID"
              @click="confirmDeleteUser(u)"
              class="w-8 h-8 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl flex items-center justify-center transition border-none cursor-pointer"
              title="Удалить пользователя"
            >
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal (Support full info edit including password) -->
    <teleport to="body">
      <div class="modal fade" ref="editModalRef" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden bg-white text-left">
            <div class="modal-header border-b border-slate-100 px-6 py-5">
              <h5 class="modal-title font-bold text-slate-800 m-0">Редактирование пользователя</h5>
              <button type="button" class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent" @click="hideEditModal"></button>
            </div>
            <div class="modal-body bg-slate-50/50 p-6 space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Полное имя</label>
                <input
                  type="text"
                  v-model="editForm.Name"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
                />
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Номер телефона</label>
                <input
                  type="text"
                  v-model="editForm.Phone"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
                />
              </div>

              <!-- Organization -->
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Организация (СТО)</label>
                <select
                  v-model="editForm.OrganizationID"
                  class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500"
                >
                  <option value="">Без организации</option>
                  <option v-for="org in db.organizations" :key="org.ID" :value="org.ID">{{ org.Name }}</option>
                </select>
              </div>

              <!-- Role & Status -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Роль</label>
                  <select
                    v-model="editForm.Role"
                    class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500"
                  >
                    <option value="Master">Мастер</option>
                    <option value="SenMaster">Главный мастер</option>
                    <option value="Superadmin">Админ</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Допуск</label>
                  <select
                    v-model="editForm.Status"
                    class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500"
                  >
                    <option value="Approved">Допущен</option>
                    <option value="Pending">Ожидает</option>
                  </select>
                </div>
              </div>

              <!-- CHANGE PASSWORD (Superadmin power) -->
              <div class="pt-3 border-t border-slate-100">
                <label class="block text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2">Изменить пароль пользователя</label>
                <input
                  type="password"
                  v-model="editForm.NewPassword"
                  placeholder="Введите новый пароль для принудительного сброса"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-rose-800 shadow-sm focus:border-rose-500 placeholder-slate-350"
                />
                <span class="text-[9px] font-semibold text-slate-400 mt-1 block">Оставьте поле пустым, если не хотите менять текущий пароль.</span>
              </div>
            </div>
            <div class="modal-footer border-t border-slate-100 px-6 py-4 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                v-if="store.user && editForm.ID !== store.user.ID"
                type="button"
                class="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl font-bold text-sm transition border-none cursor-pointer flex items-center justify-center gap-1.5"
                @click="confirmDeleteUserFromModal"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
                <span>Удалить</span>
              </button>
              <button type="button" class="w-full sm:flex-1 px-4 py-2.5 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer" @click="hideEditModal">Отмена</button>
              <button type="button" class="w-full sm:flex-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 border-none cursor-pointer" @click="saveUser" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm text-white border-2"></span>
                <span>Сохранить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { adminUpdateUserPassword, supabase, toApp } from "../services/api";

export default {
  name: "AllUsersTab",
  props: {
    db: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      usersList: [],
      searchQueryLocal: "",
      filterRole: "all",
      filterStatus: "all",
      filterOrg: "all",
      visiblePasswords: {},
      editForm: { ID: "", Name: "", Phone: "", OrganizationID: "", Role: "Master", Status: "Approved", NewPassword: "" },
      isSaving: false,
      isFetching: false,
      bsModal: null
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    filteredUsers() {
      let list = this.usersList.length > 0
        ? this.usersList
        : (this.store.db && this.store.db.users && this.store.db.users.length > 0)
          ? this.store.db.users
          : (this.db.users || []);

      // Filter by Role
      if (this.filterRole !== "all") {
        list = list.filter(u => (u.Role || u.role) === this.filterRole);
      }

      // Filter by Status
      if (this.filterStatus !== "all") {
        list = list.filter(u => (u.Status || u.status) === this.filterStatus);
      }

      // Filter by Org
      if (this.filterOrg !== "all") {
        list = list.filter(u => String(u.OrganizationID || u.organization_id) === String(this.filterOrg));
      }

      // Filter by Search Query
      if (this.searchQueryLocal) {
        const q = this.searchQueryLocal.toLowerCase().trim();
        list = list.filter(u => {
          const name = String(u.Name || u.name || '').toLowerCase();
          const username = String(u.Username || u.username || '').toLowerCase();
          const phone = String(u.Phone || u.phone || '').toLowerCase();
          return name.includes(q) || username.includes(q) || phone.includes(q);
        });
      }

      return list;
    }
  },
  mounted() {
    this.fetchUsers();
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.editModalRef);
    }
  },
  methods: {
    async fetchUsers() {
      this.isFetching = true;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, username, password, role, status, name, phone, organization_id, created_at, last_login_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        const mapped = (data || []).map(u => toApp("users", u));
        this.usersList = mapped;
        this.store.db.users = mapped;
        if (this.db) {
          this.db.users = mapped;
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        this.isFetching = false;
      }
    },
    togglePassword(id) {
      this.visiblePasswords[id] = !this.visiblePasswords[id];
    },
    getOrgName(orgId) {
      if (!orgId) return "Глобальный (Без СТО)";
      const orgs = (this.store.db && this.store.db.organizations) || this.db.organizations || [];
      const org = orgs.find(o => String(o.ID || o.id) === String(orgId));
      return org ? org.Name || org.name : "—";
    },
    formatSubDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    },
    formatFullDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      return `${dd}.${mm}.${yyyy} ${hh}:${mins}`;
    },
    editUser(u) {
      this.editForm = {
        ID: u.ID,
        Name: u.Name || "",
        Phone: u.Phone || "",
        OrganizationID: u.OrganizationID || "",
        Role: u.Role || "Master",
        Status: u.Status || "Approved",
        NewPassword: ""
      };
      if (this.bsModal) this.bsModal.show();
    },
    hideEditModal() {
      if (this.bsModal) this.bsModal.hide();
    },
    async approveUser(id) {
      try {
        let idx = this.db.users.findIndex(x => x.ID === id);
        if (idx > -1) {
          this.db.users[idx].Status = "Approved";
        }
        this.store.dispatchSync(
          "approveUser",
          { id: id, data: { Status: "Approved" } },
          "Users",
        );
        this.store.showToast("Пользователь одобрен");
      } catch (e) {
        this.store.showToast(e.message, "error");
      }
    },
    async saveUser() {
      this.isSaving = true;
      try {
        // 1. Update Password if specified
        if (this.editForm.NewPassword) {
          await adminUpdateUserPassword(this.editForm.ID, this.editForm.NewPassword);
          
          // Locally update in our list if visible
          let idx = this.db.users.findIndex(x => x.ID === this.editForm.ID);
          if (idx > -1) {
            this.db.users[idx].Password = this.editForm.NewPassword;
          }
          this.store.showToast("Пароль успешно принудительно изменен");
        }

        // 2. Update user profile details
        const updatePayload = {
          Role: this.editForm.Role,
          Status: this.editForm.Status,
          OrganizationID: this.editForm.OrganizationID || null,
          Name: this.editForm.Name,
          Phone: this.editForm.Phone
        };

        // Update locally first
        let idx = this.db.users.findIndex(x => x.ID === this.editForm.ID);
        if (idx > -1) {
          this.db.users[idx] = {
            ...this.db.users[idx],
            ...updatePayload
          };
        }

        await this.store.dispatchSync(
          "approveUser",
          { id: this.editForm.ID, data: updatePayload },
          "Users"
        );

        this.store.showToast("Пользователь сохранен");
        this.hideEditModal();
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isSaving = false;
      }
    },
    async confirmDeleteUser(u) {
      const name = u.Name || u.Username;
      if (!confirm(`Вы действительно хотите безвозвратно удалить пользователя "${name}" (@${u.Username})?\n\nВсе связанные данные и учетная запись будут удалены.`)) {
        return;
      }
      try {
        this.usersList = this.usersList.filter(x => x.ID !== u.ID);
        if (this.db.users) {
          this.db.users = this.db.users.filter(x => x.ID !== u.ID);
        }
        await this.store.dispatchSync("deleteRow", u.ID, "Users");
        this.store.showToast(`Пользователь @${u.Username} удален`);
      } catch (err) {
        this.store.showToast(err.message, "error");
      }
    },
    confirmDeleteUserFromModal() {
      const u = this.usersList.find(x => x.ID === this.editForm.ID) || (this.db.users || []).find(x => x.ID === this.editForm.ID);
      if (u) {
        this.hideEditModal();
        this.confirmDeleteUser(u);
      }
    }
  }
};
</script>
