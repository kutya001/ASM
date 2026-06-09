<template>
  <div
    class="modal fade"
    id="userConfigModal"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div
        class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden"
      >
        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
          <h5 class="modal-title font-bold text-slate-800 m-0">
            Настройка доступа
          </h5>
          <button
            type="button"
            class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body bg-slate-50/50 p-6 space-y-4">
          <div>
            <label
              class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >Роль пользователя</label
            >
            <select
              v-model="userConfigForm.Role"
              class="form-select w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500"
            >
              <option value="Master">Мастер</option>
              <option value="SenMaster">Главный мастер</option>
              <option v-if="isGlobalAdmin" value="Superadmin">Супер-администратор</option>
            </select>
          </div>
          <div>
            <label
              class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >ФИО / Полное имя</label
            >
            <input
              type="text"
              v-model="userConfigForm.Name"
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >Номер телефона</label
            >
            <input
              type="tel"
              v-model="userConfigForm.Phone"
              @input="onPhoneInput"
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
            />
          </div>

          <!-- Password field for Superadmin -->
          <div v-if="isGlobalAdmin">
            <label
              class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2"
              >Изменить пароль</label
            >
            <input
              type="password"
              v-model="userConfigForm.Password"
              placeholder="Введите новый пароль"
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800 shadow-sm focus:border-indigo-500"
            />
          </div>
        </div>
        <div
          class="modal-footer border-t border-slate-100 px-6 py-4 bg-white flex flex-col sm:flex-row gap-2 sm:gap-3"
        >
          <button
            type="button"
            class="w-full sm:flex-1 px-4 py-2.5 border border-slate-205 text-slate-600 rounded-xl bg-white hover:bg-slate-50 font-bold text-sm transition cursor-pointer"
            data-bs-dismiss="modal"
          >
            Отмена
          </button>
          <button
            type="button"
            class="w-full sm:flex-1 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 border-none cursor-pointer"
            @click="saveUserConfig"
            :disabled="isSavingUserConfig"
          >
            <span
              v-if="isSavingUserConfig"
              class="spinner-border spinner-border-sm text-white border-2"
            ></span>
            <span>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";
import { formatPhoneInput } from "../../utils/helpers";

export default {
  data() {
    return {
      userConfigForm: { ID: "", Role: "Master", Name: "", Phone: "+996 ", Password: "" },
      isSavingUserConfig: false,
      bsModal: null,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    isGlobalAdmin() {
      return this.store.user && this.store.user.Role === 'Superadmin';
    },
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef);
    }
  },
  methods: {
    open(u) {
      this.userConfigForm = {
        ID: u.ID,
        Role: u.Role,
        Name: u.Name || "",
        Phone: u.Phone || "+996 ",
        Password: "", // Do not prefill password for security
      };
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    onPhoneInput() {
      this.userConfigForm.Phone = formatPhoneInput(this.userConfigForm.Phone);
    },
    async saveUserConfig() {
      this.isSavingUserConfig = true;
      try {
        let obj = Object.assign({}, this.userConfigForm);
        let idx = this.store.db.users.findIndex((x) => x.ID === obj.ID);
        
        const updateData = { Role: obj.Role, Name: obj.Name, Phone: obj.Phone };
        if (obj.Password) {
          updateData.Password = obj.Password;
        }

        if (idx > -1) {
          this.store.db.users[idx].Role = obj.Role;
          this.store.db.users[idx].Name = obj.Name;
          this.store.db.users[idx].Phone = obj.Phone;
          if (obj.Password) {
            this.store.db.users[idx].Password = obj.Password;
          }
        }
        
        this.store.dispatchSync(
          "approveUser",
          {
            id: obj.ID,
            data: updateData,
          },
          "Users",
        );
        this.store.showToast("Настройки сохранены, ожидайте синхронизации");
        this.hide();
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isSavingUserConfig = false;
      }
    },
  },
};
</script>
