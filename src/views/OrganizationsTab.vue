<template>
  <div class="space-y-4 max-w-2xl mx-auto w-full pb-20 animate-fade-in">
    <!-- Header info line -->
    <div class="flex justify-between items-center px-1">
      <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[16px] text-indigo-500 font-bold">domain</span>
        Организации
      </h2>
      <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/40">
        Всего: {{ db.organizations ? db.organizations.length : 0 }}
      </span>
    </div>

    <!-- Stats cards row for Superadmin -->
    <div v-if="db.organizations && db.organizations.length > 0" class="grid grid-cols-3 gap-3">
      <div class="bg-white border border-slate-150/60 p-3 rounded-2xl text-left shadow-xs">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Всего СТО</span>
        <h3 class="font-heading text-lg font-black text-slate-800 mt-1 leading-none">
          {{ db.organizations.length }}
        </h3>
      </div>
      <div class="bg-white border border-slate-150/60 p-3 rounded-2xl text-left shadow-xs">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Активные</span>
        <h3 class="font-heading text-lg font-black text-emerald-600 mt-1 leading-none flex items-center gap-1">
          {{ activeOrgsCount }}
          <span class="material-symbols-outlined text-[14px]">check_circle</span>
        </h3>
      </div>
      <div class="bg-white border border-slate-150/60 p-3 rounded-2xl text-left shadow-xs">
        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Истекшие</span>
        <h3 class="font-heading text-lg font-black text-rose-600 mt-1 leading-none flex items-center gap-1 flex-wrap">
          {{ expiredOrgsCount }}
          <span class="material-symbols-outlined text-[14px]">cancel</span>
        </h3>
      </div>
    </div>

    <!-- Organizations list -->
    <div class="space-y-2.5">
      <div
        v-for="org in db.organizations"
        :key="org.ID"
        class="bg-white border border-slate-150/60 hover:border-indigo-150/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
      >
        <div class="flex items-start gap-3 min-w-0 flex-1">
          <!-- Building icon avatar -->
          <div
            class="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-700 font-extrabold text-xs tracking-tight shrink-0 border border-indigo-100/30 uppercase select-none mt-0.5"
          >
            <span class="material-symbols-outlined text-lg">domain</span>
          </div>
          <!-- Organization details -->
          <div class="min-w-0 flex-1 space-y-1">
            <h3 class="font-bold text-sm text-slate-800 m-0 truncate">
              {{ org.Name }}
            </h3>
            
            <!-- Statistics badges & Subscription status -->
            <div class="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-bold flex-wrap">
              <span class="inline-flex items-center gap-0.5 text-indigo-650 bg-indigo-50/40 px-1.5 py-0.5 rounded-lg border border-indigo-150/25">
                <span class="material-symbols-outlined text-[11px]">groups</span>
                Штат: {{ getOrgUsersCount(org.ID) }}
              </span>
              <span class="inline-flex items-center gap-0.5 text-slate-655 bg-slate-100/60 px-1.5 py-0.5 rounded-lg border border-slate-200/40">
                <span class="material-symbols-outlined text-[11px]">list_alt</span>
                Заказы: {{ getOrgRecordsCount(org.ID) }}
              </span>
              <span class="inline-flex items-center gap-0.5 text-emerald-650 bg-emerald-50/40 px-1.5 py-0.5 rounded-lg border border-emerald-150/25">
                <span class="material-symbols-outlined text-[11px]">payments</span>
                Выручка: {{ getOrgRevenue(org.ID).toLocaleString() }}
              </span>
              
              <!-- Subscription tag -->
              <span
                v-if="isOrgSubActive(org)"
                class="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-200"
              >
                <span class="material-symbols-outlined text-[11px]">check_circle</span>
                До {{ formatSubDate(org.SubscriptionEndsAt) }}
              </span>
              <span
                v-else
                class="inline-flex items-center gap-0.5 text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-lg border border-rose-250"
              >
                <span class="material-symbols-outlined text-[11px]">cancel</span>
                Истекла ({{ org.SubscriptionEndsAt ? formatSubDate(org.SubscriptionEndsAt) : 'не оплачена' }})
              </span>
            </div>
          </div>
        </div>

        <!-- Right / Bottom actions section -->
        <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0 shrink-0">
          <div class="flex items-center gap-1.5 ml-auto">
            <!-- Edit Button -->
            <button
              @click="openOrgModal(org)"
              class="w-8 h-8 bg-slate-100 hover:bg-indigo-655 hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition border-none cursor-pointer p-0"
              title="Редактировать подписку / данные"
            >
              <span class="material-symbols-outlined text-[16px] font-bold">edit</span>
            </button>
            <!-- Delete Button -->
            <button
              @click="deleteOrg(org)"
              class="w-8 h-8 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl flex items-center justify-center transition border-none cursor-pointer p-0"
              title="Удалить"
            >
              <span class="material-symbols-outlined text-[16px] font-bold">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="!db.organizations || db.organizations.length === 0"
        class="py-10 text-center text-slate-400 font-medium text-xs bg-white rounded-xl border border-slate-100"
      >
        Нет организаций в базе данных
      </div>
    </div>

    <!-- Floating Action Button to Add Organization -->
    <button
      @click="openOrgModal()"
      class="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-fab hover:bg-indigo-700 active:scale-95 transition-all z-20 md:bottom-12 md:right-12 cursor-pointer border-none"
    >
      <span
        class="material-symbols-outlined text-[28px]"
        style="font-variation-settings: &quot;wght&quot; 600"
        >add</span
      >
    </button>

    <!-- Bootstrap Modal for Add/Edit Organization -->
    <teleport to="body">
      <div
        class="modal fade"
        ref="orgModalRef"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-3xl border-0 shadow-2xl overflow-hidden bg-white">
            <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
              <h5 class="modal-title font-bold text-slate-800 m-0">
                {{ orgForm.ID ? 'Редактировать' : 'Добавить' }} организацию
              </h5>
              <button
                type="button"
                class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent"
                @click="hideOrgModal"
              ></button>
            </div>
            <div class="modal-body bg-slate-50/50 p-6 space-y-4 text-left">
              <div>
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                  >Название организации</label
                >
                <input
                  type="text"
                  v-model="orgForm.Name"
                  placeholder="Введите название автосервиса"
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
                />
              </div>

              <!-- Subscription section in Modal -->
              <div class="pt-2 border-t border-slate-100 space-y-3">
                <span class="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Управление подпиской</span>
                
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="extendSubByMonth"
                    class="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition border-none cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[14px]">add_circle</span>
                    Продлить на 1 месяц
                  </button>
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5"
                    >Дата окончания подписки</label
                  >
                  <input
                    type="date"
                    v-model="orgForm.SubscriptionEndsAt"
                    class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer border-t border-slate-100 px-6 py-4 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                class="w-full sm:flex-1 px-4 py-2.5 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer"
                @click="hideOrgModal"
              >
                Отмена
              </button>
              <button
                type="button"
                class="w-full sm:flex-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 border-none cursor-pointer"
                @click="saveOrg"
                :disabled="isSaving"
              >
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

export default {
  name: "OrganizationsTab",
  props: {
    db: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      orgForm: { ID: "", Name: "", SubscriptionEndsAt: "" },
      isSaving: false,
      bsModal: null
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    activeOrgsCount() {
      if (!this.db.organizations) return 0;
      return this.db.organizations.filter(o => {
        if (!o.SubscriptionEndsAt) return false;
        return new Date(o.SubscriptionEndsAt) > new Date();
      }).length;
    },
    expiredOrgsCount() {
      if (!this.db.organizations) return 0;
      return this.db.organizations.filter(o => {
        if (!o.SubscriptionEndsAt) return true;
        return new Date(o.SubscriptionEndsAt) <= new Date();
      }).length;
    }
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.orgModalRef);
    }
  },
  methods: {
    getOrgUsersCount(orgId) {
      if (!this.db.users) return 0;
      return this.db.users.filter(u => u.OrganizationID === orgId).length;
    },
    getOrgRecordsCount(orgId) {
      if (!this.db.records) return 0;
      return this.db.records.filter(r => r.OrganizationID === orgId).length;
    },
    getOrgRevenue(orgId) {
      if (!this.db.records) return 0;
      return this.db.records
        .filter(r => String(r.OrganizationID) === String(orgId) && r.Status === 'Выполнен')
        .reduce((acc, r) => acc + (Number(r.TotalAmount) || 0), 0);
    },
    isOrgSubActive(org) {
      if (!org.SubscriptionEndsAt) return false;
      return new Date(org.SubscriptionEndsAt) > new Date();
    },
    formatSubDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    },
    openOrgModal(org = null) {
      if (org) {
        let dateStr = "";
        if (org.SubscriptionEndsAt) {
          dateStr = new Date(org.SubscriptionEndsAt).toISOString().split('T')[0];
        } else {
          // Default to exactly 1 month from now
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          dateStr = d.toISOString().split('T')[0];
        }
        this.orgForm = {
          ID: org.ID,
          Name: org.Name,
          SubscriptionEndsAt: dateStr
        };
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        this.orgForm = {
          ID: "",
          Name: "",
          SubscriptionEndsAt: d.toISOString().split('T')[0]
        };
      }
      if (this.bsModal) this.bsModal.show();
    },
    hideOrgModal() {
      if (this.bsModal) this.bsModal.hide();
    },
    extendSubByMonth() {
      let baseDate = new Date();
      if (this.orgForm.SubscriptionEndsAt) {
        const currentEnds = new Date(this.orgForm.SubscriptionEndsAt);
        // If current subscription date is in the future, extend from that date
        if (currentEnds > new Date()) {
          baseDate = currentEnds;
        }
      }
      baseDate.setMonth(baseDate.getMonth() + 1);
      this.orgForm.SubscriptionEndsAt = baseDate.toISOString().split('T')[0];
    },
    async saveOrg() {
      const name = String(this.orgForm.Name || "").trim();
      if (!name) {
        this.store.showToast("Название не может быть пустым", "error");
        return;
      }
      
      this.isSaving = true;
      try {
        const isNew = !this.orgForm.ID;
        const payload = {
          Name: name,
          SubscriptionEndsAt: this.orgForm.SubscriptionEndsAt ? new Date(this.orgForm.SubscriptionEndsAt).toISOString() : null
        };
        if (!isNew) {
          payload.ID = this.orgForm.ID;
        }

        if (isNew) {
          await this.store.dispatchSync("addRow", payload, "Organizations");
          this.store.showToast("Организация успешно создана");
        } else {
          await this.store.dispatchSync("updateRow", payload, "Organizations");
          this.store.showToast("Название организации и подписка обновлены");
        }
        this.hideOrgModal();
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isSaving = false;
      }
    },
    async deleteOrg(org) {
      const usersCount = this.getOrgUsersCount(org.ID);
      const msg = `Вы действительно хотите удалить организацию "${org.Name}"?\n\nЭто действие приведет к удалению всех связанных записей и услуг.\nПользователей в организации: ${usersCount}.\nЭто действие необратимо!`;

      if (confirm(msg)) {
        try {
          await this.store.dispatchSync("deleteRow", org.ID, "Organizations");
          this.store.showToast("Организация удалена");
        } catch (e) {
          this.store.showToast(e.message, "error");
        }
      }
    }
  }
};
</script>
