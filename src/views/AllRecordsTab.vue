<template>
  <div class="space-y-4 max-w-7xl mx-auto w-full pb-20 animate-fade-in font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
      <div class="text-left">
        <h2 class="text-sm md:text-base font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-2 m-0">
          <span class="material-symbols-outlined text-[22px] text-indigo-600 font-bold">receipt_long</span>
          Реестр записей всех организаций
        </h2>
        <p class="text-[11px] text-slate-400 font-semibold mt-0.5 m-0">
          Сквозной просмотр, фильтрация и управление записями всех СТО
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <button
          @click="refreshData"
          class="h-8 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold uppercase transition border-none cursor-pointer flex items-center gap-1.5 shadow-xs"
          :disabled="isFetching"
          title="Обновить список"
        >
          <span class="material-symbols-outlined text-[16px]" :class="isFetching ? 'animate-spin' : ''">refresh</span>
          <span>Обновить</span>
        </button>

        <span class="text-[11px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-xs">
          Всего: <strong class="text-indigo-600 font-black">{{ filteredRecords.length }}</strong> на <strong class="text-slate-800 font-black">{{ totalFilteredAmount.toLocaleString() }} KGS</strong>
        </span>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-sm space-y-3 text-left">
      <div class="flex flex-col lg:flex-row gap-2.5">
        <!-- Search Input -->
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            v-model="searchQueryLocal"
            placeholder="Поиск по клиенту, номеру авто, услуге, СТО, мастеру..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-xs text-slate-800 focus:border-indigo-500 focus:bg-white transition-all"
          />
          <button
            v-if="searchQueryLocal"
            @click="searchQueryLocal = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent p-1 cursor-pointer flex items-center"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <!-- Filter Selects -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
          <!-- Organization Filter -->
          <select
            v-model="filterOrg"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition max-w-[170px]"
          >
            <option value="all">Все организации</option>
            <option v-for="org in db.organizations" :key="org.ID" :value="org.ID">
              {{ org.Name }}
            </option>
          </select>

          <!-- Master / User Filter -->
          <select
            v-model="filterMaster"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition max-w-[150px]"
          >
            <option value="all">Все мастера</option>
            <option v-for="m in availableMasters" :key="m.ID" :value="m.ID">
              {{ m.Name || m.Username }}
            </option>
          </select>

          <!-- Status Filter -->
          <select
            v-model="filterStatus"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition"
          >
            <option value="all">Все статусы</option>
            <option value="Открыт">Открыт</option>
            <option value="Выполнен">Выполнен</option>
            <option value="Отменён">Отменён</option>
          </select>

          <!-- Payment Filter -->
          <select
            v-model="filterPayment"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition"
          >
            <option value="all">Любая оплата</option>
            <option value="paid">Оплачено</option>
            <option value="unpaid">Не оплачено</option>
          </select>

          <!-- Sort Filter -->
          <select
            v-model="sortBy"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-indigo-500 cursor-pointer transition col-span-2 sm:col-span-1"
          >
            <option value="date_desc">Сначала новые</option>
            <option value="date_asc">Сначала старые</option>
            <option value="amount_desc">Сумма (убыв.)</option>
            <option value="amount_asc">Сумма (возр.)</option>
          </select>

          <!-- Reset Button -->
          <button
            v-if="hasActiveFilters"
            @click="resetFilters"
            class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition bg-transparent border-none cursor-pointer flex items-center justify-center gap-1"
            title="Сбросить все фильтры"
          >
            <span class="material-symbols-outlined text-[15px]">filter_alt_off</span>
            <span>Сброс</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="bg-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden hidden md:block">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200/60 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
              <th class="px-4 py-3">Дата / Время</th>
              <th class="px-4 py-3">Организация (СТО)</th>
              <th class="px-4 py-3">Создатель / Мастер</th>
              <th class="px-4 py-3">Клиент</th>
              <th class="px-4 py-3">Автомобиль</th>
              <th class="px-4 py-3">Услуги</th>
              <th class="px-4 py-3">Сумма</th>
              <th class="px-4 py-3 text-center">Оплата</th>
              <th class="px-4 py-3 text-center">Статус</th>
              <th class="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-semibold">
            <tr
              v-for="r in filteredRecords"
              :key="r.ID"
              @click="editRecord(r)"
              class="hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <!-- Date & Time -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="font-bold text-slate-800">{{ formatDate(r.StartTime) }}</div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">{{ formatTime(r.StartTime) }}</div>
              </td>

              <!-- Organization -->
              <td class="px-4 py-3.5">
                <span class="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100/80 border border-slate-200/50 px-2 py-0.5 rounded-lg text-[11px]">
                  <span class="material-symbols-outlined text-[13px] text-slate-500">domain</span>
                  {{ getOrgName(r.OrganizationID) }}
                </span>
              </td>

              <!-- Master -->
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-[10px] uppercase shrink-0 border border-indigo-100/40">
                    {{ (getMasterName(r.MasterID) || "Н").slice(0, 2) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-800 truncate">{{ getMasterName(r.MasterID) }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">@{{ getMasterUsername(r.MasterID) }}</div>
                  </div>
                </div>
              </td>

              <!-- Client -->
              <td class="px-4 py-3.5">
                <div class="font-bold text-slate-800">{{ r.ClientName || "Без имени" }}</div>
                <div v-if="r.Phone" class="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                  <span>{{ r.Phone }}</span>
                  <a
                    :href="getWhatsAppLink(r.Phone, r.CarNumber)"
                    target="_blank"
                    class="text-emerald-600 hover:text-emerald-700 transition"
                    title="Написать в WhatsApp"
                  >
                    <i class="bi bi-whatsapp"></i>
                  </a>
                </div>
              </td>

              <!-- Car -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span class="inline-block font-black font-mono px-2 py-0.5 bg-slate-900 text-white rounded-md text-[11px] tracking-wider uppercase">
                  {{ r.CarNumber || "БЕЗ НОМЕРА" }}
                </span>
                <div class="text-[11px] text-slate-500 font-bold mt-0.5">
                  {{ getBrandName(r.BrandID) }} {{ getModelName(r.ModelID) }}
                </div>
              </td>

              <!-- Services -->
              <td class="px-4 py-3.5">
                <div class="max-w-[200px] truncate text-[11px] text-slate-600" :title="getServicesSummary(r)">
                  {{ getServicesSummary(r) }}
                </div>
              </td>

              <!-- Total Amount -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span class="font-black text-slate-900 text-xs">
                  {{ (r.TotalAmount || 0).toLocaleString() }}
                </span>
                <span class="text-[10px] text-slate-400 font-bold ml-0.5">KGS</span>
              </td>

              <!-- Payment Status -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap" @click.stop>
                <button
                  @click="togglePayment(r)"
                  class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border font-mono transition cursor-pointer border-none"
                  :class="
                    r.IsPaid
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border-emerald-200/40'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100/70 border-rose-200/40'
                  "
                  :title="r.IsPaid ? 'Нажмите, чтобы отметить как не оплачено' : 'Нажмите, чтобы отметить как оплачено'"
                >
                  {{ r.IsPaid ? "Оплачено" : "Не оплачено" }}
                </button>
              </td>

              <!-- Record Status -->
              <td class="px-4 py-3.5 text-center whitespace-nowrap" @click.stop>
                <button
                  @click="cycleStatus(r)"
                  class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border font-mono transition cursor-pointer border-none"
                  :class="getStatusClass(r.Status)"
                  title="Нажмите для переключения статуса"
                >
                  {{ r.Status }}
                </button>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3.5 text-right whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="editRecord(r)"
                    class="h-7 px-2.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl flex items-center justify-center gap-1 transition border-none cursor-pointer text-xs font-bold shadow-xs"
                    title="Редактировать запись"
                  >
                    <span class="material-symbols-outlined text-[15px]">edit</span>
                    <span>Редактировать</span>
                  </button>
                  <button
                    @click="confirmDeleteRecord(r)"
                    class="w-7 h-7 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl flex items-center justify-center transition border-none cursor-pointer p-0"
                    title="Удалить запись"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredRecords.length === 0">
              <td colspan="10" class="py-12 text-center text-slate-400 font-semibold text-xs">
                Записи не найдены. Попробуйте изменить параметры поиска или фильтров.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards View -->
    <div class="space-y-3 md:hidden">
      <div
        v-for="r in filteredRecords"
        :key="r.ID"
        class="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-sm space-y-3 text-left"
      >
        <!-- Top row: Org & Status -->
        <div class="flex justify-between items-center gap-2">
          <span class="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-lg text-[10px]">
            <span class="material-symbols-outlined text-[13px] text-slate-500">domain</span>
            {{ getOrgName(r.OrganizationID) }}
          </span>

          <div class="flex items-center gap-1.5">
            <button
              @click="togglePayment(r)"
              class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono border-none cursor-pointer"
              :class="r.IsPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
            >
              {{ r.IsPaid ? "Оплачено" : "Не оплачено" }}
            </button>
            <button
              @click="cycleStatus(r)"
              class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono border-none cursor-pointer"
              :class="getStatusClass(r.Status)"
            >
              {{ r.Status }}
            </button>
          </div>
        </div>

        <!-- Main Info: Car & Client -->
        <div class="flex justify-between items-start gap-2 pt-1 border-t border-slate-100">
          <div>
            <div class="inline-block font-black font-mono px-2 py-0.5 bg-slate-900 text-white rounded-md text-[11px] tracking-wider uppercase">
              {{ r.CarNumber || "БЕЗ НОМЕРА" }}
            </div>
            <div class="text-xs font-bold text-slate-600 mt-1">
              {{ getBrandName(r.BrandID) }} {{ getModelName(r.ModelID) }}
            </div>
          </div>

          <div class="text-right">
            <div class="font-black text-slate-900 text-sm">
              {{ (r.TotalAmount || 0).toLocaleString() }} <span class="text-[10px] text-slate-400 font-bold">KGS</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              {{ formatDate(r.StartTime) }} {{ formatTime(r.StartTime) }}
            </div>
          </div>
        </div>

        <!-- Client & Master Info -->
        <div class="bg-slate-50/70 p-2.5 rounded-xl text-xs space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-semibold text-[10px]">Клиент:</span>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-slate-800">{{ r.ClientName || "—" }}</span>
              <a
                v-if="r.Phone"
                :href="getWhatsAppLink(r.Phone, r.CarNumber)"
                target="_blank"
                class="text-emerald-600 hover:text-emerald-700"
              >
                <i class="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-400 font-semibold text-[10px]">Мастер:</span>
            <span class="font-bold text-slate-700">{{ getMasterName(r.MasterID) }}</span>
          </div>
          <div v-if="r.ServicesJSON && r.ServicesJSON.length" class="flex justify-between items-center">
            <span class="text-slate-400 font-semibold text-[10px]">Услуги:</span>
            <span class="font-medium text-slate-600 truncate max-w-[200px]">{{ getServicesSummary(r) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            @click="editRecord(r)"
            class="flex-1 h-8 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl flex items-center justify-center gap-1.5 transition border-none cursor-pointer text-xs font-bold"
          >
            <span class="material-symbols-outlined text-[16px]">edit</span>
            <span>Редактировать</span>
          </button>
          <button
            @click="confirmDeleteRecord(r)"
            class="w-8 h-8 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl flex items-center justify-center transition border-none cursor-pointer"
            title="Удалить запись"
          >
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      <div v-if="filteredRecords.length === 0" class="py-12 text-center text-slate-400 font-semibold text-xs bg-white rounded-2xl border border-slate-200/70">
        Записи не найдены.
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { formatDate } from "../utils/helpers";

export default {
  name: "AllRecordsTab",
  props: {
    db: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      default: null,
    },
    searchQuery: {
      type: String,
      default: "",
    },
  },
  emits: ["open-record", "del-row"],
  data() {
    return {
      searchQueryLocal: "",
      filterOrg: "all",
      filterMaster: "all",
      filterStatus: "all",
      filterPayment: "all",
      sortBy: "date_desc",
      isFetching: false,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    records() {
      return this.db.records || [];
    },
    availableMasters() {
      const users = this.db.users || [];
      if (this.filterOrg === "all") {
        return users.filter((u) => u.Role !== "Superadmin");
      }
      return users.filter((u) => u.OrganizationID === this.filterOrg && u.Role !== "Superadmin");
    },
    hasActiveFilters() {
      return (
        this.searchQueryLocal.trim() !== "" ||
        this.filterOrg !== "all" ||
        this.filterMaster !== "all" ||
        this.filterStatus !== "all" ||
        this.filterPayment !== "all" ||
        this.sortBy !== "date_desc"
      );
    },
    totalFilteredAmount() {
      return this.filteredRecords.reduce((sum, r) => sum + (Number(r.TotalAmount) || 0), 0);
    },
    filteredRecords() {
      let list = [...this.records];

      // Global Search
      const q = (this.searchQueryLocal || this.searchQuery || "").trim().toLowerCase();
      if (q) {
        list = list.filter((r) => {
          const client = String(r.ClientName || "").toLowerCase();
          const phone = String(r.Phone || "").toLowerCase();
          const car = String(r.CarNumber || "").toLowerCase();
          const comment = String(r.Comment || "").toLowerCase();
          const org = String(this.getOrgName(r.OrganizationID)).toLowerCase();
          const master = String(this.getMasterName(r.MasterID)).toLowerCase();
          const services = String(this.getServicesSummary(r)).toLowerCase();

          return (
            client.includes(q) ||
            phone.includes(q) ||
            car.includes(q) ||
            comment.includes(q) ||
            org.includes(q) ||
            master.includes(q) ||
            services.includes(q)
          );
        });
      }

      // Organization filter
      if (this.filterOrg !== "all") {
        list = list.filter((r) => r.OrganizationID === this.filterOrg);
      }

      // Master filter
      if (this.filterMaster !== "all") {
        list = list.filter((r) => r.MasterID === this.filterMaster);
      }

      // Status filter
      if (this.filterStatus !== "all") {
        list = list.filter((r) => r.Status === this.filterStatus);
      }

      // Payment filter
      if (this.filterPayment !== "all") {
        const isPaid = this.filterPayment === "paid";
        list = list.filter((r) => {
          const val = r.IsPaid === true || String(r.IsPaid).toUpperCase() === "TRUE";
          return val === isPaid;
        });
      }

      // Sorting
      list.sort((a, b) => {
        if (this.sortBy === "date_desc") {
          return new Date(b.StartTime || 0) - new Date(a.StartTime || 0);
        }
        if (this.sortBy === "date_asc") {
          return new Date(a.StartTime || 0) - new Date(b.StartTime || 0);
        }
        if (this.sortBy === "amount_desc") {
          return (Number(b.TotalAmount) || 0) - (Number(a.TotalAmount) || 0);
        }
        if (this.sortBy === "amount_asc") {
          return (Number(a.TotalAmount) || 0) - (Number(b.TotalAmount) || 0);
        }
        return 0;
      });

      return list;
    },
  },
  methods: {
    async refreshData() {
      this.isFetching = true;
      try {
        await this.store.loadInitialData();
        this.store.showToast("Данные успешно обновлены");
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isFetching = false;
      }
    },
    resetFilters() {
      this.searchQueryLocal = "";
      this.filterOrg = "all";
      this.filterMaster = "all";
      this.filterStatus = "all";
      this.filterPayment = "all";
      this.sortBy = "date_desc";
    },
    getOrgName(orgId) {
      if (!orgId) return "—";
      const org = (this.db.organizations || []).find((o) => o.ID === orgId);
      return org ? org.Name : "Неизвестно";
    },
    getMasterName(masterId) {
      if (!masterId) return "Не назначен";
      const m = (this.db.users || []).find((u) => u.ID === masterId);
      return m ? m.Name || m.Username : "Не назначен";
    },
    getMasterUsername(masterId) {
      if (!masterId) return "—";
      const m = (this.db.users || []).find((u) => u.ID === masterId);
      return m ? m.Username : "—";
    },
    getBrandName(brandId) {
      if (!brandId) return "";
      const b = (this.db.brands || []).find((x) => x.ID === brandId);
      return b ? b.Name : "";
    },
    getModelName(modelId) {
      if (!modelId) return "";
      const m = (this.db.models || []).find((x) => x.ID === modelId);
      return m ? m.Name : "";
    },
    getServicesSummary(r) {
      if (!r.ServicesJSON || !Array.isArray(r.ServicesJSON) || r.ServicesJSON.length === 0) {
        return r.AdditionalServices || "Услуги не указаны";
      }
      return r.ServicesJSON.map((s) => s.Name || s.name).join(", ");
    },
    formatDate(val) {
      if (!val) return "—";
      const res = formatDate(val);
      return typeof res === "object" ? res.date : String(res);
    },
    formatTime(val) {
      if (!val) return "";
      const res = formatDate(val);
      return typeof res === "object" && res.time ? res.time.slice(0, 5) : "";
    },
    getStatusClass(status) {
      switch (status) {
        case "Открыт":
          return "bg-indigo-50 text-indigo-700 border-indigo-200/50";
        case "Выполнен":
          return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
        case "Отменён":
          return "bg-rose-50 text-rose-700 border-rose-200/50";
        default:
          return "bg-slate-100 text-slate-700 border-slate-200/50";
      }
    },
    getWhatsAppLink(phone, carNumber) {
      const clean = String(phone || "").replace(/\D/g, "");
      const msg = encodeURIComponent(`Здравствуйте! По поводу вашего авто ${carNumber || ""}: `);
      return `https://wa.me/${clean}?text=${msg}`;
    },
    async togglePayment(record) {
      const payload = { ...record };
      payload.IsPaid = !(payload.IsPaid === true || String(payload.IsPaid).toUpperCase() === "TRUE");

      const idx = this.store.db.records.findIndex((x) => x.ID === record.ID);
      if (idx > -1) {
        this.store.db.records[idx].IsPaid = payload.IsPaid;
      }
      this.store.dispatchSync("updateRecord", payload);
      this.store.showToast(payload.IsPaid ? "Отмечено как оплачено" : "Отмечено как не оплачено");
    },
    async cycleStatus(record) {
      let nextStatus = "Открыт";
      if (record.Status === "Открыт") nextStatus = "Выполнен";
      else if (record.Status === "Выполнен") nextStatus = "Отменён";
      else nextStatus = "Открыт";

      const payload = { ...record, Status: nextStatus };
      if (nextStatus === "Выполнен" && record.Status !== "Выполнен") {
        payload.EndTime = new Date().toISOString();
      } else if (nextStatus !== "Выполнен") {
        payload.EndTime = null;
      }

      const idx = this.store.db.records.findIndex((x) => x.ID === record.ID);
      if (idx > -1) {
        this.store.db.records[idx] = payload;
      }
      this.store.dispatchSync("updateRecord", payload);
      this.store.showToast(`Статус изменен на "${nextStatus}"`);
    },
    editRecord(record) {
      this.$emit("open-record", record);
    },
    confirmDeleteRecord(record) {
      if (confirm(`Удалить запись по автомобилю "${record.CarNumber || 'Без номера'}"?`)) {
        this.store.dispatchSync("delRow", record.ID, "Records");
        const idx = this.store.db.records.findIndex((x) => x.ID === record.ID);
        if (idx > -1) {
          this.store.db.records.splice(idx, 1);
        }
        this.store.showToast("Запись успешно удалена");
      }
    },
  },
};
</script>
