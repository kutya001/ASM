<template>
  <div
    class="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4"
  >
    <!-- Decorative BG Elements -->
    <div
      class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    ></div>
    <div
      class="absolute top-40 -left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
    ></div>

    <div
      class="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 z-10 relative"
    >
      <div class="flex items-center gap-3 mb-8 justify-center select-none">
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden"
          :class="store.logoUrl ? '' : 'bg-indigo-600 shadow-indigo-200'"
        >
          <img v-if="store.logoUrl" :src="store.logoUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="App Logo" />
          <i v-else :class="store.appIcon || 'bi-car-front-fill'" class="text-white text-xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight font-heading">
          Auto Service Managment - ASM ERP
        </h2>
      </div>

      <ul class="flex border-b border-slate-100 mb-6">
        <li class="flex-1 text-center">
          <button
            class="pb-3 px-4 font-bold text-sm w-full transition-colors"
            :class="
              authMode === 'login'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'
            "
            @click="authMode = 'login'"
          >
            Вход
          </button>
        </li>
        <li class="flex-1 text-center">
          <button
            class="pb-3 px-4 font-bold text-sm w-full transition-colors"
            :class="
              authMode === 'register'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'
            "
            @click="authMode = 'register'"
          >
            Регистрация
          </button>
        </li>
      </ul>

      <div class="space-y-4">
        <!-- USERNAME MANUAL INPUT -->
        <div>
          <label
            class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
            >Имя пользователя / Логин</label
          >
          <input
            v-model="authForm.username"
            type="text"
            class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
            placeholder="Введите ваш логин"
          />
        </div>

        <div>
          <label
            class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
            >Пароль</label
          >
          <input
            v-model="authForm.password"
            type="password"
            class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
            placeholder="••••••••"
            @keyup.enter="handleAuth"
          />
        </div>

        <template v-if="authMode === 'register'">
          <div>
            <label
              class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
              >ФИО (Полное имя)</label
            >
            <input
              v-model="authForm.name"
              type="text"
              class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <label
              class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
              >Номер телефона</label
            >
            <input
              v-model="authForm.phone"
              type="tel"
              @input="onPhoneInput"
              class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
              placeholder="+996 XXX XXX XXX"
            />
          </div>
        </template>

        <button
          @click="handleAuth"
          :disabled="authLoading"
          class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 flex justify-center items-center gap-2 cursor-pointer"
        >
          <span
            v-if="authLoading"
            class="spinner-border spinner-border-sm text-white"
          ></span>
          <span v-else>{{
            authMode === "login" ? "Войти в систему" : "Создать аккаунт"
          }}</span>
        </button>

        <p
          v-if="authMode === 'register'"
          class="text-xs text-center text-slate-400 mt-4 leading-relaxed font-medium"
        >
          После регистрации аккаунт должен быть подтверждён
          Супер-администратором.
        </p>
      </div>


    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { runGS } from "../services/api";
import { formatPhoneInput } from "../utils/helpers";

export default {
  data() {
    return {
      authMode: "login",
      authForm: { username: "", password: "", name: "", phone: "+996 " },
      authLoading: false,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
  },
  methods: {

    onPhoneInput() {
      this.authForm.phone = formatPhoneInput(this.authForm.phone);
    },
    async handleAuth() {
      const store = useMainStore();
      this.authLoading = true;
      try {
        let loginUser = this.authForm.username;

        if (!loginUser) throw new Error("Пожалуйста, введите логин.");
        if (!this.authForm.password)
          throw new Error("Пожалуйста, введите пароль.");

        if (this.authMode === "login") {
          let res = await runGS("loginUser", loginUser, this.authForm.password);
          store.user = res;
          localStorage.setItem("currentUser", JSON.stringify(res));
          store.showToast(
            `Успешный вход. Привет, ${res.Name || res.Username}!`,
          );
          store.loadInitialData();
        } else {
          if (!this.authForm.name)
            throw new Error("Пожалуйста, введите ваше полное имя.");
          if (!this.authForm.phone)
            throw new Error("Пожалуйста, введите ваш номер телефона.");

          let res = await runGS(
            "registerUser",
            loginUser,
            this.authForm.password,
            this.authForm.name,
            this.authForm.phone,
          );
          store.showToast(res.message);
          this.authMode = "login";
        }
      } catch (e) {
        store.showToast(e.message, "error");
      } finally {
        this.authLoading = false;
      }
    },
  },
};
</script>
