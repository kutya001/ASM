<template>
  <div
    class="min-h-screen w-full bg-slate-50 text-slate-800 font-sans relative overflow-x-hidden pb-16 select-none selection:bg-indigo-500 selection:text-white"
  >
    <!-- Subtle architectural background patterns -->
    <div
      class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"
    ></div>
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-gradient-to-b from-indigo-100/60 via-indigo-50/20 to-transparent blur-3xl pointer-events-none"
    ></div>

    <!-- 1. LANDING VIEW -->
    <div v-if="!showAuth" class="animate-fade-in relative z-10">
      <!-- Navbar -->
      <header
        class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between"
      >
        <div class="flex items-center gap-2 sm:gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white shrink-0"
          >
            <i :class="store.appIcon || 'bi-car-front-fill'" class="text-white text-base"></i>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="font-black text-base sm:text-lg tracking-tight font-heading text-slate-900 uppercase">
              ASM ERP
            </span>
            <span class="hidden sm:inline-block px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[10px] font-bold">
              v2.0
            </span>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
          <a href="#features" class="hover:text-indigo-600 transition">Возможности</a>
          <a href="#modules" class="hover:text-indigo-600 transition">Модули СТО</a>
          <a href="#pricing" class="hover:text-indigo-600 transition">Тариф</a>
          <a href="#contacts" class="hover:text-indigo-600 transition">Контакты</a>
        </nav>

        <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            @click="showAuth = true; authMode = 'login'"
            class="h-9 px-2.5 sm:px-4 text-slate-700 hover:text-indigo-600 font-bold text-xs rounded-xl hover:bg-slate-100/80 transition border-none bg-transparent cursor-pointer"
          >
            Войти
          </button>
          <button
            @click="showAuth = true; authMode = 'register'"
            class="h-9 px-3 sm:px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-indigo-600/20 hover:shadow-md transition border-none cursor-pointer flex items-center gap-1 whitespace-nowrap"
          >
            <span>Начать</span>
            <i class="bi bi-arrow-right-short text-sm"></i>
          </button>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-12 text-center flex flex-col items-center gap-5">
        <!-- Status Pill -->
        <div
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-700"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Облачная платформа для автосервисов Кыргызстана</span>
        </div>

        <h1
          class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 font-heading max-w-3xl leading-[1.15]"
        >
          Управляйте автосервисом
          <span class="text-indigo-600">легко, прозрачно</span>
          и прибыльно
        </h1>

        <p class="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
          Электронный журнал постов, заказ-наряды с отправкой клиенту в WhatsApp, контроль запчастей,
          прозрачный расчет зарплаты мастеров и финансовая аналитика — всё в единой системе без блокнотов и хаоса.
        </p>

        <!-- CTA Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
          <button
            @click="showAuth = true; authMode = 'register'"
            class="w-full sm:w-auto h-12 px-7 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <i class="bi bi-rocket-takeoff-fill"></i>
            <span>Создать автосервис</span>
          </button>
          <a
            href="#pricing"
            class="w-full sm:w-auto h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 decoration-none"
          >
            <span>Рассчитать тариф</span>
            <i class="bi bi-chevron-down text-xs text-slate-400"></i>
          </a>
        </div>

        <!-- Trust Features Row -->
        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 text-xs font-semibold text-slate-500">
          <span class="flex items-center gap-1.5">
            <i class="bi bi-check-circle-fill text-emerald-500"></i>
            Быстрый старт за 2 минуты
          </span>
          <span class="flex items-center gap-1.5">
            <i class="bi bi-check-circle-fill text-emerald-500"></i>
            Удобно на ПК, планшете и смартфоне
          </span>
          <span class="flex items-center gap-1.5">
            <i class="bi bi-check-circle-fill text-emerald-500"></i>
            Формат номеров KG и валюта сом (KGS)
          </span>
        </div>

        <!-- Interactive Hero Showcase Window -->
        <div
          class="w-full mt-8 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-3 sm:p-5 text-left overflow-hidden select-none"
        >
          <!-- Window Titlebar -->
          <div class="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-red-400"></span>
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              <span class="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md ml-2 hidden sm:inline-block">
                asm-erp.app/station/auto-pro
              </span>
            </div>

            <!-- Demo Interactive Tabs -->
            <div class="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
              <button
                @click="heroActiveTab = 'posts'"
                class="px-3 py-1 text-xs font-bold rounded-lg transition border-none cursor-pointer"
                :class="heroActiveTab === 'posts' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
              >
                <i class="bi bi-layout-three-columns mr-1"></i>
                Посты СТО
              </button>
              <button
                @click="heroActiveTab = 'order'"
                class="px-3 py-1 text-xs font-bold rounded-lg transition border-none cursor-pointer"
                :class="heroActiveTab === 'order' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
              >
                <i class="bi bi-receipt mr-1"></i>
                Заказ-наряд
              </button>
              <button
                @click="heroActiveTab = 'stats'"
                class="px-3 py-1 text-xs font-bold rounded-lg transition border-none cursor-pointer"
                :class="heroActiveTab === 'stats' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
              >
                <i class="bi bi-graph-up mr-1"></i>
                Выручка
              </button>
            </div>
          </div>

          <!-- TAB 1: POSTS & BAYS -->
          <div v-if="heroActiveTab === 'posts'" class="animate-fade-in space-y-3">
            <div class="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Загрузка боксов: <strong class="text-slate-800">4 из 5 занято</strong></span>
              <span class="inline-flex items-center gap-1 text-emerald-600">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> В работе
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- Bay 1 Card -->
              <div class="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:border-indigo-200 transition">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-indigo-600">Пост 1 • Подъёмник</span>
                  <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">В работе</span>
                </div>
                <!-- Car Plate Kyrgyz Style -->
                <div class="flex items-center gap-2 mb-2">
                  <div class="inline-flex items-center border border-slate-300 rounded px-1.5 py-0.5 bg-white shadow-xs font-mono font-black text-xs text-slate-800">
                    <span class="text-[9px] text-red-600 font-bold mr-1">KG</span>
                    01 777 ABC
                  </div>
                  <span class="text-xs font-bold text-slate-800 truncate">Toyota Camry 70</span>
                </div>
                <div class="text-[11px] text-slate-600 mb-2.5">
                  Замена масла, колодки и фильтры
                </div>
                <div class="flex items-center justify-between text-[11px] pt-2 border-t border-indigo-100/60">
                  <span class="text-slate-500">Мастер: <strong class="text-slate-700">Куба</strong></span>
                  <span class="font-bold text-indigo-600">3 200 KGS</span>
                </div>
              </div>

              <!-- Bay 2 Card -->
              <div class="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-slate-500">Пост 2 • Подъёмник</span>
                  <span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">Ожидает запчасти</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="inline-flex items-center border border-slate-300 rounded px-1.5 py-0.5 bg-white shadow-xs font-mono font-black text-xs text-slate-800">
                    <span class="text-[9px] text-red-600 font-bold mr-1">KG</span>
                    02 888 AUD
                  </div>
                  <span class="text-xs font-bold text-slate-800 truncate">BMW X5 G05</span>
                </div>
                <div class="text-[11px] text-slate-600 mb-2.5">
                  Замена рычагов и пневмоподушки
                </div>
                <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span class="text-slate-500">Мастер: <strong class="text-slate-700">Адилет</strong></span>
                  <span class="font-bold text-slate-800">6 500 KGS</span>
                </div>
              </div>

              <!-- Bay 3 Card -->
              <div class="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:border-emerald-200 transition">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700">Пост 3 • Электрика</span>
                  <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Готов к выдаче</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="inline-flex items-center border border-slate-300 rounded px-1.5 py-0.5 bg-white shadow-xs font-mono font-black text-xs text-slate-800">
                    <span class="text-[9px] text-red-600 font-bold mr-1">KG</span>
                    08 123 BSH
                  </div>
                  <span class="text-xs font-bold text-slate-800 truncate">Lexus RX 350</span>
                </div>
                <div class="text-[11px] text-slate-600 mb-2.5">
                  Диагностика датчиков ABS, калибровка
                </div>
                <div class="flex items-center justify-between text-[11px] pt-2 border-t border-emerald-100/60">
                  <span class="text-slate-500">Мастер: <strong class="text-slate-700">Нурлан</strong></span>
                  <span class="font-bold text-emerald-700">2 800 KGS</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: ORDER & WHATSAPP SLIP -->
          <div v-else-if="heroActiveTab === 'order'" class="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Order summary table -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-slate-800">Заказ-наряд #1048</span>
                <span class="text-[10px] font-mono text-slate-500">01 KG 777 ABC</span>
              </div>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between text-slate-600 pb-1.5 border-b border-slate-200">
                  <span>Замена моторного масла</span>
                  <span class="font-bold text-slate-900">600 KGS</span>
                </div>
                <div class="flex justify-between text-slate-600 pb-1.5 border-b border-slate-200">
                  <span>Масло Shell Helix Ultra 5W-30 (5L)</span>
                  <span class="font-bold text-slate-900">3 800 KGS</span>
                </div>
                <div class="flex justify-between text-slate-600 pb-1.5 border-b border-slate-200">
                  <span>Замена тормозных колодок</span>
                  <span class="font-bold text-slate-900">1 200 KGS</span>
                </div>
                <div class="flex justify-between items-baseline pt-2">
                  <span class="font-bold text-slate-700">Итого к оплате:</span>
                  <span class="text-base font-black text-indigo-600 font-heading">5 600 KGS</span>
                </div>
              </div>
            </div>

            <!-- WhatsApp preview bubble -->
            <div class="bg-[#eef8f1] rounded-xl p-4 border border-emerald-200/80 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2 text-emerald-800 text-xs font-bold">
                  <i class="bi bi-whatsapp text-emerald-600"></i>
                  <span>Отправка клиенту в WhatsApp</span>
                </div>
                <div class="bg-white p-3 rounded-lg border border-emerald-100 shadow-xs text-xs text-slate-700 leading-relaxed">
                  «Здравствуйте, Эркин! Автомобиль Toyota Camry готов к выдаче. Заказ-наряд #1048 на сумму 5 600 KGS. Ждем вас на СТО "Auto Pro".»
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                <span class="flex items-center gap-1">
                  <i class="bi bi-check2-all text-emerald-600"></i>
                  Отправка в 1 клик со смартфона
                </span>
                <span class="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                  Готово к отправке
                </span>
              </div>
            </div>
          </div>

          <!-- TAB 3: STATS & REVENUE -->
          <div v-else class="animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Выручка за май</span>
              <div class="text-xl font-black text-slate-900 font-heading mt-1">128 450 KGS</div>
              <span class="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <i class="bi bi-arrow-up-right"></i> +18.4% к прошлому месяцу
              </span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Средний чек</span>
              <div class="text-xl font-black text-slate-900 font-heading mt-1">2 378 KGS</div>
              <span class="text-[11px] text-slate-500 font-semibold block mt-1">Всего завершено 54 заказа</span>
            </div>
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Топ мастер</span>
              <div class="text-base font-black text-slate-900 mt-1">Куба (54 200 KGS)</div>
              <span class="text-[11px] text-indigo-600 font-bold block mt-1">21 выполненный заказ</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. MODULES SECTION (Bento Grid of 4 Key Auto Service Modules) -->
      <section id="modules" class="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div class="text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold">
            <i class="bi bi-grid-fill"></i>
            <span>Модули платформы</span>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-heading">
            Все что нужно для вашего автосервиса
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-normal">
            Каждый блок системы спроектирован с учётом реальных рабочих процессов мастеров и руководителей СТО.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <!-- BLOCK 1: Bay Timeline & Records -->
          <div
            class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600 mb-4">
                <i class="bi bi-calendar-check-fill text-lg"></i>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 font-heading mb-2">
                Записи клиентов и загрузка постов
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                Мастера видят свои машины, администратор контролирует свободные боксы в реальном времени. Никаких накладок, потерянных записей и бумажных блокнотов.
              </p>
            </div>

            <!-- Interactive UI Mockup for Bay -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700">Бокс №1 (Подъёмник)</span>
                <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">В работе (35 мин)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="inline-flex items-center border border-slate-300 rounded px-2 py-0.5 bg-white font-mono font-bold text-xs">
                  <span class="text-[9px] text-red-600 font-bold mr-1">KG</span>
                  01 777 ABC
                </div>
                <span class="text-xs font-semibold text-slate-800">Toyota Camry 70</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div class="bg-blue-600 h-full rounded-full" style="width: 70%"></div>
              </div>
            </div>
          </div>

          <!-- BLOCK 2: Work Orders & WhatsApp -->
          <div
            class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-4">
                <i class="bi bi-receipt-cutoff text-lg"></i>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 font-heading mb-2">
                Заказ-наряды и WhatsApp в 1 клик
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                Фиксируйте работы и запчасти, формируйте электронный заказ-наряд и мгновенно отправляйте клиенту в WhatsApp уведомление о готовности с точной суммой.
              </p>
            </div>

            <!-- Interactive UI Mockup for WhatsApp Order -->
            <div class="bg-[#f2faf4] border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
              <div class="flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span>Заказ-наряд #1042</span>
                <span class="text-emerald-700">5 500 KGS</span>
              </div>
              <div class="bg-white p-2.5 rounded-lg border border-emerald-100 text-xs text-slate-700">
                <span class="text-[10px] text-slate-400 block mb-1">WhatsApp клиенту:</span>
                «Здравствуйте! Ваш авто готов. Сумма: 5 500 KGS. Можете забирать.»
              </div>
            </div>
          </div>

          <!-- BLOCK 3: Financial Analytics & Team Leaderboard -->
          <div
            class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-600 mb-4">
                <i class="bi bi-bar-chart-line-fill text-lg"></i>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 font-heading mb-2">
                Финансовая аналитика и выручка
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                Автоматический учёт общей кассы, среднего чека и персональной выработки каждого мастера. Руководитель видит прозрачный баланс за любой период.
              </p>
            </div>

            <!-- Interactive Mini Revenue Bar Chart -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500 font-semibold">Выручка по месяцам</span>
                <span class="font-bold text-purple-700">128 450 KGS (Май)</span>
              </div>
              <div class="flex items-end justify-between gap-2 h-14 pt-2">
                <div v-for="(item, idx) in dashboardChartData" :key="idx" class="flex-1 flex flex-col items-center gap-1">
                  <div
                    class="w-full rounded-t transition-all"
                    :class="idx === 4 ? 'bg-purple-600' : 'bg-slate-300 hover:bg-purple-400'"
                    :style="{ height: (item.amount / 128450 * 42) + 'px' }"
                  ></div>
                  <span class="text-[9px] font-bold text-slate-400">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BLOCK 4: Car Database & Services Catalog -->
          <div
            class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4">
                <i class="bi bi-car-front-fill text-lg"></i>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 font-heading mb-2">
                База марок, моделей и каталог услуг
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                Более 80 автомобильных брендов и сотен моделей уже в системе. Быстрый выбор услуг с предустановленными ценами ускоряет оформление до 20 секунд.
              </p>
            </div>

            <!-- Interactive Brand Filter Demo -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Интерактивный выбор марки:</div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="brand in ['Toyota', 'BMW', 'Mercedes', 'Hyundai', 'Lexus']"
                  :key="brand"
                  @click="demoBrand = brand"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer"
                  :class="demoBrand === brand ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'"
                >
                  {{ brand }}
                </button>
              </div>
              <div class="text-xs text-slate-600 pt-1 flex items-center justify-between">
                <span>Модель: <strong>{{ demoModel }}</strong></span>
                <span class="text-indigo-600 font-bold">База цен загружена</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. PRICING SECTION - "ПРОСТО ОСТАВЬ ТАРИФ И ВСЁ" -->
      <section id="pricing" class="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <div class="text-center space-y-3">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
            <i class="bi bi-tag-fill"></i>
            <span>Единый прозрачный тариф</span>
          </div>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-heading">
            Простые и честные условия
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-normal">
            Никаких скрытых платежей, ограничений по количеству заказов или платных обновлений.
          </p>
        </div>

        <div class="bg-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-100/40 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          <!-- Left Details: 3 Columns -->
          <div class="md:col-span-3 space-y-6">
            <div class="space-y-2">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                Базовый пакет СТО
              </div>
              <h3 class="text-2xl font-black text-slate-900 font-heading">
                Полный доступ ко всем функциям
              </h3>
              <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">
                В базовую подписку входит полноценная работа до <strong>3 сотрудников</strong> (руководитель и мастера). Если штат больше — всего 500 сомов за каждого дополнительного мастера в месяц.
              </p>
            </div>

            <!-- What's included checkmarks -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold text-slate-700">
              <div class="flex items-center gap-2">
                <i class="bi bi-check-circle-fill text-emerald-500 text-sm"></i>
                <span>Неограниченно записей и постов</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="bi bi-check-circle-fill text-emerald-500 text-sm"></i>
                <span>WhatsApp отправка в 1 клик</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="bi bi-check-circle-fill text-emerald-500 text-sm"></i>
                <span>Справочник 80+ марок авто</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="bi bi-check-circle-fill text-emerald-500 text-sm"></i>
                <span>Финансовая аналитика и выручка</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="bi bi-check-circle-fill text-emerald-500 text-sm"></i>
                <span>Роли: Владелец, Мастер</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="bi bi-check-circle-fill text-emerald-500 text-sm"></i>
                <span>Облачная база в реальном времени</span>
              </div>
            </div>

            <!-- Interactive Staff Slider -->
            <div class="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
              <div class="flex justify-between items-baseline">
                <span class="text-xs font-bold text-slate-700">Количество сотрудников в СТО:</span>
                <span class="text-sm font-black text-indigo-600 font-heading">{{ numAccounts }} чел.</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                v-model.number="numAccounts"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div class="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>1 мастер</span>
                <span>10 сотрудников</span>
                <span>20 мастеров</span>
              </div>
            </div>
          </div>

          <!-- Right Calculation Box: 2 Columns -->
          <div class="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white text-center flex flex-col justify-between gap-6 shadow-lg shadow-indigo-600/30">
            <div class="space-y-3">
              <div class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white">
                🔥 Скидка 50% на 1-й месяц
              </div>
              
              <div class="pt-2">
                <div class="text-[11px] uppercase tracking-wider text-indigo-200 font-bold">К оплате за первый месяц:</div>
                <div class="text-3xl sm:text-4xl font-black font-heading mt-1">
                  {{ calculatedPrice.firstMonth.toLocaleString() }} KGS
                </div>
                <div class="text-xs text-indigo-200 font-semibold mt-1">
                  Далее: {{ calculatedPrice.regular.toLocaleString() }} KGS/мес.
                </div>
              </div>

              <div class="pt-3 border-t border-indigo-500/60 text-left text-xs text-indigo-100 space-y-1">
                <div class="flex justify-between">
                  <span>Базовый пакет:</span>
                  <span class="font-bold text-white">1 500 KGS</span>
                </div>
                <div v-if="calculatedPrice.extraAccounts > 0" class="flex justify-between">
                  <span>Доп. сотрудники ({{ calculatedPrice.extraAccounts }} x 500):</span>
                  <span class="font-bold text-white">+{{ calculatedPrice.extraCost }} KGS</span>
                </div>
              </div>
            </div>

            <button
              @click="showAuth = true; authMode = 'register'"
              class="w-full h-11 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs rounded-xl shadow-md transition border-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Подключить автосервис</span>
              <i class="bi bi-arrow-right-short text-base"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- 4. CONTACTS & SUPPORT SECTION -->
      <section id="contacts" class="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
        <div class="space-y-2">
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Личная поддержка и помощь при внедрении
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Помогу перенести существующую базу клиентов, настроить список постов и обучить ваших мастеров за 15 минут.
          </p>
        </div>

        <div class="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              К
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 m-0">Кутман</h3>
              <span class="text-xs text-slate-500 font-semibold block mt-0.5">Разработчик платформы ASM ERP</span>
              <span class="text-xs font-mono font-bold text-indigo-600 block mt-1">+996 (500) 888 268</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <a
              href="https://wa.me/996500888268?text=Здравствуйте!%20Хочу%20подключить%20ASM%20ERP."
              target="_blank"
              class="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 decoration-none"
            >
              <i class="bi bi-whatsapp"></i>
              <span>Написать в WhatsApp</span>
            </a>
            <a
              href="tel:+996500888268"
              class="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 decoration-none"
            >
              <i class="bi bi-telephone-fill text-slate-500"></i>
              <span>Позвонить</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="max-w-5xl mx-auto px-4 pt-10 border-t border-slate-200 text-center space-y-2">
        <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
          <a href="#" @click.prevent="openLegalModal('offer')" class="hover:text-indigo-600 transition">Договор-оферта</a>
          <a href="#" @click.prevent="openLegalModal('privacy')" class="hover:text-indigo-600 transition">Политика конфиденциальности</a>
          <span>&copy; 2026 ASM ERP. Все права защищены.</span>
        </div>
        <div class="text-[11px] text-slate-400 font-normal">
          Специально для автосервисов Кыргызстана. Все расчёты производятся в сомах (KGS).
        </div>
      </footer>
    </div>

    <!-- 2. LOGIN / REGISTRATION VIEW -->
    <div v-else class="min-h-screen w-full flex items-center justify-center px-4 py-12 animate-fade-in relative z-10">
      <div
        class="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 relative"
      >
        <!-- Back Button -->
        <button
          @click="showAuth = false"
          class="absolute -top-12 left-0 sm:left-2 h-9 px-3.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <i class="bi bi-arrow-left text-sm"></i>
          <span>На главную</span>
        </button>

        <div class="flex items-center gap-3 mb-6 justify-center select-none">
          <div
            class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-indigo-600 shadow-indigo-600/20 text-white"
          >
            <i :class="store.appIcon || 'bi-car-front-fill'" class="text-white text-lg"></i>
          </div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight font-heading uppercase text-left">
            ASM ERP
          </h2>
        </div>

        <!-- Mode Tab bar -->
        <div class="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            class="flex-1 py-2 font-bold text-xs rounded-lg transition-all border-none cursor-pointer"
            :class="
              authMode === 'login'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            "
            @click="authMode = 'login'"
          >
            Вход
          </button>
          <button
            class="flex-1 py-2 font-bold text-xs rounded-lg transition-all border-none cursor-pointer"
            :class="
              authMode === 'register'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            "
            @click="authMode = 'register'"
          >
            Регистрация
          </button>
        </div>

        <!-- Form fields -->
        <div class="space-y-4">
          <!-- USERNAME -->
          <div class="text-left">
            <label
              class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
              >Логин (Имя пользователя)</label
            >
            <input
              v-model="authForm.username"
              type="text"
              class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
              placeholder="Введите логин"
            />
          </div>

          <!-- PASSWORD -->
          <div class="text-left">
            <label
              class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
              >Пароль</label
            >
            <input
              v-model="authForm.password"
              type="password"
              class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
              placeholder="••••••••"
              @keyup.enter="handleAuth"
            />
          </div>

          <!-- REGISTER SPECIFIC FIELDS -->
          <template v-if="authMode === 'register'">
            <div class="pt-2 text-left">
              <label
                class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1"
                >Организация</label
              >
              <div class="flex gap-2 mb-3">
                <button
                  type="button"
                  @click="orgMode = 'join'"
                  class="flex-1 h-9 text-xs font-bold rounded-lg border transition cursor-pointer"
                  :class="
                    orgMode === 'join'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  "
                >
                  Выбрать сервис
                </button>
                <button
                  type="button"
                  @click="orgMode = 'create'"
                  class="flex-1 h-9 text-xs font-bold rounded-lg border transition cursor-pointer"
                  :class="
                    orgMode === 'create'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  "
                >
                  Создать новый
                </button>
              </div>

              <!-- Join existing organization -->
              <div v-if="orgMode === 'join'">
                <select
                  v-model="selectedOrgId"
                  class="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 cursor-pointer focus:bg-white focus:border-indigo-600"
                >
                  <option value="" disabled>-- Выберите организацию --</option>
                  <option
                    v-for="org in organizations"
                    :key="org.id"
                    :value="org.id"
                  >
                    {{ org.name }}
                  </option>
                </select>
              </div>

              <!-- Create new organization -->
              <div v-else>
                <input
                  v-model="newOrgName"
                  type="text"
                  class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
                  placeholder="Название нового автосервиса"
                />
              </div>
            </div>

            <!-- Accept Offer and Privacy Policy checkboxes -->
            <div class="pt-3 space-y-3 border-t border-slate-100 text-left">
              <!-- Offer Checkbox -->
              <div class="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  v-model="hasAcceptedOffer"
                  disabled
                  id="offer-check"
                  class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0 focus:ring-offset-0 disabled:opacity-85"
                />
                <label for="offer-check" class="text-xs text-slate-600 font-semibold leading-snug cursor-pointer select-none" @click.prevent="openLegalModal('offer')">
                  Я согласен с условиями 
                  <span class="text-indigo-600 font-bold hover:underline">договора-оферты</span>
                </label>
              </div>

              <!-- Privacy Checkbox -->
              <div class="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  v-model="hasAcceptedPrivacy"
                  disabled
                  id="privacy-check"
                  class="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0 focus:ring-offset-0 disabled:opacity-85"
                />
                <label for="privacy-check" class="text-xs text-slate-600 font-semibold leading-snug cursor-pointer select-none" @click.prevent="openLegalModal('privacy')">
                  Я принимаю 
                  <span class="text-indigo-600 font-bold hover:underline">политику конфиденциальности</span>
                </label>
              </div>
            </div>
          </template>

          <button
            @click="handleAuth"
            :disabled="authLoading || (authMode === 'register' && (!hasAcceptedOffer || !hasAcceptedPrivacy))"
            class="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 mt-6 flex justify-center items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              v-if="authLoading"
              class="spinner-border spinner-border-sm text-white"
            ></span>
            <span v-else>{{
              authMode === "login" ? "Войти в систему" : "Создать аккаунт"
            }}</span>
          </button>

          <p
            v-if="authMode === 'register' && orgMode === 'join'"
            class="text-[11px] text-center text-slate-500 mt-4 leading-relaxed font-semibold"
          >
            После регистрации ваш аккаунт должен быть подтверждён руководителем выбранного сервиса.
          </p>
        </div>
      </div>
    </div>

    <!-- Legal Document Modal -->
    <div
      v-if="activeLegalDoc"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 class="font-heading font-black text-xs text-slate-900 uppercase tracking-wider m-0">
            {{ activeLegalDoc === 'offer' ? 'Договор-оферта' : 'Политика конфиденциальности' }}
          </h3>
          <button
            @click="closeLegalModal"
            class="text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <!-- Scrollable content -->
        <div
          ref="legalScrollContainer"
          @scroll="handleLegalScroll"
          class="flex-1 p-6 overflow-y-auto text-left text-xs text-slate-700 leading-relaxed space-y-4 font-semibold select-text bg-slate-50"
        >
          <div v-html="activeLegalText"></div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div class="text-[11px] text-slate-500 font-semibold text-left w-full sm:w-auto">
            <span v-if="!hasScrolledToBottom" class="text-amber-600 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">arrow_downward</span>
              Прокрутите текст до конца, чтобы принять условия
            </span>
            <span v-else class="text-emerald-600 flex items-center gap-1 font-bold">
              <span class="material-symbols-outlined text-[14px]">check_circle</span>
              Текст прочитан. Можно принять условия.
            </span>
          </div>
          
          <button
            @click="acceptCurrentLegal"
            :disabled="!hasScrolledToBottom"
            class="w-full sm:w-auto h-10 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer border-none flex items-center justify-center gap-1 disabled:cursor-not-allowed shrink-0"
          >
            Я прочитал(а) и согласен(согласна)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { getOrganizations } from "../services/api";
import { OFFER_AGREEMENT_HTML, PRIVACY_POLICY_HTML } from "../utils/legalTexts";

export default {
  data() {
    return {
      showAuth: false,
      authMode: "login",
      authForm: { username: "", password: "" },
      orgMode: "join",
      selectedOrgId: "",
      newOrgName: "",
      organizations: [],
      authLoading: false,
      numAccounts: 3,
      hoveredBarIndex: null,

      // Interactive hero showcase & demo widgets
      heroActiveTab: "posts",
      demoBrand: "Toyota",
      
      // Legal docs state
      hasAcceptedOffer: false,
      hasAcceptedPrivacy: false,
      activeLegalDoc: null,
      hasScrolledToBottom: false,
    };
  },
  watch: {
    authMode(val) {
      this.hasAcceptedOffer = false;
      this.hasAcceptedPrivacy = false;
      if (val === "register") {
        this.fetchOrganizations();
      }
    },
    showAuth(val) {
      if (val && this.authMode === "register") {
        this.fetchOrganizations();
      }
    },
  },
  computed: {
    store() {
      return useMainStore();
    },
    demoModel() {
      const map = {
        Toyota: "Camry 70 / Land Cruiser 200",
        BMW: "X5 G05 / 5 Series G30",
        Mercedes: "E-Class W213 / S-Class",
        Hyundai: "Sonata DN8 / Tucson",
        Lexus: "RX 350 / LX 570",
      };
      return map[this.demoBrand] || "Camry 70";
    },
    activeLegalText() {
      if (this.activeLegalDoc === 'offer') return OFFER_AGREEMENT_HTML;
      if (this.activeLegalDoc === 'privacy') return PRIVACY_POLICY_HTML;
      return '';
    },
    calculatedPrice() {
      const base = 1500;
      const extra = this.numAccounts > 3 ? (this.numAccounts - 3) * 500 : 0;
      const total = base + extra;
      return {
        regular: total,
        firstMonth: total / 2,
        extraAccounts: this.numAccounts > 3 ? this.numAccounts - 3 : 0,
        extraCost: extra,
      };
    },
    // Simulated monthly revenue for visual engagement
    dashboardChartData() {
      return [
        { label: "Янв", amount: 62000, count: 24 },
        { label: "Фев", amount: 78000, count: 31 },
        { label: "Мар", amount: 95000, count: 42 },
        { label: "Апр", amount: 115000, count: 49 },
        { label: "Май", amount: 128450, count: 54 },
      ];
    },
    dashboardInsights() {
      return {
        peakLabel: "Май",
        peakAmount: 128450,
        avgAmount: 95690,
        totalAmount: 478450,
        totalCount: 200,
      };
    },
  },
  mounted() {
    document.body.style.overflow = "auto";
    document.body.style.height = "auto";
    if (this.authMode === "register") {
      this.fetchOrganizations();
    }
  },
  beforeUnmount() {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
  },
  methods: {
    async fetchOrganizations() {
      try {
        this.organizations = await getOrganizations();
      } catch (e) {
        console.error("Не удалось загрузить список организаций:", e);
      }
    },
    async handleAuth() {
      const store = useMainStore();
      this.authLoading = true;
      try {
        let loginUser = this.authForm.username;

        if (!loginUser) throw new Error("Пожалуйста, введите логин.");
        if (!this.authForm.password) throw new Error("Пожалуйста, введите пароль.");

        if (this.authMode === "login") {
          await store.login(loginUser, this.authForm.password);
          const role = store.user ? (store.user.Role || store.user.role) : "";
          if (role === "Superadmin") {
            this.$router.push("/all_users");
          } else {
            this.$router.push("/records");
          }
        } else {
          if (!this.hasAcceptedOffer || !this.hasAcceptedPrivacy) {
            throw new Error("Пожалуйста, примите условия договора-оферты и политики конфиденциальности.");
          }
          const orgValue = this.orgMode === "create" ? this.newOrgName : this.selectedOrgId;
          await store.register(loginUser, this.authForm.password, this.orgMode, orgValue);
          this.authMode = "login";
          this.authForm.password = "";
          this.showAuth = true;
        }
      } catch (e) {
        store.showToast(e.message, "error");
      } finally {
        this.authLoading = false;
      }
    },
    openLegalModal(type) {
      this.activeLegalDoc = type;
      this.hasScrolledToBottom = false;
      this.$nextTick(() => {
        const container = this.$refs.legalScrollContainer;
        if (container) {
          container.scrollTop = 0;
          if (container.scrollHeight <= container.clientHeight) {
            this.hasScrolledToBottom = true;
          }
        }
      });
    },
    closeLegalModal() {
      this.activeLegalDoc = null;
      this.hasScrolledToBottom = false;
    },
    handleLegalScroll(e) {
      const el = e.target;
      if (el.scrollHeight - el.scrollTop <= el.clientHeight + 12) {
        this.hasScrolledToBottom = true;
      }
    },
    acceptCurrentLegal() {
      if (this.activeLegalDoc === 'offer') {
        this.hasAcceptedOffer = true;
      } else if (this.activeLegalDoc === 'privacy') {
        this.hasAcceptedPrivacy = true;
      }
      this.closeLegalModal();
    },
    formatPhoneForLink(phone) {
      if (!phone) return "";
      return String(phone).replace(/\D/g, "");
    },
    getWhatsAppLink(phone) {
      const cleaned = this.formatPhoneForLink(phone);
      return "https://wa.me/" + cleaned + "?text=Здравствуйте!%20Хочу%20подключить%20ASM%20ERP.";
    },
  },
};
</script>

<style scoped>
/* Range slider styling */
input[type="range"] {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  background: #e2e8f0;
  height: 6px;
  border-radius: 9999px;
}
input[type="range"]::-webkit-slider-thumb {
  margin-top: -5px;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
