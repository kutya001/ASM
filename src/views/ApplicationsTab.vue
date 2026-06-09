<template>
  <div class="space-y-4 max-w-md mx-auto w-full pb-24 animate-fade-in px-3">
    <!-- Status tabs / filters - Permanently displayed and compact -->
    <div class="flex gap-1 overflow-x-auto pb-2 border-b border-slate-100/65 scrollbar-none select-none px-0.5 my-1">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeStatusTab = tab.id"
        class="flex-1 min-w-[44px] h-8.5 px-2 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer whitespace-nowrap outline-none border flex items-center justify-center gap-1.5 shadow-2xs"
        :class="
          activeStatusTab === tab.id
            ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs shadow-indigo-100'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650'
        "
        :title="tab.label"
      >
        <i :class="tab.icon" class="text-[13px] font-black"></i>
        <span
          class="text-[8.5px] px-1 py-0.2 rounded-full font-black font-mono leading-none min-w-[14px] text-center"
          :class="
            activeStatusTab === tab.id
              ? 'bg-white/20 text-white'
              : tab.id === 'pending'
                ? 'bg-amber-100 text-amber-750'
                : tab.id === 'created'
                  ? 'bg-emerald-100 text-emerald-750'
                  : tab.id === 'declined'
                    ? 'bg-rose-100 text-rose-750'
                    : 'bg-slate-100 text-slate-600'
          "
        >
          {{ getTabCount(tab.id) }}
        </span>
      </button>
    </div>

    <!-- Main List of Applications -->
    <div v-if="filteredApplications.length > 0" class="space-y-3">
      <div
        v-for="app in filteredApplications"
        :key="app['Отметка времени']"
        @click="selectedApp = app"
        class="bg-white rounded-2xl p-3.5 shadow-soft border hover:border-slate-350 active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-2 relative"
        :class="{
          'border-amber-250 bg-amber-50/5': isPending(app),
          'border-emerald-250 bg-emerald-50/5': isDone(app),
          'border-slate-200 bg-slate-50/5 lg:opacity-85': isDeclined(app)
        }"
        title="Нажмите, чтобы открыть карточку"
      >
        <!-- ROW 1: [Имя] & [Статус-иконка] -->
        <div class="flex items-center justify-between select-none">
          <div class="flex items-center gap-2 min-w-0">
            <span class="material-symbols-outlined text-[17px] text-slate-400 font-medium">person</span>
            <span class="font-extrabold text-slate-800 text-[13.5px] truncate">
              {{ app['Ваше Имя'] || 'Без имени' }}
            </span>
          </div>

          <!-- Status icon-only badge (no text, optimized colors) -->
          <div class="flex items-center justify-center select-none shrink-0" :title="isPending(app) ? 'Открыт (Новый)' : isDone(app) ? 'Запись создана' : 'Отклонён'">
            <span
              v-if="isPending(app)"
              class="w-6.5 h-6.5 rounded-full bg-amber-50 text-amber-650 border border-amber-200/60 flex items-center justify-center animate-pulse shadow-2xs"
            >
              <i class="bi bi-envelope text-[11px] font-bold"></i>
            </span>
            <span
              v-else-if="isDone(app)"
              class="w-6.5 h-6.5 rounded-full bg-emerald-50 text-emerald-650 border border-emerald-200/60 flex items-center justify-center shadow-2xs"
            >
              <i class="bi bi-calendar-check-fill text-[11px]"></i>
            </span>
            <span
              v-else-if="isDeclined(app)"
              class="w-6.5 h-6.5 rounded-full bg-rose-50 text-rose-650 border border-rose-200 flex items-center justify-center shadow-2xs"
            >
              <i class="bi bi-slash-circle-fill text-[10px]"></i>
            </span>
          </div>
        </div>

        <!-- ROW 2: [Марка / Модель] & [Госномер] -->
        <div class="grid grid-cols-2 gap-2 select-none items-stretch">
          <!-- Марка - Модель -->
          <div
            class="bg-slate-50 border border-slate-200/60 text-slate-700 rounded-xl h-8 px-2 flex items-center gap-1.5 min-w-0"
          >
            <span class="material-symbols-outlined text-[14px] text-slate-450 font-medium leading-none">minor_crash</span>
            <span class="text-[11.5px] font-bold text-slate-800 truncate leading-none">
              {{ app['Марка автомобиля'] || '—' }} {{ app['Модель автомобиля'] || '' }}
              <span v-if="app['Год выпуска автомобиля']" class="text-slate-400 font-normal">({{ app['Год выпуска автомобиля'] }})</span>
            </span>
          </div>

          <!-- гос.номер -->
          <div v-if="app['Государственный номер машины (госномер)']"
            class="bg-white border border-slate-300 text-slate-800 rounded-xl h-8 px-2 flex items-center justify-center gap-1 min-w-0 shadow-3xs"
          >
            <span class="text-[8.5px] text-slate-400 border-r border-slate-200 pr-1 select-none font-bold uppercase font-mono">KG</span>
            <span class="font-mono font-black text-xs tracking-wide uppercase truncate leading-none select-all">
              {{ app['Государственный номер машины (госномер)'] }}
            </span>
          </div>
          <!-- empty state model to align sizes perfectly -->
          <div v-else
            class="bg-slate-50/40 border border-slate-150 border-dashed text-slate-400 rounded-xl h-8 px-2 flex items-center justify-center text-[10.5px] italic leading-none"
          >
            Госномер: —
          </div>
        </div>

        <!-- ROW 3: [Отдельно Дата] & [Отдельно Время] -->
        <div class="grid grid-cols-2 gap-2 select-none items-stretch">
          <!-- Дата -->
          <div
            class="bg-slate-50 border border-slate-200/60 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
          >
            <span class="material-symbols-outlined text-[14px] text-indigo-500 font-bold leading-none">calendar_month</span>
            <span class="text-[11.5px] font-bold text-slate-700 truncate leading-none">
              {{ formatLocalDate(app['Предполагаемая дата записи']) }}
            </span>
          </div>

          <!-- Время -->
          <div
            class="bg-slate-50 border border-slate-200/60 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
          >
            <span class="material-symbols-outlined text-[14px] text-amber-500 font-bold leading-none">schedule</span>
            <span class="text-[11.5px] font-bold text-slate-700 truncate leading-none">
              {{ formatLocalTime(app['Предполагаемое время записи']) }}
            </span>
          </div>
        </div>

        <!-- ROW 4: [Телефон и WhatsApp] -->
        <div v-if="app['Контактный номер телефона']" class="flex items-center justify-between gap-1.5 bg-slate-100/35 border border-slate-200/50 p-1.5 px-2.5 rounded-xl text-[11px]" @click.stop>
          <div class="flex items-center gap-1 min-w-0">
            <span class="material-symbols-outlined text-[15px] text-slate-400">contact_phone</span>
            <span class="font-semibold text-slate-500 truncate leading-none">Тел:</span>
          </div>
          
          <div class="flex items-center gap-1 select-none shrink-0 scale-95 origin-right">
            <!-- Call link -->
            <a
              :href="'tel:' + formatPhoneForLink(app['Контактный номер телефона'])"
              class="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-650 px-2 py-1 rounded-lg transition-colors border border-indigo-200/40"
              title="Позвонить по телефону"
            >
              <i class="bi bi-telephone-fill text-[8px]"></i>
              <span class="font-mono leading-none">{{ formatPhoneForLink(app['Контактный номер телефона']) }}</span>
            </a>
            <!-- WhatsApp link -->
            <a
              :href="getWhatsAppLink(app['Контактный номер телефона'])"
              target="_blank"
              class="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-650 px-2 py-1 rounded-lg transition-colors border border-emerald-200/40"
              title="Написать в WhatsApp"
            >
              <i class="bi bi-whatsapp text-[10px]"></i>
              WhatsApp
            </a>
          </div>
        </div>

        <!-- ROW 5: [Услуги] & [Комментарий] -->
        <div v-if="app['Выберите необходимые услуги автоэлектрики (если применимо)'] || app['Краткое описание проблемы или комментарий (по желанию)']" class="text-[11px] space-y-1 select-none bg-slate-50/20 p-2 rounded-xl border border-slate-100 mt-0.5">
          <!-- Selected Services Summary -->
          <div v-if="app['Выберите необходимые услуги автоэлектрики (если применимо)']" class="flex items-start gap-1.5 max-w-full" :title="app['Выберите необходимые услуги автоэлектрики (если применимо)']">
            <i class="bi bi-tools text-[10px] text-slate-500 shrink-0 mt-0.5 animate-pulse"></i>
            <span class="text-slate-650 font-bold leading-tight break-words">
              {{ app['Выберите необходимые услуги автоэлектрики (если применимо)'] }}
            </span>
          </div>

          <!-- Comment placeholder / micro icon -->
          <div v-if="app['Краткое описание проблемы или комментарий (по желанию)']" class="flex items-start gap-1.5 text-slate-500 italic max-w-full" :title="app['Краткое описание проблемы или комментарий (по желанию)']">
            <i class="bi bi-chat-dots text-[10px] text-slate-400 shrink-0 mt-0.5"></i>
            <span class="font-normal text-slate-500 leading-tight break-words">
              "{{ app['Краткое описание проблемы или комментарий (по желанию)'] }}"
            </span>
          </div>
        </div>

        <!-- ROW 6: [Дата Подачи] & [Действия] -->
        <div class="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2 select-none" @click.stop>
          <!-- Created stamp -->
          <div class="flex items-center gap-1 text-[9.5px] text-slate-400 font-medium italic">
            <i class="bi bi-clock-history"></i>
            <span>{{ app['Отметка времени'] ? formatTimestamp(app['Отметка времени']) : '' }}</span>
          </div>

          <!-- Action Buttons / Row Controls -->
          <div class="flex items-center gap-1 shrink-0">
            <!-- If record is already created (isDone) -->
            <button
              v-if="isDone(app)"
              @click="openLinkedRecord(app['IDRecords'])"
              class="h-7 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition cursor-pointer shadow-3xs"
              title="Открыть запись в графике"
            >
              <i class="bi bi-box-arrow-in-up-right text-[10px]"></i>
              Смотреть
            </button>

            <!-- Editable Actions: Masters ONLY edit "Открытые" entries, while Admins/Superadmins can process declined too -->
            <template v-else-if="isPending(app) || (user && user.Role !== 'Master')">
              <!-- "Запись" - GREEN (bg-emerald-600) -->
              <button
                @click="createRecordFromApp(app)"
                class="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition border border-emerald-650 shadow-sm cursor-pointer"
                title="Оформить запись клиента"
              >
                <i class="bi bi-calendar-plus text-[10px]"></i>
                Запись
              </button>

              <!-- "Отклонить" - RED (bg-rose-600) with only icon -->
              <button
                @click="declineApplication(app)"
                class="w-7 h-7 bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center justify-center transition border border-rose-650 cursor-pointer shadow-sm shrink-0"
                title="Отклонить заявку"
              >
                <i class="bi bi-slash-circle text-[11px]"></i>
              </button>
            </template>

            <!-- Regular Masters view status label on non-editable processed entries -->
            <span
              v-else-if="user && user.Role === 'Master'"
              class="text-[9px] font-bold text-slate-405 bg-slate-100 px-2 py-0.5 rounded select-none uppercase tracking-wider"
            >
              Закрыта
            </span>

            <!-- Delete button ONLY for Superadmin - BLACK (bg-slate-900) -->
            <button
              v-if="user && user.Role === 'Superadmin'"
              @click="deleteApplication(app)"
              class="h-7 px-2 bg-slate-900 hover:bg-black text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition border border-slate-950 cursor-pointer shadow-sm"
              title="Удалить заявку"
            >
              <i class="bi bi-trash text-[10px]"></i>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="bg-white border rounded-2xl p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center space-y-3"
    >
      <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
        <i class="bi bi-inbox-fill text-xl"></i>
      </div>
      <div>
        <h4 class="font-bold text-slate-700 text-xs.5">Заявки не найдены</h4>
        <p class="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
          В выбранной категории или по вашему поисковому запросу нет данных.
        </p>
      </div>
    </div>

    <!-- Beautiful Application Detail Modal -->
    <div
      v-if="selectedApp"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      @click="selectedApp = null"
    >
      <div
        class="bg-white border border-slate-250 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in"
        @click.stop
      >
        <!-- Modal Sticky Header -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">assignment</span>
            <h3 class="font-black text-sm text-slate-800 uppercase tracking-wide">Карточка заявки</h3>
          </div>
          <button
            @click="selectedApp = null"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Modal Content Scroll Area -->
        <div class="p-3.5 overflow-y-auto space-y-2.5 text-xs">
          <!-- Main Client and Contact Info Card -->
          <div class="bg-indigo-50/40 border border-indigo-100/70 rounded-xl p-2.5 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Имя клиента</span>
                <span class="text-[13px] font-black text-slate-800 truncate block">
                  {{ selectedApp['Ваше Имя'] || 'Без имени' }}
                </span>
              </div>
              
              <!-- Contact Buttons simple without text -->
              <div v-if="selectedApp['Контактный номер телефона']" class="flex items-center gap-1.5 shrink-0">
                <a
                  :href="'tel:' + formatPhoneForLink(selectedApp['Контактный номер телефона'])"
                  class="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition shadow-2xs cursor-pointer active:scale-95"
                  title="Позвонить"
                >
                  <i class="bi bi-telephone-fill text-[11px]"></i>
                </a>
                <a
                  :href="getWhatsAppLink(selectedApp['Контактный номер телефона'])"
                  target="_blank"
                  class="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-2xs cursor-pointer active:scale-95"
                  title="Написать в WhatsApp"
                >
                  <i class="bi bi-whatsapp text-[12px]"></i>
                </a>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1.5 border-t border-indigo-100/60 font-medium">
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Телефон</span>
                <span class="font-extrabold text-indigo-950 font-mono text-[11px] truncate block">{{ formatPhoneForLink(selectedApp['Контактный номер телефона']) || '—' }}</span>
              </div>
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Email</span>
                <span class="font-bold text-indigo-950 text-[11px] break-all select-all block truncate">{{ selectedApp['Адрес электронной почты'] || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Vehicle Specs -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-2.5 space-y-2">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-slate-500 font-bold leading-none">directions_car</span>
              <h4 class="font-black text-[9.5px] text-slate-500 uppercase tracking-widest leading-none">Автомобиль</h4>
            </div>

            <div class="grid grid-cols-2 gap-2 font-medium">
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Марка / Модель</span>
                <span class="font-bold text-slate-800 text-[11px] block truncate">
                  {{ selectedApp['Марка автомобиля'] || '—' }} {{ selectedApp['Модель автомобиля'] || '' }}
                </span>
              </div>
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Год выпуска</span>
                <span class="font-bold text-slate-800 text-[11px] block truncate">
                  {{ selectedApp['Год выпуска автомобиля'] ? selectedApp['Год выпуска автомобиля'] + ' г.' : '—' }}
                </span>
              </div>
            </div>

            <div class="pt-1.5 border-t border-slate-200/50 flex items-center justify-between gap-2">
              <span class="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Госномер автомобиля</span>
              <span
                v-if="selectedApp['Государственный номер машины (госномер)']"
                class="inline-flex items-center gap-1 px-2 py-0.5 border border-slate-300 bg-white text-[10.5px] rounded-lg font-bold tracking-widest uppercase font-mono shadow-3xs text-slate-800 select-all"
              >
                <span class="text-[8px] text-slate-400 border-r border-slate-200 pr-1 select-none font-bold">KG</span>
                {{ selectedApp['Государственный номер машины (госномер)'] }}
              </span>
              <span v-else class="text-slate-400 italic text-[10.5px]">Не указан</span>
            </div>
          </div>

          <!-- Timing and Date Details -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-2.5 space-y-2">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[15px] text-slate-500 font-bold leading-none">calendar_month</span>
              <h4 class="font-black text-[9.5px] text-slate-500 uppercase tracking-widest leading-none">Дата и время записи</h4>
            </div>

            <div class="grid grid-cols-2 gap-2 font-medium">
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Дата</span>
                <span class="font-bold text-slate-850 text-[11px] block truncate">{{ formatLocalDate(selectedApp['Предполагаемая дата записи']) }}</span>
              </div>
              <div class="min-w-0">
                <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Время</span>
                <span class="font-bold text-slate-850 text-[11px] block truncate">{{ formatLocalTime(selectedApp['Предполагаемое время записи']) }}</span>
              </div>
            </div>
          </div>

          <!-- Requested Services & Message Comments -->
          <div class="bg-white border border-slate-150 rounded-xl p-2.5 space-y-2.5">
            <div class="min-w-0">
              <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 leading-none">
                <i class="bi bi-tools text-[8.5px]"></i> Услуги автоэлектрики
              </span>
              <p class="font-bold text-slate-850 bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100 text-[11px] m-0 leading-snug">
                {{ selectedApp['Выберите необходимые услуги автоэлектрики (если применимо)'] || 'Услуги не выбраны или не указаны' }}
              </p>
            </div>

            <div class="min-w-0">
              <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1 leading-none">
                <i class="bi bi-chat-dots text-[8.5px]"></i> Комментарий / Проблема
              </span>
              <p class="font-medium text-slate-600 bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100 italic text-[11px] m-0 leading-snug">
                {{ selectedApp['Краткое описание проблемы или комментарий (по желанию)'] || 'Комментарий отсутствует' }}
              </p>
            </div>
          </div>

          <!-- Status badge details -->
          <div class="bg-slate-50 border border-slate-150 rounded-xl p-2 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Текущий статус</span>
              <span class="text-[10.5px] font-bold block truncate" :class="isPending(selectedApp) ? 'text-amber-600' : isDone(selectedApp) ? 'text-emerald-600' : 'text-rose-600'">
                {{ isPending(selectedApp) ? 'Ожидает решения (Новый)' : isDone(selectedApp) ? 'Запись создана' : 'Отклонено' }}
              </span>
            </div>
            <div class="text-right shrink-0">
              <span class="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Дата подачи</span>
              <span class="text-[10px] text-slate-500 italic font-semibold block">{{ selectedApp['Отметка времени'] ? formatTimestamp(selectedApp['Отметка времени']) : '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Sticky Modal Footer Actions -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            <!-- If record is already created -->
            <button
              v-if="isDone(selectedApp)"
              @click="openLinkedRecord(selectedApp['IDRecords']); selectedApp = null"
              class="h-9 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition border border-emerald-200 cursor-pointer shadow-sm"
            >
              <i class="bi bi-box-arrow-in-up-right"></i>
              Смотреть запись
            </button>
            
            <template v-else-if="isPending(selectedApp) || (user && user.Role !== 'Master')">
              <button
                @click="createRecordFromApp(selectedApp); selectedApp = null"
                class="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition border border-emerald-650 cursor-pointer shadow-sm animate-fade-in"
              >
                <i class="bi bi-calendar-plus"></i>
                Запись
              </button>
            </template>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Decline button (Paint in RED) - Icon Only -->
            <button
              v-if="!isDone(selectedApp) && (isPending(selectedApp) || (user && user.Role !== 'Master'))"
              @click="declineApplication(selectedApp); selectedApp = null"
              class="w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 rounded-xl flex items-center justify-center transition cursor-pointer shadow-sm shrink-0"
              title="Отклонить заявку"
            >
              <i class="bi bi-slash-circle text-[14px]"></i>
            </button>

            <!-- Delete button for admin only (Paint in BLACK) -->
            <button
              v-if="user && user.Role === 'Superadmin'"
              @click="deleteApplication(selectedApp); selectedApp = null"
              class="h-9 px-3 bg-slate-900 hover:bg-black text-white border border-slate-950 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer shadow-sm"
              title="Удалить заявку"
            >
              <i class="bi bi-trash"></i>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { formatLocalDate, formatLocalTime } from "../utils/helpers";

export default {
  props: {
    db: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    searchQuery: {
      type: String,
      default: "",
    },
    isFiltersExpanded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["open-record"],
  data() {
    return {
      activeStatusTab: "pending",
      selectedApp: null,
      tabs: [
        { id: "pending", label: "Новые", icon: "bi bi-envelope" },
        { id: "created", label: "Запись", icon: "bi bi-calendar-check" },
        { id: "declined", label: "Отклонено", icon: "bi bi-slash-circle" },
        { id: "all", label: "Все", icon: "bi bi-grid" },
      ],
    };
  },
  setup() {
    const store = useMainStore();
    return { store };
  },
  computed: {
    applications() {
      // Ensure it is always an array
      const rawList = this.db.applications || [];
      if (this.user && this.user.Role === "Master") {
        const myMid = this.store.currentUserMasterID;
        return rawList.filter((app) => {
          const isDone = String(app["Статус Заявки"]).trim() === "Создана запись";
          const recordId = app["IDRecords"];
          if (isDone || recordId) {
            const linkedRec = this.db.records?.find((r) => String(r.ID) === String(recordId));
            if (linkedRec) {
              return String(linkedRec.MasterID) === String(myMid);
            }
            return false;
          }
          return true;
        });
      }
      return rawList;
    },
    filteredApplications() {
      let list = [...this.applications];

      // Filter by active status tab
      if (this.activeStatusTab === "pending") {
        list = list.filter((a) => this.isPending(a));
      } else if (this.activeStatusTab === "created") {
        list = list.filter((a) => this.isDone(a));
      } else if (this.activeStatusTab === "declined") {
        list = list.filter((a) => this.isDeclined(a));
      }

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        list = list.filter(
          (a) =>
            String(a["Ваше Имя"] || "").toLowerCase().includes(query) ||
            String(a["Контактный номер телефона"] || "").toLowerCase().includes(query) ||
            String(a["Государственный номер машины (госномер)"] || "").toLowerCase().includes(query) ||
            String(a["Марка автомобиля"] || "").toLowerCase().includes(query) ||
            String(a["Модель автомобиля"] || "").toLowerCase().includes(query),
        );
      }

      // Sort by Отметка времени descending (newest first)
      return list.sort((a, b) => {
        const timeA = a["Отметка времени"] ? new Date(a["Отметка времени"]).getTime() : 0;
        const timeB = b["Отметка времени"] ? new Date(b["Отметка времени"]).getTime() : 0;
        return timeB - timeA;
      });
    },
  },
  watch: {
    selectedApp(val) {
      if (val) {
        document.body.classList.add("dialog-open");
      } else {
        document.body.classList.remove("dialog-open");
      }
    }
  },
  unmounted() {
    document.body.classList.remove("dialog-open");
  },
  methods: {
    isPending(item) {
      const s = item["Статус Заявки"];
      return !s || String(s).trim() === "";
    },
    isDone(item) {
      return String(item["Статус Заявки"]).trim() === "Создана запись";
    },
    isDeclined(item) {
      return String(item["Статус Заявки"]).trim() === "Отклонён";
    },
    getTabCount(tabId) {
      if (tabId === "all") return this.applications.length;
      if (tabId === "pending") return this.applications.filter((a) => this.isPending(a)).length;
      if (tabId === "created") return this.applications.filter((a) => this.isDone(a)).length;
      if (tabId === "declined") return this.applications.filter((a) => this.isDeclined(a)).length;
      return 0;
    },
     formatTimestamp(val) {
      if (!val) return "—";
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        return d.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } catch (e) {
        return val;
      }
    },
    formatLocalDate(val) {
      return formatLocalDate(val);
    },
    formatLocalTime(val) {
      return formatLocalTime(val);
    },
    createRecordFromApp(app) {
      this.$emit("open-record", null, app);
    },
    async declineApplication(app) {
      const name = app["Ваше Имя"] || "Клиент";
      if (!confirm(`Вы действительно хотите отклонить заявку от "${name}"?`)) {
        return;
      }

      try {
        // Optimistic UI Update first
        const id = app["Отметка времени"];
        const index = this.store.db.applications.findIndex((a) => a["Отметка времени"] === id);
        if (index > -1) {
          this.store.db.applications[index]["Статус Заявки"] = "Отклонён";
        }

        // Notify GAS server
        const payload = {
          ID: id,
          "Статус Заявки": "Отклонён",
        };
        await this.store.dispatchSync("updateRow", payload, "Заявки на Запись");
        this.store.showToast("Статус заявки успешно изменен на 'Отклонён'");
      } catch (e) {
        this.store.showToast("Ошибка при изменении статуса заявки: " + e.message, "error");
      }
    },
    async deleteApplication(app) {
      const name = app["Ваше Имя"] || "Клиент";
      if (!confirm(`Вы действительно хотите БЕЗВОЗВРАТНО удалить заявку от "${name}"?\nЭто действие нельзя отменить.`)) {
        return;
      }

      try {
        const id = app["Отметка времени"];
        // Optimistic UI Update first
        this.store.db.applications = this.store.db.applications.filter((a) => a["Отметка времени"] !== id);

        // Notify GAS server
        await this.store.dispatchSync("deleteRow", id, "Заявки на Запись");
        this.store.showToast("Заявка успешно удалена");
      } catch (e) {
        this.store.showToast("Ошибка при удалении заявки: " + e.message, "error");
      }
    },
    openLinkedRecord(recordId) {
      if (!recordId) return;
      const rec = this.store.db.records.find((r) => r.ID === recordId);
      if (rec) {
        // Delegate to parent of component to trigger opening
        this.$emit("open-record", rec);
      } else {
        this.store.showToast("Запись не найдена в текущей базе данных. Возможно, она была удалена.", "error");
      }
    },
    formatPhoneForLink(phone) {
      if (!phone) return "";
      let cleaned = String(phone).replace(/\D/g, "");
      if (cleaned.startsWith("996")) {
        if (cleaned.length >= 9) {
          cleaned = cleaned.slice(-9);
        }
      } else if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length > 9) {
        cleaned = cleaned.slice(-9);
      }
      return "+996" + cleaned;
    },
    getWhatsAppLink(phone) {
      if (!phone) return "";
      const normalized = this.formatPhoneForLink(phone);
      return "https://wa.me/" + normalized.replace("+", "");
    },
  },
};
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
