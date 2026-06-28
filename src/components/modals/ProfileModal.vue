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
        <div class="modal-header border-b border-slate-100 px-6 py-4 bg-white flex flex-col items-stretch gap-3">
          <div class="flex justify-between items-center">
            <h5 class="modal-title font-bold text-slate-800 m-0">Профиль и настройки</h5>
            <button
              type="button"
              class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent"
              data-bs-dismiss="modal"
            ></button>
          </div>
          
          <!-- Tab switch buttons (Only for non-Superadmins) -->
          <div v-if="user && user.Role !== 'Superadmin'" class="flex gap-1 p-0.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              @click="activeProfileTab = 'personal'"
              class="flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
              :class="activeProfileTab === 'personal' ? 'bg-white text-indigo-655 shadow-xs font-bold' : 'bg-transparent text-slate-500 hover:text-slate-700 font-semibold'"
            >
              Личные данные
            </button>
            <button
              type="button"
              @click="activeProfileTab = 'organization'"
              class="flex-1 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0"
              :class="activeProfileTab === 'organization' ? 'bg-white text-indigo-655 shadow-xs font-bold' : 'bg-transparent text-slate-500 hover:text-slate-700 font-semibold'"
            >
              Организация
            </button>
          </div>
        </div>
        <div class="modal-body bg-slate-50 p-6 space-y-4">
          <!-- Personal Info View Mode -->
          <div
            v-if="(user.Role === 'Superadmin' || activeProfileTab === 'personal') && !isEditingProfile"
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
              v-if="user && user.Role !== 'Superadmin'"
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

          <!-- Organization Tab Content -->
          <div v-if="user && user.Role !== 'Superadmin' && activeProfileTab === 'organization'" class="space-y-4 animate-fade-in text-left">
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <!-- Org Name -->
              <div>
                <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Автосервис / СТО</span>
                <span class="block font-black text-sm text-slate-800 mt-1">{{ userOrgName }}</span>
              </div>
              
              <!-- Subscription Status & Limits -->
              <div class="pt-3 border-t border-slate-100 space-y-3">
                <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Статус подписки</span>
                
                <div class="mt-1 p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-fade-in"
                     :class="isSubActive ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' : 'bg-rose-50/50 border-rose-100 text-rose-800'">
                  <div>
                    <div class="text-[10px] font-black uppercase">
                      {{ isSubActive ? 'Активна' : 'Истекла' }}
                    </div>
                    <div class="text-[10px] font-bold mt-0.5">
                      {{ subEndsDateText }}
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-xl">
                    {{ isSubActive ? 'check_circle' : 'cancel' }}
                  </span>
                </div>

                <!-- Limits display -->
                <div class="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                  <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-150/40 text-left">
                    <span class="block text-[8px] text-slate-400 uppercase tracking-wider">Штат (лимит)</span>
                    <span class="block text-slate-800 font-extrabold mt-0.5">{{ orgEmployeesCount }} / {{ orgMaxUsers }} чел.</span>
                  </div>
                  <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-150/40 text-left">
                    <span class="block text-[8px] text-slate-400 uppercase tracking-wider">Расчетный тариф</span>
                    <span class="block text-indigo-650 font-black mt-0.5">{{ orgCalculatedPrice }} сом / мес</span>
                  </div>
                </div>
              </div>

              <!-- Payment instruction -->
              <div class="p-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl space-y-1.5 text-xs text-indigo-900 leading-relaxed font-semibold">
                <div class="text-[9px] font-black uppercase text-indigo-700 tracking-wider">Инструкция по оплате</div>
                <div>Базовая стоимость (до 3 сотрудников) — <span class="font-extrabold text-indigo-750">1500 сом / мес</span>.</div>
                <div>За каждого сотрудника сверх лимита — <span class="font-extrabold text-indigo-750">500 сом / мес</span>.</div>
                <div>Нажмите кнопку ниже, чтобы перейти в чат поддержки WhatsApp и прикрепить скриншот чека об оплате. Администратор проверит транзакцию и продлит подписку.</div>
              </div>

              <!-- Pay Button -->
              <a
                :href="whatsappPayLink"
                target="_blank"
                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 border-none decoration-none text-center text-white"
              >
                <span class="material-symbols-outlined text-[16px]">payments</span>
                Оплатить подписку (WhatsApp)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";
import { updateUserProfile } from "../../services/api";
import { formatPhoneInput, getSubscriptionDaysLeft } from "../../utils/helpers";

export default {
  emits: ["logout", "reopen-welcome"],
  data() {
    return {
      isEditingProfile: false,
      profileForm: { username: "", Name: "", Phone: "+996 ", password: "" },
      isSavingProfile: false,
      bsModal: null,
      activeProfileTab: "personal",
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    userOrgName() {
      if (!this.user) return "";
      const org = (this.store.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      return org ? org.Name : "—";
    },
    isSubActive() {
      if (!this.user) return false;
      const org = (this.store.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      if (!org || !org.SubscriptionEndsAt) return false;
      return new Date(org.SubscriptionEndsAt) > new Date();
    },
    subEndsDateText() {
      if (!this.user) return "";
      const org = (this.store.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      if (!org) return "не оплачена";
      
      const d = org.SubscriptionEndsAt ? new Date(org.SubscriptionEndsAt) : null;
      if (!d) return "не оплачена";
      
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const dateStr = `${dd}.${mm}.${yyyy}`;
      
      const info = getSubscriptionDaysLeft(org.SubscriptionEndsAt);
      return new Date(org.SubscriptionEndsAt) > new Date()
        ? `Действует до ${dateStr} (${info.text})`
        : `Истекла ${dateStr} (${info.text})`;
    },
    whatsappPayLink() {
      const orgName = this.userOrgName || "";
      const org = (this.store.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      let subInfoText = "";
      if (org) {
        const info = getSubscriptionDaysLeft(org.SubscriptionEndsAt);
        subInfoText = info.text;
      }
      const message = `Прошу продлить подписку ${orgName}. ${subInfoText}.`;
      const text = encodeURIComponent(message);
      return `https://wa.me/996500888268?text=${text}`;
    },
    orgMaxUsers() {
      if (!this.user) return 3;
      const org = (this.store.db.organizations || []).find(o => String(o.ID) === String(this.user.OrganizationID));
      return org ? (org.MaxUsers || 3) : 3;
    },
    orgEmployeesCount() {
      if (!this.user) return 0;
      return (this.store.db.users || []).filter(u => String(u.OrganizationID) === String(this.user.OrganizationID) && u.Status === 'Approved').length;
    },
    orgCalculatedPrice() {
      return this.calculateSubAmount(this.orgMaxUsers);
    }
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef);
    }
  },
  methods: {
    calculateSubAmount(maxUsers) {
      const limit = Number(maxUsers) || 3;
      if (limit <= 3) return 1500;
      return 1500 + (limit - 3) * 500;
    },
    open() {
      this.activeProfileTab = "personal";
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
