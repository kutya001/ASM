<template>
<div @touchstart="handleTouchStart" @touchend="handleTouchEnd" class="min-h-[calc(100vh-120px)] pb-12">
            <!-- Sticky Header elements for Records -->
            <div
              class="sticky top-0 bg-transparent pt-1.5 pb-2.5 z-10 space-y-2 select-none -mx-3 px-3"
            >
              <!-- Advanced Filters - Collapsible sliding container -->
              <div
                v-if="isFiltersExpanded"
                class="bg-white border border-slate-200/50 p-4.5 rounded-2xl flex flex-col gap-3.5 transition-all duration-300 shadow-xl"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] font-bold"
                      >tune</span
                    >
                    Фильтры поиска
                  </span>
                  <button
                    @click="$emit('clear-filters')"
                    class="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition"
                  >
                    Сбросить
                  </button>
                </div>
                <div class="grid grid-cols-2 xs:grid-cols-3 gap-2">
                  <div class="flex flex-col">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1"
                      >Мастер</span
                    >
                    <select
                      :value="advFilterMaster" @change="$emit('update:advFilterMaster', $event.target.value)"
                      class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all"
                    >
                      <option value="">Все мастера</option>
                      <option
                        v-for="m in mastersList"
                        :key="m.ID"
                        :value="m.ID"
                      >
                        {{ m.Name || m.Username }}
                      </option>
                    </select>
                  </div>
                  <div class="flex flex-col">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1"
                      >Услуга</span
                    >
                    <select
                      :value="advFilterService" @change="$emit('update:advFilterService', $event.target.value)"
                      class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all"
                    >
                      <option value="">Все услуги</option>
                      <option
                        v-for="s in sortedServices"
                        :key="s.ID"
                        :value="s.ID"
                      >
                        {{ s.Name }}
                      </option>
                    </select>
                  </div>
                  <div class="flex flex-col">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1"
                      >Дата</span
                    >
                    <input
                      type="date"
                      :value="advFilterDate" @input="$emit('update:advFilterDate', $event.target.value)"
                      class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 transition-all w-full"
                    />
                  </div>
                  <div class="flex flex-col col-span-1">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1"
                      >Марка</span
                    >
                    <select
                      :value="advFilterBrand"
                      @change="$emit('update:advFilterBrand', $event.target.value); $emit('update:advFilterModel', '')"
                      class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all"
                    >
                      <option value="">Все марки</option>
                      <option
                        v-for="b in sortedBrands"
                        :key="b.ID"
                        :value="b.ID"
                      >
                        {{ b.Name }}
                      </option>
                    </select>
                  </div>
                  <div class="flex flex-col col-span-1">
                    <span
                      class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1"
                      >Модель</span
                    >
                    <select
                      :value="advFilterModel"
                      @change="$emit('update:advFilterModel', $event.target.value)"
                      class="h-8.5 py-0 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/15 cursor-pointer transition-all"
                    >
                      <option value="">Все модели</option>
                      <option
                        v-for="m in filteredModelsForFilter"
                        :key="m.ID"
                        :value="m.ID"
                      >
                        {{ m.Name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Status Filter Individual Buttons ("Islands" with shadows) -->
              <div class="flex gap-2 w-full">
                <!-- Открыт -->
                <button
                  class="flex-1 min-w-[50px] flex h-9.5 items-center justify-center w-full rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                  :class="
                    activeStatuses.length === 1 &&
                    activeStatuses.includes('Открыт')
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-500 hover:text-slate-800'
                  "
                  @click="toggleStatus('Открыт')"
                  title="Открытые"
                >
                  <span
                    class="material-symbols-outlined text-[16px]"
                    :class="
                      activeStatuses.length === 1 &&
                      activeStatuses.includes('Открыт')
                        ? 'text-white'
                        : 'text-indigo-500'
                    "
                    >build_circle</span
                  >
                </button>

                <!-- Выполнен -->
                <button
                  class="flex-1 min-w-[50px] flex h-9.5 items-center justify-center w-full rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                  :class="
                    activeStatuses.length === 1 &&
                    activeStatuses.includes('Выполнен')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-500 hover:text-slate-800'
                  "
                  @click="toggleStatus('Выполнен')"
                  title="Выполненные"
                >
                  <span
                    class="material-symbols-outlined text-[16px]"
                    :class="
                      activeStatuses.length === 1 &&
                      activeStatuses.includes('Выполнен')
                        ? 'text-white'
                        : 'text-emerald-500'
                    "
                    >check_circle</span
                  >
                </button>

                <!-- Отменён -->
                <button
                  class="flex-1 min-w-[50px] flex h-9.5 items-center justify-center w-full rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                  :class="
                    activeStatuses.length === 1 &&
                    activeStatuses.includes('Отменён')
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-slate-500 hover:text-slate-800'
                  "
                  @click="toggleStatus('Отменён')"
                  title="Отменённые"
                >
                  <span
                    class="material-symbols-outlined text-[16px]"
                    :class="
                      activeStatuses.length === 1 &&
                      activeStatuses.includes('Отменён')
                        ? 'text-white'
                        : 'text-rose-500'
                    "
                    >cancel</span
                  >
                </button>

                <!-- Все -->
                <button
                  class="flex-1 min-w-[50px] flex h-9.5 items-center justify-center w-full rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg focus:outline-none outline-none"
                  :class="
                    activeStatuses.length === 3
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-500 hover:text-slate-800'
                  "
                  @click="$emit('set-all-statuses')"
                  title="Все статусы"
                >
                  <span
                    class="material-symbols-outlined text-[16px]"
                    :class="
                      activeStatuses.length === 3
                        ? 'text-white'
                        : 'text-slate-600'
                    "
                    >all_inclusive</span
                  >
                </button>
              </div>

              <!-- Панель массовых действий для Суперадмина -->
              <div
                v-if="user && user.Role === 'Superadmin' && selectedRecordIDs.length > 0"
                class="bg-slate-900 border border-slate-950 text-white rounded-2xl p-3.5 shadow-xl flex flex-col gap-2.5 mt-2 animate-slide-down"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-indigo-400">auto_fix_high</span>
                    Массовые действия (Выбрано: {{ selectedRecordIDs.length }})
                  </span>
                  <div class="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      @click="selectAllFiltered"
                      class="font-bold text-indigo-300 hover:text-white transition cursor-pointer bg-transparent border-none"
                    >
                      Выбрать все
                    </button>
                    <span class="text-slate-600">|</span>
                    <button
                      type="button"
                      @click="selectedRecordIDs = []"
                      class="font-bold text-indigo-300 hover:text-white transition cursor-pointer bg-transparent border-none"
                    >
                      Сбросить
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-slate-805 text-left">
                  <!-- Изменить Статус -->
                  <div class="flex flex-col">
                    <span class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1 ml-0.5 text-left">Статус Записи</span>
                    <select
                      v-model="massNewStatus"
                      class="h-8 py-0 px-2 rounded-xl bg-white border-none text-xs font-bold text-slate-850 outline-none cursor-pointer w-full"
                    >
                      <option value="">Не менять</option>
                      <option value="Открыт">Открыт</option>
                      <option value="Выполнен">Выполнен</option>
                      <option value="Отменён">Отменён</option>
                    </select>
                  </div>

                  <!-- Изменить Оплату -->
                  <div class="flex flex-col">
                    <span class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1 ml-0.5 text-left">Статус Оплаты</span>
                    <select
                      v-model="massNewPaymentStatus"
                      class="h-8 py-0 px-2 rounded-xl bg-white border-none text-xs font-bold text-slate-850 outline-none cursor-pointer w-full"
                    >
                      <option value="">Не менять</option>
                      <option value="true">Оплачен</option>
                      <option value="false">Не оплачен</option>
                    </select>
                  </div>

                  <!-- Изменить Мастера -->
                  <div class="flex flex-col">
                    <span class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1 ml-0.5 text-left">Назначить Мастера</span>
                    <select
                      v-model="massNewMasterID"
                      class="h-8 py-0 px-2 rounded-xl bg-white border-none text-xs font-bold text-slate-855 outline-none cursor-pointer w-full"
                    >
                      <option value="">Не менять</option>
                      <option value="REMOVE">Без мастера</option>
                      <option
                        v-for="m in mastersList"
                        :key="m.ID"
                        :value="m.ID"
                      >
                        {{ m.Name || m.Username }}
                      </option>
                    </select>
                  </div>

                  <!-- Изменить Марку -->
                  <div class="flex flex-col">
                    <span class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1 ml-0.5 text-left">Марка</span>
                    <select
                      v-model="massNewBrandID"
                      @change="massNewModelID = ''"
                      class="h-8 py-0 px-2 rounded-xl bg-white border-none text-xs font-bold text-slate-855 outline-none cursor-pointer w-full"
                    >
                      <option value="">Не менять</option>
                      <option
                        v-for="b in sortedBrands"
                        :key="b.ID"
                        :value="b.ID"
                      >
                        {{ b.Name }}
                      </option>
                    </select>
                  </div>

                  <!-- Изменить Модель (если выбрана Марка) -->
                  <div class="flex flex-col col-span-2" v-if="massNewBrandID">
                    <span class="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mb-1 ml-0.5 text-left">Модель</span>
                    <select
                      v-model="massNewModelID"
                      class="h-8 py-0 px-2.5 rounded-xl bg-white border-none text-xs font-bold text-slate-855 outline-none cursor-pointer w-full"
                    >
                      <option value="">Выберите новую модель...</option>
                      <option
                        v-for="m in db.models.filter(x => String(x.BrandID) === String(massNewBrandID))"
                        :key="m.ID"
                        :value="m.ID"
                      >
                        {{ m.Name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-0.5">
                  <button
                    type="button"
                    @click="applyMassChanges"
                    class="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 border-none"
                  >
                    <span class="material-symbols-outlined text-xs">done_all</span>
                    Применить к {{ selectedRecordIDs.length }} зап.
                  </button>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div class="space-y-3">
              <article
                v-for="r in filteredRecords"
                :key="r.ID"
                @click="openRecordModal(r)"
                class="bg-surface rounded-2xl p-3 shadow-soft border border-slate-200/50 active:scale-[0.98] transition-all cursor-pointer hover:shadow-md hover:border-slate-300 flex flex-col gap-2"
                :class="{
                  'opacity-90': r.Status === 'Выполнен',
                  'opacity-75 grayscale-[15%]': r.Status === 'Отменён',
                }"
              >
                <!-- ROW 1: [выбрать] & [гос.номер] & [мастер] & [удалить] -->
                <div class="grid gap-2 items-center" :class="user && user.Role === 'Superadmin' ? 'grid-cols-[28px_90px_1fr_28px]' : 'grid-cols-2'">
                  <!-- Чекбокс для массового выбора (только для Суперадмина) -->
                  <div
                    v-if="user && user.Role === 'Superadmin'"
                    @click.stop
                    class="flex items-center justify-center shrink-0"
                  >
                    <input
                      type="checkbox"
                      :value="r.ID"
                      v-model="selectedRecordIDs"
                      class="w-4 h-4 text-indigo-650 bg-white rounded border-slate-300 focus:ring-indigo-500 cursor-pointer transition"
                    />
                  </div>

                  <!-- гос.номер -->
                  <div
                    class="bg-slate-900 border border-slate-950 text-white rounded-xl h-8 px-2 flex items-center gap-1 min-w-0 shadow-sm justify-center"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-amber-400 font-bold leading-none"
                      >directions_car</span
                    >
                    <span
                      class="font-mono font-black text-xs tracking-wider uppercase truncate leading-none text-slate-100"
                    >
                      {{ r.CarNumber }}
                    </span>
                  </div>

                  <!-- мастер -->
                  <div
                    class="bg-slate-50 border border-slate-200/50 text-slate-700 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-slate-400 leading-none"
                      >engineering</span
                    >
                    <span
                      class="text-xs font-bold text-slate-700 truncate leading-none"
                    >
                      {{ getMasterName(r.MasterID) }}
                    </span>
                  </div>

                  <!-- Кнопка удаления для Суперадмина -->
                  <button
                    v-if="user && user.Role === 'Superadmin'"
                    type="button"
                    @click.stop="$emit('del-row', 'Records', r.ID, 'records')"
                    class="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-105 hover:border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer transition shadow-xs shrink-0"
                    title="Удалить запись"
                  >
                    <span class="material-symbols-outlined text-[15px] font-semibold">delete</span>
                  </button>
                </div>

                <!-- ROW 2: [начало] & [Марка - Модель] -->
                <div class="grid grid-cols-2 gap-2">
                  <!-- начало -->
                  <div
                    class="bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-indigo-500 font-bold leading-none"
                      >play_circle</span
                    >
                    <span
                      class="text-xs font-bold text-slate-650 leading-none truncate"
                    >
                      {{ formatDate(r.StartTime).date }}
                      {{ formatDate(r.StartTime).time }}
                    </span>
                  </div>
                  <!-- Марка - Модель -->
                  <div
                    class="bg-slate-50 border border-slate-200/50 text-slate-700 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-slate-400 font-bold leading-none"
                      >minor_crash</span
                    >
                    <span
                      class="text-xs font-bold text-slate-800 truncate leading-none"
                    >
                      {{ getBrandName(r.BrandID) }}
                      {{ getModelName(r.ModelID) }}
                    </span>
                  </div>
                </div>

                <!-- ROW 3: [конец] & [время выполнения] -->
                <div class="grid grid-cols-2 gap-2">
                  <!-- конец -->
                  <div
                    class="bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-emerald-500 font-bold leading-none"
                      >stop_circle</span
                    >
                    <span
                      class="text-xs font-bold text-slate-650 leading-none truncate"
                    >
                      {{
                        r.EndTime
                          ? formatDate(r.EndTime).date +
                            " " +
                            formatDate(r.EndTime).time
                          : "—"
                      }}
                    </span>
                  </div>
                  <!-- время выполнения -->
                  <div
                    class="bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-slate-400 font-bold leading-none"
                      >timer</span
                    >
                    <span
                      class="text-xs font-bold text-slate-650 leading-none truncate"
                    >
                      {{
                        r.Status === "Выполнен" && r.EndTime
                          ? getDuration(r.StartTime, r.EndTime)
                          : "В процессе"
                      }}
                    </span>
                  </div>
                </div>

                <!-- ROW 4: [Услуга] & [сумма] -->
                <div class="grid grid-cols-12 gap-2 items-stretch">
                  <!-- Услуга -->
                  <div
                    class="col-span-8 bg-slate-50 border border-slate-200/50 text-slate-650 rounded-xl h-8 px-2.5 flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      class="material-symbols-outlined text-[13px] text-slate-400 font-bold shrink-0 leading-none"
                      >handyman</span
                    >
                    <span
                      class="text-xs font-bold text-slate-600 truncate leading-none"
                    >
                      {{ getRecordServicesString(r) }}
                    </span>
                  </div>
                  <!-- сумма -->
                  <div
                    class="col-span-4 bg-slate-50 border border-slate-200/50 rounded-xl h-8 px-2.5 flex items-center justify-center text-center font-bold text-slate-800 min-w-0"
                  >
                    <span
                      class="text-xs font-bold text-slate-900 leading-none font-heading truncate"
                    >
                      {{ Number(r.TotalAmount || 0).toLocaleString() }} KGS
                    </span>
                  </div>
                </div>

                <!-- ROW 4.5: Client & Contact Info with Call & WhatsApp -->
                <div v-if="r.ClientName || r.Phone" class="flex flex-wrap items-center justify-between gap-1 bg-slate-100/30 border border-slate-200/40 p-1.5 px-2.5 rounded-xl text-[11px]" @click.stop>
                  <div class="flex items-center gap-1 min-w-0">
                    <i class="bi bi-person text-slate-450 text-[13px]"></i>
                    <strong class="text-slate-750 truncate font-bold">{{ r.ClientName || 'Без имени' }}</strong>
                  </div>
                  
                  <div v-if="r.Phone" class="flex items-center gap-1.5 select-none shrink-0">
                    <!-- Call link -->
                    <a
                      :href="'tel:' + formatPhoneForLink(r.Phone)"
                      class="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-650 hover:underline"
                      title="Позвонить"
                    >
                      <i class="bi bi-telephone-fill text-[8.5px]"></i>
                      <span class="font-mono">{{ formatPhoneForLink(r.Phone) }}</span>
                    </a>
                    <span class="text-slate-350 font-light text-[9px]">|</span>
                    <!-- WhatsApp link -->
                    <a
                      :href="getWhatsAppLink(r.Phone)"
                      target="_blank"
                      class="text-emerald-650 hover:text-emerald-700 font-bold flex items-center"
                      title="Написать в WhatsApp"
                    >
                      <i class="bi bi-whatsapp text-[10.5px]"></i>
                    </a>
                  </div>
                </div>

                <!-- ROW 5: [статус записи - кнопка] & [статус оплаты - кнопка] -->
                <div class="grid grid-cols-2 gap-2 mt-1">
                  <!-- статус записи - кнопка -->
                  <button
                    @click.stop="toggleStatusDirectly(r)"
                    class="h-9 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none outline-none focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                    :class="statusButtonClasses(r.Status)"
                  >
                    <span
                      class="material-symbols-outlined text-[15px] font-black leading-none"
                      >{{ statusIcon(r.Status) }}</span
                    >
                    <span>{{ r.Status }}</span>
                  </button>

                  <!-- статус оплаты - кнопка -->
                  <button
                    @click.stop="quickPaymentToggle(r)"
                    class="h-9 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border-none outline-none focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                    :class="
                      r.IsPaid === true ||
                      String(r.IsPaid).toUpperCase() === 'TRUE'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-750'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    "
                  >
                    <span
                      class="material-symbols-outlined text-[15px] font-black leading-none"
                      >{{
                        r.IsPaid === true ||
                        String(r.IsPaid).toUpperCase() === "TRUE"
                          ? "check_circle"
                          : "cancel"
                      }}</span
                    >
                    <span>{{
                      r.IsPaid === true ||
                      String(r.IsPaid).toUpperCase() === "TRUE"
                        ? "Оплачен"
                        : "Не оплачен"
                    }}</span>
                  </button>
                </div>
              </article>

              <div
                v-if="filteredRecords.length === 0"
                class="flex flex-col items-center justify-center py-12 text-center"
              >
                <span
                  class="material-symbols-outlined text-4xl text-border-subtle mb-3"
                  >inbox</span
                >
                <p class="text-muted text-sm border-0">Записи не найдены</p>
              </div>
            </div>

            <!-- FAB -->
            <button
              @click="openRecordModal()"
              class="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform z-20 md:bottom-12 md:right-12"
            >
              <span
                class="material-symbols-outlined text-[28px]"
                style="font-variation-settings: &quot;wght&quot; 600"
                >add</span
              >
            </button>
</div>
</template>
<script>
export default {
  name: 'RecordsTab',
  props: {
    filteredRecords: Array,
    isFiltersExpanded: Boolean,
    activeStatuses: { type: Array, default: () => [] },
    advFilterMaster: String,
    advFilterService: String,
    advFilterDate: String,
    advFilterBrand: String,
    advFilterModel: String,
    mastersList: Array,
    sortedServices: Array,
    user: Object,
    db: Object
  },
  data() {
    return {
      touchStartX: 0,
      touchStartY: 0,
      selectedRecordIDs: [],
      // Mass edit properties
      massNewStatus: "",
      massNewPaymentStatus: "",
      massNewMasterID: "",
      massNewBrandID: "",
      massNewModelID: ""
    };
  },
  computed: {
    sortedBrands() {
      if (!this.db || !this.db.brands) return [];
      return [...this.db.brands].sort((a, b) => String(a.Name || "").localeCompare(String(b.Name || "")));
    },
    filteredModelsForFilter() {
      if (!this.db || !this.db.models) return [];
      if (!this.advFilterBrand) return this.db.models;
      return this.db.models.filter(m => String(m.BrandID) === String(this.advFilterBrand));
    }
  },
  methods: {
    handleTouchStart(event) {
      if (event.touches && event.touches.length > 0) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
      }
    },
    handleTouchEnd(event) {
      if (!event.changedTouches || event.changedTouches.length === 0) return;
      const diffX = event.changedTouches[0].clientX - this.touchStartX;
      const diffY = event.changedTouches[0].clientY - this.touchStartY;

      // Свайп влево/вправо по горизонтали
      if (Math.abs(diffX) > Math.abs(diffY) * 1.8 && Math.abs(diffX) > 60) {
        const order = ['Открыт', 'Выполнен', 'Отменён', 'Все'];
        let currentMode = 'Все';
        if (this.activeStatuses && this.activeStatuses.length === 1) {
          currentMode = this.activeStatuses[0];
        }

        const curIndex = order.indexOf(currentMode);
        if (curIndex !== -1) {
          let newIndex = curIndex;
          if (diffX < 0) {
            // Свайп влево -> следующий фильтр
            newIndex = (curIndex + 1) % order.length;
          } else {
            // Свайп вправо -> предыдущий фильтр
            newIndex = (curIndex - 1 + order.length) % order.length;
          }

          const newMode = order[newIndex];
          if (newMode === 'Все') {
            this.$emit('set-all-statuses');
          } else {
            this.toggleStatus(newMode);
          }
        }
      }
    },
    selectAllFiltered() {
      // Choose only those that are visible in filtered list
      this.selectedRecordIDs = this.filteredRecords.map(r => r.ID);
    },
    applyMassChanges() {
      if (!this.selectedRecordIDs || this.selectedRecordIDs.length === 0) {
        return;
      }
      if (
        !this.massNewStatus &&
        !this.massNewPaymentStatus &&
        !this.massNewMasterID &&
        !this.massNewBrandID
      ) {
        return;
      }
      this.$emit("mass-update", {
        ids: [...this.selectedRecordIDs],
        status: this.massNewStatus,
        isPaid: this.massNewPaymentStatus,
        masterId: this.massNewMasterID,
        brandId: this.massNewBrandID,
        modelId: this.massNewModelID
      });
      // Reset mass update states
      this.selectedRecordIDs = [];
      this.massNewStatus = "";
      this.massNewPaymentStatus = "";
      this.massNewMasterID = "";
      this.massNewBrandID = "";
      this.massNewModelID = "";
    },
    openRecordModal(record = null) {
      this.$emit("open-record", record);
    },
    quickPaymentToggle(record) {
      this.$emit("quick-payment", record);
    },
    toggleStatusDirectly(record) {
      this.$emit("toggle-status", record);
    },
    toggleStatus(status) {
      this.$emit("toggle-status-filter", status);
    },
    getDuration(start, end) {
      if (!start || !end) return '';
      let s = new Date(start); let e = new Date(end);
      let diffMs = e - s; if (diffMs < 0) return '0 мин';
      let diffMins = Math.floor(diffMs / 60000);
      let hours = Math.floor(diffMins / 60); let mins = diffMins % 60; let days = Math.floor(hours / 24); hours = hours % 24;
      let parts = []; if (days > 0) parts.push(days + ' дн'); if (hours > 0) parts.push(hours + ' ч'); if (mins > 0 || parts.length === 0) parts.push(mins + ' мин'); return parts.join(' ');
    },
    statusBadgeTw(status) {
      if (status === 'Выполнен') return 'bg-status-completed-bg text-status-completed-text';
      if (status === 'Отменён') return 'bg-status-canceled-bg text-status-canceled-text';
      return 'bg-status-open-bg text-status-open-text';
    },
    statusBgTw(status) {
      if (status === 'Выполнен') return 'bg-status-completed-bg border-status-completed-text/20 text-status-completed-text';
      if (status === 'Отменён') return 'bg-status-canceled-bg border-status-canceled-text/20 text-status-canceled-text';
      return 'bg-status-open-bg border-status-open-text/20 text-status-open-text';
    },
    formatDate(isoString) {
      if (!isoString) return { date: '—', time: '' };
      try {
        let d = new Date(isoString);
        if (isNaN(d.getTime())) return { date: String(isoString), time: '' };
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const dateStr = `${day}.${month}.${year}`;
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        return { date: dateStr, time: timeStr };
      } catch (e) {
        return { date: String(isoString), time: '' };
      }
    },
    statusButtonClasses(status) {
      if (status === 'Выполнен') return 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800';
      if (status === 'Отменён') return 'bg-rose-100 hover:bg-rose-200 text-rose-800';
      return 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200';
    },
    statusIcon(status) {
      if (status === 'Выполнен') return 'check_circle';
      if (status === 'Отменён') return 'cancel';
      return 'build_circle';
    },
    getBrandName(id) { let b = this.db.brands.find((x) => x.ID == id); return b ? b.Name : '—'; },
    getModelName(id) { let m = this.db.models.find((x) => x.ID == id); return m ? m.Name : ''; },
    getMasterName(id) { let m = this.db.users.find((x) => x.ID == id); return m ? m.Name || m.Username : 'Не назначен'; },
    getRecordServicesString(record) {
      if (!record) return '—';
      let sids = [];
      if (record.ServicesJSON) { try { sids = typeof record.ServicesJSON === 'string' ? JSON.parse(record.ServicesJSON || '[]') : record.ServicesJSON; } catch (e) { sids = []; } }
      if (!sids || sids.length === 0) return 'Без услуг';
      return sids.map((item) => {
        if (typeof item === 'object') return item.name;
        let found = this.db.services.find((s) => s.ID === item); return found ? found.Name : '';
      }).filter(Boolean).join(', ');
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
    }
  }
};
</script>
