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
          class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden bg-indigo-600 shadow-indigo-200"
        >
          <i :class="store.appIcon || 'bi-car-front-fill'" class="text-white text-xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight font-heading">
          Auto Service Management - ASM ERP
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
        <!-- USERNAME -->
        <div>
          <label
            class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
            >Имя пользователя / Логин</label
          >
          <input
            v-model="authForm.username"
            type="text"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
            placeholder="Введите ваш логин"
          />
        </div>

        <!-- PASSWORD -->
        <div>
          <label
            class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2"
            >Пароль</label
          >
          <input
            v-model="authForm.password"
            type="password"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
            placeholder="••••••••"
            @keyup.enter="handleAuth"
          />
        </div>

        <!-- REGISTER SPECIFIC FIELDS -->
        <template v-if="authMode === 'register'">
          <div class="pt-2">
            <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Организация</label>
            <div class="flex gap-2 mb-3">
              <button
                type="button"
                @click="orgMode = 'join'"
                class="flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition"
                :class="orgMode === 'join' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'"
              >
                Выбрать сервис
              </button>
              <button
                type="button"
                @click="orgMode = 'create'"
                class="flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition"
                :class="orgMode === 'create' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'"
              >
                Создать новый
              </button>
            </div>

            <!-- Join existing organization -->
            <div v-if="orgMode === 'join'">
              <select
                v-model="selectedOrgId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-800"
              >
                <option value="">-- Выберите организацию --</option>
                <option v-for="org in organizations" :key="org.id" :value="org.id">
                  {{ org.name }}
                </option>
              </select>
            </div>

            <!-- Create new organization -->
            <div v-else>
              <input
                v-model="newOrgName"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-semibold text-slate-800 placeholder-slate-400"
                placeholder="Название нового автосервиса"
              />
            </div>
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
          v-if="authMode === 'register' && orgMode === 'join'"
          class="text-xs text-center text-slate-400 mt-4 leading-relaxed font-medium"
        >
          После регистрации ваш аккаунт должен быть подтверждён
          руководителем выбранной организации.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import { getOrganizations } from "../services/api";

export default {
  data() {
    return {
      authMode: "login",
      authForm: { username: "", password: "" },
      orgMode: "join",
      selectedOrgId: "",
      newOrgName: "",
      organizations: [],
      authLoading: false,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
  },
  watch: {
    authMode(val) {
      if (val === "register") {
        this.fetchOrganizations();
      }
    }
  },
  mounted() {
    if (this.authMode === "register") {
      this.fetchOrganizations();
    }
  },
  methods: {
    async fetchOrganizations() {
      try {
        this.organizations = await getOrganizations();
      } catch (e) {
        console.error("Не удалось загрузить список организаций:", e);
      }
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
          await store.login(loginUser, this.authForm.password);
        } else {
          const orgValue = this.orgMode === "create" ? this.newOrgName : this.selectedOrgId;
          await store.register(loginUser, this.authForm.password, this.orgMode, orgValue);
          this.authMode = "login";
          this.authForm.password = "";
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
