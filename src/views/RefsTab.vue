<template>
  <div class="space-y-4 max-w-3xl mx-auto w-full pb-20 select-none">
    <!-- Superadmin views -->
    <div v-if="isGlobalAdmin" class="fade-transition space-y-4">
      <!-- Admin Tab switcher -->
      <div class="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          v-for="(title, key) in adminTabs"
          :key="key"
          @click="activeAdminTab = key"
          class="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
          :class="activeAdminTab === key ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        >
          {{ title }}
        </button>
      </div>

      <!-- Categories Admin -->
      <div v-if="activeAdminTab === 'categories'" class="space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Категории услуг</h3>
          <button @click="openAddModal('categories')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>
        <div class="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse table-auto">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Название</th>
                <th class="px-4 py-2 w-14"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="cat in db.servicecategories" :key="cat.ID" class="hover:bg-slate-50">
                <td class="px-4 py-2 text-xs font-bold text-slate-800">{{ cat.Name }}</td>
                <td class="px-4 py-2 text-right shrink-0">
                  <button @click="deleteItem('ServiceCategories', cat.ID, 'servicecategories')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                    <i class="bi bi-trash-fill text-xs"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!db.servicecategories || db.servicecategories.length === 0">
                <td colspan="2" class="px-4 py-6 text-center text-slate-400 font-medium text-xs">Нет категорий</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Global Services Templates Admin -->
      <div v-if="activeAdminTab === 'globalservices'" class="space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Шаблоны услуг</h3>
          <button @click="openAddModal('globalservices')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>
        <div class="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse table-auto">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Категория</th>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Услуга</th>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Цена шаблона (сом)</th>
                <th class="px-4 py-2 w-14"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="gs in db.globalservices" :key="gs.ID" class="hover:bg-slate-50">
                <td class="px-4 py-2 text-xs font-semibold text-slate-500">{{ getCategoryName(gs.CategoryID) }}</td>
                <td class="px-4 py-2 text-xs font-bold text-slate-800">{{ gs.Name }}</td>
                <td class="px-4 py-2 text-xs font-bold text-slate-800">{{ Number(gs.DefaultPrice).toLocaleString() }} сом</td>
                <td class="px-4 py-2 text-right shrink-0">
                  <button @click="deleteItem('GlobalServices', gs.ID, 'globalservices')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                    <i class="bi bi-trash-fill text-xs"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!db.globalservices || db.globalservices.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-slate-400 font-medium text-xs">Нет шаблонов услуг</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Brands Admin -->
      <div v-if="activeAdminTab === 'brands'" class="space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Марки автомобилей</h3>
          <button @click="openAddModal('brands')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>
        <div class="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse table-auto">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Название марки</th>
                <th class="px-4 py-2 w-14"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in db.globalbrands" :key="b.ID" class="hover:bg-slate-50">
                <td class="px-4 py-2 text-xs font-bold text-slate-800">{{ b.Name }}</td>
                <td class="px-4 py-2 text-right shrink-0">
                  <button @click="deleteItem('Brands', b.ID, 'globalbrands')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                    <i class="bi bi-trash-fill text-xs"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!db.globalbrands || db.globalbrands.length === 0">
                <td colspan="2" class="px-4 py-6 text-center text-slate-400 font-medium text-xs">Нет марок</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Models Admin -->
      <div v-if="activeAdminTab === 'models'" class="space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Модели автомобилей</h3>
          <button @click="openAddModal('models')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>
        <div class="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse table-auto">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Марка</th>
                <th class="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Модель</th>
                <th class="px-4 py-2 w-14"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="m in db.globalmodels" :key="m.ID" class="hover:bg-slate-50">
                <td class="px-4 py-2 text-xs font-semibold text-slate-500">{{ getBrandName(m.BrandID) }}</td>
                <td class="px-4 py-2 text-xs font-bold text-slate-800">{{ m.Name }}</td>
                <td class="px-4 py-2 text-right shrink-0">
                  <button @click="deleteItem('Models', m.ID, 'globalmodels')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                    <i class="bi bi-trash-fill text-xs"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!db.globalmodels || db.globalmodels.length === 0">
                <td colspan="3" class="px-4 py-6 text-center text-slate-400 font-medium text-xs">Нет моделей</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Organization Scoped views -->
    <div v-else class="fade-transition space-y-4">
      <!-- Org Tab switcher -->
      <div class="flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          @click="activeOrgTab = 'services'"
          class="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
          :class="activeOrgTab === 'services' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        >
          Услуги (Прайс-лист)
        </button>
        <button
          @click="activeOrgTab = 'cars'"
          class="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
          :class="activeOrgTab === 'cars' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        >
          Обслуживаемые автомобили
        </button>
      </div>

      <!-- Services List & Import for Tenant -->
      <div v-if="activeOrgTab === 'services'" class="space-y-4">
        <div class="flex justify-between items-center px-1">
          <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Прайс-лист нашего СТО</div>
          
          <div class="flex gap-2 items-center">
            <button @click="expandAllCategories" class="h-6 px-2 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded-lg border-none hover:bg-indigo-100 transition cursor-pointer">
              Развернуть всё
            </button>
            <button @click="collapseAllCategories" class="h-6 px-2 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg border-none hover:bg-slate-200 transition cursor-pointer">
              Свернуть всё
            </button>
          </div>
        </div>

        <!-- Grouped services list with Accordion -->
        <div class="space-y-3">
          <div
            v-for="group in tenantGroupedServices"
            :key="group.category.ID"
            class="border border-slate-200/50 rounded-2xl bg-slate-50/50 overflow-hidden shadow-sm transition-all"
          >
            <!-- Category header (clickable) -->
            <div
              @click="toggleCategoryExpanded(group.category.ID)"
              class="bg-slate-100/70 px-4 py-2.5 flex justify-between items-center border-b border-slate-200/50 cursor-pointer hover:bg-slate-100 transition"
            >
              <span class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-indigo-500 transition-transform" :class="isCategoryExpanded(group.category.ID) ? 'rotate-90' : ''">
                  chevron_right
                </span>
                {{ group.category.Name }}
              </span>
              <span class="text-[9px] text-indigo-600 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-150/30">
                {{ group.services.length }} усл.
              </span>
            </div>
            
            <!-- Category Services list -->
            <div v-if="isCategoryExpanded(group.category.ID)" class="divide-y divide-slate-100 bg-white animate-fade-in">
              <div
                v-for="s in group.services"
                :key="s.ID"
                class="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50/60 transition group"
              >
                <div class="space-y-0.5">
                  <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {{ s.Name }}
                    <span v-if="s.IsCustom" class="text-[8px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.25 rounded-md uppercase font-black tracking-wider">Кастомная</span>
                    <span v-else class="text-[8px] bg-slate-50 text-slate-500 border border-slate-200 px-1.5 py-0.25 rounded-md uppercase font-black tracking-wider">Шаблон</span>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-xs font-black text-slate-800">{{ Number(s.Price).toLocaleString() }} сом</div>
                  <div class="flex items-center gap-1.5">
                    <button @click="editServicePrice(s)" class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                      <i class="bi bi-pencil-fill text-[10px]"></i>
                    </button>
                    <button @click="deleteItem('Services', s.ID, 'services')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                      <i class="bi bi-trash-fill text-[10px]"></i>
                    </button>
                  </div>
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
      <div v-if="activeOrgTab === 'cars'" class="space-y-4">
        <!-- Controls bar -->
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div class="flex flex-col sm:flex-row justify-between gap-3">
            <div class="flex flex-wrap gap-2 items-center">
              <button @click="expandAllBrands" class="h-8 px-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl border-none hover:bg-indigo-100 transition cursor-pointer">
                Развернуть все марки
              </button>
              <button @click="collapseAllBrands" class="h-8 px-3 bg-slate-100 text-slate-650 text-xs font-bold rounded-xl border-none hover:bg-slate-200 transition cursor-pointer">
                Свернуть все
              </button>
              <button @click="selectAllBrands" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-xl border-none hover:bg-indigo-700 transition cursor-pointer">
                Выбрать все авто
              </button>
              <button @click="clearAllBrands" class="h-8 px-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border-none hover:bg-red-100 transition cursor-pointer">
                Сбросить всё
              </button>
            </div>
            <div class="flex items-center gap-3">
              <!-- Filter Active Cars Only -->
              <label class="flex items-center gap-2 cursor-pointer text-xs font-black text-slate-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  v-model="onlyOurCars"
                  class="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                Только наши авто
              </label>
            </div>
          </div>

          <!-- Search filter for car models/brands -->
          <div class="relative w-full">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <span class="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              v-model="carSearchQuery"
              class="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500"
              placeholder="Поиск по маркам и моделям..."
            />
          </div>
        </div>

        <!-- Dynamic Brand and Model Trees -->
        <div class="space-y-3">
          <div
            v-for="b in filteredGlobalBrands"
            :key="b.ID"
            class="border border-slate-200/60 bg-white rounded-2xl overflow-hidden shadow-sm transition"
          >
            <!-- Brand header -->
            <div
              class="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition cursor-pointer"
              @click="toggleBrandExpanded(b.ID)"
            >
              <div class="flex items-center gap-3.5" @click.stop>
                <!-- Toggle arrow -->
                <span class="material-symbols-outlined text-[18px] text-slate-400 transition-transform cursor-pointer" @click="toggleBrandExpanded(b.ID)">
                  {{ isBrandExpanded(b.ID) ? 'expand_more' : 'chevron_right' }}
                </span>
                
                <!-- Brand Checkbox -->
                <input
                  type="checkbox"
                  :checked="isOrgBrandActive(b.ID)"
                  @change="toggleOrgBrandWithModels(b.ID)"
                  class="w-4 h-4 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                />
                
                <span class="text-xs font-black text-slate-850 uppercase tracking-wider">{{ b.Name }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" :class="isOrgBrandActive(b.ID) ? 'bg-indigo-50 text-indigo-600 border border-indigo-150/30' : 'bg-slate-100 text-slate-400'">
                  Выбрано моделей: {{ countActiveBrandModels(b.ID) }} / {{ brandModels(b.ID).length }}
                </span>
              </div>
            </div>

            <!-- Models list container (renders if expanded) -->
            <div v-if="isBrandExpanded(b.ID)" class="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 animate-fade-in">
              <!-- Select/deselect all for this brand -->
              <div class="flex gap-2.5 mb-3">
                <button @click="selectAllBrandModels(b.ID)" class="h-6 px-2.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-lg border-none hover:bg-indigo-100 transition cursor-pointer">
                  Выбрать все модели марки
                </button>
                <button @click="clearAllBrandModels(b.ID)" class="h-6 px-2.5 bg-red-50 text-red-650 text-[9px] font-black uppercase rounded-lg border-none hover:bg-red-100 transition cursor-pointer">
                  Снять все модели
                </button>
              </div>

              <!-- Models grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div
                  v-for="m in filteredBrandModels(b.ID)"
                  :key="m.ID"
                  @click="toggleOrgModel(m.ID)"
                  class="border border-slate-200 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition"
                  :class="isOrgModelActive(m.ID) ? 'bg-indigo-50/40 border-indigo-450' : 'bg-white'"
                >
                  <span class="text-xs font-semibold" :class="isOrgModelActive(m.ID) ? 'text-indigo-700' : 'text-slate-700'">{{ m.Name }}</span>
                  <input
                    type="checkbox"
                    :checked="isOrgModelActive(m.ID)"
                    @click.stop="toggleOrgModel(m.ID)"
                    class="w-3.5 h-3.5 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div v-if="brandModels(b.ID).length === 0" class="col-span-3 py-4 text-center text-slate-400 font-bold text-xs italic">
                  Нет моделей
                </div>
              </div>
            </div>
          </div>
          <div v-if="filteredGlobalBrands.length === 0" class="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs px-6">
            По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или фильтр «Только наши авто».
          </div>
        </div>
      </div>
    </div>

    <!-- Template Import Services Modal (Tenant) -->
    <div v-if="showImportServicesModal" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-fade-in">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 class="text-sm font-black text-slate-800 m-0 uppercase tracking-wider">Шаблоны услуг</h3>
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Выберите готовые услуги для прайс-листа</div>
          </div>
          <button @click="showImportServicesModal = false" class="p-1 text-slate-400 hover:text-slate-600 rounded-full border-none bg-transparent cursor-pointer flex items-center">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Action bar to import all services -->
        <div class="px-6 py-2.5 bg-indigo-50 border-b border-indigo-100/50 flex justify-between items-center">
          <span class="text-[10px] text-indigo-700 font-black uppercase tracking-wider">Быстрый импорт</span>
          <button @click="importAllAvailableServices" class="h-7 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg border-none cursor-pointer transition flex items-center gap-1 shadow-md shadow-indigo-150">
            <span class="material-symbols-outlined text-[12px]">done_all</span> Импортировать все доступные услуги
          </button>
        </div>
        
        <!-- List of unimported templates -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div v-for="cat in db.servicecategories" :key="cat.ID" class="space-y-2">
            <div class="flex justify-between items-center pb-1">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0">{{ cat.Name }}</h4>
              <button
                v-if="unimportedGlobalServices(cat.ID).length > 0"
                @click="importAllCategoryServices(cat.ID)"
                class="text-[9px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-none px-2 py-0.5 rounded font-black uppercase tracking-wider cursor-pointer"
              >
                Добавить всю категорию
              </button>
            </div>
            <div class="space-y-1.5">
              <div
                v-for="gs in unimportedGlobalServices(cat.ID)"
                :key="gs.ID"
                class="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3"
              >
                <div class="text-xs font-bold text-slate-800 max-w-[65%] leading-snug">{{ gs.Name }}</div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-8 w-24 shadow-sm">
                    <input
                      type="number"
                      v-model.number="templatePrices[gs.ID]"
                      class="w-full px-2 text-center text-xs font-black text-slate-850 border-none outline-none"
                      placeholder="Цена"
                    />
                  </div>
                  <button @click="importService(gs)" class="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer transition">
                    Добавить
                  </button>
                </div>
              </div>
              <div v-if="unimportedGlobalServices(cat.ID).length === 0" class="text-[10px] text-slate-400 font-semibold italic pl-1 pb-1">Все шаблоны добавлены</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Price Modal (Tenant) -->
    <div v-if="editingService" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-fade-in p-6 space-y-4">
        <h3 class="text-sm font-black text-slate-850 m-0 uppercase tracking-wider">Редактировать цену</h3>
        <div class="space-y-1">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Услуга</div>
          <div class="text-xs font-bold text-slate-700">{{ editingService.Name }}</div>
        </div>
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Новая цена (KGS)</label>
          <input
            type="number"
            v-model.number="newPriceValue"
            class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 focus:border-indigo-500"
          />
        </div>
        <div class="flex gap-2 pt-2">
          <button @click="editingService = null" class="flex-1 h-11 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
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
          <button @click="showCustomServiceModal = false" class="flex-1 h-11 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
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
      const activeBrandIds = (this.db.organizationbrands || [])
        .filter(ob => String(ob.OrganizationID) === String(this.store.user.OrganizationID))
        .map(ob => ob.BrandID);
      return (this.db.globalbrands || []).filter(b => activeBrandIds.includes(b.ID));
    },
    tenantGroupedServices() {
      const categories = this.db.servicecategories || [];
      const services = this.db.services || [];
      
      return categories.map(cat => {
        return {
          category: cat,
          services: services.filter(s => s.CategoryID === cat.ID)
        };
      }).filter(group => group.services.length > 0);
    },
    filteredGlobalBrands() {
      let list = this.db.globalbrands || [];
      
      // Filter by 'Only our cars'
      if (this.onlyOurCars) {
        const activeBrandIds = (this.db.organizationbrands || [])
          .filter(ob => String(ob.OrganizationID) === String(this.store.user.OrganizationID))
          .map(ob => ob.BrandID);
        list = list.filter(b => activeBrandIds.includes(b.ID));
      }
      
      // Filter by search query
      if (this.carSearchQuery) {
        const q = this.carSearchQuery.toLowerCase().trim();
        list = list.filter(b => {
          const brandMatch = String(b.Name || "").toLowerCase().includes(q);
          const modelsMatch = this.brandModels(b.ID).some(m => String(m.Name || "").toLowerCase().includes(q));
          return brandMatch || modelsMatch;
        });
      }
      
      return list;
    }
  },
  data() {
    return {
      activeAdminTab: 'categories',
      activeOrgTab: 'services',
      showImportServicesModal: false,
      showCustomServiceModal: false,
      showFABMenu: false,
      selectedConfigBrandId: '',
      editingService: null,
      newPriceValue: 0,
      templatePrices: {},
      adminTabs: {
        categories: 'Категории',
        globalservices: 'Шаблоны услуг',
        brands: 'Марки',
        models: 'Модели'
      },
      customServiceForm: {
        CategoryID: '',
        Name: '',
        Price: 0
      },
      // Accordion states
      expandedCategories: [],
      expandedBrands: [],
      onlyOurCars: false,
      carSearchQuery: ''
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
    },
    // Auto-expand brands matching search query
    carSearchQuery(newQuery) {
      if (newQuery) {
        const q = newQuery.toLowerCase().trim();
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
      }
    },
    db: {
      immediate: true,
      handler(newDb) {
        // Expand all categories by default when db loads
        if (newDb && newDb.servicecategories && this.expandedCategories.length === 0) {
          this.expandedCategories = newDb.servicecategories.map(c => c.ID);
        }
      }
    }
  },
  methods: {
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
    countActiveBrandModels(brandId) {
      const activeModelIds = (this.db.organizationmodels || [])
        .filter(om => String(om.OrganizationID) === String(this.store.user.OrganizationID))
        .map(om => om.ModelID);
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
      const price = this.templatePrices[gs.ID] !== undefined ? this.templatePrices[gs.ID] : gs.DefaultPrice;
      const payload = {
        ID: generateUUID(),
        Name: gs.Name,
        Price: price,
        CategoryID: gs.CategoryID,
        GlobalServiceID: gs.ID,
        IsCustom: false,
        OrganizationID: this.store.user.OrganizationID
      };
      this.store.dispatchSync('addRow', payload, 'Services');
      this.store.showToast(`Услуга "${gs.Name}" успешно добавлена`);
    },
    importAllCategoryServices(catId) {
      const unimported = this.unimportedGlobalServices(catId);
      if (unimported.length === 0) return;

      const orgId = this.store.user.OrganizationID;
      const objects = unimported.map(gs => ({
        ID: generateUUID(),
        Name: gs.Name,
        Price: this.templatePrices[gs.ID] !== undefined ? this.templatePrices[gs.ID] : gs.DefaultPrice,
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
            Price: this.templatePrices[gs.ID] !== undefined ? this.templatePrices[gs.ID] : gs.DefaultPrice,
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
    editServicePrice(service) {
      this.editingService = service;
      this.newPriceValue = service.Price;
    },
    saveNewPrice() {
      if (this.editingService) {
        const payload = {
          ...this.editingService,
          Price: this.newPriceValue
        };
        this.store.dispatchSync('updateRow', payload, 'Services');
        this.store.showToast(`Цена обновлена`);
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

    // Org Cars Configuration
    isOrgBrandActive(brandId) {
      return (this.db.organizationbrands || []).some(
        ob => String(ob.OrganizationID) === String(this.store.user.OrganizationID) && String(ob.BrandID) === String(brandId)
      );
    },
    isOrgModelActive(modelId) {
      return (this.db.organizationmodels || []).some(
        om => String(om.OrganizationID) === String(this.store.user.OrganizationID) && String(om.ModelID) === String(modelId)
      );
    },
    toggleOrgBrandWithModels(brandId) {
      const orgId = this.store.user.OrganizationID;
      const active = this.isOrgBrandActive(brandId);
      
      if (active) {
        // Remove brand
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, BrandID: brandId }, 'OrganizationBrands');
        
        // Remove all models of this brand
        const modelsOfBrand = this.brandModels(brandId);
        modelsOfBrand.forEach(m => {
          if (this.isOrgModelActive(m.ID)) {
            this.store.dispatchSync('deleteRow', { OrganizationID: orgId, ModelID: m.ID }, 'OrganizationModels');
          }
        });
        this.store.showToast('Марка и связанные модели отключены');
      } else {
        // Add brand
        this.store.dispatchSync('addRow', { OrganizationID: orgId, BrandID: brandId }, 'OrganizationBrands');
        
        // Add all models of this brand automatically
        const modelsOfBrand = this.brandModels(brandId);
        const newModelObjs = modelsOfBrand.map(m => ({
          OrganizationID: orgId,
          ModelID: m.ID
        }));
        if (newModelObjs.length > 0) {
          this.store.dispatchSync('addRows', newModelObjs, 'OrganizationModels');
        }
        this.store.showToast('Марка и все её модели подключены');
      }
    },
    toggleOrgModel(modelId) {
      const orgId = this.store.user.OrganizationID;
      const active = this.isOrgModelActive(modelId);
      
      // Find what brand this model belongs to
      const modelObj = (this.db.globalmodels || []).find(m => m.ID === modelId);
      if (!modelObj) return;
      const brandId = modelObj.BrandID;
      
      if (active) {
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, ModelID: modelId }, 'OrganizationModels');
      } else {
        // If brand is not active yet, activate it automatically!
        if (!this.isOrgBrandActive(brandId)) {
          this.store.dispatchSync('addRow', { OrganizationID: orgId, BrandID: brandId }, 'OrganizationBrands');
        }
        this.store.dispatchSync('addRow', { OrganizationID: orgId, ModelID: modelId }, 'OrganizationModels');
      }
    },
    brandModels(brandId) {
      return (this.db.globalmodels || []).filter(m => String(m.BrandID) === String(brandId));
    },
    filteredBrandModels(brandId) {
      const list = this.brandModels(brandId);
      if (this.carSearchQuery) {
        const q = this.carSearchQuery.toLowerCase().trim();
        return list.filter(m => String(m.Name || "").toLowerCase().includes(q));
      }
      return list;
    },
    selectAllBrands() {
      const orgId = this.store.user.OrganizationID;
      const unselectedBrands = (this.db.globalbrands || []).filter(b => !this.isOrgBrandActive(b.ID));
      if (unselectedBrands.length === 0) return this.store.showToast('Все марки уже выбраны');

      // Select all brands
      const brandObjs = unselectedBrands.map(b => ({
        OrganizationID: orgId,
        BrandID: b.ID
      }));
      this.store.dispatchSync('addRows', brandObjs, 'OrganizationBrands');

      // Select all models
      const modelObjs = [];
      (this.db.globalbrands || []).forEach(b => {
        const modelsOfBrand = this.brandModels(b.ID);
        modelsOfBrand.forEach(m => {
          if (!this.isOrgModelActive(m.ID)) {
            modelObjs.push({
              OrganizationID: orgId,
              ModelID: m.ID
            });
          }
        });
      });
      if (modelObjs.length > 0) {
        this.store.dispatchSync('addRows', modelObjs, 'OrganizationModels');
      }

      this.store.showToast('Подключены все марки и модели авто');
    },
    clearAllBrands() {
      if (confirm('Сбросить выбор всех марок и моделей? Ваши мастера не смогут выбрать автомобили, пока вы не отметите их заново.')) {
        const orgId = this.store.user.OrganizationID;
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId }, 'OrganizationBrands');
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId }, 'OrganizationModels');
        this.selectedConfigBrandId = '';
        this.store.showToast('Выбор сброшен');
      }
    },
    selectAllBrandModels(brandId) {
      const orgId = this.store.user.OrganizationID;
      const models = this.brandModels(brandId);
      const unselected = models.filter(m => !this.isOrgModelActive(m.ID));
      if (unselected.length === 0) return this.store.showToast('Все модели этой марки уже выбраны');

      // Ensure brand is active
      if (!this.isOrgBrandActive(brandId)) {
        this.store.dispatchSync('addRow', { OrganizationID: orgId, BrandID: brandId }, 'OrganizationBrands');
      }

      const objects = unselected.map(m => ({
        OrganizationID: orgId,
        ModelID: m.ID
      }));
      this.store.dispatchSync('addRows', objects, 'OrganizationModels');
      this.store.showToast(`Подключено моделей: ${objects.length}`);
    },
    clearAllBrandModels(brandId) {
      const orgId = this.store.user.OrganizationID;
      const models = this.brandModels(brandId);
      const activeModels = (this.db.organizationmodels || []).filter(
        om => String(om.OrganizationID) === String(orgId) && models.some(m => String(m.ID) === String(om.ModelID))
      );
      if (activeModels.length === 0) return;

      activeModels.forEach(om => {
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, ModelID: om.ModelID }, 'OrganizationModels');
      });
      this.store.showToast('Модели марки отключены');
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
