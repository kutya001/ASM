<template>
  <div
    class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative overflow-hidden"
    ref="gameContainer"
  >
    <!-- Floating Glass HUD for score metrics and sound/pause options -->
    <div
      v-if="hasStarted && !gameOver"
      class="absolute top-4 left-4 right-4 bg-slate-950/75 backdrop-blur-md border border-slate-800/80 rounded-2xl py-2 px-4 flex items-center justify-between z-10 shadow-lg select-none"
    >
      <!-- Lines panel -->
      <div class="flex flex-col items-start">
        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Линии</span>
        <span class="text-xs font-black font-mono text-cyan-400 leading-none">{{ linesCleared }}</span>
      </div>

      <!-- Cohesive Score indicator in center (Tap to Mute/Unmute toggle) -->
      <div
        class="flex flex-col items-center cursor-pointer select-none px-3"
        @click="toggleMute"
        title="Нажмите, чтобы включить/выключить звук"
      >
        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Счёт</span>
        <span class="text-sm font-black font-mono text-emerald-400 leading-none flex items-center gap-1">
          {{ score }}
          <span class="material-symbols-outlined text-[12.5px] opacity-75">
            {{ isMuted ? 'volume_off' : 'volume_up' }}
          </span>
        </span>
      </div>

      <!-- Level / Pause Button on the right -->
      <div class="flex flex-col items-end cursor-pointer" @click="togglePause">
        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Уровень</span>
        <span class="text-xs font-black font-mono text-indigo-400 leading-none flex items-center gap-1">
          {{ level }}
          <span class="material-symbols-outlined text-[13px] text-indigo-300">
            {{ isPaused ? 'play_arrow' : 'pause' }}
          </span>
        </span>
      </div>
    </div>

    <!-- Active Area: Main Tetris Viewport Expanded -->
    <div
      ref="canvasContainer"
      class="flex-grow w-full max-w-xl flex flex-row items-center justify-center gap-3 sm:gap-5 my-1 select-none relative"
    >
      <!-- Side panel containing both HOLD and NEXT on the left -->
      <div
        v-if="hasStarted && !gameOver"
        class="flex flex-col gap-3 z-10 select-none w-14 sm:w-20 shrink-0"
      >
        <!-- HOLD -->
        <div class="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 flex flex-col items-center shadow-lg w-full">
          <span class="text-[7.5px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 select-none">HOLD</span>
          <canvas
            ref="holdCanvas"
            width="56"
            height="56"
            class="w-full aspect-square bg-slate-950/40 rounded-lg border border-slate-800/50"
          ></canvas>
        </div>

        <!-- NEXT -->
        <div class="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-1.5 flex flex-col items-center shadow-lg w-full">
          <span class="text-[7.5px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 select-none font-sans">NEXT</span>
          <canvas
            ref="nextCanvas"
            width="56"
            height="180"
            class="w-full h-[150px] sm:h-[180px] bg-slate-950/40 rounded-lg border border-slate-800/50"
          ></canvas>
        </div>
      </div>

      <!-- Main Canvas representation -->
      <canvas
        ref="tetrisCanvas"
        class="border border-slate-800 rounded-2xl bg-slate-950/45 shadow-2xl block"
      ></canvas>

      <!-- Game Over Modal Overlay -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20"
      >
        <div class="w-16 h-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-lg">
          <i class="bi bi-exclamation-triangle-fill text-3xl"></i>
        </div>
        <h2 class="text-xl font-black text-white mb-2 tracking-tight uppercase">
          Игра окончена
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-5 leading-normal">
          Счёт: <span class="text-emerald-400 font-bold font-mono">{{ score }}</span> <br />
          Уровень: <span class="text-indigo-400 font-bold font-mono">{{ level }}</span> | Линии: <span class="text-cyan-400 font-bold font-mono">{{ linesCleared }}</span>
        </p>
        <button
          @click="restartGame"
          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs tracking-wider transition border-none shadow-md cursor-pointer active:scale-95 animate-pulse"
        >
          НАЧАТЬ ЗАНОВО
        </button>
      </div>

      <!-- Pause Game Modal Overlay -->
      <div
        v-if="isPaused && !gameOver && hasStarted"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20"
      >
        <div class="w-16 h-16 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-400 mb-4 shadow-lg">
          <i class="bi bi-pause-fill text-4xl"></i>
        </div>
        <h2 class="text-lg font-black text-white mb-1 uppercase tracking-wider">
          Пауза
        </h2>
        <p class="text-[10px] font-semibold text-slate-400 mb-5 leading-relaxed max-w-[180px]">
          Игра приостановлена. Нажмите на экран для продолжения.
        </p>
        <button
          @click="togglePause"
          class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs tracking-wider transition border-none shadow-md cursor-pointer active:scale-95"
        >
          ПРОДОЛЖИТЬ
        </button>
      </div>

      <!-- Play / Start Overlay of game session -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20"
      >
        <div class="w-16 h-16 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
          <i class="bi bi-grid-3x3-gap-fill text-3xl animate-spin" style="animation-duration: 6s"></i>
        </div>
        <h2 class="text-lg font-black text-white mb-1.5 uppercase tracking-wide">
          ASM Тетрис Про
        </h2>
        <div class="text-[10px] font-semibold text-slate-400 max-w-[240px] mb-5 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/40 text-left space-y-1">
          <p class="text-center font-bold text-[11px] text-slate-200 border-b border-slate-800/80 pb-1 mb-1 select-none">ЖЕСТОВОЕ УПРАВЛЕНИЕ:</p>
          <div class="flex justify-between">
            <span class="text-indigo-400 font-bold">Одиночный Тап:</span>
            <span>Повернуть</span>
          </div>
          <div class="flex justify-between">
            <span class="text-indigo-400 font-bold">Свайп влево/вправо:</span>
            <span>Переместить</span>
          </div>
          <div class="flex justify-between">
            <span class="text-indigo-400 font-bold">Свайп вертикально вниз:</span>
            <span>Мягкий спуск</span>
          </div>
          <div class="flex justify-between">
            <span class="text-indigo-400 font-bold">Резкий жест вниз (flick):</span>
            <span>Бросить мгновенно</span>
          </div>
          <div class="flex justify-between">
            <span class="text-indigo-400 font-bold">Резкий жест вверх:</span>
            <span>Отложить (Hold Area)</span>
          </div>
        </div>
        <button
          @click="startGame"
          class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs tracking-widest transition border-none shadow-md cursor-pointer active:scale-95"
        >
          ИГРАТЬ
        </button>
      </div>

      <!-- Dynamic volume temporary indicator toast -->
      <transition name="toast-fade">
        <div
          v-if="showSoundIndicator"
          class="absolute bottom-6 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-full py-1.5 px-3.5 flex items-center gap-1.5 text-[9px] font-black text-slate-300 z-30 shadow-xl cursor-pointer select-none"
          @click="toggleMute"
        >
          <span class="material-symbols-outlined text-[13px] text-indigo-400">
            {{ isMuted ? 'volume_off' : 'volume_up' }}
          </span>
          <span>ЗВУК: {{ isMuted ? 'ВЫКЛЮЧЕН' : 'ВКЛЮЧЕН' }}</span>
        </div>
      </transition>
    </div>

    <!-- Minimal HUD instructions for bottom of screen -->
    <div class="w-full max-w-[340px] py-2 px-3 bg-slate-900 border border-slate-800/60 rounded-2xl text-center text-slate-400 text-[9px] font-bold tracking-wide leading-normal shrink-0 select-none">
      <i class="bi bi-hand-index-thumb text-indigo-400 mr-0.5 text-xs"></i> 
      Управляйте <span class="text-slate-200">Свайпами по экрану</span> или стрелками клавиатуры. ТАП — поворот.
    </div>
  </div>
</template>

<script>
import { playSound } from "../../utils/audioHelper";
import { useMainStore } from "../../store";

export default {
  data() {
    return {
      score: 0,
      linesCleared: 0,
      level: 1,
      gameOver: false,
      hasStarted: false,
      isPaused: false,
      grid: [],
      rows: 20,
      cols: 10,
      blockSize: 28, // Scaled dynamically in resizeCanvas
      currentPiece: null,
      currentPieceType: 0,
      currentX: 0,
      currentY: 0,
      gameInterval: null,
      colors: [
        null,
        "#6366f1", // Jackson Indigo
        "#f43f5e", // Rose
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#06b6d4", // Cyan
        "#d946ef", // Fuchsia
        "#8b5cf6"  // Violet
      ],
      shapes: [
        [[0]],
        [[1, 1, 1, 1]], // I-shape
        [[2, 0, 0], [2, 2, 2]], // J-shape
        [[0, 0, 3], [3, 3, 3]], // L-shape
        [[4, 4], [4, 4]], // O-shape
        [[0, 5, 5], [5, 5, 0]], // S-shape
        [[0, 6, 0], [6, 6, 6]], // T-shape
        [[7, 7, 0], [0, 7, 7]]  // Z-shape
      ],

      // Advanced game queueing
      nextPiecesQueue: [],
      holdPieceData: null,
      hasHeldThisTurn: false,

      // Volume Settings
      isMuted: localStorage.getItem("tetris_muted") === "true",
      showSoundIndicator: false,
      soundHideTimer: null,

      // Line clearing visual feedback
      clearingLines: [],
      clearProgress: 1.0,

      // Animation & Loop Trackers
      animationFrameId: null,
      clearAnimationId: null,
      resizeObserver: null,

      // Continuous Vector Gestures
      touchStart: { x: 0, y: 0, time: 0 },
      dragStartX: 0,
      dragStartY: 0,
      isSwipeAction: false,
      preventSoftDrop: false,
      keyboardSoftDropLock: false
    };
  },
  computed: {
    store() {
      return useMainStore();
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // Setup non-passive, preventDefault compatible touch gesture hooks strictly on the container element
    const container = this.$refs.gameContainer;
    if (container) {
      container.addEventListener("touchstart", this.onTouchStart, { passive: false });
      container.addEventListener("touchmove", this.onTouchMove, { passive: false });
      container.addEventListener("touchend", this.onTouchEnd, { passive: false });
    }

    // Attach high-DPI Dynamic ResizeObserver with scale coordinates calculations
    const canvasCont = this.$refs.canvasContainer;
    if (canvasCont && typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      this.resizeObserver.observe(canvasCont);
    } else {
      window.addEventListener("resize", this.resizeCanvas);
    }

    // Initial grid render
    this.$nextTick(() => {
      setTimeout(() => {
        this.resizeCanvas();
      }, 60);
    });
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("resize", this.resizeCanvas);

    // Clean up direct listeners
    const container = this.$refs.gameContainer;
    if (container) {
      container.removeEventListener("touchstart", this.onTouchStart);
      container.removeEventListener("touchmove", this.onTouchMove);
      container.removeEventListener("touchend", this.onTouchEnd);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.gameInterval) clearInterval(this.gameInterval);
    if (this.soundHideTimer) clearTimeout(this.soundHideTimer);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.clearAnimationId) cancelAnimationFrame(this.clearAnimationId);
  },
  methods: {
    // Tactile vibration haptics
    vibrate(pattern) {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(pattern);
        } catch (e) {
          console.debug("Haptics blocked:", e);
        }
      }
    },

    // Audio wrapper adhering to mute/unmute limits
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

      this.showSoundIndicator = true;
      if (this.soundHideTimer) clearTimeout(this.soundHideTimer);
      this.soundHideTimer = setTimeout(() => {
        this.showSoundIndicator = false;
      }, 3000);
    },

    togglePause() {
      if (!this.hasStarted || this.gameOver) return;
      this.isPaused = !this.isPaused;
      this.vibrate(10);
      this.playGameSound("tick");

      if (this.isPaused) {
        if (this.gameInterval) {
          clearInterval(this.gameInterval);
          this.gameInterval = null;
        }
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      } else {
        this.startLoop();
        this.animationLoop();
      }
    },

    // Modern High-DPI physical canvas resizing implementation to prevent vertical stretching
    resizeCanvas() {
      const container = this.$refs.canvasContainer;
      const canvas = this.$refs.tetrisCanvas;
      if (!container || !canvas) return;

      const containerBounds = container.getBoundingClientRect();
      const containerHeight = Math.max(200, containerBounds.height);
      const containerWidth = Math.max(200, containerBounds.width);
      
      // Dynamic spacing calculations based on state layouts
      const sidePanelWidth = this.hasStarted && !this.gameOver ? 76 : 0;
      const maxCanvasWidth = Math.max(120, containerWidth - sidePanelWidth - 24);
      const maxCanvasHeight = Math.max(240, containerHeight - 20);

      // We need a stable height / width = 2.0 (10:20 ratio) to guarantee square blocks
      let width = maxCanvasWidth;
      let height = width * 2;

      // Fit inside height bounds
      if (height > maxCanvasHeight) {
        height = maxCanvasHeight;
        width = height / 2;
      }

      // Exact pixel measurements
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);

      this.blockSize = width / this.cols;

      this.draw();
      this.drawHold();
      this.drawNext();
    },

    drawInitialGrid() {
      // Stub to fill workspace grid lines
      this.draw();
    },

    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.isPaused = false;
      this.score = 0;
      this.store.updateSessionScore(0);
      this.linesCleared = 0;
      this.level = 1;
      this.holdPieceData = null;
      this.hasHeldThisTurn = false;
      this.keyboardSoftDropLock = false;
      
      this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      this.clearingLines = [];

      this.nextPiecesQueue = [
        Math.floor(Math.random() * 7) + 1,
        Math.floor(Math.random() * 7) + 1,
        Math.floor(Math.random() * 7) + 1
      ];

      this.spawnPiece();
      this.startLoop();
      this.playGameSound("levelUp");

      // Spawn temporary sound indicator
      this.showSoundIndicator = true;
      if (this.soundHideTimer) clearTimeout(this.soundHideTimer);
      this.soundHideTimer = setTimeout(() => {
        this.showSoundIndicator = false;
      }, 3000);

      // Launch requestAnimationFrame loop
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.animationLoop();
    },

    restartGame() {
      this.startGame();
    },

    startLoop() {
      if (this.gameInterval) clearInterval(this.gameInterval);
      const speed = Math.max(80, 810 - (this.level - 1) * 90);
      this.gameInterval = setInterval(() => {
        this.moveDown(true);
      }, speed);
    },

    animationLoop() {
      if (!this.hasStarted || this.gameOver || this.isPaused) {
        this.animationFrameId = null;
        return;
      }
      this.draw();
      this.animationFrameId = requestAnimationFrame(this.animationLoop);
    },

    spawnPiece() {
      this.hasHeldThisTurn = false;
      
      const type = this.nextPiecesQueue.shift();
      this.nextPiecesQueue.push(Math.floor(Math.random() * 7) + 1);

      this.currentPieceType = type || Math.floor(Math.random() * 7) + 1;
      this.currentPiece = this.shapes[this.currentPieceType] || [[1, 1, 1, 1]];

      this.drawHold();
      this.drawNext();

      if (this.currentPiece && this.currentPiece[0]) {
        this.currentX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
      } else {
        this.currentX = Math.floor((this.cols - 4) / 2);
      }
      this.currentY = 0;

      if (this.currentPiece && this.checkCollision(this.currentX, this.currentY, this.currentPiece)) {
        this.endGame();
      }
    },

    // Swap / Hold piece mechanism
    holdPiece() {
      if (!this.hasStarted || this.gameOver || this.isPaused || this.hasHeldThisTurn) return;

      this.vibrate(12);
      this.playGameSound("tick");

      if (this.holdPieceData === null) {
        this.holdPieceData = this.currentPieceType || 1;
        this.spawnPiece();
      } else {
        const tempType = this.currentPieceType || 1;
        this.currentPieceType = this.holdPieceData;
        this.currentPiece = this.shapes[this.currentPieceType] || [[1, 1, 1, 1]];
        this.holdPieceData = tempType;

        if (this.currentPiece && this.currentPiece[0]) {
          this.currentX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
        } else {
          this.currentX = Math.floor((this.cols - 4) / 2);
        }
        this.currentY = 0;
      }

      this.hasHeldThisTurn = true;
      this.drawHold();
      this.drawNext();
      this.draw();
    },

    checkCollision(x, y, piece) {
      if (!piece) return true;
      for (let r = 0; r < piece.length; r++) {
        if (!piece[r]) continue;
        for (let c = 0; c < piece[r].length; c++) {
          if (piece[r][c] !== 0) {
            const nextX = x + c;
            const nextY = y + r;

            if (nextX < 0 || nextX >= this.cols) return true;
            if (nextY >= this.rows) return true;
            if (nextY >= 0 && this.grid[nextY] && this.grid[nextY][nextX] !== 0) return true;
          }
        }
      }
      return false;
    },

    moveLeft() {
      if (!this.hasStarted || this.gameOver || this.isPaused || !this.currentPiece) return;
      if (!this.checkCollision(this.currentX - 1, this.currentY, this.currentPiece)) {
        this.currentX--;
        this.playGameSound("tick");
        this.vibrate(10);
      }
    },

    moveRight() {
      if (!this.hasStarted || this.gameOver || this.isPaused || !this.currentPiece) return;
      if (!this.checkCollision(this.currentX + 1, this.currentY, this.currentPiece)) {
        this.currentX++;
        this.playGameSound("tick");
        this.vibrate(10);
      }
    },

    rotate() {
      if (!this.hasStarted || this.gameOver || this.isPaused || !this.currentPiece || !this.currentPiece[0]) return;

      const rotated = Array.from({ length: this.currentPiece[0].length }, () => Array(this.currentPiece.length).fill(0));
      for (let r = 0; r < this.currentPiece.length; r++) {
        if (!this.currentPiece[r]) continue;
        for (let c = 0; c < this.currentPiece[r].length; c++) {
          rotated[c][this.currentPiece.length - 1 - r] = this.currentPiece[r][c];
        }
      }

      if (this.checkCollision(this.currentX, this.currentY, rotated)) {
        // Multi-stage wall kick offset tests
        if (!this.checkCollision(this.currentX - 1, this.currentY, rotated)) {
          this.currentX--;
        } else if (!this.checkCollision(this.currentX + 1, this.currentY, rotated)) {
          this.currentX++;
        } else if (!this.checkCollision(this.currentX - 2, this.currentY, rotated)) {
          this.currentX -= 2;
        } else if (!this.checkCollision(this.currentX + 2, this.currentY, rotated)) {
          this.currentX += 2;
        } else {
          return;
        }
      }

      this.currentPiece = rotated;
      this.playGameSound("rotate");
      this.vibrate(12);
    },

    moveDown(isAuto = false) {
      if (!this.hasStarted || this.gameOver || this.isPaused || !this.currentPiece) return;

      if (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.currentY++;
        if (!isAuto) {
          this.playGameSound("tick");
          this.vibrate(8);
        }
      } else {
        this.lockPiece();
      }
    },

    hardDrop() {
      if (!this.hasStarted || this.gameOver || this.isPaused || !this.currentPiece) return;

      let cells = 0;
      while (!this.checkCollision(this.currentX, this.currentY + 1, this.currentPiece)) {
        this.currentY++;
        cells++;
      }
      this.playGameSound("score");
      this.vibrate(35);
      this.lockPiece();
    },

    lockPiece() {
      if (!this.currentPiece) return;
      for (let r = 0; r < this.currentPiece.length; r++) {
        if (!this.currentPiece[r]) continue;
        for (let c = 0; c < this.currentPiece[r].length; c++) {
          if (this.currentPiece[r][c] !== 0) {
            // Guard against horizontal or vertical array out of bounds
            const finalY = this.currentY + r;
            const finalX = this.currentX + c;
            if (this.grid[finalY] !== undefined && this.grid[finalY][finalX] !== undefined) {
              this.grid[finalY][finalX] = this.currentPiece[r][c];
            }
          }
        }
      }

      this.vibrate(25);
      this.preventSoftDrop = true;
      this.keyboardSoftDropLock = true;
      this.currentPiece = null; // Clear to prevent overlapping render/ghost artifacts during clear animation
      this.clearLines();
    },

    // Animate and clear full lines with white sweep fade
    clearLines() {
      const fullRows = [];
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[r].every(val => val !== 0)) {
          fullRows.push(r);
        }
      }

      if (fullRows.length > 0) {
        this.clearingLines = fullRows;
        this.clearProgress = 1.0;

        // Freeze game ticker during line reduction animation
        if (this.gameInterval) {
          clearInterval(this.gameInterval);
          this.gameInterval = null;
        }

        this.vibrate([50, 45, 50, 45]); // double tactile chime
        this.playGameSound("levelUp");

        const clearSweep = () => {
          this.clearProgress -= 0.12; // Complete within 160ms (roughly 8 requestAnimationFrame steps)
          if (this.clearProgress <= 0) {
            this.clearingLines = [];

            fullRows.forEach(r => {
              this.grid.splice(r, 1);
              this.grid.unshift(Array(this.cols).fill(0));
            });

            const lines = fullRows.length;
            this.linesCleared += lines;
            const scoringRatio = [0, 100, 300, 500, 800];
            this.score += scoringRatio[lines] * this.level;
            this.store.updateSessionScore(this.score);

            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.spawnPiece();
            this.startLoop();
          } else {
            this.clearAnimationId = requestAnimationFrame(clearSweep);
          }
        };
        clearSweep();
      } else {
        this.spawnPiece();
      }
    },

    // Main Draw context router
    draw() {
      const canvas = this.$refs.tetrisCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Deep celestial backplane fill
      ctx.fillStyle = "#090d19";
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      // Fine neon layout mesh lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r <= this.rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * this.blockSize);
        ctx.lineTo(this.cols * this.blockSize, r * this.blockSize);
        ctx.stroke();
      }
      for (let c = 0; c <= this.cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * this.blockSize, 0);
        ctx.lineTo(c * this.blockSize, this.rows * this.blockSize);
        ctx.stroke();
      }

      // Render cells of stationary board
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c] !== 0) {
            const isClearing = this.clearingLines.includes(r);
            this.drawBlock(ctx, c, r, this.grid[r][c], isClearing);
          }
        }
      }

      // Render active pieces & Ghost indicator
      if (this.hasStarted && !this.gameOver && !this.isPaused && this.currentPiece && this.currentPiece[0]) {
        let ghostY = this.currentY;
        while (!this.checkCollision(this.currentX, ghostY + 1, this.currentPiece)) {
          ghostY++;
        }

        // Standard Tetris: only draw Ghost indicator if there is clear vertical separation below
        if (ghostY > this.currentY) {
          // Draw Ghost Shape indicators with 2px thick outer trace and micro glow
          for (let r = 0; r < this.currentPiece.length; r++) {
            if (!this.currentPiece[r]) continue;
            for (let c = 0; c < this.currentPiece[r].length; c++) {
              if (this.currentPiece[r][c] !== 0) {
                const x = (this.currentX + c) * this.blockSize;
                const y = (ghostY + r) * this.blockSize;
                const size = this.blockSize;

                ctx.save();
                ctx.fillStyle = "rgba(99, 102, 241, 0.12)";
                ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

                ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
                ctx.lineWidth = 2.0;
                ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

                // Fine diagonal stripe
                ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(x + 3, y + 3);
                ctx.lineTo(x + size - 3, y + size - 3);
                ctx.stroke();
                ctx.restore();
              }
            }
          }
        }

        // Render active free-falling shape
        for (let r = 0; r < this.currentPiece.length; r++) {
          if (!this.currentPiece[r]) continue;
          for (let c = 0; c < this.currentPiece[r].length; c++) {
            if (this.currentPiece[r][c] !== 0) {
              this.drawBlock(ctx, this.currentX + c, this.currentY + r, this.currentPiece[r][c], false);
            }
          }
        }
      }
    },

    drawBlock(ctx, x, y, colorIdx, isClearing = false) {
      const bx = x * this.blockSize;
      const by = y * this.blockSize;
      const size = this.blockSize;

      ctx.save();
      if (isClearing) {
        ctx.globalAlpha = this.clearProgress;
      }

      // Render block body
      ctx.fillStyle = this.colors[colorIdx];
      ctx.fillRect(bx, by, size, size);

      // Neon interior highlights and shadows
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillRect(bx, by, size, 2);
      ctx.fillRect(bx, by, 2, size);

      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(bx + size - 2, by, 2, size);
      ctx.fillRect(bx, by + size - 2, size, 2);

      if (isClearing) {
        // Bright flare wipe sweep
        ctx.fillStyle = `rgba(255, 255, 255, ${1.0 - this.clearProgress})`;
        ctx.fillRect(bx, by, size, size);
      }
      ctx.restore();
    },

    // Companion canvas renderer for HOLD storage
    drawHold() {
      const canvas = this.$refs.holdCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0c1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (this.holdPieceData) {
        const piece = this.shapes[this.holdPieceData];
        if (!piece || !piece[0]) return;
        const size = 11;
        const width = piece[0].length * size;
        const height = piece.length * size;

        const startX = (canvas.width - width) / 2;
        const startY = (canvas.height - height) / 2;

        ctx.fillStyle = this.colors[this.holdPieceData];
        for (let r = 0; r < piece.length; r++) {
          if (!piece[r]) continue;
          for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c] !== 0) {
              const bx = startX + c * size;
              const by = startY + r * size;
              ctx.fillRect(bx, by, size - 1, size - 1);
              
              ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
              ctx.fillRect(bx, by, size - 1, 1);
              ctx.fillRect(bx, by, 1, size - 1);
              ctx.fillStyle = this.colors[this.holdPieceData];
            }
          }
        }
      }
    },

    // Companion canvas renderer for upcoming queue
    drawNext() {
      const canvas = this.$refs.nextCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0c1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 3; i++) {
        const type = this.nextPiecesQueue[i];
        if (!type) continue;
        const piece = this.shapes[type];
        if (!piece || !piece[0]) continue;

        const size = 9;
        const width = piece[0].length * size;
        const height = piece.length * size;

        const slotCenterY = i * 60 + 30;
        const startX = (canvas.width - width) / 2;
        const startY = slotCenterY - height / 2;

        ctx.fillStyle = this.colors[type];
        for (let r = 0; r < piece.length; r++) {
          if (!piece[r]) continue;
          for (let c = 0; c < piece[r].length; c++) {
            if (piece[r][c] !== 0) {
              const bx = startX + c * size;
              const by = startY + r * size;
              ctx.fillRect(bx, by, size - 1, size - 1);

              ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
              ctx.fillRect(bx, by, size - 1, 1);
              ctx.fillRect(bx, by, 1, size - 1);
              ctx.fillStyle = this.colors[type];
            }
          }
        }
      }
    },

    endGame() {
      this.gameOver = true;
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.playGameSound("gameOver");
      this.vibrate([100, 100, 150]);
    },

    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver || this.isPaused) return;

      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        this.moveLeft();
        event.preventDefault();
      } else if (event.code === "ArrowRight" || event.code === "KeyD") {
        this.moveRight();
        event.preventDefault();
      } else if (event.code === "ArrowUp" || event.code === "Up" || event.code === "KeyW") {
        this.rotate();
        event.preventDefault();
      } else if (event.code === "ArrowDown" || event.code === "KeyS") {
        // Prevent immediate repeat soft drop into the spawned piece until key is released
        if (!this.keyboardSoftDropLock) {
          this.moveDown();
        }
        event.preventDefault();
      } else if (event.code === "Space") {
        this.hardDrop();
        event.preventDefault();
      } else if (event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "KeyC") {
        this.holdPiece();
        event.preventDefault();
      }
    },

    handleKeyUp(event) {
      if (event.code === "ArrowDown" || event.code === "KeyS") {
        this.keyboardSoftDropLock = false;
      }
    },

    // Swipe Vectors gesture trackers
    onTouchStart(e) {
      if (!this.hasStarted || this.gameOver || this.isPaused) return;
      if (!e || !e.touches || e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();

      this.preventSoftDrop = false;

      const touch = e.touches[0];
      if (!touch) return;
      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
      this.isSwipeAction = false;
    },

    onTouchMove(e) {
      if (!this.hasStarted || this.gameOver || this.isPaused) return;
      if (!e || !e.touches || e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;

      // Horizontal tracking movement
      const dx = touch.clientX - this.dragStartX;
      const stepsX = Math.trunc(dx / this.blockSize);
      if (stepsX !== 0) {
        this.isSwipeAction = true;
        if (stepsX > 0) {
          for (let i = 0; i < stepsX; i++) {
            this.moveRight();
          }
        } else {
          for (let i = 0; i < Math.abs(stepsX); i++) {
            this.moveLeft();
          }
        }
        this.dragStartX += stepsX * this.blockSize;
      }

      // Vertical track soft drop acceleration
      if (!this.preventSoftDrop) {
        const dy = touch.clientY - this.dragStartY;
        if (dy > 0) {
          const stepsY = Math.trunc(dy / (this.blockSize * 0.5));
          if (stepsY !== 0) {
            this.isSwipeAction = true;
            for (let i = 0; i < stepsY; i++) {
              if (this.preventSoftDrop) break;
              this.moveDown(false);
            }
            this.dragStartY += stepsY * (this.blockSize * 0.5);
          }
        }
      }
    },

    onTouchEnd(e) {
      if (!this.hasStarted || this.gameOver || this.isPaused) return;
      if (!e || !e.changedTouches || e.changedTouches.length === 0) return;
      if (e.cancelable) e.preventDefault();

      this.preventSoftDrop = false;

      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;
      const deltaTime = Date.now() - this.touchStart.time;

      const isVertical = Math.abs(deltaY) > 0 && Math.abs(deltaX) < Math.abs(deltaY) * 0.35;

      // Flick short swipe down = Hard Drop [flick speed limit < 150ms]
      if (deltaY > 60 && isVertical && deltaTime < 150) {
        this.hardDrop();
        return;
      }

      // Quick vertical swipe up = Hold area rotation trigger
      if (deltaY < -60 && isVertical && deltaTime < 250) {
        this.holdPiece();
        return;
      }

      // Tap filter = Rotation action
      const totalDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (totalDist < 10 && deltaTime < 180 && !this.isSwipeAction) {
        this.rotate();
      }
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

/* Slick toast fade animations definitions */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
