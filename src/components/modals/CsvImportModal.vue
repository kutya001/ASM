<template>
  <div
    class="modal fade"
    id="csvImportModal"
    ref="modalRef"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div
        class="modal-content rounded-3xl border-0 shadow-2xl font-sans overflow-hidden bg-slate-50"
      >
        <!-- Modal Header -->
        <div class="modal-header border-b border-slate-100 px-6 py-4 bg-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">file_upload</span>
            </div>
            <div>
              <h5 class="modal-title font-bold text-slate-850 m-0 text-base">
                Импорт данных в справочники
              </h5>
              <p class="text-[11px] font-medium text-slate-400 m-0">
                Загрузка через CSV, вставку текста или сгенерированный AI-промпт
              </p>
            </div>
          </div>
          <button
            type="button"
            class="btn-close text-slate-400 focus:ring-0 shrink-0 border-none bg-transparent cursor-pointer"
            data-bs-dismiss="modal"
          ></button>
        </div>

        <!-- Mode / Tab switcher -->
        <div class="bg-slate-100/70 border-b border-slate-200/80 px-6 pt-2 pb-0 flex gap-2 overflow-x-auto">
          <button
            type="button"
            @click="activeModalTab = 'import'"
            class="px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-1.5"
            :class="activeModalTab === 'import' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
          >
            <span class="material-symbols-outlined text-[16px]">upload_file</span>
            Импорт CSV / Текст
          </button>
          <button
            type="button"
            @click="activeModalTab = 'ai_prompts'"
            class="px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-1.5"
            :class="activeModalTab === 'ai_prompts' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'"
          >
            <span class="material-symbols-outlined text-[16px]">psychology</span>
            Инструкция & AI-промпты
            <span class="text-[9px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded-full">AI</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <!-- TAB 1: CSV / TEXT IMPORT -->
          <div v-if="activeModalTab === 'import'" class="space-y-4">
            <!-- Controls bar -->
            <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <!-- Entity type -->
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Тип данных:</span>
                <select
                  v-model="entityType"
                  class="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold text-slate-750 outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="auto">⚡ Автоопределение</option>
                  <option value="cars">🚗 Автомобили (Марка;Модель)</option>
                  <option value="services">🔧 Услуги (Категория;Услуга;Цена)</option>
                  <option value="brands">🏷️ Только Марки</option>
                  <option value="categories">📁 Только Категории</option>
                </select>
              </div>

              <!-- Delimiter -->
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Разделитель:</span>
                <select
                  v-model="delimiter"
                  class="px-3 py-1.5 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold text-slate-750 outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="auto">Автовыбор</option>
                  <option value=";">Точка с запятой (;)</option>
                  <option value=",">Запятая (,)</option>
                  <option value="\t">Табуляция (Tab)</option>
                  <option value="|">Пайп (|)</option>
                </select>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref="fileInput"
                  accept=".csv,.txt,.tsv,.json"
                  class="hidden"
                  @change="handleFileUpload"
                />
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border-none cursor-pointer transition flex items-center gap-1.5 shadow-sm"
                >
                  <span class="material-symbols-outlined text-[15px]">attachment</span>
                  Выбрать файл (.csv, .txt)
                </button>
                <button
                  type="button"
                  v-if="rawInput"
                  @click="clearInput"
                  class="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 text-xs font-bold rounded-xl border-none bg-transparent cursor-pointer transition flex items-center gap-1"
                  title="Очистить поле"
                >
                  <span class="material-symbols-outlined text-[15px]">delete_sweep</span>
                  Очистить
                </button>
              </div>
            </div>

            <!-- Quick Template Chips -->
            <div class="flex items-center gap-2 flex-wrap text-xs">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Примеры:</span>
              <button
                type="button"
                @click="loadSample('cars')"
                class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold border border-indigo-150 transition cursor-pointer text-[11px]"
              >
                + Пример Audi (Марки и Модели)
              </button>
              <button
                type="button"
                @click="loadSample('services')"
                class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold border border-emerald-150 transition cursor-pointer text-[11px]"
              >
                + Пример Услуг СТО с ценами
              </button>
            </div>

            <!-- Input Textarea -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Вставьте текст или CSV данные
              </label>
              <textarea
                v-model="rawInput"
                class="w-full h-44 px-4 py-3 bg-white border border-slate-250 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-mono text-slate-800 resize-y shadow-sm leading-relaxed"
                :placeholder="inputPlaceholder"
              ></textarea>
            </div>

            <!-- Real-time Pre-flight Analysis Card -->
            <div v-if="rawInput.trim()" class="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-indigo-600 text-[18px]">analytics</span>
                  Предварительная проверка (Pre-flight check)
                </span>
                <span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Тип: {{ detectedEntityLabel }} | Разделитель: "{{ activeDelimiterDisplay }}"
                </span>
              </div>

              <!-- Summary metric pills -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Всего строк</div>
                  <div class="text-base font-black text-slate-800 mt-0.5">{{ analysis.totalRows }}</div>
                </div>
                <div class="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-center">
                  <div class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Валидных</div>
                  <div class="text-base font-black text-emerald-700 mt-0.5">{{ analysis.validRows }}</div>
                </div>
                <div class="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200 text-center">
                  <div class="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Новых</div>
                  <div class="text-base font-black text-indigo-700 mt-0.5">{{ analysis.newCount }}</div>
                </div>
                <div class="bg-sky-50/70 p-2.5 rounded-xl border border-sky-200 text-center">
                  <div class="text-[10px] font-bold text-sky-700 uppercase tracking-wider">Обновлений</div>
                  <div class="text-base font-black text-sky-700 mt-0.5">{{ analysis.updateCount }}</div>
                </div>
                <div class="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200 text-center col-span-2 sm:col-span-1">
                  <div class="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Ошибок/Пропуск</div>
                  <div class="text-base font-black text-rose-700 mt-0.5">{{ analysis.invalidRows }}</div>
                </div>
              </div>

              <!-- Errors banner if any -->
              <div v-if="analysis.errors.length > 0" class="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div class="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">warning</span>
                  Обнаружены замечания в строках:
                </div>
                <ul class="text-[11px] text-rose-650 list-disc list-inside space-y-0.5 font-medium pl-1 max-h-24 overflow-y-auto">
                  <li v-for="(err, idx) in analysis.errors.slice(0, 5)" :key="idx">{{ err }}</li>
                  <li v-if="analysis.errors.length > 5">... и ещё {{ analysis.errors.length - 5 }} замечаний</li>
                </ul>
              </div>

              <!-- Preview Table -->
              <div v-if="analysis.previewRows.length > 0" class="border border-slate-200 rounded-xl overflow-hidden">
                <div class="bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 flex justify-between items-center">
                  <span>Предпросмотр данных (первые {{ analysis.previewRows.length }} из {{ analysis.validRows }}):</span>
                  <span class="text-[10px] text-slate-400">Дубликаты обновляются, новые создаются</span>
                </div>
                <div class="overflow-x-auto max-h-48">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th class="p-2 w-10 text-center">#</th>
                        <th class="p-2" v-for="col in previewColumns" :key="col">{{ col }}</th>
                        <th class="p-2 w-28 text-center">Действие</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-800">
                      <tr v-for="(row, idx) in analysis.previewRows" :key="idx" class="hover:bg-slate-50/70">
                        <td class="p-2 text-center text-slate-400 font-bold text-[11px]">{{ idx + 1 }}</td>
                        <td class="p-2 font-medium" v-for="col in previewColumns" :key="col">
                          {{ row[col] != null ? row[col] : '—' }}
                        </td>
                        <td class="p-2 text-center">
                          <span
                            class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                            :class="getStatusBadgeClass(row._status)"
                          >
                            {{ row._status === 'new' ? 'Новая' : (row._status === 'update' ? 'Обновится' : 'Ошибка') }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Upload Execution Result Card -->
            <div v-if="uploadResult" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-fade-in">
              <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span class="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                Данные успешно загружены и синхронизированы!
              </div>
              <div class="flex flex-wrap gap-2 pt-1 text-xs">
                <span class="bg-white border border-emerald-250 text-emerald-800 px-3 py-1 rounded-xl font-black">
                  🟢 Создано новых: {{ uploadResult.created }}
                </span>
                <span class="bg-white border border-indigo-250 text-indigo-800 px-3 py-1 rounded-xl font-black">
                  🔵 Обновлено существующих: {{ uploadResult.updated }}
                </span>
                <span v-if="uploadResult.errors > 0" class="bg-white border border-rose-250 text-rose-800 px-3 py-1 rounded-xl font-black">
                  🔴 Ошибок: {{ uploadResult.errors }}
                </span>
              </div>
              <div v-if="uploadResult.details" class="text-[11px] text-emerald-700 font-medium pt-1">
                Детализация: 
                Марки: +{{ uploadResult.details.brands?.created || 0 }} (обн. {{ uploadResult.details.brands?.updated || 0 }}), 
                Модели: +{{ uploadResult.details.models?.created || 0 }} (обн. {{ uploadResult.details.models?.updated || 0 }}), 
                Категории: +{{ uploadResult.details.categories?.created || 0 }} (обн. {{ uploadResult.details.categories?.updated || 0 }}), 
                Услуги: +{{ uploadResult.details.services?.created || 0 }} (обн. {{ uploadResult.details.services?.updated || 0 }})
              </div>
            </div>

            <!-- Error Banner -->
            <div v-if="executionError" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">error</span>
              {{ executionError }}
            </div>
          </div>

          <!-- TAB 2: AI PROMPTS & INSTRUCTIONS -->
          <div v-else-if="activeModalTab === 'ai_prompts'" class="space-y-4">
            <!-- Instructions Overview -->
            <div class="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-4 text-xs text-indigo-950 space-y-2">
              <div class="font-bold text-indigo-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[17px]">tips_and_updates</span>
                Как быстро наполнить справочники с помощью нейросетей
              </div>
              <p class="leading-relaxed">
                Вы можете использовать <b>ChatGPT, Claude, DeepSeek</b> или любую другую модель, чтобы мгновенно сгенерировать готовые списки автомобилей или услуг с ценами.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div class="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                  <div class="font-black text-indigo-800">1. Скопируйте промпт</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Выберите нужный шаблон ниже и нажмите «Скопировать».</div>
                </div>
                <div class="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                  <div class="font-black text-indigo-800">2. Отправьте ИИ</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Укажите вашу марку или направление (например, Audi или Замена масел).</div>
                </div>
                <div class="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                  <div class="font-black text-indigo-800">3. Вставьте и загрузите</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">Скопируйте ответ ИИ во вкладку импорта и нажмите «Загрузить».</div>
                </div>
              </div>
            </div>

            <!-- Prompt 1: Cars (Audi, BMW, etc.) -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-sm">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-600 text-[20px]">directions_car</span>
                  <span class="text-xs font-black text-slate-850 uppercase tracking-wider">Промпт 1: Модели для марки авто (например, Audi)</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="applyAiSample('cars')"
                    class="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  >
                    ⚡ Протестировать пример
                  </button>
                  <button
                    type="button"
                    @click="copyText(prompts.cars, 'cars')"
                    class="px-3 py-1 text-xs font-bold rounded-lg border-none bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span class="material-symbols-outlined text-[15px]">{{ copyState.cars ? 'check' : 'content_copy' }}</span>
                    {{ copyState.cars ? 'Скопировано!' : 'Скопировать промпт' }}
                  </button>
                </div>
              </div>
              <pre class="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">{{ prompts.cars }}</pre>
            </div>

            <!-- Prompt 2: Services & Categories with prices -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-sm">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-emerald-600 text-[20px]">build</span>
                  <span class="text-xs font-black text-slate-850 uppercase tracking-wider">Промпт 2: Услуги автосервиса с ценами и категориями</span>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="applyAiSample('services')"
                    class="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  >
                    ⚡ Протестировать пример
                  </button>
                  <button
                    type="button"
                    @click="copyText(prompts.services, 'services')"
                    class="px-3 py-1 text-xs font-bold rounded-lg border-none bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <span class="material-symbols-outlined text-[15px]">{{ copyState.services ? 'check' : 'content_copy' }}</span>
                    {{ copyState.services ? 'Скопировано!' : 'Скопировать промпт' }}
                  </button>
                </div>
              </div>
              <pre class="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">{{ prompts.services }}</pre>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer border-t border-slate-100 px-6 py-4 bg-white flex items-center justify-between gap-3">
          <div class="text-xs font-semibold text-slate-500">
            <span v-if="activeModalTab === 'import' && analysis.validRows > 0">
              Готово к импорту: <b class="text-indigo-600">{{ analysis.validRows }}</b> записей 
              (<span class="text-emerald-650">+{{ analysis.newCount }} нов.</span>, 
               <span class="text-sky-650">↺{{ analysis.updateCount }} обн.</span>)
            </span>
          </div>

          <div class="flex gap-2.5">
            <button
              type="button"
              class="px-4 py-2.5 border border-slate-250 text-slate-650 rounded-xl bg-white hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              data-bs-dismiss="modal"
            >
              Закрыть
            </button>
            <button
              v-if="activeModalTab === 'import'"
              type="button"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="analysis.validRows === 0 || isProcessing"
              @click="executeImport"
            >
              <span
                v-if="isProcessing"
                class="spinner-border spinner-border-sm text-white border-2"
              ></span>
              <span class="material-symbols-outlined text-[16px]" v-else>cloud_upload</span>
              <span>Загрузить ({{ analysis.validRows }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";

export default {
  name: "CsvImportModal",
  data() {
    return {
      activeModalTab: "import", // 'import' | 'ai_prompts'
      rawInput: "",
      entityType: "auto", // 'auto' | 'cars' | 'services' | 'brands' | 'categories'
      delimiter: "auto", // 'auto' | ';' | ',' | '\t' | '|'
      isProcessing: false,
      uploadResult: null,
      executionError: "",
      bsModal: null,
      copyState: {
        cars: false,
        services: false,
      },
      prompts: {
        cars: `Сгенерируй CSV-список всех популярных моделей для марки [НАПРИМЕР: Audi].
Формат вывода: ТОЛЬКО сырой CSV текст без пояснений, приветствий и без markdown-блоков code.
Разделитель: точка с запятой (;).
Первая строка заголовок:
Марка;Модель

Пример:
Audi;A3
Audi;A4
Audi;A5
Audi;A6
Audi;A7
Audi;A8
Audi;Q3
Audi;Q5
Audi;Q7
Audi;Q8
Audi;e-tron`,
        services: `Сгенерируй CSV-список базовых услуг автосервиса по направлению [НАПРИМЕР: Техническое обслуживание и замена масел] с примерными ценами.
Формат вывода: ТОЛЬКО сырой CSV текст без пояснений, приветствий и без markdown-блоков code.
Разделитель: точка с запятой (;).
Первая строка заголовок:
Категория;Услуга;Цена

Пример:
Техническое обслуживание;Замена моторного масла и фильтра;800
Техническое обслуживание;Замена воздушного фильтра;200
Техническое обслуживание;Замена салонного фильтра;300
Тормозная система;Замена передних тормозных колодок;1000
Тормозная система;Замена задних тормозных колодок;1200
Тормозная система;Замена тормозной жидкости;800
Диагностика;Компьютерная диагностика систем;1000
Диагностика;Диагностика ходовой части;600`,
      },
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    db() {
      return this.store.db;
    },
    isGlobalAdmin() {
      return this.user && this.user.Role === "Superadmin";
    },
    inputPlaceholder() {
      return `Вставьте CSV-строки сюда или перетащите файл...

Пример для автомобилей (Марка;Модель):
Audi;A4
Audi;A6
Audi;Q7
BMW;X5

Пример для услуг (Категория;Услуга;Цена):
Техническое обслуживание;Замена масла в ДВС;800
Диагностика;Компьютерная диагностика;1200`;
    },
    activeDelimiterDisplay() {
      if (this.delimiter !== "auto") return this.delimiter;
      return this.analysis.detectedDelimiter || ";";
    },
    detectedEntityLabel() {
      const type = this.analysis.detectedEntityType;
      switch (type) {
        case "cars": return "Автомобили (Марка;Модель)";
        case "services": return "Услуги (Категория;Услуга;Цена)";
        case "brands": return "Марки";
        case "categories": return "Категории";
        default: return "Автоопределение";
      }
    },
    previewColumns() {
      const type = this.analysis.detectedEntityType;
      if (type === "cars") return ["Марка", "Модель"];
      if (type === "services") return ["Категория", "Услуга", "Цена"];
      if (type === "brands") return ["Марка"];
      if (type === "categories") return ["Категория"];
      return ["Колонка 1", "Колонка 2"];
    },
    analysis() {
      return this.parseAndAnalyze(this.rawInput);
    },
  },
  mounted() {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      this.bsModal = new bootstrap.Modal(this.$refs.modalRef);
    }

    if (this.$refs.modalRef) {
      this.$refs.modalRef.addEventListener("hidden.bs.modal", () => {
        this.uploadResult = null;
        this.executionError = "";
      });
    }
  },
  methods: {
    open(tab = "import") {
      this.activeModalTab = tab;
      this.uploadResult = null;
      this.executionError = "";
      if (this.bsModal) this.bsModal.show();
    },
    hide() {
      if (this.bsModal) this.bsModal.hide();
    },
    clearInput() {
      this.rawInput = "";
      this.uploadResult = null;
      this.executionError = "";
    },
    getStatusBadgeClass(status) {
      if (status === "new") return "bg-emerald-50 text-emerald-700 border-emerald-200";
      if (status === "update") return "bg-sky-50 text-sky-700 border-sky-200";
      return "bg-rose-50 text-rose-700 border-rose-200";
    },
    async copyText(text, key) {
      try {
        await navigator.clipboard.writeText(text);
        this.copyState[key] = true;
        setTimeout(() => {
          this.copyState[key] = false;
        }, 2000);
      } catch (e) {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        this.copyState[key] = true;
        setTimeout(() => {
          this.copyState[key] = false;
        }, 2000);
      }
    },
    loadSample(type) {
      if (type === "cars") {
        this.entityType = "cars";
        this.delimiter = ";";
        this.rawInput = `Марка;Модель
Audi;A3
Audi;A4
Audi;A6
Audi;Q5
Audi;Q7
BMW;X5
BMW;M5
Toyota;Camry
Toyota;Land Cruiser`;
      } else if (type === "services") {
        this.entityType = "services";
        this.delimiter = ";";
        this.rawInput = `Категория;Услуга;Цена
Техническое обслуживание;Замена моторного масла;800
Техническое обслуживание;Замена воздушного фильтра;200
Техническое обслуживание;Замена тормозной жидкости;800
Тормозная система;Замена передних колодок;1000
Тормозная система;Замена задних колодок;1200
Диагностика;Компьютерная диагностика;1000
Диагностика;Диагностика ходовой части;600`;
      }
      this.uploadResult = null;
    },
    applyAiSample(type) {
      this.loadSample(type);
      this.activeModalTab = "import";
    },
    handleFileUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.rawInput = e.target.result || "";
        this.uploadResult = null;
      };
      reader.readAsText(file, "UTF-8");
      // reset file input
      event.target.value = "";
    },
    detectDelimiter(text) {
      const candidates = [";", ",", "\t", "|"];
      const lines = text.split("\n").filter((l) => l.trim().length > 0).slice(0, 5);
      if (lines.length === 0) return ";";

      const scores = { ";": 0, ",": 0, "\t": 0, "|": 0 };
      for (const line of lines) {
        for (const c of candidates) {
          scores[c] += (line.split(c).length - 1);
        }
      }

      let best = ";";
      let maxScore = -1;
      for (const c of candidates) {
        if (scores[c] > maxScore) {
          maxScore = scores[c];
          best = c;
        }
      }
      return maxScore > 0 ? best : ";";
    },
    parseAndAnalyze(raw) {
      const emptyResult = {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        newCount: 0,
        updateCount: 0,
        detectedEntityType: this.entityType !== "auto" ? this.entityType : "cars",
        detectedDelimiter: ";",
        errors: [],
        previewRows: [],
        parsedItems: { brands: [], models: [], categories: [], services: [] },
      };

      if (!raw || !raw.trim()) return emptyResult;

      // Clean lines: strip markdown ``` blocks
      const cleanRaw = raw
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/```/g, "")
        .trim();

      const lines = cleanRaw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length === 0) return emptyResult;

      // Check if raw is JSON format
      if (cleanRaw.startsWith("{") || cleanRaw.startsWith("[")) {
        try {
          const parsedJson = JSON.parse(cleanRaw);
          return this.analyzeJsonData(parsedJson);
        } catch (e) {
          // not valid JSON, proceed as CSV
        }
      }

      // Determine Delimiter
      const chosenDelimiter = this.delimiter === "auto" ? this.detectDelimiter(cleanRaw) : this.delimiter;

      // Inspect first line for header
      const firstLineCols = lines[0].split(chosenDelimiter).map((c) => c.trim().toLowerCase());
      const hasHeader = firstLineCols.some((col) =>
        ["марка", "brand", "модель", "model", "категория", "category", "услуга", "service", "цена", "price"].some(
          (k) => col.includes(k)
        )
      );

      // Determine Entity Type
      let finalEntityType = this.entityType;
      if (finalEntityType === "auto") {
        if (hasHeader) {
          if (firstLineCols.some((c) => c.includes("категор") || c.includes("услуг") || c.includes("цен") || c.includes("price") || c.includes("service"))) {
            finalEntityType = "services";
          } else if (firstLineCols.some((c) => c.includes("марк") || c.includes("модел") || c.includes("brand") || c.includes("model"))) {
            finalEntityType = "cars";
          }
        } else {
          // Check column count of sample rows
          const sampleCols = lines[0].split(chosenDelimiter);
          if (sampleCols.length >= 3) {
            finalEntityType = "services";
          } else if (sampleCols.length === 2) {
            // If col 2 is numeric, likely service; else cars
            const val2 = sampleCols[1].trim();
            if (!isNaN(Number(val2)) && Number(val2) > 0) {
              finalEntityType = "services";
            } else {
              finalEntityType = "cars";
            }
          } else {
            finalEntityType = "brands";
          }
        }
      }

      const dataLines = hasHeader ? lines.slice(1) : lines;
      const result = {
        totalRows: dataLines.length,
        validRows: 0,
        invalidRows: 0,
        newCount: 0,
        updateCount: 0,
        detectedEntityType: finalEntityType,
        detectedDelimiter: chosenDelimiter,
        errors: [],
        previewRows: [],
        parsedItems: { brands: [], models: [], categories: [], services: [] },
      };

      // DB Lookups for pre-flight status calculation
      const globalBrands = this.db.globalbrands || this.db.brands || [];
      const globalModels = this.db.globalmodels || this.db.models || [];
      const serviceCategories = this.db.servicecategories || [];
      const globalServices = this.db.globalservices || this.db.services || [];

      const brandMap = {};
      globalBrands.forEach((b) => {
        brandMap[String(b.Name || "").trim().toLowerCase()] = b;
      });

      const categoryMap = {};
      serviceCategories.forEach((c) => {
        categoryMap[String(c.Name || "").trim().toLowerCase()] = c;
      });

      dataLines.forEach((line, index) => {
        const lineNum = (hasHeader ? 2 : 1) + index;
        const parts = line.split(chosenDelimiter).map((p) => p.trim());

        if (finalEntityType === "cars") {
          const brandName = parts[0] || "";
          const modelName = parts[1] || "";

          if (!brandName) {
            result.invalidRows++;
            result.errors.push(`Строка ${lineNum}: не указано название марки`);
            return;
          }

          if (modelName) {
            // Brand + Model
            const existingBrand = brandMap[brandName.toLowerCase()];
            let isModelExisting = false;

            if (existingBrand) {
              isModelExisting = globalModels.some(
                (m) =>
                  String(m.BrandID) === String(existingBrand.ID) &&
                  String(m.Name || "").trim().toLowerCase() === modelName.toLowerCase()
              );
            }

            const rowStatus = isModelExisting ? "update" : "new";
            if (rowStatus === "new") result.newCount++;
            else result.updateCount++;
            result.validRows++;

            const item = { BrandName: brandName, Name: modelName, _status: rowStatus };
            result.parsedItems.models.push(item);
            if (result.previewRows.length < 10) {
              result.previewRows.push({
                Марка: brandName,
                Модель: modelName,
                _status: rowStatus,
              });
            }
          } else {
            // Just Brand
            const existingBrand = brandMap[brandName.toLowerCase()];
            const rowStatus = existingBrand ? "update" : "new";
            if (rowStatus === "new") result.newCount++;
            else result.updateCount++;
            result.validRows++;

            const item = { Name: brandName, _status: rowStatus };
            result.parsedItems.brands.push(item);
            if (result.previewRows.length < 10) {
              result.previewRows.push({
                Марка: brandName,
                Модель: "— (Только марка)",
                _status: rowStatus,
              });
            }
          }
        } else if (finalEntityType === "services") {
          let catName = "";
          let sName = "";
          let price = 0;

          if (parts.length >= 3) {
            catName = parts[0];
            sName = parts[1];
            price = Number(parts[2].replace(/[^\d.-]/g, "")) || 0;
          } else if (parts.length === 2) {
            if (!isNaN(Number(parts[1].replace(/[^\d.-]/g, "")))) {
              sName = parts[0];
              price = Number(parts[1].replace(/[^\d.-]/g, "")) || 0;
            } else {
              catName = parts[0];
              sName = parts[1];
            }
          } else {
            sName = parts[0];
          }

          if (!sName) {
            result.invalidRows++;
            result.errors.push(`Строка ${lineNum}: не указано название услуги`);
            return;
          }

          // Check if service already exists
          const existingService = globalServices.find((gs) => {
            const matchName = String(gs.Name || "").trim().toLowerCase() === sName.toLowerCase();
            if (catName && gs.CategoryID) {
              const cat = serviceCategories.find((c) => c.ID === gs.CategoryID);
              const matchCat = cat && cat.Name.trim().toLowerCase() === catName.toLowerCase();
              return matchName && matchCat;
            }
            return matchName;
          });

          const rowStatus = existingService ? "update" : "new";
          if (rowStatus === "new") result.newCount++;
          else result.updateCount++;
          result.validRows++;

          const item = { CategoryName: catName, Name: sName, Price: price, _status: rowStatus };
          result.parsedItems.services.push(item);

          if (result.previewRows.length < 10) {
            result.previewRows.push({
              Категория: catName || "—",
              Услуга: sName,
              Цена: `${price.toLocaleString()} сом`,
              _status: rowStatus,
            });
          }
        } else if (finalEntityType === "brands") {
          const name = parts[0];
          if (!name) {
            result.invalidRows++;
            return;
          }
          const exists = brandMap[name.toLowerCase()];
          const status = exists ? "update" : "new";
          if (status === "new") result.newCount++;
          else result.updateCount++;
          result.validRows++;

          result.parsedItems.brands.push({ Name: name, _status: status });
          if (result.previewRows.length < 10) {
            result.previewRows.push({ Марка: name, _status: status });
          }
        } else if (finalEntityType === "categories") {
          const name = parts[0];
          if (!name) {
            result.invalidRows++;
            return;
          }
          const exists = categoryMap[name.toLowerCase()];
          const status = exists ? "update" : "new";
          if (status === "new") result.newCount++;
          else result.updateCount++;
          result.validRows++;

          result.parsedItems.categories.push({ Name: name, _status: status });
          if (result.previewRows.length < 10) {
            result.previewRows.push({ Категория: name, _status: status });
          }
        }
      });

      return result;
    },
    analyzeJsonData(data) {
      const res = {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        newCount: 0,
        updateCount: 0,
        detectedEntityType: "JSON (Комплексный)",
        detectedDelimiter: "JSON",
        errors: [],
        previewRows: [],
        parsedItems: { brands: [], models: [], categories: [], services: [] },
      };

      if (data.brands && Array.isArray(data.brands)) {
        data.brands.forEach((b) => {
          if (b.Name) {
            res.totalRows++;
            res.validRows++;
            res.newCount++;
            res.parsedItems.brands.push({ Name: b.Name });
          }
        });
      }
      if (data.models && Array.isArray(data.models)) {
        data.models.forEach((m) => {
          if (m.Name) {
            res.totalRows++;
            res.validRows++;
            res.newCount++;
            res.parsedItems.models.push({ BrandName: m.BrandName, Name: m.Name });
          }
        });
      }
      if (data.services && Array.isArray(data.services)) {
        data.services.forEach((s) => {
          if (s.Name) {
            res.totalRows++;
            res.validRows++;
            res.newCount++;
            res.parsedItems.services.push({
              CategoryName: s.CategoryName,
              Name: s.Name,
              Price: s.Price || s.DefaultPrice || 0,
            });
          }
        });
      }
      return res;
    },
    async executeImport() {
      this.executionError = "";
      this.uploadResult = null;

      const { parsedItems, validRows } = this.analysis;
      if (validRows === 0) {
        this.executionError = "Нет валидных строк для импорта.";
        return;
      }

      this.isProcessing = true;
      try {
        const payload = {
          brands: parsedItems.brands || [],
          models: parsedItems.models || [],
          categories: parsedItems.categories || [],
          services: parsedItems.services || [],
        };

        const result = await this.store.bulkUpsertReferences(payload);

        if (result && result.success) {
          this.uploadResult = result;
          this.store.showToast(
            `Импорт завершен: добавлено ${result.created}, обновлено ${result.updated}`,
            "success"
          );
          // Clean input after successful upload
          this.rawInput = "";
        } else {
          this.executionError = (result && result.error) || "Ошибка при импорте данных.";
        }
      } catch (err) {
        console.error("Execute import error:", err);
        this.executionError = err.message || "Непредвиденная ошибка при импорте.";
      } finally {
        this.isProcessing = false;
      }
    },
  },
};
</script>

<style scoped>
.modal.fade .modal-dialog {
  transition: transform 0.25s ease-out;
}
</style>
