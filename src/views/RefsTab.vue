<template>
  <div class="space-y-4 max-w-3xl mx-auto w-full pb-20 select-none">
    <!-- Superadmin views -->
    <div v-if="isGlobalAdmin" class="fade-transition space-y-4">
      <h1 class="text-xl font-bold tracking-tight text-center mb-2 font-heading text-slate-800">
        Управление шаблонами (Супер-админ)
      </h1>

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
          <h3 class="text-sm font-bold text-slate-700 m-0 uppercase tracking-wider">Категории услуг</h3>
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
          <h3 class="text-sm font-bold text-slate-700 m-0 uppercase tracking-wider">Шаблоны услуг</h3>
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
          <h3 class="text-sm font-bold text-slate-700 m-0 uppercase tracking-wider">Марки автомобилей</h3>
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
          <h3 class="text-sm font-bold text-slate-700 m-0 uppercase tracking-wider">Модели автомобилей</h3>
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
      <h1 class="text-xl font-bold tracking-tight text-center mb-2 font-heading text-slate-800">
        Настройка СТО (Справочники)
      </h1>

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
        <div class="flex justify-between items-center">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Прайс-лист нашего СТО</div>
          <div class="flex gap-2">
            <button @click="showImportServicesModal = true" class="h-8 px-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">import_contacts</span> Шаблоны
            </button>
            <button @click="openAddCustomServiceModal" class="h-8 px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg border-none hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px]">add</span> Своя услуга
            </button>
          </div>
        </div>

        <!-- Grouped services list -->
        <div class="space-y-4">
          <div
            v-for="group in tenantGroupedServices"
            :key="group.category.ID"
            class="border border-slate-200/50 rounded-2xl bg-slate-50/50 overflow-hidden shadow-sm"
          >
            <div class="bg-slate-100/70 px-4 py-2.5 flex justify-between items-center border-b border-slate-200/50">
              <span class="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <i class="bi bi-gear-wide-connected text-indigo-500"></i>
                {{ group.category.Name }}
              </span>
              <span class="text-[9px] text-indigo-600 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-150/30">
                {{ group.services.length }} усл.
              </span>
            </div>
            <div class="divide-y divide-slate-100 bg-white">
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
                    <!-- Edit price button -->
                    <button @click="editServicePrice(s)" class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                      <i class="bi bi-pencil-fill text-[10px]"></i>
                    </button>
                    <!-- Delete service button -->
                    <button @click="deleteItem('Services', s.ID, 'services')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer">
                      <i class="bi bi-trash-fill text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="tenantGroupedServices.length === 0" class="bg-white border border-slate-200 rounded-2xl py-12 text-center text-slate-400 font-bold text-xs">
             Ваш прайс-лист пока пуст. Добавьте услуги из шаблонов или создайте свои уникальные услуги.
          </div>
        </div>
      </div>

      <!-- Cars Configuration for Tenant -->
      <div v-if="activeOrgTab === 'cars'" class="space-y-4">
        <div class="bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-xl p-3.5 text-xs font-semibold leading-relaxed">
          💡 Отметьте галочками марки и модели автомобилей, которые обслуживает ваше СТО. Они будут доступны вашим мастерам при создании новых заказ-нарядов.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Brands Checklist -->
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider m-0">1. Выберите марки автомобилей</h3>
            <div class="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
              <label v-for="b in db.globalbrands" :key="b.ID" class="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50/50 transition">
                <span class="text-xs font-bold text-slate-800">{{ b.Name }}</span>
                <input
                  type="checkbox"
                  :checked="isOrgBrandActive(b.ID)"
                  @change="toggleOrgBrand(b.ID)"
                  class="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <!-- Models Checklist (dependent on selected brand) -->
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col">
            <h3 class="text-xs font-black text-slate-600 uppercase tracking-wider m-0">2. Выберите модели марки</h3>
            <select v-model="selectedConfigBrandId" class="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-xs text-slate-700 cursor-pointer">
              <option value="" disabled>-- Выберите марку --</option>
              <option v-for="b in activeOrgBrands" :key="b.ID" :value="b.ID">{{ b.Name }}</option>
            </select>

            <div v-if="selectedConfigBrandId" class="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-1 flex-1 mt-2">
              <label v-for="m in brandModels(selectedConfigBrandId)" :key="m.ID" class="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50/50 transition">
                <span class="text-xs font-bold text-slate-800">{{ m.Name }}</span>
                <input
                  type="checkbox"
                  :checked="isOrgModelActive(m.ID)"
                  @change="toggleOrgModel(m.ID)"
                  class="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
              <div v-if="brandModels(selectedConfigBrandId).length === 0" class="py-6 text-center text-slate-400 font-bold text-xs">
                У этой марки нет зарегистрированных моделей в шаблонах.
              </div>
            </div>
            <div v-else class="flex-1 py-12 text-center text-slate-400 font-bold text-xs">
              Выберите активную марку сверху, чтобы настроить её модели.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Import Services Modal (Tenant) -->
    <div v-if="showImportServicesModal" class="fixed inset-0 z-50 bg-[#090D1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-fade-in">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-base font-black text-slate-800 m-0 uppercase tracking-wider">Добавление услуг из шаблонов</h3>
          <button @click="showImportServicesModal = false" class="p-1 text-slate-400 hover:text-slate-600 rounded-full border-none bg-transparent cursor-pointer flex items-center">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <!-- List of unimported templates -->
        <div class="p-6 overflow-y-auto flex-1 space-y-4">
          <div v-for="cat in db.servicecategories" :key="cat.ID" class="space-y-2">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ cat.Name }}</h4>
            <div class="space-y-1.5">
              <div
                v-for="gs in unimportedGlobalServices(cat.ID)"
                :key="gs.ID"
                class="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3"
              >
                <div class="text-xs font-bold text-slate-800 max-w-[65%]">{{ gs.Name }}</div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-8 w-24">
                    <input
                      type="number"
                      v-model.number="templatePrices[gs.ID]"
                      class="w-full px-2 text-center text-xs font-black text-slate-800 border-none outline-none"
                      placeholder="Цена"
                    />
                  </div>
                  <button @click="importService(gs)" class="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer transition">
                    Добавить
                  </button>
                </div>
              </div>
              <div v-if="unimportedGlobalServices(cat.ID).length === 0" class="text-[10px] text-slate-400 font-semibold italic">Все шаблоны добавлены</div>
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
    }
  },
  data() {
    return {
      activeAdminTab: 'categories',
      activeOrgTab: 'services',
      showImportServicesModal: false,
      showCustomServiceModal: false,
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
      }
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
    toggleOrgBrand(brandId) {
      const orgId = this.store.user.OrganizationID;
      const active = this.isOrgBrandActive(brandId);
      if (active) {
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, BrandID: brandId }, 'OrganizationBrands');
        if (String(this.selectedConfigBrandId) === String(brandId)) {
          this.selectedConfigBrandId = '';
        }
      } else {
        this.store.dispatchSync('addRow', { OrganizationID: orgId, BrandID: brandId }, 'OrganizationBrands');
      }
    },
    toggleOrgModel(modelId) {
      const orgId = this.store.user.OrganizationID;
      const active = this.isOrgModelActive(modelId);
      if (active) {
        this.store.dispatchSync('deleteRow', { OrganizationID: orgId, ModelID: modelId }, 'OrganizationModels');
      } else {
        this.store.dispatchSync('addRow', { OrganizationID: orgId, ModelID: modelId }, 'OrganizationModels');
      }
    },
    brandModels(brandId) {
      return (this.db.globalmodels || []).filter(m => String(m.BrandID) === String(brandId));
    }
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
