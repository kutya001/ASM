<template>
  <div
    class="min-h-screen w-full bg-[#090D1A] text-slate-100 font-sans relative overflow-x-hidden pb-12 select-none"
  >
    <!-- Background glowing decorative spheres -->
    <div
      class="absolute top-20 left-10 w-80 h-80 bg-indigo-600/10 rounded-full filter blur-[100px] pointer-events-none"
    ></div>
    <div
      class="absolute top-[600px] right-10 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none"
    ></div>
    <div
      class="absolute bottom-40 left-1/3 w-[500px] h-[500px] bg-emerald-600/5 rounded-full filter blur-[150px] pointer-events-none"
    ></div>

    <!-- 1. LANDING VIEW -->
    <div v-if="!showAuth" class="animate-fade-in">
      <!-- Navbar -->
      <header
        class="sticky top-0 z-50 bg-[#090D1A]/80 backdrop-blur-md border-b border-slate-800/40 px-4 md:px-8 py-3.5 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <i :class="store.appIcon || 'bi-car-front-fill'" class="text-white text-lg"></i>
          </div>
          <span class="font-black text-lg tracking-wider font-heading uppercase text-white">
            ASM ERP
          </span>
        </div>
        <nav class="hidden md:flex items-center gap-6 text-sm font-bold text-slate-400">
          <a href="#features" class="hover:text-indigo-400 transition">Возможности</a>
          <a href="#pricing" class="hover:text-indigo-400 transition">Тарифы</a>
          <a href="#contacts" class="hover:text-indigo-400 transition">Контакты</a>
        </nav>
        <button
          @click="showAuth = true"
          class="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-650/20 hover:shadow-indigo-550/30 transition border-none cursor-pointer flex items-center gap-1.5"
        >
          <span>Вход в систему</span>
          <i class="bi bi-arrow-right-short text-sm"></i>
        </button>
      </header>

      <!-- Hero Section -->
      <section
        class="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center flex flex-col items-center gap-6"
      >
        <div
          class="px-3 py-1 bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest leading-none scale-95"
        >
          🚀 Система управления автосервисом
        </div>
        <h1
          class="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white font-heading max-w-2xl"
        >
          Управляйте вашим СТО на
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            >максимальной скорости</span
          >
        </h1>
        <p class="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed font-semibold">
          Современная ERP-система для автосервисов. Учет записей клиентов, контроль мастеров,
          расчет стоимости услуг, статистика выручки и встроенное лобби для отдыха команды.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            @click="showAuth = true; authMode = 'register'"
            class="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-650/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <span>Начать бесплатно</span>
          </button>
          <a
            href="#pricing"
            class="h-12 px-8 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 hover:text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 decoration-none"
          >
            Посмотреть тарифы
          </a>
        </div>

        <!-- App UI Interactive Mockup -->
        <div
          class="w-full mt-12 bg-[#0E1322] border border-slate-800 rounded-2xl shadow-2xl p-4 text-left overflow-hidden select-none"
        >
          <!-- Top bar of mockup -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <div class="text-[10px] text-slate-500 font-mono tracking-wider">
              DEMO_PANEL_DASHBOARD
            </div>
            <div class="w-12"></div>
          </div>
          <!-- Grid in mockup -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Left panel stats -->
            <div class="bg-[#141A2E] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest"
                  >Выручка СТО</span
                >
                <i class="bi bi-trending-up text-emerald-500 text-xs"></i>
              </div>
              <div class="text-xl font-black font-heading text-white">
                128,450 KGS
              </div>
              <div class="text-[9px] text-slate-500 font-semibold">
                Завершенных заказов: <span class="text-white font-bold">54</span>
              </div>
            </div>
            <div class="bg-[#141A2E] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest"
                  >Занято постов</span
                >
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              </div>
              <div class="text-xl font-black font-heading text-white">4 / 5</div>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full" style="width: 80%"></div>
              </div>
            </div>
            <div class="bg-[#141A2E] border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest"
                  >Рейтинг мастеров</span
                >
                <i class="bi bi-award text-yellow-500 text-xs"></i>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-[10px] font-bold">
                  <span class="text-slate-400 truncate">1. Куба</span>
                  <span class="text-white shrink-0">45,800 KGS</span>
                </div>
                <div class="flex justify-between text-[10px] font-bold">
                  <span class="text-slate-400 truncate">2. Адилет</span>
                  <span class="text-white shrink-0">38,150 KGS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Features Section -->
      <section id="features" class="max-w-5xl mx-auto px-4 py-16 text-center space-y-12">
        <div class="space-y-3">
          <h2 class="text-2xl md:text-3xl font-black text-white uppercase tracking-wider font-heading">
            Все что нужно для вашего СТО
          </h2>
          <p class="text-slate-400 text-xs.5 max-w-md mx-auto leading-relaxed font-semibold">
            Комплексное решение от регистрации клиентов до учета финансов и разграничения прав доступа.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Card 1 -->
          <div
            class="bg-slate-950/30 border border-slate-850 hover:border-indigo-500/40 p-6 rounded-2xl text-left space-y-3 hover:bg-slate-950/50 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"
            >
              <i class="bi bi-journal-text text-lg"></i>
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Записи и Заказы</h3>
            <p class="text-slate-400 text-xs.5 leading-relaxed font-semibold">
              Удобный учет госНомеров, времени заезда, марок/моделей и статуса оплаты с возможностью
              написать клиенту в WhatsApp одним кликом.
            </p>
          </div>
          <!-- Card 2 -->
          <div
            class="bg-slate-950/30 border border-slate-850 hover:border-indigo-500/40 p-6 rounded-2xl text-left space-y-3 hover:bg-slate-950/50 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400"
            >
              <i class="bi bi-pie-chart-fill text-lg"></i>
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Аналитика выручки</h3>
            <p class="text-slate-400 text-xs.5 leading-relaxed font-semibold">
              Интерактивные SVG-графики динамики выручки, расчет среднего чека, аналитические
              выводы тренда и лидерборд ваших мастеров.
            </p>
          </div>
          <!-- Card 3 -->
          <div
            class="bg-slate-950/30 border border-slate-850 hover:border-indigo-500/40 p-6 rounded-2xl text-left space-y-3 hover:bg-slate-950/50 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"
            >
              <i class="bi bi-tools text-lg"></i>
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">База услуг и цен</h3>
            <p class="text-slate-400 text-xs.5 leading-relaxed font-semibold">
              Персонализированные списки оказываемых услуг СТО с ценами и встроенным импортом файлов
              для быстрой загрузки больших прайс-листов.
            </p>
          </div>
          <!-- Card 4 -->
          <div
            class="bg-slate-950/30 border border-slate-850 hover:border-indigo-500/40 p-6 rounded-2xl text-left space-y-3 hover:bg-slate-950/50 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"
            >
              <i class="bi bi-people-fill text-lg"></i>
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Управление штатом</h3>
            <p class="text-slate-400 text-xs.5 leading-relaxed font-semibold">
              Контроль доступа сотрудников, подтверждение заявок новых мастеров руководителем и
              возможность смены паролей администратором.
            </p>
          </div>
          <!-- Card 5 -->
          <div
            class="bg-slate-950/30 border border-slate-850 hover:border-indigo-500/40 p-6 rounded-2xl text-left space-y-3 hover:bg-slate-950/50 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400"
            >
              <i class="bi bi-phone-vibrate text-lg"></i>
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Адаптивный дизайн</h3>
            <p class="text-slate-400 text-xs.5 leading-relaxed font-semibold">
              Интерфейс приложения адаптирован под экраны любой ширины. Будет одинаково удобно
              работать как на ПК, так и со смартфона прямо в цеху.
            </p>
          </div>
          <!-- Card 6 -->
          <div
            class="bg-slate-950/30 border border-slate-850 hover:border-indigo-500/40 p-6 rounded-2xl text-left space-y-3 hover:bg-slate-950/50 transition-all duration-300"
          >
            <div
              class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400"
            >
              <i class="bi bi-controller text-lg"></i>
            </div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Развлечения команде</h3>
            <p class="text-slate-400 text-xs.5 leading-relaxed font-semibold">
              Интегрированное игровое лобби со знаменитыми играми (2048, Тетрис, Block Blast) для
              отдыха мастеров во время перерывов в работе.
            </p>
          </div>
        </div>
      </section>

      <!-- 3. Pricing Section with Interactive Slider -->
      <section id="pricing" class="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div class="text-center space-y-3">
          <h2 class="text-2xl md:text-3xl font-black text-white uppercase tracking-wider font-heading">
            Прозрачные Тарифы
          </h2>
          <p class="text-slate-400 text-xs.5 max-w-md mx-auto leading-relaxed font-semibold">
            Первый месяц со скидкой 50% для ознакомления со всем функционалом приложения.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch">
          <!-- Pricing Policy -->
          <div
            class="md:col-span-2 bg-[#0E1424] border border-slate-850 p-6 rounded-2xl flex flex-col justify-between gap-6 text-left"
          >
            <div class="space-y-4">
              <span
                class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[9px] font-black uppercase tracking-wider border border-indigo-500/25"
                >Базовый Пакет</span
              >
              <h3 class="text-xl font-bold text-white uppercase tracking-wider font-heading m-0">
                Auto Service Management
              </h3>
              <p class="text-slate-400 text-xs font-semibold leading-relaxed">
                До 3-х аккаунтов сотрудников включено в базовый пакет СТО. Каждый последующий
                дополнительный мастер стоит всего 500 сомов/мес.
              </p>
              <ul class="space-y-2 text-xs font-bold text-slate-300 p-0 list-none">
                <li class="flex items-center gap-2">
                  <i class="bi bi-check-circle-fill text-indigo-500"></i>
                  <span>База данных Supabase</span>
                </li>
                <li class="flex items-center gap-2">
                  <i class="bi bi-check-circle-fill text-indigo-500"></i>
                  <span>Синхронизация WebSockets</span>
                </li>
                <li class="flex items-center gap-2">
                  <i class="bi bi-check-circle-fill text-indigo-500"></i>
                  <span>Полная аналитика и графики</span>
                </li>
              </ul>
            </div>

            <div class="pt-4 border-t border-slate-800">
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Базовый платеж:
              </div>
              <div class="flex items-baseline gap-1 mt-1 text-white">
                <span class="text-2xl font-black font-heading">1 500 KGS</span>
                <span class="text-[10px] font-semibold text-slate-500">/ месяц</span>
              </div>
            </div>
          </div>

          <!-- Interactive Calculator -->
          <div
            class="md:col-span-3 bg-gradient-to-tr from-[#0F1528] to-[#121A30] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-6 text-left"
          >
            <div class="space-y-5">
              <h4 class="text-xs font-black text-slate-300 uppercase tracking-wider font-heading m-0">
                Калькулятор стоимости
              </h4>

              <!-- Slider control -->
              <div class="space-y-2.5">
                <div class="flex justify-between items-baseline font-bold text-xs">
                  <span class="text-slate-400">Количество сотрудников СТО:</span>
                  <span class="text-indigo-400 text-sm font-black">{{ numAccounts }} чел.</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  v-model.number="numAccounts"
                  class="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div class="flex justify-between text-[9px] text-slate-500 font-extrabold">
                  <span>1 аккаунт</span>
                  <span>10 аккаунтов</span>
                  <span>20 аккаунтов</span>
                </div>
              </div>

              <!-- Cost breakdown -->
              <div class="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-2">
                <div class="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Базовый пакет (до 3 чел.):</span>
                  <span class="text-white font-bold">1 500 сомов</span>
                </div>
                <div
                  v-if="calculatedPrice.extraAccounts > 0"
                  class="flex justify-between text-[11px] font-semibold text-slate-400"
                >
                  <span
                    >Доп. сотрудники ({{ calculatedPrice.extraAccounts }} x 500 сомов):</span
                  >
                  <span class="text-white font-bold"
                    >+{{ calculatedPrice.extraCost }} сомов</span
                  >
                </div>
              </div>
            </div>

            <!-- Price Output -->
            <div
              class="bg-indigo-600/10 border border-indigo-500/25 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap"
            >
              <div>
                <span class="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block"
                  >Стоимость первого месяца (скидка 50%):</span
                >
                <div class="text-xl font-black text-white mt-0.5">
                  {{ calculatedPrice.firstMonth.toLocaleString() }} KGS
                </div>
                <span class="text-[9px] text-slate-500 font-semibold block mt-0.5"
                  >Далее: {{ calculatedPrice.regular.toLocaleString() }} сомов/мес.</span
                >
              </div>
              <button
                @click="showAuth = true; authMode = 'register'"
                class="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition border-none cursor-pointer shadow-sm shadow-indigo-650/20"
              >
                Создать СТО
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Contact Section -->
      <section id="contacts" class="max-w-xl mx-auto px-4 py-16 text-center space-y-8">
        <div class="space-y-3">
          <h2 class="text-2xl md:text-3xl font-black text-white uppercase tracking-wider font-heading">
            Свяжитесь со мной
          </h2>
          <p class="text-slate-400 text-xs.5 max-w-sm mx-auto leading-relaxed font-semibold">
            Остались вопросы или хотите обсудить внедрение в ваше СТО? Буду рад помочь!
          </p>
        </div>

        <div
          class="bg-[#0E1424] border border-slate-850 p-6 rounded-3xl flex flex-col items-center gap-4 relative overflow-hidden"
        >
          <!-- Background decoration -->
          <div
            class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl"
          ></div>

          <!-- Contact Avatar -->
          <div
            class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-550/10"
          >
            К
          </div>
          <div>
            <h3 class="text-base font-bold text-white uppercase tracking-wider m-0">Кутман</h3>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block"
              >Разработчик и Поддержка ASM ERP</span
            >
          </div>

          <div class="w-full pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            <!-- Phone links -->
            <a
              href="tel:+996500888268"
              class="h-11 border border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-white font-bold text-xs transition decoration-none"
            >
              <i class="bi bi-telephone-fill text-indigo-500"></i>
              <span class="font-mono">+996 (500) 888 268</span>
            </a>
            <!-- WhatsApp direct link -->
            <a
              href="https://wa.me/996500888268?text=Здравствуйте!%20Хочу%20подключить%20ASM%20ERP."
              target="_blank"
              class="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition border-none cursor-pointer shadow-sm shadow-emerald-650/20 decoration-none"
            >
              <i class="bi bi-whatsapp"></i>
              <span>Написать в WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="max-w-4xl mx-auto px-4 pt-12 border-t border-slate-850 text-center space-y-2">
        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          &copy; 2026 ASM ERP • Все права защищены
        </div>
        <div class="text-[9px] text-slate-600 font-semibold">
          Создано с заботой о качестве сервиса в Кыргызстане. Все цены указаны в сомах (KGS).
        </div>
      </footer>
    </div>

    <!-- 2. LOGIN / REGISTRATION VIEW -->
    <div v-else class="min-h-screen w-full flex items-center justify-center px-4 py-12 animate-fade-in">
      <div
        class="w-full max-w-md bg-[#0F1424] p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-850 relative"
      >
        <!-- Back Button -->
        <button
          @click="showAuth = false"
          class="absolute -top-12 left-0 sm:left-4 h-9 px-3.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <i class="bi bi-arrow-left-short text-sm"></i>
          <span>На главную</span>
        </button>

        <div class="flex items-center gap-3 mb-8 justify-center select-none">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg bg-indigo-600 shadow-indigo-650/20"
          >
            <i :class="store.appIcon || 'bi-car-front-fill'" class="text-white text-xl"></i>
          </div>
          <h2 class="text-xl font-black text-white tracking-wider font-heading uppercase text-left">
            ASM ERP
          </h2>
        </div>

        <!-- Mode Tab bar -->
        <ul class="flex border-b border-slate-800 mb-6 p-0 list-none">
          <li class="flex-1 text-center">
            <button
              class="pb-3 px-4 font-bold text-sm w-full transition-colors bg-transparent border-none cursor-pointer"
              :class="
                authMode === 'login'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-500 hover:text-slate-350'
              "
              @click="authMode = 'login'"
            >
              Вход
            </button>
          </li>
          <li class="flex-1 text-center">
            <button
              class="pb-3 px-4 font-bold text-sm w-full transition-colors bg-transparent border-none cursor-pointer"
              :class="
                authMode === 'register'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-500 hover:text-slate-350'
              "
              @click="authMode = 'register'"
            >
              Регистрация
            </button>
          </li>
        </ul>

        <!-- Form fields -->
        <div class="space-y-4">
          <!-- USERNAME -->
          <div class="text-left">
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
              >Логин (Имя пользователя)</label
            >
            <input
              v-model="authForm.username"
              type="text"
              class="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-100 placeholder-slate-500"
              placeholder="Введите ваш логин"
            />
          </div>

          <!-- PASSWORD -->
          <div class="text-left">
            <label
              class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
              >Пароль</label
            >
            <input
              v-model="authForm.password"
              type="password"
              class="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-100 placeholder-slate-500"
              placeholder="••••••••"
              @keyup.enter="handleAuth"
            />
          </div>

          <!-- REGISTER SPECIFIC FIELDS -->
          <template v-if="authMode === 'register'">
            <div class="pt-2 text-left">
              <label
                class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
                >Организация</label
              >
              <div class="flex gap-2 mb-3">
                <button
                  type="button"
                  @click="orgMode = 'join'"
                  class="flex-1 h-9 text-xs font-bold rounded-lg border transition cursor-pointer"
                  :class="
                    orgMode === 'join'
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
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
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                  "
                >
                  Создать новый
                </button>
              </div>

              <!-- Join existing organization -->
              <div v-if="orgMode === 'join'">
                <select
                  v-model="selectedOrgId"
                  class="w-full h-11 px-3 bg-slate-900 border border-slate-800 rounded-xl outline-none font-bold text-sm text-slate-100 cursor-pointer"
                >
                  <option value="" disabled class="bg-[#0F1424]">-- Выберите организацию --</option>
                  <option
                    v-for="org in organizations"
                    :key="org.id"
                    :value="org.id"
                    class="bg-[#0F1424]"
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
                  class="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-100 placeholder-slate-500"
                  placeholder="Название нового автосервиса"
                />
              </div>
            </div>
          </template>

          <button
            @click="handleAuth"
            :disabled="authLoading"
            class="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-650/20 mt-6 flex justify-center items-center gap-2 cursor-pointer border-none"
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
            class="text-[10px] text-center text-slate-500 mt-4 leading-relaxed font-bold uppercase tracking-wider"
          >
            После регистрации ваш аккаунт должен быть подтверждён руководителем выбранной
            организации.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { getOrganizations } from "../services/api";

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
    };
  },
  computed: {
    store() {
      return useMainStore();
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
    // Dummy chart data representing simulated monthly revenue for visual engagement
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
  watch: {
    authMode(val) {
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
  mounted() {
    if (this.authMode === "register") {
      this.fetchOrganizations();
    }
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
        } else {
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
/* Range input formatting */
input[type="range"] {
  outline: none;
}
input[type="range"]::-webkit-slider-runnable-track {
  background: #1e293b;
  height: 6px;
  border-radius: 9999px;
}
input[type="range"]::-webkit-slider-thumb {
  margin-top: -5px;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
