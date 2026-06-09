<template>
  <div
    class="flex flex-col items-center justify-between h-full p-2 sm:p-3 select-none relative overflow-hidden transition-all duration-300"
    :class="isLightTheme ? 'bg-slate-55 text-slate-900' : 'bg-slate-950 text-white'"
    ref="gameContainer"
    @mousemove="onGlobalMouseMove"
    @mouseup="onGlobalMouseUp"
    @touchmove="onGlobalTouchMove"
    @touchend="onGlobalTouchEnd"
  >
    <!-- Glass HUD Header of Block Blast with Flame streak and Best Scores -->
    <div
      v-if="hasStarted && !gameOver"
      class="w-full backdrop-blur-md rounded-2xl py-2 px-3 flex items-center justify-between z-10 shadow-lg select-none mb-1 shrink-0 border transition-all duration-300"
      :class="isLightTheme ? 'bg-white/90 border-slate-200/85 text-slate-800' : 'bg-slate-900/80 border-slate-800/85 text-white'"
    >
      <!-- Left: Active Streak / Fire mode -->
      <div
        class="flex items-center gap-1.5 px-2 py-1 rounded-xl border transition-all duration-300"
        :class="isLightTheme ? 'bg-orange-50/65 border-orange-200/60' : 'bg-slate-950/40 border-orange-500/20'"
      >
        <span class="relative flex h-3.5 w-3.5">
          <span
            v-if="streak >= 2"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"
          ></span>
          <span
            class="material-symbols-outlined text-[15px] select-none text-orange-500"
            :class="streak >= 2 ? 'text-orange-500 font-bold' : (isLightTheme ? 'text-slate-400' : 'text-slate-400')"
          >
            local_fire_department
          </span>
        </span>
        <div class="flex flex-col text-left leading-none">
          <span class="text-[7.5px] font-black uppercase tracking-widest leading-none mb-0.5" :class="isLightTheme ? 'text-slate-500' : 'text-slate-400'">Серия</span>
          <span
            class="text-xs font-black font-mono leading-none"
            :class="streak >= 2 ? 'text-orange-500 animate-pulse' : (isLightTheme ? 'text-slate-700' : 'text-slate-200')"
          >
            {{ streak }}
          </span>
        </div>
      </div>

      <!-- Center: Score, Mute, Theme Switcher in beautiful Control Pill -->
      <div class="flex flex-col items-center select-none px-1">
        <span class="text-[7.5px] font-black uppercase tracking-widest leading-none mb-0.5" :class="isLightTheme ? 'text-slate-500' : 'text-slate-400'">Счёт</span>
        <div class="flex items-center gap-2">
          <!-- Score Value display -->
          <span class="text-base font-black font-mono leading-none" :class="isLightTheme ? 'text-emerald-600' : 'text-emerald-400'">
            {{ score }}
          </span>
          
          <!-- Quick toggles row -->
          <div class="flex items-center gap-0.5 p-0.5 rounded-lg border transition-all duration-300" :class="isLightTheme ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/40 border-slate-800/40'">
            <!-- Sound toggle button -->
            <button
              @click="toggleMute"
              class="h-5 w-5 rounded flex items-center justify-center transition border-none bg-transparent cursor-pointer p-0"
              :class="isLightTheme ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:bg-slate-800'"
              title="Включить / Выключить звук"
            >
              <span class="material-symbols-outlined text-[13px]">
                {{ isMuted ? 'volume_off' : 'volume_up' }}
              </span>
            </button>
            <!-- Theme switch button -->
            <button
              @click="toggleTheme"
              class="h-5 w-5 rounded flex items-center justify-center transition border-none bg-transparent cursor-pointer p-0"
              :class="isLightTheme ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:bg-slate-800'"
              title="Переключить тему оформления"
            >
              <span class="material-symbols-outlined text-[13px]">
                {{ isLightTheme ? 'dark_mode' : 'light_mode' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: High Score Cup  -->
      <div
        class="flex items-center gap-1.5 px-2 py-1 rounded-xl border transition-all duration-300"
        :class="isLightTheme ? 'bg-yellow-50/60 border-yellow-200/50' : 'bg-slate-950/40 border-yellow-500/20'"
      >
        <span class="material-symbols-outlined text-[15px] text-yellow-500 select-none">
          trophy
        </span>
        <div class="flex flex-col text-right leading-none">
          <span class="text-[7.5px] font-black uppercase tracking-widest leading-none mb-0.5" :class="isLightTheme ? 'text-slate-500' : 'text-slate-400'">Рекорд</span>
          <span class="text-xs font-black font-mono text-yellow-500 leading-none" :class="isLightTheme ? 'text-yellow-650' : 'text-yellow-400'">
            {{ highScore }}
          </span>
        </div>
      </div>
    </div>

    <!-- Active Area: Main viewport board -->
    <div
      ref="boardWrapper"
      class="flex-grow w-full max-w-[420px] flex flex-col justify-center items-center relative my-0.5 sm:my-1"
    >
      <!-- Flame Aura border around the board if high streak -->
      <div
        class="relative p-2 rounded-3xl transition-all duration-500 border"
        :class="[
          isLightTheme 
            ? (streak >= 2 ? 'border-orange-400/60 shadow-[0_0_20px_rgba(249,115,22,0.12)] bg-orange-50/45' : 'border-slate-200/90 shadow-lg bg-white/70') 
            : (streak >= 2 ? 'border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)] bg-slate-900/50' : 'border-slate-800/60 shadow-xl bg-slate-900/40')
        ]"
      >
        <!-- 8x8 Grid Canvas & Interactivity matrix -->
        <div
          ref="gridElement"
          class="grid grid-cols-8 gap-1 p-1 rounded-2xl relative overflow-hidden block-blast-grid max-w-full aspect-square transition-all duration-300 border"
          :class="isLightTheme ? 'bg-slate-100 border-slate-200/95' : 'bg-slate-950/70 border-slate-900/60'"
        >
          <!-- Loop through cells dynamically -->
          <div
            v-for="idx in 64"
            :key="idx"
            :id="'grid-cell-' + idx"
            class="w-full h-full aspect-square rounded-[3px] relative transition-all duration-200 cursor-pointer flex items-center justify-center border select-none"
            :class="getCellClass(getRow(idx), getCol(idx))"
            :style="getCellStyle(getRow(idx), getCol(idx))"
            @mouseenter="onCellMouseEnter(getRow(idx), getCol(idx))"
            @mouseleave="onCellMouseLeave(getRow(idx), getCol(idx))"
            @click="onCellClick(getRow(idx), getCol(idx))"
          >
            <!-- Cell internal shadow effect -->
            <div class="absolute inset-[1.5px] rounded-[2px] bg-black/10 mix-blend-overlay"></div>

            <!-- Clear fire blast light effect -->
            <div
              v-if="isClearingCell(getRow(idx), getCol(idx))"
              class="absolute inset-0 rounded-[3px] bg-white animate-flash-gold flex items-center justify-center z-10"
            >
              <div class="w-full h-full bg-orange-400/95 rounded-md animate-scale-out"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Combo & Streak Toast Indicator floaters -->
      <transition name="toast-float">
        <div
          v-if="activeStreakToast"
          class="absolute top-1/3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black py-1.5 px-4 rounded-full text-[10px] tracking-widest shadow-2xl flex items-center gap-1 z-30 select-none border border-orange-400 uppercase animate-bounce"
        >
          🔥 СЕРИЯ x{{ streak }}!
        </div>
      </transition>

      <transition name="toast-float">
        <div
          v-if="activeComboToast"
          class="absolute top-1/2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-black py-1.5 px-4 rounded-full text-[11px] tracking-widest shadow-2xl flex items-center gap-1.5 z-30 select-none border border-cyan-400 uppercase"
        >
          💥 КОМБО +{{ activeComboLines }} ЛИНИЙ!
        </div>
      </transition>
    </div>

    <!-- Active Tray with 3 blocks to place -->
    <div
      v-if="hasStarted && !gameOver"
      class="w-full max-w-[420px] flex flex-col items-center gap-1.5 mb-1 z-10 shrink-0"
    >
      <!-- Tray blocks panel -->
      <div
        class="w-full border rounded-2xl py-2 px-2 flex justify-around items-center h-[110px] sm:h-[135px] shadow-lg relative shrink-0 transition-all duration-300"
        :class="isLightTheme ? 'bg-white/95 border-slate-200' : 'bg-slate-900/60 border-slate-800/60'"
      >
        <div
          v-for="(trayItem, index) in blockTray"
          :key="index"
          class="relative w-[78px] h-[78px] sm:w-[96px] sm:h-[96px] rounded-2xl border flex items-center justify-center transition-all duration-305 shrink-0"
          :class="[
            trayItem ? (isLightTheme ? 'border-slate-200 hover:bg-slate-50 cursor-grab active:cursor-grabbing' : 'border-slate-800 hover:bg-slate-900/50 cursor-grab active:cursor-grabbing') : (isLightTheme ? 'border-dashed border-slate-200 bg-slate-50/20 opacity-20' : 'border-dashed border-slate-900 bg-slate-950/40 opacity-20'),
            selectedBlockIndex === index ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)] scale-105' : '',
            trayItem && !canPlaceBlockAnywhere(trayItem.shape) ? 'grayscale opacity-40' : ''
          ]"
          @mousedown="onBlockMouseDown($event, index)"
          @touchstart="onBlockTouchStart($event, index)"
          @click="selectBlockFromTray(index)"
        >
          <!-- Mini shape representation -->
          <div
            v-if="trayItem"
            class="grid gap-[2px] shrink-0"
            :style="{
              gridTemplateRows: `repeat(${trayItem.shape.length}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${trayItem.shape[0].length}, minmax(0, 1fr))`
            }"
          >
            <!-- Draw shape grid -->
            <div
              v-for="cellVal in flattenShape(trayItem.shape)"
              :key="cellVal.id"
              class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[1px] sm:rounded-[1.5px] border shrink-0"
              :style="{
                backgroundColor: cellVal.active ? trayItem.color : 'transparent',
                borderColor: cellVal.active ? 'rgba(255, 255, 255, 0.45) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4) rgba(255, 255, 255, 0.45)' : 'transparent',
                borderWidth: cellVal.active ? '1.5px' : '0px',
                boxShadow: cellVal.active ? 'inset 1px 1px 0px rgba(255, 255, 255, 0.25), inset -1px -1px 0px rgba(0, 0, 0, 0.3)' : 'none',
                opacity: cellVal.active ? 1 : 0
              }"
            ></div>
          </div>

          <!-- Empty or placed label -->
          <div v-if="!trayItem" class="text-[7.5px] font-black uppercase tracking-widest leading-none" :class="isLightTheme ? 'text-slate-400' : 'text-slate-600/60'">
            ОК
          </div>

          <!-- No-moves indicator -->
          <div
            v-if="trayItem && !canPlaceBlockAnywhere(trayItem.shape)"
            class="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"
            title="Нет места для этой фигуры"
          >
            <span class="material-symbols-outlined text-sm text-red-550 font-bold">
              block
            </span>
          </div>
        </div>
      </div>

      <!-- Helper info instruction label -->
      <div class="text-[8.5px] sm:text-[9px] font-bold tracking-wide text-center uppercase leading-none mt-0.5 sm:mt-1 font-sans" :class="isLightTheme ? 'text-slate-500' : 'text-slate-400/80'">
        <i class="bi bi-hand-index-thumb text-indigo-400 mr-0.5 animate-pulse"></i>
        Перетащите блоки или кликните на фигуру, а затем на поле
      </div>
    </div>

    <!-- Dragging absolute flying avatar piece representation inside game frame -->
    <div
      v-if="isDragging && activeDraggedBlock"
      class="absolute pointer-events-none z-[99999] opacity-90 transition-none scale-110 w-max shrink-0 flex-shrink-0"
      :style="{
        left: pxToPercentage(dragX, 'x'),
        top: pxToPercentage(dragY, 'y'),
        transform: 'translate(-50%, -50%)'
      }"
    >
      <div
        class="grid gap-1 p-1 rounded-xl shrink-0 flex-shrink-0 shadow-2xl"
        :class="isLightTheme ? 'bg-slate-200 border border-slate-300/65' : 'bg-slate-900/40 border border-slate-850'"
        :style="{
          gridTemplateRows: `repeat(${activeDraggedBlock.shape.length}, 32px)`,
          gridTemplateColumns: `repeat(${activeDraggedBlock.shape[0].length}, 32px)`
        }"
      >
        <div
          v-for="cellVal in flattenShape(activeDraggedBlock.shape)"
          :key="'drag-' + cellVal.id"
          class="w-8 h-8 rounded-[2.5px] border shrink-0 flex-shrink-0"
          :style="{
            backgroundColor: cellVal.active ? activeDraggedBlock.color : 'transparent',
            borderColor: cellVal.active ? 'rgba(255, 255, 255, 0.55) rgba(0, 0, 0, 0.45) rgba(0, 0, 0, 0.45) rgba(255, 255, 255, 0.55)' : 'transparent',
            borderWidth: cellVal.active ? '2.5px' : '0px',
            boxShadow: cellVal.active ? 'inset 2.5px 2.5px 0px rgba(255, 255, 255, 0.35), inset -2.5px -2.5px 0px rgba(0, 0, 0, 0.45), 0 4px 8px rgba(0, 0, 0, 0.35)' : 'none',
            opacity: cellVal.active ? 1 : 0
          }"
        ></div>
      </div>
    </div>

    <!-- Start lobby popup view of game -->
    <div
      v-if="!hasStarted && !gameOver"
      class="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-5 text-center z-20 transition-all duration-300 backdrop-blur-md"
      :class="isLightTheme ? 'bg-white/95 text-slate-900' : 'bg-slate-950/95 text-white'"
    >
      <div
        class="w-14 h-14 rounded-full flex items-center justify-center text-orange-400 mb-4 shadow-xl border"
        :class="isLightTheme ? 'bg-orange-50 border-orange-200' : 'bg-orange-50/10 border-orange-500/20'"
      >
        <span class="material-symbols-outlined text-3xl animate-bounce" style="animation-duration: 3s">
          local_fire_department
        </span>
      </div>
      <h2 class="text-lg font-black mb-1 uppercase tracking-wide" :class="isLightTheme ? 'text-slate-900' : 'text-white'">
        Block Blast ERP
      </h2>
      <p class="text-[10px] max-w-[210px] mb-4 leading-normal font-medium" :class="isLightTheme ? 'text-slate-600' : 'text-slate-400'">
        Увлекательная головоломка со свободным распределением фигур. Заполняйте линии и копите серии!
      </p>

      <div
        class="text-[9.5px] font-semibold max-w-[260px] mb-5 leading-relaxed p-3 rounded-xl text-left space-y-1 border"
        :class="isLightTheme ? 'bg-slate-50/60 border-slate-200/80 text-slate-700' : 'bg-slate-900/60 border-slate-800/40 text-slate-300'"
      >
        <p class="text-center font-bold text-[10.5px] text-orange-400 border-b pb-1 mb-1 select-none" :class="isLightTheme ? 'border-slate-200/85' : 'border-slate-800/80'">ПРАВИЛА ИГРЫ:</p>
        <div class="flex items-start gap-1">
          <span class="text-orange-400">1.</span>
          <span>Размещайте фигуры на доске 8х8 клеточек.</span>
        </div>
        <div class="flex items-start gap-1">
          <span class="text-orange-400">2.</span>
          <span>Фигуры <b class="text-red-500 uppercase">нельзя вращать</b> — ставьте как есть.</span>
        </div>
        <div class="flex items-start gap-1">
          <span class="text-orange-400">3.</span>
          <span>Заполненные ряды и столбцы сгорают и очищают место.</span>
        </div>
        <div class="flex items-start gap-1">
          <span class="text-orange-400">4.</span>
          <span><b>Рекордный Streak:</b> Одно за другим сжигание линий умножает очки лавиной.</span>
        </div>
      </div>

      <!-- Quick Theme Switch on Lobby screen to have beautiful contrast -->
      <div class="flex items-center gap-2 mb-4">
        <button
          @click="toggleTheme"
          class="px-4 py-1.5 border rounded-lg text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition"
          :class="isLightTheme ? 'text-slate-700 bg-slate-100 border-slate-205 hover:bg-slate-200' : 'text-slate-300 bg-slate-900/80 border-slate-800 hover:bg-slate-850'"
        >
          <span class="material-symbols-outlined text-xs">
            {{ isLightTheme ? 'dark_mode' : 'light_mode' }}
          </span>
          Цветовая тема: {{ isLightTheme ? 'Светлая' : 'Тёмная' }}
        </button>
      </div>

      <button
        @click="startGame"
        class="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl font-black text-xs tracking-wider transition border-none shadow-md cursor-pointer active:scale-95"
      >
        ИГРАТЬ
      </button>
    </div>

    <!-- Game Over glass Modal view of game -->
    <div
      v-if="gameOver"
      class="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20 transition-all duration-300 backdrop-blur-md"
      :class="isLightTheme ? 'bg-white/95 text-slate-900' : 'bg-slate-950/95 text-white'"
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg border"
        :class="isLightTheme ? 'bg-red-50 border-red-200 text-red-500' : 'bg-red-50/10 border-red-500/25 text-red-500'"
      >
        <i class="bi bi-exclamation-triangle-fill text-3xl"></i>
      </div>
      <h2 class="text-xl font-black mb-2 tracking-tight uppercase" :class="isLightTheme ? 'text-slate-900' : 'text-white'">
        Конец игры
      </h2>
      <p class="text-xs font-semibold mb-5 leading-normal" :class="isLightTheme ? 'text-slate-600' : 'text-slate-400'">
        Нет доступных ходов для оставшихся фигур! <br />
        Итоговый счёт: <span class="text-emerald-500 font-bold font-mono text-sm block mt-1" :class="isLightTheme ? 'text-emerald-600' : 'text-emerald-450'">{{ score }}</span>
        Рекорд: <span class="text-yellow-500 font-bold font-mono" :class="isLightTheme ? 'text-yellow-650' : 'text-yellow-450'">{{ highScore }}</span>
      </p>
      
      <button
        @click="restartGame"
        class="px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-xl font-black text-xs tracking-widest transition border-none shadow-md cursor-pointer active:scale-95"
      >
        НАЧАТЬ ЗАНОВО
      </button>
    </div>

    <!-- Bottom credit section -->
    <div
      class="w-full max-w-[340px] py-1 px-3 border rounded-2xl text-center text-[8px] sm:text-[8.5px] font-bold tracking-wide leading-normal shrink-0 mt-0.5 sm:mt-1.5 font-sans transition-all duration-300"
      :class="isLightTheme ? 'bg-white/80 border-slate-200 text-slate-600' : 'bg-slate-900/40 border-slate-800/40 text-slate-400'"
    >
      <i class="bi bi-award-fill text-amber-400 mr-0.5"></i>
      Блок Бласт: Фигуры фиксированы по вращению. Доска 8х8.
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";
import { useMainStore } from "../../store";

// 21 Pre-rotated shapes representing classic and balanced block combinations
const SHAPES_POOL = [
  // 1. Single dot cell
  { shape: [[1]], color: "#6366f1" }, // Indigo

  // 2. Tiny 1x2 Blocks
  { shape: [[1, 1]], color: "#06b6d4" }, // Cyan
  { shape: [[1], [1]], color: "#06b6d4" },

  // 3. 1x3 Blocks
  { shape: [[1, 1, 1]], color: "#10b981" }, // Emerald
  { shape: [[1], [1], [1]], color: "#10b981" },

  // 4. 1x4 Blocks
  { shape: [[1, 1, 1, 1]], color: "#f59e0b" }, // Amber
  { shape: [[1], [1], [1], [1]], color: "#f59e0b" },

  // 5. Square 2x2
  { shape: [[1, 1], [1, 1]], color: "#8b5cf6" }, // Violet

  // 6. Corner mini L (2x2)
  { shape: [[1, 1], [1, 0]], color: "#f43f5e" }, // Rose orientations:
  { shape: [[1, 1], [0, 1]], color: "#f43f5e" },
  { shape: [[1, 0], [1, 1]], color: "#f43f5e" },
  { shape: [[0, 1], [1, 1]], color: "#f43f5e" },

  // 7. Corner large L (3x3)
  { shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: "#ec4899" }, // Pink orientations:
  { shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: "#ec4899" },
  { shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: "#ec4899" },
  { shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: "#ec4899" },

  // 8. T-Shapes (3x2 or 2x3)
  { shape: [[1, 1, 1], [0, 1, 0]], color: "#3b82f6" }, // Blue
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#3b82f6" },

  // 9. Diagonal Step Z & S (3x2)
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#14b8a6" }, // Teal
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#14b8a6" }
];

export default {
  data() {
    return {
      hasStarted: false,
      gameOver: false,
      score: 0,
      highScore: Number(localStorage.getItem("blockblast_highscore")) || 0,
      streak: 0,

      // 8x8 Board. 0 = empty, hex-string = filled filled block color
      grid: Array.from({ length: 8 }, () => Array(8).fill(0)),

      // The triple selection container
      blockTray: [null, null, null],

      // Selected block index for click-to-place method
      selectedBlockIndex: null,

      // Volume Controls
      isMuted: localStorage.getItem("tetris_muted") === "true",

      // Line clearing trackers (active animate flash)
      clearingCells: [], // List of { r, c } values currently in sweep animation

      // Drag representation properties
      isDragging: false,
      draggedSlotIndex: null,
      dragX: 0,
      dragY: 0,
      dragTouchOffsetY: 80, // Offset dragged piece higher so finger doesn't obscure it at all

      // Active Hover visual highlighting
      hoveredRow: -1,
      hoveredCol: -1,

      // Multipliers / Floaters indicators
      activeStreakToast: false,
      activeComboToast: false,
      activeComboLines: 0
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    activeDraggedBlock() {
      if (this.draggedSlotIndex !== null) {
        return this.blockTray[this.draggedSlotIndex];
      }
      return null;
    },
    activeClickedBlock() {
      if (this.selectedBlockIndex !== null) {
        return this.blockTray[this.selectedBlockIndex];
      }
      return null;
    }
  },
  methods: {
    // Tactile phone haptics
    vibrate(pattern) {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(pattern);
        } catch (e) {
          console.debug("Haptics blocked:", e);
        }
      }
    },

    // Audio wrapper
    playGameSound(soundName, ...args) {
      if (this.isMuted) return;
      if (playSound && playSound[soundName]) {
        playSound[soundName](...args);
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      localStorage.setItem("tetris_muted", this.isMuted ? "true" : "false");
      this.vibrate(10);
    },

    // Convert pixel coordinates to local coordinate percentage of container to keep within iframe scaling bounds safely
    pxToPercentage(val, axis) {
      if (axis === "x") {
        return `${val}px`;
      }
      return `${val}px`;
    },

    // Helper functions for board cell grid
    getRow(idx) {
      return Math.floor((idx - 1) / 8);
    },

    getCol(idx) {
      return (idx - 1) % 8;
    },

    getCellClass(r, c) {
      const isFilled = this.grid[r][c] !== 0;
      const isGhost = this.isGhostCell(r, c);

      return {
        "border-slate-800/10 bg-slate-900/10": !isFilled && !isGhost,
        "scale-100 z-10": isGhost && !isFilled,
        "border-white/10 scale-100": isFilled
      };
    },

    getCellStyle(r, c) {
      const isFilled = this.grid[r][c] !== 0;
      const isGhost = this.isGhostCell(r, c);

      if (isFilled) {
        const color = this.grid[r][c];
        return {
          backgroundColor: color,
          borderWidth: "2.5px",
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 0.45) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4) rgba(255, 255, 255, 0.45)",
          boxShadow: `inset 2px 2px 0px rgba(255, 255, 255, 0.25), inset -2px -2px 0px rgba(0, 0, 0, 0.35), 0 3px 6px ${color}4d`,
          borderRadius: "2px"
        };
      } else if (isGhost && this.activeClickedBlock) {
        const color = this.activeClickedBlock.color;
        return {
          backgroundColor: `${color}2b`, // Clearer 17% opacity shape color
          borderColor: color, // Highlight border
          borderWidth: "2px",
          borderStyle: "dashed",
          boxShadow: `0 0 10px ${color}a0, inset 0 0 6px ${color}40`,
          borderRadius: "2px"
        };
      } else if (isGhost && this.activeDraggedBlock) {
        const color = this.activeDraggedBlock.color;
        return {
          backgroundColor: `${color}38`, // Solid 22% opacity highlight
          borderColor: "#ffffff", // Pure white bold outline so it is extremely distinct!
          borderWidth: "2.5px",
          borderStyle: "dashed",
          boxShadow: `0 0 12px ${color}, inset 0 0 8px ${color}`,
          borderRadius: "2px"
        };
      }
      return {};
    },

    isClearingCell(r, c) {
      return this.clearingCells.some(cell => cell.r === r && cell.c === c);
    },

    // Flatten shapes for SVG/HTML preview cells rendering
    flattenShape(shape) {
      const flat = [];
      let cellCount = 0;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          flat.push({
            id: ++cellCount,
            active: shape[r][c] !== 0
          });
        }
      }
      return flat;
    },

    // Check if cell is highlighted as ghost placement preview
    isGhostCell(r, c) {
      // Direct Select Active Ghost Check
      if (this.selectedBlockIndex !== null && this.hoveredRow !== -1 && this.hoveredCol !== -1) {
        const shape = this.activeClickedBlock.shape;
        if (this.canPlaceBlockAt(this.grid, shape, this.hoveredRow, this.hoveredCol)) {
          const sRows = shape.length;
          const sCols = shape[0].length;
          if (r >= this.hoveredRow && r < this.hoveredRow + sRows && c >= this.hoveredCol && c < this.hoveredCol + sCols) {
            return shape[r - this.hoveredRow][c - this.hoveredCol] !== 0;
          }
        }
      }

      // Dragging Ghost Check
      if (this.isDragging && this.activeDraggedBlock) {
        const shape = this.activeDraggedBlock.shape;
        const dragGridPos = this.getGridCellFromCoords(this.dragX, this.dragY);
        if (dragGridPos) {
          const { row, col } = dragGridPos;
          if (this.canPlaceBlockAt(this.grid, shape, row, col)) {
            const sRows = shape.length;
            const sCols = shape[0].length;
            if (r >= row && r < row + sRows && c >= col && c < col + sCols) {
              return shape[r - row][c - col] !== 0;
            }
          }
        }
      }

      return false;
    },

    // Initialize block slots
    generateNewBlockTray() {
      const list = [];
      for (let i = 0; i < 3; i++) {
        const randIdx = Math.floor(Math.random() * SHAPES_POOL.length);
        const refShapeObj = SHAPES_POOL[randIdx];
        list.push({
          shape: JSON.parse(JSON.stringify(refShapeObj.shape)),
          color: refShapeObj.color
        });
      }
      this.blockTray = list;

      // Verify immediately if at least one of the 3 figures can be placed anywhere
      this.checkEndGameCondition();
    },

    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.store.updateSessionScore(0);
      this.streak = 0;
      this.grid = Array.from({ length: 8 }, () => Array(8).fill(0));
      this.selectedBlockIndex = null;
      this.clearingCells = [];

      this.generateNewBlockTray();
      this.playGameSound("levelUp");
    },

    restartGame() {
      this.startGame();
    },

    // Click/Tap-to-select method
    selectBlockFromTray(index) {
      if (!this.blockTray[index]) return;
      this.vibrate(12);
      this.playGameSound("tick");

      if (this.selectedBlockIndex === index) {
        this.selectedBlockIndex = null;
      } else {
        this.selectedBlockIndex = index;
      }
    },

    onCellMouseEnter(r, c) {
      this.hoveredRow = r;
      this.hoveredCol = c;
    },

    onCellMouseLeave(r, c) {
      if (this.hoveredRow === r && this.hoveredCol === c) {
        this.hoveredRow = -1;
        this.hoveredCol = -1;
      }
    },

    // Click on target grid cell to place Selected Block
    onCellClick(r, c) {
      if (this.selectedBlockIndex === null) return;
      const block = this.blockTray[this.selectedBlockIndex];
      if (!block) return;

      if (this.canPlaceBlockAt(this.grid, block.shape, r, c)) {
        this.placeBlock(this.selectedBlockIndex, r, c);
      } else {
        // Failed placement alert
        this.vibrate([40, 40]);
        this.playGameSound("tick");
      }
    },

    // DRAG AND DROP MECHANICS START
    onBlockMouseDown(e, index) {
      if (!this.blockTray[index] || e.button !== 0) return;
      e.preventDefault();
      this.startDrag(index, e.clientX, e.clientY);
    },

    onBlockTouchStart(e, index) {
      if (!this.blockTray[index]) return;
      const t = e.touches[0];
      if (!t) return;
      // Do not call e.preventDefault() so click selection option is maintained smoothly or fallback is allowed
      this.startDrag(index, t.clientX, t.clientY);
    },

    startDrag(index, clientX, clientY) {
      this.vibrate(15);
      this.playGameSound("tick");
      
      const container = this.$refs.gameContainer;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      this.isDragging = true;
      this.draggedSlotIndex = index;
      // Convert current screen coordinates to container-relative coordinate position
      this.dragX = clientX - rect.left;
      this.dragY = clientY - rect.top - this.dragTouchOffsetY; // Offset higher than touch coordinate
      this.selectedBlockIndex = null; // Overwrite tap method
    },

    onGlobalMouseMove(e) {
      if (!this.isDragging) return;
      const container = this.$refs.gameContainer;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      this.dragX = e.clientX - rect.left;
      this.dragY = e.clientY - rect.top - this.dragTouchOffsetY;
    },

    onGlobalTouchMove(e) {
      if (!this.isDragging) return;
      const t = e.touches[0];
      if (!t) return;
      const container = this.$refs.gameContainer;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // Horizontal and vertical movement
      this.dragX = t.clientX - rect.left;
      this.dragY = t.clientY - rect.top - this.dragTouchOffsetY;
    },

    onGlobalMouseUp(e) {
      if (!this.isDragging) return;
      this.endDrag();
    },

    onGlobalTouchEnd(e) {
      if (!this.isDragging) return;
      this.endDrag();
    },

    endDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;

      const slotIdx = this.draggedSlotIndex;
      const block = this.blockTray[slotIdx];

      if (block) {
        const gridCell = this.getGridCellFromCoords(this.dragX, this.dragY);
        if (gridCell && this.canPlaceBlockAt(this.grid, block.shape, gridCell.row, gridCell.col)) {
          this.placeBlock(slotIdx, gridCell.row, gridCell.col);
        } else {
          // Snap back
          this.vibrate(20);
          this.playGameSound("tick");
        }
      }

      this.draggedSlotIndex = null;
    },

    // Deduce 8x8 cell index from relative dragged coordinates
    getGridCellFromCoords(x, y) {
      const grid = this.$refs.gridElement;
      const container = this.$refs.gameContainer;
      if (!grid || !container) return null;

      const gRect = grid.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();

      // Convert from relative container coordinates to absolute screen pixels
      const screenX = x + cRect.left;
      const screenY = y + cRect.top; // Center coordinates of the floating shape silhouette itself

      const relX = screenX - gRect.left;
      const relY = screenY - gRect.top;

      const cellSize = gRect.width / 8;

      let col = Math.floor(relX / cellSize);
      let row = Math.floor(relY / cellSize);

      // Adjust to compensate dragging center offset. Let's align top-left of the piece!
      const block = this.activeDraggedBlock;
      if (block) {
        const bRows = block.shape.length;
        const bCols = block.shape[0].length;
        row = row - Math.floor(bRows / 2);
        col = col - Math.floor(bCols / 2);
      }

      if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        return { row, col };
      }
      return null;
    },
    // DRAG AND DROP MECHANICS END

    // Core validation: checks if block can be placed at specific coordinate
    canPlaceBlockAt(board, shape, row, col) {
      const bRows = shape.length;
      const bCols = shape[0].length;

      if (row < 0 || row + bRows > 8 || col < 0 || col + bCols > 8) {
        return false;
      }

      for (let r = 0; r < bRows; r++) {
        for (let c = 0; c < bCols; c++) {
          if (shape[r][c] !== 0) {
            if (board[row + r][col + c] !== 0) {
              return false;
            }
          }
        }
      }
      return true;
    },

    // Placement implementation
    placeBlock(trayIndex, row, col) {
      const block = this.blockTray[trayIndex];
      if (!block) return;

      const shape = block.shape;
      const bRows = shape.length;
      const bCols = shape[0].length;

      // Log/Write shape to board matrix
      let cellsPlaced = 0;
      for (let r = 0; r < bRows; r++) {
        for (let c = 0; c < bCols; c++) {
          if (shape[r][c] !== 0) {
            this.grid[row + r][col + c] = block.color;
            cellsPlaced++;
          }
        }
      }

      // Add base points immediately matching the number of cells placed
      this.score += cellsPlaced;
      this.store.updateSessionScore(this.score);
      this.selectedBlockIndex = null;
      this.blockTray[trayIndex] = null; // Clear from tray

      this.vibrate(25);
      this.playGameSound("score");

      // Verify and sweep fully filled lines
      this.processLineChecks();
    },

    // Clear completed columns & rows
    processLineChecks() {
      const rowsToClear = [];
      const colsToClear = [];

      // 1. Identify completed rows
      for (let r = 0; r < 8; r++) {
        if (this.grid[r].every(cell => cell !== 0)) {
          rowsToClear.push(r);
        }
      }

      // 2. Identify completed cols
      for (let c = 0; c < 8; c++) {
        let colComplete = true;
        for (let r = 0; r < 8; r++) {
          if (this.grid[r][c] === 0) {
            colComplete = false;
            break;
          }
        }
        if (colComplete) {
          colsToClear.push(c);
        }
      }

      const totalLines = rowsToClear.length + colsToClear.length;

      if (totalLines > 0) {
        // Continuous Streak Increment
        this.streak++;
        this.activeComboLines = totalLines;

        // Populate clearing cells list for animation flash triggers
        const cellsToFlash = [];
        rowsToClear.forEach(r => {
          for (let c = 0; c < 8; c++) {
            cellsToFlash.push({ r, c });
          }
        });
        colsToClear.forEach(c => {
          for (let r = 0; r < 8; r++) {
            if (!cellsToFlash.some(already => already.r === r && already.c === c)) {
              cellsToFlash.push({ r, c });
            }
          }
        });

        this.clearingCells = cellsToFlash;
        this.vibrate([40, 30, 40]);
        this.playGameSound("levelUp");

        // Double combo and streak multipliers toast floats
        if (totalLines >= 2) {
          this.activeComboToast = true;
          setTimeout(() => {
            this.activeComboToast = false;
          }, 1800);
        }

        if (this.streak >= 2) {
          this.activeStreakToast = true;
          setTimeout(() => {
            this.activeStreakToast = false;
          }, 1800);
        }

        // Animate clear transition window
        setTimeout(() => {
          // Empty the visual board cells definitely
          rowsToClear.forEach(r => {
            this.grid[r] = Array(8).fill(0);
          });
          colsToClear.forEach(c => {
            for (let r = 0; r < 8; r++) {
              this.grid[r][c] = 0;
            }
          });

          // Points distribution system
          // 1 line: 100, 2 lines: 300, 3 lines: 600, 4 lines: 1000, 5+ lines: 1500
          const pointMapping = [0, 100, 300, 600, 1000, 1500, 2000, 2500, 3000];
          const linesClearedCoreValue = pointMapping[totalLines] || (totalLines * 500);

          // Apply Streak ratio (Core points * (1 + (streak_count - 1) * 0.5))
          const multiplier = 1 + (this.streak - 1) * 0.5;
          const pointsEarned = Math.round(linesClearedCoreValue * multiplier);

          this.score += pointsEarned;
          this.store.updateSessionScore(this.score);
          this.clearingCells = []; // Reset visual overlay

          this.checkTrayProgress();
        }, 220);
      } else {
        // Did not clear any line. Reset streak sequence
        this.streak = 0;
        this.checkTrayProgress();
      }
    },

    // Verify if tray has been completely dispatched. If yes, generate next 3
    checkTrayProgress() {
      // Check if all slots are null
      const allNull = this.blockTray.every(item => item === null);
      if (allNull) {
        this.generateNewBlockTray();
      } else {
        // Block tray still has items. Verify if they have legal plays left
        this.checkEndGameCondition();
      }

      // Sync Highscore
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem("blockblast_highscore", String(this.highScore));
      }
    },

    // End Game evaluation checks
    canPlaceBlockAnywhere(shape) {
      if (!shape) return false;
      const sRows = shape.length;
      const sCols = shape[0].length;

      for (let r = 0; r <= 8 - sRows; r++) {
        for (let c = 0; c <= 8 - sCols; c++) {
          let fits = true;
          for (let br = 0; br < sRows; br++) {
            for (let bc = 0; bc < sCols; bc++) {
              if (shape[br][bc] !== 0) {
                if (this.grid[r + br][c + bc] !== 0) {
                  fits = false;
                  break;
                }
              }
            }
            if (!fits) break;
          }
          if (fits) return true;
        }
      }
      return false;
    },

    checkEndGameCondition() {
      let isAnyPlacable = false;
      for (let i = 0; i < 3; i++) {
        const item = this.blockTray[i];
        if (item) {
          if (this.canPlaceBlockAnywhere(item.shape)) {
            isAnyPlacable = true;
          }
        }
      }

      // No pieces are eligible for placement anywhere
      const remainingPieces = this.blockTray.some(item => item !== null);
      if (remainingPieces && !isAnyPlacable) {
        this.triggerGameOver();
      }
    },

    triggerGameOver() {
      this.gameOver = true;
      this.playGameSound("gameOver");
      this.vibrate([100, 100, 200]);
    }
  }
};
</script>

<style scoped>
@keyframes flash-gold {
  0% {
    opacity: 0.1;
  }
  20% {
    opacity: 1;
    background-color: #ffffff;
    box-shadow: 0 0 15px #ffedd5;
  }
  100% {
    opacity: 0.8;
    background-color: #f97316;
  }
}

.animate-flash-gold {
  animation: flash-gold 0.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}

@keyframes scale-out {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.animate-scale-out {
  animation: scale-out 0.22s ease-out forwards;
}

/* Float fade visual micro toasts transitions */
.toast-float-enter-active,
.toast-float-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-float-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.85);
}
.toast-float-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.block-blast-grid {
  width: min(300px, 78vw, 40vh);
  height: min(300px, 78vw, 40vh);
}
@media (min-width: 350px) {
  .block-blast-grid {
    width: min(330px, 80vw, 44vh);
    height: min(330px, 80vw, 44vh);
  }
}
@media (min-width: 400px) {
  .block-blast-grid {
    width: min(360px, 84vw, 48vh);
    height: min(360px, 84vw, 48vh);
  }
}
</style>
