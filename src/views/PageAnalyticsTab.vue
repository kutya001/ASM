<template>
  <div class="space-y-4 max-w-6xl mx-auto w-full pb-20 animate-fade-in font-sans">
    <!-- Header -->
    <div class="flex justify-between items-center px-1">
      <h2 class="text-sm font-black text-slate-800 uppercase tracking-wider font-heading flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[18px] text-indigo-600 font-bold">bar_chart_steps</span>
        Аналитика кликов и переходов по страницам
      </h2>
      <button
        @click="fetchData"
        class="h-7 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold uppercase transition border-none cursor-pointer flex items-center gap-1"
        :disabled="loading"
      >
        <span class="material-symbols-outlined text-[14px]">refresh</span>
        Обновить
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 text-center bg-white border border-slate-150 rounded-2xl shadow-sm">
      <div class="spinner-border text-indigo-650 mb-3 border-4" style="width: 2.5rem; height: 2.5rem" role="status"></div>
      <div class="text-slate-400 font-bold text-xs uppercase">Загрузка логов переходов...</div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-4">
      <!-- Overview Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Card 1: Total clicks -->
        <div class="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-left">
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Всего кликов</span>
          <h3 class="font-heading text-2xl font-black text-indigo-600 mt-1 leading-none">
            {{ pageViews.length }}
          </h3>
          <span class="text-[9px] font-bold text-slate-450 block mt-1.5">За всю историю логирования</span>
        </div>

        <!-- Card 2: Most Popular Page -->
        <div class="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-left">
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Популярный раздел</span>
          <h3 class="font-heading text-lg font-black text-slate-800 mt-1 leading-tight truncate">
            {{ popularPage.name }}
          </h3>
          <span class="text-[9px] font-bold text-slate-450 block mt-1">Кликов: {{ popularPage.count }}</span>
        </div>

        <!-- Card 3: Most Active User -->
        <div class="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs text-left">
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Активный пользователь</span>
          <h3 class="font-heading text-lg font-black text-slate-800 mt-1 leading-tight truncate">
            {{ activeUser.name }}
          </h3>
          <span class="text-[9px] font-bold text-slate-450 block mt-1">Переходов: {{ activeUser.count }}</span>
        </div>
      </div>

      <!-- Charts & Tables Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Left: Popular Pages Bar -->
        <div class="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm text-left lg:col-span-1 space-y-3">
          <h3 class="font-bold text-xs text-slate-850 uppercase tracking-wider font-heading">Популярные вкладки</h3>
          <div class="space-y-2">
            <div v-for="p in popularPagesList" :key="p.name" class="space-y-1">
              <div class="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span class="font-bold text-slate-800">{{ translatePageName(p.name) }}</span>
                <span>{{ p.count }} кл.</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full" :style="{ width: getPercentage(p.count) + '%' }"></div>
              </div>
            </div>
            <div v-if="popularPagesList.length === 0" class="text-center py-6 text-slate-400 italic text-xs">
              Нет логов страниц
            </div>
          </div>
        </div>

        <!-- Right: Real-time transition logs (Computer Table) -->
        <div class="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm text-left lg:col-span-2 space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-xs text-slate-850 uppercase tracking-wider font-heading">Журнал переходов</h3>
            <!-- Filters inside table -->
            <div class="flex gap-2">
              <select
                v-model="filterPage"
                class="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[10px] text-slate-600 outline-none"
              >
                <option value="all">Все вкладки</option>
                <option v-for="p in allPages" :key="p" :value="p">{{ translatePageName(p) }}</option>
              </select>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto max-h-96 overflow-y-auto pr-1">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th class="px-3 py-2.5">Время</th>
                  <th class="px-3 py-2.5">Пользователь</th>
                  <th class="px-3 py-2.5">Организация</th>
                  <th class="px-3 py-2.5">Вкладка</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="log in filteredLogs" :key="log.id" class="hover:bg-slate-50/50">
                  <td class="px-3 py-2.5 font-bold text-slate-500 whitespace-nowrap">
                    {{ formatFullDate(log.created_at) }}
                  </td>
                  <td class="px-3 py-2.5">
                    <div class="font-bold text-slate-800">
                      {{ log.users ? (log.users.name || '@' + log.users.username) : 'Неизвестный' }}
                    </div>
                  </td>
                  <td class="px-3 py-2.5">
                    <span class="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {{ log.organizations ? log.organizations.name : '—' }}
                    </span>
                  </td>
                  <td class="px-3 py-2.5">
                    <span class="font-bold text-indigo-700 bg-indigo-50 border border-indigo-150/40 px-1.5 py-0.5 rounded-lg font-mono">
                      {{ translatePageName(log.page_name) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="filteredLogs.length === 0">
                  <td colspan="4" class="text-center py-8 text-slate-400 italic">
                    Логов переходов не найдено
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase, toApp } from '../services/api';
import { useMainStore } from '../store';

export default {
  name: "PageAnalyticsTab",
  data() {
    return {
      pageViews: [],
      loading: true,
      filterPage: "all",
      hoveredBarIndex: null,
      realtimeChannel: null
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    allPages() {
      const set = new Set(this.pageViews.map(l => l.page_name));
      return Array.from(set);
    },
    filteredLogs() {
      let list = this.pageViews;
      if (this.filterPage !== "all") {
        list = list.filter(l => l.page_name === this.filterPage);
      }
      return list;
    },
    popularPage() {
      const counts = {};
      this.pageViews.forEach(l => {
        counts[l.page_name] = (counts[l.page_name] || 0) + 1;
      });
      let maxPage = "—";
      let maxCount = 0;
      Object.entries(counts).forEach(([page, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxPage = this.translatePageName(page);
        }
      });
      return { name: maxPage, count: maxCount };
    },
    activeUser() {
      const counts = {};
      this.pageViews.forEach(l => {
        const username = l.users ? (l.users.name || '@' + l.users.username) : null;
        if (username) {
          counts[username] = (counts[username] || 0) + 1;
        }
      });
      let maxUser = "—";
      let maxCount = 0;
      Object.entries(counts).forEach(([user, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxUser = user;
        }
      });
      return { name: maxUser, count: maxCount };
    },
    popularPagesList() {
      const counts = {};
      this.pageViews.forEach(l => {
        counts[l.page_name] = (counts[l.page_name] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
  },
  mounted() {
    this.fetchData();
    this.subscribeRealtime();
  },
  beforeUnmount() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const { data: viewsData, error: viewsErr } = await supabase
          .from("page_views")
          .select("*")
          .order("created_at", { ascending: false });

        if (viewsErr) throw viewsErr;

        // Auto-fetch users if not present in store
        if (!this.store.db.users || this.store.db.users.length === 0) {
          const { data: uData } = await supabase
            .from("users")
            .select("id, username, name, phone, role, status, organization_id");
          if (uData) {
            this.store.db.users = uData.map(u => toApp("users", u));
          }
        }

        // Auto-fetch organizations if not present in store
        if (!this.store.db.organizations || this.store.db.organizations.length === 0) {
          const { data: oData } = await supabase
            .from("organizations")
            .select("id, name");
          if (oData) {
            this.store.db.organizations = oData.map(o => toApp("organizations", o));
          }
        }

        const usersList = this.store.db.users || [];
        const orgsList = this.store.db.organizations || [];

        const enrichedLogs = (viewsData || []).map(log => {
          const user = usersList.find(u => String(u.ID || u.id) === String(log.user_id));
          const org = orgsList.find(o => String(o.ID || o.id) === String(log.organization_id));
          return {
            ...log,
            users: user ? { name: user.Name || user.name || '', username: user.Username || user.username || '' } : null,
            organizations: org ? { name: org.Name || org.name || '' } : null
          };
        });

        this.pageViews = enrichedLogs;
      } catch (err) {
        console.error("Failed to fetch page views logs:", err);
      } finally {
        this.loading = false;
      }
    },
    subscribeRealtime() {
      this.realtimeChannel = supabase
        .channel("page_views_realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "page_views" },
          (payload) => {
            const newLog = payload.new;
            const usersList = this.store.db.users || [];
            const orgsList = this.store.db.organizations || [];
            const user = usersList.find(u => String(u.ID || u.id) === String(newLog.user_id));
            const org = orgsList.find(o => String(o.ID || o.id) === String(newLog.organization_id));
            const enriched = {
              ...newLog,
              users: user ? { name: user.Name || user.name || '', username: user.Username || user.username || '' } : null,
              organizations: org ? { name: org.Name || org.name || '' } : null
            };
            this.pageViews.unshift(enriched);
          }
        )
        .subscribe();
    },
    translatePageName(name) {
      const map = {
        records: "Записи",
        dashboard: "Аналитика",
        refs: "Справочники",
        users: "Персонал (СТО)",
        all_users: "Пользователи (Админ)",
        organizations: "Организации",
        tickets: "Заявки",
        page_analytics: "Логи страниц"
      };
      return map[name] || name;
    },
    getPercentage(count) {
      if (this.pageViews.length === 0) return 0;
      const maxCount = Math.max(...this.popularPagesList.map(p => p.count), 1);
      return Math.round((count / maxCount) * 100);
    },
    formatFullDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const secs = String(d.getSeconds()).padStart(2, "0");
      return `${dd}.${mm}.${yyyy} ${hh}:${mins}:${secs}`;
    },
    formatSubDate(dateStr) {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    }
  }
};
</script>
