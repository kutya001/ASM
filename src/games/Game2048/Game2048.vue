<template>
  <div
    class="flex flex-col items-center justify-between h-full p-4 select-none relative overflow-hidden transition-colors duration-500"
    :class="themeRootClass"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Glassmorphic Top Score HUD Tracker & Theme Selection Pager -->
    <div class="w-full flex flex-col gap-3 z-10 shrink-0">
      <div class="w-full flex justify-between items-center bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-3 shadow-lg">
        <div class="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60 shadow-inner">
          <div>
            <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Счёт</span>
            <span class="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono leading-none">{{ score }}</span>
          </div>
        </div>

        <div class="text-center">
          <span class="block text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none animate-pulse-glow mb-0.5">Супер-2048</span>
          <span class="text-[9px] font-bold text-slate-500 font-sans leading-none block">БЕЗКНОПОЧНЫЙ</span>
        </div>

        <div class="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60 shadow-inner text-right">
          <div>
            <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Рекорд</span>
            <span class="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300 font-mono leading-none">{{ highscore }}</span>
          </div>
        </div>
      </div>

      <!-- Theme Selector Pill Bar -->
      <div class="flex justify-between items-center bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-xl p-1 shadow-md w-full max-w-[340px] mx-auto">
        <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-2">Тема:</span>
        <div class="flex gap-1">
          <button
            v-for="theme in themes"
            :key="theme.id"
            @click="activeTheme = theme.id"
            class="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 border-none cursor-pointer"
            :class="activeTheme === theme.id ? theme.btnClass : 'text-slate-400 hover:text-slate-200 bg-transparent'"
          >
            {{ theme.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Active 4x4 Sliding Arena -->
    <div ref="gridContainer" class="flex-grow w-full max-w-[340px] flex items-center justify-center relative my-1 z-10 shrink-0">
      <!-- Outer Glass Board frame -->
      <div 
        class="relative w-full aspect-square border rounded-3xl p-3 shadow-2xl overflow-hidden transition-all duration-300"
        :class="themeBoardClass"
      >
        <!-- Render 4x4 Grid slots backing -->
        <div class="grid grid-cols-4 grid-rows-4 gap-2.5 h-full w-full">
          <div
            v-for="n in 16"
            :key="'bg-' + n"
            class="rounded-xl border shadow-inner transition-colors duration-300"
            :class="themeSlotClass"
          ></div>
        </div>

        <!-- Render active sliding tiles layer -->
        <div class="absolute inset-0 p-3 pointer-events-none">
          <div class="relative w-full h-full">
            <!-- Outer wrapper translates with precision on scale bounds -->
            <div
              v-for="tile in activeRenderTiles"
              :key="tile.id"
              class="absolute rounded-xl font-black select-none pointer-events-none transition-transform duration-150 ease-[cubic-bezier(0.25,1,0.5,1)]"
              :style="{
                width: 'calc(25% - 7.5px)',
                height: 'calc(25% - 7.5px)',
                left: '0',
                top: '0',
                transform: `translate3d(calc(${tile.c * 100}% + ${tile.c * 10}px), calc(${tile.r * 100}% + ${tile.r * 10}px), 0)`
              }"
            >
              <!-- Inner element handles pop spawn scales perfectly, avoiding coordinate collisions -->
              <div
                class="w-full h-full rounded-xl flex flex-col items-center justify-center overflow-hidden shadow-md transition-colors duration-300"
                :class="[
                  getTileClass(tile.val),
                  tile.pop ? 'animate-tile-pop' : '',
                  tile.isNew ? 'animate-tile-spawn' : ''
                ]"
              >
                <span class="text-xl md:text-2xl leading-none font-bold tracking-tight font-sans block text-center"
                  :class="tile.val >= 1024 ? 'scale-90' : ''"
                >
                  {{ tile.val }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Float Merge Particles overlay canvas -->
        <canvas ref="particleCanvas" class="absolute inset-0 pointer-events-none z-15"></canvas>
      </div>

      <!-- Glassmorphic Won Overlay -->
      <div
        v-if="hasWon && !continuePlaying"
        class="absolute inset-0 bg-indigo-950/80 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-6 text-center z-25 animate-fade-in"
      >
        <div class="relative w-14 h-14 bg-amber-500/10 border border-amber-500/25 rounded-full flex items-center justify-center text-amber-400 mb-4 animate-bounce">
          <i class="bi bi-star-fill text-2xl"></i>
        </div>
        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 mb-1 tracking-tight uppercase">
          ВЫ СДЕЛАЛИ 2048!
        </h2>
        <p class="text-[11px] font-semibold text-slate-300 max-w-[220px] mb-6 leading-relaxed">
          Легендарная цель достигнута. Желаете продолжить устанавливать мировые рекорды?
        </p>

        <div class="flex gap-3 w-full max-w-[220px] justify-center text-center">
          <button
            @click="continuePlaying = true"
            class="flex-1 py-1 px-2.5 bg-slate-900 border border-slate-800 hover:text-white text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer h-10"
          >
            Дальше
          </button>
          <button
            @click="restartGame"
            class="flex-1 py-1 px-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border-none cursor-pointer shadow h-10"
          >
            Сброс
          </button>
        </div>
      </div>

      <!-- Glassmorphic Game Over Overlay -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/85 backdrop-blur-lg rounded-3xl flex flex-col items-center justify-center p-6 text-center z-25 animate-fade-in"
      >
        <div class="relative w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-x-octagon text-3xl"></i>
        </div>
        <h2 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-1 tracking-wide uppercase">
          ГЕЙМ ОВЕР!
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-6 leading-normal">
          Достигнутый результат:<br>
          <span class="text-emerald-400 font-bold font-mono text-base leading-normal">{{ score }} очков</span>.
        </p>
        <button
          @click="restartGame"
          class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-cyan-600 hover:scale-105 active:scale-95 text-white rounded-xl font-extrabold text-[10px] uppercase tracking-widest transition-all duration-200 border-none shadow-md cursor-pointer"
        >
          Играть снова
        </button>
      </div>
    </div>

    <!-- Long-Press Radial Reset circular indicator overlay -->
    <div
      v-if="pressProgress > 0"
      class="absolute inset-0 bg-slate-950/45 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none"
    >
      <div class="bg-slate-950/95 border border-slate-800 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-2xl max-w-[200px] text-center">
        <div class="relative w-20 h-20 flex items-center justify-center">
          <svg class="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="44" cy="44" r="32" class="stroke-slate-900" stroke-width="4.5" fill="transparent"/>
            <circle cx="44" cy="44" r="32" class="stroke-cyan-500 transition-all duration-75" stroke-width="4.5" fill="transparent"
              :stroke-dasharray="2 * Math.PI * 32"
              :stroke-dashoffset="2 * Math.PI * 32 * (1 - pressProgress)"
            />
          </svg>
          <div class="text-[12px] font-black text-cyan-400 font-mono">
            {{ Math.round(pressProgress * 100) }}%
          </div>
        </div>
        <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-normal">
          УДЕРЖИВАЙТЕ ДЛЯ СБРОСА
        </div>
      </div>
    </div>

    <!-- Minimalist Gesture Legend info panel -->
    <div class="w-full max-w-[320px] py-3 px-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl text-center text-slate-400 text-[10px] font-bold leading-normal shrink-0 mt-2 space-y-1 z-10 shadow-sm">
      <div class="flex items-center justify-center gap-1.5">
        <i class="bi bi-hand-index-thumb text-cyan-400"></i>
        <span>Проведите <span class="text-cyan-400">1 пальцем</span> для сдвига плиток</span>
      </div>
      <div class="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
        <i class="bi bi-arrow-counterclockwise text-emerald-400 text-xs"></i>
        <span>Коснитесь <span class="text-emerald-400">2 пальцами</span> и проведите влево для Undo</span>
      </div>
      <div class="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
        <i class="bi bi-fingerprint text-indigo-400 text-xs"></i>
        <span>Зажмите экран на <span class="text-indigo-400">2 секунды</span> для сброса</span>
      </div>
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";
import { useMainStore } from "../../store";

export default {
  data() {
    return {
      // Game State
      tiles: [], // list of smooth moving objects: { id, val, r, c, merged, pop, isNew }
      score: 0,
      highscore: Number(localStorage.getItem("game_2048_highscore")) || 0,
      gameOver: false,
      hasWon: false,
      continuePlaying: false,
      
      // Control Engine Mechanics
      tileIdCounter: 1, // incremental tile ID generator
      isMovingPhase: false, // input throttle during 150ms dynamic transition
      
      // Undo Stack
      history: [], // serialised historical states copy (max limit 12)
      
      // Swipe Tracking state
      touchStart: { x: 0, y: 0 },
      isSwipeTrackActive: false,
      
      // 2 Finger Undo Swipe Gesture state
      twoFingerSwipeStart: null,
      isTwoFingersActive: false,
      
      // Radial Hold Progressive state
      pressProgress: 0,
      pressInterval: null,
      isHoldingPress: false,
      
      // Particle list mapping
      particles: [],
      animationFrameId: null,

      // Theme configuration options
      activeTheme: localStorage.getItem("game_2048_theme") || "CYBER",
      themes: [
        { 
          id: "CYBER", 
          name: "Кибер", 
          btnClass: "bg-cyan-500 text-slate-950 font-black shadow-cyan-500/20" 
        },
        { 
          id: "AURORA", 
          name: "Матрица", 
          btnClass: "bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20" 
        },
        { 
          id: "SUNSET", 
          name: "Закат", 
          btnClass: "bg-pink-500 text-slate-950 font-black shadow-pink-500/20" 
        },
        { 
          id: "CANDY", 
          name: "Конфета", 
          btnClass: "bg-fuchsia-400 text-slate-950 font-black shadow-fuchsia-400/20" 
        }
      ]
    };
  },
  computed: {
    // Only render live tiles to match standard 2D view
    activeRenderTiles() {
      return this.tiles;
    },
    themeRootClass() {
      switch (this.activeTheme) {
        case "CYBER": return "bg-slate-950 text-white";
        case "AURORA": return "bg-[#040a08] text-emerald-100";
        case "SUNSET": return "bg-[#090310] text-pink-100";
        case "CANDY": return "bg-[#04030f] text-violet-100";
        default: return "bg-slate-950 text-white";
      }
    },
    themeBoardClass() {
      switch (this.activeTheme) {
        case "CYBER": return "bg-slate-950/80 border-slate-800/80 shadow-cyan-500/5";
        case "AURORA": return "bg-emerald-950/25 border border-emerald-900/40 shadow-emerald-500/5";
        case "SUNSET": return "bg-purple-950/20 border border-purple-900/40 shadow-rose-500/5";
        case "CANDY": return "bg-indigo-950/20 border border-indigo-900/40 shadow-pink-500/5";
        default: return "bg-slate-950/80 border-slate-800";
      }
    },
    themeSlotClass() {
      switch (this.activeTheme) {
        case "CYBER": return "bg-slate-900/30 border-slate-800/30";
        case "AURORA": return "bg-emerald-900/10 border-emerald-800/25";
        case "SUNSET": return "bg-pink-900/10 border-pink-800/25";
        case "CANDY": return "bg-indigo-900/10 border border-white/5";
        default: return "bg-slate-900/30 border-slate-800/30";
      }
    },
    store() {
      return useMainStore();
    }
  },
  watch: {
    activeTheme(newTheme) {
      localStorage.setItem("game_2048_theme", newTheme);
      this.saveStateToLocalStorage();
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    
    // Load local storage session backup
    this.restoreStateFromLocalStorage();
    
    // Setup graphic high-dpi overlays canvas loop
    this.setupHighDPICanvas();
    this.startDrawLoop();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.pressInterval) {
      clearInterval(this.pressInterval);
    }
  },
  methods: {
    // Haptics with sandbox protection
    vibrate(ms) {
      if (typeof window !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(ms);
        } catch (_) {}
      }
    },
    setupHighDPICanvas() {
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const setDimensions = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      };
      setDimensions();
    },
    startDrawLoop() {
      const loop = () => {
        this.updateAndDrawParticles();
        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    },
    triggerFusionSplash(r, c, mergedValue) {
      // Fusion Merge Color matching based on theme
      const theme = this.activeTheme;
      let color = "#ffffff";
      if (theme === "CYBER") {
        if (mergedValue <= 16) color = "#06b6d4"; // Cyan
        else if (mergedValue <= 64) color = "#fb923c"; // Orange
        else if (mergedValue <= 512) color = "#a855f7"; // Purple
        else color = "#fbbf24"; // Amber gold
      } else if (theme === "AURORA") {
        if (mergedValue <= 16) color = "#10b981"; // Emerald
        else if (mergedValue <= 64) color = "#84cc16"; // Lime
        else if (mergedValue <= 512) color = "#06b6d4"; // Cyan
        else color = "#22c55e"; // Grass green
      } else if (theme === "SUNSET") {
        if (mergedValue <= 16) color = "#f43f5e"; // Rose
        else if (mergedValue <= 64) color = "#ec4899"; // Pink
        else if (mergedValue <= 512) color = "#e11d48"; // Crimson
        else color = "#f59e0b"; // Gold / sunset yellow
      } else if (theme === "CANDY") {
        if (mergedValue <= 16) color = "#38bdf8"; // Pastel Sky
        else if (mergedValue <= 64) color = "#f472b6"; // Soft pink
        else if (mergedValue <= 512) color = "#c084fc"; // Lilac
        else color = "#fbbf24"; // Gold
      }
      
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      
      // Calculate origin coordinates relative to cell
      const wCell = canvas.width / 4;
      const hCell = canvas.height / 4;
      const ox = c * wCell + wCell / 2;
      const oy = r * hCell + hCell / 2;
      
      // Explode 9-11 particles
      const count = 10;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        this.particles.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          size: 1.5 + Math.random() * 3.0,
          opacity: 1.0,
          life: 15 + Math.floor(Math.random() * 10),
          maxLife: 25
        });
      }
    },
    updateAndDrawParticles() {
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.opacity = Math.max(0, p.life / p.maxLife);
        
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      // purge faint particles
      this.particles = this.particles.filter(p => p.life > 0);
    },
    restartGame() {
      this.tiles = [];
      this.score = 0;
      this.store.updateSessionScore(0);
      this.gameOver = false;
      this.hasWon = false;
      this.continuePlaying = false;
      this.history = [];
      this.tileIdCounter = 1;
      
      this.addRandomTile();
      this.addRandomTile();
      this.saveStateToLocalStorage();
      playSound.levelUp();
      this.vibrate(20);
    },
    addRandomTile() {
      const gridState = Array(4).fill(0).map(() => Array(4).fill(0));
      this.tiles.forEach(t => {
        if (!t.merged) {
          gridState[t.r][t.c] = t.val;
        }
      });
      
      const emptyCells = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (gridState[r][c] === 0) {
            emptyCells.push({ r, c });
          }
        }
      }
      
      if (emptyCells.length > 0) {
        const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const val = Math.random() < 0.9 ? 2 : 4;
        this.tiles.push({
          id: this.tileIdCounter++,
          val: val,
          r: rand.r,
          c: rand.c,
          merged: false,
          pop: false,
          isNew: true
        });
      }
    },
    getTileClass(val) {
      if (!val) return "bg-transparent";
      
      const theme = this.activeTheme;
      
      if (theme === "CYBER") {
        switch (val) {
          case 2: return "bg-slate-900 border border-cyan-500/30 text-cyan-400 shadow-cyan-500/5";
          case 4: return "bg-slate-900 border border-teal-500/30 text-teal-400 shadow-teal-400/5";
          case 8: return "bg-indigo-950/80 border border-indigo-400/40 text-indigo-300 shadow-indigo-500/10";
          case 16: return "bg-amber-950/80 border border-amber-500/40 text-amber-400 shadow-amber-500/10";
          case 32: return "bg-orange-950/80 border border-orange-500/55 text-orange-400 shadow-orange-500/15 font-bold";
          case 64: return "bg-pink-950/80 border border-pink-500/55 text-pink-400 shadow-pink-500/15 font-bold";
          case 128: return "bg-violet-950 border border-violet-400/60 text-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold";
          case 256: return "bg-violet-900 border border-fuchsia-400/70 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.3)] font-bold";
          case 512: return "bg-fuchsia-950 border border-pink-500 text-pink-300 shadow-[0_0_18px_rgba(236,72,153,0.35)] font-extrabold";
          case 1024: return "bg-gradient-to-br from-yellow-600/90 to-amber-700/90 border border-yellow-400 text-yellow-300 shadow-[0_0_22px_rgba(234,179,8,0.4)] font-extrabold";
          case 2048: return "bg-gradient-to-br from-yellow-500 to-amber-600 border-2 border-white text-slate-950 shadow-[0_0_28px_rgba(234,179,8,0.65)] font-black animate-pulse-glow";
          default: return "bg-gradient-to-br from-red-650 to-pink-700 border border-white text-white shadow-2xl font-black";
        }
      } else if (theme === "AURORA") {
        switch (val) {
          case 2: return "bg-emerald-950/40 border border-emerald-900/40 text-emerald-500/80 shadow-emerald-950/5";
          case 4: return "bg-slate-900 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/5";
          case 8: return "bg-emerald-950/70 border border-emerald-500/60 text-emerald-400 shadow-emerald-500/10";
          case 16: return "bg-teal-950/80 border border-teal-450 text-teal-300 shadow-teal-500/10";
          case 32: return "bg-green-950/80 border border-green-500/55 text-green-400 shadow-green-500/15 font-bold";
          case 64: return "bg-lime-950/85 border border-lime-500/60 text-lime-400 shadow-lime-500/15 font-bold";
          case 128: return "bg-emerald-900/80 border border-green-400/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold";
          case 256: return "bg-teal-900 border border-cyan-400/70 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold";
          case 512: return "bg-lime-900 border border-green-400 text-green-300 shadow-[0_0_18px_rgba(34,197,94,0.35)] font-extrabold";
          case 1024: return "bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400 text-emerald-200 shadow-[0_0_22px_rgba(16,185,129,0.4)] font-extrabold";
          case 2048: return "bg-gradient-to-br from-lime-400 to-emerald-500 border-2 border-white text-slate-950 shadow-[0_0_28px_rgba(132,204,22,0.65)] font-black animate-pulse-glow";
          default: return "bg-gradient-to-br from-teal-605 to-emerald-705 border border-white text-white shadow-2xl font-black";
        }
      } else if (theme === "SUNSET") {
        switch (val) {
          case 2: return "bg-slate-900 border border-pink-500/20 text-pink-500/70";
          case 4: return "bg-slate-900 border border-pink-400/30 text-pink-400";
          case 8: return "bg-rose-950/65 border border-rose-450 text-rose-300 shadow-rose-500/10";
          case 16: return "bg-purple-950/80 border border-purple-400/50 text-purple-300 shadow-purple-500/10";
          case 32: return "bg-violet-950/85 border border-violet-500/60 text-violet-400 shadow-violet-500/15 font-bold";
          case 64: return "bg-fuchsia-950/85 border border-fuchsia-500/60 text-fuchsia-400 shadow-fuchsia-500/15 font-bold";
          case 128: return "bg-pink-905 border border-pink-400/60 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.25)] font-bold";
          case 256: return "bg-red-900/90 border border-orange-400/70 text-orange-400 font-bold";
          case 512: return "bg-orange-950 border border-amber-500 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.35)] font-extrabold";
          case 1024: return "bg-gradient-to-br from-pink-600 to-rose-700 border border-pink-400 text-pink-200 shadow-[0_0_22px_rgba(236,72,153,0.4)] font-extrabold";
          case 2048: return "bg-gradient-to-br from-amber-400 to-rose-500 border-2 border-white text-slate-950 shadow-[0_0_28px_rgba(244,63,94,0.65)] font-black animate-pulse-glow";
          default: return "bg-gradient-to-br from-fuchsia-605 to-rose-705 border border-white text-white shadow-2xl font-black";
        }
      } else if (theme === "CANDY") {
        switch (val) {
          case 2: return "bg-indigo-950/40 border border-violet-500/20 text-violet-300";
          case 4: return "bg-indigo-950/40 border border-sky-450 text-sky-400";
          case 8: return "bg-sky-950/70 border border-cyan-400 text-cyan-300 shadow-cyan-500/10";
          case 16: return "bg-teal-950/70 border border-emerald-400 text-emerald-300 shadow-emerald-500/10";
          case 32: return "bg-violet-950/80 border border-purple-400 text-purple-300 shadow-purple-500/15 font-bold";
          case 64: return "bg-pink-950/80 border border-pink-400 text-pink-300 shadow-pink-500/15 font-bold";
          case 128: return "bg-fuchsia-900 border border-fuchsia-350 text-fuchsia-300 shadow-[0_0_12px_rgba(240,113,243,0.25)] font-bold";
          case 256: return "bg-rose-900 border border-rose-350 text-rose-300 shadow-[0_0_15px_rgba(251,113,133,0.3)] font-bold";
          case 512: return "bg-amber-900 border border-amber-350 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.35)] font-extrabold";
          case 1024: return "bg-gradient-to-br from-sky-400 to-indigo-505 border border-cyan-300 text-white shadow-[0_0_22px_rgba(56,189,248,0.4)] font-extrabold";
          case 2048: return "bg-gradient-to-br from-pink-400 to-yellow-300 border-2 border-white text-slate-950 shadow-[0_0_28px_rgba(244,114,182,0.65)] font-black animate-pulse-glow";
          default: return "bg-gradient-to-br from-sky-405 to-rose-405 border border-white text-white shadow-2xl font-black";
        }
      }
      return "bg-slate-900 text-slate-400";
    },
    handleKeyDown(e) {
      if (this.gameOver || this.isMovingPhase) return;
      let moved = false;
      
      if (["ArrowUp", "KeyW"].includes(e.key)) {
        moved = this.move("UP");
      } else if (["ArrowDown", "KeyS"].includes(e.key)) {
        moved = this.move("DOWN");
      } else if (["ArrowLeft", "KeyA"].includes(e.key)) {
        moved = this.move("LEFT");
      } else if (["ArrowRight", "KeyD"].includes(e.key)) {
        moved = this.move("RIGHT");
      }
      
      if (moved) {
        e.preventDefault();
      }
    },
    onTouchStart(e) {
      if (this.gameOver) return;
      if (!e || !e.touches) return;
      
      // Check 2-finger Undo mode
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        this.twoFingerSwipeStart = (t1.clientX + t2.clientX) / 2;
        this.isTwoFingersActive = true;
        this.resetHoldingTimer();
        return;
      }
      
      // Standard click, long-press, or swipe
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.touchStart = { x: touch.clientX, y: touch.clientY };
        this.isSwipeTrackActive = true;
        
        // Start radial countdown timer
        this.startHoldingCountdown();
      }
    },
    onTouchMove(e) {
      if (!e) return;
      
      // Intercept system scroll dragging
      if (e.cancelable) e.preventDefault();
      
      // Check 2-finger Undo sliding actions
      if (this.isTwoFingersActive && e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const avgX = (t1.clientX + t2.clientX) / 2;
        
        if (this.twoFingerSwipeStart !== null) {
          const deltaX = avgX - this.twoFingerSwipeStart;
          if (deltaX < -50) { // registered leftward swipe of both fingers!
            this.triggerUndo();
            this.twoFingerSwipeStart = null; // consume
            this.isTwoFingersActive = false;
          }
        }
        return;
      }
      
      // Drag/motion checks cancel longpress countdowns to prevent false restarts
      if (this.isHoldingPress && e.touches.length === 1) {
        const touch = e.touches[0];
        const dist = Math.hypot(touch.clientX - this.touchStart.x, touch.clientY - this.touchStart.y);
        if (dist > 16) {
          this.resetHoldingTimer();
        }
      }
    },
    onTouchEnd(e) {
      this.resetHoldingTimer();
      this.isTwoFingersActive = false;
      this.twoFingerSwipeStart = null;
      
      if (!this.isSwipeTrackActive || this.isMovingPhase || this.gameOver) return;
      this.isSwipeTrackActive = false;
      
      if (!e || !e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const dx = touch.clientX - this.touchStart.x;
      const dy = touch.clientY - this.touchStart.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      
      const distanceThreshold = 30; // 30px minimal vector threshold
      if (Math.max(absX, absY) > distanceThreshold) {
        // Vector deflection angle filter: 25 degrees (tangent of 25deg which is 0.466)
        if (absX > absY) {
          const deflection = absY / absX;
          if (deflection > 0.466) return; // ignore due to excessive diagonal deflection
          
          if (dx > 0) this.move("RIGHT");
          else this.move("LEFT");
        } else {
          const deflection = absX / absY;
          if (deflection > 0.466) return; // ignore due to excessive diagonal deflection
          
          if (dy > 0) this.move("DOWN");
          else this.move("UP");
        }
      }
    },
    startHoldingCountdown() {
      this.resetHoldingTimer();
      this.isHoldingPress = true;
      let durationMs = 2000;
      let start = performance.now();
      
      this.pressInterval = setInterval(() => {
        const elapsed = performance.now() - start;
        this.pressProgress = Math.min(1.0, elapsed / durationMs);
        
        if (this.pressProgress >= 1.0) {
          clearInterval(this.pressInterval);
          this.pressInterval = null;
          this.pressProgress = 0;
          this.isHoldingPress = false;
          
          // Trigger Reset
          this.restartGame();
        }
      }, 35);
    },
    resetHoldingTimer() {
      if (this.pressInterval) {
        clearInterval(this.pressInterval);
        this.pressInterval = null;
      }
      this.pressProgress = 0;
      this.isHoldingPress = false;
    },
    triggerUndo() {
      if (this.history.length === 0) {
        this.vibrate(30); // light buzzer
        return;
      }
      
      const prev = JSON.parse(this.history.pop());
      this.tiles = prev.tiles;
      this.score = prev.score;
      this.gameOver = prev.gameOver;
      this.hasWon = prev.hasWon;
      this.continuePlaying = prev.continuePlaying ?? false;
      
      // Light rewind twin vibrato
      this.vibrate([10, 30, 10]);
      playSound.tick();
      this.saveStateToLocalStorage();
    },
    move(dir) {
      if (this.isMovingPhase || this.gameOver) return false;
      
      // Build 4x4 matrix referencing flat tile list
      const gridRef = Array(4).fill(null).map(() => Array(4).fill(null));
      
      // Merge cleaning & Pop reset
      this.tiles = this.tiles.filter(t => !t.merged);
      this.tiles.forEach(t => {
        gridRef[t.r][t.c] = t;
        t.pop = false;
        t.isNew = false;
      });
      
      const saveSnapshotBeforeMove = JSON.stringify({
        tiles: this.tiles.map(t => ({ ...t })),
        score: this.score,
        gameOver: this.gameOver,
        hasWon: this.hasWon,
        continuePlaying: this.continuePlaying
      });
      
      let changed = false;
      let maxMergedVal = 0;
      
      if (dir === "LEFT" || dir === "RIGHT") {
        for (let r = 0; r < 4; r++) {
          let line = [];
          for (let c = 0; c < 4; c++) {
            line.push(gridRef[r][c]);
          }
          let active = line.filter(t => t !== null);
          if (dir === "RIGHT") active.reverse();
          
          let nextLine = [];
          let skip = false;
          for (let i = 0; i < active.length; i++) {
            if (skip) {
              skip = false;
              continue;
            }
            let current = active[i];
            let next = active[i + 1];
            
            if (next && current.val === next.val) {
              const mergedVal = current.val * 2;
              current.targetVal = mergedVal;
              current.targetR = r;
              current.targetC = dir === "LEFT" ? nextLine.length : (3 - nextLine.length);
              
              next.merged = true;
              next.targetR = r;
              next.targetC = dir === "LEFT" ? nextLine.length : (3 - nextLine.length);
              
              current.pop = true;
              
              if (mergedVal > maxMergedVal) maxMergedVal = mergedVal;
              this.score += mergedVal;
              this.triggerFusionSplash(current.targetR, current.targetC, mergedVal);
              
              nextLine.push(current);
              skip = true;
            } else {
              current.targetR = r;
              current.targetC = dir === "LEFT" ? nextLine.length : (3 - nextLine.length);
              nextLine.push(current);
            }
          }
          active.forEach(t => {
            if (t.targetR !== t.r || t.targetC !== t.c || t.merged) {
              changed = true;
            }
          });
        }
      } else {
        // UP or DOWN line processing
        for (let c = 0; c < 4; c++) {
          let line = [];
          for (let r = 0; r < 4; r++) {
            line.push(gridRef[r][c]);
          }
          let active = line.filter(t => t !== null);
          if (dir === "DOWN") active.reverse();
          
          let nextLine = [];
          let skip = false;
          for (let i = 0; i < active.length; i++) {
            if (skip) {
              skip = false;
              continue;
            }
            let current = active[i];
            let next = active[i + 1];
            
            if (next && current.val === next.val) {
              const mergedVal = current.val * 2;
              current.targetVal = mergedVal;
              current.targetR = dir === "UP" ? nextLine.length : (3 - nextLine.length);
              current.targetC = c;
              
              next.merged = true;
              next.targetR = dir === "UP" ? nextLine.length : (3 - nextLine.length);
              next.targetC = c;
              
              current.pop = true;
              
              if (mergedVal > maxMergedVal) maxMergedVal = mergedVal;
              this.score += mergedVal;
              this.triggerFusionSplash(current.targetR, current.targetC, mergedVal);
              
              nextLine.push(current);
              skip = true;
            } else {
              current.targetR = dir === "UP" ? nextLine.length : (3 - nextLine.length);
              current.targetC = c;
              nextLine.push(current);
            }
          }
          active.forEach(t => {
            if (t.targetR !== t.r || t.targetC !== t.c || t.merged) {
              changed = true;
            }
          });
        }
      }
      
      if (changed) {
        // Throttle gesture registers during moving slide phase
        this.isMovingPhase = true;
        
        // Push former snap into history stack
        this.history.push(saveSnapshotBeforeMove);
        if (this.history.length > 12) this.history.shift();
        
        // Slide coordinate translations
        this.tiles.forEach(t => {
          if (t.targetR !== undefined) t.r = t.targetR;
          if (t.targetC !== undefined) t.c = t.targetC;
          delete t.targetR;
          delete t.targetC;
        });
        
        playSound.tick();
        
        // Finalize merge transactions after 150ms transform cubic interpolation
        setTimeout(() => {
          this.tiles = this.tiles.filter(t => !t.merged);
          this.tiles.forEach(t => {
            if (t.targetVal) {
              t.val = t.targetVal;
              delete t.targetVal;
              
              if (t.val === 2048) {
                this.hasWon = true;
                playSound.levelUp();
              }
            }
          });
          
          this.addRandomTile();
          this.checkGameOver();
          this.isMovingPhase = false;
          
          // Trigger tactility feedback matching merged intensity
          if (maxMergedVal > 0) {
            this.playMergeHaptic(maxMergedVal);
          } else {
            this.vibrate(6); // minor dry sliding feedback
          }
          
          this.saveStateToLocalStorage();
        }, 150);
        
        return true;
      }
      return false;
    },
    playMergeHaptic(val) {
      if (val <= 16) {
        this.vibrate(8); // short click
      } else if (val <= 128) {
        this.vibrate(15); // solid click
      } else if (val <= 512) {
        this.vibrate([20, 10, 15]); // double click punch
      } else {
        // 1024 or 2048 winning waves
        this.vibrate([100, 30, 120, 30, 150]);
      }
    },
    checkGameOver() {
      const gridState = Array(4).fill(0).map(() => Array(4).fill(0));
      this.tiles.forEach(t => {
        if (!t.merged) {
          gridState[t.r][t.c] = t.val;
        }
      });
      
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (gridState[r][c] === 0) return; // space remaining
          if (r < 3 && gridState[r][c] === gridState[r + 1][c]) return; // match vertical merge
          if (c < 3 && gridState[r][c] === gridState[r][c + 1]) return; // match horizontal merge
        }
      }
      this.gameOver = true;
      playSound.gameOver();
      this.vibrate([100, 50, 120]);
    },
    saveStateToLocalStorage() {
      if (this.score > this.highscore) {
        this.highscore = this.score;
      }
      this.store.updateSessionScore(this.score);
      localStorage.setItem("game_2048_highscore", this.highscore);
      localStorage.setItem("game_2048_theme", this.activeTheme);
      localStorage.setItem("game_2048_state", JSON.stringify({
        tiles: this.tiles.map(t => ({ ...t, pop: false, isNew: false })),
        score: this.score,
        gameOver: this.gameOver,
        hasWon: this.hasWon,
        continuePlaying: this.continuePlaying,
        tileIdCounter: this.tileIdCounter
      }));
    },
    restoreStateFromLocalStorage() {
      const savedTheme = localStorage.getItem("game_2048_theme");
      if (savedTheme) {
        this.activeTheme = savedTheme;
      }
      const backup = localStorage.getItem("game_2048_state");
      if (backup) {
        try {
          const state = JSON.parse(backup);
          this.tiles = state.tiles;
          this.score = state.score;
          this.store.updateSessionScore(this.score);
          this.gameOver = state.gameOver;
          this.hasWon = state.hasWon;
          this.continuePlaying = state.continuePlaying;
          this.tileIdCounter = state.tileIdCounter || 1;
        } catch (_) {
          this.restartGame();
        }
      } else {
        this.restartGame();
      }
    }
  }
};
</script>

<style scoped>
.animate-pulse-glow {
  animation: pulseGlow 2.5s infinite ease-in-out;
}
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(234, 179, 8, 0.47);
    filter: brightness(1);
    opacity: 0.95;
  }
  50% {
    box-shadow: 0 0 25px rgba(234, 179, 8, 0.77);
    filter: brightness(1.22);
    opacity: 1;
  }
}

.animate-tile-pop {
  animation: tilePop 150ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes tilePop {
  0% { transform: scale(1.18); }
  100% { transform: scale(1); }
}

.animate-tile-spawn {
  animation: tileSpawn 140ms cubic-bezier(0.21, 1.02, 0.52, 1.02) forwards;
}
@keyframes tileSpawn {
  0% { transform: scale(0.6); opacity: 0.2; }
  100% { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); transform: scale(0.96); }
  to { opacity: 1; backdrop-filter: blur(12px); transform: scale(1); }
}
</style>
