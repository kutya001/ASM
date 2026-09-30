<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in text-left select-none"
      @click.self="close"
    >
      <div
        class="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden text-slate-800 relative z-[100000]"
      >
        <!-- HEADER -->
        <div class="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <i class="bi bi-whatsapp text-xl"></i>
            </div>
            <div class="min-w-0">
              <h3 class="text-base sm:text-lg font-black text-slate-900 leading-tight m-0 font-heading">
                WhatsApp и гарантийный чек
              </h3>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-semibold">
                <span class="inline-flex items-center gap-1 text-indigo-600 font-bold truncate">
                  <i class="bi bi-building text-[11px]"></i>
                  {{ resolvedOrgName }}
                </span>
                <span class="text-slate-300">•</span>
                <span class="font-mono text-slate-800 font-black uppercase shrink-0">{{ recordCarNumber }}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="close"
            class="w-9 h-9 rounded-xl bg-white border border-slate-200/70 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
            title="Закрыть"
          >
            <span class="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        <!-- BODY SCROLLABLE -->
        <div class="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <!-- CLIENT & CAR SUMMARY STRIP -->
          <div class="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 font-bold shadow-xs">
                <i class="bi bi-person-fill text-sm"></i>
              </div>
              <div>
                <div class="font-bold text-slate-900 text-sm leading-tight">
                  {{ record?.ClientName || 'Без имени' }}
                </div>
                <div class="text-[11px] text-slate-500 font-mono font-semibold mt-0.5">
                  {{ clientPhoneFormatted || 'Номер не указан' }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 shadow-xs">
              <i class="bi bi-car-front-fill text-indigo-600 text-xs"></i>
              <span class="font-bold text-slate-800">{{ recordCarTitle }}</span>
            </div>
          </div>

          <!-- OPTION 1: ПРОСТОЙ ПЕРЕХОД В WHATSAPP -->
          <div class="p-3.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/20 hover:bg-emerald-50/40 transition-all shadow-xs flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <i class="bi bi-chat-dots-fill text-base"></i>
              </div>
              <div class="min-w-0">
                <div class="text-xs font-black uppercase tracking-wider text-slate-900">
                  Простой переход в чат
                </div>
                <div class="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Быстро открыть чат в WhatsApp без шаблона чека
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="openDirectChat"
              :disabled="!hasValidPhone"
              class="h-9 px-4 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Перейти в диалог без текста"
            >
              <i class="bi bi-box-arrow-up-right text-xs"></i>
              <span>Перейти в чат</span>
            </button>
          </div>

          <!-- OPTION 2: ГАРАНТИЙНЫЙ ЧЕК -->
          <div class="p-3.5 sm:p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/25 space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 text-xl">verified</span>
                <div>
                  <span class="text-xs font-black uppercase tracking-wider text-slate-900 block leading-tight">
                    Гарантийный чек организации
                  </span>
                  <span class="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    Официальный чек с перечнем работ и настраиваемой гарантией
                  </span>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-100/80 text-indigo-700 shrink-0">
                {{ resolvedOrgName }}
              </span>
            </div>

            <!-- НАСТРОЙКА СРОКА ГАРАНТИИ (МЕСЯЦЫ) -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-800 flex items-center gap-1.5">
                  <i class="bi bi-shield-check text-indigo-600 text-sm"></i>
                  Срок гарантии:
                </span>
                <span class="font-black text-indigo-600 font-heading text-sm">
                  {{ warrantyMonths }} {{ getMonthWord(warrantyMonths) }}
                  <span v-if="warrantyMonths === 6" class="text-xs font-semibold text-slate-400 font-sans ml-1">(полгода)</span>
                  <span v-else-if="warrantyMonths === 12" class="text-xs font-semibold text-slate-400 font-sans ml-1">(1 год)</span>
                </span>
              </div>

              <!-- Quick Pill Selectors (5 buttons neatly spaced) -->
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="preset in [1, 3, 5, 6, 12]"
                  :key="preset"
                  type="button"
                  @click="warrantyMonths = preset"
                  class="py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border text-center flex flex-col items-center justify-center"
                  :class="warrantyMonths === preset
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80'"
                >
                  <span class="leading-none">{{ preset }} мес</span>
                  <span v-if="preset === 6" class="text-[9px] opacity-75 font-normal leading-none mt-1">полгода</span>
                  <span v-else-if="preset === 12" class="text-[9px] opacity-75 font-normal leading-none mt-1">1 год</span>
                </button>
              </div>

              <!-- Custom Months Stepper & Input -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span class="text-slate-500 font-semibold text-[11px]">Другой срок (месяцев):</span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="decrementMonth"
                    :disabled="warrantyMonths <= 1"
                    class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border-none"
                  >
                    -
                  </button>
                  <input
                    v-model.number="warrantyMonths"
                    type="number"
                    min="1"
                    max="60"
                    class="w-14 h-8 text-center font-bold font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-800"
                  />
                  <button
                    type="button"
                    @click="incrementMonth"
                    :disabled="warrantyMonths >= 60"
                    class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border-none"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Calculated Valid Until Date Banner -->
              <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <span class="text-emerald-800 font-bold text-[11px] flex items-center gap-1.5">
                  <i class="bi bi-calendar-check-fill text-emerald-600"></i>
                  Гарантия действует до:
                </span>
                <span class="font-black text-emerald-700 font-mono text-xs">
                  {{ warrantyValidUntil }}
                </span>
              </div>
            </div>

            <!-- LIVE PREVIEW OF THE RECEIPT -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-600 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <i class="bi bi-chat-quote-fill text-indigo-500"></i>
                  Предпросмотр сообщения клиенту
                </span>
                <button
                  type="button"
                  @click="copyReceiptText"
                  class="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                >
                  <i class="bi" :class="isCopied ? 'bi-check-all text-emerald-600' : 'bi-clipboard'"></i>
                  <span>{{ isCopied ? 'Скопировано!' : 'Копировать текст' }}</span>
                </button>
              </div>

              <!-- WhatsApp Chat Message Simulation Bubble -->
              <div class="bg-[#efeae2] p-3 rounded-2xl border border-slate-200/80 shadow-inner">
                <div class="bg-white rounded-2xl p-3.5 shadow-sm max-w-full text-slate-900 border border-emerald-100 font-sans relative">
                  <div class="absolute -top-1.5 left-4 w-3 h-3 bg-white rotate-45 border-l border-t border-emerald-100"></div>

                  <pre class="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 m-0 break-words select-text">{{ generatedReceiptText }}</pre>

                  <!-- Bubble footer status -->
                  <div class="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-400 font-mono">
                    <span>{{ currentTimeString }}</span>
                    <i class="bi bi-check2-all text-indigo-500"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PHONE WARNING IF NO PHONE -->
          <div
            v-if="!hasValidPhone"
            class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-base text-amber-600">error</span>
            <span>У этой записи не указан номер телефона. Вы можете скопировать текст чека вручную.</span>
          </div>
        </div>

        <!-- FOOTER ACTIONS -->
        <div class="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            @click="close"
            class="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
          >
            Закрыть
          </button>

          <div class="flex items-center gap-2">
            <!-- Copy Button -->
            <button
              type="button"
              @click="copyReceiptText"
              class="h-10 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Скопировать текст в буфер обмена"
            >
              <i class="bi" :class="isCopied ? 'bi-check-all text-emerald-600' : 'bi-clipboard'"></i>
              <span>{{ isCopied ? 'Скопировано!' : 'Копировать' }}</span>
            </button>

            <!-- Primary Send Button -->
            <button
              type="button"
              @click="sendWarrantyReceipt"
              :disabled="!hasValidPhone"
              class="h-10 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <i class="bi bi-whatsapp text-sm"></i>
              <span>Отправить чек</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { useMainStore } from "../../store";
import { formatDate } from "../../utils/helpers";

export default {
  name: "WhatsAppReceiptModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["close"],
  data() {
    return {
      warrantyMonths: 6, // Default: 6 months (полгода)
      isCopied: false,
      copyTimeout: null,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    resolvedOrgName() {
      if (!this.record) return "Автосервис";
      const orgId = this.record.OrganizationID || (this.store.user && this.store.user.OrganizationID);
      if (this.store.db && this.store.db.organizations && orgId) {
        const found = this.store.db.organizations.find(
          (o) => String(o.ID) === String(orgId)
        );
        if (found && found.Name) return found.Name;
      }
      if (this.store.user && this.store.user.OrganizationName) {
        return this.store.user.OrganizationName;
      }
      return "Автосервис";
    },
    recordCarNumber() {
      return this.record?.CarNumber || "БЕЗ ГОСНОМЕРА";
    },
    recordCarTitle() {
      if (!this.record) return "Автомобиль";
      const brand = this.getBrandName(this.record.BrandID);
      const model = this.getModelName(this.record.ModelID);
      const parts = [brand, model].filter(Boolean);
      return parts.length > 0 ? parts.join(" ") : "Автомобиль";
    },
    cleanPhone() {
      if (!this.record || !this.record.Phone) return "";
      let cleaned = String(this.record.Phone).replace(/\D/g, "");
      if (cleaned.startsWith("996")) {
        if (cleaned.length >= 9) {
          cleaned = cleaned.slice(-9);
        }
      } else if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length > 9) {
        cleaned = cleaned.slice(-9);
      }
      return cleaned.length === 9 ? "996" + cleaned : cleaned;
    },
    hasValidPhone() {
      return Boolean(this.cleanPhone && this.cleanPhone.length >= 9);
    },
    clientPhoneFormatted() {
      if (!this.cleanPhone) return "";
      if (this.cleanPhone.startsWith("996") && this.cleanPhone.length === 12) {
        const c = this.cleanPhone;
        return `+996 (${c.slice(3, 6)}) ${c.slice(6, 9)}-${c.slice(9, 12)}`;
      }
      return "+" + this.cleanPhone;
    },
    baseDate() {
      if (this.record && this.record.StartTime) {
        const d = new Date(this.record.StartTime);
        if (!isNaN(d.getTime())) return d;
      }
      return new Date();
    },
    recordDateFormatted() {
      const dt = formatDate(this.baseDate.toISOString());
      return `${dt.date} ${dt.time}`.trim();
    },
    warrantyValidUntil() {
      const d = new Date(this.baseDate);
      const months = Number(this.warrantyMonths) || 6;
      d.setMonth(d.getMonth() + months);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    },
    parsedServices() {
      if (!this.record) return [];
      let list = [];
      if (this.record.ServicesJSON) {
        try {
          list = typeof this.record.ServicesJSON === "string"
            ? JSON.parse(this.record.ServicesJSON || "[]")
            : this.record.ServicesJSON;
        } catch (e) {
          list = [];
        }
      }
      if (!Array.isArray(list) || list.length === 0) return [];

      return list.map((item) => {
        if (typeof item === "object" && item !== null) {
          return {
            name: item.name || "Услуга",
            price: Number(item.price) || 0,
          };
        }
        const srv = (this.store.db.services || []).find((s) => s.ID === item);
        return {
          name: srv ? srv.Name : "Услуга",
          price: srv ? Number(srv.Price) || 0 : 0,
        };
      });
    },
    totalAmount() {
      if (this.record && this.record.TotalAmount != null && this.record.TotalAmount !== "") {
        return Number(this.record.TotalAmount) || 0;
      }
      return this.parsedServices.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    },
    isPaidStatus() {
      const isPaid = this.record?.IsPaid === true || String(this.record?.IsPaid).toUpperCase() === "TRUE";
      return isPaid ? "Оплачено полностью ✅" : "Ожидает оплаты ⏳";
    },
    currentTimeString() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    },
    orderNumber() {
      if (!this.record || !this.record.ID) return "—";
      const id = String(this.record.ID);
      return id.length > 8 ? id.slice(0, 8).toUpperCase() : id;
    },
    generatedReceiptText() {
      const org = this.resolvedOrgName;
      const order = this.orderNumber;
      const date = this.recordDateFormatted;
      const car = this.recordCarTitle;
      const plate = this.recordCarNumber;
      const client = this.record?.ClientName || "Клиент";
      const phone = this.clientPhoneFormatted || "—";
      const master = this.getMasterName(this.record?.MasterID);
      const total = Number(this.totalAmount).toLocaleString();
      const status = this.isPaidStatus;
      const months = this.warrantyMonths;
      const monthWord = this.getMonthWord(months);
      const validUntil = this.warrantyValidUntil;

      let servicesBlock = "";
      if (this.parsedServices.length > 0) {
        servicesBlock = this.parsedServices
          .map((s) => `• ${s.name} — ${Number(s.price || 0).toLocaleString()} KGS`)
          .join("\n");
      } else {
        servicesBlock = "• Комплексное техническое обслуживание";
      }

      return `🧾 *ГАРАНТИЙНЫЙ ЧЕК — ${org}*
━━━━━━━━━━━━━━━━━━━━━
📋 *Заказ-наряд №:* #${order}
📅 *Дата:* ${date}

🚗 *Автомобиль:* ${car}
🔢 *Госномер:* ${plate}
👤 *Клиент:* ${client}
📞 *Телефон:* ${phone}
👨‍🔧 *Мастер:* ${master}

🛠️ *ВЫПОЛНЕННЫЕ РАБОТЫ И ЗАПЧАСТИ:*
${servicesBlock}

💰 *ИТОГО:* ${total} KGS
💳 *Статус оплаты:* ${status}
━━━━━━━━━━━━━━━━━━━━━
🛡️ *ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА:*
• Срок гарантии: *${months} ${monthWord}*
• Гарантия действует до: *${validUntil}*

_Гарантия распространяется на выполненные работы и установленные запчасти при условии соблюдения правил технической эксплуатации автомобиля._

📍 *${org}*
Спасибо, что доверяете нам свой автомобиль! 🤝`;
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    getBrandName(id) {
      if (!this.store.db || !this.store.db.brands) return "";
      const b = this.store.db.brands.find((x) => x.ID == id);
      return b ? b.Name : "";
    },
    getModelName(id) {
      if (!this.store.db || !this.store.db.models) return "";
      const m = this.store.db.models.find((x) => x.ID == id);
      return m ? m.Name : "";
    },
    getMasterName(id) {
      if (!this.store.db || !this.store.db.users) return "Мастер";
      const u = this.store.db.users.find((x) => x.ID == id);
      return u ? u.Name || u.Username : "Дежурный специалист";
    },
    getMonthWord(n) {
      n = Math.abs(Number(n) || 0) % 100;
      const n1 = n % 10;
      if (n > 10 && n < 20) return "месяцев";
      if (n1 > 1 && n1 < 5) return "месяца";
      if (n1 === 1) return "месяц";
      return "месяцев";
    },
    incrementMonth() {
      if (this.warrantyMonths < 60) {
        this.warrantyMonths += 1;
      }
    },
    decrementMonth() {
      if (this.warrantyMonths > 1) {
        this.warrantyMonths -= 1;
      }
    },
    openDirectChat() {
      if (!this.hasValidPhone) return;
      const url = `https://wa.me/${this.cleanPhone}`;
      window.open(url, "_blank");
      this.close();
    },
    sendWarrantyReceipt() {
      if (!this.hasValidPhone) return;
      const encoded = encodeURIComponent(this.generatedReceiptText);
      const url = `https://wa.me/${this.cleanPhone}?text=${encoded}`;
      window.open(url, "_blank");
      this.close();
    },
    async copyReceiptText() {
      try {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.generatedReceiptText);
        } else {
          const ta = document.createElement("textarea");
          ta.value = this.generatedReceiptText;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        this.isCopied = true;
        if (this.copyTimeout) clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => {
          this.isCopied = false;
        }, 2500);
      } catch (e) {
        console.error("Failed to copy receipt text:", e);
      }
    },
  },
};
</script>
