<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none"
  >
    <div
      class="bg-[#0F1424] border border-indigo-500/30 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
    >
      <!-- Glow background accent -->
      <div
        class="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-600/15 rounded-full filter blur-2xl pointer-events-none"
      ></div>

      <!-- Header with warning icon -->
      <div class="flex flex-col items-center text-center space-y-3 mb-6">
        <div
          class="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10"
        >
          <span class="material-symbols-outlined text-[30px]">warning</span>
        </div>
        <div>
          <h3 class="text-base font-black uppercase tracking-wider text-white font-heading m-0">
            Заполните данные профиля
          </h3>
          <p class="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
            Внимание! Для продолжения работы в системе необходимо завершить регистрацию и указать ваше имя и номер телефона.
          </p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSave" class="space-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            Ваше полное имя (ФИО) <span class="text-rose-400">*</span>
          </label>
          <input
            ref="nameInput"
            v-model="form.name"
            type="text"
            required
            placeholder="Например: Адилет Сатыбалдиев"
            class="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-sm text-slate-100 placeholder-slate-500"
          />
        </div>

        <!-- Phone Number with fixed +996 prefix -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
            Номер телефона <span class="text-rose-400">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              v-model="form.phone"
              @input="onPhoneInput"
              type="tel"
              required
              placeholder="+996 (___) __-__-__"
              class="w-full h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-sm text-slate-100 placeholder-slate-500 font-mono tracking-wider"
            />
          </div>
          <span class="text-[10px] text-slate-500 font-semibold block mt-1 ml-1">
            Введите 9 цифр номера (код +996 уже установлен)
          </span>
        </div>

        <!-- Save Button -->
        <button
          type="submit"
          :disabled="isSaving || !isFormValid"
          class="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-650/20 mt-6 flex justify-center items-center gap-2 cursor-pointer border-none"
        >
          <span v-if="isSaving" class="spinner-border spinner-border-sm text-white"></span>
          <span v-else>Сохранить и продолжить</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { updateUserProfile } from "../../services/api";
import { formatPhoneInput } from "../../utils/helpers";

export default {
  name: "CompleteProfileModal",
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  emits: ["completed"],
  data() {
    return {
      form: {
        name: "",
        phone: "+996 ",
      },
      isSaving: false,
    };
  },
  computed: {
    isOpen() {
      if (!this.user) return false;
      // Superadmin doesn't need mandatory phone
      if (this.user.Role === "Superadmin") return false;

      const hasName = this.user.Name && String(this.user.Name).trim().length > 0;
      const cleanPhone = String(this.user.Phone || "").replace(/\D/g, "");
      // Kyrgyz phone number has 12 digits: 996 + 9 digits
      const hasValidPhone = cleanPhone.length === 12 && cleanPhone.startsWith("996");

      return !hasName || !hasValidPhone;
    },
    isFormValid() {
      const nameValid = this.form.name && this.form.name.trim().length >= 2;
      const cleanPhone = this.form.phone.replace(/\D/g, "");
      const phoneValid = cleanPhone.length === 12 && cleanPhone.startsWith("996");
      return nameValid && phoneValid;
    },
  },
  watch: {
    isOpen: {
      immediate: true,
      handler(val) {
        if (val) {
          if (this.user) {
            this.form.name = this.user.Name || "";
            this.form.phone = formatPhoneInput(this.user.Phone || "");
            if (!this.form.phone || this.form.phone === "+996") {
              this.form.phone = "+996 ";
            }
          }
          this.$nextTick(() => {
            if (this.$refs.nameInput) {
              this.$refs.nameInput.focus();
            }
          });
        }
      },
    },
  },
  methods: {
    onPhoneInput(e) {
      let val = e.target.value;
      let digits = val.replace(/\D/g, "");
      if (digits.startsWith("996")) {
        digits = digits.slice(3);
      }
      digits = digits.slice(0, 9); // limit to 9 subscriber digits
      
      let formatted = "+996";
      if (digits.length > 0) formatted += " " + digits.substring(0, 3);
      if (digits.length > 3) formatted += " " + digits.substring(3, 6);
      if (digits.length > 6) formatted += " " + digits.substring(6, 9);
      
      this.form.phone = formatted;
    },
    async handleSave() {
      if (!this.isFormValid || !this.user) return;
      this.isSaving = true;
      try {
        const cleanName = this.form.name.trim();
        const cleanPhone = this.form.phone.trim();

        await updateUserProfile(this.user.ID, null, cleanName, cleanPhone);

        // Update local user state
        this.user.Name = cleanName;
        this.user.Phone = cleanPhone;

        const stored = localStorage.getItem("currentUser");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            u.Name = cleanName;
            u.Phone = cleanPhone;
            localStorage.setItem("currentUser", JSON.stringify(u));
          } catch (e) {}
        }

        this.$emit("completed", { name: cleanName, phone: cleanPhone });
      } catch (err) {
        console.error("Failed to complete profile:", err);
        alert(err.message || "Ошибка при сохранении данных профиля");
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>
