<template>
  <div
    class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-4 select-none relative overflow-hidden"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- Glassmorphic Top HUD Header: Minimalist Statistics -->
    <div class="w-full flex justify-between items-center bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-3 shadow-lg mb-2 z-10">
      <div class="flex items-center gap-2">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <i class="bi bi-heptagon-gold text-emerald-400 text-sm animate-pulse"></i>
        </div>
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Счёт</span>
          <span class="text-lg font-black text-emerald-400 font-mono leading-none">{{ score }}</span>
        </div>
      </div>

      <!-- Active Bonus Indicator -->
      <div v-if="activeEffect" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider animate-pulse"
        :class="{
          'bg-amber-500/10 border-amber-500/30 text-amber-400': activeEffect === 'GOLD',
          'bg-cyan-500/10 border-cyan-500/30 text-cyan-400': activeEffect === 'SLOW'
        }"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="activeEffect === 'GOLD' ? 'bg-amber-400' : 'bg-cyan-400'"></span>
        <span>{{ activeEffect === 'GOLD' ? 'КОМБО x3' : 'ЗАМЕДЛЕНИЕ' }}</span>
        <span class="font-mono text-[9px]">({{ Math.ceil(effectTimer / 1000) }}с)</span>
      </div>

      <div class="flex items-center gap-2 text-right">
        <div>
          <span class="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Рекорд</span>
          <span class="text-lg font-black text-indigo-400 font-mono leading-none">{{ highscore }}</span>
        </div>
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30">
          <i class="bi bi-trophy text-indigo-400 text-sm"></i>
        </div>
      </div>
    </div>

    <!-- Active Canvas Arena with automatic scaling -->
    <div ref="canvasContainer" class="flex-1 w-full max-w-md flex items-center justify-center relative my-1 overflow-hidden min-h-0">
      <canvas
        ref="gameCanvas"
        class="border border-slate-800/80 rounded-2xl bg-slate-950 shadow-2xl w-full aspect-square block transition-all"
      ></canvas>

      <!-- Glassmorphic start-up and Lobby Screen -->
      <div
        v-if="!hasStarted && !gameOver"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-15"
      >
        <div class="relative mb-4">
          <div class="absolute -inset-1 rounded-full bg-cyan-500/30 blur-md animate-pulse"></div>
          <div class="w-16 h-16 bg-slate-900 border border-cyan-500/40 rounded-full flex items-center justify-center text-cyan-400 relative">
            <i class="bi bi-compass text-3xl animate-spin" style="animation-duration: 8s"></i>
          </div>
        </div>
        
        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 leading-none mb-1 tracking-wider">
          ЗМЕЙКА NEON
        </h2>
        <p class="text-[11px] font-medium text-slate-400 max-w-[240px] mb-6 leading-normal">
          Управляйте скольжением пальца по экрану! Никаких кнопок — чистый жестовый дрифт!
        </p>

        <!-- Mode selector checkboxes/tabs -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-1 w-full max-w-[260px] flex gap-1 mb-6">
          <button
            @click="gameMode = 'CLASSIC'"
            class="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 border-none cursor-pointer"
            :class="gameMode === 'CLASSIC' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-500 hover:text-slate-300 bg-transparent'"
          >
            Стены-Смерть
          </button>
          <button
            @click="gameMode = 'WRAP'"
            class="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 border-none cursor-pointer"
            :class="gameMode === 'WRAP' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300 bg-transparent'"
          >
            Сквозной
          </button>
        </div>

        <button
          @click="startGame"
          class="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border-none shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          Играть
        </button>
      </div>

      <!-- Glassmorphic Game Over Screen -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-15 animate-fade-in"
      >
        <div class="relative w-14 h-14 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center text-red-500 mb-4 animate-bounce">
          <i class="bi bi-skull text-3xl"></i>
        </div>
        
        <h2 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-1 tracking-wide">
          СТОЛКНОВЕНИЕ
        </h2>
        <p class="text-xs font-semibold text-slate-400 mb-6 leading-normal">
          Рекордный путь окончен на отметке в<br>
          <span class="text-emerald-400 font-extrabold font-mono text-sm leading-normal">{{ score }} очков</span>!
        </p>

        <!-- Mode display during Game Over for convenience -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-1 w-full max-w-[220px] flex gap-1 mb-6 mx-auto">
          <button
            @click="gameMode = 'CLASSIC'"
            class="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
            :class="gameMode === 'CLASSIC' ? 'bg-red-500/10 text-red-400' : 'text-slate-600 bg-transparent'"
          >
            Стены-Смерть
          </button>
          <button
            @click="gameMode = 'WRAP'"
            class="flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer"
            :class="gameMode === 'WRAP' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-600 bg-transparent'"
          >
            Сквозной
          </button>
        </div>

        <button
          @click="restartGame"
          class="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 border-none shadow-lg shadow-red-500/20 cursor-pointer"
        >
          Заново
        </button>
      </div>
    </div>

    <!-- Active Gesture Help Tray -->
    <div class="w-full max-w-[320px] py-3 px-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl text-center text-slate-400 text-[10px] font-bold leading-normal shrink-0 mt-2 flex items-center justify-center gap-2">
      <i class="bi bi-phone-vibrate text-cyan-400 text-sm animate-pulse"></i>
      <span>Проведите пальцем на Canvas в любую сторону для поворота!</span>
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
      highscore: Number(localStorage.getItem("game_snake_highscore")) || 0,
      gameOver: false,
      hasStarted: false,
      
      // Configuration & Grid Space
      tileCount: 20,
      gridSize: 20, // dynamically calculated
      gameMode: "CLASSIC", // 'CLASSIC' or 'WRAP'
      
      // Snake State
      snake: [],
      direction: "RIGHT",
      lastExecutedDirection: "RIGHT",
      directionQueue: [], // Command Queue with size up to 2
      
      // Multi-objects spawns
      food: { x: 0, y: 0, type: "NORMAL", timer: 0 }, // NORMAL, GOLD, SLOW
      activeEffect: null, // "GOLD" (3x points) or "SLOW" (reduced speed)
      effectTimer: 0, // dynamic remaining ms for powerups

      // Particle VFX lists
      particles: [],
      trailParticles: [],
      
      // Responsive DPR helpers
      dpr: window.devicePixelRatio || 1,
      animationFrameId: null,
      
      // Game loop tick state
      lastTickTime: 0,
      baseSpeed: 140, // standard interval ms
      currentSpeed: 140, // temporary modified speed
      
      // Touch Swipe Vector Detection Anchors
      touchStart: { x: 0, y: 0 },
      isSwiping: false,
      resizeObserver: null
    };
  },
  computed: {
    store() {
      return useMainStore();
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    
    // Bind canvas resize tracker
    this.setupCanvasResize();
    
    // Start continuous requestAnimationFrame draw cycle
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
    // Vibrate utilities with iframe proof safeguards
    vibrate(pattern) {
      if (navigator.vibrate) {
        try {
          navigator.vibrate(pattern);
        } catch (_) {}
      }
    },
    setupCanvasResize() {
      const container = this.$refs.canvasContainer;
      const canvas = this.$refs.gameCanvas;
      if (!container || !canvas) return;

      const resize = () => {
        const bounds = container.getBoundingClientRect();
        const size = Math.min(bounds.width, bounds.height, 420);
        
        // Match retina pixel ratio sharp rendering
        const dpr = window.devicePixelRatio || 1;
        this.dpr = dpr;
        
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        this.gridSize = (size * dpr) / this.tileCount;
      };

      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(container);
      resize();
    },
    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.store.updateSessionScore(0);
      this.direction = "RIGHT";
      this.lastExecutedDirection = "RIGHT";
      this.directionQueue = [];
      this.baseSpeed = 145;
      this.currentSpeed = 145;
      this.activeEffect = null;
      this.effectTimer = 0;
      this.particles = [];
      this.trailParticles = [];
      
      // Initial centered snake segments
      this.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      
      this.spawnFood();
      this.lastTickTime = performance.now();
      playSound.levelUp();
      this.vibrate(20);
    },
    restartGame() {
      this.startGame();
    },
    spawnFood() {
      let valid = false;
      let rx = 0, ry = 0;
      
      while (!valid) {
        rx = Math.floor(Math.random() * this.tileCount);
        ry = Math.floor(Math.random() * this.tileCount);
        
        // Prevent block overlay on snake body elements
        valid = !this.snake.some(seg => seg.x === rx && seg.y === ry);
      }
      
      this.food.x = rx;
      this.food.y = ry;
      
      // 10% Gold apple, 10% Blue speed slow berry, 80% Normal crimson apple
      const roll = Math.random();
      if (roll < 0.12) {
        this.food.type = "GOLD";
        this.food.timer = 5000; // expires in 5 seconds
      } else if (roll < 0.22) {
        this.food.type = "SLOW";
        this.food.timer = 5000; // expires in 5 seconds
      } else {
        this.food.type = "NORMAL";
        this.food.timer = 0;
      }
    },
    changeDirection(dir) {
      if (!this.hasStarted || this.gameOver) return;
      
      // Check last item in queue or current direction to filter suicidal returns
      const targetCheck = this.directionQueue.length > 0 
        ? this.directionQueue[this.directionQueue.length - 1] 
        : this.lastExecutedDirection;
        
      if (dir === "UP" && targetCheck !== "DOWN" && targetCheck !== "UP") {
        this.queueDirection("UP");
      } else if (dir === "DOWN" && targetCheck !== "UP" && targetCheck !== "DOWN") {
        this.queueDirection("DOWN");
      } else if (dir === "LEFT" && targetCheck !== "RIGHT" && targetCheck !== "LEFT") {
        this.queueDirection("LEFT");
      } else if (dir === "RIGHT" && targetCheck !== "LEFT" && targetCheck !== "RIGHT") {
        this.queueDirection("RIGHT");
      }
    },
    queueDirection(dir) {
      // Allow max 2 buffered movements for quick combo turns
      if (this.directionQueue.length < 2) {
        this.directionQueue.push(dir);
        this.vibrate(6); // instant subtle click haptic (5-8ms)
        try { playSound.tick(); } catch(_) {}
      }
    },
    logicalPhysicsTick() {
      if (!this.hasStarted || this.gameOver) return;
      
      // Take next command in queue
      if (this.directionQueue.length > 0) {
        this.direction = this.directionQueue.shift();
      }
      this.lastExecutedDirection = this.direction;
      
      // Shift Next Head Position
      let head = { ...this.snake[0] };
      
      if (this.direction === "UP") head.y--;
      else if (this.direction === "DOWN") head.y++;
      else if (this.direction === "LEFT") head.x--;
      else if (this.direction === "RIGHT") head.x++;
      
      // Boundary collision check
      if (this.gameMode === "CLASSIC") {
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
          this.endGame();
          return;
        }
      } else {
        // Mode WRAP: wrap around the borders
        if (head.x < 0) head.x = this.tileCount - 1;
        if (head.x >= this.tileCount) head.x = 0;
        if (head.y < 0) head.y = this.tileCount - 1;
        if (head.y >= this.tileCount) head.y = 0;
      }
      
      // Tail self overlay check (except the very last tip if we don't grow)
      const eatenSelf = this.snake.some((seg, idx) => {
        if (idx === 0) return false;
        // if self eating point equals our next virtual head orientation
        return seg.x === head.x && seg.y === head.y;
      });
      
      if (eatenSelf) {
        this.endGame();
        return;
      }
      
      // Add new head segment
      this.snake.unshift(head);
      
      // Food consumption check
      if (head.x === this.food.x && head.y === this.food.y) {
        // Standard, triple combo, slows reward speed triggers
        let pointsEarned = 10;
        if (this.activeEffect === "GOLD") {
          pointsEarned = 30; // triple score combo
        }
        
        if (this.food.type === "GOLD") {
          this.activeEffect = "GOLD";
          this.effectTimer = 5500;
          this.triggerSparkSplash(this.food.x, this.food.y, "#f59e0b"); // gold shiny
        } else if (this.food.type === "SLOW") {
          this.activeEffect = "SLOW";
          this.effectTimer = 5500;
          this.triggerSparkSplash(this.food.x, this.food.y, "#06b6d4"); // neon blue
        } else {
          this.triggerSparkSplash(this.food.x, this.food.y, "#ec4899"); // pink crimson
        }
        
        this.score += pointsEarned;
        this.store.updateSessionScore(this.score);
        if (this.score > this.highscore) {
          this.highscore = this.score;
          localStorage.setItem("game_snake_highscore", this.highscore);
        }
        
        playSound.score();
        this.vibrate(28); // firm 25-30ms haptic
        this.spawnFood();
        
        // Base dynamic progression speed up
        if (this.baseSpeed > 68) {
          this.baseSpeed -= 1.5;
        }
      } else {
        // Simply pull the tail segment out
        this.snake.pop();
      }
      
      // Gradually speed progression with effects
      this.recalculateTickSpeed();
    },
    recalculateTickSpeed() {
      // SLOW mode scales speed ticks down significantly for easier control
      if (this.activeEffect === "SLOW") {
        this.currentSpeed = this.baseSpeed * 1.55;
      } else {
        this.currentSpeed = this.baseSpeed;
      }
    },
    triggerSparkSplash(gx, gy, color) {
      const d = this.gridSize;
      const originX = gx * d + d / 2;
      const originY = gy * d + d / 2;
      
      // Generate 12-15 glowing particle vectors
      const count = 14;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2.0 + Math.random() * 4.5;
        this.particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          color: color,
          size: 2 + Math.random() * 3.5,
          life: 30 + Math.floor(Math.random() * 20),
          maxLife: 50
        });
      }
    },
    spawnTailSparks() {
      if (this.snake.length === 0) return;
      const tail = this.snake[this.snake.length - 1];
      const d = this.gridSize;
      const originX = tail.x * d + d / 2;
      const originY = tail.y * d + d / 2;
      
      // 20% frame chance of leaving a glowing spark tail
      if (Math.random() < 0.28) {
        this.trailParticles.push({
          x: originX + (Math.random() - 0.5) * 6,
          y: originY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          color: this.activeEffect === "GOLD" ? "#f59e0b" : "#06b6d4",
          size: 1.5 + Math.random() * 2,
          life: 20 + Math.floor(Math.random() * 10),
          maxLife: 30
        });
      }
    },
    endGame() {
      this.gameOver = true;
      playSound.gameOver();
      this.vibrate([100, 50, 100]); // heavy dual crash haptic
    },
    startDrawLoop() {
      const loop = (timestamp) => {
        this.updateAndDrawFrame(timestamp);
        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    },
    updateAndDrawFrame(timestamp) {
      // 1. Tick timers
      if (this.hasStarted && !this.gameOver) {
        const delta = timestamp - this.lastTickTime;
        if (delta >= this.currentSpeed) {
          this.logicalPhysicsTick();
          this.lastTickTime = timestamp;
        }
        
        // Active effects subtraction timer
        if (this.activeEffect) {
          // decrement the elapsed frames times (approx 16.7ms for 60fps)
          this.effectTimer -= 16.7; 
          if (this.effectTimer <= 0) {
            this.activeEffect = null;
            this.recalculateTickSpeed();
          }
        }
        
        // Expiration of gold/blue item on ground
        if (this.food.type !== "NORMAL") {
          this.food.timer -= 16.7;
          if (this.food.timer <= 0) {
            // Food expired, respawn standard clean one
            this.spawnFood();
          }
        }
        
        // Continuously leak glowing sparks
        this.spawnTailSparks();
      }
      
      // 2. Render Loop (at fluid high refresh rate)
      this.drawCanvasContent();
    },
    drawCanvasContent() {
      const canvas = this.$refs.gameCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const d = this.gridSize;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Clear solid high elegant Slate background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Render beautiful background neon grid intersections
      ctx.strokeStyle = "rgba(79, 70, 229, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= this.tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * d, 0);
        ctx.lineTo(i * d, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * d);
        ctx.lineTo(canvas.width, i * d);
        ctx.stroke();
      }
      
      // Render active trail particles
      this.trailParticles.forEach((tp, index) => {
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.life--;
        const alpha = Math.max(0, tp.life / tp.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 4;
        ctx.shadowColor = tp.color;
        ctx.fillStyle = tp.color;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      this.trailParticles = this.trailParticles.filter(tp => tp.life > 0);

      // Render active explosion VFX particles
      this.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        const alpha = Math.max(0, p.life / p.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      this.particles = this.particles.filter(p => p.life > 0);

      if (this.hasStarted) {
        // Draw food with interactive breathing scale and active progress border
        const fSize = d - 4;
        const cx = this.food.x * d + d / 2;
        const cy = this.food.y * d + d / 2;
        
        // Food bounce animation scale
        const scaleFactor = 1.0 + Math.sin(performance.now() * 0.01) * 0.12;
        const baseRadius = (d / 2 - 2.5) * scaleFactor;
        
        ctx.save();
        ctx.shadowBlur = 18;
        
        if (this.food.type === "GOLD") {
          // Neon sparkling Gold
          ctx.shadowColor = "#f59e0b";
          ctx.fillStyle = "#f59e0b";
          
          ctx.beginPath();
          ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw subtle expiring golden countdown radial dash
          const ratio = Math.max(0, this.food.timer / 5000);
          ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, baseRadius + 3, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * ratio));
          ctx.stroke();
        } else if (this.food.type === "SLOW") {
          // Symmetrical Neon cyan freeze berry
          ctx.shadowColor = "#06b6d4";
          ctx.fillStyle = "#06b6d4";
          
          ctx.beginPath();
          ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
          ctx.fill();
          
          const ratio = Math.max(0, this.food.timer / 5000);
          ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, baseRadius + 3, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * ratio));
          ctx.stroke();
        } else {
          // Rich crimson raspberry
          ctx.shadowColor = "#ec4899";
          ctx.fillStyle = "#ec4899";
          ctx.beginPath();
          ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Draw Snake body with smart visual gradient & connection smooth curves
        this.snake.forEach((segment, idx) => {
          ctx.save();
          
          const pad = 1.5;
          const sx = segment.x * d + pad;
          const sy = segment.y * d + pad;
          const sSize = d - pad * 2;
          
          if (idx === 0) {
            // Neon cyan head
            ctx.fillStyle = "#06b6d4";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#06b6d4";
            
            ctx.beginPath();
            ctx.roundRect(sx, sy, sSize, sSize, 6);
            ctx.fill();
            
            // Draw cute neon eyes indicating direction mapping
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 4;
            ctx.shadowColor = "#ffffff";
            
            const eyeOffset = d / 3;
            const eyeRadius = d / 12;
            const hx = segment.x * d + d / 2;
            const hy = segment.y * d + d / 2;
            
            ctx.beginPath();
            if (this.direction === "RIGHT") {
              ctx.arc(hx + eyeOffset - 1, hy - eyeOffset, eyeRadius, 0, Math.PI * 2);
              ctx.arc(hx + eyeOffset - 1, hy + eyeOffset, eyeRadius, 0, Math.PI * 2);
            } else if (this.direction === "LEFT") {
              ctx.arc(hx - eyeOffset + 1, hy - eyeOffset, eyeRadius, 0, Math.PI * 2);
              ctx.arc(hx - eyeOffset + 1, hy + eyeOffset, eyeRadius, 0, Math.PI * 2);
            } else if (this.direction === "UP") {
              ctx.arc(hx - eyeOffset, hy - eyeOffset + 1, eyeRadius, 0, Math.PI * 2);
              ctx.arc(hx + eyeOffset, hy - eyeOffset + 1, eyeRadius, 0, Math.PI * 2);
            } else if (this.direction === "DOWN") {
              ctx.arc(hx - eyeOffset, hy + eyeOffset - 1, eyeRadius, 0, Math.PI * 2);
              ctx.arc(hx + eyeOffset, hy + eyeOffset - 1, eyeRadius, 0, Math.PI * 2);
            }
            ctx.fill();
          } else {
            // Gradient segments cascading backwards opacity
            const fade = Math.max(0.24, 1.0 - idx / (this.snake.length + 3));
            ctx.fillStyle = this.activeEffect === "GOLD" 
              ? `rgba(245, 158, 11, ${fade})` // orange/gold snake effect
              : `rgba(6, 182, 212, ${fade})`; // sleek neon turquoise
              
            ctx.shadowBlur = 6;
            ctx.shadowColor = this.activeEffect === "GOLD" ? "#f59e0b" : "#06b6d4";
            
            ctx.beginPath();
            ctx.roundRect(sx, sy, sSize, sSize, 5);
            ctx.fill();
          }
          ctx.restore();
        });
      }
    },
    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      if (["ArrowUp", "KeyW"].includes(event.code)) {
        this.changeDirection("UP");
        event.preventDefault();
      } else if (["ArrowDown", "KeyS"].includes(event.code)) {
        this.changeDirection("DOWN");
        event.preventDefault();
      } else if (["ArrowLeft", "KeyA"].includes(event.code)) {
        this.changeDirection("LEFT");
        event.preventDefault();
      } else if (["ArrowRight", "KeyD"].includes(event.code)) {
        this.changeDirection("RIGHT");
        event.preventDefault();
      }
    },
    onTouchStart(e) {
      if (!this.hasStarted || this.gameOver) return;
      if (!e || !e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      this.touchStart = { x: touch.clientX, y: touch.clientY };
      this.isSwiping = true;
    },
    onTouchMove(e) {
      if (!this.isSwiping || !this.hasStarted || this.gameOver) return;
      if (!e || !e.touches || e.touches.length === 0) return;
      
      // Prevent browser default scroll actions
      if (e.cancelable) e.preventDefault();
      
      const touch = e.touches[0];
      const dx = touch.clientX - this.touchStart.x;
      const dy = touch.clientY - this.touchStart.y;
      
      const threshold = 25; // 25px displacement vector trigger
      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) this.changeDirection("RIGHT");
          else this.changeDirection("LEFT");
        } else {
          if (dy > 0) this.changeDirection("DOWN");
          else this.changeDirection("UP");
        }
        
        // Reset touch anchor following action to support fluid multiple successive swipe sweeps within same drag
        this.touchStart = { x: touch.clientX, y: touch.clientY };
      }
    },
    onTouchEnd() {
      this.isSwiping = false;
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
    transform: scale(1);
  }
}
</style>
