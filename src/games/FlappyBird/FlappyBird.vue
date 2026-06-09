<template>
  <div
    class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative overflow-hidden"
    @click="handleInteraction"
    @touchstart.passive="handleInteraction"
  >
    <!-- HUD Panel: Top Stats of the Flight -->
    <div class="w-full flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-lg mb-2 z-10 font-sans">
      <div class="flex items-center gap-2">
        <!-- Return to games roster directly -->
        <button
          @click.stop="exitToGamesList"
          class="w-7 h-7 rounded-lg bg-slate-800/75 hover:bg-slate-700 hover:text-white border-none text-slate-300 cursor-pointer flex items-center justify-center transition mr-1 active:scale-95"
          title="Выйти в игротеку"
        >
          <i class="bi bi-chevron-left text-xs font-bold leading-none"></i>
        </button>

        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <i class="bi bi-star-fill text-emerald-400 animate-pulse text-xs"></i>
        </div>
        <div>
          <span class="block text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Линия</span>
          <span class="text-base font-black text-emerald-400 font-mono leading-none">{{ score }}</span>
        </div>
      </div>

      <!-- Current Skin badge display / Speed status display when flying -->
      <div class="px-2.5 py-1 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center gap-1.5 text-[8.5px] font-black uppercase text-slate-300 tracking-wider">
        <template v-if="hasStarted && !gameOver">
          <i class="bi bi-speedometer2 text-amber-400 animate-pulse"></i>
          <span>Скорость: <span class="text-amber-400 font-mono">{{ displayPercent }}%</span></span>
        </template>
        <template v-else>
          <i :class="selectedSkinObj.iconClass + ' text-indigo-400'"></i>
          <span>{{ selectedSkinObj.label }}</span>
        </template>
      </div>

      <div class="flex items-center gap-2 text-right">
        <div>
          <span class="block text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Рекорд</span>
          <span class="text-base font-black text-indigo-400 font-mono leading-none">{{ highscore }}</span>
        </div>
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <i class="bi bi-trophy text-indigo-400 text-xs"></i>
        </div>
      </div>
    </div>

    <!-- Active Canvas Arena with automatic scaling -->
    <div ref="canvasContainer" class="flex-1 w-full max-w-sm flex items-center justify-center relative my-1 overflow-hidden min-h-0 bg-slate-950 rounded-2xl border border-slate-900 shadow-inner">
      <canvas
        ref="gameCanvas"
        class="bg-slate-950 shadow-2xl block transition-all"
        :class="gameOver ? 'opacity-85 pointer-events-none' : 'cursor-pointer'"
      ></canvas>

      <!-- Glassmorphic Start Screen overlay -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-between p-5 text-center z-15 select-none"
      >
        <div class="w-full flex flex-col items-center mt-2">
          <div class="relative mb-3.5">
            <div class="absolute -inset-1 rounded-full bg-indigo-500/20 blur-md animate-pulse"></div>
            <div class="w-13 h-13 bg-slate-900 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 font-black relative">
              <span class="material-symbols-outlined text-3xl animate-bounce" style="animation-duration: 4s">
                airwave
              </span>
            </div>
          </div>
          
          <h2 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-400 to-amber-300 leading-none tracking-wider mb-1 uppercase">
            Космический Полёт
          </h2>
          <p class="text-[9px] font-semibold text-slate-400 max-w-[210px] leading-normal mb-1">
            Копия Flappy Bird с честной физикой, выбором космических фигур и отсутствием ложных хитбоксов!
          </p>
        </div>

        <!-- 3D Skin Select Grid Carousel -->
        <div class="w-full">
          <span class="block text-[7.5px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none select-none">Выбрать фигуру для полёта:</span>
          <div class="grid grid-cols-5 gap-1.5 px-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/70 select-none">
            <button
              v-for="skin in skinsList"
              :key="skin.id"
              @click.stop="selectSkin(skin.id)"
              class="flex flex-col items-center justify-center py-1 rounded-lg border transition cursor-pointer active:scale-95 border-none h-[44px]"
              :class="activeSkinId === skin.id ? 'bg-indigo-600/30 border-2 border-indigo-500/80 text-white shadow-lg' : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'"
            >
              <i class="text-sm mt-0.5" :class="skin.iconClass"></i>
              <span class="text-[6.5px] font-semibold tracking-tight mt-1 leading-none truncate w-full px-0.5 text-center block">
                {{ skin.label }}
              </span>
            </button>
          </div>
        </div>

        <div class="w-full flex flex-col items-center mb-2 gap-2">
          <button
            @click.stop="startGame"
            class="w-full max-w-[200px] py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition border-none shadow-md cursor-pointer active:scale-95"
          >
            ПОЛЕТАТЬ
          </button>

          <button
            @click.stop="exitToGamesList"
            class="w-full max-w-[170px] py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-205 text-[10px] uppercase font-bold tracking-wider rounded-lg transition cursor-pointer active:scale-95"
          >
            ВЫЙТИ В ИГРОТЕКУ
          </button>
          
          <div class="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1 opacity-70">
            <i class="bi bi-hand-index-thumb"></i>
            Кликните по полю или нажмите пробел, чтобы взлетать
          </div>
        </div>
      </div>

      <!-- Perfect Glassmorphic Game Over view -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-15 animate-fade-in font-sans"
      >
        <div class="relative w-12 h-12 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center text-rose-500 mb-3 animate-bounce">
          <i class="bi bi-rocket-takeoff-fill text-xl"></i>
        </div>

        <h2 class="text-base font-black text-rose-500 uppercase tracking-wide leading-none mb-1">
          Крушение корабля
        </h2>
        <p class="text-[10px] text-slate-400 mb-4 leading-normal font-semibold max-w-[200px]">
          Вы столкнулись с препятствием! Механические повреждения корпуса составили 100%.
        </p>

        <div class="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl max-w-[200px] w-full mb-4.5 space-y-1.5 shadow-xl select-none">
          <div class="flex items-center justify-between text-slate-400 text-[10px] font-bold">
            <span class="uppercase">Счёт рейса:</span>
            <span class="font-mono text-emerald-400 font-black text-sm">{{ score }}</span>
          </div>
          <div class="w-full h-px bg-slate-800"></div>
          <div class="flex items-center justify-between text-slate-400 text-[10px] font-bold">
            <span class="uppercase">Рекорд флота:</span>
            <span class="font-mono text-yellow-400 font-black text-sm">{{ highscore }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-[200px]">
          <button
            @click.stop="restartGame"
            class="py-2.5 bg-gradient-to-r from-rose-600 to-indigo-650 hover:from-rose-700 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition border-none shadow-md cursor-pointer active:scale-95"
          >
            НАЧАТЬ ЗАНОВО
          </button>

          <button
            @click.stop="exitToMainMenu"
            class="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95"
          >
            В ГЛАВНОЕ МЕНЮ
          </button>
        </div>
      </div>
    </div>

    <!-- Active Bottom Tips bar -->
    <div class="w-full max-w-sm py-1.5 px-3 bg-slate-900/40 border border-slate-850 rounded-xl text-center text-slate-500 text-[8px] font-bold tracking-wide uppercase leading-normal">
      <i class="bi bi-shield-check text-indigo-400 mr-0.5"></i>
      Автосейв рекордов: сессия интегрирована в ERP-Игротеку.
    </div>
  </div>
</template>

<script>
import { useMainStore } from "../../store";

// Sound Synthesizer via Web Audio API
const synthSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === "flap") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === "score") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + 0.08);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === "crash") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch (err) {
    console.debug("Audio synth failed", err);
  }
};

export default {
  data() {
    return {
      hasStarted: false,
      gameOver: false,
      score: 0,
      highscore: Number(localStorage.getItem("game_flappybird_highscore")) || 0,
      
      // Selectable flying skins config
      activeSkinId: "bird",
      skinsList: [
        { id: "bird", label: "Птица", iconClass: "bi-twitter" },
        { id: "car", label: "Машина", iconClass: "bi-car-front-fill" },
        { id: "lightning", label: "Молния", iconClass: "bi-lightning-charge-fill" },
        { id: "cat", label: "Котик", iconClass: "bi-cat" },
        { id: "panda", label: "Панда", iconClass: "bi-github" } // fallback nice icon
      ],
      
      // Virtual game canvas resolution (scales up/down cleanly)
      virtualWidth: 400,
      virtualHeight: 600,
      groundHeight: 75,
      frameIdx: 0,
      
      // Character physical state
      charY: 260,
      charVy: 0,
      charRadius: 13,
      charX: 100,
      
      // Constants of game environment physics (Optimized ~30% easier)
      gravity: 0.22,      // reduced from 0.32
      jumpForce: -4.3,    // reduced from -6.2 for smooth float balance
      maxFallSpeed: 6.5,  // reduced from 9.5
      
      // Obstacles
      pipes: [],
      pipeWidth: 62,
      pipeSpeed: 1.45,    // reduced from 2.1
      minPipeGap: 135,    // increased from 125 for friendlier clearances
      maxPipeGap: 158,    // increased from 148
      pipeSpawnTimer: 0,
      pipeGapOffset: 135,
      
      // Parallax scroll positions
      starsPositionX: 0,
      hillsPositionX: 0,
      groundPositionX: 0,
      
      // Particles effects
      particlesList: [],
      
      // Rendering context loops
      resizeObserver: null,
      animationFrameId: null,
      dpr: window.devicePixelRatio || 1
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    selectedSkinObj() {
      return this.skinsList.find(s => s.id === this.activeSkinId) || this.skinsList[0];
    },
    displayPercent() {
      if (!this.hasStarted) return 100;
      const elapsedSeconds = this.frameIdx / 60;
      return 100 + Math.floor(elapsedSeconds / 5);
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    this.setupCanvasResize();
    
    // Begin animation render frames immediately for starting lobby screen visuals
    this.startDrawLoop();
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    // Canvas sizing handler
    setupCanvasResize() {
      const container = this.$refs.canvasContainer;
      const canvas = this.$refs.gameCanvas;
      if (!container || !canvas) return;

      const resize = () => {
        const bounds = container.getBoundingClientRect();
        // Calculate max aspect height
        const width = bounds.width;
        // Keep a neat Aspect ratio similar to Flappy Bird (400:600 = 2:3)
        const sizeWidth = Math.min(width, 360);
        const sizeHeight = sizeWidth * 1.45; // slightly tall
        
        const dpr = window.devicePixelRatio || 1;
        this.dpr = dpr;
        
        canvas.width = sizeWidth * dpr;
        canvas.height = sizeHeight * dpr;
        canvas.style.width = `${sizeWidth}px`;
        canvas.style.height = `${sizeHeight}px`;
      };

      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(container);
      resize();
    },
    
    // Skin configuration toggle
    selectSkin(skinId) {
      if (this.hasStarted) return;
      this.activeSkinId = skinId;
      synthSound("flap");
    },
    
    // Key presses handler
    handleKeyDown(e) {
      if (e.code === "Space") {
        e.preventDefault();
        this.performJump();
      }
    },
    
    // Clicking/Touch interactively jumps
    handleInteraction(e) {
      if (e.target && e.target.closest("button")) {
        // Ignore jumps if standard UI buttons of layout clicked!
        return;
      }
      this.performJump();
    },
    
    // Main Jump mechanic trigger
    performJump() {
      if (!this.hasStarted) {
        if (!this.gameOver) {
          this.startGame();
        }
        return;
      }
      if (this.gameOver) return;
      
      this.charVy = this.jumpForce;
      synthSound("flap");
      
      // Spawn burst jump particles
      const count = 7 + Math.random() * 5;
      for (let i = 0; i < count; i++) {
        this.particlesList.push({
          x: this.charX - 6,
          y: this.charY + (Math.random() * 8 - 4),
          vx: -(1.5 + Math.random() * 2),
          vy: Math.random() * 2 - 1,
          size: 2.5 + Math.random() * 3,
          color: this.getSkinParticleColor(),
          alpha: 0.9,
          life: 0.82
        });
      }
    },
    
    // Get colors for flying trails matching characters
    getSkinParticleColor() {
      switch (this.activeSkinId) {
        case "bird": return `hsl(${35 + Math.random() * 15}, 95%, 65%)`; // Orange Yellow
        case "car": return `hsl(${340 + Math.random() * 30}, 95%, 60%)`; // Hot Neon Red / Magenta
        case "lightning": return `hsl(${55 + Math.random() * 10}, 100%, 65%)`; // Golden Electric Glow
        case "cat": return `hsl(${320 + Math.random() * 12}, 90%, 75%)`; // Pink soft glow
        case "panda": return `hsl(0, 0%, ${Math.random() > 0.5 ? "90%" : "30%"})`; // White Black mono
        default: return "#4f46e5";
      }
    },
    
    // Start Gameplay action
    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.charY = 260;
      this.charVy = 0;
      this.pipes = [];
      this.pipeSpawnTimer = 0;
      this.particlesList = [];
      
      // Reset timer
      this.frameIdx = 0;
      
      // Clean start pipes spawning schedule
      this.pipes.push(this.createNewPipe(450));
      this.pipes.push(this.createNewPipe(660));
    },
    
    createNewPipe(startX) {
      // Calculate gap height dynamically based on current scores
      // Harder gaps the higher the score
      const difficulty = Math.min(this.score / 25, 1.0); // caps at 25 points
      const currentGap = this.maxPipeGap - (this.maxPipeGap - this.minPipeGap) * difficulty;
      
      // Let's randomize top pipe height securely within limits (minimum heights of pipes is 60px)
      const playHeight = this.virtualHeight - this.groundHeight; // 525 px
      const verticalMargin = 60;
      const validRange = playHeight - currentGap - (verticalMargin * 2);
      const topHeight = verticalMargin + Math.random() * validRange; // dynamically chosen
      
      return {
        x: startX,
        topHeight: topHeight,
        gap: currentGap,
        passed: false,
        width: this.pipeWidth
      };
    },
    
    restartGame() {
      this.startGame();
    },

    exitToMainMenu() {
      this.hasStarted = false;
      this.gameOver = false;
      this.score = 0;
      this.charY = 260;
      this.charVy = 0;
      this.particlesList = [];
      this.pipes = [];
    },

    exitToGamesList() {
      this.store.setActiveGameId(null);
    },
    
    // Primary drawing continuous tick loop
    startDrawLoop() {
      const step = () => {
        // Pre-requisites
        if (this.$refs.gameCanvas) {
          this.tickAndUpdatePhysics();
          this.renderCanvas();
        }
        this.animationFrameId = requestAnimationFrame(step);
      };
      this.animationFrameId = requestAnimationFrame(step);
    },
    
    // Physics engine block
    tickAndUpdatePhysics() {
      this.frameIdx++;
      
      if (!this.hasStarted || this.gameOver) {
        // Scrolling lobby background effects when waiting
        this.starsPositionX = (this.starsPositionX - 0.2) % 400;
        this.hillsPositionX = (this.hillsPositionX - 0.45) % 400;
        this.groundPositionX = (this.groundPositionX - 1.5) % 400;
        
        // Simulating floating hover bird movement on start screen
        if (!this.gameOver) {
          this.charY = 260 + Math.sin(this.frameIdx * 0.08) * 12;
        }
        return;
      }

      // Dynamic Speed Scaling: +1% speed every 5 seconds (60 frames/sec * 5 = 300 frames)
      const elapsedSeconds = this.frameIdx / 60;
      const speedMultiplier = Math.min(1.0 + Math.floor(elapsedSeconds / 5) * 0.01, 2.00); // Caps at 2.0x speed limit
      const currentPipeSpeed = this.pipeSpeed * speedMultiplier;
      
      // Apply gravitational forces
      this.charVy += this.gravity;
      if (this.charVy > this.maxFallSpeed) {
        this.charVy = this.maxFallSpeed;
      }
      this.charY += this.charVy;
      
      // Enforce sky roof restriction gently
      if (this.charY - this.charRadius < 0) {
        this.charY = this.charRadius;
        this.charVy = 0;
      }
      
      // Background Scrolling parallax multipliers
      this.starsPositionX = (this.starsPositionX - 0.3 * speedMultiplier) % 400;
      this.hillsPositionX = (this.hillsPositionX - 0.7 * speedMultiplier) % 400;
      this.groundPositionX = (this.groundPositionX - currentPipeSpeed) % 400;
      
      // Spawn flying trails particles dynamically
      if (this.frameIdx % 4 === 0) {
        this.particlesList.push({
          x: this.charX - 4,
          y: this.charY + (Math.random() * 6 - 3),
          vx: -1.3 * speedMultiplier,
          vy: Math.random() * 0.4 - 0.2,
          size: 1.8 + Math.random() * 3,
          color: this.getSkinParticleColor(),
          alpha: 0.8,
          life: 0.75
        });
      }
      
      // Process active elements particles lists
      this.particlesList.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        p.size *= 0.97;
      });
      this.particlesList = this.particlesList.filter(p => p.alpha > 0.05 && p.size > 0.5);
      
      // Manage Obstacles Spawning sequence
      this.pipes.forEach(pipe => {
        pipe.x -= currentPipeSpeed;
      });
      
      // When a pipe passes left out of view, delete it and spawn a new one on right
      if (this.pipes.length > 0 && this.pipes[0].x < -this.pipeWidth) {
        this.pipes.shift();
        
        // Grab position of last pipe to space them out cleanly
        const lastX = this.pipes[this.pipes.length - 1].x;
        this.pipes.push(this.createNewPipe(lastX + 210));
      }
      
      // Scoring increment detection
      this.pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + this.pipeWidth / 2 < this.charX) {
          pipe.passed = true;
          this.score++;
          synthSound("score");
          
          // Trigger high score updates to ERP store
          if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem("game_flappybird_highscore", String(this.highscore));
          }
          this.store.updateSessionScore(this.score);
        }
      });
      
      // 100% Precise boundaries/hitboxes clash resolution checks
      const groundLine = this.virtualHeight - this.groundHeight; // 525 px Y
      
      // Floor collision check
      if (this.charY + this.charRadius >= groundLine) {
        this.triggerCrashGameOver();
        return;
      }
      
      // High performance Mathematical circle-to-rectangle boundaries overlap validation
      const bx = this.charX;
      const by = this.charY;
      const r = this.charRadius;
      
      for (const pipe of this.pipes) {
        const pLeft = pipe.x;
        const pRight = pipe.x + this.pipeWidth;
        
        // 1. Top pipe limits check
        const tLeft = pLeft;
        const tRight = pRight;
        const tTop = 0;
        const tBottom = pipe.topHeight;
        
        // Closest point calculation (Top Pipe)
        const closestTx = Math.max(tLeft, Math.min(bx, tRight));
        const closestTy = Math.max(tTop, Math.min(by, tBottom));
        const distSqT = (bx - closestTx) ** 2 + (by - closestTy) ** 2;
        
        if (distSqT < r * r) {
          this.triggerCrashGameOver();
          return;
        }
        
        // 2. Bottom pipe limits check
        const bLeft = pLeft;
        const bRight = pRight;
        const bTop = pipe.topHeight + pipe.gap;
        const bBottom = groundLine;
        
        // Closest point calculation (Bottom Pipe)
        const closestBx = Math.max(bLeft, Math.min(bx, bRight));
        const closestBy = Math.max(bTop, Math.min(by, bBottom));
        const distSqB = (bx - closestBx) ** 2 + (by - closestBy) ** 2;
        
        if (distSqB < r * r) {
          this.triggerCrashGameOver();
          return;
        }
      }
    },
    
    // Crash and end phase logic
    triggerCrashGameOver() {
      this.gameOver = true;
      synthSound("crash");
      
      // Save game score context immediately to server database
      this.store.saveSessionToServer();
      
      // Fancy debris burst effect
      const count = 15 + Math.random() * 10;
      for (let i = 0; i < count; i++) {
        const velX = (Math.random() * 6 - 3) - 1;
        const velY = (Math.random() * 6 - 3);
        this.particlesList.push({
          x: this.charX,
          y: this.charY,
          vx: velX,
          vy: velY,
          size: 3 + Math.random() * 4,
          color: this.getSkinParticleColor(),
          alpha: 1.0,
          life: 0.95
        });
      }
    },
    
    // Canvas context drawer
    renderCanvas() {
      const canvas = this.$refs.gameCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      
      // Standard resolution scales mapping variables
      const scaleX = canvas.width / this.virtualWidth;
      const scaleY = canvas.height / this.virtualHeight;
      
      ctx.imageSmoothingEnabled = true;
      
      // Draw Midnight cyber space gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, "#030712"); // slate-950
      skyGrad.addColorStop(0.5, "#0b0b1e"); // very deep outer space blue
      skyGrad.addColorStop(1, "#120e2e"); // high contrast cosmic indigo
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.scale(scaleX, scaleY);
      
      // Draw cyber Grid stars constellation in background (Parallax Space layer)
      ctx.fillStyle = "rgba(129, 140, 248, 0.2)"; // indigo starry lights
      const totalStars = 25;
      for (let i = 0; i < totalStars; i++) {
        // Pseudo-randomizing placements with wrap-around
        const xOffset = (i * 91 + this.starsPositionX) % this.virtualWidth;
        const yCoord = (i * 37) % (this.virtualHeight - this.groundHeight - 120);
        const radius = (i % 3 === 0) ? 1.5 : 0.8;
        
        ctx.beginPath();
        ctx.arc(xOffset, yCoord, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Distant mountains silhouette vector drawings (Parallax mid-layer)
      ctx.fillStyle = "rgba(46, 16, 101, 0.16)"; // dark purple tint
      ctx.beginPath();
      ctx.moveTo(0, 480);
      for (let i = 0; i <= 6; i++) {
        const peakX = (i * 90 + this.hillsPositionX) % 500 - 50;
        const peakY = 320 + (i % 2 === 0 ? 30 : 70);
        ctx.lineTo(peakX, peakY);
      }
      ctx.lineTo(this.virtualWidth, 480);
      ctx.closePath();
      ctx.fill();
      
      // Draw flying trial particles
      this.particlesList.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Draw Obstacles (Metallic Neon Tubes Pipes)
      const topPipeLipHeight = 22;
      const pipeHighlightGradientX = (xPipe, wPipe) => {
        const edgeGrad = ctx.createLinearGradient(xPipe, 0, xPipe + wPipe, 0);
        edgeGrad.addColorStop(0, "#0f172a"); // extremely dark indigo
        edgeGrad.addColorStop(0.18, "#064e43"); // deep dark emerald metal
        edgeGrad.addColorStop(0.48, "#10b981"); // bright high-contrast emerald core
        edgeGrad.addColorStop(0.78, "#047857"); // rich jade green shadow
        edgeGrad.addColorStop(1, "#022c22"); // obsidian green edge
        return edgeGrad;
      };
      
      this.pipes.forEach(pipe => {
        const px = pipe.x;
        const pw = pipe.width;
        const pTopHeight = pipe.topHeight;
        const pBottomStart = pipe.topHeight + pipe.gap;
        const groundPos = this.virtualHeight - this.groundHeight;
        
        // Style parameters: neon glows
        ctx.strokeStyle = "rgba(52, 211, 153, 0.85)"; // emerald light glow borders
        ctx.lineWidth = 1.3;
        
        // ----------------- TOP PIPE -----------------
        // Draw column body
        ctx.fillStyle = pipeHighlightGradientX(px, pw);
        ctx.fillRect(px, 0, pw, pTopHeight - topPipeLipHeight);
        ctx.strokeRect(px, -2, pw, pTopHeight - topPipeLipHeight + 2);
        
        // Draw open-end metallic lip border (slightly wider)
        const lipOffset = 4.5;
        const lipX = px - lipOffset;
        const lipW = pw + lipOffset * 2;
        const lipY = pTopHeight - topPipeLipHeight;
        
        ctx.fillStyle = pipeHighlightGradientX(lipX, lipW);
        ctx.fillRect(lipX, lipY, lipW, topPipeLipHeight);
        ctx.strokeRect(lipX, lipY, lipW, topPipeLipHeight);
        
        // Subtle gold shine ring on the rim
        ctx.fillStyle = "rgba(251, 191, 36, 0.4)"; // gold glow highlight
        ctx.fillRect(lipX + 1.5, lipY + topPipeLipHeight - 3, lipW - 3, 2);
        
        // ----------------- BOTTOM PIPE -----------------
        // Draw open-end lip border
        const bLipY = pBottomStart;
        ctx.fillStyle = pipeHighlightGradientX(lipX, lipW);
        ctx.fillRect(lipX, bLipY, lipW, topPipeLipHeight);
        ctx.strokeRect(lipX, bLipY, lipW, topPipeLipHeight);
        
        // Draw column body
        ctx.fillStyle = pipeHighlightGradientX(px, pw);
        const bColHeight = groundPos - (pBottomStart + topPipeLipHeight);
        ctx.fillRect(px, pBottomStart + topPipeLipHeight, pw, bColHeight);
        ctx.strokeRect(px, pBottomStart + topPipeLipHeight, pw, bColHeight + 2);
        
        // Gold shine ring on bottom rim
        ctx.fillStyle = "rgba(251, 191, 36, 0.4)";
        ctx.fillRect(lipX + 1.5, bLipY + 1.5, lipW - 3, 2);
      });
      
      // Draw flying character (Tilt rotations effect)
      ctx.save();
      ctx.translate(this.charX, this.charY);
      
      // Angle based on current speed
      let targetRotation = this.charVy * 0.055;
      if (targetRotation < -0.38) targetRotation = -0.38;
      if (targetRotation > 0.82) targetRotation = 0.82;
      ctx.rotate(targetRotation);
      
      const rad = this.charRadius;
      
      if (this.activeSkinId === "bird") {
        // Redraw high-fidelity cute Flappy bird on virtual coordinate space
        // Gradient yellow belly body
        const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, rad + 2);
        bodyGrad.addColorStop(0, "#fef08a"); // pastel yellow highlight
        bodyGrad.addColorStop(0.7, "#fbbf24"); // gorgeous golden Amber
        bodyGrad.addColorStop(1, "#b45309"); // orange sunset shadow rim
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        
        // Render detailed avian expressive eye
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(5, -4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(6.5, -4, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff"; // shine glare
        ctx.beginPath();
        ctx.arc(7.5, -5.2, 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Render orange beak
        ctx.fillStyle = "#f97316"; // neon orange
        ctx.beginPath();
        ctx.moveTo(rad - 2, -2);
        ctx.lineTo(rad + 5, 0);
        ctx.lineTo(rad - 3, 4);
        ctx.closePath();
        ctx.fill();
        
        // Interactive Flapping wing
        const wingYOffset = Math.sin(this.frameIdx * 0.35) * 5;
        const wingGrad = ctx.createLinearGradient(-10, - wingYOffset, -4, 6 - wingYOffset);
        wingGrad.addColorStop(0, "#fef08a");
        wingGrad.addColorStop(1, "#f59e0b");
        ctx.fillStyle = wingGrad;
        
        ctx.beginPath();
        ctx.ellipse(-6, 2, 5, 4 + Math.abs(wingYOffset) * 0.5, -0.3 + (wingYOffset * 0.05), 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 0.85;
        ctx.stroke();
        
      } else if (this.activeSkinId === "car") {
        // High fidelity futuristic neon sports hover car
        // Bottom neon plasma thrust glow
        const chassisGrad = ctx.createLinearGradient(-14, 0, 14, 0);
        chassisGrad.addColorStop(0, "#06b6d4"); // cyan metallic cyan
        chassisGrad.addColorStop(0.5, "#3b82f6"); // neon deep sapphire blue
        chassisGrad.addColorStop(1, "#1d4ed8"); // trailing royal metallic blue
        
        // Wheels
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(-8, 5, 4, 0, Math.PI * 2);
        ctx.arc(8, 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#67e8f9"; // cyan alloys
        ctx.beginPath();
        ctx.arc(-8, 5, 1.5, 0, Math.PI * 2);
        ctx.arc(8, 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Upper cabin windshield glass
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -2);
        ctx.lineTo(3, -2);
        ctx.lineTo(8, 1);
        ctx.lineTo(-10, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Main metal frame body
        ctx.fillStyle = chassisGrad;
        ctx.beginPath();
        ctx.roundRect(-14, -2, 28, 7, 3);
        ctx.fill();
        
        // Glowing Headlight beam (Projective yellow transparent cone)
        const lightGlow = ctx.createLinearGradient(12, 1, 35, 1);
        lightGlow.addColorStop(0, "rgba(253, 224, 71, 0.75)"); // hyper yellow lights bulb
        lightGlow.addColorStop(1, "rgba(253, 224, 71, 0.00)"); // fade out
        ctx.fillStyle = lightGlow;
        ctx.beginPath();
        ctx.moveTo(12, 1);
        ctx.lineTo(44, -12);
        ctx.lineTo(44, 15);
        ctx.closePath();
        ctx.fill();
        
      } else if (this.activeSkinId === "lightning") {
        // Infinite dynamic sci-fi lightning orb
        const pulse = Math.abs(Math.sin(this.frameIdx * 0.15));
        const lightningGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, rad + 4);
        lightningGrad.addColorStop(0, "#ffffff");
        lightningGrad.addColorStop(0.35, "rgba(253, 224, 71, 0.95)"); // amber yellow electric core
        lightningGrad.addColorStop(0.8, "rgba(249, 115, 22, 0.6)"); // orange plasma
        lightningGrad.addColorStop(1, "rgba(217, 70, 239, 0)"); // hyper violet fade
        
        ctx.fillStyle = lightningGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rad + 4 + (pulse * 3), 0, Math.PI * 2);
        ctx.fill();
        
        // Core electric symbol zags
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#facc15";
        
        ctx.beginPath();
        ctx.moveTo(3, -11);
        ctx.lineTo(-4, 0);
        ctx.lineTo(2, 0);
        ctx.lineTo(-3, 11);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // clear blur parameter
        
      } else if (this.activeSkinId === "cat") {
        // Draw elegant cute pink and cream kitty visage
        const catGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, rad);
        catGrad.addColorStop(0, "#fff1f2"); // rose pink body tone
        catGrad.addColorStop(0.65, "#fecdd3"); // pastel peach
        catGrad.addColorStop(1, "#f43f5e"); // vibrant rose rim
        
        // Triangular cute space ears
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(-11, -5);
        ctx.lineTo(-13, -14); // Left Ear Tip
        ctx.lineTo(-5, -11);
        ctx.fill();
        ctx.fillStyle = "#ffe4e6"; // Inner pink ear tint
        ctx.beginPath();
        ctx.moveTo(-10.2, -6.5);
        ctx.lineTo(-11.5, -11.5);
        ctx.lineTo(-6.8, -9.8);
        ctx.fill();
        
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(11, -5);
        ctx.lineTo(13, -14); // Right Ear Tip
        ctx.lineTo(5, -11);
        ctx.fill();
        ctx.fillStyle = "#ffe4e6";
        ctx.beginPath();
        ctx.moveTo(10.2, -6.5);
        ctx.lineTo(11.5, -11.5);
        ctx.lineTo(6.8, -9.8);
        ctx.fill();
        
        // Main Face circle
        ctx.fillStyle = catGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes and glowing kitty whiskers
        ctx.fillStyle = "#1e293b"; // dark grey eyes
        ctx.beginPath();
        ctx.arc(-4, -1, 1.8, 0, Math.PI * 2);
        ctx.arc(4, -1, 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil shiny spot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-3.5, -1.5, 0.7, 0, Math.PI * 2);
        ctx.arc(4.5, -1.5, 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Nose pink
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.moveTo(-1.2, 1.5);
        ctx.lineTo(1.2, 1.5);
        ctx.lineTo(0, 3);
        ctx.fill();
        
        // Small kitty whiskers whiskers lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 0.85;
        // left whiskers
        ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-11, 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-5.5, 3.5); ctx.lineTo(-10.5, 5); ctx.stroke();
        // right whiskers
        ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(11, 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(5.5, 3.5); ctx.lineTo(10.5, 5); ctx.stroke();
        
      } else if (this.activeSkinId === "panda") {
        // Black and white fuzzy chubby giant Panda face
        // Ear circles black
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(-11, -11, 5, 0, Math.PI * 2);
        ctx.arc(11, -11, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Head sphere white gradient
        const headGrad = ctx.createRadialGradient(-2.5, -2.5, 1, 0, 0, rad);
        headGrad.addColorStop(0, "#ffffff");
        headGrad.addColorStop(0.85, "#f1f5f9");
        headGrad.addColorStop(1, "#cbd5e1"); // soft shadow gray
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        
        // Black patches around eyes
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.ellipse(-4.5, -2, 3, 4, 0.3, 0, Math.PI * 2);
        ctx.ellipse(4.5, -2, 3, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // White pupils shiny glares
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-4, -2.5, 1, 0, Math.PI * 2);
        ctx.arc(4, -2.5, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Fuzzy cute black button nose
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(0, 2, 2, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore(); // restore char scale/tilt translation
      
      // Draw ground layer with moving safety hazard stripes (Vibrant retro-waves lines)
      const groundY = this.virtualHeight - this.groundHeight; // 525 px Y
      
      // Base panel of ground
      ctx.fillStyle = "#020617"; // slate-950 extremely premium flat background
      ctx.fillRect(0, groundY, this.virtualWidth, this.groundHeight);
      
      // Top dividing electric wire glows stripe line
      ctx.strokeStyle = "#818cf8"; // indigo wireframe Top line
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(this.virtualWidth, groundY);
      ctx.stroke();
      
      ctx.fillStyle = "rgba(129, 140, 248, 0.08)";
      ctx.fillRect(0, groundY + 1.5, this.virtualWidth, this.groundHeight - 1);
      
      // Moving wireframe scrolling hazard stripes
      const stripeWidth = 24;
      const stripeSpacing = 32;
      const totalStripesMax = 20;
      
      ctx.fillStyle = "rgba(129, 140, 248, 0.25)"; // glowing purple indicators stripes
      for (let i = -1; i < totalStripesMax; i++) {
        const xOffset = i * stripeSpacing + (this.groundPositionX % stripeSpacing);
        ctx.beginPath();
        ctx.moveTo(xOffset, groundY + 2);
        ctx.lineTo(xOffset + stripeWidth, groundY + 2);
        ctx.lineTo(xOffset + stripeWidth - 10, this.virtualHeight);
        ctx.lineTo(xOffset - 10, this.virtualHeight);
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.restore(); // restore global scaleX / scaleY
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.32s ease-out forwards;
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
</style>
