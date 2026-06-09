<template>
  <div
    class="modal fade"
    id="profileModal"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div
        class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden"
      >
        <div class="modal-header border-b border-slate-100 px-6 py-5 bg-white">
          <h5 class="modal-title font-bold text-slate-800 m-0">Мой профиль</h5>
          <button
            type="button"
            class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body bg-slate-50 p-6 space-y-4">
          <!-- View mode -->
          <div
            v-if="!isEditingProfile"
            class="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative animate-fade-in"
          >
            <button
              @click="isEditingProfile = true"
              class="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition border-none bg-transparent"
              title="Редактировать"
            >
              <i class="bi bi-pencil-square text-lg"></i>
            </button>

            <div
              class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner"
            >
              {{
                user && user.Username
                  ? user.Username.slice(0, 2).toUpperCase()
                  : "?"
              }}
            </div>
            <h3 class="font-bold text-xl text-slate-800 mb-1" v-if="user">
              {{ user.Name || user.Username }}
            </h3>
            <p class="text-sm font-semibold text-slate-500 mb-4" v-if="user">
              @{{ user.Username }}
            </p>

            <div
              class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg mb-2"
              v-if="user"
            >
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-widest"
                >{{
                  user.Role === "Superadmin"
                    ? "Супер-админ"
                    : user.Role === "SenMaster"
                      ? "Главный мастер"
                      : "Мастер"
                }}</span
              >
            </div>

            <div
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700"
              v-if="user && user.Phone"
            >
              <i class="bi bi-telephone text-indigo-500"></i>
              <span class="text-sm font-bold">{{ user.Phone }}</span>
            </div>

            <div class="w-full h-px bg-slate-100 my-4"></div>

            <!-- Reopen Welcome screen / About app -->
            <button
              @click="openGamesLobby"
              class="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 rounded-xl font-bold transition border-none cursor-pointer mb-2"
              id="btn-open-games-lobby"
            >
              <i class="bi bi-controller text-base"></i> Игротека ERP (Мини-игры)
            </button>

            <button
              @click="reopenWelcome"
              class="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/70 rounded-xl font-bold transition border-none cursor-pointer mb-2"
              id="btn-reopen-welcome-modal"
            >
              <i class="bi bi-info-circle-fill"></i> О приложении
            </button>

            <button
              @click="triggerLogout"
              class="flex items-center justify-center gap-2 w-full py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition border-none bg-transparent cursor-pointer"
            >
              <i class="bi bi-box-arrow-right"></i> Выйти из аккаунта
            </button>
          </div>

          <!-- Edit mode -->
          <div
            v-else
            class="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative animate-fade-in"
          >
            <button
              @click="isEditingProfile = false"
              class="absolute top-3 left-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition border-none bg-transparent"
              title="Отмена"
            >
              <span class="material-symbols-outlined text-sm">arrow_back</span>
            </button>
            <h4 class="font-bold text-slate-800 m-0 text-center mb-4">
              Редактирование
            </h4>

            <div v-if="user">
              <label
                class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                >Роль доступа (не редактируется)</label
              >
              <input
                :value="
                  user.Role === 'Superadmin'
                    ? 'Супер-админ'
                    : user.Role === 'SenMaster'
                      ? 'Главный мастер'
                      : 'Мастер'
                "
                disabled
                class="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label
                class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                >ФИО / Полное имя</label
              >
              <input
                v-model="profileForm.Name"
                type="text"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition"
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <label
                class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                >Номер телефона</label
              >
              <input
                v-model="profileForm.Phone"
                type="tel"
                @input="onPhoneInput"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition"
                placeholder="+996 XXX XXX XXX"
              />
            </div>
            <div>
              <label
                class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                >Имя пользователя / Логин (не редактируется)</label
              >
              <input
                v-model="profileForm.username"
                type="text"
                disabled
                class="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 cursor-not-allowed shadow-sm transition"
              />
            </div>
            <div>
              <label
                class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
                >Новый пароль</label
              >
              <input
                v-model="profileForm.password"
                type="password"
                class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-slate-800 outline-none focus:border-indigo-500 shadow-sm transition"
                placeholder="Введите новый пароль для изменения"
              />
            </div>
            <button
              @click="saveUserProfile"
              :disabled="isSavingProfile"
              class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md mt-6 border-none cursor-pointer"
            >
              <span
                v-if="isSavingProfile"
                class="spinner-border spinner-border-sm text-white"
              ></span
              ><span>Сохранить настройки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";
import { updateUserProfile } from "../../services/api";
import { formatPhoneInput } from "../../utils/helpers";

export default {
  emits: ["logout", "reopen-welcome"],
  data() {
    return {
      isEditingProfile: false,
      profileForm: { username: "", Name: "", Phone: "+996 ", password: "" },
      isSavingProfile: false,
      bsModal: null,
    };
  },
  computed: {
    store() {
      return useMainStore();
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
    open() {
      if (this.user) {
        this.isEditingProfile = false;
        this.profileForm.username = this.user.Username;
        this.profileForm.Name = this.user.Name || "";
        this.profileForm.Phone = this.user.Phone || "+996 ";
        this.profileForm.password = "";
      }

      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    onPhoneInput() {
      this.profileForm.Phone = formatPhoneInput(this.profileForm.Phone);
    },
    async saveUserProfile() {
      this.isSavingProfile = true;
      try {
        await updateUserProfile(
          this.user.ID,
          this.profileForm.password,
          this.profileForm.Name,
          this.profileForm.Phone,
        );
        
        // Update store state
        this.store.user.Name = this.profileForm.Name;
        this.store.user.Phone = this.profileForm.Phone;
        
        // Update user storage
        localStorage.setItem("currentUser", JSON.stringify(this.store.user));

        this.profileForm.password = "";
        this.store.showToast("Профиль успешно обновлен!");
        this.hide();
      } catch (e) {
        this.store.showToast(e.message, "error");
      } finally {
        this.isSavingProfile = false;
      }
    },
    triggerLogout() {
      this.hide();
      this.store.logout();
    },
    reopenWelcome() {
      this.hide();
      this.$emit("reopen-welcome");
    },
    openGamesLobby() {
      this.hide();
      this.store.toggleGamesLobby(true);
    },
  },
};
</script>
