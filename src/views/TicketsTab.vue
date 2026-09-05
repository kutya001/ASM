<template>
  <div class="space-y-4 max-w-2xl mx-auto w-full pb-20 animate-fade-in text-left">
    <!-- Header info line -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-1">
      <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5 m-0">
        <span class="material-symbols-outlined text-[18px] text-indigo-500">support_agent</span>
        {{ isGlobalAdmin ? 'Все заявки пользователей' : 'Мои заявки администратору' }}
      </h2>
      <button
        v-if="!isGlobalAdmin"
        @click="openCreateModal"
        class="w-full sm:w-auto h-9 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl border-none transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100"
      >
        <span class="material-symbols-outlined text-[16px]">add</span>
        <span>Создать заявку</span>
      </button>
    </div>

    <!-- Quick Status Filters -->
    <div class="bg-white border border-slate-150 p-3 rounded-2xl shadow-sm flex flex-wrap gap-1.5 items-center justify-between">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="st in statusFilters"
          :key="st.val"
          @click="selectedStatus = st.val"
          class="px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer"
          :class="selectedStatus === st.val ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' : 'bg-slate-50 border-slate-205 text-slate-600 hover:bg-slate-100'"
        >
          {{ st.lbl }}
        </button>
      </div>

      <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
        Показано: {{ filteredTickets.length }}
      </span>
    </div>

    <!-- Ticket Cards List -->
    <div class="space-y-3">
      <div
        v-for="t in filteredTickets"
        :key="t.ID"
        class="bg-white border border-slate-150/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3"
      >
        <!-- Card Header: Category & Status Badge -->
        <div class="flex justify-between items-start gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider font-mono"
              :class="getCategoryBadgeClass(t.Category)"
            >
              {{ t.Category }}
            </span>
            <span
              v-if="isGlobalAdmin"
              class="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full"
            >
              СТО: {{ getOrgName(t.OrganizationID) }}
            </span>
          </div>

          <span
            class="px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider font-mono"
            :class="getStatusBadgeClass(t.Status)"
          >
            {{ t.Status }}
          </span>
        </div>

        <!-- Creator & Time Info -->
        <div class="text-[10px] text-slate-400 font-semibold space-y-0.5">
          <div class="flex items-center gap-1">
            <span class="text-slate-600 font-bold">Автор:</span> {{ getUserName(t.UserID) }}
            <span v-if="getUserPhone(t.UserID)" class="text-indigo-500">({{ getUserPhone(t.UserID) }})</span>
          </div>
          <div>
            <span class="text-slate-650">Дата создания:</span> {{ formatDateTime(t.CreatedAt) }}
          </div>
        </div>

        <!-- Description Box -->
        <div class="bg-slate-50/50 border border-slate-100 p-3 rounded-xl text-xs font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
          {{ t.Description }}
        </div>

        <!-- Actions Footer -->
        <div class="flex justify-end gap-2 pt-1 border-t border-slate-50">
          <!-- Superadmin Actions -->
          <template v-if="isGlobalAdmin">
            <button
              v-if="t.Status === 'Открыта' && t.Category === 'Продление подписки'"
              @click="approveAndExtendSubscription(t)"
              class="h-7 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition border-none cursor-pointer flex items-center gap-1 shadow-xs"
              title="Продлить подписку организации на 1 месяц"
            >
              <span class="material-symbols-outlined text-[13px]">autorenew</span> Продлить (+1 мес)
            </button>
            <button
              v-if="t.Status === 'Открыта'"
              @click="updateStatus(t, 'Выполнена')"
              class="h-7 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg transition border-none cursor-pointer flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[13px]">done</span> Выполнить
            </button>
            <button
              v-if="t.Status === 'Открыта'"
              @click="updateStatus(t, 'Отменена')"
              class="h-7 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition border-none cursor-pointer flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[13px]">close</span> Отменить
            </button>
          </template>

          <!-- Creator Actions -->
          <template v-else-if="t.UserID === store.user.ID && t.Status === 'Открыта'">
            <button
              @click="openEditModal(t)"
              class="h-7 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition border-none cursor-pointer flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[13px]">edit</span> Редактировать
            </button>
            <button
              @click="deleteTicket(t.ID)"
              class="h-7 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition border-none cursor-pointer flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[13px]">delete</span> Удалить
            </button>
          </template>
        </div>
      </div>

      <div v-if="filteredTickets.length === 0" class="bg-white border border-slate-150 rounded-2xl py-16 text-center text-slate-400 font-bold text-xs px-6">
        Заявки не найдены.
      </div>
    </div>

    <!-- Ticket Creation / Edit Modal Dialog -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-fade-in p-6 space-y-4">
        <h3 class="text-sm font-black text-slate-850 m-0 uppercase tracking-wider">
          {{ form.ID ? 'Редактировать заявку' : 'Новая заявку администратору' }}
        </h3>

        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Категория обращения</label>
          <select v-model="form.Category" :disabled="!!form.ID" class="w-full h-11 px-3 bg-slate-50 border border-slate-205 rounded-xl outline-none font-bold text-xs text-slate-700 cursor-pointer">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Суть обращения / Описание</label>
          <textarea
            v-model="form.Description"
            rows="5"
            placeholder="Опишите подробно суть обращения или требуемое изменение (например, добавление услуги, марки авто, модели или сообщение об ошибке)"
            class="w-full p-4 bg-slate-50 border border-slate-205 rounded-xl outline-none font-bold text-xs text-slate-800 focus:border-indigo-500 resize-none"
          ></textarea>
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="showModal = false" class="flex-1 h-11 border border-slate-200 text-slate-655 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
            Отмена
          </button>
          <button @click="saveTicket" :disabled="isSaving" class="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer border-none shadow-md shadow-indigo-100">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { generateUUID } from "../utils/helpers";

export default {
  name: 'TicketsTab',
  data() {
    return {
      selectedStatus: 'ALL',
      showModal: false,
      isSaving: false,
      form: {
        ID: '',
        Category: 'Справочник: Услуги',
        Description: ''
      },
      categories: [
        'Продление подписки',
        'Справочник: Услуги',
        'Справочник: Марки',
        'Справочник: Модели',
        'Сообщить об ошибке',
        'Другое'
      ],
      statusFilters: [
        { val: 'ALL', lbl: 'Все' },
        { val: 'Открыта', lbl: 'Открытые' },
        { val: 'Выполнена', lbl: 'Выполненные' },
        { val: 'Отменена', lbl: 'Отмененные' }
      ]
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    db() {
      return this.store.db;
    },
    isGlobalAdmin() {
      return this.store.user && this.store.user.Role === 'Superadmin';
    },
    filteredTickets() {
      let list = this.db.supporttickets || [];
      if (this.selectedStatus !== 'ALL') {
        list = list.filter(t => t.Status === this.selectedStatus);
      }
      return list;
    }
  },
  methods: {
    getUserName(userId) {
      if (!userId) return "—";
      const u = (this.db.users || []).find(x => x.ID === userId);
      return u ? (u.Name || u.Username) : "—";
    },
    getUserPhone(userId) {
      if (!userId) return null;
      const u = (this.db.users || []).find(x => x.ID === userId);
      return u ? u.Phone : null;
    },
    getOrgName(orgId) {
      if (!orgId) return "—";
      const org = (this.db.organizations || []).find(o => o.ID === orgId);
      return org ? org.Name : "—";
    },
    formatDateTime(isoStr) {
      if (!isoStr) return "—";
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "—";
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    getCategoryBadgeClass(cat) {
      if (cat.includes("подписки")) return "bg-violet-50 text-violet-700 border border-violet-200/60";
      if (cat.includes("Услуги")) return "bg-indigo-50 text-indigo-650 border border-indigo-150/30";
      if (cat.includes("Марки")) return "bg-amber-50 text-amber-650 border border-amber-150/30";
      if (cat.includes("Модели")) return "bg-purple-50 text-purple-655 border border-purple-150/30";
      if (cat.includes("ошибке")) return "bg-rose-50 text-rose-650 border border-rose-150/30";
      return "bg-slate-50 text-slate-655 border border-slate-200/40";
    },
    getStatusBadgeClass(status) {
      if (status === 'Открыта') return 'bg-amber-50 text-amber-600 border border-amber-200/40';
      if (status === 'Выполнена') return 'bg-emerald-50 text-emerald-600 border border-emerald-200/40';
      return 'bg-slate-100 text-slate-500 border border-slate-205';
    },
    openCreateModal() {
      this.form = {
        ID: '',
        Category: 'Справочник: Услуги',
        Description: ''
      };
      this.showModal = true;
    },
    openEditModal(ticket) {
      this.form = {
        ID: ticket.ID,
        Category: ticket.Category,
        Description: ticket.Description
      };
      this.showModal = true;
    },
    async saveTicket() {
      if (!this.form.Description || !this.form.Description.trim()) {
        this.store.showToast("Пожалуйста, заполните суть обращения", "error");
        return;
      }
      try {
        this.isSaving = true;
        const isNew = !this.form.ID;
        const orgId = this.store.user.OrganizationID || null;
        
        const payload = {
          ID: this.form.ID || generateUUID(),
          UserID: this.store.user.ID,
          OrganizationID: orgId,
          Category: this.form.Category,
          Description: this.form.Description.trim(),
          Status: 'Открыта',
          CreatedAt: new Date().toISOString()
        };

        if (isNew) {
          this.store.dispatchSync('addRow', payload, 'SupportTickets');
          this.store.showToast("Заявка успешно отправлена");
        } else {
          // Re-get from list to preserve CreatedAt
          const old = (this.db.supporttickets || []).find(x => x.ID === this.form.ID);
          if (old) {
            payload.CreatedAt = old.CreatedAt;
          }
          this.store.dispatchSync('updateRow', payload, 'SupportTickets');
          this.store.showToast("Заявка успешно обновлена");
        }

        this.showModal = false;
      } catch (e) {
        this.store.showToast(e.message, 'error');
      } finally {
        this.isSaving = false;
      }
    },
    async deleteTicket(id) {
      if (confirm("Вы действительно хотите удалить эту заявку?")) {
        try {
          if (this.db.supporttickets) {
            this.db.supporttickets = this.db.supporttickets.filter(x => x.ID !== id);
          }
          await this.store.dispatchSync('deleteRow', id, 'SupportTickets');
          this.store.showToast("Заявка удалена");
        } catch (e) {
          this.store.showToast(e.message, 'error');
        }
      }
    },
    async updateStatus(ticket, newStatus) {
      if (confirm(`Пометить эту заявку как "${newStatus}"?`)) {
        try {
          const payload = {
            ...ticket,
            Status: newStatus
          };
          
          let idx = (this.db.supporttickets || []).findIndex(x => x.ID === ticket.ID);
          if (idx > -1) {
            this.db.supporttickets[idx].Status = newStatus;
          }
          
          await this.store.dispatchSync('updateRow', payload, 'SupportTickets');
          this.store.showToast(`Статус заявки изменен на: ${newStatus}`);
        } catch (e) {
          this.store.showToast(e.message, 'error');
        }
      }
    },
    async approveAndExtendSubscription(ticket) {
      if (!ticket.OrganizationID) {
        this.store.showToast("У заявки не указана организация", "error");
        return;
      }
      const org = (this.db.organizations || []).find(o => String(o.ID) === String(ticket.OrganizationID));
      if (!org) {
        this.store.showToast("Организация не найдена", "error");
        return;
      }

      // Check if description has a number of months requested
      let monthsToAdd = 1;
      const match = String(ticket.Description || '').match(/(\d+)\s*(?:мес|month)/i);
      if (match && Number(match[1]) > 0) {
        monthsToAdd = Number(match[1]);
      }

      if (confirm(`Одобрить заявку и продлить подписку для "${org.Name}" на ${monthsToAdd} мес.?`)) {
        try {
          let baseDate = new Date();
          if (org.SubscriptionEndsAt) {
            const currentEnds = new Date(org.SubscriptionEndsAt);
            if (currentEnds > new Date()) {
              baseDate = currentEnds;
            }
          }
          baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
          const newEndDate = baseDate.toISOString();

          // 1. Update organization
          await this.store.dispatchSync("updateRow", {
            ID: org.ID,
            SubscriptionEndsAt: newEndDate
          }, "Organizations");

          // 2. Add subscription log
          const maxUsers = org.MaxUsers || 3;
          const monthlyRate = maxUsers <= 3 ? 1500 : 1500 + (maxUsers - 3) * 500;
          const totalAmount = monthlyRate * monthsToAdd;
          await this.store.dispatchSync("addRow", {
            OrganizationID: org.ID,
            StartDate: org.SubscriptionEndsAt || new Date().toISOString(),
            EndDate: newEndDate,
            MaxUsers: maxUsers,
            Amount: totalAmount
          }, "SubscriptionLogs");

          // 3. Update ticket status
          await this.store.dispatchSync("updateRow", {
            ...ticket,
            Status: "Выполнена"
          }, "SupportTickets");

          let idx = (this.db.supporttickets || []).findIndex(x => x.ID === ticket.ID);
          if (idx > -1) {
            this.db.supporttickets[idx].Status = "Выполнена";
          }

          this.store.showToast(`Подписка для "${org.Name}" продлена на ${monthsToAdd} мес.`);
        } catch (e) {
          this.store.showToast(e.message, "error");
        }
      }
    }
  }
};
</script>
