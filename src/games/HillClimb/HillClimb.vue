<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-3 select-none relative font-sans overflow-hidden">
    <!-- Neon Background Grid -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,10,38,0.85)_0%,rgba(5,3,15,1)_100%)] z-0 pointer-events-none"></div>

    <!-- HUD Stats Display Panel -->
    <div class="w-full flex justify-between items-center bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-3 py-2 shadow-xl z-10 relative">
      <div class="flex items-center gap-2">
        <button
          @click.stop="exitToGamesList"
          class="w-7 h-7 rounded-lg bg-slate-800/85 hover:bg-slate-700 hover:text-white border-none text-slate-300 cursor-pointer flex items-center justify-center transition active:scale-95"
          title="Выйти в игротеку"
        >
          <i class="bi bi-chevron-left text-xs font-black leading-none animate-pulse"></i>
        </button>

        <!-- Live Score Display during play -->
        <div v-if="hasStarted" class="flex flex-col">
          <span class="text-[7.5px] font-black uppercase text-pink-500 tracking-wider">Очки</span>
          <span class="text-sm font-black font-mono text-white leading-none tracking-tight">{{ score }}</span>
        </div>
        <div v-else class="flex flex-col">
          <span class="text-[7.5px] font-black uppercase text-cyan-400 tracking-wider">Игра</span>
          <span class="text-xs font-black tracking-tight leading-none text-slate-100">RIDER NEON</span>
        </div>
      </div>

      <!-- Current Combo / Multiplier Gauge during hot runs -->
      <div v-if="hasStarted && !gameOver" class="px-2 py-0.5 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center gap-1.5 text-[8.5px] font-black tracking-widest uppercase">
        <span class="flex items-center gap-1 font-mono text-cyan-400">
          <i class="bi bi-lightning-charge-fill animate-pulse text-amber-400"></i>
          <span>X{{ activeMultiplier }}</span>
        </span>
        <span class="text-slate-600">|</span>
        <span class="text-pink-400 font-mono">{{ Math.floor(distance) }}м</span>
      </div>

      <!-- Static display of highscore of crystals -->
      <div v-else class="px-2.5 py-1 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center gap-1.5 text-[8px] font-black uppercase text-amber-400 tracking-wider font-mono">
        <i class="bi bi-award-fill"></i>
        <span>Рекорд: {{ highscore }}м</span>
      </div>

      <div class="flex items-center gap-2 text-right">
        <!-- Diamond Gems Counter Display -->
        <div class="flex items-center gap-1 bg-emerald-950/50 border border-emerald-500/20 px-2.5 py-1 rounded-xl shadow-lg">
          <i class="bi bi-gem text-emerald-400 scale-90 leading-none"></i>
          <span class="text-xs font-black font-mono text-emerald-300 leading-none">{{ coins }}</span>
        </div>
      </div>
    </div>

    <!-- Active Physical Game Board -->
    <div class="flex-grow w-full max-w-lg flex items-center justify-center relative my-2 z-10">
      <div class="relative w-full aspect-[48/26]">
        <canvas
          ref="physicsCanvas"
          @mousedown="handlePressStart"
          @mouseup="handlePressEnd"
          @mouseleave="handlePressEnd"
          @touchstart.prevent="handlePressStart"
          @touchend.prevent="handlePressEnd"
          class="border border-slate-850/80 rounded-3xl bg-slate-950 shadow-inner w-full h-full relative z-10 cursor-pointer overflow-hidden"
          width="480"
          height="260"
        ></canvas>

        <!-- Tap-To-Hold action instruction overlay on gameplay -->
        <div
          v-if="hasStarted && !gameOver && isFirstLaunchTip"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-xl px-3 py-1.5 text-center pointer-events-none z-15 animate-pulse"
        >
          <p class="text-[8px] font-bold tracking-wider text-slate-300 uppercase m-0 flex items-center gap-1">
            <i class="bi bi-hand-index-thumb text-cyan-400 animate-bounce"></i>
            Зажмите экран или пробел для ускорения и флипов в воздухе!
          </p>
        </div>

        <!-- Welcome Lobby Screen + Showroom -->
        <div
          v-if="!hasStarted && !gameOver"
          class="absolute inset-0 bg-slate-950/95 backdrop-blur-md border border-slate-800/30 rounded-3xl flex flex-col items-center justify-between p-4 text-center z-20"
        >
          <!-- Neon Title Branding -->
          <div class="mt-2">
            <h1 class="text-2xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 m-0">
              RIDER
            </h1>
            <p class="text-[7.5px] font-black tracking-widest text-cyan-400/80 uppercase mt-0.5">
              НЕОНОВЫЕ КРУИЗЫ • ФИЗИЧЕСКИЙ РАННЕР
            </p>
          </div>

          <!-- Bike Showroom Show -->
          <div class="w-full max-w-xs bg-slate-900/60 border border-slate-850 rounded-2xl p-2 flex flex-col items-center">
            <div class="flex items-center justify-between w-full px-2">
              <button
                @click="prevBike"
                class="w-6 h-6 rounded-lg bg-slate-800 border-none text-slate-300 hover:text-white cursor-pointer flex items-center justify-center active:scale-90 select-none transition"
              >
                <i class="bi bi-chevron-left text-xs"></i>
              </button>
              
              <!-- Active selected bike visual representation -->
              <div class="flex flex-col items-center">
                <span class="text-[9px] font-black uppercase text-slate-300 tracking-wider">
                  {{ activeBike.name }}
                </span>
                <span class="text-[7.5px] font-mono font-medium text-slate-500 uppercase mt-0.5">
                  Вращение: {{ activeBike.spinRate }}x | Стабильность: {{ activeBike.weight }}x
                </span>
              </div>

              <button
                @click="nextBike"
                class="w-6 h-6 rounded-lg bg-slate-800 border-none text-slate-300 hover:text-white cursor-pointer flex items-center justify-center active:scale-90 select-none transition"
              >
                <i class="bi bi-chevron-right text-xs"></i>
              </button>
            </div>

            <div class="my-2 h-7 flex items-center justify-center relative w-full">
              <!-- Glow silhouette icon for selected model -->
              <div :class="`w-8 h-8 rounded-full flex items-center justify-center border transition`"
                   :style="{ borderColor: activeBike.color, boxShadow: `0 0 10px ${activeBike.color}50`, backgroundColor: `${activeBike.color}15` }">
                <i class="bi bi-bicycle text-sm" :style="{ color: activeBike.color }"></i>
              </div>
            </div>

            <!-- Lock and purchase control buttons -->
            <div class="w-full flex justify-center">
              <button
                v-if="!isBikeUnlocked(activeBike)"
                @click="unlockBike(activeBike)"
                class="w-full max-w-[130px] py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition border-none cursor-pointer flex items-center justify-center gap-1"
              >
                <i class="bi bi-lock-fill"></i> Купить за {{ activeBike.price }} <i class="bi bi-gem scale-75"></i>
              </button>
              <button
                v-else-if="activeBikeId === activeBike.id"
                class="w-full max-w-[130px] py-1 bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 font-black text-[9px] uppercase tracking-wider rounded-lg cursor-not-allowed select-none"
              >
                ВЫБРАН
              </button>
              <button
                v-else
                @click="selectBike(activeBike.id)"
                class="w-full max-w-[130px] py-1 bg-slate-800 hover:bg-slate-705 border border-slate-700 text-slate-200 font-black text-[9px] uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                ВЫБРАТЬ БАЙК
              </button>
            </div>
          </div>

          <!-- Main Launch buttons -->
          <div class="w-full flex flex-col items-center gap-1.5">
            <button
              @click="startGame"
              class="w-full max-w-[180px] py-2.5 bg-gradient-to-r from-pink-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition border-none shadow-lg cursor-pointer active:scale-95"
            >
              НАЧАТЬ ПОЛЕТ
            </button>
          </div>
        </div>

        <!-- Game Over overlay panel screen with stats analysis -->
        <div
          v-if="gameOver"
          class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-around p-4 text-center z-20 border border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]"
        >
          <div class="flex flex-col items-center">
            <div class="w-11 h-11 bg-red-500/10 border border-red-500/35 rounded-full flex items-center justify-center text-red-500 mb-2 animate-bounce">
              <i class="bi bi-fire text-lg"></i>
            </div>
            <h2 class="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 m-0 tracking-tight uppercase leading-none">
              {{ crashReason || 'ТРАНСПОРТ УНИЧТОЖЕН' }}
            </h2>
            <p class="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Колеса и днище безопасны, но голова водителя - уязвима!
            </p>
          </div>

          <!-- Session Final stats boards -->
          <div class="grid grid-cols-2 gap-3 w-full max-w-[260px] bg-slate-900/60 border border-slate-850 rounded-2xl p-2.5">
            <div class="text-center border-r border-slate-800">
              <span class="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Дистанция</span>
              <span class="text-sm font-extrabold font-mono text-cyan-400">{{ Math.floor(distance) }}м</span>
            </div>
            <div class="text-center">
              <span class="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Итог очков</span>
              <span class="text-sm font-extrabold font-mono text-pink-400">{{ score }}</span>
            </div>
          </div>

          <!-- Interaction options -->
          <div class="flex flex-col gap-1.5 w-full max-w-[200px]">
            <button
              @click="startGame"
              class="py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition border-none shadow-md cursor-pointer active:scale-95"
            >
              ПОПРОБОВАТЬ СНОВА
            </button>
            <button
              @click="exitToMainMenu"
              class="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] uppercase font-bold tracking-wider rounded-lg transition overflow-hidden cursor-pointer active:scale-95"
            >
              В ГЛАВНОЕ МЕНЮ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Physical Control Touchbar -->
    <div class="w-full shrink-0 relative mt-1 select-none z-10">
      <!-- High contrast single visual button representing Tap trigger -->
      <button
        @mousedown="handlePressStart"
        @mouseup="handlePressEnd"
        @mouseleave="handlePressEnd"
        @touchstart.prevent="handlePressStart"
        @touchend.prevent="handlePressEnd"
        class="w-full h-14 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-500/25 active:border-cyan-400 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition duration-150 cursor-pointer text-slate-200 shadow-lg select-none hover:shadow-cyan-500/5 active:scale-98"
      >
        <span class="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1 animate-pulse">
          <i class="bi bi-hand-index-thumb"></i> Зажмите для ПОЕЗДКИ / ТРЮКА
        </span>
        <span class="text-[7px] font-bold text-slate-500 uppercase tracking-wider leading-none">
          Удерживайте на приземлении: Газ • В воздухе: Вращение по часовой стрелке
        </span>
      </button>
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
      coins: Number(localStorage.getItem("game_rider_coins")) || 150, // User ruby/gems balance
      distance: 0,
      highscore: Number(localStorage.getItem("game_hillclimb_highscore")) || 0,
      gameOver: false,
      hasStarted: false,
      crashReason: "",
      
      // Control Hold status
      isPressed: false,
      isFirstLaunchTip: true,

      // Live physical tracking of our cyberpunk chassis
      bike: {
        x: 60,
        y: 100,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
      },

      // Air time flip calculation markers
      wasInAir: false,
      startingAirAngle: 0,
      lastAirAngle: 0,
      accumulatedRotation: 0,
      currentFlipsInJump: 0,
      activeMultiplier: 1,

      // Showroom models definitions
      activeBikeId: localStorage.getItem("game_rider_active_bike") || "cyber_cruiser",
      unlockedBikes: JSON.parse(localStorage.getItem("game_rider_unlocked_bikes")) || ["cyber_cruiser"],
      bikesList: [
        {
          id: "cyber_cruiser",
          name: "Cyber Cruiser",
          color: "#00f0ff", // cyan neon tag
          spinRate: 1.0,
          weight: 1.0,
          price: 0,
        },
        {
          id: "neon_interceptor",
          name: "Neon Interceptor",
          color: "#ff007f", // hot pink
          spinRate: 1.25,
          weight: 0.9,
          price: 150,
        },
        {
          id: "phantasm_rider",
          name: "Phantasm Rider",
          color: "#ff9f00", // warm gold
          spinRate: 1.05,
          weight: 1.35,
          price: 300,
        },
        {
          id: "vortex_x",
          name: "Vortex X",
          color: "#39ff14", // acid neon lime
          spinRate: 1.45,
          weight: 1.15,
          price: 600,
        }
      ],
      showroomIndex: 0,

      // Endless level crystals layout array
      gemsList: [],
      floatingTextsList: [],
      particlesList: [],
      wheelTrailsList: [], // keeps glowing trace path points of rear/front wheels
      animationFrameId: null,
      frameIdx: 0,
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    activeBike() {
      // Bike rendered currently in showroom
      return this.bikesList[this.showroomIndex];
    },
    equippedBike() {
      // Bike active for gameplay properties
      return this.bikesList.find(b => b.id === this.activeBikeId) || this.bikesList[0];
    }
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    
    // Select correct model index inside showroom automatically on load
    const activeIdx = this.bikesList.findIndex(b => b.id === this.activeBikeId);
    if (activeIdx !== -1) {
      this.showroomIndex = activeIdx;
    }

    this.$nextTick(() => {
      this.drawInitial();
    });
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  },
  methods: {
    // Showroom logic controls
    isBikeUnlocked(bike) {
      return this.unlockedBikes.includes(bike.id) || bike.price === 0;
    },
    selectBike(id) {
      this.activeBikeId = id;
      localStorage.setItem("game_rider_active_bike", id);
      playSound.rotate();
    },
    unlockBike(bike) {
      if (this.coins >= bike.price) {
        this.coins -= bike.price;
        localStorage.setItem("game_rider_coins", this.coins);
        
        this.unlockedBikes.push(bike.id);
        localStorage.setItem("game_rider_unlocked_bikes", JSON.stringify(this.unlockedBikes));
        
        this.activeBikeId = bike.id;
        localStorage.setItem("game_rider_active_bike", bike.id);
        playSound.score();
      } else {
        playSound.tick(); // error visual reminder
      }
    },
    nextBike() {
      this.showroomIndex = (this.showroomIndex + 1) % this.bikesList.length;
      playSound.tick();
    },
    prevBike() {
      this.showroomIndex = (this.showroomIndex - 1 + this.bikesList.length) % this.bikesList.length;
      playSound.tick();
    },

    // Press action handlers
    handlePressStart(e) {
      this.isPressed = true;
      this.isFirstLaunchTip = false;
    },
    handlePressEnd() {
      this.isPressed = false;
    },

    exitToMainMenu() {
      this.hasStarted = false;
      this.gameOver = false;
      this.score = 0;
      this.bike = {
        x: 60,
        y: 100,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
      };
      this.gemsList = [];
      this.floatingTextsList = [];
      this.particlesList = [];
      this.wheelTrailsList = [];
      this.drawInitial();
    },

    exitToGamesList() {
      this.store.setActiveGameId(null);
    },

    drawInitial() {
      const canvas = this.$refs.physicsCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      
      // Draw magnificent dark theme
      ctx.fillStyle = "#040209";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a grid pattern
      ctx.strokeStyle = "rgba(79, 70, 229, 0.05)";
      ctx.lineWidth = 1;
      for (let tx = 0; tx < canvas.width; tx += 30) {
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.lineTo(tx, canvas.height);
        ctx.stroke();
      }
      for (let ty = 0; ty < canvas.height; ty += 30) {
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(canvas.width, ty);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(0, 0);
      
      // Draw sample starting neon line for showroom
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#ff007f";
      ctx.strokeStyle = "#ff007f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 180);
      for (let tx = 0; tx <= canvas.width; tx += 10) {
        ctx.lineTo(tx, 180);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    },

    // Rider Dynamic Infinite Track Formula
    getTerrainY(x) {
      if (x < 150) return 180; // Secure starting runway segment

      // Continuous loop of styled rollercoaster structures (each sector is 1000m)
      const sectorLength = 850;
      const sectorId = Math.floor(x / sectorLength);
      const localX = x % sectorLength;

      let y = 185;

      switch (sectorId % 6) {
        case 0: // Curved valleys & wave launchers
          y += Math.sin(localX * 0.007) * 45;
          break;
        case 1: // Big launch ramp + high drop gap
          if (localX < 350) {
            y += (localX / 350) * -75; // ramp curve going up
          } else if (localX < 450) {
            // Plateau void jump point
            y += -75 - Math.sin((localX - 350) * 0.03) * 12;
          } else {
            // Deep drop gap receiver slope landing
            const t = (localX - 450) / 400;
            y += -80 + (t * 115);
          }
          break;
        case 2: // Hyper speed wavy hills
          y += Math.sin(localX * 0.02) * 22 + Math.cos(localX * 0.006) * 35;
          break;
        case 3: // Canyon jump void pit!
          if (localX < 260) {
            y += (localX / 260) * -95; // Extreme launcher ramp
          } else if (localX >= 260 && localX < 560) {
            y += 200; // Deep drop death slope block (must bypass using air flip velocities!)
          } else {
            // High speed drop collector
            const factor = (localX - 560) / 290;
            y += 90 - (factor * 30);
          }
          break;
        case 4: // Stepped cascade waves
          y += Math.sin(localX * 0.015) * 48 - Math.sin(localX * 0.005) * 15;
          break;
        case 5: // Gigantic loop launch launcher drop
          if (localX < 400) {
            y += Math.sin((localX / 400) * Math.PI) * -120;
          } else {
            y += -20 + Math.sin(((localX - 400) / 450) * Math.PI) * 90;
          }
          break;
      }

      // Safeguard limits to prevent running completely off canvas scope
      return Math.max(70, Math.min(265, y));
    },

    startGame() {
      this.hasStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.distance = 0;
      this.store.updateSessionScore(0);
      this.crashReason = "";
      
      // Load Ruby Coins
      this.coins = Number(localStorage.getItem("game_rider_coins")) || 150;

      // Reset physics
      this.bike = {
        x: 60,
        y: 110,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
      };

      // Reset air variables
      this.wasInAir = false;
      this.startingAirAngle = 0;
      this.lastAirAngle = 0;
      this.accumulatedRotation = 0;
      this.currentFlipsInJump = 0;
      this.activeMultiplier = 1;

      // Clear arrays
      this.particlesList = [];
      this.floatingTextsList = [];
      this.wheelTrailsList = [];

      // Procedurally scatter neon crystalline diamonds (Gems) ahead
      this.generateGems();

      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.frameIdx = 0;
      this.tick();
      playSound.levelUp();
    },

    generateGems() {
      this.gemsList = [];
      // Pop crystals beautifully along heightmap curves
      for (let tx = 220; tx < 100000; tx += 95) {
        const hY = this.getTerrainY(tx);
        
        // Skip spawning in deep pits/gaps to prevent impossible collecting
        const isGap = (tx % 850 >= 260 && tx % 850 < 480 && Math.floor(tx / 850) % 6 === 3);
        if (!isGap) {
          this.gemsList.push({
            x: tx,
            y: hY - 24 - Math.abs(Math.sin(tx * 0.01) * 20), // elegant wave floating placements
            collected: false,
            pulseOffset: Math.random() * 10
          });
        }
      }
    },

    tick() {
      if (this.gameOver) return;

      this.frameIdx++;
      this.updatePhysics();
      this.draw();

      this.animationFrameId = requestAnimationFrame(this.tick);
    },

    normalizeAngle(a) {
      while (a < -Math.PI) a += Math.PI * 2;
      while (a > Math.PI) a -= Math.PI * 2;
      return a;
    },

    spawnFloatingText(x, y, text, color = "#00f0ff") {
      this.floatingTextsList.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 45, // frames remaining
      });
    },

    spawnImpactParticles(x, y, color = "#ff007f", count = 15) {
      for (let idx = 0; idx < count; idx++) {
        const phi = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 4.5;
        this.particlesList.push({
          x: x,
          y: y,
          vx: Math.cos(phi) * speed,
          vy: Math.sin(phi) * speed - 1.2,
          color: color,
          size: 1.5 + Math.random() * 3,
          life: 30 + Math.floor(Math.random() * 20),
        });
      }
    },

    updatePhysics() {
      const gBike = this.equippedBike;

      // 1. Gravity and general physical friction
      const gravityForce = 0.17; 
      this.bike.vy += gravityForce;

      const cosAngle = Math.cos(this.bike.angle);
      const sinAngle = Math.sin(this.bike.angle);

      // Determine wheel positions based on vehicle chassis geometry
      const wheelRadius = 8;
      const bOffset = -14;
      const fOffset = 14;

      const backX = this.bike.x + bOffset * cosAngle - 3 * sinAngle;
      const backY = this.bike.y + bOffset * sinAngle + 3 * cosAngle;

      const frontX = this.bike.x + fOffset * cosAngle - 3 * sinAngle;
      const frontY = this.bike.y + fOffset * sinAngle + 3 * cosAngle;

      const terrBackY = this.getTerrainY(backX);
      const terrFrontY = this.getTerrainY(frontX);

      const backOnGround = backY >= terrBackY - wheelRadius;
      const frontOnGround = frontY >= terrFrontY - wheelRadius;
      const eitherOnGround = backOnGround || frontOnGround;

      // 2. Tap Hold acceleration / In-Air Flip Spin rotation
      if (this.isPressed) {
        if (eitherOnGround) {
          // Drive Forward momentum following current angle chassis configuration
          const speedMultiplier = 0.22 * gBike.spinRate; // acceleration scale
          this.bike.vx += cosAngle * speedMultiplier;
          this.bike.vy += sinAngle * speedMultiplier;

          // Limit max velocity
          const curSpeed = Math.sqrt(this.bike.vx * this.bike.vx + this.bike.vy * this.bike.vy);
          if (curSpeed > 8.0) {
            this.bike.vx = (this.bike.vx / curSpeed) * 8.0;
            this.bike.vy = (this.bike.vy / curSpeed) * 8.0;
          }

          // Emit beautiful neon drive sparks behind wheels
          if (this.frameIdx % 4 === 0) {
            this.spawnImpactParticles(backX, backY, gBike.color, 2);
          }
        } else {
          // SPIN ROTATION IN MID-AIR (Always Clockwise around central mass strictly!)
          const airSpinTorque = 0.082 * (this.equippedBike.spinRate || 1.0);
          this.bike.angularVelocity = airSpinTorque;
        }
      } else {
        if (!eitherOnGround) {
          // If you release the tap, quickly reduce rotation to allow fine-tuning alignments before touchdown
          this.bike.angularVelocity *= 0.85;
        }
      }

      // Air resistance decays
      this.bike.vx *= 0.993;
      this.bike.vy *= 0.993;

      // Apply coordinates changes
      this.bike.x += this.bike.vx;
      this.bike.y += this.bike.vy;
      this.bike.angle = this.normalizeAngle(this.bike.angle + this.bike.angularVelocity);

      // 3. Wheel Ground Suspension Spring solver
      let contactThisFrame = false;

      if (backY >= terrBackY - wheelRadius) {
        contactThisFrame = true;
        const gap = backY - (terrBackY - wheelRadius);
        this.bike.y -= gap * 0.45;
        this.bike.vy -= gap * 0.12;
      }
      if (frontY >= terrFrontY - wheelRadius) {
        contactThisFrame = true;
        const gap = frontY - (terrFrontY - wheelRadius);
        this.bike.y -= gap * 0.45;
        this.bike.vy -= gap * 0.12;
      }

      // 4. Alignment / Hugging road math
      if (backOnGround && frontOnGround) {
        const roadSlope = Math.atan2(terrFrontY - terrBackY, frontX - backX);
        // Smoothly blend chassis orientation to perfectly match current landscape
        this.bike.angle = this.normalizeAngle(this.bike.angle * 0.6 + roadSlope * 0.4);
        this.bike.angularVelocity = 0;
      } else if (backOnGround) {
        const roadSlope = Math.atan2(terrFrontY - terrBackY, frontX - backX);
        this.bike.angle = this.normalizeAngle(this.bike.angle * 0.82 + roadSlope * 0.18);
      }

      // Trace glowing trails left by rolling tires
      if (backOnGround && this.frameIdx % 2 === 0) {
        this.wheelTrailsList.push({ x: backX, y: backY, color: gBike.color, life: 30 });
      }
      if (frontOnGround && this.frameIdx % 2 === 0) {
        this.wheelTrailsList.push({ x: frontX, y: frontY, color: gBike.color, life: 30 });
      }

      // 5. Flip Count Calculation Engine inside Jump
      if (!eitherOnGround) {
        if (!this.wasInAir) {
          this.wasInAir = true;
          this.startingAirAngle = this.bike.angle;
          this.lastAirAngle = this.bike.angle;
          this.accumulatedRotation = 0;
          this.currentFlipsInJump = 0;
        }

        // Accrued radians sweep calculation
        let diff = this.bike.angle - this.lastAirAngle;
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (diff > Math.PI) diff -= Math.PI * 2;

        this.accumulatedRotation += diff;
        this.lastAirAngle = this.bike.angle;

        // Triggers flip score increments for every full 360-deg sweep completed
        const flipCountCurrent = Math.floor(Math.abs(this.accumulatedRotation) / (2 * Math.PI));
        if (flipCountCurrent > this.currentFlipsInJump) {
          this.currentFlipsInJump = flipCountCurrent;
          const flipPoints = 500 * flipCountCurrent * this.activeMultiplier;
          this.score += flipPoints;
          this.coins += 5 * flipCountCurrent; // give rubies!
          localStorage.setItem("game_rider_coins", this.coins);
          
          playSound.levelUp(); // High pitch reward synth
          this.spawnFloatingText(this.bike.x, this.bike.y - 30, `ФЛИП ${360 * flipCountCurrent}°! +${flipPoints} ⚡`, "#39ff14");
          
          // Flash neon rings around bike
          this.spawnImpactParticles(this.bike.x, this.bike.y, "#39ff14", 6);
        }
      }

      // Check landing event evaluations
      if (eitherOnGround && this.wasInAir) {
        this.wasInAir = false;

        const terrainSlope = Math.atan2(terrFrontY - terrBackY, frontX - backX);
        const landingMismatch = Math.abs(this.normalizeAngle(this.bike.angle - terrainSlope));

        if (landingMismatch > 1.15) { // landing vertically/upside-down (severe) -> Crash!
          this.endGame("Неудачное приземление / Переворот!");
          return;
        } else {
          // Smooth stable landing!
          if (landingMismatch < 0.22) { // Extremely flat landing! (< 12 degrees)
            this.activeMultiplier = Math.min(5, this.activeMultiplier + 1);
            const perfectBonus = 1000 * this.activeMultiplier;
            this.score += perfectBonus;
            
            playSound.score(); // ding chords cascade
            this.spawnFloatingText(this.bike.x, this.bike.y - 32, `ИДЕАЛЬНО! X${this.activeMultiplier} +${perfectBonus} ✨`, "#00f0ff");
            this.spawnImpactParticles(this.bike.x, this.bike.y, "#00f0ff", 14);
          } else {
            // Normal landing
            const regularBonus = 200 * this.activeMultiplier;
            this.score += regularBonus;
            this.activeMultiplier = 1; // reset mult
            playSound.tick();
            this.spawnFloatingText(this.bike.x, this.bike.y - 26, `ОТЛИЧНО! +${regularBonus}`, "#ff9f00");
            this.spawnImpactParticles(this.bike.x, this.bike.y, "#ff9f00", 6);
          }
        }

        this.accumulatedRotation = 0;
        this.currentFlipsInJump = 0;
      }

      // 6. Crash Checker constraints:
      // A. Helmet Head collision:
      const headX = this.bike.x - 12 * sinAngle;
      const headY = this.bike.y - 12 * cosAngle;
      const terrHeadY = this.getTerrainY(headX);
      if (headY >= terrHeadY - 2) {
        this.endGame("Удар шлемом о землю!");
        return;
      }

      // B. Void Death:
      if (this.bike.y > 285) {
        this.endGame("Падение в бездну!");
        return;
      }

      // 7. Core Distance meter calculation
      const currentLocMeters = this.bike.x / 11;
      if (currentLocMeters > this.distance) {
        this.distance = currentLocMeters;
        this.store.updateSessionScore(Math.floor(this.score));

        if (this.distance > this.highscore) {
          this.highscore = Math.floor(this.distance);
          localStorage.setItem("game_hillclimb_highscore", this.highscore);
        }
      }

      // 8. Gem collector interaction checking
      this.gemsList.forEach(gem => {
        if (!gem.collected && Math.abs(this.bike.x - gem.x) < 22 && Math.abs(this.bike.y - gem.y) < 25) {
          gem.collected = true;
          this.coins += 2; // user earns gems!
          localStorage.setItem("game_rider_coins", this.coins);
          
          this.score += 300 * this.activeMultiplier;
          playSound.score(); // shiny arpeggio synthesizer
          
          // Emit magenta visual glow blasts
          this.spawnImpactParticles(gem.x, gem.y, "#00f0ff", 8);
          this.spawnFloatingText(gem.x, gem.y - 10, `+300`, "#e0f2fe");
        }
      });
    },

    draw() {
      const canvas = this.$refs.physicsCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // 1. Futuristic Sky Canvas Back
      ctx.fillStyle = "#040209";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera focal point tracking
      const cameraX = this.bike.x - 140;

      // Draw cyber vertical neon grids which shift slowly with parallax
      ctx.strokeStyle = "rgba(79, 70, 229, 0.04)";
      ctx.lineWidth = 1;
      const startGridX = Math.floor(cameraX * 0.15) % 40;
      for (let gridX = -startGridX; gridX <= canvas.width + 40; gridX += 40) {
        ctx.beginPath();
        ctx.moveTo(gridX, 0);
        ctx.lineTo(gridX, canvas.height);
        ctx.stroke();
      }
      for (let gridY = 0; gridY <= canvas.height; gridY += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gridY);
        ctx.lineTo(canvas.width, gridY);
        ctx.stroke();
      }

      // Save global state for camera
      ctx.save();
      ctx.translate(-cameraX, 0);

      const viewLeft = cameraX - 50;
      const viewRight = cameraX + canvas.width + 50;

      // 2. Draw Wheel Ground slide trails fading smoothly
      this.wheelTrailsList.forEach((trail, idx) => {
        trail.life--;
        if (trail.life > 0) {
          ctx.strokeStyle = trail.color;
          ctx.lineWidth = 2.5 * (trail.life / 30);
          ctx.beginPath();
          ctx.arc(trail.x, trail.y, 0.6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      this.wheelTrailsList = this.wheelTrailsList.filter(t => t.life > 0);

      // 3. Dynamic Colorful Neon Tracks
      // Track color shifts gracefully every 1000m based on bike position
      const colorProgress = Math.floor(this.bike.x / 1100);
      const palette = ["#ff007f", "#00f0ff", "#39ff14", "#ff9f00", "#7f00ff"];
      const activeNeonColor = palette[colorProgress % palette.length];

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = activeNeonColor;
      ctx.strokeStyle = activeNeonColor;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      let hasBegun = false;
      for (let ptX = Math.max(0, viewLeft); ptX <= viewRight; ptX += 8) {
        const ptY = this.getTerrainY(ptX);
        if (!hasBegun) {
          ctx.moveTo(ptX, ptY);
          hasBegun = true;
        } else {
          ctx.lineTo(ptX, ptY);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Draw aesthetic vertical support beams holding the neon track
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1.5;
      const beamInterval = 70;
      const startBeam = Math.floor(viewLeft / beamInterval) * beamInterval;
      for (let beamX = startBeam; beamX <= viewRight; beamX += beamInterval) {
        if (beamX > 0) {
          const beamY = this.getTerrainY(beamX);
          ctx.beginPath();
          ctx.moveTo(beamX, beamY + 4);
          ctx.lineTo(beamX, canvas.height + 40);
          ctx.stroke();
        }
      }

      // 4. Emerald Crystal Ruby Gems Drawing
      this.gemsList.forEach((gem) => {
        if (!gem.collected && gem.x > viewLeft && gem.x < viewRight) {
          // Floating wave animations
          const floatOffset = Math.sin((this.frameIdx + gem.pulseOffset) * 0.08) * 3.5;
          const displayY = gem.y + floatOffset;

          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#ff007f";
          ctx.strokeStyle = "#ff007f";
          ctx.fillStyle = "rgba(255, 0, 127, 0.35)";
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(gem.x, displayY - 6);
          ctx.lineTo(gem.x + 4.5, displayY);
          ctx.lineTo(gem.x, displayY + 6);
          ctx.lineTo(gem.x - 4.5, displayY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });

      // 5. Particles Update and Drawing
      this.particlesList.forEach(p => {
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // mild float gravity for dots
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.size * (p.life / 40)), 0, Math.PI * 2);
        ctx.fill();
      });
      this.particlesList = this.particlesList.filter(p => p.life > 0);

      // 6. Draw Cyber Bike (The Motorcycle)
      ctx.save();
      ctx.translate(this.bike.x, this.bike.y);
      ctx.rotate(this.bike.angle);

      const curColor = this.equippedBike.color;

      // Draw glowing futuristic cyber vehicle body
      ctx.shadowBlur = 10;
      ctx.shadowColor = curColor;

      // Chassis metallic futuristic connector outline
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-11, 2);
      ctx.lineTo(11, 2);
      ctx.stroke();

      // Cyber casing neon shell cover
      ctx.fillStyle = curColor;
      ctx.beginPath();
      ctx.moveTo(-10, -1);
      ctx.lineTo(8, -1);
      ctx.lineTo(4, -8);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();

      // Glowing dashboard indicator laser dot
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(2, -6, 2, 0, Math.PI * 2);
      ctx.fill();

      // Driver glowing orb helmet
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(-2, -15, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Visor cyberpunk slash color
      ctx.strokeStyle = "#040209";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-1, -16);
      ctx.lineTo(2, -14);
      ctx.stroke();

      // Metallic wheels suspensions bars
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-14, 4);
      ctx.moveTo(2, 0);
      ctx.lineTo(14, 4);
      ctx.stroke();

      // Rear rolling Neon Wheel
      ctx.save();
      ctx.translate(-14, 4);
      // Outer tire rim
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#090615";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Internal custom neon hub
      ctx.strokeStyle = curColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 4.0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Front rolling Wheel
      ctx.save();
      ctx.translate(14, 4);
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#090615";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Internal neon hub
      ctx.strokeStyle = curColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 4.0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.restore(); // Restore local coordinate translation

      // 7. Render dynamic popups of floating texts
      this.floatingTextsList.forEach(ft => {
        ft.life--;
        ft.y -= 0.65; // slide upwards floaty
        ctx.font = "black 9px sans-serif";
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = ft.color;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
      });
      this.floatingTextsList = this.floatingTextsList.filter(f => f.life > 0);

      ctx.restore(); // Restore main translating camera matrix
    },

    endGame(reason) {
      this.gameOver = true;
      this.crashReason = reason || "Авария!";
      this.isPressed = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      playSound.gameOver();

      // Update and save personal records
      if (this.score > Number(localStorage.getItem("game_rider_highscore_total") || 0)) {
        localStorage.setItem("game_rider_highscore_total", this.score);
      }
    },

    handleKeyDown(event) {
      if (!this.hasStarted || this.gameOver) return;
      if (event.code === "Space" || event.code === "ArrowRight" || event.code === "KeyD" || event.code === "ArrowUp" || event.code === "KeyW") {
        this.isPressed = true;
        this.isFirstLaunchTip = false;
      }
    },
    handleKeyUp(event) {
      if (event.code === "Space" || event.code === "ArrowRight" || event.code === "KeyD" || event.code === "ArrowUp" || event.code === "KeyW") {
        this.isPressed = false;
      }
    }
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
</style>
