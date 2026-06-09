<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 backdrop-blur-xl transition-all duration-500 p-4 font-sans"
  >
    <!-- Hidden File Inputs for Local Uploads -->
    <input
      type="file"
      ref="logoFileInput"
      @change="onLogoFileChange"
      accept="image/*"
      class="hidden"
    />
    <input
      type="file"
      ref="bannerFileInput"
      @change="onBannerFileChange"
      accept="image/*"
      class="hidden"
    />

    <!-- Ambient backgrounds -->
    <div
      class="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    ></div>
    <div
      class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
    ></div>

    <div
      class="w-full max-w-lg bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-2xl z-20 relative flex flex-col items-center text-center transform scale-100 transition-all max-h-[95vh] overflow-y-auto"
    >
      <!-- Loading state if both title and text are not yet ready -->
      <div v-if="!welcomeTitle && !welcomeText" class="w-full py-16 flex flex-col items-center justify-center space-y-4">
        <div class="spinner-border text-indigo-600 border-4 border-t-indigo-200 rounded-full animate-spin" style="width: 2.5rem; height: 2.5rem;" role="status"></div>
        <p class="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Загрузка приветствия...
        </p>
      </div>

      <template v-else>
        <!-- Edit trigger for Master and Superadmin -->
        <button
          v-if="isAllowedToEdit && !isEditing"
          @click="startEdit"
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition border-none bg-transparent cursor-pointer"
          title="Редактировать приветствие и брендинг"
          id="btn-edit-welcome-screen"
        >
          <i class="bi bi-pencil-square text-base"></i>
        </button>

        <!-- Glowing Interactive Keycap/Icon (Static state) -->
        <div
          v-if="!isEditing"
          class="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-4 relative overflow-hidden animate-bounce select-none shrink-0"
          :class="store.logoUrl ? '' : 'bg-indigo-600 shadow-indigo-200/50 text-white'"
        >
          <img v-if="store.logoUrl" :src="store.logoUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="App Logo" />
          <i v-else :class="store.appIcon || 'bi-car-front-fill'" class="text-3xl"></i>
          <span
            class="absolute inline-flex h-full w-full rounded-2xl bg-indigo-400 opacity-25 animate-ping z-[-1]"
          ></span>
        </div>

        <!-- Editing panel container -->
        <div v-if="isEditing" class="w-full space-y-4 mb-4 select-none text-left animate-fade-in pr-1">
          <div class="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 mb-2">
            <i class="bi bi-palette2 text-indigo-500"></i>
            <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest leading-none m-0">
              Брендинг и Приветствие (ERP)
            </h3>
          </div>

          <!-- Title Input -->
          <div>
            <label class="block text-[10px] font-black text-slate-405 uppercase tracking-widest mb-1.5">
              Заголовок приветствия
            </label>
            <input
              v-model="editedTitle"
              type="text"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl font-bold text-slate-805 text-xs outline-none transition-all font-sans"
              placeholder="Добро пожаловать!"
            />
          </div>

          <!-- Welcome message description text -->
          <div>
            <label class="block text-[10px] font-black text-slate-405 uppercase tracking-widest mb-1.5">
              Текст приветствия
            </label>
            <textarea
              v-model="editedText"
              rows="3"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl font-semibold text-slate-700 text-xs outline-none transition-all font-sans resize-none"
              placeholder="Введите текст приветствия..."
            ></textarea>
          </div>

          <!-- Divider -->
          <div class="border-t border-slate-100 my-2"></div>

          <!-- Icon configuration & Presets -->
          <div>
            <label class="block text-[10px] font-black text-slate-405 uppercase tracking-widest mb-1.5">
              Иконка приложения (Launcher Icon)
            </label>
            <!-- Presets grid -->
            <div class="grid grid-cols-5 gap-2 mb-2">
              <button
                v-for="icon in presetIcons"
                :key="icon.class"
                type="button"
                @click="editedAppIcon = icon.class"
                class="h-10 border rounded-xl flex flex-col items-center justify-center transition cursor-pointer"
                :class="editedAppIcon === icon.class ? 'border-indigo-505 bg-indigo-50/75 text-indigo-600 font-bold' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
                :title="icon.label"
              >
                <i :class="icon.class" class="text-base"></i>
              </button>
            </div>
          </div>

          <!-- Logo Upload container -->
          <div>
            <label class="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Логотип (заменяет иконку)</span>
              <button 
                v-if="editedLogoUrl" 
                type="button" 
                @click="editedLogoUrl = ''" 
                class="text-[9px] text-red-500 font-black uppercase hover:underline border-none bg-transparent cursor-pointer"
              >
                Сбросить
              </button>
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="triggerLogoUpload"
                class="px-3 py-2 bg-slate-50 border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-600 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
              >
                <i class="bi bi-upload text-indigo-500"></i>
                <span>Загрузить лого</span>
              </button>
              <input
                v-model="editedLogoUrl"
                type="text"
                class="w-3/5 px-2 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-[10px] font-medium outline-none text-slate-600"
                placeholder="Или вставьте URL логотипа"
              />
            </div>
            <!-- Logo Preview -->
            <div v-if="editedLogoUrl" class="mt-2 flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-150">
              <img :src="editedLogoUrl" class="w-8 h-8 rounded-lg object-cover" referrerpolicy="no-referrer" alt="Custom Logo preview" />
              <span class="text-[10px] text-emerald-600 font-bold">Логотип применен</span>
            </div>
          </div>

          <!-- Banner configure & Upload -->
          <div>
            <label class="block text-[10px] font-black text-slate-450 uppercase tracking-widest mb-1.5 flex justify-between">
              <span>Главная картинка приветствия</span>
              <button 
                v-if="editedWelcomeBannerUrl" 
                type="button" 
                @click="editedWelcomeBannerUrl = ''" 
                class="text-[9px] text-red-500 font-black uppercase hover:underline border-none bg-transparent cursor-pointer"
              >
                Сбросить
              </button>
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                @click="triggerBannerUpload"
                class="px-3 py-2 bg-slate-50 border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-600 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center"
              >
                <i class="bi bi-image text-indigo-500"></i>
                <span>Загрузить главную картинку</span>
              </button>
              <input
                v-model="editedWelcomeBannerUrl"
                type="text"
                class="w-3/5 px-2 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-[10px] font-medium outline-none text-slate-600"
                placeholder="Или вставьте URL картинки"
              />
            </div>
            <!-- Banner preview image -->
            <div v-if="editedWelcomeBannerUrl" class="mt-2 rounded-xl overflow-hidden border border-slate-200 aspect-video h-16 bg-slate-100 shadow-inner">
              <img :src="editedWelcomeBannerUrl" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Banner preview" />
            </div>
          </div>

          <!-- Buttons Row -->
          <div class="flex items-center gap-2 pt-2.5">
            <button
              @click="cancelEdit"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition border-none cursor-pointer"
            >
              Отмена
            </button>
            <button
              @click="saveWelcomeData"
              class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition border-none shadow-sm shadow-indigo-150 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
        </div>

        <!-- Static display panel -->
        <template v-else>
          <h1
            class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1 font-heading"
          >
            {{ welcomeTitle }}
          </h1>

          <p
            class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-4 inline-flex items-center gap-1 bg-indigo-50/70 border border-indigo-100/50 px-2.5 py-1 rounded-full select-none"
          >
            <i class="bi bi-check-circle-fill text-indigo-500 text-[11px]"></i>
            Auto Service Management - ASM ERP
          </p>

          <!-- Divider banner image -->
          <div class="w-full relative rounded-2xl overflow-hidden mb-5 border border-slate-200/80 shadow-md aspect-video h-40 bg-slate-150 select-none">
            <img 
              :src="bannerSrc" 
              @error="handleBannerImageError"
              class="w-full h-full object-cover rounded-2xl" 
              referrerpolicy="no-referrer"
              alt="Welcome Banner"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent"></div>
            <!-- Diagnostics Electrics branding tag overlaid -->
            <span class="absolute bottom-2.5 left-2.5 text-[8.5px] font-black text-white/90 uppercase tracking-widest bg-slate-905/70 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 flex items-center gap-1 shadow-sm">
              <i class="bi bi-activity text-indigo-400 animate-pulse"></i>
              <span>Автоэлектрика & Сервисный Учет</span>
            </span>
          </div>

          <!-- Brief Description / Welcome Text -->
          <div
            class="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl text-slate-600 text-xs font-semibold mb-5 leading-relaxed text-center w-full max-h-[160px] overflow-y-auto"
            style="white-space: pre-line;"
          >
            {{ welcomeText }}
          </div>
        </template>

        <!-- App version & diagnostics section -->
        <div class="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 font-bold mb-5 select-none font-mono">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200/60 font-black">
            v2.6.0-Release
          </span>
          <span class="text-slate-350">•</span>
          <span class="text-slate-500 uppercase tracking-wider">ASM ERP Core</span>
          <template v-if="user">
            <span class="text-slate-350">•</span>
            <span class="text-indigo-600 uppercase tracking-wider font-extrabold">
              {{
                user.Role === "Superadmin"
                  ? "Супер-админ"
                  : user.Role === "SenMaster"
                    ? "Ст. мастер"
                    : "Мастер"
              }}
            </span>
          </template>
        </div>

        <!-- Enter / Get Started Button -->
        <button
          @click="dismiss"
          class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold tracking-wide transition-all duration-300 shadow-md shadow-indigo-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2 outline-none focus:outline-none select-none"
          id="btn-close-welcome-screen"
        >
          <span>Начать работу</span>
          <i class="bi bi-arrow-right font-extrabold"></i>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../store";

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      isEditing: false,
      bannerImageErrorCount: 0,
      editedTitle: "",
      editedText: "",
      editedLogoUrl: "",
      editedWelcomeBannerUrl: "",
      editedAppIcon: "",
      presetIcons: [
        { class: "bi-car-front-fill", label: "Автомобиль" },
        { class: "bi-lightning-charge-fill", label: "Электрика" },
        { class: "bi-cpu-fill", label: "ЭБУ / Мозг" },
        { class: "bi-wrench-adjustable", label: "Инструменты" },
        { class: "bi-activity", label: "Диагностика" }
      ]
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    isAllowedToEdit() {
      // Allow masters, senior masters and supreme admins
      return this.user && (
        this.user.Role === "Superadmin" || 
        this.user.Role === "Master" || 
        this.user.Role === "SenMaster"
      );
    },
    welcomeTitle() {
      const screen = this.store.db.welcomescreens?.find((s) => s.ID === "welcome_main") || this.store.db.welcomescreens?.[0];
      if (screen && screen.Title) return screen.Title;
      return localStorage.getItem("welcome_screen_title") || "Добро пожаловать!";
    },
    welcomeText() {
      const screen = this.store.db.welcomescreens?.find((s) => s.ID === "welcome_main") || this.store.db.welcomescreens?.[0];
      if (screen && screen.Text) return screen.Text;
      return localStorage.getItem("welcome_screen_text") || "ASM ERP — система для учета и автоматизации процессов автосервиса и автодиагностики.";
    },
    bannerSrc() {
      if (this.store.welcomeBannerUrl) {
        return this.store.welcomeBannerUrl;
      }
      if (this.bannerImageErrorCount > 0) {
        // Fallback Unsplash image if local asset fails to load
        return "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1280&q=80";
      }
      return "./welcome_banner.jpg";
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.isEditing = false;
        }
      },
    },
    welcomeTitle: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          localStorage.setItem("welcome_screen_title", newVal);
        }
      },
    },
    welcomeText: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          localStorage.setItem("welcome_screen_text", newVal);
        }
      },
    },
  },
  methods: {
    handleBannerImageError() {
      this.bannerImageErrorCount++;
    },
    dismiss() {
      this.$emit("close");
    },
    startEdit() {
      this.editedTitle = this.welcomeTitle;
      this.editedText = this.welcomeText;
      this.editedLogoUrl = this.store.logoUrl;
      this.editedWelcomeBannerUrl = this.store.welcomeBannerUrl;
      this.editedAppIcon = this.store.appIcon;
      this.isEditing = true;
    },
    cancelEdit() {
      this.isEditing = false;
    },
    triggerLogoUpload() {
      this.$refs.logoFileInput.click();
    },
    triggerBannerUpload() {
      this.$refs.bannerFileInput.click();
    },
    onLogoFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          this.store.showToast("Изображение логотипа слишком большое (макс. 2МБ)", "error");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.editedLogoUrl = e.target.result;
          this.store.showToast("Логотип успешно загружен локально!");
        };
        reader.readAsDataURL(file);
      }
    },
    onBannerFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          this.store.showToast("Изображение баннера слишком большое (макс. 5МБ)", "error");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.editedWelcomeBannerUrl = e.target.result;
          this.store.showToast("Картинка приветствия успешно загружена локально!");
        };
        reader.readAsDataURL(file);
      }
    },
    async saveWelcomeData() {
      const t = this.editedTitle.trim();
      const m = this.editedText.trim();
      if (!t) {
        this.store.showToast("Заголовок не может быть пустым", "error");
        return;
      }
      if (!m) {
        this.store.showToast("Текст приветствия не может быть пустым", "error");
        return;
      }
      
      // Save branding parameters to Pinia state/local storage
      this.store.updateBranding(this.editedLogoUrl, this.editedWelcomeBannerUrl, this.editedAppIcon);

      // Sync to local storage fallback
      localStorage.setItem("welcome_screen_title", t);
      localStorage.setItem("welcome_screen_text", m);

      try {
        const screen = this.store.db.welcomescreens?.find((s) => s.ID === "welcome_main") || this.store.db.welcomescreens?.[0];
        if (screen) {
          await this.store.dispatchSync(
            "updateRow",
            { ID: screen.ID, Title: t, Text: m, _role: this.user?.Role, _userId: this.user?.ID },
            "WelcomeScreens"
          );
        } else {
          await this.store.dispatchSync(
            "addRow",
            { ID: "welcome_main", Title: t, Text: m, _role: this.user?.Role, _userId: this.user?.ID },
            "WelcomeScreens"
          );
        }
        this.isEditing = false;
        this.store.showToast("Брендинг и информация сохранены успешно!");
      } catch (err) {
        console.error(err);
        this.isEditing = false;
        this.store.showToast("Сохранено на устройстве локально.", "success");
      }
    },
  },
};
</script>
