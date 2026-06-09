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
            {{ refForm.ID ? "Редактировать:" : "Добавить:" }}
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
          <div v-for="f in refMeta[activeRefTab].fields" :key="f.k">
            <label
              class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >{{ f.l }}</label
            >
            <select
              v-if="f.t === 'selectBrand'"
              v-model="refForm[f.k]"
              class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm"
            >
              <option v-for="b in sortedBrands" :key="b.ID" :value="b.ID">
                {{ b.Name }}
              </option>
            </select>
            <input
              v-else
              :type="f.t === 'number' ? 'number' : 'text'"
              v-model="refForm[f.k]"
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm"
            />
          </div>
        </div>
        <div
          class="modal-footer border-t border-slate-100 px-6 py-5 bg-white flex gap-3"
        >
          <button
            type="button"
            class="flex-1 px-4 py-3 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer"
            data-bs-dismiss="modal"
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
            <span>{{ refForm.ID ? "Обновить" : "Добавить" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  data() {
    return {
      activeRefTab: "services",
      refForm: {},
      isSaving: false,
      refMeta: {
        services: {
          title: "Услуги",
          icon: "build",
          sheet: "Services",
          fields: [
            { k: "Name", l: "Название" },
            { k: "Price", l: "Цена (KGS)", t: "number" },
          ],
        },
        brands: {
          title: "Марки",
          icon: "directions_car",
          sheet: "Brands",
          fields: [{ k: "Name", l: "Марка" }],
        },
        models: {
          title: "Модели",
          icon: "list_alt",
          sheet: "Models",
          fields: [
            { k: "BrandID", l: "Привязка (Марка)", t: "selectBrand" },
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
      } else {
        this.refForm = {};
      }
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    async saveRef() {
      try {
        this.isSaving = true;
        let sheet = this.refMeta[this.activeRefTab].sheet;
        
        // Role protection
        if (this.activeRefTab !== 'services' && this.user.Role !== 'Superadmin') {
          this.store.showToast("Только Супер-администратор может редактировать этот справочник", "error");
          this.isSaving = false;
          return;
        }

        let payload = Object.assign(
          { _role: this.user.Role, _userId: this.user.ID },
          this.refForm,
        );
        let isNew = !payload.ID;

        // Validation & Uniqueness check
        const nameVal = String(payload.Name || '').trim();
        if (!nameVal) {
          this.store.showToast("Название не может быть пустым", "error");
          this.isSaving = false;
          return;
        }
        payload.Name = nameVal;

        if (this.activeRefTab === 'services') {
          payload.OrganizationID = this.user.OrganizationID;
          const list = this.store.db.services || [];
          const exists = list.some(x => x.ID !== payload.ID && String(x.Name || '').trim().toLowerCase() === nameVal.toLowerCase());
          if (exists) {
            this.store.showToast("Такая услуга уже существует", "error");
            this.isSaving = false;
            return;
          }
        } else if (this.activeRefTab === 'brands') {
          const list = this.store.db.brands || [];
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
          const list = this.store.db.models || [];
          const exists = list.some(x => x.ID !== payload.ID && String(x.BrandID) === String(payload.BrandID) && String(x.Name || '').trim().toLowerCase() === nameVal.toLowerCase());
          if (exists) {
            this.store.showToast("Такая модель уже существует для выбранной марки", "error");
            this.isSaving = false;
            return;
          }
        }

        if (isNew) {
          payload.ID = "local_" + Date.now();
          if (!this.store.db[this.activeRefTab])
            this.store.db[this.activeRefTab] = [];
          this.store.db[this.activeRefTab].push(payload);
          this.store.dispatchSync("addRow", payload, sheet);
        } else {
          let idx = this.store.db[this.activeRefTab].findIndex(
            (x) => x.ID === payload.ID,
          );
          if (idx > -1) this.store.db[this.activeRefTab][idx] = payload;
          this.store.dispatchSync("updateRow", payload, sheet);
        }

        this.store.showToast(
          payload.ID && !isNew
            ? "Обновлено в справочнике"
            : "Добавлено в справочник",
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
