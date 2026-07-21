<template>
  <div
    class="modal fade"
    id="refModal"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div
        class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden"
      >
        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
          <h5 class="modal-title font-bold text-slate-800 m-0">
            {{ refForm.ID ? (isEditing ? "Изменить:" : "Просмотр:") : "Добавить:" }}
            {{ refMeta[activeRefTab] ? refMeta[activeRefTab].title : "" }}
          </h5>
          <button
            type="button"
            class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div
          class="modal-body bg-slate-50/50 p-6 space-y-4"
          v-if="refMeta[activeRefTab]"
        >
          <div v-for="f in activeFields" :key="f.k">
            <label
              class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >{{ f.l }}</label
            >
            <select
              v-if="f.t === 'selectCategory'"
              v-model="refForm[f.k]"
              :disabled="!isEditing"
              class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none"
            >
              <option v-for="cat in dbCategories" :key="cat.ID" :value="cat.ID">
                {{ cat.Name }}
              </option>
            </select>
            <select
              v-else-if="f.t === 'selectGlobalBrand'"
              v-model="refForm[f.k]"
              :disabled="!isEditing"
              class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none"
            >
              <option v-for="b in dbGlobalBrands" :key="b.ID" :value="b.ID">
                {{ b.Name }}
              </option>
            </select>
            <select
              v-else-if="f.t === 'selectBrand'"
              v-model="refForm[f.k]"
              :disabled="!isEditing"
              class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm"
            >
              <option v-for="b in sortedBrands" :key="b.ID" :value="b.ID">
                {{ b.Name }}
              </option>
            </select>
            <select
              v-else-if="f.t === 'selectOrg'"
              v-model="refForm[f.k]"
              :disabled="!isEditing"
              class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500"
            >
              <option v-for="org in dbOrganizations" :key="org.ID" :value="org.ID">
                {{ org.Name }}
              </option>
            </select>
            <input
              v-else
              :type="f.t === 'number' ? 'number' : 'text'"
              v-model="refForm[f.k]"
              :disabled="!isEditing"
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm"
            />
          </div>
        </div>
        
        <!-- View mode footer -->
        <div
          class="modal-footer border-t border-slate-100 px-6 py-5 bg-white flex flex-wrap gap-2 justify-end"
          v-if="!isEditing"
        >
          <button
            type="button"
            class="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm transition border-none cursor-pointer"
            @click="confirmDeleteRef"
          >
            Удалить
          </button>
          <button
            type="button"
            class="px-4 py-3 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer"
            data-bs-dismiss="modal"
          >
            Закрыть
          </button>
          <button
            type="button"
            class="flex-1 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 border-none cursor-pointer"
            @click="isEditing = true"
          >
            Изменить
          </button>
        </div>

        <!-- Edit mode footer -->
        <div
          class="modal-footer border-t border-slate-100 px-6 py-5 bg-white flex gap-3"
          v-else
        >
          <button
            type="button"
            class="flex-1 px-4 py-3 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer"
            @click="refForm.ID ? (isEditing = false) : hide()"
          >
            Отмена
          </button>
          <button
            type="button"
            class="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 border-none cursor-pointer"
            @click="saveRef"
            :disabled="isSaving"
          >
            <span
              v-if="isSaving"
              class="spinner-border spinner-border-sm text-white border-2"
            ></span>
            <span>{{ refForm.ID ? "Сохранить" : "Добавить" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";
import { generateUUID } from "../../utils/helpers";

export default {
  data() {
    return {
      activeRefTab: "categories",
      refForm: {},
      isSaving: false,
      isEditing: false,
      refMeta: {
        categories: {
          title: "Категория услуг",
          icon: "folder",
          sheet: "ServiceCategories",
          fields: [{ k: "Name", l: "Название категории" }],
        },
        globalservices: {
          title: "Услуга",
          icon: "build",
          sheet: "GlobalServices",
          fields: [
            { k: "CategoryID", l: "Категория", t: "selectCategory" },
            { k: "Name", l: "Название услуги" },
            { k: "DefaultPrice", l: "Цена (сом)", t: "number" },
          ],
        },
        brands: {
          title: "Марка авто",
          icon: "directions_car",
          sheet: "Brands",
          fields: [{ k: "Name", l: "Марка" }],
        },
        models: {
          title: "Модель авто",
          icon: "list_alt",
          sheet: "Models",
          fields: [
            { k: "BrandID", l: "Марка авто", t: "selectGlobalBrand" },
            { k: "Name", l: "Модель" },
          ],
        },
      },
      bsModal: null,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    sortedBrands() {
      return this.store.sortedBrands;
    },
    user() {
      return this.store.user;
    },
    activeFields() {
      if (!this.refMeta[this.activeRefTab]) return [];
      return [...this.refMeta[this.activeRefTab].fields];
    },
    dbOrganizations() {
      return this.store.db.organizations || [];
    },
    dbCategories() {
      return this.store.db.servicecategories || [];
    },
    dbGlobalBrands() {
      return this.store.db.globalbrands || [];
    },
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef);
    }
  },
  methods: {
    open(refTab, item = null) {
      this.activeRefTab = refTab;
      if (item && item !== -1) {
        this.refForm = Object.assign({}, item);
        this.isEditing = false;
      } else {
        this.refForm = {};
        this.isEditing = true;
      }
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    async confirmDeleteRef() {
      if (confirm("Вы действительно хотите удалить эту запись? Действие необратимо.")) {
        try {
          const sheet = this.refMeta[this.activeRefTab].sheet;
          const stateKey = this.activeRefTab === 'categories' ? 'servicecategories' 
                         : this.activeRefTab === 'globalservices' ? 'globalservices'
                         : this.activeRefTab === 'brands' ? 'globalbrands'
                         : 'globalmodels';
          
          if (this.store.db[stateKey]) {
            this.store.db[stateKey] = this.store.db[stateKey].filter((x) => x.ID !== this.refForm.ID);
          }
          await this.store.dispatchSync("deleteRow", this.refForm.ID, sheet);
          this.store.showToast("Запись удалена");
          this.hide();
        } catch (e) {
          this.store.showToast(e.message, "error");
        }
      }
    },
    async saveRef() {
      try {
        this.isSaving = true;
        let sheet = this.refMeta[this.activeRefTab].sheet;
        
        if (this.user.Role !== 'Superadmin') {
          this.store.showToast("Только Супер-администратор может редактировать этот справочник", "error");
          this.isSaving = false;
          return;
        }

        let payload = Object.assign(
          { _role: this.user.Role, _userId: this.user.ID },
          this.refForm,
        );
        let isNew = !payload.ID;

        const nameVal = String(payload.Name || '').trim();
        if (!nameVal) {
          this.store.showToast("Название не может быть пустым", "error");
          this.isSaving = false;
          return;
        }
        payload.Name = nameVal;

        // Validations
        if (this.activeRefTab === 'categories') {
          const list = this.store.db.servicecategories || [];
          const exists = list.some(x => x.ID !== payload.ID && String(x.Name || '').trim().toLowerCase() === nameVal.toLowerCase());
          if (exists) {
            this.store.showToast("Такая категория уже существует", "error");
            this.isSaving = false;
            return;
          }
        } else if (this.activeRefTab === 'globalservices') {
          if (!payload.CategoryID) {
            this.store.showToast("Выберите категорию для услуги", "error");
            this.isSaving = false;
            return;
          }
          if (payload.DefaultPrice === undefined || payload.DefaultPrice === '') {
            payload.DefaultPrice = 0;
          }
          const list = this.store.db.globalservices || [];
          const exists = list.some(x => x.ID !== payload.ID && String(x.CategoryID) === String(payload.CategoryID) && String(x.Name || '').trim().toLowerCase() === nameVal.toLowerCase());
          if (exists) {
            this.store.showToast("Услуга с таким названием уже есть в этой категории", "error");
            this.isSaving = false;
            return;
          }
        } else if (this.activeRefTab === 'brands') {
          const list = this.store.db.globalbrands || [];
          const exists = list.some(x => x.ID !== payload.ID && String(x.Name || '').trim().toLowerCase() === nameVal.toLowerCase());
          if (exists) {
            this.store.showToast("Такая марка уже существует", "error");
            this.isSaving = false;
            return;
          }
        } else if (this.activeRefTab === 'models') {
          if (!payload.BrandID) {
            this.store.showToast("Выберите марку для модели", "error");
            this.isSaving = false;
            return;
          }
          const list = this.store.db.globalmodels || [];
          const exists = list.some(x => x.ID !== payload.ID && String(x.BrandID) === String(payload.BrandID) && String(x.Name || '').trim().toLowerCase() === nameVal.toLowerCase());
          if (exists) {
            this.store.showToast("Такая модель уже существует для этой марки", "error");
            this.isSaving = false;
            return;
          }
        }

        const stateKey = this.activeRefTab === 'categories' ? 'servicecategories' 
                       : this.activeRefTab === 'globalservices' ? 'globalservices'
                       : this.activeRefTab === 'brands' ? 'globalbrands'
                       : 'globalmodels';

        if (isNew) {
          payload.ID = generateUUID();
          this.store.dispatchSync("addRow", payload, sheet);
        } else {
          let idx = this.store.db[stateKey].findIndex(
            (x) => x.ID === payload.ID,
          );
          if (idx > -1) this.store.db[stateKey][idx] = payload;
          this.store.dispatchSync("updateRow", payload, sheet);
        }

        this.store.showToast(
          payload.ID && !isNew
            ? "Услуга обновлена"
            : "Услуга добавлена",
        );
        this.hide();
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>
