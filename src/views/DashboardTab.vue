<template>
  <div class="max-w-7xl mx-auto w-full space-y-5 fade-transition pb-24 px-1 sm:px-3">
    <!-- Period Selector & Summary Header -->
    <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div class="flex gap-1 p-1 bg-slate-100 hover:bg-slate-150 transition-colors border border-slate-200/50 rounded-xl w-full sm:max-w-md">
        <button
          id="dash-period-day"
          class="flex-1 py-1.5 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
          :class="
            dashboardPeriod === 'day'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="dashboardPeriod = 'day'"
        >
          День
        </button>
        <button
          id="dash-period-week"
          class="flex-1 py-1.5 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
          :class="
            dashboardPeriod === 'week'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="dashboardPeriod = 'week'"
        >
          Неделя
        </button>
        <button
          id="dash-period-month"
          class="flex-1 py-1.5 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
          :class="
            dashboardPeriod === 'month'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="dashboardPeriod = 'month'"
        >
          Месяц
        </button>
        <button
          id="dash-period-all"
          class="flex-1 py-1.5 rounded-[8px] text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border-0"
          :class="
            dashboardPeriod === 'all'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'bg-transparent text-slate-500 hover:text-slate-800'
          "
          @click="dashboardPeriod = 'all'"
        >
          Все
        </button>
      </div>

      <div class="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200/60 px-3 py-1.5 rounded-xl shadow-xs">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Всего завершено: <strong>{{ dashStats.count }}</strong> заказов</span>
      </div>
    </div>

            <!-- Sliding Advanced Filters -->
            <div
              v-if="isFiltersExpanded"
              class="bg-indigo-50/60 border border-indigo-100/70 p-3 rounded-xl flex flex-col gap-2 transition-all duration-300 select-none"
              id="dash-filters-pane"
            >
              <div class="flex items-center justify-between">
                <span
                  class="text-[9px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 leading-none"
                >
                  <span class="material-symbols-outlined text-[12px] font-black"
                    >tune</span
                  >
                  Фильтры аналитики
                </span>
                <button
                  id="dash-filters-clear"
                  @click="clearAllDashFilters"
                  class="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition border-0 bg-transparent cursor-pointer"
                >
                  Сбросить
                </button>
              </div>

              <!-- Filter inputs grid -->
              <div class="space-y-3">
                <!-- Organization Selector for Superadmin -->
                <div v-if="user.Role === 'Superadmin' && db.organizations && db.organizations.length > 0" class="flex flex-col gap-1">
                  <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-left">Организация:</span>
                  <div class="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none px-1 -mx-1">
                    <button
                      @click="dashFilterOrg = ''; dashFilterMaster = ''; dashFilterService = '';"
                      class="px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap transition-all border shrink-0 outline-none flex items-center gap-1 cursor-pointer"
                      :class="
                        dashFilterOrg === ''
                          ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      "
                    >
                      <span>Все организации</span>
                    </button>
                    <button
                      v-for="org in db.organizations"
                      :key="org.ID"
                      @click="
                        dashFilterOrg =
                          String(dashFilterOrg) === String(org.ID) ? '' : org.ID;
                        dashFilterMaster = '';
                        dashFilterService = '';
                      "
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 outline-none flex items-center gap-1 cursor-pointer"
                      :class="
                        String(dashFilterOrg) === String(org.ID)
                          ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      "
                    >
                      <span>{{ org.Name }}</span>
                    </button>
                  </div>
                </div>

                <!-- Master & Service Selectors on the same level -->
                <div class="grid grid-cols-2 gap-3">
                  <!-- Master Selector -->
                  <div v-if="user.Role !== 'Master'" class="flex flex-col gap-1 text-left">
                    <span class="text-[8px] font-bold text-slate-450 uppercase tracking-wider ml-1">Мастер:</span>
                    <select
                      v-model="dashFilterMaster"
                      class="h-9 px-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-700 cursor-pointer w-full focus:border-indigo-500 transition"
                    >
                      <option value="">Все мастера</option>
                      <option v-for="m in visibleMastersList" :key="m.ID" :value="m.ID">
                        {{ m.Name || m.Username }}
                      </option>
                    </select>
                  </div>

                  <!-- Service Selector -->
                  <div class="flex flex-col gap-1 text-left" :class="user.Role === 'Master' ? 'col-span-2' : ''">
                    <span class="text-[8px] font-bold text-slate-450 uppercase tracking-wider ml-1">Услуга:</span>
                    <select
                      v-model="dashFilterService"
                      class="h-9 px-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-700 cursor-pointer w-full focus:border-indigo-500 transition"
                    >
                      <option value="">Все услуги</option>
                      <option v-for="s in visibleServicesList" :key="s.ID" :value="s.ID">
                        {{ s.Name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Date Type Selector (Check-in vs Checkout Date Toggle) -->
                <div class="flex flex-col gap-1 text-left">
                  <span class="text-[8px] font-bold text-slate-450 uppercase tracking-wider ml-1">Тип даты для отчета:</span>
                  <div class="flex p-0.5 bg-slate-100 border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      @click="dashDateType = 'checkout'"
                      class="flex-1 py-1 rounded-[8px] text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                      :class="dashDateType === 'checkout' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
                    >
                      По дате выезда (основной)
                    </button>
                    <button
                      type="button"
                      @click="dashDateType = 'checkin'"
                      class="flex-1 py-1 rounded-[8px] text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
                      :class="dashDateType === 'checkin' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
                    >
                      По дате заезда
                    </button>
                  </div>
                </div>

                <!-- Date Range (From and To on the same level) -->
                <div class="grid grid-cols-2 gap-3 text-left">
                  <div class="flex flex-col gap-1">
                    <span class="text-[8px] font-bold text-slate-450 uppercase tracking-wider ml-1">Дата от:</span>
                    <input
                      type="date"
                      v-model="dashDateFrom"
                      class="h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <span class="text-[8px] font-bold text-slate-450 uppercase tracking-wider ml-1">Дата до:</span>
                    <input
                      type="date"
                      v-model="dashDateTo"
                      class="h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 4 KPI Hero Stats Cards (Responsive Grid: 2 cols on mobile, 4 cols on desktop) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5" id="dash-hero-grid">
              <!-- Card 1: Revenue -->
              <div
                class="bg-indigo-600 rounded-2xl p-4 text-white shadow-md border border-indigo-500/10 flex items-center justify-between relative overflow-hidden text-left col-span-2 sm:col-span-1"
                id="dash-hero-revenue"
              >
                <div
                  class="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.08] text-white pointer-events-none select-none"
                >
                  <span class="material-symbols-outlined text-[90px]">payments</span>
                </div>
                <div class="relative z-10">
                  <span class="text-indigo-200 text-[9px] font-bold uppercase tracking-wider block">Выручка за период</span>
                  <h2 class="font-heading text-xl sm:text-2xl font-black tracking-tight mt-0.5 mb-1">
                    {{ dashStats.sum.toLocaleString() }} <span class="text-xs font-bold font-sans">KGS</span>
                  </h2>
                  <div class="flex items-center gap-1 text-[9px] text-indigo-100 font-medium">
                    <span class="material-symbols-outlined text-[12px]">analytics</span>
                    <span>Только завершенные</span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-white text-[18px] bg-white/20 rounded-xl p-2.5 shrink-0 relative z-10">
                  trending_up
                </span>
              </div>

              <!-- Card 2: Completed Orders -->
              <div
                class="bg-white rounded-2xl p-4 shadow-sm border border-slate-150 flex items-center justify-between text-left relative overflow-hidden"
                id="dash-stat-orders"
              >
                <div>
                  <span class="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Выполнено</span>
                  <div class="font-heading text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    {{ dashStats.count }}
                  </div>
                  <span class="text-[9px] text-slate-500 font-bold uppercase">заказов в базе</span>
                </div>
                <span class="material-symbols-outlined text-indigo-600 bg-indigo-50 rounded-xl p-2.5 text-[18px] shrink-0 border border-indigo-100/50">
                  check_circle
                </span>
              </div>

              <!-- Card 3: Avg Check -->
              <div
                class="bg-white rounded-2xl p-4 shadow-sm border border-slate-150 flex items-center justify-between text-left relative overflow-hidden"
                id="dash-stat-avg-check"
              >
                <div>
                  <span class="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Средний чек</span>
                  <div class="font-heading text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    {{
                      dashStats.count
                        ? Math.round(dashStats.sum / dashStats.count).toLocaleString()
                        : 0
                    }}
                  </div>
                  <span class="text-[9px] text-slate-500 font-bold uppercase">KGS / заказ</span>
                </div>
                <span class="material-symbols-outlined text-emerald-600 bg-emerald-50 rounded-xl p-2.5 text-[18px] shrink-0 border border-emerald-100/50">
                  receipt_long
                </span>
              </div>

              <!-- Card 4: Peak Metric / Efficiency -->
              <div
                class="bg-white rounded-2xl p-4 shadow-sm border border-slate-150 flex items-center justify-between text-left relative overflow-hidden col-span-2 sm:col-span-1"
                id="dash-stat-peak"
              >
                <div>
                  <span class="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Пиковый интервал</span>
                  <div class="font-heading text-lg sm:text-xl font-black text-slate-800 leading-tight truncate max-w-[140px]" :title="dashboardInsights.peakLabel">
                    {{ dashboardInsights.peakLabel || '—' }}
                  </div>
                  <span class="text-[9px] text-indigo-600 font-black uppercase">
                    {{ dashboardInsights.peakAmount ? dashboardInsights.peakAmount.toLocaleString() + ' KGS' : '0 KGS' }}
                  </span>
                </div>
                <span class="material-symbols-outlined text-amber-500 bg-amber-50 rounded-xl p-2.5 text-[18px] shrink-0 border border-amber-100/50">
                  award_star
                </span>
              </div>
            </div>

            <!-- Main Analytics Grid: Left 2 Cols (Chart, Insights, Table) + Right 1 Col (Rankings) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <!-- Left Column: Chart, Insights, Completed Orders Journal -->
              <div class="lg:col-span-2 space-y-6">
                <!-- NEW DYNAMIC INTERACTIVE CHART -->
                <div
                  class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-150 shadow-sm text-left flex flex-col gap-3"
                >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span
                    class="material-symbols-outlined text-indigo-500 text-[18px]"
                    >bar_chart</span
                  >
                  <h3 class="font-bold text-xs text-slate-800 font-heading">
                    Динамика выручки
                  </h3>
                </div>
              </div>

              <!-- SVG Bar Chart -->
              <div class="relative py-1 select-none">
                <svg
                  viewBox="0 0 360 140"
                  class="w-full h-auto overflow-visible"
                >
                  <!-- Definitions for gradients -->
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stop-color="#6366f1" />
                      <stop offset="100%" stop-color="#4f46e5" />
                    </linearGradient>
                    <linearGradient
                      id="hoverGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stop-color="#818cf8" />
                      <stop offset="100%" stop-color="#6366f1" />
                    </linearGradient>
                  </defs>

                  <!-- Background Horizontal Grid lines -->
                  <line
                    x1="30"
                    y1="20"
                    x2="350"
                    y2="20"
                    stroke="#f8fafc"
                    stroke-width="1"
                  />
                  <line
                    x1="30"
                    y1="55"
                    x2="350"
                    y2="55"
                    stroke="#f8fafc"
                    stroke-width="1"
                  />
                  <line
                    x1="30"
                    y1="90"
                    x2="350"
                    y2="90"
                    stroke="#f8fafc"
                    stroke-width="1"
                  />
                  <line
                    x1="30"
                    y1="110"
                    x2="350"
                    y2="110"
                    stroke="#cbd5e1"
                    stroke-width="1.5"
                  />

                  <!-- Bars & Labels -->
                  <g v-for="(item, idx) in dashboardChartData" :key="idx">
                    <!-- Draw dynamic bar -->
                    <rect
                      :x="
                        35 +
                        idx * (310 / Math.max(dashboardChartData.length, 1)) +
                        (310 / Math.max(dashboardChartData.length, 1) -
                          Math.min(
                            24,
                            Math.floor(
                              180 / Math.max(dashboardChartData.length, 1),
                            ),
                          )) /
                          2
                      "
                      :y="
                        110 -
                        (Math.max(
                          ...dashboardChartData.map((d) => d.amount),
                          1000,
                        ) > 0
                          ? (item.amount /
                              Math.max(
                                ...dashboardChartData.map((d) => d.amount),
                                1000,
                              )) *
                            85
                          : 0)
                      "
                      :width="
                        Math.min(
                          24,
                          Math.floor(
                            180 / Math.max(dashboardChartData.length, 1),
                          ),
                        )
                      "
                      :height="
                        Math.max(
                          ...dashboardChartData.map((d) => d.amount),
                          1000,
                        ) > 0
                          ? (item.amount /
                              Math.max(
                                ...dashboardChartData.map((d) => d.amount),
                                1000,
                              )) *
                            85
                          : 0
                      "
                      :fill="
                        hoveredBarIndex === idx
                          ? 'url(#hoverGradient)'
                          : 'url(#barGradient)'
                      "
                      rx="4"
                      ry="4"
                      class="transition-all duration-300 cursor-pointer"
                      @mouseenter="hoveredBarIndex = idx"
                      @mouseleave="hoveredBarIndex = null"
                      @touchstart.passive="hoveredBarIndex = idx"
                      @click="
                        hoveredBarIndex = hoveredBarIndex === idx ? null : idx
                      "
                    />

                    <!-- Tick marker context -->
                    <text
                      :x="
                        35 +
                        idx * (310 / Math.max(dashboardChartData.length, 1)) +
                        310 / Math.max(dashboardChartData.length, 1) / 2
                      "
                      y="126"
                      text-anchor="middle"
                      class="text-slate-450 font-bold text-[8px] uppercase tracking-wide fill-current font-sans"
                      @click="
                        hoveredBarIndex = hoveredBarIndex === idx ? null : idx
                      "
                    >
                      {{ item.label }}
                    </text>
                  </g>

                  <!-- Y Axis tick values for visualization -->
                  <text
                    x="5"
                    y="24"
                    class="text-slate-400 font-bold text-[7px] fill-current font-sans"
                  >
                    {{
                      Math.max(
                        ...dashboardChartData.map((d) => d.amount),
                        1000,
                      ).toLocaleString()
                    }}
                  </text>
                  <text
                    x="5"
                    y="65"
                    class="text-slate-400 font-bold text-[7px] fill-current font-sans"
                  >
                    {{
                      Math.round(
                        Math.max(
                          ...dashboardChartData.map((d) => d.amount),
                          1000,
                        ) / 2,
                      ).toLocaleString()
                    }}
                  </text>
                  <text
                    x="5"
                    y="113"
                    class="text-slate-400 font-bold text-[7px] fill-current font-sans"
                  >
                    0
                  </text>
                </svg>
              </div>

              <!-- Summary bar on hover / touch dynamic details -->
              <div
                class="flex items-center justify-between text-slate-500 text-[10px] font-bold bg-slate-50/70 rounded-xl px-2.5 py-1.5 border border-slate-100 min-h-8"
              >
                <span
                  v-if="hoveredBarIndex === null"
                  class="flex items-center gap-1 text-slate-400 font-sans text-[9px]"
                >
                  <i class="bi bi-info-circle"></i> Коснитесь столбца для
                  деталей
                </span>
                <span
                  v-else
                  class="flex items-center justify-between w-full font-sans"
                >
                  <span class="text-indigo-600 font-black uppercase text-[9px]"
                    >{{ dashboardChartData[hoveredBarIndex].label }}:</span
                  >
                  <span class="flex gap-2 text-slate-650 font-extrabold">
                    <span
                      >Выручка:
                      <strong class="text-indigo-650 font-black text-[11px]"
                        >{{
                          dashboardChartData[
                            hoveredBarIndex
                          ].amount.toLocaleString()
                        }}
                        KGS</strong
                      ></span
                    >
                    <span
                      >Заказов:
                      <strong class="text-slate-800 font-black text-[11px]">{{
                        dashboardChartData[hoveredBarIndex].count
                      }}</strong></span
                    >
                  </span>
                </span>
              </div>

              <!-- AUTO RECALCULATED MULTI-USER ANALYTICS INSIGHTS FOR MOBILE (Dynamic Trend metrics) -->
              <div
                v-if="dashboardInsights"
                class="mt-1 bg-gradient-to-tr from-slate-50 to-indigo-50/20 border border-slate-100 p-3 rounded-2xl space-y-2"
              >
                <span
                  class="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1"
                  >Аналитические выводы:</span
                >
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div
                    class="p-2 bg-white rounded-xl border border-slate-100 flex flex-col"
                  >
                    <span
                      class="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold mb-0.5"
                      >Самый прибыльный</span
                    >
                    <span
                      class="text-[10px] font-extrabold text-slate-800 truncate"
                      >{{ dashboardInsights.peakLabel }}</span
                    >
                    <span class="text-indigo-600 font-black text-[11px] mt-0.5"
                      >{{
                        dashboardInsights.peakAmount.toLocaleString()
                      }}
                      KGS</span
                    >
                  </div>
                  <div
                    class="p-2 bg-white rounded-xl border border-slate-100 flex flex-col"
                  >
                    <span
                      class="text-[8px] text-slate-400 uppercase tracking-wider font-extrabold mb-0.5"
                      >Среднее по периоду</span
                    >
                    <span class="text-[10px] font-bold text-slate-500 truncate"
                      >за одну шкалу</span
                    >
                    <span class="text-emerald-600 font-black text-[11px] mt-0.5"
                      >{{
                        dashboardInsights.avgAmount.toLocaleString()
                      }}
                      KGS</span
                    >
                  </div>
                </div>
                <div
                  class="flex items-center justify-between px-1 text-[9px] text-slate-450 font-bold"
                >
                  <span>Всего выручки в графике:</span>
                  <span class="text-slate-800 font-black"
                    >{{ dashboardInsights.totalAmount.toLocaleString() }} KGS
                    ({{ dashboardInsights.totalCount }} зак.)</span
                  >
                </div>
              </div>
            </div>

            <!-- Desktop Orders Journal Table (hidden md:block) -->
            <div class="hidden md:block bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden text-left">
              <div class="p-4 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-500 text-[18px]">table_chart</span>
                  <h3 class="font-bold text-xs text-slate-800 font-heading uppercase tracking-wider m-0">Журнал выполненных заказов</h3>
                </div>
                <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/50">
                  {{ sortedDashRecords.length }} заказов
                </span>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-50/70 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                      <th @click="sortDashRecords('date')" class="px-4 py-2.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                        <div class="flex items-center gap-1">
                          <span>Дата</span>
                          <span class="material-symbols-outlined text-[12px]">{{ getSortDashIcon('date') }}</span>
                        </div>
                      </th>
                      <th @click="sortDashRecords('car')" class="px-4 py-2.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                        <div class="flex items-center gap-1">
                          <span>Авто / Гос.номер</span>
                          <span class="material-symbols-outlined text-[12px]">{{ getSortDashIcon('car') }}</span>
                        </div>
                      </th>
                      <th class="px-4 py-2.5">Клиент</th>
                      <th @click="sortDashRecords('master')" class="px-4 py-2.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                        <div class="flex items-center gap-1">
                          <span>Мастер</span>
                          <span class="material-symbols-outlined text-[12px]">{{ getSortDashIcon('master') }}</span>
                        </div>
                      </th>
                      <th class="px-4 py-2.5">Услуги</th>
                      <th @click="sortDashRecords('amount')" class="px-4 py-2.5 text-right cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                        <div class="flex items-center justify-end gap-1">
                          <span>Сумма</span>
                          <span class="material-symbols-outlined text-[12px]">{{ getSortDashIcon('amount') }}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    <tr v-for="r in paginatedDashRecords" :key="r.ID" class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-4 py-2.5 whitespace-nowrap text-slate-700">
                        <div class="font-bold">{{ formatDashDate(r).date }}</div>
                        <div class="text-[10px] text-slate-400">{{ formatDashDate(r).time }}</div>
                      </td>
                      <td class="px-4 py-2.5">
                        <div class="font-mono font-bold text-slate-900 uppercase tracking-wider">{{ r.CarNumber || '—' }}</div>
                        <div class="text-[10px] text-slate-500 font-sans">{{ getBrandName(r.BrandID) }} {{ getModelName(r.ModelID) }}</div>
                      </td>
                      <td class="px-4 py-2.5 text-slate-700">
                        <div class="font-bold text-xs">{{ r.ClientName || '—' }}</div>
                        <div class="text-[10px] text-slate-400">{{ r.Phone || '' }}</div>
                      </td>
                      <td class="px-4 py-2.5 whitespace-nowrap text-slate-700">
                        <span class="inline-flex items-center gap-1.5 font-semibold">
                          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {{ getMasterName(r.MasterID) }}
                        </span>
                      </td>
                      <td class="px-4 py-2.5 max-w-[200px] truncate text-slate-500 text-[11px]" :title="getRecordServicesText(r)">
                        {{ getRecordServicesText(r) }}
                      </td>
                      <td class="px-4 py-2.5 text-right whitespace-nowrap font-heading font-black text-slate-900 text-xs">
                        {{ Number(r.TotalAmount || 0).toLocaleString() }} KGS
                      </td>
                    </tr>
                    <tr v-if="paginatedDashRecords.length === 0">
                      <td colspan="6" class="py-8 text-center text-slate-400 text-xs font-semibold">
                        Нет завершенных заказов за выбранный период
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination footer if more than recordsPerPage -->
              <div v-if="sortedDashRecords.length > recordsPerPage" class="px-4 py-2.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Страница {{ recordsPage }} из {{ totalDashPages }} (всего {{ sortedDashRecords.length }})</span>
                <div class="flex items-center gap-1.5">
                  <button @click="recordsPage = Math.max(1, recordsPage - 1)" :disabled="recordsPage === 1" class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs transition">
                    Назад
                  </button>
                  <button @click="recordsPage = Math.min(totalDashPages, recordsPage + 1)" :disabled="recordsPage === totalDashPages" class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs transition">
                    Вперед
                  </button>
                </div>
              </div>
            </div>
          </div> <!-- Close Left Column -->

          <!-- Right Column: 1 Col on lg (Rankings / Leaderboards) -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Mechanic Leaderboard (Compact) -->
            <div
              class="bg-white rounded-2xl p-4 border border-slate-150 shadow-sm text-left"
              id="dash-leader-masters"
            >
              <div class="flex items-center gap-1.5 mb-3">
                <span
                  class="material-symbols-outlined text-indigo-500 text-[18px]"
                  >engineering</span
                >
                <h3 class="font-bold text-xs text-slate-800 font-heading">
                  Рейтинг мастеров
                </h3>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(stat, master, idx) in dashMasterStats"
                  :key="master"
                  class="flex justify-between items-center p-2 rounded-xl border border-slate-100 transition-all hover:bg-slate-50/50 bg-white"
                  :class="
                    idx === 0 ? 'bg-indigo-50/20 border-indigo-100/50' : ''
                  "
                >
                  <div class="flex items-center gap-2 max-w-[65%]">
                    <div
                      class="w-6.5 h-6.5 rounded-lg flex items-center justify-center font-black text-[9px] uppercase shrink-0"
                      :class="
                        idx === 0
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-500'
                      "
                    >
                      {{
                        typeof master === "string" && master.length > 0
                          ? master.slice(0, 2)
                          : "М"
                      }}
                    </div>
                    <span class="font-bold text-xs text-slate-700 truncate">{{
                      master
                    }}</span>
                  </div>
                  <div class="flex flex-col items-end shrink-0">
                    <span class="font-extrabold text-xs text-slate-800"
                      >{{ stat.sum.toLocaleString() }} KGS</span
                    >
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-wide"
                      >{{ stat.count }} зак.</span
                    >
                  </div>
                </div>
                <div
                  v-if="Object.keys(dashMasterStats).length === 0"
                  class="text-center py-4 bg-slate-50/50 rounded-xl"
                >
                  <p class="text-slate-400 text-[10px] font-semibold m-0">
                    Нет данных для отображения
                  </p>
                </div>
              </div>
            </div>

            <!-- Services Leaderboard (Compact) -->
            <div
              class="bg-white rounded-2xl p-3.5 border border-slate-150 shadow-sm text-left"
              id="dash-leader-services"
            >
              <div class="flex items-center gap-1.5 mb-3">
                <span
                  class="material-symbols-outlined text-indigo-500 text-[18px]"
                  >build</span
                >
                <h3 class="font-bold text-xs text-slate-800 font-heading">
                  Популярные услуги
                </h3>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(stat, service, idx) in dashServiceStats"
                  :key="service"
                  class="flex justify-between items-center p-2 rounded-xl border border-slate-100 transition-all hover:bg-slate-50/50 bg-white"
                  :class="
                    idx === 0 ? 'bg-indigo-50/20 border-indigo-100/50' : ''
                  "
                >
                  <div class="flex items-center gap-2 max-w-[65%]">
                    <div
                      class="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 shrink-0"
                    >
                      <span class="material-symbols-outlined text-[13px]"
                        >build</span
                      >
                    </div>
                    <span
                      class="font-bold text-xs text-slate-700 truncate"
                      :title="service"
                      >{{ service }}</span
                    >
                  </div>
                  <div class="flex flex-col items-end shrink-0">
                    <span class="font-extrabold text-xs text-slate-800"
                      >{{ stat.sum.toLocaleString() }} KGS</span
                    >
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-wide"
                      >{{ stat.count }} раз</span
                    >
                  </div>
                </div>
                <div
                  v-if="Object.keys(dashServiceStats).length === 0"
                  class="text-center py-4 bg-slate-50/50 rounded-xl"
                >
                  <p class="text-slate-400 text-[10px] font-semibold m-0">
                    Нет данных для отображения
                  </p>
                </div>
              </div>
            </div>

            <!-- Brands Leaderboard (Compact) -->
            <div
              class="bg-white rounded-2xl p-3.5 border border-slate-150 shadow-sm text-left"
              id="dash-leader-brands"
            >
              <div class="flex items-center gap-1.5 mb-3">
                <span
                  class="material-symbols-outlined text-indigo-500 text-[18px]"
                  >directions_car</span
                >
                <h3 class="font-bold text-xs text-slate-800 font-heading">
                  Популярные марки авто
                </h3>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(stat, brand, idx) in dashBrandStats"
                  :key="brand"
                  class="border border-slate-100 rounded-xl overflow-hidden transition-all bg-white"
                  :class="idx === 0 ? 'bg-indigo-50/5 border-indigo-100/50' : ''"
                >
                  <!-- Brand main row (clickable to toggle) -->
                  <div
                    @click="toggleBrandExpanded(brand)"
                    class="flex justify-between items-center p-2 cursor-pointer hover:bg-slate-50/80 transition-all select-none"
                  >
                    <div class="flex items-center gap-2 max-w-[65%]">
                      <div
                        class="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 shrink-0"
                      >
                        <span class="material-symbols-outlined text-[13px]"
                          >directions_car</span
                        >
                      </div>
                      <span class="font-bold text-xs text-slate-700 truncate mr-1">{{
                        brand
                      }}</span>
                      <!-- Expand arrow -->
                      <span
                        class="material-symbols-outlined text-slate-400 text-[14px] transition-transform duration-200"
                        :style="{ transform: isBrandExpanded(brand) ? 'rotate(180deg)' : 'rotate(0)' }"
                      >
                        expand_more
                      </span>
                    </div>
                    <div class="flex flex-col items-end shrink-0">
                      <span class="font-extrabold text-xs text-slate-800"
                        >{{ stat.sum.toLocaleString() }} KGS</span
                      >
                      <span
                        class="text-[9px] font-bold text-slate-400 uppercase tracking-wide"
                        >{{ stat.count }} авто</span
                      >
                    </div>
                  </div>

                  <!-- Expanded details of models -->
                  <div
                    v-if="isBrandExpanded(brand)"
                    class="bg-slate-50 border-t border-slate-100 p-2 space-y-1.5 transition-all text-left"
                  >
                    <div class="text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider px-1 pb-0.5">
                      Детализация моделей
                    </div>
                    <div class="space-y-1">
                      <div
                        v-for="(mStat, mName) in stat.models"
                        :key="mName"
                        class="flex justify-between items-center px-1 text-[11px]"
                      >
                        <div class="flex items-center gap-1.5 max-w-[65%]">
                          <span class="w-1 h-1 rounded-full bg-indigo-400 shrink-0"></span>
                          <span class="font-medium text-slate-600 truncate" :title="mName">{{ mName }}</span>
                        </div>
                        <div class="flex items-center gap-3 shrink-0">
                          <span class="text-slate-400 text-[9px] font-bold uppercase tracking-wider">{{ mStat.count }} авто</span>
                          <span class="font-bold text-slate-700 text-right">{{ mStat.sum.toLocaleString() }} KGS</span>
                        </div>
                      </div>
                      <div v-if="Object.keys(stat.models).length === 0" class="text-center py-2 text-[10px] text-slate-400 font-medium">
                        Нет авто для этой модели
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="Object.keys(dashBrandStats).length === 0"
                  class="text-center py-4 bg-slate-50/50 rounded-xl"
                >
                  <p class="text-slate-400 text-[10px] font-semibold m-0">
                    Нет данных для отображения
                  </p>
                </div>
              </div>
            </div>
          </div> <!-- Close Right Column -->
        </div> <!-- Close Main Analytics Grid -->
      </div> <!-- Close Outer Container -->
</template>
<script>
export default {
  name: "DashboardTab",
  props: ["db", "user", "isFiltersExpanded", "currentUserMasterID", "mastersList", "sortedServices", "getBrandName", "getMasterName", "getServiceName", "getServicePrice", "searchQuery"],
  data() {
    return {
      dashboardPeriod: "all",
      dashboardCustomDate: "",
      dashFilterOrg: "",
      dashFilterMaster: "",
      dashFilterService: "",
      dashFilterDate: "",
      dashDateType: "checkout",
      dashDateFrom: "",
      dashDateTo: "",
      isDashFiltersExpanded: false,
      chartInterval: "day",
      hoveredBarIndex: null,
      expandedBrands: [],
      recordsPage: 1,
      recordsPerPage: 10,
      dashSortKey: "date",
      dashSortAsc: false,
    };
  },
  computed: {
    sortedDashRecords() {
      const recs = [...this.filteredDashRecords];
      const key = this.dashSortKey;
      const asc = this.dashSortAsc;
      
      return recs.sort((a, b) => {
        let valA, valB;
        if (key === 'date') {
          const dateA = this.dashDateType === 'checkin' ? a.StartTime : (a.EndTime || a.StartTime);
          const dateB = this.dashDateType === 'checkin' ? b.StartTime : (b.EndTime || b.StartTime);
          valA = new Date(dateA || 0).getTime();
          valB = new Date(dateB || 0).getTime();
        } else if (key === 'car') {
          valA = String(a.CarNumber || '').toLowerCase();
          valB = String(b.CarNumber || '').toLowerCase();
        } else if (key === 'master') {
          valA = String(this.getMasterName(a.MasterID) || '').toLowerCase();
          valB = String(this.getMasterName(b.MasterID) || '').toLowerCase();
        } else if (key === 'amount') {
          valA = Number(a.TotalAmount) || 0;
          valB = Number(b.TotalAmount) || 0;
        } else {
          valA = a[key] || '';
          valB = b[key] || '';
        }

        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    },
    totalDashPages() {
      return Math.ceil(this.sortedDashRecords.length / this.recordsPerPage) || 1;
    },
    paginatedDashRecords() {
      const start = (this.recordsPage - 1) * this.recordsPerPage;
      return this.sortedDashRecords.slice(start, start + this.recordsPerPage);
    },
    filteredDashRecords() {
      if (!this.db || !this.db.records) return [];
      let now = new Date();
      return this.db.records.filter((r) => {
        if (r.Status !== "Выполнен") return false;
        if (!r.StartTime) return false;

        // Organization filter (only for Superadmin)
        if (this.user && this.user.Role === "Superadmin" && this.dashFilterOrg) {
          if (String(r.OrganizationID) !== String(this.dashFilterOrg)) return false;
        }

        // Search query filter
        if (this.searchQuery) {
          const q = this.searchQuery.toLowerCase().trim();
          const targetStr = (
            (r.CarNumber || "") +
            " " +
            (r.ClientName || "") +
            " " +
            (this.getMasterName(r.MasterID) || "")
          ).toLowerCase();
          if (!targetStr.includes(q)) return false;
        }

        // Role restrictions & Master filter
        if (this.user && this.user.Role === "Master") {
          if (r.MasterID !== this.currentUserMasterID) return false;
        } else if (this.dashFilterMaster) {
          if (String(r.MasterID) !== String(this.dashFilterMaster))
            return false;
        }

        // Service filter
        if (this.dashFilterService) {
          let s = [];
          try {
            s =
              typeof r.ServicesJSON === "string"
                ? JSON.parse(r.ServicesJSON || "[]")
                : r.ServicesJSON || [];
          } catch (e) {
            s = [];
          }
          if (!s.includes(this.dashFilterService)) return false;
        }

        // Date Type selection: checkin (StartTime) or checkout (EndTime)
        let recordDateStr = (this.dashDateType === 'checkin')
          ? r.StartTime
          : (r.EndTime || r.StartTime);
        if (!recordDateStr) return false;

        let d = new Date(recordDateStr);

        // Date Range filtering (От / До)
        if (this.dashDateFrom) {
          let dFrom = new Date(this.dashDateFrom);
          dFrom.setHours(0, 0, 0, 0);
          if (d < dFrom) return false;
        }
        if (this.dashDateTo) {
          let dTo = new Date(this.dashDateTo);
          dTo.setHours(23, 59, 59, 999);
          if (d > dTo) return false;
        }

        // Fallback to quick period selector if no date range is set
        if (!this.dashDateFrom && !this.dashDateTo) {
          if (this.dashboardPeriod === "day") {
            if (d.toDateString() !== now.toDateString()) return false;
          } else if (this.dashboardPeriod === "month") {
            if (
              d.getMonth() !== now.getMonth() ||
              d.getFullYear() !== now.getFullYear()
            )
              return false;
          } else if (this.dashboardPeriod === "week") {
            let dt = new Date(now);
            dt.setDate(dt.getDate() - (dt.getDay() || 7) + 1); // Monday
            dt.setHours(0, 0, 0, 0);
            if (d < dt) return false;
          }
        }

        return true;
      });
    },
    dashStats() {
      let recs = this.filteredDashRecords;
      let sum = recs.reduce(
        (acc, val) => acc + (Number(val.TotalAmount) || 0),
        0,
      );
      return { count: recs.length, sum: sum };
    },
    visibleMastersList() {
      if (!this.mastersList) return [];
      if (this.user && this.user.Role === 'Superadmin' && this.dashFilterOrg) {
        return this.mastersList.filter(m => String(m.OrganizationID) === String(this.dashFilterOrg));
      }
      return this.mastersList;
    },
    visibleServicesList() {
      if (!this.sortedServices) return [];
      if (this.user && this.user.Role === 'Superadmin' && this.dashFilterOrg) {
        return this.sortedServices.filter(s => String(s.OrganizationID) === String(this.dashFilterOrg));
      }
      return this.sortedServices;
    },
    dashMasterStats() {
      let map = {};
      this.filteredDashRecords.forEach((r) => {
        let m = this.getMasterName(r.MasterID) || "Неизвестно";
        if (!map[m]) map[m] = { count: 0, sum: 0 };
        map[m].count++;
        map[m].sum += Number(r.TotalAmount) || 0;
      });
      let sorted = Object.entries(map)
        .sort((a, b) => b[1].sum - a[1].sum)
        .slice(0, 5);
      return Object.fromEntries(sorted);
    },
    dashBrandStats() {
      let map = {};
      this.filteredDashRecords.forEach((r) => {
        let b = this.getBrandName(r.BrandID) || "Неизвестно";
        let m = this.getModelName(r.ModelID) || "Другая модель / Не указана";
        
        if (!map[b]) {
          map[b] = { count: 0, sum: 0, models: {} };
        }
        map[b].count++;
        map[b].sum += Number(r.TotalAmount) || 0;

        if (!map[b].models[m]) {
          map[b].models[m] = { count: 0, sum: 0 };
        }
        map[b].models[m].count++;
        map[b].models[m].sum += Number(r.TotalAmount) || 0;
      });

      // Sort models descending for each brand
      let sorted = Object.entries(map)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

      let result = {};
      sorted.forEach(([bName, bData]) => {
        let sortedModels = Object.entries(bData.models)
          .sort((x, y) => y[1].count - x[1].count);
        result[bName] = {
          count: bData.count,
          sum: bData.sum,
          models: Object.fromEntries(sortedModels)
        };
      });
      return result;
    },
    dashServiceStats() {
      let map = {};
      this.filteredDashRecords.forEach((r) => {
        if (r.ServicesJSON) {
          let sids = [];
          try {
            sids = typeof r.ServicesJSON === "string"
              ? JSON.parse(r.ServicesJSON || "[]")
              : r.ServicesJSON || [];
          } catch (e) {
            sids = [];
          }

          sids.forEach((item) => {
            let sname = "";
            let sprice = 0;
            let isCustom = false;

            if (item && typeof item === "object") {
              const sid = item.id;
              let foundInDb = this.db.services.find((s) => s.ID == sid);
              
              if (item.isCustom || String(sid).startsWith("custom_") || !foundInDb) {
                isCustom = true;
                sname = "Прочая услуга";
                sprice = Number(item.price) || 0;
              } else {
                sname = foundInDb.Name || item.name;
                sprice = Number(item.price) || Number(foundInDb.Price) || 0;
              }
            } else if (item) {
              let foundInDb = this.db.services.find((s) => s.ID == item);
              if (foundInDb) {
                sname = foundInDb.Name;
                sprice = Number(foundInDb.Price) || 0;
              } else {
                isCustom = true;
                sname = "Прочая услуга";
                sprice = 0;
              }
            }

            if (sname) {
              if (!map[sname]) map[sname] = { count: 0, sum: 0 };
              map[sname].count++;
              map[sname].sum += Number(sprice);
            }
          });
        }
      });
      let sorted = Object.entries(map)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
      return Object.fromEntries(sorted);
    },
    dashboardChartData() {
      let records = this.filteredDashRecords;
      if (!records || records.length === 0) return [];

      let period = this.dashboardPeriod;
      let list = [];
      
      const getRecordDate = (r) => {
        let recordDateStr = (this.dashDateType === 'checkin')
          ? r.StartTime
          : (r.EndTime || r.StartTime);
        return new Date(recordDateStr);
      };

      if (this.dashDateFrom || this.dashDateTo || this.dashFilterDate || period === "day" || period === "custom") {
        let map = {};
        records.forEach(r => {
          let rDate = getRecordDate(r);
          let dateStr = rDate.toDateString();
          if (!map[dateStr]) map[dateStr] = { amount: 0, count: 0, d: rDate };
          map[dateStr].amount += Number(r.TotalAmount) || 0;
          map[dateStr].count++;
        });
        Object.values(map).sort((a,b)=>a.d - b.d).forEach(item => {
           let dd = String(item.d.getDate()).padStart(2, "0");
           let mm = String(item.d.getMonth() + 1).padStart(2, "0");
           list.push({ label: `${dd}.${mm}`, amount: item.amount, count: item.count });
        });
        return list;
      } 
      else if (period === "week") {
        let now = new Date();
        let mon = new Date(now);
        mon.setDate(now.getDate() - (now.getDay() || 7) + 1);
        for (let i=0; i<7; i++) {
           let d = new Date(mon);
           d.setDate(mon.getDate() + i);
           let dateStr = d.toDateString();
           let amount = 0, count = 0;
           records.forEach(r => {
             if (getRecordDate(r).toDateString() === dateStr) {
               amount += Number(r.TotalAmount) || 0;
               count++;
             }
           });
           let dd = String(d.getDate()).padStart(2, "0");
           let mm = String(d.getMonth() + 1).padStart(2, "0");
           list.push({ label: `${dd}.${mm}`, amount, count });
        }
        return list;
      }
      else if (period === "month") {
        let now = new Date();
        let m = now.getMonth();
        let y = now.getFullYear();
        let daysInMonth = new Date(y, m + 1, 0).getDate();
        for (let i=1; i<=daysInMonth; i++) {
           let d = new Date(y, m, i);
           let dateStr = d.toDateString();
           let amount = 0, count = 0;
           records.forEach(r => {
             if (getRecordDate(r).toDateString() === dateStr) {
               amount += Number(r.TotalAmount) || 0;
               count++;
             }
           });
           let dd = String(d.getDate()).padStart(2, "0");
           let mm = String(d.getMonth() + 1).padStart(2, "0");
           list.push({ label: `${dd}.${mm}`, amount, count });
        }
        return list;
      }
      else {
        let monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
        let map = {};
        records.forEach(r => {
           let d = getRecordDate(r);
           let key = d.getFullYear() + "-" + d.getMonth();
           if (!map[key]) map[key] = { amount: 0, count: 0, y: d.getFullYear(), m: d.getMonth() };
           map[key].amount += Number(r.TotalAmount) || 0;
           map[key].count++;
        });
        Object.values(map).sort((a,b) => {
           if (a.y !== b.y) return a.y - b.y;
           return a.m - b.m;
        }).forEach(item => {
           list.push({ label: `${monthNames[item.m]} ${String(item.y).slice(-2)}`, amount: item.amount, count: item.count });
        });
        return list;
      }
    },
    dashboardInsights() {
      let dData = this.dashboardChartData || [];
      if (dData.length === 0)
        return {
          peakLabel: "—",
          peakAmount: 0,
          avgAmount: 0,
          totalAmount: 0,
          totalCount: 0,
        };
      let maxVal = -1;
      let peak = null;
      let total = 0;
      let activeCount = 0;
      dData.forEach((d) => {
        total += d.amount;
        activeCount += d.count;
        if (d.amount > maxVal) {
          maxVal = d.amount;
          peak = d;
        }
      });
      let avg = dData.length ? Math.round(total / dData.length) : 0;
      return {
        peakLabel: peak ? peak.label : "—",
        peakAmount: maxVal,
        avgAmount: avg,
        totalAmount: total,
        totalCount: activeCount,
      };
    },
  },
  methods: {
    clearAllDashFilters() {
      this.dashFilterOrg = "";
      this.dashFilterMaster = "";
      this.dashFilterService = "";
      this.dashFilterDate = "";
      this.dashboardPeriod = "all";
      this.dashboardCustomDate = "";
      this.dashDateType = "checkout";
      this.dashDateFrom = "";
      this.dashDateTo = "";
    },
    toggleBrandExpanded(brand) {
      const index = this.expandedBrands.indexOf(brand);
      if (index > -1) {
        this.expandedBrands.splice(index, 1);
      } else {
        this.expandedBrands.push(brand);
      }
    },
    isBrandExpanded(brand) {
      return this.expandedBrands.includes(brand);
    },
    getModelName(id) {
      if (!this.db || !this.db.models) return '';
      let m = this.db.models.find((x) => x.ID == id);
      return m ? m.Name : '';
    },
    sortDashRecords(key) {
      if (this.dashSortKey === key) {
        this.dashSortAsc = !this.dashSortAsc;
      } else {
        this.dashSortKey = key;
        this.dashSortAsc = false;
      }
      this.recordsPage = 1;
    },
    getSortDashIcon(key) {
      if (this.dashSortKey !== key) return 'unfold_more';
      return this.dashSortAsc ? 'arrow_upward' : 'arrow_downward';
    },
    formatDashDate(r) {
      const dStr = this.dashDateType === 'checkin' ? r.StartTime : (r.EndTime || r.StartTime);
      if (!dStr) return { date: '—', time: '' };
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return { date: dStr, time: '' };
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return { date: `${dd}.${mm}.${d.getFullYear()}`, time: `${hh}:${min}` };
    },
    getRecordServicesText(r) {
      if (!r.ServicesJSON) return "—";
      try {
        const list = typeof r.ServicesJSON === 'string' ? JSON.parse(r.ServicesJSON) : r.ServicesJSON;
        if (!Array.isArray(list) || list.length === 0) return "—";
        return list.map(item => {
          if (item && typeof item === 'object') {
            return item.name || (this.db.services?.find(s => s.ID == item.id)?.Name) || 'Услуга';
          }
          return this.db.services?.find(s => s.ID == item)?.Name || 'Услуга';
        }).join(", ");
      } catch (e) {
        return "—";
      }
    }
  }
};
</script>
