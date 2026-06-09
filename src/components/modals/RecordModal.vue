<template>
  <div
    class="modal fade"
    id="recordModal"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div
      class="modal-dialog modal-fullscreen-md-down modal-lg modal-dialog-centered modal-dialog-scrollable m-0 md:m-auto"
    >
      <div
        class="modal-content h-full md:h-auto md:max-h-[92vh] md:rounded-3xl border-0 shadow-2xl overflow-hidden font-sans bg-slate-50 flex flex-col relative"
      >
        <!-- Top Nav -->
        <div
          class="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/60 py-3 px-4 flex items-center justify-between shadow-sm md:px-5 md:py-3.5"
        >
          <button
            type="button"
            class="text-slate-600 flex w-9 h-9 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors md:hidden"
            data-bs-dismiss="modal"
          >
            <i class="bi bi-arrow-left text-lg"></i>
          </button>
          <h5
            class="modal-title font-bold text-slate-800 text-[16px] md:text-lg leading-tight flex-1 flex items-center gap-2.5 md:justify-start justify-center pr-9 md:pr-0 m-0"
          >
            <div
              class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 hidden md:flex items-center justify-center"
            >
              <i class="bi bi-journal-text text-sm"></i>
            </div>
            {{
              recordForm.ID
                ? isEditingRecord
                  ? "Редактировать запись"
                  : "Просмотр записи"
                : "Новая запись"
            }}
          </h5>
          <button
            type="button"
            class="btn-close text-slate-400 focus:ring-0 hidden md:block"
            data-bs-dismiss="modal"
          ></button>
        </div>

        <div class="modal-body flex-1 overflow-y-auto p-3.5 md:p-5 bg-slate-50">
          <template v-if="!isEditingRecord">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
              <!-- Left column: Main properties -->
              <div class="space-y-3.5">
                <!-- Vehicle Card -->
                <div
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden"
                >
                  <div
                    class="absolute right-0 top-0 w-24 h-24 bg-indigo-50/30 rounded-full translate-x-8 -translate-y-8 select-none pointer-events-none md:block hidden"
                  ></div>
                  <span
                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >Автомобиль</span
                  >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0"
                    >
                      <i class="bi bi-car-front-fill text-lg"></i>
                    </div>
                    <div>
                      <h2
                        class="text-lg font-black text-slate-800 uppercase tracking-tight m-0 leading-tight"
                      >
                        {{ recordForm.CarNumber || "Без номера" }}
                      </h2>
                      <p
                        class="text-[11px] font-bold text-slate-500 m-0 mt-0.5"
                      >
                        {{ getBrandName(recordForm.BrandID) }}
                        {{ getModelName(recordForm.ModelID) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Client & Master Info Card -->
                <div
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3.5"
                >
                  <div>
                    <span
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                      >Клиент</span
                    >
                    <div
                      class="text-xs font-bold text-slate-800 flex items-center gap-2"
                    >
                      <i class="bi bi-person text-slate-400 text-sm"></i>
                      {{ recordForm.ClientName || "—" }}
                    </div>
                    <!-- Dual call and WhatsApp links with on-the-fly normalization -->
                    <div v-if="recordForm.Phone" class="flex items-center gap-1.5 mt-1.5 select-none scale-95 origin-left">
                      <!-- Call component -->
                      <a
                        :href="'tel:' + formatPhoneForLink(recordForm.Phone)"
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-650 px-2.5 py-1 rounded-lg transition-all border border-indigo-200/50"
                        title="Позвонить"
                      >
                        <i class="bi bi-telephone-fill text-[9px]"></i>
                        <span class="font-mono">{{ formatPhoneForLink(recordForm.Phone) }}</span>
                      </a>
                      <!-- WhatsApp component -->
                      <a
                        :href="getWhatsAppLink(recordForm.Phone)"
                        target="_blank"
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-650 px-2 py-1 rounded-lg transition-all border border-emerald-200/50"
                        title="Написать в WhatsApp"
                      >
                        <i class="bi bi-whatsapp text-[10.5px]"></i>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-slate-100">
                    <span
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                      >Сотрудник / Мастер</span
                    >
                    <div
                      class="text-xs font-bold text-slate-800 flex items-center gap-2"
                    >
                      <i class="bi bi-person-gear text-slate-400 text-sm"></i>
                      {{ getMasterName(recordForm.MasterID) || "Не назначен" }}
                    </div>
                    <div
                      class="mt-1 text-[11px] font-semibold text-slate-500 flex items-center gap-1"
                    >
                      <i class="bi bi-clock text-slate-400 text-[10px]"></i>
                      {{
                        recordForm.StartTime_LOCAL
                          ? `${formatDate(recordForm.StartTime_LOCAL).date} ${formatDate(recordForm.StartTime_LOCAL).time}`
                          : "—"
                      }}
                    </div>
                  </div>
                </div>

                <!-- Status & Date Tracker -->
                <div
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                        >Текущий статус</span
                      >
                      <span
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-block"
                        :class="statusBadgeTw(recordForm.Status)"
                      >
                        {{ recordForm.Status }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                        >Дата заезда</span
                      >
                      <span class="text-xs font-bold text-slate-500">
                        {{
                          recordForm.StartTime_LOCAL
                            ? `${formatDate(recordForm.StartTime_LOCAL).date} ${formatDate(recordForm.StartTime_LOCAL).time}`
                            : "Недавно"
                        }}
                      </span>
                    </div>
                  </div>

                  <!-- Display completion date & execution time if status is completed -->
                  <div
                    v-if="
                      recordForm.Status === 'Выполнен' && recordForm.EndTime
                    "
                    class="pt-3 border-t border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                        >Дата завершения</span
                      >
                      <span class="text-xs font-bold text-slate-700">
                        {{
                          recordForm.EndTime
                            ? `${formatDate(recordForm.EndTime).date} ${formatDate(recordForm.EndTime).time}`
                            : "—"
                        }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                        >Время выполнения</span
                      >
                      <span
                        class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-100/50 inline-block"
                      >
                        {{
                          getDuration(recordForm.StartTime, recordForm.EndTime)
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Payment Status Card -->
                <div
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                      >Статус оплаты</span
                    >
                    <span
                      class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border inline-flex items-center gap-1 shadow-sm"
                      :class="
                        recordForm.IsPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                          : 'bg-rose-50 text-rose-700 border-rose-200/50'
                      "
                    >
                      <span
                        class="material-symbols-outlined text-[13px] font-black"
                        >{{
                          recordForm.IsPaid ? "check_circle" : "cancel"
                        }}</span
                      >
                      {{ recordForm.IsPaid ? "Оплачено" : "Не оплачено" }}
                    </span>
                  </div>
                  <div class="text-right">
                    <span
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"
                      >Изменение</span
                    >
                    <button
                      @click="
                        recordForm.IsPaid = !recordForm.IsPaid;
                        handleSave();
                      "
                      class="h-8 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] uppercase rounded-xl border border-slate-200 transition cursor-pointer inline-flex items-center gap-1.5 leading-none select-none"
                    >
                      <span
                        class="material-symbols-outlined text-[14px] font-bold"
                        >payments</span
                      >
                      <span>Оплачено/Нет</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right column: Services list, Comments, Actions -->
              <div class="space-y-3.5">
                <!-- Services invoice card -->
                <div
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm"
                >
                  <span
                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5"
                    >Состав работ и услуг</span
                  >
                  <div class="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                    <div
                      v-for="sid in recordForm.ServicesJSON"
                      :key="sid.id || sid"
                      class="flex justify-between items-center bg-slate-50/70 px-2.5 py-2 rounded-xl border border-slate-100"
                    >
                      <span
                        class="text-xs font-bold text-slate-700 truncate pr-2"
                        >{{ typeof sid === 'object' ? sid.name : getServiceName(sid) }}</span
                      >
                      <span class="text-xs font-black text-slate-800 shrink-0"
                        >{{
                          Number(typeof sid === 'object' ? sid.price : getServicePrice(sid)).toLocaleString()
                        }}
                        KGS</span
                      >
                    </div>
                    <div
                      v-if="
                        !recordForm.ServicesJSON ||
                        !recordForm.ServicesJSON.length
                      "
                      class="text-xs text-slate-400 font-semibold italic text-center py-4"
                    >
                      Нет услуг в этой записи
                    </div>
                  </div>
                  <div
                    class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center"
                  >
                    <span
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                      >Итого к оплате:</span
                    >
                    <span class="text-sm font-black text-indigo-600"
                      >{{ Number(recordForm.TotalAmount).toLocaleString() }}
                      <span class="text-[10px] text-slate-400 font-bold"
                        >KGS</span
                      ></span
                    >
                  </div>
                </div>

                <!-- Comments -->
                <div
                  v-if="recordForm.Comment"
                  class="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100"
                >
                  <span
                    class="block text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1"
                    >Комментарий</span
                  >
                  <p
                    class="text-xs font-semibold text-amber-800 m-0 leading-normal"
                  >
                    {{ recordForm.Comment }}
                  </p>
                </div>

                <!-- Action tools -->
                <div
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5"
                  v-if="
                    user &&
                    (user.Role === 'Superadmin' ||
                      user.Role === 'SenMaster' ||
                      (recordForm.Status !== 'Выполнен' &&
                        recordForm.Status !== 'Отменён'))
                  "
                >
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-if="recordForm.Status !== 'Выполнен'"
                      @click="quickStatusChangeModal('Выполнен')"
                      class="py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-100 border border-emerald-200/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i class="bi bi-check-circle"></i> Выполнен
                    </button>
                    <button
                      v-if="recordForm.Status !== 'Отменён'"
                      @click="quickStatusChangeModal('Отменён')"
                      class="py-2 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 border border-red-200/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i class="bi bi-x-circle"></i> Отменить
                    </button>
                    <button
                      v-if="recordForm.Status !== 'Открыт'"
                      @click="quickStatusChangeModal('Открыт')"
                      class="py-2 bg-slate-50 text-slate-700 font-bold col-span-2 rounded-xl text-xs hover:bg-slate-100 border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i class="bi bi-arrow-counterclockwise"></i> Вернуть
                      статус Открыт
                    </button>
                  </div>
                  <button
                    @click="isEditingRecord = true"
                    class="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i class="bi bi-pencil-square"></i> Изменить запись
                  </button>
                </div>
                <div class="p-3 bg-slate-100 rounded-2xl text-center" v-else>
                  <p
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0"
                  >
                    Действия недоступны (запись закрыта)
                  </p>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
              <!-- Left Column: Client & Vehicle -->
              <div class="space-y-3.5">
                <!-- Client Details Section -->
                <section
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm"
                >
                  <h3
                    class="text-slate-800 text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-wider select-none"
                  >
                    <i class="bi bi-person text-indigo-600"></i> Клиент
                  </h3>
                  <div class="space-y-3">
                    <div class="flex flex-col">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Имя Фамилия <span class="text-red-500">*</span></label
                      >
                      <input
                        ref="clientNameInput"
                        v-model="recordForm.ClientName"
                        class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                        placeholder="Иван Иванов"
                      />
                    </div>
                    <div class="flex flex-col">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Телефон <span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="recordForm.Phone"
                        @input="onPhoneInput"
                        type="tel"
                        class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                        placeholder="+996 (700) 123-456"
                      />
                    </div>
                  </div>
                </section>

                <!-- Vehicle Details Section -->
                <section
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm"
                >
                  <h3
                    class="text-slate-800 text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-wider select-none"
                  >
                    <i class="bi bi-car-front text-indigo-600"></i> Автомобиль
                  </h3>
                  <div class="space-y-3">
                    <div class="flex flex-col space-y-2.5">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-0.5 ml-1 uppercase tracking-wider"
                        >Госномер <span class="text-red-500">*</span></label
                      >
                      <div class="flex bg-slate-100 rounded-xl p-1">
                        <button
                          @click="setCarCountry('KG')"
                          :class="{
                            'bg-white shadow-sm text-indigo-600':
                              recordForm.CarCountry === 'KG',
                            'text-slate-500 hover:text-slate-700':
                              recordForm.CarCountry !== 'KG',
                          }"
                          class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none"
                          type="button"
                        >
                          Кыргызский
                        </button>
                        <button
                          @click="setCarCountry('FOREIGN')"
                          :class="{
                            'bg-white shadow-sm text-indigo-600':
                              recordForm.CarCountry !== 'KG',
                            'text-slate-500 hover:text-slate-700':
                              recordForm.CarCountry === 'KG',
                          }"
                          class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none"
                          type="button"
                        >
                          Иностранный
                        </button>
                      </div>

                      <div
                        v-if="recordForm.CarCountry === 'KG'"
                        class="grid grid-cols-4 gap-2"
                      >
                        <div class="flex flex-col col-span-1">
                          <span
                            class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider"
                            >Регион</span
                          >
                          <input
                            ref="carRegionInput"
                            v-model="recordForm.CarRegion"
                            @input="updateCarNumber"
                            maxlength="2"
                            inputmode="numeric"
                            class="w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase text-center"
                            placeholder="01"
                          />
                        </div>
                        <div class="flex flex-col col-span-3">
                          <span
                            class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider"
                            >Номер автомобиля</span
                          >
                          <input
                            ref="carNumberMainInput"
                            v-model="recordForm.CarNumberMain"
                            @input="updateCarNumber"
                            maxlength="7"
                            class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-wider text-center"
                            placeholder="123 ABC"
                          />
                        </div>
                      </div>
                      <div v-else class="flex flex-col">
                        <span
                          class="text-[9px] text-slate-400 font-bold mb-1 ml-1 uppercase tracking-wider"
                          >Иностранный госномер</span
                        >
                        <input
                          v-model="recordForm.CarNumber"
                          class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none uppercase tracking-wider text-center"
                          placeholder="A777AA77"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col relative" v-click-outside="hideBrandDropdown">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Марка <span class="text-red-500">*</span></label
                      >
                      <div class="relative">
                        <input
                          type="text"
                          v-model="brandSearchInput"
                          @focus="onBrandFocus"
                          @click="onBrandFocus"
                          class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                          placeholder="Выберите марку..."
                        />
                        <div
                          v-show="showBrandDropdown"
                          class="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 max-h-48 overflow-y-auto z-50"
                        >
                          <div
                            v-for="b in filteredBrandsList"
                            :key="b.ID"
                            @click.stop="selectBrand(b)"
                            class="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            {{ b.Name }}
                          </div>
                          <div
                            v-if="filteredBrandsList.length === 0"
                            class="px-3 py-2 text-xs text-slate-400 italic"
                          >
                            Ничего не найдено
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col relative" v-click-outside="hideModelDropdown">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Модель <span class="text-red-500">*</span></label
                      >
                      <div class="relative">
                        <input
                          type="text"
                          v-model="modelSearchInput"
                          @focus="onModelFocus"
                          @click="onModelFocus"
                          :disabled="!recordForm.BrandID"
                          class="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                          placeholder="Выберите модель..."
                        />
                        <div
                          v-show="showModelDropdown"
                          class="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 max-h-48 overflow-y-auto z-50"
                        >
                          <div
                            v-for="m in filteredModelsList"
                            :key="m.ID"
                            @click.stop="selectModel(m)"
                            class="px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            {{ m.Name }}
                          </div>
                          <div
                            v-if="filteredModelsList.length === 0"
                            class="px-3 py-2 text-xs text-slate-400 italic"
                          >
                            Ничего не найдено
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Right Column: Services & Status -->
              <div class="space-y-3.5 flex flex-col justify-between">
                <!-- Services list card -->
                <section
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col"
                >
                  <h3
                    class="text-slate-800 text-[11px] font-black mb-3 flex items-center justify-between uppercase tracking-wider select-none animate-fade-in"
                  >
                    <span class="flex items-center gap-2"
                      ><i class="bi bi-tools text-indigo-600"></i> Услуги и
                      Работы
                      <span
                        v-if="!recordForm.ServicesJSON.length"
                        class="text-red-500"
                        >*</span
                      ></span
                    >
                    <span
                      class="text-[9.5px] text-slate-400 font-extrabold uppercase"
                      v-if="recordForm.ServicesJSON.length"
                      >{{ recordForm.ServicesJSON.length }} усл.</span
                    >
                  </h3>

                  <div
                    class="space-y-2 mb-3 pr-1"
                  >
                    <div
                      v-for="(srv, idx) in recordForm.ServicesJSON"
                      :key="idx"
                      class="flex flex-col gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors"
                    >
                      <!-- Top row: full-width Service Name -->
                      <div class="w-full text-xs font-bold text-slate-700 leading-snug break-words text-wrap">
                        <textarea
                          v-if="srv.isCustom"
                          v-model="srv.name"
                          class="w-full text-xs font-bold text-slate-700 bg-transparent border-0 p-0 outline-none focus:ring-0 leading-tight resize-none text-wrap break-words placeholder-slate-400"
                          rows="1"
                          placeholder="Название услуги..."
                          style="min-height: 16px; overflow: hidden;"
                          @input="e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }"
                        ></textarea>
                        <p
                          v-else
                          class="text-xs font-bold text-slate-750 m-0 break-words text-wrap leading-snug whitespace-normal antialiased"
                        >
                          {{ srv.name }}
                        </p>
                      </div>
                      <!-- Bottom row: Price Input, KGS label, and Remove button aligned neatly to the right -->
                      <div class="flex items-center justify-end gap-2 border-t border-slate-250/25 pt-2">
                        <div class="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            v-model.number="srv.price"
                            @input="calcTotal"
                            class="w-20 h-7 px-2 text-right text-xs font-black text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100/50"
                          />
                          <span class="text-[9px] font-bold text-slate-400 uppercase select-none">KGS</span>
                        </div>
                        <div class="h-4 w-[1px] bg-slate-200 shrink-0"></div>
                        <button
                          type="button"
                          @click="removeService(idx)"
                          class="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center w-6 h-6 rounded-lg hover:bg-slate-200/50 cursor-pointer border-none shrink-0"
                          title="Удалить"
                        >
                          <i class="bi bi-trash text-[11.5px]"></i>
                        </button>
                      </div>
                    </div>

                    <div
                      v-if="recordForm.ServicesJSON.length === 0"
                      class="text-center py-4 bg-slate-50/55 rounded-xl border border-slate-100/70 text-slate-400 text-[11px] font-bold italic"
                    >
                      Список услуг пока пуст
                    </div>
                  </div>

                  <div class="flex flex-col relative mt-1" v-click-outside="hideServiceDropdown">
                    <div class="relative">
                      <i
                        class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                      ></i>
                      <input
                        type="text"
                        autocomplete="off"
                        v-model="serviceSearch"
                        @focus="showServiceSelector = true"
                        class="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                        placeholder="Поиск услуги или впишите новую..."
                      />
                    </div>
                    <div
                      v-show="showServiceSelector"
                      class="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_10px_0_rgba(0,0,0,0.02)] border border-slate-100 max-h-56 overflow-y-auto z-[60]"
                    >
                      <button
                        v-for="srv in filteredServices"
                        :key="srv.ID"
                        type="button"
                        @click.stop="toggleService(srv.ID)"
                        class="w-full px-3 py-2.5 text-xs font-semibold hover:bg-slate-50 cursor-pointer flex justify-between items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
                        :class="
                          isServiceSelected(srv.ID) ? 'text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50' : 'text-slate-700'
                        "
                      >
                        <span class="flex-1 text-left flex items-start gap-1.5 whitespace-normal break-words text-wrap leading-snug">
                          <i v-if="isServiceSelected(srv.ID)" class="bi bi-check text-indigo-600 text-xs mt-0.5 shrink-0 block"></i>
                          <i v-else class="bi bi-circle text-slate-300 text-[9px] mt-1 shrink-0 block"></i>
                          <span>{{ srv.Name }}</span>
                        </span>
                        <span class="text-slate-500 font-extrabold shrink-0 text-right text-xs mt-0.5 min-w-max">{{ Number(srv.Price).toLocaleString() }} KGS</span>
                      </button>
                      
                      <button
                        type="button"
                        @click.stop="addCustomServiceFromName"
                        v-if="serviceSearch.trim().length > 0 && !filteredServices.some(s => String(s.Name || '').toLowerCase() === serviceSearch.trim().toLowerCase())"
                        class="w-full px-3 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer border-t border-slate-100 flex items-center gap-2 bg-indigo-600 transition"
                      >
                        <i class="bi bi-plus-lg"></i> Добавить "{{ serviceSearch.trim() }}"
                      </button>
                      
                      <div
                        v-if="filteredServices.length === 0 && serviceSearch.trim().length === 0"
                        class="px-3 py-4 text-[11px] text-slate-400 font-semibold italic text-center"
                      >
                        Введите название для поиска услуги
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex flex-col mt-3 border-t border-slate-100 pt-3"
                  >
                    <label
                      class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                      >Комментарий</label
                    >
                    <textarea
                      ref="commentInput"
                      v-model="recordForm.Comment"
                      class="w-full min-h-[50px] px-2.5 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-semibold text-slate-700 resize-y"
                      rows="2"
                      placeholder="Комментарий или заметки к ремонту..."
                    ></textarea>
                  </div>
                </section>

                <!-- Status, Master & Time Section -->
                <section
                  class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3 shrink-0"
                >
                  <h3
                    class="text-slate-800 text-[10px] font-black mb-1 flex items-center gap-2 uppercase tracking-wider select-none"
                  >
                    <i class="bi bi-person-gear text-indigo-600"></i>
                    Исполнитель и Статус
                  </h3>

                  <div class="grid grid-cols-2 gap-2.5">
                    <div class="flex flex-col relative col-span-1">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Мастер</label
                      >
                      <select
                        v-model="recordForm.MasterID"
                        :disabled="user && user.Role === 'Master'"
                        class="form-select w-full h-10 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:opacity-50"
                      >
                        <option value="">Не назначен</option>
                        <option
                          v-for="ms in mastersList"
                          :key="ms.ID"
                          :value="ms.ID"
                        >
                          {{ ms.Name || ms.Username }}
                        </option>
                      </select>
                    </div>

                    <div class="flex flex-col col-span-1">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Статус</label
                      >
                      <select
                        v-model="recordForm.Status"
                        class="form-select w-full h-10 rounded-xl border px-2 text-xs font-bold tracking-wide outline-none transition cursor-pointer"
                        :class="statusBgTw(recordForm.Status)"
                      >
                        <option value="Открыт">ОТКРЫТ</option>
                        <option value="Выполнен">ВЫПОЛНЕН</option>
                        <option value="Отменён">ОТМЕНЁН</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2.5">
                    <div class="flex flex-col col-span-1">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Время заезда</label
                      >
                      <input
                        type="datetime-local"
                        class="w-full h-10 rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        v-model="recordForm.StartTime_LOCAL"
                      />
                    </div>
                    <div class="flex flex-col col-span-1 select-none">
                      <label
                        class="text-slate-500 text-[10px] font-bold mb-1 ml-1 uppercase tracking-wider"
                        >Оплата</label
                      >
                      <div
                        class="flex gap-1 bg-slate-50 p-1.5 rounded-xl h-10 items-center border border-slate-200"
                      >
                        <button
                          type="button"
                          @click="recordForm.IsPaid = true"
                          class="flex-1 h-full rounded-lg text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 shrink-0"
                          :class="
                            recordForm.IsPaid
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-transparent text-slate-500 hover:text-slate-800'
                          "
                        >
                          <span
                            class="material-symbols-outlined text-[13px] font-black"
                            >check_circle</span
                          >
                          <span>Да</span>
                        </button>
                        <button
                          type="button"
                          @click="recordForm.IsPaid = false"
                          class="flex-1 h-full rounded-lg text-[9.5px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-0.5 shrink-0"
                          :class="
                            !recordForm.IsPaid
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-transparent text-slate-500 hover:text-slate-800'
                          "
                        >
                          <span
                            class="material-symbols-outlined text-[13px] font-black"
                            >cancel</span
                          >
                          <span>Нет</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </template>
        </div>

        <!-- Sticky Bottom Bar -->
        <div
          v-show="isEditingRecord"
          class="bg-white border-t border-slate-200 px-4 py-3 md:px-5 shrink-0 flex justify-between items-center gap-3"
        >
          <div class="flex items-center gap-1.5 px-0.5">
            <span
              class="text-slate-500 font-bold text-[10px] uppercase tracking-wider hidden sm:inline"
              >Итого к оплате (KGS):</span
            >
            <input
              type="number"
              v-model="recordForm.TotalAmount"
              readonly
              class="w-24 px-2 py-1 bg-slate-50 border border-slate-200/80 rounded text-lg font-black text-slate-750 text-right outline-none cursor-not-allowed select-none"
              title="Сумма рассчитывается автоматически по услугам"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="hidden md:flex h-9.5 px-4 items-center border border-slate-205 text-slate-600 bg-white rounded-xl hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              data-bs-dismiss="modal"
            >
              Отмена
            </button>
            <button
              type="button"
              @click="handleSave"
              :disabled="isSaving"
              class="h-9.5 px-5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer border-none"
            >
              <span
                v-if="isSaving"
                class="spinner-border spinner-border-sm text-white border-2"
              ></span
              >Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";
import { formatDate, getDuration, formatPhoneInput } from "../../utils/helpers";

export default {
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener("pointerdown", el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener("pointerdown", el.clickOutsideEvent);
      }
    }
  },
  data() {
    return {
      recordForm: this.emptyRecord(),
      isEditingRecord: false,
      showServiceSelector: false,
      serviceSearch: "",
      brandSearchInput: "",
      showBrandDropdown: false,
      modelSearchInput: "",
      showModelDropdown: false,
      isSaving: false,
      bsModal: null,
      applicationRef: null,
      ignoreModelFocus: false,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    mastersList() {
      return this.store.mastersList;
    },
    sortedBrands() {
      return this.store.sortedBrands;
    },
    availableModels() {
      let bId = this.recordForm.BrandID;
      if (!bId) return [];
      let models = this.store.db.models.filter((m) => m && m.BrandID === bId);
      return [...models].sort((x, y) =>
        String(x.Name || "")
          .toLowerCase()
          .localeCompare(String(y.Name || "").toLowerCase()),
      );
    },
    filteredBrandsList() {
      let b = this.sortedBrands;
      if (!this.brandSearchInput) return b;
      let q = String(this.brandSearchInput || "").toLowerCase();
      let currentBrand = this.store.db.brands.find((x) => x && x.ID === this.recordForm.BrandID);
      if (currentBrand && String(currentBrand.Name || "").toLowerCase() === q) {
        return b;
      }
      return b.filter((x) => String(x.Name || "").toLowerCase().includes(q));
    },
    filteredModelsList() {
      let m = this.availableModels;
      if (!this.modelSearchInput) return m;
      let q = String(this.modelSearchInput || "").toLowerCase();
      let currentModel = this.store.db.models.find((x) => x && x.ID === this.recordForm.ModelID);
      if (currentModel && String(currentModel.Name || "").toLowerCase() === q) {
        return m;
      }
      return m.filter((x) => String(x.Name || "").toLowerCase().includes(q));
    },
    filteredServices() {
      let s = [...this.store.sortedServices];
      const customItem = {
        ID: "custom_item_trigger",
        Name: "Прочий (вписать вручную)",
        Price: 0,
      };
      if (!this.serviceSearch) {
        return [customItem, ...s];
      }
      let q = String(this.serviceSearch || "").toLowerCase();
      let filtered = s.filter((x) => x && String(x.Name || "").toLowerCase().includes(q));
      return [customItem, ...filtered];
    },
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef, {
        backdrop: "static",
      });
    }
  },
  methods: {
    formatDate(val) {
      return formatDate(val);
    },
    emptyRecord() {
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      let localIso = now.toISOString().slice(0, 16);
      return {
        ID: null,
        ClientName: "",
        Phone: "+996 ",
        CarNumber: "",
        BrandID: "",
        ModelID: "",
        MasterID: "",
        Status: "Открыт",
        ServicesJSON: [],
        TotalAmount: 0,
        Comment: "",
        StartTime_LOCAL: localIso,
        CarRegion: "",
        CarCountry: "KG",
        CarNumberMain: "",
        IsPaid: false,
      };
    },
    open(record = null, application = null) {
      this.brandSearchInput = "";
      this.modelSearchInput = "";
      this.showBrandDropdown = false;
      this.showModelDropdown = false;
      
      if (application) {
        this.applicationRef = application;
        this.isEditingRecord = true;
        this.recordForm = this.emptyRecord();
        
        this.recordForm.ClientName = application['Ваше Имя'] || "";
        this.recordForm.Phone = application['Контактный номер телефона'] || "";
        
        const rawCarNum = application['Государственный номер машины (госномер)'] || "";
        this.recordForm.CarNumber = rawCarNum;
        if (rawCarNum) {
          let parts = rawCarNum.trim().split(" ");
          if (parts.length >= 3 && parts[1].toUpperCase() === "KG") {
            this.recordForm.CarRegion = parts[0];
            this.recordForm.CarCountry = parts[1];
            this.recordForm.CarNumberMain = parts.slice(2).join(" ");
          } else {
            this.recordForm.CarRegion = "";
            this.recordForm.CarCountry = "FOREIGN";
            this.recordForm.CarNumberMain = rawCarNum;
          }
        }
        
        // Find matching Brand
        const rawBrand = String(application['Марка автомобиля'] || "").trim().toLowerCase();
        let matchedBrand = this.store.db.brands.find(b => String(b.Name || "").toLowerCase().trim() === rawBrand);
        if (matchedBrand) {
          this.recordForm.BrandID = matchedBrand.ID;
          this.brandSearchInput = matchedBrand.Name;
          
          // Find matching Model
          const rawModel = String(application['Модель автомобиля'] || "").trim().toLowerCase();
          let matchedModel = this.store.db.models.find(m => m.BrandID === matchedBrand.ID && String(m.Name || "").toLowerCase().trim() === rawModel);
          if (matchedModel) {
            this.recordForm.ModelID = matchedModel.ID;
            this.modelSearchInput = matchedModel.Name;
          }
        } else if (application['Марка автомобиля']) {
          this.brandSearchInput = application['Марка автомобиля'];
        }
        
        // Parse services list
        const rawServices = application['Выберите необходимые услуги автоэлектрики (если применимо)'] || "";
        this.recordForm.ServicesJSON = [];
        if (rawServices) {
          const parts = rawServices.split(",").map(p => p.trim()).filter(Boolean);
          parts.forEach(p => {
            const pLower = p.toLowerCase();
            let srv = this.store.db.services.find(s => 
              String(s.Name || "").toLowerCase().includes(pLower) || 
              pLower.includes(String(s.Name || "").toLowerCase())
            );
            if (srv) {
              this.recordForm.ServicesJSON.push({
                id: srv.ID,
                name: srv.Name,
                price: Number(srv.Price) || 0,
                isCustom: false
              });
            } else {
              this.recordForm.ServicesJSON.push({
                id: "custom_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
                name: p,
                price: 0,
                isCustom: true
              });
            }
          });
          this.calcTotal();
        }
        
        // Suggested Date + Time
        const sugDate = application['Предполагаемая дата записи'] || "";
        const sugTime = application['Предполагаемое время записи'] || "";
        if (sugDate) {
          let datePart = "";
          if (sugDate.includes(".")) {
            let dParts = sugDate.split(".");
            if (dParts.length === 3) {
              datePart = `${dParts[2]}-${dParts[1].padStart(2, "0")}-${dParts[0].padStart(2, "0")}`;
            }
          } else {
            datePart = sugDate;
          }
          
          let timePart = "12:00";
          if (sugTime) {
            let tParts = sugTime.split(":");
            if (tParts.length >= 2) {
              timePart = `${tParts[0].padStart(2, "0")}:${tParts[1].padStart(2, "0")}`;
            }
          }
          if (datePart) {
            this.recordForm.StartTime_LOCAL = `${datePart}T${timePart}`;
          }
        }
        
        if (application['Краткое описание проблемы или комментарий (по желанию)']) {
          this.recordForm.Comment = application['Краткое описание проблемы или комментарий (по желанию)'];
        }
        
        if (this.user) {
          this.recordForm.MasterID = this.user.ID;
        }
      } else {
        this.applicationRef = null;
        if (record) {
          this.isEditingRecord = false;
          this.recordForm = JSON.parse(JSON.stringify(record));
          this.recordForm.ServicesJSON = this.recordForm.ServicesJSON || [];

          if (
            this.recordForm.ServicesJSON.length > 0 &&
            typeof this.recordForm.ServicesJSON[0] === "string"
          ) {
            this.recordForm.ServicesJSON = this.recordForm.ServicesJSON.map(
              (sid) => {
                let rs = this.store.db.services.find((s) => s.ID === sid);
                return {
                  id: sid,
                  name: rs ? rs.Name : "Услуга",
                  price: rs ? Number(rs.Price) || 0 : 0,
                  isCustom: false,
                };
              },
            );
          }

          this.recordForm.IsPaid =
            record.IsPaid === true ||
            String(record.IsPaid).toUpperCase() === "TRUE";
          if (this.recordForm.StartTime) {
            let d = new Date(this.recordForm.StartTime);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            this.recordForm.StartTime_LOCAL = d.toISOString().slice(0, 16);
          } else {
            this.recordForm.StartTime_LOCAL = this.emptyRecord().StartTime_LOCAL;
          }

          if (this.recordForm.CarNumber) {
            let parts = this.recordForm.CarNumber.split(" ");
            if (parts.length >= 3 && parts[1].toUpperCase() === "KG") {
              this.recordForm.CarRegion = parts[0];
              this.recordForm.CarCountry = parts[1];
              this.recordForm.CarNumberMain = parts.slice(2).join(" ");
            } else {
              this.recordForm.CarRegion = "";
              this.recordForm.CarCountry = "FOREIGN";
              this.recordForm.CarNumberMain = this.recordForm.CarNumber;
            }
          } else {
            this.recordForm.CarRegion = "";
            this.recordForm.CarCountry = "KG";
            this.recordForm.CarNumberMain = "";
          }
          
          let b = this.store.db.brands.find(x => x.ID == this.recordForm.BrandID);
          if (b) this.brandSearchInput = b.Name;
          let m = this.store.db.models.find(x => x.ID == this.recordForm.ModelID);
          if (m) this.modelSearchInput = m.Name;
        } else {
          this.isEditingRecord = true;
          this.recordForm = this.emptyRecord();
          if (this.user) {
            this.recordForm.MasterID = this.user.ID;
          }
        }
      }
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    getBrandName(id) {
      let b = this.store.db.brands.find((x) => x.ID == id);
      return b ? b.Name : "—";
    },
    getModelName(id) {
      let m = this.store.db.models.find((x) => x.ID == id);
      return m ? m.Name : "";
    },
    getMasterName(id) {
      let m = this.store.db.users.find((x) => x.ID == id);
      return m ? m.Name || m.Username : "Не назначен";
    },
    getServiceName(id) {
      let s = this.store.db.services.find((s) => s.ID === id);
      return s ? s.Name : "Н/Д";
    },
    getServicePrice(id) {
      let s = this.store.db.services.find((s) => s.ID === id);
      return s ? s.Price || 0 : 0;
    },
    getDuration(s, e) {
      return getDuration(s, e);
    },
    statusBadgeTw(st) {
      if (st === "Выполнен")
        return "bg-status-completed-bg text-status-completed-text border-status-completed-text/10";
      if (st === "Отменён")
        return "bg-status-canceled-bg text-status-canceled-text border-status-canceled-text/10";
      return "bg-status-open-bg text-status-open-text border-status-open-text/10";
    },
    statusBgTw(st) {
      if (st === "Выполнен")
        return "bg-status-completed-bg border-status-completed-text/20 text-status-completed-text";
      if (st === "Отменён")
        return "bg-status-canceled-bg border-status-canceled-text/20 text-status-canceled-text";
      return "bg-status-open-bg border-status-open-text/20 text-status-open-text";
    },
    onPhoneInput() {
      this.recordForm.Phone = formatPhoneInput(this.recordForm.Phone);
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
    setCarCountry(type) {
      this.recordForm.CarCountry = type;
      this.recordForm.CarRegion = "";
      this.recordForm.CarNumberMain = "";
      this.recordForm.CarNumber = "";
    },
    updateCarNumber(e) {
      if (this.recordForm.CarCountry === "KG") {
        if (
          this.recordForm.CarRegion &&
          this.recordForm.CarRegion.length === 2 &&
          e &&
          e.target === this.$refs.carRegionInput
        ) {
          if (this.$refs.carNumberMainInput)
            this.$refs.carNumberMainInput.focus();
        }
        let parts = [];
        if (this.recordForm.CarRegion)
          parts.push(this.recordForm.CarRegion.toUpperCase());
        parts.push("KG");
        if (this.recordForm.CarNumberMain)
          parts.push(this.recordForm.CarNumberMain.toUpperCase());
        this.recordForm.CarNumber = parts.join(" ");
      }
    },
    onModelSelect() {
      if (this.recordForm.ModelID) {
        this.showServiceSelector = true;
      }
    },
    onBrandFocus(event) {
      this.showBrandDropdown = true;
      if (event && event.target && typeof event.target.select === "function") {
        event.target.select();
      }
    },
    onModelFocus(event) {
      if (this.ignoreModelFocus) {
        return;
      }
      this.showModelDropdown = true;
      if (event && event.target && typeof event.target.select === "function") {
        event.target.select();
      }
    },
    hideBrandDropdown() {
      setTimeout(() => {
        this.showBrandDropdown = false;
      }, 200);
    },
    selectBrand(b) {
      if (this.recordForm.BrandID !== b.ID) {
        this.recordForm.BrandID = b.ID;
        this.recordForm.ModelID = "";
        this.modelSearchInput = "";
      }
      this.brandSearchInput = b.Name;
      this.showBrandDropdown = false;
      this.ignoreModelFocus = true;
      setTimeout(() => {
        this.ignoreModelFocus = false;
      }, 350);
    },
    hideModelDropdown() {
      setTimeout(() => {
        this.showModelDropdown = false;
      }, 200);
    },
    selectModel(m) {
      this.recordForm.ModelID = m.ID;
      this.modelSearchInput = m.Name;
      this.showModelDropdown = false;
      this.showServiceSelector = true;
    },
    hideServiceDropdown() {
      setTimeout(() => {
        this.showServiceSelector = false;
      }, 200);
    },
    isServiceSelected(id) {
      return this.recordForm.ServicesJSON.some((s) => s.id === id);
    },
    toggleService(sid) {
      if (sid === "custom_item_trigger") {
        this.addCustomServiceFromName();
        this.showServiceSelector = false;
        return;
      }
      let idx = this.recordForm.ServicesJSON.findIndex((s) => s.id === sid);
      if (idx > -1) {
        this.recordForm.ServicesJSON.splice(idx, 1);
      } else {
        let srv = this.store.db.services.find((s) => s.ID === sid);
        if (srv) {
          this.recordForm.ServicesJSON.push({
            id: sid,
            name: srv.Name,
            price: Number(srv.Price) || 0,
            isCustom: false,
          });
        }
      }
      this.calcTotal();
      this.showServiceSelector = false;
      this.serviceSearch = "";
    },
    removeService(idx) {
      this.recordForm.ServicesJSON.splice(idx, 1);
      this.calcTotal();
    },
    addCustomServiceFromName() {
      const txt = this.serviceSearch.trim();
      const finalName = (txt === "Прочий (вписать вручную)" || !txt) ? "Прочая услуга" : txt;
      this.recordForm.ServicesJSON.push({
        id: "custom_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: finalName,
        price: 0,
        isCustom: true,
      });
      this.serviceSearch = "";
      this.showServiceSelector = false;
      this.calcTotal();
    },
    calcTotal() {
      this.recordForm.TotalAmount = this.recordForm.ServicesJSON.reduce(
        (sum, s) => sum + (Number(s.price) || 0),
        0,
      );
    },
    async fillAndSave(payload) {
      const isNew = !payload.ID;
      if (isNew) {
        payload.ID = "local_" + Date.now();
        this.recordForm.ID = payload.ID;
        this.store.db.records.unshift(payload);
        this.store.dispatchSync("addRow", payload, "Records");
      } else {
        let idx = this.store.db.records.findIndex((x) => x.ID === payload.ID);
        if (idx > -1) this.store.db.records[idx] = payload;
        this.store.dispatchSync("updateRecord", payload);
      }

      if (this.applicationRef) {
        const appTimestamp = this.applicationRef["Отметка времени"];

        // Optimistic local state update for applications
        if (this.store.db.applications) {
          const idx = this.store.db.applications.findIndex((a) => a["Отметка времени"] === appTimestamp);
          if (idx > -1) {
            this.store.db.applications[idx]["Статус Заявки"] = "Создана запись";
            this.store.db.applications[idx]["IDRecords"] = payload.ID;
          }
        }

        // Dispatch sync update to GAS on Заявки на Запись sheet
        const appPayload = {
          ID: appTimestamp,
          "Статус Заявки": "Создана запись",
          "IDRecords": payload.ID
        };
        await this.store.dispatchSync("updateRow", appPayload, "Заявки на Запись");
        this.applicationRef = null;
      }

      this.store.showToast("Запись успешно сохранена");
      this.hide();
    },
    async handleSave() {
      try {
        const f = this.recordForm;
        if (
          f.ID &&
          !String(f.ID).startsWith("local_") &&
          this.user &&
          this.user.Role === "Master"
        ) {
          let original = this.store.db.records.find((x) => x.ID === f.ID);
          if (original && original.Status !== "Открыт") {
            throw new Error(
              "Мастер не может изменять закрытые записи со статусом " +
                original.Status,
            );
          }
        }
        if (!f.ClientName) throw new Error("Пожалуйста, введите Имя Клиента");
        if (!f.Phone) throw new Error("Пожалуйста, введите Телефон");
        if (!f.CarNumber) throw new Error("Пожалуйста, введите Госномер");
        if (!f.BrandID) throw new Error("Пожалуйста, выберите Марку");
        if (!f.ModelID) throw new Error("Пожалуйста, выберите Модель");

        if (!f.ServicesJSON || f.ServicesJSON.length === 0) {
          throw new Error("Пожалуйста, добавьте хотя бы одну Услугу");
        }

        let payload = JSON.parse(JSON.stringify(this.recordForm));
        if (payload.StartTime_LOCAL) {
          payload.StartTime = new Date(payload.StartTime_LOCAL).toISOString();
        } else if (!payload.ID) {
          payload.StartTime = new Date().toISOString();
        }

        let original = payload.ID
          ? this.store.db.records.find((x) => x.ID === payload.ID)
          : null;
        if (payload.Status === "Выполнен") {
          if (
            !payload.EndTime ||
            (original && original.Status !== "Выполнен")
          ) {
            payload.EndTime = new Date().toISOString();
          }
        } else {
          payload.EndTime = "";
        }
        this.recordForm.EndTime = payload.EndTime;

        this.isSaving = true;
        await this.fillAndSave(payload);
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isSaving = false;
      }
    },
    async quickStatusChangeModal(newStatus) {
      this.recordForm.Status = newStatus;
      await this.handleSave();
    },
  },
};
</script>
