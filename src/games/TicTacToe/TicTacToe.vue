<template>
  <div class="flex flex-col items-center justify-between h-full bg-slate-950 text-white p-3 select-none">
    <!-- Compact Game Header -->
    <div class="w-full space-y-2 shrink-0">
      <!-- Mode Toggle Switch -->
      <div class="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
        <button
          type="button"
          @click="selectMode('AI')"
          class="flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer border-none"
          :class="gameMode === 'AI' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-slate-450 hover:text-white'"
        >
          <i class="bi bi-cpu text-xs mr-0.5"></i> С Ботом
        </button>
        <button
          type="button"
          @click="selectMode('PVP')"
          class="flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer border-none"
          :class="gameMode === 'PVP' ? 'bg-indigo-600 text-white shadow' : 'bg-transparent text-slate-450 hover:text-white'"
        >
          <i class="bi bi-people text-xs mr-0.5"></i> 2 Игрока
        </button>
      </div>

      <!-- Compact Scoreboard / Status row -->
      <div class="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800/80 rounded-xl p-2 items-center">
        <div class="text-center">
          <span class="block text-[7px] font-black text-rose-500 uppercase tracking-widest leading-none">Крестики (X)</span>
          <span class="text-sm font-extrabold font-mono text-rose-450 leading-none">{{ scores.X }}</span>
        </div>
        <div class="text-center flex flex-col items-center justify-center border-x border-slate-800/50">
          <span
            v-if="!winner && !isCat"
            class="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none"
            :class="currentPlayer === 'X' ? 'text-rose-400' : 'text-cyan-400'"
          >
            ход {{ currentPlayer }}
          </span>
          <span v-else class="text-[8px] font-bold text-slate-500 uppercase leading-none">Конец</span>
        </div>
        <div class="text-center">
          <span class="block text-[7px] font-black text-cyan-500 uppercase tracking-widest leading-none">Нолики (O)</span>
          <span class="text-sm font-extrabold font-mono text-cyan-455 leading-none">{{ scores.O }}</span>
        </div>
      </div>
    </div>

    <!-- Active 3x3 Play Grid with Expanded Space -->
    <div class="flex-grow w-full max-w-[320px] flex items-center justify-center my-2 select-none">
      <div class="w-full aspect-square grid grid-cols-3 grid-rows-3 gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 relative shadow-inner">
        <button
          v-for="(cell, idx) in board"
          :key="idx"
          @click="makeMove(idx)"
          type="button"
          class="bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center transition-all duration-150 outline-none cursor-pointer hover:border-slate-700 relative"
          :class="{
            'scale-95': cell !== '',
            'pointer-events-none': cell !== '' || winner || isCat || isAiThinking,
            'ring-1 ring-rose-500/10': cell === 'X',
            'ring-1 ring-cyan-500/10': cell === 'O',
            'opacity-30': winnerCombination && !winnerCombination.includes(idx)
          }"
        >
          <!-- Custom sized sleek vector icons -->
          <svg
            v-if="cell === 'X'"
            class="w-1/2 h-1/2 text-rose-500 stroke-rose-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" class="animate-draw-x1"></line>
            <line x1="6" y1="6" x2="18" y2="18" class="animate-draw-x2"></line>
          </svg>

          <svg
            v-else-if="cell === 'O'"
            class="w-1/2 h-1/2 text-cyan-450 stroke-cyan-450 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="9" class="animate-draw-o"></circle>
          </svg>
        </button>

        <!-- Overlay on Win or Tie -->
        <div
          v-if="winner || isCat"
          class="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 text-center animate-fade-in z-20"
        >
          <template v-if="winner">
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center mb-2.5 text-lg border"
              :class="winner === 'X' ? 'bg-rose-500/10 text-rose-550 border-rose-500/20' : 'bg-cyan-500/10 text-cyan-450 border-cyan-500/20'"
            >
              <i v-if="winner === 'X'" class="bi bi-x-lg font-black"></i>
              <i v-else class="bi bi-circle font-black"></i>
            </div>
            <h2 class="text-sm font-black text-white mb-0.5 tracking-wide uppercase">
              Победа!
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 font-semibold">
              <span :class="winner === 'X' ? 'text-rose-400' : 'text-cyan-400'">"{{ winner }}"</span> забрал раунд
            </p>
          </template>

          <template v-else-if="isCat">
            <div class="w-11 h-11 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-2.5 text-slate-400">
              <i class="bi bi-hand-thumbs-up"></i>
            </div>
            <h2 class="text-sm font-black text-white mb-0.5 uppercase">
              Ничья!
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 font-semibold">
              Равный бой!
            </p>
          </template>

          <button
            @click="resetBoard"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] transition border-none shadow-md cursor-pointer active:scale-95"
          >
            Второй раунд!
          </button>
        </div>
      </div>
    </div>

    <!-- Actions footer buttons -->
    <div class="w-full shrink-0 flex gap-2 select-none">
      <button
        @click="clearScores"
        type="button"
        class="flex-grow py-2 border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase cursor-pointer transition flex items-center justify-center gap-1"
      >
        <i class="bi bi-eraser text-xs text-rose-400"></i> Сброс счета
      </button>

      <button
        @click="resetBoard"
        v-if="!winner && !isCat"
        type="button"
        class="flex-grow py-2 border border-emerald-500/20 bg-emerald-500/10 text-emerald-450 hover:text-white rounded-xl text-[10px] font-black uppercase cursor-pointer transition flex items-center justify-center gap-1"
      >
        <i class="bi bi-arrow-counterclockwise text-xs"></i> Заново
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
      gameMode: "AI", // 'AI' vs 'PVP'
      board: Array(9).fill(""),
      currentPlayer: "X",
      winner: null,
      winnerCombination: null,
      isCat: false,
      isAiThinking: false,
      scores: {
        X: Number(localStorage.getItem("game_tictactoe_scores_x")) || 0,
        O: Number(localStorage.getItem("game_tictactoe_scores_o")) || 0,
      },
      winningCombos: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
      ]
    };
  },
  computed: {
    store() {
      return useMainStore();
    }
  },
  methods: {
    selectMode(mode) {
      if (this.gameMode === mode) return;
      this.gameMode = mode;
      this.resetBoard();
      this.clearScores();
      playSound.rotate();
    },
    makeMove(idx) {
      if (this.board[idx] !== "" || this.winner || this.isCat || this.isAiThinking) return;

      this.board[idx] = this.currentPlayer;
      playSound.tick();
      this.checkState();

      if (!this.winner && !this.isCat) {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        
        if (this.gameMode === "AI" && this.currentPlayer === "O") {
          this.triggerAiMove();
        }
      }
    },
    triggerAiMove() {
      this.isAiThinking = true;
      setTimeout(() => {
        const bestMove = this.getBestMove();
        if (bestMove !== null && bestMove !== undefined) {
          this.board[bestMove] = "O";
          playSound.tick();
          this.checkState();
          if (!this.winner && !this.isCat) {
            this.currentPlayer = "X";
          }
        }
        this.isAiThinking = false;
      }, 400); 
    },
    getBestMove() {
      // 1. Win if possible
      for (let combo of this.winningCombos) {
        let countO = 0;
        let emptyIdx = -1;
        for (let idx of combo) {
          if (this.board[idx] === "O") countO++;
          else if (this.board[idx] === "") emptyIdx = idx;
        }
        if (countO === 2 && emptyIdx !== -1) return emptyIdx;
      }

      // 2. Block opponent
      for (let combo of this.winningCombos) {
        let countX = 0;
        let emptyIdx = -1;
        for (let idx of combo) {
          if (this.board[idx] === "X") countX++;
          else if (this.board[idx] === "") emptyIdx = idx;
        }
        if (countX === 2 && emptyIdx !== -1) return emptyIdx;
      }

      // 3. Take Center
      if (this.board[4] === "") return 4;

      // 4. Take corners
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(idx => this.board[idx] === "");
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }

      // 5. Take any empty
      const emptySectors = [];
      this.board.forEach((val, idx) => {
        if (val === "") emptySectors.push(idx);
      });
      if (emptySectors.length > 0) {
        return emptySectors[Math.floor(Math.random() * emptySectors.length)];
      }

      return null;
    },
    checkState() {
      for (let combo of this.winningCombos) {
        const [a, b, c] = combo;
        if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
          this.winner = this.board[a];
          this.winnerCombination = combo;
          this.scores[this.winner]++;
          this.persistScores();
          playSound.levelUp(); // high pitch round win chimes
          return;
        }
      }

      if (this.board.every(cell => cell !== "")) {
        this.isCat = true;
        playSound.score(); // draw sound
      }
    },
    resetBoard() {
      this.board = Array(9).fill("");
      this.currentPlayer = "X";
      this.winner = null;
      this.winnerCombination = null;
      this.isCat = false;
      this.isAiThinking = false;
      playSound.rotate();
    },
    clearScores() {
      this.scores.X = 0;
      this.scores.O = 0;
      this.persistScores();
      playSound.gameOver();
    },
    persistScores() {
      localStorage.setItem("game_tictactoe_scores_x", this.scores.X);
      localStorage.setItem("game_tictactoe_scores_o", this.scores.O);
      this.store.updateSessionScore(this.scores.X);
    }
  }
};
</script>

<style scoped>
.animate-draw-x1 {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawLine 0.16s forwards ease-out;
}
.animate-draw-x2 {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawLine 0.16s forwards ease-out 0.1s;
}
.animate-draw-o {
  stroke-dasharray: 58;
  stroke-dashoffset: 58;
  animation: drawLine 0.24s forwards ease-in-out;
}
@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
