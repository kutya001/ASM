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
          class="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5"
          :class="activeAdminTab === key ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
        >
          <span class="material-symbols-outlined text-[15px]">{{ getAdminTabIcon(key) }}</span>
          {{ title }}
        </button>
      </div>

      <!-- Categories Admin -->
      <div v-if="activeAdminTab === 'categories'" class="space-y-3">
        <div class="flex justify-end items-center">
          <button @click="openAddModal('categories')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>
        <div class="bg-white border border-slate-250/60 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
          <div v-for="cat in filteredAdminCategories" :key="cat.ID" class="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60 transition group">
            <span class="text-xs font-bold text-slate-800">{{ cat.Name }}</span>
            <button @click="deleteItem('ServiceCategories', cat.ID, 'servicecategories')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
              <i class="bi bi-trash-fill text-[11px]"></i>
            </button>
          </div>
          <div v-if="filteredAdminCategories.length === 0" class="px-4 py-6 text-center text-slate-400 font-bold text-xs">
            Нет категорий
          </div>
        </div>
      </div>

      <!-- Global Services Templates Admin -->
      <div v-if="activeAdminTab === 'globalservices'" class="space-y-3">
        <div class="flex justify-between items-center">
          <!-- Left side: Expand/collapse all -->
          <div class="flex gap-1.5 items-center">
            <button @click="expandAllCategories" title="Развернуть все категории" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-650 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_more</span>
            </button>
            <button @click="collapseAllCategories" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_less</span>
            </button>
          </div>
          <!-- Right side: Add button -->
          <button @click="openAddModal('globalservices')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>

        <!-- Grouped services list with Accordion -->
        <div class="space-y-3">
          <div
            v-for="group in adminGroupedGlobalServices"
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
              <div
                v-for="s in group.services"
                :key="s.ID"
                class="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50/60 transition group"
              >
                <div class="space-y-0.5">
                  <div class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {{ s.Name }}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-xs font-black text-slate-850">{{ Number(s.DefaultPrice).toLocaleString() }} сом</div>
                  <div class="flex items-center gap-1.5">
                    <button @click="deleteItem('GlobalServices', s.ID, 'globalservices')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                      <i class="bi bi-trash-fill text-[10px]"></i>
                    </button>
                  </div>
                </div>
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

      <!-- Brands Admin -->
      <div v-if="activeAdminTab === 'brands'" class="space-y-3">
        <div class="flex justify-end items-center">
          <button @click="openAddModal('brands')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>
        <div class="bg-white border border-slate-250/60 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
          <div v-for="b in filteredAdminBrands" :key="b.ID" class="px-4 py-3 flex justify-between items-center hover:bg-slate-50/60 transition group">
            <span class="text-xs font-bold text-slate-800">{{ b.Name }}</span>
            <button @click="deleteItem('Brands', b.ID, 'globalbrands')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
              <i class="bi bi-trash-fill text-[11px]"></i>
            </button>
          </div>
          <div v-if="filteredAdminBrands.length === 0" class="px-4 py-6 text-center text-slate-400 font-bold text-xs">
            Нет марок
          </div>
        </div>
      </div>

      <!-- Models Admin -->
      <div v-if="activeAdminTab === 'models'" class="space-y-3">
        <div class="flex justify-between items-center">
          <!-- Left side: Expand/collapse all -->
          <div class="flex gap-1.5 items-center">
            <button @click="expandAllBrands" title="Развернуть все марки" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-655 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_more</span>
            </button>
            <button @click="collapseAllBrands" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_less</span>
            </button>
          </div>
          <!-- Right side: Add button -->
          <button @click="openAddModal('models')" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-[14px]">add</span> Добавить
          </button>
        </div>

        <!-- Dynamic Brand and Model Trees -->
        <div class="space-y-3">
          <div
            v-for="group in adminGroupedModels"
            :key="group.brand.ID"
            class="border border-slate-250/60 bg-white rounded-2xl overflow-hidden shadow-sm transition"
          >
            <!-- Brand header (clickable with light gray bg) -->
            <div
              class="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition cursor-pointer"
              @click="toggleBrandExpanded(group.brand.ID)"
            >
              <div class="flex items-center gap-2">
                <!-- Toggle arrow -->
                <span class="material-symbols-outlined text-[18px] text-slate-450 transition-transform" :class="isBrandExpanded(group.brand.ID) ? 'rotate-90' : ''">
                  chevron_right
                </span>
                <span class="text-xs font-black text-slate-850 uppercase tracking-wider">{{ group.brand.Name }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-150/30 px-2 py-0.5 rounded-full">
                  {{ group.models.length }} мод.
                </span>
              </div>
            </div>

            <!-- Models list container (renders if expanded, white background) -->
            <div v-if="isBrandExpanded(group.brand.ID)" class="divide-y divide-slate-100 bg-white animate-fade-in">
              <div
                v-for="m in group.models"
                :key="m.ID"
                class="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50/60 transition group"
              >
                <span class="text-xs font-bold text-slate-800">{{ m.Name }}</span>
                <button @click="deleteItem('Models', m.ID, 'globalmodels')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                  <i class="bi bi-trash-fill text-[10px]"></i>
                </button>
              </div>
              <div v-if="group.models.length === 0" class="px-4 py-4 text-center text-slate-400 font-bold text-xs italic">
                Нет моделей у этой марки
              </div>
            </div>
          </div>
          <div v-if="adminGroupedModels.length === 0" class="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs px-6">
            По вашему запросу ничего не найдено.
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
      <div v-if="activeOrgTab === 'cars'" class="space-y-4 animate-fade-in">
        <!-- Controls bar with icons - All on a single horizontal row -->
        <div class="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm flex items-center justify-between gap-3 text-xs font-bold">
          <!-- Left side: Toggle "Мои" -->
          <label class="flex items-center gap-1.5 cursor-pointer text-[10px] font-black text-slate-550 uppercase tracking-wider m-0">
            <input
              type="checkbox"
              v-model="onlyOurCars"
              class="w-4 h-4 rounded text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer"
            />
            Мои
          </label>

          <!-- Right side: Icon Controls + Save button -->
          <div class="flex items-center gap-2">
            <!-- Icon Expand All -->
            <button @click="expandAllBrands" title="Развернуть все марки" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-650 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_more</span>
            </button>
            <!-- Icon Collapse All -->
            <button @click="collapseAllBrands" title="Свернуть все" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 border-none flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <span class="material-symbols-outlined text-[18px]">unfold_less</span>
            </button>
            <!-- Icon Select All -->
            <button @click="selectAllBrands" title="Выбрать все автомобили" class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-650 border-none flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition">
              <span class="material-symbols-outlined text-[18px]">done_all</span>
            </button>
            <!-- Icon Reset All -->
            <button @click="clearAllBrands" title="Сбросить всё" class="w-8 h-8 rounded-xl bg-red-50 text-red-650 border-none flex items-center justify-center cursor-pointer hover:bg-red-100 transition">
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>

            <!-- Save Changes Button (Active only when there are changes) -->
            <button
              @click="saveCarChanges"
              :disabled="!hasCarChanges"
              class="h-8 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition border-none flex items-center gap-1.5 shadow"
              :class="hasCarChanges ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-100/50' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'"
            >
              <span class="material-symbols-outlined text-[14px]">save</span>
              Сохранить
            </button>
          </div>
        </div>

        <!-- Dynamic Brand and Model Trees -->
        <div class="space-y-3">
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
            По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или фильтр «Мои».
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
          <button @click="showImportServicesModal = false" class="p-1 text-slate-400 hover:text-slate-650 rounded-full border-none bg-transparent cursor-pointer flex items-center">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Action bar to import all services -->
        <div class="px-6 py-2.5 bg-indigo-50 border-b border-indigo-100/50 flex justify-between items-center">
          <span class="text-[10px] text-indigo-700 font-black uppercase tracking-wider">Быстрый импорт</span>
          <!-- Batch Import Icon Button -->
          <button @click="importAllAvailableServices" title="Импортировать все доступные шаблоны" class="h-8 px-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-indigo-150">
            <span class="material-symbols-outlined text-[16px]">done_all</span> Импортировать все
          </button>
        </div>
        
        <!-- List of unimported templates -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div v-for="cat in db.servicecategories" :key="cat.ID" class="space-y-2">
            <div class="flex justify-between items-center pb-1">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0">{{ cat.Name }}</h4>
              <!-- Batch Import Category Icon Button -->
              <button
                v-if="unimportedGlobalServices(cat.ID).length > 0"
                @click="importAllCategoryServices(cat.ID)"
                title="Добавить все шаблоны в этой категории"
                class="text-[9px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-none px-2.5 py-1 rounded-lg font-black uppercase tracking-wider cursor-pointer flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[12px]">done_all</span> Всю категорию
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
                      class="w-full px-2 text-center text-xs font-black text-slate-855 border-none outline-none"
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
          <button @click="editingService = null" class="flex-1 h-11 border border-slate-200 text-slate-655 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer">
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
        list = list.filter(c => String(c.Name || "").toLowerCase().includes(q));
      }
      return list;
    },
    filteredAdminBrands() {
      let list = this.db.globalbrands || [];
      if (this.searchQuery && this.activeAdminTab === 'brands') {
        const q = this.searchQuery.toLowerCase().trim();
        list = list.filter(b => String(b.Name || "").toLowerCase().includes(q));
      }
      return list;
    },
    adminGroupedGlobalServices() {
      const categories = this.db.servicecategories || [];
      let services = this.db.globalservices || [];
      
      if (this.searchQuery && this.activeAdminTab === 'globalservices') {
        const q = this.searchQuery.toLowerCase().trim();
        services = services.filter(s => String(s.Name || "").toLowerCase().includes(q));
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
    },
    adminGroupedModels() {
      const brands = this.db.globalbrands || [];
      let models = this.db.globalmodels || [];
      
      if (this.searchQuery && this.activeAdminTab === 'models') {
        const q = this.searchQuery.toLowerCase().trim();
        models = models.filter(m => String(m.Name || "").toLowerCase().includes(q));
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
        globalservices: 'Услуги',
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
