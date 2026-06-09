<template>
  <div class="space-y-4 max-w-md mx-auto w-full pb-20">
    <!-- Grid view -->
    <div v-if="refTab === 'grid'" class="fade-transition">
      <h1
        class="text-xl font-bold tracking-tight text-center mb-4 font-heading text-slate-800"
      >
        Справочники
      </h1>
      <div class="grid grid-cols-3 gap-2.5">
        <div
          v-for="(meta, key) in refMeta"
          :key="key"
          @click="refTab = key"
          class="bg-surface rounded-xl p-3 shadow-sm border border-border-subtle/50 cursor-pointer flex flex-col items-center justify-center gap-2 text-center active:scale-95 transition-all hover:bg-slate-50"
        >
          <div
            class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"
          >
            <span
              class="material-symbols-outlined text-[18px] font-medium"
              >{{ meta.icon }}</span
            >
          </div>
          <div>
            <div
              class="font-bold text-slate-800 text-xs font-heading"
            >
              {{ meta.title }}
            </div>
            <div class="text-[10px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap">
              {{ db[key] ? db[key].length : 0 }} зап.
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 border-t border-slate-100 pt-4">
        <h2 class="font-bold text-xs mb-1.5 text-slate-700 font-heading">
          Управление данными
        </h2>
        <div
          class="text-[11px] text-slate-500 leading-relaxed font-semibold"
        >
          Справочники позволяют быстро заполнять карточки обслуживания.
          Глобальные справочники марок и моделей автомобилей редактируются только Супер-администратором.
          Цены и список услуг вы можете настраивать индивидуально для вашей организации.
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="fade-transition space-y-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <button
            @click="refTab = 'grid'"
            class="p-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors -ml-2"
          >
            <span class="material-symbols-outlined text-text-muted"
              >arrow_back</span
            >
          </button>
          <h5 class="m-0 font-bold text-text-main text-lg font-heading">
            {{ refMeta[refTab].title }}
          </h5>
        </div>
        <button
          v-if="refTab === 'services' || isGlobalAdmin"
          @click="$emit('open-bulk-modal')"
          class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors border border-indigo-100"
        >
          <span class="material-symbols-outlined text-[14px]">upload_file</span>
          Импорт
        </button>
      </div>

      <div
        v-if="refTab !== 'models'"
        class="bg-surface border border-border-subtle/50 rounded-2xl shadow-soft flex flex-col overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse table-auto">
            <thead class="bg-slate-50 border-b border-border-subtle/50">
              <tr>
                <th
                  v-for="f in refMeta[refTab].fields"
                  :key="f.k"
                  class="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                >
                  {{ f.l }}
                </th>
                <th v-if="refTab === 'services' || isGlobalAdmin" class="px-3 py-1 w-14"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in (refTab === 'services' ? filteredServices : filteredBrands)"
                :key="item.ID"
                class="hover:bg-slate-50 group cursor-pointer"
                @click="refTab === 'services' || isGlobalAdmin ? $emit('open-ref-modal', refTab, item) : null"
              >
                <td
                  v-for="f in refMeta[refTab].fields"
                  class="px-3 py-0.5 text-xs font-semibold text-slate-800 shrink-0"
                >
                  <span v-if="f.t === 'number'">{{
                    Number(item[f.k]).toLocaleString()
                  }}</span>
                  <span v-else-if="f.t === 'selectBrand'">{{
                    getBrandName(item[f.k])
                  }}</span>
                  <span v-else>{{ item[f.k] }}</span>
                </td>
                <td class="px-3 py-0.5 text-right shrink-0" @click.stop v-if="refTab === 'services' || isGlobalAdmin">
                  <button
                    class="p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    @click="$emit('del-row', refMeta[refTab].sheet, item.ID, refTab)"
                  >
                    <i class="bi bi-trash-fill text-xs"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="refTab === 'services' && filteredServices.length === 0">
                <td
                  :colspan="refMeta[refTab].fields.length + 1"
                  class="px-3 py-4 text-center text-slate-400 font-medium text-xs"
                >
                  Нет услуг
                </td>
              </tr>
              <tr v-if="refTab === 'brands' && filteredBrands.length === 0">
                <td
                  :colspan="refMeta[refTab].fields.length + 1"
                  class="px-3 py-4 text-center text-slate-400 font-medium text-xs"
                >
                  Нет марок
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="group in filteredGroupedModels"
          :key="group.brand.ID"
          class="border border-slate-200/50 rounded-2xl bg-slate-50/50 overflow-hidden shadow-sm"
        >
          <div
            class="bg-slate-100/70 px-3 py-1 flex justify-between items-center border-b border-slate-200/50 select-none cursor-pointer hover:bg-slate-200/50 transition-colors"
            @click="toggleBrand(group.brand.ID)"
          >
            <div class="flex items-center gap-1.5">
               <span
                class="material-symbols-outlined text-[14px] text-slate-400 transition-transform duration-200"
                :class="{ 'rotate-180': searchQuery || expandedBrands.includes(group.brand.ID) }"
              >
                expand_more
              </span>
              <span
                class="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1"
              >
                <i class="bi bi-car-front-fill text-[11px] text-indigo-500"></i>
                {{ group.brand.Name }}
              </span>
            </div>
            <span
              class="text-[8px] text-indigo-600 font-bold uppercase bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-150/30"
              >{{ group.models.length }} мод.</span
            >
          </div>
          <div class="divide-y divide-slate-100 bg-white" v-show="searchQuery || expandedBrands.includes(group.brand.ID)">
            <div
              v-for="m in group.models"
              :key="m.ID"
              @click="isGlobalAdmin ? $emit('open-ref-modal', 'models', m) : null"
              class="px-3 py-0.5 flex justify-between items-center hover:bg-slate-50/60 cursor-pointer transition"
            >
              <span
                class="text-xs font-bold text-slate-800"
                >{{ m.Name }}</span
              >
              <button
                v-if="isGlobalAdmin"
                class="p-0.5 px-1 text-slate-400 hover:text-red-600 hover:bg-red-50/40 rounded-lg transition"
                @click.stop="$emit('del-row', refMeta['models'].sheet, m.ID, 'models')"
              >
                <i class="bi bi-trash-fill text-xs"></i>
              </button>
            </div>
            <div
              v-if="group.models.length === 0"
              class="px-3 py-2 text-center text-slate-400 font-semibold text-[11px] bg-slate-50/20 italic"
            >
              Нет моделей
            </div>
          </div>
        </div>
        <div
          v-if="filteredGroupedModels.length === 0"
          class="px-4 py-6 text-center text-slate-400 font-medium text-sm"
        >
          Нет моделей
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button
      v-if="refTab !== 'grid' && (refTab === 'services' || isGlobalAdmin)"
      @click="$emit('open-ref-modal', refTab, -1)"
      class="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-fab hover:bg-indigo-700 active:scale-95 transition-all z-20 md:bottom-12 md:right-12"
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
import { useMainStore } from "../store";

export default {
  name: 'RefsTab',
  props: {
    db: {
      type: Object,
      required: true
    },
    groupedModels: {
      type: Array,
      required: true
    },
    getBrandName: {
        type: Function,
        required: true
    },
    searchQuery: {
      type: String,
      default: ""
    }
  },
  computed: {
    isGlobalAdmin() {
      const store = useMainStore();
      return store.user && store.user.Role === 'Superadmin';
    },
    filteredServices() {
      const list = this.db.services || [];
      if (!this.searchQuery) return list;
      const q = this.searchQuery.toLowerCase().trim();
      return list.filter(item => 
        String(item.Name || '').toLowerCase().includes(q)
      );
    },
    filteredBrands() {
      const list = this.db.brands || [];
      if (!this.searchQuery) return list;
      const q = this.searchQuery.toLowerCase().trim();
      return list.filter(item => 
        String(item.Name || '').toLowerCase().includes(q)
      );
    },
    filteredGroupedModels() {
      const list = this.groupedModels || [];
      if (!this.searchQuery) return list;
      const q = this.searchQuery.toLowerCase().trim();
      
      return list.map(group => {
        const brandMatch = String(group.brand.Name || '').toLowerCase().includes(q);
        if (brandMatch) {
          return group;
        }
        const filteredModelsList = group.models.filter(m => 
          String(m.Name || '').toLowerCase().includes(q)
        );
        return {
          brand: group.brand,
          models: filteredModelsList
        };
      }).filter(group => group.models.length > 0);
    }
  },
  data() {
      return {
          refTab: 'grid',
          expandedBrands: [],
          refMeta: {
            services: { title: 'Услуги', icon: 'build', sheet: 'Services', fields: [{k:'Name', l:'Название'}, {k:'Price', l:'Цена (KGS)', t:'number'}] },
            brands: { title: 'Марки', icon: 'directions_car', sheet: 'Brands', fields: [{k:'Name', l:'Марка'}] },
            models: { title: 'Модели', icon: 'list_alt', sheet: 'Models', fields: [{k:'BrandID', l:'Привязка (Марка)', t:'selectBrand'}, {k:'Name', l:'Модель'}] }
          }
      }
  },
  methods: {
    toggleBrand(brandId) {
      if (this.expandedBrands.includes(brandId)) {
        this.expandedBrands = this.expandedBrands.filter(id => id !== brandId);
      } else {
        this.expandedBrands.push(brandId);
      }
    }
  },
  emits: ['open-ref-modal', 'del-row', 'open-bulk-modal']
}
</script>
