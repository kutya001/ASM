<template>
  <div class="space-y-5 max-w-7xl mx-auto w-full pb-24 select-none px-1 sm:px-3">
    <!-- Superadmin views -->
    <div v-if="isGlobalAdmin" class="fade-transition space-y-4">
      <!-- Admin Top Bar: Tabs & Quick Action buttons -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <!-- Admin Tab switcher -->
        <div class="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
          <button
            v-for="(title, key) in adminTabs"
            :key="key"
            @click="switchAdminTab(key)"
            class="px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            :class="activeAdminTab === key ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
          >
            <span class="material-symbols-outlined text-[16px]">{{ getAdminTabIcon(key) }}</span>
            {{ title }}
          </button>
        </div>

        <!-- Right Side: CSV / AI Import Button -->
        <div class="flex items-center gap-2 justify-end">
          <button
            @click="$emit('open-bulk-modal')"
            class="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none transition shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Загрузка данных через CSV, вставку или AI-промпт"
          >
            <span class="material-symbols-outlined text-[17px]">file_upload</span>
            <span>Импорт CSV / AI</span>
          </button>
        </div>
      </div>

      <!-- TAB 1: BRANDS (Split View: Brands List on left, Selected Brand Models on right) -->
      <div v-if="activeAdminTab === 'brands'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <!-- Left Column: Brands List (40% width on desktop) -->
          <div
            class="md:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            :class="{ 'hidden md:flex': showMobileDetailView }"
          >
            <!-- Card Header -->
            <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 text-[18px]">workspace_premium</span>
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Марки авто ({{ filteredAdminBrands.length }})
                </span>
              </div>
              <button
                @click="openAddModal('brands')"
                class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-150 transition cursor-pointer flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[14px]">add</span> Модалка
              </button>
            </div>

            <!-- Quick Inline Add Brand -->
            <div class="p-3 bg-slate-50/50 border-b border-slate-100 flex gap-2">
              <input
                v-model="newInlineBrandName"
                @keyup.enter="addInlineBrand"
                type="text"
                placeholder="Новая марка (напр., Audi)..."
                class="flex-1 px-3 py-1.5 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                @click="addInlineBrand"
                :disabled="!newInlineBrandName.trim()"
                class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span class="material-symbols-outlined text-[14px]">add</span>
                Создать
              </button>
            </div>

            <!-- Brands List -->
            <div class="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
              <div
                v-for="b in filteredAdminBrands"
                :key="b.ID"
                @click="selectAdminBrand(b.ID)"
                class="px-4 py-3 flex items-center justify-between transition cursor-pointer group"
                :class="selectedAdminBrandId === b.ID ? 'bg-indigo-50/80 font-bold border-l-4 border-indigo-600 text-indigo-950 shadow-inner' : 'hover:bg-slate-50/70 text-slate-800'"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span class="material-symbols-outlined text-[16px]" :class="selectedAdminBrandId === b.ID ? 'text-indigo-600' : 'text-slate-400'">
                    directions_car
                  </span>
                  <span class="text-xs truncate">{{ b.Name }}</span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span
                    class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border transition"
                    :class="selectedAdminBrandId === b.ID ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-200'"
                  >
                    {{ countBrandModels(b.ID) }} мод.
                  </span>
                  <button
                    @click.stop="openEditRefModal('brands', b)"
                    title="Редактировать марку"
                    class="w-7 h-7 rounded-lg bg-transparent hover:bg-slate-200/70 text-slate-400 hover:text-indigo-600 border-none flex items-center justify-center cursor-pointer transition"
                  >
                    <span class="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                  <button
                    @click.stop="deleteItem('Brands', b.ID, 'globalbrands')"
                    title="Удалить марку"
                    class="w-7 h-7 rounded-lg bg-transparent hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-none flex items-center justify-center cursor-pointer transition"
                  >
                    <span class="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
              <div v-if="filteredAdminBrands.length === 0" class="px-4 py-12 text-center text-slate-400 font-bold text-xs">
                Марки не найдены
              </div>
            </div>
          </div>

          <!-- Right Column: Detail View for Selected Brand Models (60% width on desktop) -->
          <div
            class="md:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            :class="{ 'hidden md:flex': !showMobileDetailView }"
          >
            <!-- Detail Header -->
            <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button
                  @click="showMobileDetailView = false"
                  class="md:hidden w-7 h-7 rounded-lg bg-slate-200 text-slate-700 border-none flex items-center justify-center cursor-pointer mr-1"
                  title="Назад к маркам"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Модели марки: <span class="text-indigo-600">{{ selectedAdminBrand ? selectedAdminBrand.Name : '—' }}</span>
                </span>
                <span v-if="selectedAdminBrand" class="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {{ selectedBrandModels.length }} мод.
                </span>
              </div>

              <div class="flex items-center gap-1.5" v-if="selectedAdminBrand">
                <button
                  @click="openEditRefModal('brands', selectedAdminBrand)"
                  class="px-2.5 py-1 text-slate-600 hover:text-indigo-600 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[13px]">edit</span> Марка
                </button>
              </div>
            </div>

            <!-- Detail Content -->
            <div v-if="selectedAdminBrand" class="p-4 space-y-4">
              <!-- Quick Inline Add Model -->
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-indigo-600">add_circle</span>
                  Быстрое добавление модели в {{ selectedAdminBrand.Name }}
                </div>
                <div class="flex gap-2">
                  <input
                    v-model="newInlineModelName"
                    @keyup.enter="addInlineModel"
                    type="text"
                    :placeholder="'Название модели (напр., ' + (selectedAdminBrand.Name === 'Audi' ? 'A6, Q7, e-tron' : 'Camry, X5, Civic') + ')...'"
                    class="flex-1 px-3.5 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                  />
                  <button
                    @click="addInlineModel"
                    :disabled="!newInlineModelName.trim()"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
                  >
                    <span class="material-symbols-outlined text-[15px]">add</span>
                    Добавить
                  </button>
                </div>
              </div>

              <!-- Models Table -->
              <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div class="overflow-x-auto max-h-[500px]">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 bg-slate-100 z-10">
                      <tr>
                        <th class="p-3 w-12 text-center">#</th>
                        <th class="p-3">Модель</th>
                        <th class="p-3 w-28 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-800">
                      <tr
                        v-for="(m, idx) in selectedBrandModels"
                        :key="m.ID"
                        class="hover:bg-slate-50/70 transition"
                      >
                        <td class="p-3 text-center text-slate-400 font-bold text-[11px]">{{ idx + 1 }}</td>
                        <td class="p-3 font-bold text-slate-850">{{ m.Name }}</td>
                        <td class="p-3 text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <button
                              @click="openEditRefModal('models', m)"
                              title="Редактировать модель"
                              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border-none flex items-center justify-center cursor-pointer transition"
                            >
                              <span class="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              @click="deleteItem('Models', m.ID, 'globalmodels')"
                              title="Удалить модель"
                              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-none flex items-center justify-center cursor-pointer transition"
                            >
                              <span class="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="selectedBrandModels.length === 0">
                        <td colspan="3" class="p-8 text-center text-slate-400 font-semibold italic">
                          У марки {{ selectedAdminBrand.Name }} пока нет моделей. Введите название выше и нажмите «Добавить».
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Empty Selection State -->
            <div v-else class="p-12 text-center text-slate-400 font-bold text-xs space-y-2">
              <span class="material-symbols-outlined text-4xl text-slate-300">touch_app</span>
              <div>Выберите марку слева для просмотра и добавления моделей</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: CATEGORIES (Split View: Categories List on left, Category Services on right) -->
      <div v-if="activeAdminTab === 'categories'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <!-- Left Column: Categories List (40% width on desktop) -->
          <div
            class="md:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            :class="{ 'hidden md:flex': showMobileDetailView }"
          >
            <!-- Card Header -->
            <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 text-[18px]">category</span>
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Категории услуг ({{ filteredAdminCategories.length }})
                </span>
              </div>
              <button
                @click="openAddModal('categories')"
                class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-150 transition cursor-pointer flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[14px]">add</span> Модалка
              </button>
            </div>

            <!-- Quick Inline Add Category -->
            <div class="p-3 bg-slate-50/50 border-b border-slate-100 flex gap-2">
              <input
                v-model="newInlineCategoryName"
                @keyup.enter="addInlineCategory"
                type="text"
                placeholder="Новая категория (напр., Детейлинг)..."
                class="flex-1 px-3 py-1.5 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                @click="addInlineCategory"
                :disabled="!newInlineCategoryName.trim()"
                class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
              >
                <span class="material-symbols-outlined text-[14px]">add</span>
                Создать
              </button>
            </div>

            <!-- Categories List -->
            <div class="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
              <div
                v-for="cat in filteredAdminCategories"
                :key="cat.ID"
                @click="selectAdminCategory(cat.ID)"
                class="px-4 py-3 flex items-center justify-between transition cursor-pointer group"
                :class="selectedAdminCategoryId === cat.ID ? 'bg-indigo-50/80 font-bold border-l-4 border-indigo-600 text-indigo-950 shadow-inner' : 'hover:bg-slate-50/70 text-slate-800'"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span class="material-symbols-outlined text-[16px]" :class="selectedAdminCategoryId === cat.ID ? 'text-indigo-600' : 'text-slate-400'">
                    folder
                  </span>
                  <span class="text-xs truncate">{{ cat.Name }}</span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span
                    class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border transition"
                    :class="selectedAdminCategoryId === cat.ID ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-600 border-slate-200'"
                  >
                    {{ countCategoryServices(cat.ID) }} усл.
                  </span>
                  <button
                    @click.stop="openEditRefModal('categories', cat)"
                    title="Редактировать категорию"
                    class="w-7 h-7 rounded-lg bg-transparent hover:bg-slate-200/70 text-slate-400 hover:text-indigo-600 border-none flex items-center justify-center cursor-pointer transition"
                  >
                    <span class="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                  <button
                    @click.stop="deleteItem('ServiceCategories', cat.ID, 'servicecategories')"
                    title="Удалить категорию"
                    class="w-7 h-7 rounded-lg bg-transparent hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-none flex items-center justify-center cursor-pointer transition"
                  >
                    <span class="material-symbols-outlined text-[15px]">delete</span>
                  </button>
                </div>
              </div>
              <div v-if="filteredAdminCategories.length === 0" class="px-4 py-12 text-center text-slate-400 font-bold text-xs">
                Категории не найдены
              </div>
            </div>
          </div>

          <!-- Right Column: Detail View for Selected Category Services (60% width on desktop) -->
          <div
            class="md:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col"
            :class="{ 'hidden md:flex': !showMobileDetailView }"
          >
            <!-- Detail Header -->
            <div class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <button
                  @click="showMobileDetailView = false"
                  class="md:hidden w-7 h-7 rounded-lg bg-slate-200 text-slate-700 border-none flex items-center justify-center cursor-pointer mr-1"
                  title="Назад к категориям"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                </button>
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Услуги категории: <span class="text-indigo-600">{{ selectedAdminCategory ? selectedAdminCategory.Name : '—' }}</span>
                </span>
                <span v-if="selectedAdminCategory" class="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {{ selectedCategoryServices.length }} усл.
                </span>
              </div>

              <div class="flex items-center gap-1.5" v-if="selectedAdminCategory">
                <button
                  @click="openEditRefModal('categories', selectedAdminCategory)"
                  class="px-2.5 py-1 text-slate-600 hover:text-indigo-600 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[13px]">edit</span> Категория
                </button>
              </div>
            </div>

            <!-- Detail Content -->
            <div v-if="selectedAdminCategory" class="p-4 space-y-4">
              <!-- Quick Inline Add Service -->
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px] text-indigo-600">add_circle</span>
                  Быстрое добавление услуги в категорию «{{ selectedAdminCategory.Name }}»
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div class="sm:col-span-8">
                    <input
                      v-model="newInlineServiceName"
                      @keyup.enter="addInlineService"
                      type="text"
                      placeholder="Название услуги (напр., Замена масла в ДВС)..."
                      class="w-full px-3.5 py-2 bg-white border border-slate-250 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <div class="sm:col-span-4 flex gap-2">
                    <input
                      v-model="newInlineServicePrice"
                      @keyup.enter="addInlineService"
                      type="number"
                      placeholder="Цена (сом)"
                      class="w-24 px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                    />
                    <button
                      @click="addInlineService"
                      :disabled="!newInlineServiceName.trim()"
                      class="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 shrink-0"
                    >
                      <span class="material-symbols-outlined text-[15px]">add</span>
                      Добавить
                    </button>
                  </div>
                </div>
              </div>

              <!-- Services Table -->
              <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div class="overflow-x-auto max-h-[500px]">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 bg-slate-100 z-10">
                      <tr>
                        <th class="p-3 w-12 text-center">#</th>
                        <th class="p-3">Наименование услуги</th>
                        <th class="p-3 w-32 text-right">Базовая цена</th>
                        <th class="p-3 w-28 text-right">Действия</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-800">
                      <tr
                        v-for="(s, idx) in selectedCategoryServices"
                        :key="s.ID"
                        class="hover:bg-slate-50/70 transition"
                      >
                        <td class="p-3 text-center text-slate-400 font-bold text-[11px]">{{ idx + 1 }}</td>
                        <td class="p-3 font-bold text-slate-800">{{ s.Name }}</td>
                        <td class="p-3 text-right font-black text-slate-900">{{ Number(s.DefaultPrice || 0).toLocaleString() }} сом</td>
                        <td class="p-3 text-right">
                          <div class="flex items-center justify-end gap-1.5">
                            <button
                              @click="openEditRefModal('globalservices', s)"
                              title="Редактировать услугу"
                              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border-none flex items-center justify-center cursor-pointer transition"
                            >
                              <span class="material-symbols-outlined text-[15px]">edit</span>
                            </button>
                            <button
                              @click="deleteItem('GlobalServices', s.ID, 'globalservices')"
                              title="Удалить услугу"
                              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-none flex items-center justify-center cursor-pointer transition"
                            >
                              <span class="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="selectedCategoryServices.length === 0">
                        <td colspan="4" class="p-8 text-center text-slate-400 font-semibold italic">
                          В категории «{{ selectedAdminCategory.Name }}» пока нет услуг. Введите название и цену выше и нажмите «Добавить».
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Empty Selection State -->
            <div v-else class="p-12 text-center text-slate-400 font-bold text-xs space-y-2">
              <span class="material-symbols-outlined text-4xl text-slate-300">touch_app</span>
              <div>Выберите категорию слева для просмотра и добавления услуг</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: MODELS ADMIN (Convenient Table View with Brand filter & Brand+Model search) -->
      <div v-if="activeAdminTab === 'models'" class="space-y-3">
        <!-- Control Bar -->
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- Brand filter dropdown -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Марка:</span>
              <select
                v-model="adminModelsBrandFilter"
                class="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">Все марки ({{ (db.globalmodels || []).length }})</option>
                <option v-for="b in (db.globalbrands || [])" :key="b.ID" :value="b.ID">
                  {{ b.Name }}
                </option>
              </select>
            </div>

            <!-- View mode switch -->
            <div class="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
              <button
                @click="adminModelsViewMode = 'table'"
                class="px-2.5 py-1 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1"
                :class="adminModelsViewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500'"
                title="Табличный вид"
              >
                <span class="material-symbols-outlined text-[15px]">table_chart</span> Таблица
              </button>
              <button
                @click="adminModelsViewMode = 'cards'"
                class="px-2.5 py-1 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1"
                :class="adminModelsViewMode === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500'"
                title="По маркам"
              >
                <span class="material-symbols-outlined text-[15px]">grid_view</span> По маркам
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500">Найдено: <b>{{ filteredAdminModelsList.length }}</b></span>
            <button
              @click="openAddModal('models')"
              class="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition flex items-center gap-1 shadow-sm"
            >
              <span class="material-symbols-outlined text-[15px]">add</span> Добавить модель
            </button>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="adminModelsViewMode === 'table'" class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto max-h-[620px]">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                <tr>
                  <th class="p-3 w-12 text-center">#</th>
                  <th class="p-3 w-48">Марка</th>
                  <th class="p-3">Модель</th>
                  <th class="p-3 w-28 text-right">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-800">
                <tr
                  v-for="(m, idx) in filteredAdminModelsList"
                  :key="m.ID"
                  class="hover:bg-slate-50/70 transition"
                >
                  <td class="p-3 text-center text-slate-400 font-bold text-[11px]">{{ idx + 1 }}</td>
                  <td class="p-3">
                    <span class="px-2.5 py-1 bg-slate-100 text-slate-750 font-bold rounded-lg border border-slate-200/80 text-[11px]">
                      {{ m.brandName }}
                    </span>
                  </td>
                  <td class="p-3 font-bold text-slate-850">{{ m.Name }}</td>
                  <td class="p-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        @click="openEditRefModal('models', m)"
                        title="Редактировать модель"
                        class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border-none flex items-center justify-center cursor-pointer transition"
                      >
                        <span class="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        @click="deleteItem('Models', m.ID, 'globalmodels')"
                        title="Удалить модель"
                        class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-none flex items-center justify-center cursor-pointer transition"
                      >
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredAdminModelsList.length === 0">
                  <td colspan="4" class="p-12 text-center text-slate-400 font-bold text-xs">
                    Модели не найдены. Попробуйте изменить поисковый запрос или фильтр марки.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CARDS VIEW (Grouped by Brand) -->
        <div v-else class="space-y-3">
          <div class="flex justify-between items-center px-1">
            <div class="flex gap-1.5 items-center">
              <button @click="expandAllBrands" title="Развернуть все марки" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-655 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
                <span class="material-symbols-outlined text-[18px]">unfold_more</span>
              </button>
              <button @click="collapseAllBrands" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
                <span class="material-symbols-outlined text-[18px]">unfold_less</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            <div
              v-for="group in adminGroupedModels"
              :key="group.brand.ID"
              class="border border-slate-250/60 bg-white rounded-2xl overflow-hidden shadow-sm transition"
            >
              <div
                class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition cursor-pointer"
                @click="toggleBrandExpanded(group.brand.ID)"
              >
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-slate-450 transition-transform" :class="isBrandExpanded(group.brand.ID) ? 'rotate-90' : ''">
                    chevron_right
                  </span>
                  <span class="text-xs font-black text-slate-850 uppercase tracking-wider">{{ group.brand.Name }}</span>
                </div>
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-150/30 px-2 py-0.5 rounded-full">
                  {{ group.models.length }} мод.
                </span>
              </div>

              <div v-if="isBrandExpanded(group.brand.ID)" class="divide-y divide-slate-100 bg-white animate-fade-in">
                <div
                  v-for="m in group.models"
                  :key="m.ID"
                  @click="openEditRefModal('models', m)"
                  class="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50/60 transition group cursor-pointer"
                >
                  <span class="text-xs font-bold text-slate-800">{{ m.Name }}</span>
                  <span class="material-symbols-outlined text-slate-300 group-hover:text-indigo-600 text-[16px] transition">edit</span>
                </div>
                <div v-if="group.models.length === 0" class="px-4 py-4 text-center text-slate-400 font-bold text-xs italic">
                  Нет моделей у этой марки
                </div>
              </div>
            </div>
            <div v-if="adminGroupedModels.length === 0" class="col-span-full bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs px-6">
              По вашему запросу ничего не найдено.
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: GLOBAL SERVICES ADMIN (Convenient Table View with Category filter & Cat+Service search) -->
      <div v-if="activeAdminTab === 'globalservices'" class="space-y-3">
        <!-- Control Bar -->
        <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- Category filter dropdown -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Категория:</span>
              <select
                v-model="adminServicesCategoryFilter"
                class="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="">Все категории ({{ (db.globalservices || []).length }})</option>
                <option v-for="c in (db.servicecategories || [])" :key="c.ID" :value="c.ID">
                  {{ c.Name }}
                </option>
              </select>
            </div>

            <!-- View mode switch -->
            <div class="flex bg-slate-100 p-0.5 rounded-xl gap-0.5">
              <button
                @click="adminServicesViewMode = 'table'"
                class="px-2.5 py-1 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1"
                :class="adminServicesViewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500'"
                title="Табличный вид"
              >
                <span class="material-symbols-outlined text-[15px]">table_chart</span> Таблица
              </button>
              <button
                @click="adminServicesViewMode = 'grouped'"
                class="px-2.5 py-1 text-xs font-bold rounded-lg border-none cursor-pointer transition flex items-center gap-1"
                :class="adminServicesViewMode === 'grouped' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500'"
                title="По категориям"
              >
                <span class="material-symbols-outlined text-[15px]">view_agenda</span> По категориям
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500">Найдено: <b>{{ filteredAdminGlobalServicesList.length }}</b></span>
            <button
              @click="openAddModal('globalservices')"
              class="h-8 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer transition flex items-center gap-1 shadow-sm"
            >
              <span class="material-symbols-outlined text-[15px]">add</span> Добавить услугу
            </button>
          </div>
        </div>

        <!-- TABLE VIEW -->
        <div v-if="adminServicesViewMode === 'table'" class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto max-h-[620px]">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                <tr>
                  <th class="p-3 w-12 text-center">#</th>
                  <th class="p-3 w-56">Категория</th>
                  <th class="p-3">Наименование услуги</th>
                  <th class="p-3 w-32 text-right">Базовая цена</th>
                  <th class="p-3 w-28 text-right">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-800">
                <tr
                  v-for="(s, idx) in filteredAdminGlobalServicesList"
                  :key="s.ID"
                  class="hover:bg-slate-50/70 transition"
                >
                  <td class="p-3 text-center text-slate-400 font-bold text-[11px]">{{ idx + 1 }}</td>
                  <td class="p-3">
                    <span class="px-2.5 py-1 bg-slate-100 text-slate-750 font-bold rounded-lg border border-slate-200/80 text-[11px]">
                      {{ s.categoryName }}
                    </span>
                  </td>
                  <td class="p-3 font-bold text-slate-850">{{ s.Name }}</td>
                  <td class="p-3 text-right font-black text-slate-900">{{ Number(s.DefaultPrice || 0).toLocaleString() }} сом</td>
                  <td class="p-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        @click="openEditRefModal('globalservices', s)"
                        title="Редактировать услугу"
                        class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border-none flex items-center justify-center cursor-pointer transition"
                      >
                        <span class="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        @click="deleteItem('GlobalServices', s.ID, 'globalservices')"
                        title="Удалить услугу"
                        class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-none flex items-center justify-center cursor-pointer transition"
                      >
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredAdminGlobalServicesList.length === 0">
                  <td colspan="5" class="p-12 text-center text-slate-400 font-bold text-xs">
                    Услуги не найдены. Попробуйте изменить поисковый запрос или фильтр категории.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ACCORDION GROUPED VIEW -->
        <div v-else class="space-y-3">
          <div class="flex justify-between items-center px-1">
            <div class="flex gap-1.5 items-center">
              <button @click="expandAllCategories" title="Развернуть все категории" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-650 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
                <span class="material-symbols-outlined text-[18px]">unfold_more</span>
              </button>
              <button @click="collapseAllCategories" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
                <span class="material-symbols-outlined text-[18px]">unfold_less</span>
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div
              v-for="group in adminGroupedGlobalServices"
              :key="group.category.ID"
              class="border border-slate-250/60 rounded-2xl bg-white overflow-hidden shadow-sm transition-all"
            >
              <div
                @click="toggleCategoryExpanded(group.category.ID)"
                class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
              >
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] text-slate-450 transition-transform" :class="isCategoryExpanded(group.category.ID) ? 'rotate-90' : ''">
                    chevron_right
                  </span>
                  {{ group.category.Name }}
                </span>
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-full border border-indigo-150/30">
                  {{ group.services.length }} усл.
                </span>
              </div>
              
              <div v-if="isCategoryExpanded(group.category.ID)" class="divide-y divide-slate-100 bg-white animate-fade-in">
                <div
                  v-for="s in group.services"
                  :key="s.ID"
                  @click="openEditRefModal('globalservices', s)"
                  class="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50/60 transition group cursor-pointer"
                >
                  <div class="text-xs font-bold text-slate-800">{{ s.Name }}</div>
                  <div class="text-xs font-black text-slate-850">{{ Number(s.DefaultPrice).toLocaleString() }} сом</div>
                </div>
                <div v-if="group.services.length === 0" class="px-4 py-4 text-center text-slate-400 font-bold text-xs italic">
                  Нет услуг в этой категории
                </div>
              </div>
            </div>
            <div v-if="adminGroupedGlobalServices.length === 0" class="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs px-6">
              По вашему запросу ничего не найдено.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Organization Scoped views -->
    <div v-else class="fade-transition space-y-4">
      <!-- Org Tab switcher -->
      <div class="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          @click="activeOrgTab = 'services'"
          class="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeOrgTab === 'services' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        >
          <span class="material-symbols-outlined text-[15px]">build</span>
          Услуги
        </button>
        <button
          @click="activeOrgTab = 'cars'"
          class="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeOrgTab === 'cars' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        >
          <span class="material-symbols-outlined text-[15px]">directions_car</span>
          Автомобили
        </button>
      </div>

      <!-- Services List & Import for Tenant -->
      <div v-if="activeOrgTab === 'services'" class="space-y-4">
        <!-- Control bar with icons -->
        <div class="flex justify-between items-center px-1">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Прайс-лист нашего СТО</div>
          
          <div class="flex gap-1.5 items-center">
            <!-- Icon for Expand All -->
            <button @click="expandAllCategories" title="Развернуть все категории" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-650 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_more</span>
            </button>
            <!-- Icon for Collapse All -->
            <button @click="collapseAllCategories" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_less</span>
            </button>
          </div>
        </div>

        <!-- Grouped services list with Accordion -->
        <div class="space-y-3">
          <div
            v-for="group in tenantGroupedServices"
            :key="group.category.ID"
            class="border border-slate-250/60 rounded-2xl bg-white overflow-hidden shadow-sm transition-all"
          >
            <!-- Category header (clickable with light gray background) -->
            <div
              @click="toggleCategoryExpanded(group.category.ID)"
              class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
            >
              <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-slate-450 transition-transform" :class="isCategoryExpanded(group.category.ID) ? 'rotate-90' : ''">
                  chevron_right
                </span>
                {{ group.category.Name }}
              </span>
              
              <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-full border border-indigo-150/30">
                {{ group.services.length }} усл.
              </span>
            </div>
            
            <!-- Category Services list -->
            <div v-if="isCategoryExpanded(group.category.ID)" class="divide-y divide-slate-100 bg-white animate-fade-in">
              <!-- Desktop Table Header (hidden md:grid) -->
              <div class="hidden md:grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50/60 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 select-none">
                <div class="col-span-8">Наименование услуги</div>
                <div class="col-span-2">Тип</div>
                <div class="col-span-2 text-right">Цена</div>
              </div>
              <div
                v-for="s in group.services"
                :key="s.ID"
                @click="openServiceDetail(s)"
                class="px-4 py-2.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 transition group text-xs cursor-pointer"
              >
                <!-- Name Column (col-span-7) -->
                <div class="col-span-7 sm:col-span-8 font-semibold text-slate-800 truncate" :title="s.Name">
                  {{ s.Name }}
                </div>
                <!-- Type Column (col-span-3) -->
                <div class="col-span-3 sm:col-span-2 flex justify-start">
                  <span v-if="s.IsCustom" class="text-[8px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md uppercase font-black tracking-wider whitespace-nowrap">Кастомная</span>
                  <span v-else class="text-[8px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md uppercase font-black tracking-wider whitespace-nowrap">Шаблон</span>
                </div>
                <!-- Price Column (col-span-2) -->
                <div class="col-span-2 sm:col-span-2 text-right font-black text-slate-850">
                  {{ Number(s.Price).toLocaleString() }} сом
                </div>
              </div>
            </div>
          </div>
          <div v-if="tenantGroupedServices.length === 0" class="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs px-6">
             Ваш прайс-лист пока пуст. Нажмите круглую кнопку «плюс» внизу экрана, чтобы импортировать готовые шаблоны услуг или добавить свои.
          </div>
        </div>
      </div>

      <!-- Cars Configuration for Tenant (Accordion List) -->
      <div v-if="activeOrgTab === 'cars'" class="space-y-4 animate-fade-in">
        <!-- Controls bar with icons - All on a single horizontal row -->
        <div class="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm flex items-center justify-between gap-3 text-xs font-bold">
          <!-- Left side: Toggle "Мои" -->
          <label class="flex items-center gap-1.5 cursor-pointer text-[10px] font-black text-slate-555 uppercase tracking-wider m-0">
            <input
              type="checkbox"
              v-model="onlyOurCars"
              class="w-4 h-4 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
            />
            Мои
          </label>

          <!-- Right side: Icon Controls + Save button -->
          <div class="flex items-center gap-2" v-if="store.user.Role !== 'Master'">
            <!-- Icon Expand All -->
            <button @click="expandAllBrands" title="Развернуть все марки" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-655 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_more</span>
            </button>
            <!-- Icon Collapse All -->
            <button @click="collapseAllBrands" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_less</span>
            </button>
            <!-- Icon Select All -->
            <button @click="selectAllBrands" title="Выбрать все автомобили" class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-655 border-none flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition">
              <span class="material-symbols-outlined text-[18px]">done_all</span>
            </button>
            <!-- Icon Reset All -->
            <button @click="clearAllBrands" title="Сбросить всё" class="w-8 h-8 rounded-xl bg-red-50 text-red-655 border-none flex items-center justify-center cursor-pointer hover:bg-red-100 transition">
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>

            <!-- Save Changes Button (Active only when there are changes) -->
            <button
              @click="saveCarChanges"
              :disabled="!hasCarChanges"
              title="Сохранить изменения"
              class="w-8 h-8 rounded-xl transition border-none flex items-center justify-center shadow"
              :class="hasCarChanges ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-100/50' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'"
            >
              <span class="material-symbols-outlined text-[16px]">save</span>
            </button>
          </div>
          <!-- Masters search note -->
          <div class="flex items-center gap-1.5 text-[10px] text-slate-455 uppercase font-black tracking-wider" v-else>
            <span class="material-symbols-outlined text-[14px]">search</span> Поиск автомобилей
          </div>
        </div>

        <!-- Dynamic Brand and Model Trees -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          <div
            v-for="b in filteredGlobalBrands"
            :key="b.ID"
            class="border border-slate-250/60 bg-white rounded-2xl overflow-hidden shadow-sm transition"
          >
            <!-- Brand header (Identical styling to price list category, light gray bg) -->
            <div
              class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition cursor-pointer"
              @click="toggleBrandExpanded(b.ID)"
            >
              <div class="flex items-center gap-3.5" @click.stop>
                <!-- Toggle arrow -->
                <span class="material-symbols-outlined text-[18px] text-slate-450 transition-transform cursor-pointer" :class="isBrandExpanded(b.ID) ? 'rotate-90' : ''" @click="toggleBrandExpanded(b.ID)">
                  chevron_right
                </span>
                
                <!-- Brand Checkbox (controls brand & all models) -->
                <input
                  type="checkbox"
                  :checked="isLocalBrandActive(b.ID)"
                  @change="toggleLocalBrandWithModels(b.ID)"
                  :disabled="store.user.Role === 'Master'"
                  class="w-4 h-4 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                />
                
                <span class="text-xs font-black text-slate-850 uppercase tracking-wider">{{ b.Name }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" :class="isLocalBrandActive(b.ID) ? 'bg-indigo-50 text-indigo-600 border border-indigo-150/30' : 'bg-slate-100 text-slate-400'">
                  {{ countLocalBrandModels(b.ID) }} / {{ brandModels(b.ID).length }}
                </span>
              </div>
            </div>

            <!-- Models list container (renders if expanded, white background) -->
            <div v-if="isBrandExpanded(b.ID)" class="px-4 py-3.5 bg-white animate-fade-in">
              <!-- Models grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div
                  v-for="m in filteredBrandModels(b.ID)"
                  :key="m.ID"
                  @click="toggleLocalModel(m.ID)"
                  class="border border-slate-200 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition animate-fade-in"
                  :class="isLocalModelActive(m.ID) ? 'bg-indigo-50/40 border-indigo-450' : 'bg-white'"
                >
                  <span class="text-xs font-semibold" :class="isLocalModelActive(m.ID) ? 'text-indigo-700' : 'text-slate-700'">{{ m.Name }}</span>
                  <input
                    type="checkbox"
                    :checked="isLocalModelActive(m.ID)"
                    @click.stop="toggleLocalModel(m.ID)"
                    :disabled="store.user.Role === 'Master'"
                    class="w-3.5 h-3.5 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div v-if="brandModels(b.ID).length === 0" class="col-span-3 py-4 text-center text-slate-400 font-bold text-xs italic">
                  Нет моделей
                </div>
              </div>
            </div>
          </div>
          <div v-if="filteredGlobalBrands.length === 0" class="col-span-full bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs px-6">
            По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или фильтр «Мои».
          </div>
        </div>
      </div>
    </div>

    <!-- Template Import Services Modal (Tenant) -->
    <div v-if="showImportServicesModal" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-fade-in">
        <div class="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 class="text-xs font-black text-slate-800 m-0 uppercase tracking-wider">Шаблоны услуг</h3>
            <div class="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Выберите услуги для прайс-листа</div>
          </div>
          <button @click="showImportServicesModal = false" class="p-1 text-slate-400 hover:text-slate-650 rounded-full border-none bg-transparent cursor-pointer flex items-center">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Action bar to import all services -->
        <div class="px-4 py-1.5 bg-indigo-50 border-b border-indigo-100/50 flex justify-between items-center">
          <span class="text-[9px] text-indigo-700 font-black uppercase tracking-wider">Быстрый импорт</span>
          <button @click="importAllAvailableServices" title="Импортировать все доступные шаблоны" class="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-[10px] rounded-lg border-none cursor-pointer transition flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[14px]">done_all</span> Все
          </button>
        </div>
        
        <!-- List of unimported templates -->
        <div class="px-4 py-3 overflow-y-auto flex-1 space-y-3">
          <div v-for="cat in db.servicecategories" :key="cat.ID" class="space-y-1">
            <div class="flex justify-between items-center">
              <h4 class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0">{{ cat.Name }}</h4>
              <button
                v-if="unimportedGlobalServices(cat.ID).length > 0"
                @click="importAllCategoryServices(cat.ID)"
                title="Добавить все в этой категории"
                class="text-[8px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-none px-2 py-0.5 rounded-md font-black uppercase tracking-wider cursor-pointer flex items-center gap-0.5"
              >
                <span class="material-symbols-outlined text-[11px]">done_all</span> Всё
              </button>
            </div>
            <div class="space-y-1">
              <div
                v-for="gs in unimportedGlobalServices(cat.ID)"
                :key="gs.ID"
                class="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between gap-2"
              >
                <div class="flex-1 min-w-0">
                  <div class="text-[11px] font-bold text-slate-800 leading-snug truncate">{{ gs.Name }}</div>
                  <div class="text-[9px] font-semibold text-slate-450">{{ Number(gs.DefaultPrice).toLocaleString() }} сом</div>
                </div>
                <button @click="importService(gs)" title="Добавить услугу" class="w-7 h-7 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg border-none cursor-pointer transition flex items-center justify-center">
                  <span class="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
              <div v-if="unimportedGlobalServices(cat.ID).length === 0" class="text-[9px] text-slate-400 font-semibold italic pl-1">Все добавлены ✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Price Modal (Tenant) -->
    <div v-if="editingService" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-fade-in p-6 space-y-4">
        <h3 class="text-sm font-black text-slate-850 m-0 uppercase tracking-wider">
          {{ editingService.ID ? (isPriceEditingMode ? "Изменить услугу" : "Просмотр услуги") : "Добавить услугу" }}
        </h3>
        
        <!-- Category selection dropdown (for custom services only) -->
        <div v-if="editingService.IsCustom" class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Категория</label>
          <select v-model="editingServiceCategory" :disabled="!isPriceEditingMode" class="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-705 cursor-pointer">
            <option v-for="cat in db.servicecategories" :key="cat.ID" :value="cat.ID">{{ cat.Name }}</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Название услуги</label>
          <input
            v-if="editingService.IsCustom"
            type="text"
            v-model="editingServiceName"
            :disabled="!isPriceEditingMode"
            class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 focus:border-indigo-500"
          />
          <div v-else class="text-xs font-bold text-slate-700 p-2 bg-slate-50 rounded-xl border border-slate-100">{{ editingService.Name }}</div>
        </div>

        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Цена (сом)</label>
          <input
            type="number"
            v-model.number="newPriceValue"
            :disabled="!isPriceEditingMode"
            class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 focus:border-indigo-500"
          />
        </div>

        <!-- View Mode Footer -->
        <div class="flex flex-wrap gap-2 justify-end pt-2" v-if="!isPriceEditingMode">
          <button v-if="store.user.Role !== 'Master'" @click="deleteEditingService" class="h-11 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs transition border-none cursor-pointer">
            Удалить
          </button>
          <button @click="editingService = null" class="h-11 px-4 border border-slate-200 text-slate-655 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
            Закрыть
          </button>
          <button v-if="store.user.Role !== 'Master'" @click="isPriceEditingMode = true" class="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer border-none shadow-md shadow-indigo-100">
            Изменить
          </button>
        </div>

        <!-- Edit Mode Footer -->
        <div class="flex gap-2 pt-2" v-else>
          <button @click="cancelPriceEdit" class="flex-1 h-11 border border-slate-200 text-slate-655 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
            Отмена
          </button>
          <button @click="saveNewPrice" class="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer border-none shadow-md shadow-indigo-100">
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Create Custom Service Modal (Tenant) -->
    <div v-if="showCustomServiceModal" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-fade-in p-6 space-y-4">
        <h3 class="text-sm font-black text-slate-850 m-0 uppercase tracking-wider">Новая кастомная услуга</h3>
        
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Категория</label>
          <select v-model="customServiceForm.CategoryID" class="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-700 cursor-pointer">
            <option value="" disabled>-- Выберите категорию --</option>
            <option v-for="cat in db.servicecategories" :key="cat.ID" :value="cat.ID">{{ cat.Name }}</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Название услуги</label>
          <input
            type="text"
            v-model="customServiceForm.Name"
            class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 focus:border-indigo-500"
            placeholder="Введите название"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Цена (KGS)</label>
          <input
            type="number"
            v-model.number="customServiceForm.Price"
            class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 focus:border-indigo-500"
            placeholder="Цена в сомах"
          />
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="showCustomServiceModal = false" class="flex-1 h-11 border border-slate-200 text-slate-655 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
            Отмена
          </button>
          <button @click="saveCustomService" class="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition cursor-pointer border-none shadow-md shadow-indigo-100">
            Создать
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Menu Overlay for Services (Mobile/Desktop FAB action) -->
    <div v-if="showFABMenu" class="fixed inset-0 z-35 bg-[#090D1A]/50 backdrop-blur-sm transition-all" @click="showFABMenu = false"></div>
    <div
      v-if="showFABMenu"
      class="fixed bottom-40 right-6 z-40 flex flex-col gap-3.5 items-end animate-fade-in"
    >
      <!-- Option 1: Template Import -->
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-black text-white bg-slate-800/90 px-3 py-1.5 rounded-xl uppercase tracking-wider shadow">Выбрать из шаблонов</span>
        <button
          @click="showImportServicesModal = true; showFABMenu = false"
          class="w-12 h-12 bg-white hover:bg-slate-50 text-indigo-600 rounded-full flex items-center justify-center shadow-xl border-none cursor-pointer"
        >
          <span class="material-symbols-outlined text-[22px]">import_contacts</span>
        </button>
      </div>

      <!-- Option 2: Custom Service -->
      <div class="flex items-center gap-3">
        <span class="text-[10px] font-black text-white bg-slate-800/90 px-3 py-1.5 rounded-xl uppercase tracking-wider shadow">Создать свою услугу</span>
        <button
          @click="openAddCustomServiceModal(); showFABMenu = false"
          class="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl border-none cursor-pointer"
        >
          <span class="material-symbols-outlined text-[22px]">add</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { generateUUID } from "../utils/helpers";

export default {
  name: 'RefsTab',
  props: {
    db: {
      type: Object,
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  computed: {
    store() {
      return useMainStore();
    },
    isGlobalAdmin() {
      return this.store.user && this.store.user.Role === 'Superadmin';
    },
    activeOrgBrands() {
      // Based on local draft selection
      return (this.db.globalbrands || []).filter(b => this.localOrgBrands.includes(b.ID));
    },
    tenantGroupedServices() {
      const categories = this.db.servicecategories || [];
      let services = this.db.services || [];
      
      // Filter services by global search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        services = services.filter(s => String(s.Name || "").toLowerCase().includes(q));
      }
      
      return categories.map(cat => {
        return {
          category: cat,
          services: services.filter(s => s.CategoryID === cat.ID)
        };
      }).filter(group => group.services.length > 0);
    },
    filteredGlobalBrands() {
      let list = this.db.globalbrands || [];
      
      // Filter by 'Мои' (draft)
      if (this.onlyOurCars) {
        list = list.filter(b => this.localOrgBrands.includes(b.ID));
      }
      
      // Filter by global search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(b => {
          const brandMatch = String(b.Name || "").toLowerCase().includes(q);
          const modelsMatch = this.brandModels(b.ID).some(m => String(m.Name || "").toLowerCase().includes(q));
          return brandMatch || modelsMatch;
        });
      }
      
      return list;
    },
    hasCarChanges() {
      const myOrgId = this.store.user.OrganizationID;
      
      // Initial lists from DB
      const dbBrands = (this.db.organizationbrands || [])
        .filter(ob => String(ob.OrganizationID) === String(myOrgId))
        .map(ob => ob.BrandID);
      const dbModels = (this.db.organizationmodels || [])
        .filter(om => String(om.OrganizationID) === String(myOrgId))
        .map(om => om.ModelID);
      
      if (this.localOrgBrands.length !== dbBrands.length) return true;
      if (this.localOrgModelIds.length !== dbModels.length) return true;
      
      const brandsDiff = this.localOrgBrands.some(id => !dbBrands.includes(id)) || dbBrands.some(id => !this.localOrgBrands.includes(id));
      if (brandsDiff) return true;
      
      const modelsDiff = this.localOrgModelIds.some(id => !dbModels.includes(id)) || dbModels.some(id => !this.localOrgModelIds.includes(id));
      return modelsDiff;
    },
    filteredAdminCategories() {
      let list = this.db.servicecategories || [];
      if (this.searchQuery && this.activeAdminTab === 'categories') {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(c => {
          const cMatch = String(c.Name || "").toLowerCase().includes(q);
          const sMatch = (this.db.globalservices || []).some(
            s => String(s.CategoryID) === String(c.ID) && String(s.Name || "").toLowerCase().includes(q)
          );
          return cMatch || sMatch;
        });
      }
      return list.slice().sort((a, b) => String(a.Name || "").localeCompare(String(b.Name || "")));
    },
    selectedAdminCategory() {
      const list = this.filteredAdminCategories;
      if (!list || list.length === 0) return null;
      if (this.selectedAdminCategoryId) {
        const found = list.find(c => String(c.ID) === String(this.selectedAdminCategoryId));
        if (found) return found;
      }
      return list[0];
    },
    selectedCategoryServices() {
      if (!this.selectedAdminCategory) return [];
      const catId = this.selectedAdminCategory.ID;
      let services = (this.db.globalservices || []).filter(s => String(s.CategoryID) === String(catId));
      if (this.searchQuery && this.activeAdminTab === 'categories') {
        const q = this.searchQuery.toLowerCase().trim();
        services = services.filter(s => String(s.Name || "").toLowerCase().includes(q));
      }
      return services.slice().sort((a, b) => String(a.Name || "").localeCompare(String(b.Name || "")));
    },
    filteredAdminBrands() {
      let list = this.db.globalbrands || [];
      if (this.searchQuery && this.activeAdminTab === 'brands') {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(b => {
          const bMatch = String(b.Name || "").toLowerCase().includes(q);
          const mMatch = (this.db.globalmodels || []).some(
            m => String(m.BrandID) === String(b.ID) && String(m.Name || "").toLowerCase().includes(q)
          );
          return bMatch || mMatch;
        });
      }
      return list.slice().sort((a, b) => String(a.Name || "").localeCompare(String(b.Name || "")));
    },
    selectedAdminBrand() {
      const list = this.filteredAdminBrands;
      if (!list || list.length === 0) return null;
      if (this.selectedAdminBrandId) {
        const found = list.find(b => String(b.ID) === String(this.selectedAdminBrandId));
        if (found) return found;
      }
      return list[0];
    },
    selectedBrandModels() {
      if (!this.selectedAdminBrand) return [];
      const brandId = this.selectedAdminBrand.ID;
      let models = (this.db.globalmodels || []).filter(m => String(m.BrandID) === String(brandId));
      if (this.searchQuery && this.activeAdminTab === 'brands') {
        const q = this.searchQuery.toLowerCase().trim();
        models = models.filter(m => String(m.Name || "").toLowerCase().includes(q));
      }
      return models.slice().sort((a, b) => String(a.Name || "").localeCompare(String(b.Name || "")));
    },
    filteredAdminModelsList() {
      const brands = this.db.globalbrands || this.db.brands || [];
      let models = this.db.globalmodels || this.db.models || [];
      
      const brandMap = {};
      brands.forEach(b => {
        brandMap[b.ID] = String(b.Name || '');
      });

      if (this.adminModelsBrandFilter) {
        models = models.filter(m => String(m.BrandID) === String(this.adminModelsBrandFilter));
      }

      if (this.searchQuery && this.activeAdminTab === 'models') {
        const q = this.searchQuery.toLowerCase().trim();
        models = models.filter(m => {
          const mName = String(m.Name || '').toLowerCase();
          const bName = (brandMap[m.BrandID] || '').toLowerCase();
          return mName.includes(q) || bName.includes(q);
        });
      }

      return models.map(m => ({
        ...m,
        brandName: brandMap[m.BrandID] || '—'
      })).sort((a, b) => {
        const brandCompare = a.brandName.localeCompare(b.brandName);
        if (brandCompare !== 0) return brandCompare;
        return String(a.Name || '').localeCompare(String(b.Name || ''));
      });
    },
    adminGroupedModels() {
      const brands = this.db.globalbrands || [];
      let models = this.db.globalmodels || [];
      
      const brandMap = {};
      brands.forEach(b => {
        brandMap[b.ID] = String(b.Name || '').toLowerCase();
      });

      if (this.searchQuery && this.activeAdminTab === 'models') {
        const q = this.searchQuery.toLowerCase().trim();
        models = models.filter(m => {
          const mName = String(m.Name || '').toLowerCase();
          const bName = brandMap[m.BrandID] || '';
          return mName.includes(q) || bName.includes(q);
        });
      }
      
      return brands.map(b => {
        return {
          brand: b,
          models: models.filter(m => m.BrandID === b.ID)
        };
      }).filter(group => {
        if (this.searchQuery && this.activeAdminTab === 'models') {
          return group.models.length > 0;
        }
        return true;
      });
    },
    filteredAdminGlobalServicesList() {
      const categories = this.db.servicecategories || [];
      let services = this.db.globalservices || [];
      
      const catMap = {};
      categories.forEach(c => {
        catMap[c.ID] = String(c.Name || '');
      });

      if (this.adminServicesCategoryFilter) {
        services = services.filter(s => String(s.CategoryID) === String(this.adminServicesCategoryFilter));
      }

      if (this.searchQuery && this.activeAdminTab === 'globalservices') {
        const q = this.searchQuery.toLowerCase().trim();
        services = services.filter(s => {
          const sName = String(s.Name || '').toLowerCase();
          const cName = (catMap[s.CategoryID] || '').toLowerCase();
          return sName.includes(q) || cName.includes(q);
        });
      }

      return services.map(s => ({
        ...s,
        categoryName: catMap[s.CategoryID] || 'Без категории'
      })).sort((a, b) => {
        const catCompare = a.categoryName.localeCompare(b.categoryName);
        if (catCompare !== 0) return catCompare;
        return String(a.Name || '').localeCompare(String(b.Name || ''));
      });
    },
    adminGroupedGlobalServices() {
      const categories = this.db.servicecategories || [];
      let services = this.db.globalservices || [];
      
      const catMap = {};
      categories.forEach(c => {
        catMap[c.ID] = String(c.Name || '').toLowerCase();
      });

      if (this.searchQuery && this.activeAdminTab === 'globalservices') {
        const q = this.searchQuery.toLowerCase().trim();
        services = services.filter(s => {
          const sName = String(s.Name || '').toLowerCase();
          const cName = catMap[s.CategoryID] || '';
          return sName.includes(q) || cName.includes(q);
        });
      }
      
      return categories.map(cat => {
        return {
          category: cat,
          services: services.filter(s => s.CategoryID === cat.ID)
        };
      }).filter(group => {
        if (this.searchQuery && this.activeAdminTab === 'globalservices') {
          return group.services.length > 0;
        }
        return true;
      });
    }
  },
  data() {
    return {
      activeAdminTab: 'brands',
      activeOrgTab: 'services',
      showImportServicesModal: false,
      showCustomServiceModal: false,
      showFABMenu: false,
      selectedConfigBrandId: '',
      editingService: null,
      newPriceValue: 0,
      editingServiceCategory: '',
      editingServiceName: '',
      isPriceEditingMode: false,
      templatePrices: {},
      adminTabs: {
        brands: 'Марки',
        categories: 'Категории',
        models: 'Модели',
        globalservices: 'Услуги',
      },
      // Admin Split View and Filters
      selectedAdminBrandId: '',
      selectedAdminCategoryId: '',
      showMobileDetailView: false,
      adminModelsViewMode: 'table',
      adminServicesViewMode: 'table',
      adminModelsBrandFilter: '',
      adminServicesCategoryFilter: '',
      newInlineBrandName: '',
      newInlineModelName: '',
      newInlineCategoryName: '',
      newInlineServiceName: '',
      newInlineServicePrice: 0,
      customServiceForm: {
        CategoryID: '',
        Name: '',
        Price: 0
      },
      // Accordion states
      expandedCategories: [],
      expandedBrands: [],
      onlyOurCars: false,
      
      // Local draft buffers for cars setup (enables "Save changes" button pattern)
      localOrgBrands: [],
      localOrgModelIds: []
    };
  },
  watch: {
    showImportServicesModal(val) {
      if (val) {
        (this.db.globalservices || []).forEach(gs => {
          if (!this.templatePrices[gs.ID]) {
            this.templatePrices[gs.ID] = gs.DefaultPrice;
          }
        });
      }
      this.$emit('import-modal-toggle', !!val);
    },
    // Auto-expand brands matching global search query
    searchQuery(newQuery) {
      if (newQuery) {
        const q = newQuery.toLowerCase().trim();
        
        // Auto-expand brands matching global search query
        const matchingBrandIds = (this.db.globalbrands || [])
          .filter(b => {
            const brandMatch = String(b.Name || "").toLowerCase().includes(q);
            const modelsMatch = this.brandModels(b.ID).some(m => String(m.Name || "").toLowerCase().includes(q));
            return brandMatch || modelsMatch;
          })
          .map(b => b.ID);
        
        matchingBrandIds.forEach(id => {
          if (!this.expandedBrands.includes(id)) {
            this.expandedBrands.push(id);
          }
        });
        
        // Auto-expand categories matching global search query
        const matchingCatIds = (this.db.servicecategories || [])
          .filter(cat => {
            const services = (this.db.services || []).filter(s => s.CategoryID === cat.ID);
            const globalServices = (this.db.globalservices || []).filter(s => s.CategoryID === cat.ID);
            
            const servicesMatch = services.some(s => String(s.Name || "").toLowerCase().includes(q));
            const globalServicesMatch = globalServices.some(s => String(s.Name || "").toLowerCase().includes(q));
            
            return servicesMatch || globalServicesMatch;
          })
          .map(c => c.ID);
        
        matchingCatIds.forEach(id => {
          if (!this.expandedCategories.includes(id)) {
            this.expandedCategories.push(id);
          }
        });
      }
    },
    db: {
      immediate: true,
      handler(newDb) {
        if (newDb) {
          if (newDb.servicecategories && this.expandedCategories.length === 0) {
            this.expandedCategories = newDb.servicecategories.map(c => c.ID);
          }
          // Synchronize local buffers with DB updates
          this.syncLocalCars();
        }
      }
    },
    activeAdminTab() {
      this.notifySubTabChanged();
    },
    activeOrgTab() {
      this.notifySubTabChanged();
    },
    isGlobalAdmin() {
      this.notifySubTabChanged();
    }
  },
  mounted() {
    this.notifySubTabChanged();
  },
  methods: {
    switchAdminTab(key) {
      this.activeAdminTab = key;
      this.showMobileDetailView = false;
    },
    selectAdminBrand(id) {
      this.selectedAdminBrandId = id;
      this.showMobileDetailView = true;
    },
    selectAdminCategory(id) {
      this.selectedAdminCategoryId = id;
      this.showMobileDetailView = true;
    },
    countBrandModels(brandId) {
      return (this.db.globalmodels || []).filter(m => String(m.BrandID) === String(brandId)).length;
    },
    countCategoryServices(catId) {
      return (this.db.globalservices || []).filter(s => String(s.CategoryID) === String(catId)).length;
    },
    async addInlineBrand() {
      const name = this.newInlineBrandName.trim();
      if (!name) return;

      const exists = (this.db.globalbrands || []).some(
        b => String(b.Name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        this.store.showToast(`Марка "${name}" уже существует`, "error");
        return;
      }

      const payload = {
        ID: generateUUID(),
        Name: name
      };

      await this.store.dispatchSync("addRow", payload, "Brands");
      this.store.showToast(`Марка "${name}" создана`);
      this.newInlineBrandName = "";
      this.selectedAdminBrandId = payload.ID;
      this.showMobileDetailView = true;
    },
    async addInlineModel() {
      const name = this.newInlineModelName.trim();
      if (!name || !this.selectedAdminBrand) return;
      const brand = this.selectedAdminBrand;

      const exists = (this.db.globalmodels || []).some(
        m => String(m.BrandID) === String(brand.ID) && String(m.Name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        this.store.showToast(`Модель "${name}" уже есть у марки ${brand.Name}`, "error");
        return;
      }

      const payload = {
        ID: generateUUID(),
        BrandID: brand.ID,
        Name: name
      };

      await this.store.dispatchSync("addRow", payload, "Models");
      this.store.showToast(`Модель "${name}" добавлена в марку ${brand.Name}`);
      this.newInlineModelName = "";
    },
    async addInlineCategory() {
      const name = this.newInlineCategoryName.trim();
      if (!name) return;

      const exists = (this.db.servicecategories || []).some(
        c => String(c.Name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        this.store.showToast(`Категория "${name}" уже существует`, "error");
        return;
      }

      const payload = {
        ID: generateUUID(),
        Name: name
      };

      await this.store.dispatchSync("addRow", payload, "ServiceCategories");
      this.store.showToast(`Категория "${name}" создана`);
      this.newInlineCategoryName = "";
      this.selectedAdminCategoryId = payload.ID;
      this.showMobileDetailView = true;
    },
    async addInlineService() {
      const name = this.newInlineServiceName.trim();
      if (!name || !this.selectedAdminCategory) return;
      const cat = this.selectedAdminCategory;
      const price = Number(this.newInlineServicePrice) || 0;

      const exists = (this.db.globalservices || []).some(
        s => String(s.CategoryID) === String(cat.ID) && String(s.Name || "").trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        this.store.showToast(`Услуга "${name}" уже есть в категории ${cat.Name}`, "error");
        return;
      }

      const payload = {
        ID: generateUUID(),
        CategoryID: cat.ID,
        Name: name,
        DefaultPrice: price
      };

      await this.store.dispatchSync("addRow", payload, "GlobalServices");
      this.store.showToast(`Услуга "${name}" добавлена в категорию ${cat.Name}`);
      this.newInlineServiceName = "";
      this.newInlineServicePrice = 0;
    },
    syncLocalCars() {
      const myOrgId = this.store.user && this.store.user.OrganizationID;
      if (!myOrgId) return;
      this.localOrgBrands = (this.db.organizationbrands || [])
        .filter(ob => String(ob.OrganizationID) === String(myOrgId))
        .map(ob => ob.BrandID);
      this.localOrgModelIds = (this.db.organizationmodels || [])
        .filter(om => String(om.OrganizationID) === String(myOrgId))
        .map(om => om.ModelID);
    },
    getBrandName(brandId) {
      const list = this.db.globalbrands || this.db.brands || [];
      const brand = list.find(b => String(b.ID) === String(brandId));
      return brand ? brand.Name : '—';
    },
    getCategoryName(catId) {
      const cat = this.db.servicecategories.find(c => c.ID === catId);
      return cat ? cat.Name : 'Без категории';
    },
    openAddModal(tabName) {
      this.$emit('open-ref-modal', tabName, -1);
    },
    deleteItem(sheetName, id, stateKey) {
      if (confirm('Вы уверены, что хотите удалить эту запись? Это действие может удалить связанные данные.')) {
        this.$emit('del-row', sheetName, id, stateKey);
      }
    },
    handleFABAction() {
      if (this.isGlobalAdmin) {
        this.openAddModal(this.activeAdminTab);
      } else {
        if (this.activeOrgTab === 'services') {
          this.showFABMenu = !this.showFABMenu;
        }
      }
    },
    getAdminTabIcon(key) {
      switch (key) {
        case 'categories': return 'category';
        case 'globalservices': return 'build';
        case 'brands': return 'workspace_premium';
        case 'models': return 'garage';
        default: return 'build';
      }
    },
    notifySubTabChanged() {
      let title = "";
      if (this.isGlobalAdmin) {
        title = this.adminTabs[this.activeAdminTab] || "";
      } else {
        title = this.activeOrgTab === 'services' ? 'Услуги' : 'Автомобили';
      }
      this.$emit('sub-tab-changed', title);
    },

    // Accordion categories helpers
    isCategoryExpanded(catId) {
      return this.expandedCategories.includes(catId);
    },
    toggleCategoryExpanded(catId) {
      const idx = this.expandedCategories.indexOf(catId);
      if (idx > -1) {
        this.expandedCategories.splice(idx, 1);
      } else {
        this.expandedCategories.push(catId);
      }
    },
    expandAllCategories() {
      this.expandedCategories = (this.db.servicecategories || []).map(c => c.ID);
    },
    collapseAllCategories() {
      this.expandedCategories = [];
    },

    // Accordion brands helpers
    isBrandExpanded(brandId) {
      return this.expandedBrands.includes(brandId);
    },
    toggleBrandExpanded(brandId) {
      const idx = this.expandedBrands.indexOf(brandId);
      if (idx > -1) {
        this.expandedBrands.splice(idx, 1);
      } else {
        this.expandedBrands.push(brandId);
      }
    },
    expandAllBrands() {
      this.expandedBrands = (this.db.globalbrands || []).map(b => b.ID);
    },
    collapseAllBrands() {
      this.expandedBrands = [];
    },
    countLocalBrandModels(brandId) {
      const activeModelIds = this.localOrgModelIds;
      return this.brandModels(brandId).filter(m => activeModelIds.includes(m.ID)).length;
    },

    // Org Services Template methods
    unimportedGlobalServices(catId) {
      const existingGlobalIds = (this.db.services || [])
        .filter(s => !s.IsCustom && s.GlobalServiceID)
        .map(s => s.GlobalServiceID);
      
      return (this.db.globalservices || [])
        .filter(gs => gs.CategoryID === catId && !existingGlobalIds.includes(gs.ID));
    },
    importService(gs) {
      const payload = {
        ID: generateUUID(),
        Name: gs.Name,
        Price: gs.DefaultPrice || 0,
        CategoryID: gs.CategoryID,
        GlobalServiceID: gs.ID,
        IsCustom: false,
        OrganizationID: this.store.user.OrganizationID
      };
      this.store.dispatchSync('addRow', payload, 'Services');
      this.store.showToast(`Услуга "${gs.Name}" добавлена`);
    },
    importAllCategoryServices(catId) {
      const unimported = this.unimportedGlobalServices(catId);
      if (unimported.length === 0) return;

      const orgId = this.store.user.OrganizationID;
      const objects = unimported.map(gs => ({
        ID: generateUUID(),
        Name: gs.Name,
        Price: gs.DefaultPrice || 0,
        CategoryID: gs.CategoryID,
        GlobalServiceID: gs.ID,
        IsCustom: false,
        OrganizationID: orgId
      }));

      this.store.dispatchSync('addRows', objects, 'Services');
      this.store.showToast(`Успешно добавлено услуг: ${objects.length}`);
    },
    importAllAvailableServices() {
      const orgId = this.store.user.OrganizationID;
      const objects = [];
      
      (this.db.servicecategories || []).forEach(cat => {
        const unimported = this.unimportedGlobalServices(cat.ID);
        unimported.forEach(gs => {
          objects.push({
            ID: generateUUID(),
            Name: gs.Name,
            Price: gs.DefaultPrice || 0,
            CategoryID: gs.CategoryID,
            GlobalServiceID: gs.ID,
            IsCustom: false,
            OrganizationID: orgId
          });
        });
      });

      if (objects.length === 0) {
        this.store.showToast('Все шаблоны уже импортированы');
        return;
      }

      this.store.dispatchSync('addRows', objects, 'Services');
      this.store.showToast(`Успешно импортировано услуг: ${objects.length}`);
      this.showImportServicesModal = false;
    },
    openEditRefModal(tab, item) {
      this.$emit('open-ref-modal', tab, item);
    },
    openServiceDetail(service) {
      this.editingService = Object.assign({}, service);
      this.newPriceValue = service.Price;
      this.editingServiceCategory = service.CategoryID || '';
      this.editingServiceName = service.Name || '';
      this.isPriceEditingMode = false;
    },
    cancelPriceEdit() {
      this.newPriceValue = this.editingService.Price;
      this.editingServiceCategory = this.editingService.CategoryID || '';
      this.editingServiceName = this.editingService.Name || '';
      this.isPriceEditingMode = false;
    },
    async deleteEditingService() {
      if (confirm("Вы действительно хотите удалить эту услугу?")) {
        try {
          const id = this.editingService.ID;
          this.store.db.services = this.store.db.services.filter((x) => x.ID !== id);
          await this.store.dispatchSync('deleteRow', id, 'Services');
          this.store.showToast("Услуга удалена");
          this.editingService = null;
        } catch (e) {
          this.store.showToast(e.message, 'error');
        }
      }
    },
    saveNewPrice() {
      if (this.editingService) {
        const payload = {
          ...this.editingService,
          Price: this.newPriceValue
        };
        if (this.editingService.IsCustom) {
          payload.CategoryID = this.editingServiceCategory;
          payload.Name = this.editingServiceName;
        }
        this.store.dispatchSync('updateRow', payload, 'Services');
        this.store.showToast(`Услуга обновлена`);
        this.editingService = null;
      }
    },
    openAddCustomServiceModal() {
      this.customServiceForm = { CategoryID: '', Name: '', Price: 0 };
      this.showCustomServiceModal = true;
    },
    saveCustomService() {
      const { CategoryID, Name, Price } = this.customServiceForm;
      if (!CategoryID) return this.store.showToast('Выберите категорию', 'error');
      if (!Name || !Name.trim()) return this.store.showToast('Укажите название услуги', 'error');
      
      const payload = {
        ID: generateUUID(),
        Name: Name.trim(),
        Price: Price || 0,
        CategoryID: CategoryID,
        IsCustom: true,
        OrganizationID: this.store.user.OrganizationID
      };
      
      this.store.dispatchSync('addRow', payload, 'Services');
      this.store.showToast(`Услуга "${Name}" успешно создана`);
      this.showCustomServiceModal = false;
    },

    // Local Cars Configuration Draft Methods (Instead of calling dispatchSync directly on click)
    isLocalBrandActive(brandId) {
      return this.localOrgBrands.includes(brandId);
    },
    isLocalModelActive(modelId) {
      return this.localOrgModelIds.includes(modelId);
    },
    toggleLocalBrandWithModels(brandId) {
      const active = this.isLocalBrandActive(brandId);
      const modelsOfBrand = this.brandModels(brandId).map(m => m.ID);
      
      if (active) {
        // Remove brand from local
        this.localOrgBrands = this.localOrgBrands.filter(id => id !== brandId);
        // Remove all models of this brand from local
        this.localOrgModelIds = this.localOrgModelIds.filter(id => !modelsOfBrand.includes(id));
      } else {
        // Add brand
        this.localOrgBrands.push(brandId);
        // Add all models
        modelsOfBrand.forEach(mid => {
          if (!this.localOrgModelIds.includes(mid)) {
            this.localOrgModelIds.push(mid);
          }
        });
      }
    },
    toggleLocalModel(modelId) {
      const active = this.isLocalModelActive(modelId);
      const modelObj = (this.db.globalmodels || []).find(m => m.ID === modelId);
      if (!modelObj) return;
      const brandId = modelObj.BrandID;
      
      if (active) {
        this.localOrgModelIds = this.localOrgModelIds.filter(id => id !== modelId);
      } else {
        this.localOrgModelIds.push(modelId);
        if (!this.localOrgBrands.includes(brandId)) {
          this.localOrgBrands.push(brandId);
        }
      }
    },
    brandModels(brandId) {
      return (this.db.globalmodels || []).filter(m => String(m.BrandID) === String(brandId));
    },
    filteredBrandModels(brandId) {
      const list = this.brandModels(brandId);
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase().trim();
        return list.filter(m => String(m.Name || "").toLowerCase().includes(q));
      }
      return list;
    },
    selectAllBrands() {
      // Add all global brands and models locally
      this.localOrgBrands = (this.db.globalbrands || []).map(b => b.ID);
      this.localOrgModelIds = (this.db.globalmodels || []).map(m => m.ID);
      this.store.showToast('Выбраны все доступные автомобили локально');
    },
    clearAllBrands() {
      this.localOrgBrands = [];
      this.localOrgModelIds = [];
      this.selectedConfigBrandId = '';
      this.store.showToast('Выбор очищен локально');
    },
    selectAllBrandModels(brandId) {
      if (!this.localOrgBrands.includes(brandId)) {
        this.localOrgBrands.push(brandId);
      }
      const models = this.brandModels(brandId);
      models.forEach(m => {
        if (!this.localOrgModelIds.includes(m.ID)) {
          this.localOrgModelIds.push(m.ID);
        }
      });
    },
    clearAllBrandModels(brandId) {
      const models = this.brandModels(brandId).map(m => m.ID);
      this.localOrgModelIds = this.localOrgModelIds.filter(id => !models.includes(id));
    },

    // SAVE ACTIONS (Saves local buffers to Supabase backend)
    async saveCarChanges() {
      const orgId = this.store.user.OrganizationID;
      
      // Get initial DB structures
      const dbBrands = (this.db.organizationbrands || [])
        .filter(ob => String(ob.OrganizationID) === String(orgId))
        .map(ob => ob.BrandID);
      const dbModels = (this.db.organizationmodels || [])
        .filter(om => String(om.OrganizationID) === String(orgId))
        .map(om => om.ModelID);
      
      // 1. Brands deletions & insertions
      const brandsToDelete = dbBrands.filter(id => !this.localOrgBrands.includes(id));
      const brandsToAdd = this.localOrgBrands.filter(id => !dbBrands.includes(id));
      
      // 2. Models deletions & insertions
      const modelsToDelete = dbModels.filter(id => !this.localOrgModelIds.includes(id));
      const modelsToAdd = this.localOrgModelIds.filter(id => !dbModels.includes(id));
      
      // Run dispatches
      // Insertions
      if (brandsToAdd.length > 0) {
        const brandRows = brandsToAdd.map(bid => ({ OrganizationID: orgId, BrandID: bid }));
        this.store.dispatchSync('addRows', brandRows, 'OrganizationBrands');
      }
      if (modelsToAdd.length > 0) {
        const modelRows = modelsToAdd.map(mid => ({ OrganizationID: orgId, ModelID: mid }));
        this.store.dispatchSync('addRows', modelRows, 'OrganizationModels');
      }
      
      // Deletions
      brandsToDelete.forEach(bid => {
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, BrandID: bid }, 'OrganizationBrands');
      });
      modelsToDelete.forEach(mid => {
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, ModelID: mid }, 'OrganizationModels');
      });
      
      this.store.showToast('Список обслуживаемых автомобилей успешно сохранен!');
    }
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
