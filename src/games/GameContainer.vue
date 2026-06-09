<template>
  <div
    v-if="store.showGamesLobby"
    class="fixed inset-0 bg-slate-950 z-[99999] flex flex-col font-sans text-white select-none overflow-hidden animate-fade-in"
  >
    <!-- Top Stats Panel Bar (Cross-saving on cookie, cache, LocalStorage) -->
    <header class="w-full bg-slate-900 border-b border-slate-800 px-3 py-2 shrink-0 flex items-center justify-between shadow-lg">
      <!-- Top Left: Arrow Back Action - compact icon only -->
      <div class="flex items-center gap-2">
        <button
          @click="goBack"
          class="h-9 w-9 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl flex items-center justify-center transition-all font-bold border-none cursor-pointer"
          id="btn-game-container-back"
          title="Назад"
        >
          <i class="bi bi-arrow-left text-lg font-black animate-pulse"></i>
        </button>
        
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Развлечения</span>
          <h1 class="text-xs font-semibold text-slate-200 m-0 leading-none">Игры ERP</h1>
        </div>
      </div>

      <!-- Top Right: Play Info Card (Profile, Who plays, Time) - very compact -->
      <div class="bg-slate-950/60 border border-indigo-500/15 rounded-xl px-2 py-1 flex items-center gap-2 shadow-inner">
        <div class="text-right flex flex-col justify-center leading-none">
          <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Профиль</span>
          <span class="text-[9px] font-extrabold text-slate-300">@{{ user?.Username || 'Гость' }}</span>
        </div>
        <div class="w-px h-5 bg-slate-800"></div>
        <div class="text-right flex flex-col justify-center leading-none">
          <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Играет</span>
          <span class="text-[9px] font-extrabold text-indigo-400 truncate max-w-[80px]">{{ user?.Name || 'Аноним' }}</span>
        </div>
        <div class="w-px h-5 bg-slate-800"></div>
        <div class="text-center bg-slate-900/50 px-1.5 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1 min-w-[55px]">
          <i class="bi bi-clock-history text-cyan-400 text-[10px] animate-spin" style="animation-duration: 4s;"></i>
          <span class="text-[10px] font-extrabold font-mono text-cyan-400 leading-none">
            {{ formattedPlaytime }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="flex-grow w-full overflow-y-auto relative flex flex-col items-center p-3">
      <!-- 1. Games Directory Selector Lobby grid - compact layout -->
      <div v-if="!store.activeGameId" class="w-full max-w-4xl py-2 sm:py-4 animate-fade-in">
        <div class="text-center mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-black tracking-tight text-white m-0 font-heading">
            Игротека ERP
          </h2>
          <p class="text-[10px] sm:text-xs text-slate-400 max-w-md mx-auto mt-1 leading-snug">
            Отвлекитесь от работы за кассой и клиентами! Реактивный досуг в единой космической стилистике.
          </p>
        </div>

        <!-- Tabs for Lobby Mode -->
        <div class="flex items-center justify-center gap-2 mb-4 bg-slate-900/50 p-1 rounded-xl border border-slate-800/80 max-w-[340px] mx-auto select-none shrink-0">
          <button
            @click="activeTab = 'games'"
            class="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
            :class="activeTab === 'games' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' : 'text-slate-400 hover:text-white bg-transparent'"
          >
            <i class="bi bi-controller"></i> Каталог игр
          </button>
          <button
            @click="activeTab = 'leaderboards'"
            class="flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
            :class="activeTab === 'leaderboards' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' : 'text-slate-400 hover:text-white bg-transparent'"
          >
            <i class="bi bi-trophy-fill text-amber-500"></i> Рекорды
          </button>
        </div>

        <div v-if="activeTab === 'games'" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 px-1.5">
          <!-- Game 1: Tetris -->
          <div
            @click="selectGame('tetris')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-indigo-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-indigo-600/5 rounded-full filter blur-md group-hover:bg-indigo-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-indigo-600/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-grid-3x3-gap-fill"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-indigo-400 transition m-0">Тетрис</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('tetris').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('tetris').record }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Соло</span>
              <span class="group-hover:text-indigo-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- Game 2: Tic Tac Toe -->
          <div
            @click="selectGame('tictactoe')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-rose-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-rose-600/5 rounded-full filter blur-md group-hover:bg-rose-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-rose-600/10 border border-rose-500/20 rounded-lg flex items-center justify-center text-rose-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-grid-3x3"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-rose-400 transition m-0">Крестики</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('tictactoe').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('tictactoe').record }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Дуэль</span>
              <span class="group-hover:text-rose-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- Game 3: Snake -->
          <div
            @click="selectGame('snake')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-emerald-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-emerald-600/5 rounded-full filter blur-md group-hover:bg-emerald-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-emerald-600/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-activity animate-pulse"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-emerald-400 transition m-0">Змейка</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('snake').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('snake').record }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Аркада</span>
              <span class="group-hover:text-emerald-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- Game 4: Hill Climb Motor -->
          <div
            @click="selectGame('hillclimb')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-teal-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-teal-600/5 rounded-full filter blur-md group-hover:bg-teal-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-teal-600/10 border border-teal-500/20 rounded-lg flex items-center justify-center text-teal-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-bicycle"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-teal-400 transition m-0">Мотоциклист</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('hillclimb').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('hillclimb').record }}м</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Физика</span>
              <span class="group-hover:text-teal-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- NEW Game 5: 2048 -->
          <div
            @click="selectGame('game2048')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-amber-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-amber-600/5 rounded-full filter blur-md group-hover:bg-amber-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-amber-600/10 border border-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-plus-square-fill"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-amber-400 transition m-0">2048</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('game2048').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('game2048').record }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Числа</span>
              <span class="group-hover:text-amber-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- NEW Game 6: Block Blast -->
          <div
            @click="selectGame('blockblast')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-orange-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-orange-600/5 rounded-full filter blur-md group-hover:bg-orange-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-orange-600/10 border border-orange-500/20 rounded-lg flex items-center justify-center text-orange-450 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <span class="material-symbols-outlined text-[16px] text-orange-400 leading-none">local_fire_department</span>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-orange-400 transition m-0">Block Blast</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('blockblast').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('blockblast').record }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Интеллект</span>
              <span class="group-hover:text-orange-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>

          <!-- NEW Game 7: Flappy Bird -->
          <div
            @click="selectGame('flappybird')"
            class="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-violet-600/30 rounded-2xl p-3 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-[125px] sm:h-[145px] shadow-lg relative overflow-hidden"
          >
            <div class="absolute -right-3 -top-3 w-10 h-10 bg-violet-600/5 rounded-full filter blur-md group-hover:bg-violet-600/10 transition"></div>
            <div>
              <div class="w-7 h-7 bg-violet-600/10 border border-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm mb-1.5 group-hover:scale-110 transition shrink-0">
                <i class="bi bi-rocket-takeoff-fill animate-pulse"></i>
              </div>
              <h3 class="text-xs font-black tracking-tight text-slate-100 group-hover:text-violet-400 transition m-0">Космолёт</h3>
              
              <!-- Personal Stats Badge on Card -->
              <div class="flex items-center gap-1.5 mt-1 text-[8px] font-black text-slate-400 font-mono">
                <span class="flex items-center gap-0.5" title="Время игры"><i class="bi bi-clock text-cyan-400"></i> {{ formatGamePlayTime(getGameStats('flappybird').playTime) }}</span>
                <span class="text-slate-700">•</span>
                <span class="flex items-center gap-0.5" title="Рекорд"><i class="bi bi-award text-amber-500"></i> {{ getGameStats('flappybird').record }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-[8px] uppercase font-black tracking-widest text-slate-500 mt-2">
              <span>Реакция</span>
              <span class="group-hover:text-violet-400 transition flex items-center gap-0.5">Играть <i class="bi bi-play-fill leading-none"></i></span>
            </div>
          </div>
        </div>

        <!-- Tab 2: Dynamic Leaderboards Dashboard -->
        <div v-else-if="activeTab === 'leaderboards'" class="w-full max-w-2xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 shadow-xl animate-fade-in text-left select-none">
          <!-- Leaderboard subtabs -->
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button
                @click="selectedLeaderboardTab = 'points'"
                class="py-1 px-3.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer border-none flex items-center gap-1"
                :class="selectedLeaderboardTab === 'points' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              >
                <i class="bi bi-star-fill text-yellow-500"></i> Сумма очков
              </button>
              <button
                @click="selectedLeaderboardTab = 'playtime'"
                class="py-1 px-3.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer border-none flex items-center gap-1"
                :class="selectedLeaderboardTab === 'playtime' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              >
                <i class="bi bi-hourglass-split text-cyan-400 animate-pulse"></i> По времени
              </button>
              <button
                @click="selectedLeaderboardTab = 'game'"
                class="py-1 px-3.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer border-none flex items-center gap-1"
                :class="selectedLeaderboardTab === 'game' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'"
              >
                <i class="bi bi-joystick text-purple-400"></i> По играм
              </button>
            </div>
            
            <!-- Game selector (when 'game' subtab is selected) -->
            <div v-if="selectedLeaderboardTab === 'game'" class="flex items-center gap-1 shrink-0">
              <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Игра:</span>
              <select
                v-model="selectedLeaderboardGameId"
                class="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest cursor-pointer outline-none focus:border-indigo-505"
              >
                <option value="tetris">Тетрис</option>
                <option value="tictactoe">Крестики</option>
                <option value="snake">Змейка</option>
                <option value="hillclimb">Мотоциклист</option>
                <option value="game2048">2048</option>
                <option value="blockblast">Block Blast</option>
                <option value="flappybird">Космолёт</option>
              </select>
            </div>
          </div>

          <!-- Active Leaderboard lists rendering -->
          <div>
            <!-- Header for table list -->
            <div class="grid grid-cols-12 gap-2 text-[8px] font-black uppercase text-slate-500 tracking-wider pb-2 px-3 border-b border-slate-900/60 font-mono">
              <span class="col-span-2 text-center">Место</span>
              <span class="col-span-6">Игрок</span>
              <span class="col-span-4 text-right">Показатель</span>
            </div>

            <!-- List of rows -->
            <div class="divide-y divide-slate-900/40 max-h-[290px] overflow-y-auto pr-1">
              
              <!-- Tab 1: POINTS SUM -->
              <template v-if="selectedLeaderboardTab === 'points'">
                <div
                  v-for="(item, idx) in leaderboardByTotalPoints"
                  :key="idx"
                  class="grid grid-cols-12 gap-2 items-center py-2 px-3 hover:bg-slate-900/30 transition rounded-xl"
                  :class="String(item.UserID) === String(user?.ID) ? 'bg-indigo-900/25 border-l-2 border-indigo-500' : ''"
                >
                  <div class="col-span-2 flex items-center justify-center font-mono text-[10px] font-black">
                    <span v-if="idx === 0" class="text-amber-400 text-sm"><i class="bi bi-trophy-fill"></i></span>
                    <span v-else-if="idx === 1" class="text-slate-300 text-sm"><i class="bi bi-trophy-fill"></i></span>
                    <span v-else-if="idx === 2" class="text-yellow-600 text-sm"><i class="bi bi-trophy-fill"></i></span>
                    <span v-else class="text-slate-500">#{{ idx + 1 }}</span>
                  </div>
                  <div class="col-span-6 flex flex-col items-start leading-tight">
                    <span class="text-[10px] font-black text-slate-100 flex items-center gap-1 truncate max-w-full">
                      {{ item.Name }}
                      <span v-if="String(item.UserID) === String(user?.ID)" class="text-[7px] bg-indigo-600 px-1 py-0.5 rounded text-white font-extrabold uppercase leading-none">ВЫ</span>
                    </span>
                    <span class="text-[8px] font-bold text-slate-500">@{{ item.Username }}</span>
                  </div>
                  <div class="col-span-4 text-right font-mono text-[10px] font-extrabold text-emerald-400">
                    {{ item.TotalPoints }} очков
                  </div>
                </div>
                <div v-if="leaderboardByTotalPoints.length === 0" class="py-6 text-center text-slate-500 text-[10px] font-semibold leading-normal">
                  Нет записей для таблицы рекордов!
                </div>
              </template>

              <!-- Tab 2: PLAYTIME SUM -->
              <template v-if="selectedLeaderboardTab === 'playtime'">
                <div
                  v-for="(item, idx) in leaderboardByPlayTime"
                  :key="idx"
                  class="grid grid-cols-12 gap-2 items-center py-2 px-3 hover:bg-slate-900/30 transition rounded-xl"
                  :class="String(item.UserID) === String(user?.ID) ? 'bg-indigo-900/25 border-l-2 border-indigo-500' : ''"
                >
                  <div class="col-span-2 flex items-center justify-center font-mono text-[10px] font-black">
                    <span v-if="idx === 0" class="text-cyan-400 text-xs"><i class="bi bi-star-fill animate-pulse"></i></span>
                    <span v-else-if="idx === 1" class="text-slate-300 text-xs"><i class="bi bi-star-fill"></i></span>
                    <span v-else-if="idx === 2" class="text-yellow-600 text-xs"><i class="bi bi-star-fill"></i></span>
                    <span v-else class="text-slate-500">#{{ idx + 1 }}</span>
                  </div>
                  <div class="col-span-6 flex flex-col items-start leading-tight">
                    <span class="text-[10px] font-black text-slate-100 flex items-center gap-1 truncate max-w-full">
                      {{ item.Name }}
                      <span v-if="String(item.UserID) === String(user?.ID)" class="text-[7px] bg-indigo-600 px-1 py-0.5 rounded text-white font-extrabold uppercase leading-none">ВЫ</span>
                    </span>
                    <span class="text-[8px] font-bold text-slate-500">@{{ item.Username }}</span>
                  </div>
                  <div class="col-span-4 text-right font-mono text-[10px] font-extrabold text-cyan-400">
                    {{ formatGamePlayTime(item.PlayTime) }}
                  </div>
                </div>
                <div v-if="leaderboardByPlayTime.length === 0" class="py-6 text-center text-slate-500 text-[10px] font-semibold leading-normal">
                  Нет записей для таблицы рекордов по времени!
                </div>
              </template>

              <!-- Tab 3: SPECIFIC GAME LEADERBOARD -->
              <template v-if="selectedLeaderboardTab === 'game'">
                <div
                  v-for="(item, idx) in leaderboardForSelectedGame"
                  :key="idx"
                  class="grid grid-cols-12 gap-2 items-center py-2 px-3 hover:bg-slate-900/30 transition rounded-xl"
                  :class="String(item.UserID) === String(user?.ID) ? 'bg-indigo-900/25 border-l-2 border-indigo-500' : ''"
                >
                  <div class="col-span-2 flex items-center justify-center font-mono text-[10px] font-black">
                    <span v-if="idx === 0" class="text-yellow-400 text-[11px]"><i class="bi bi-gem"></i></span>
                    <span v-else-if="idx === 1" class="text-slate-300 text-[11px]"><i class="bi bi-gem"></i></span>
                    <span v-else-if="idx === 2" class="text-orange-400 text-[11px]"><i class="bi bi-gem"></i></span>
                    <span v-else class="text-slate-500">#{{ idx + 1 }}</span>
                  </div>
                  <div class="col-span-6 flex flex-col items-start leading-tight font-sans">
                    <span class="text-[10px] font-black text-slate-100 flex items-center gap-1 truncate max-w-full">
                      {{ item.Name }}
                      <span v-if="String(item.UserID) === String(user?.ID)" class="text-[7px] bg-indigo-600 px-1 py-0.5 rounded text-white font-extrabold uppercase leading-none">ВЫ</span>
                    </span>
                    <span class="text-[8px] font-bold text-slate-450">Бортовое время: {{ formatGamePlayTime(item.PlayTime) }}</span>
                  </div>
                  <div class="col-span-4 text-right font-mono text-[10px] font-extrabold text-amber-400">
                    {{ item.MaxScore }}{{ selectedLeaderboardGameId === 'hillclimb' ? 'м' : '' }}
                  </div>
                </div>
                <div v-if="leaderboardForSelectedGame.length === 0" class="py-6 text-center text-slate-500 text-[10px] font-semibold leading-normal">
                  Для выбранной игры рекордов пока нет!
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Active Game Container view -->
      <div v-else class="w-full max-w-lg h-full flex flex-col justify-between items-center relative animate-scale-up">
        <div class="w-full flex-grow relative bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <!-- Nested active games router -->
          <div class="flex-grow">
            <Tetris v-if="store.activeGameId === 'tetris'" />
            <TicTacToe v-else-if="store.activeGameId === 'tictactoe'" />
            <Snake v-else-if="store.activeGameId === 'snake'" />
            <HillClimb v-else-if="store.activeGameId === 'hillclimb'" />
            <Game2048 v-else-if="store.activeGameId === 'game2048'" />
            <BlockBlast v-else-if="store.activeGameId === 'blockblast'" />
            <FlappyBird v-else-if="store.activeGameId === 'flappybird'" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useMainStore } from "../store";
import Tetris from "./Tetris/Tetris.vue";
import TicTacToe from "./TicTacToe/TicTacToe.vue";
import Snake from "./Snake/Snake.vue";
import HillClimb from "./HillClimb/HillClimb.vue";
import Game2048 from "./Game2048/Game2048.vue";
import BlockBlast from "./BlockBlast/BlockBlast.vue";
import FlappyBird from "./FlappyBird/FlappyBird.vue";

export default {
  components: {
    Tetris,
    TicTacToe,
    Snake,
    HillClimb,
    Game2048,
    BlockBlast,
    FlappyBird
  },
  data() {
    return {
      playtimeSeconds: 0,
      timerInterval: null,
      activeTab: "games", // "games" or "leaderboards"
      selectedLeaderboardTab: "points", // "points", "playtime" or "game"
      selectedLeaderboardGameId: "tetris", // default game to inspect
    };
  },
  computed: {
    store() {
      return useMainStore();
    },
    user() {
      return this.store.user;
    },
    formattedPlaytime() {
      const hrs = Math.floor(this.playtimeSeconds / 3600);
      const mins = Math.floor((this.playtimeSeconds % 3600) / 60);
      const secs = this.playtimeSeconds % 60;
      
      const pad = (num) => String(num).padStart(2, "0");
      if (hrs > 0) {
        return `${hrs}:${pad(mins)}:${pad(secs)}`;
      }
      return `${pad(mins)}:${pad(secs)}`;
    },
    leaderboardByPlayTime() {
      if (!this.store.db.gamerecords) return [];
      const userGroup = {};
      this.store.db.gamerecords.forEach(r => {
        const key = r.UserID || "unknown";
        if (!userGroup[key]) {
          const userObj = this.store.db.users?.find(u => String(u.ID) === String(key)) || {};
          userGroup[key] = {
            UserID: key,
            Username: r.Username || "guest",
            Name: userObj.Name || r.Username || "Гость",
            PlayTime: 0,
            Score: 0
          };
        }
        userGroup[key].PlayTime += Number(r.PlayTime) || 0;
      });
      return Object.values(userGroup).sort((a, b) => b.PlayTime - a.PlayTime).slice(0, 50);
    },
    leaderboardByTotalPoints() {
      if (!this.store.db.gamerecords) return [];
      const userGroup = {};
      
      this.store.db.gamerecords.forEach(r => {
        const key = r.UserID || "unknown";
        if (!userGroup[key]) {
          const userObj = this.store.db.users?.find(u => String(u.ID) === String(key)) || {};
          userGroup[key] = {
            UserID: key,
            Username: r.Username || "guest",
            Name: userObj.Name || r.Username || "Гость",
            gameScores: {}
          };
        }
        if (!userGroup[key].gameScores[r.GameID] || (Number(r.Score) || 0) > userGroup[key].gameScores[r.GameID]) {
          userGroup[key].gameScores[r.GameID] = Number(r.Score) || 0;
        }
      });
      
      return Object.values(userGroup).map(userEntry => {
        const totalPoints = Object.values(userEntry.gameScores).reduce((sum, s) => sum + s, 0);
        return {
          UserID: userEntry.UserID,
          Username: userEntry.Username,
          Name: userEntry.Name,
          TotalPoints: totalPoints
        };
      }).sort((a, b) => b.TotalPoints - a.TotalPoints).slice(0, 50);
    },
    leaderboardForSelectedGame() {
      if (!this.store.db.gamerecords || !this.selectedLeaderboardGameId) return [];
      const gameRecords = this.store.db.gamerecords.filter(r => r.GameID === this.selectedLeaderboardGameId);
      
      const userGroup = {};
      gameRecords.forEach(r => {
        const key = r.UserID || "unknown";
        if (!userGroup[key]) {
          const userObj = this.store.db.users?.find(u => String(u.ID) === String(key)) || {};
          userGroup[key] = {
            UserID: key,
            Username: r.Username || "guest",
            Name: userObj.Name || r.Username || "Гость",
            MaxScore: 0,
            PlayTime: 0
          };
        }
        userGroup[key].MaxScore = Math.max(userGroup[key].MaxScore, Number(r.Score) || 0);
        userGroup[key].PlayTime += Number(r.PlayTime) || 0;
      });
      
      return Object.values(userGroup).sort((a, b) => b.MaxScore - a.MaxScore).slice(0, 50);
    }
  },
  watch: {
    // Start/Stop persistent timer logic when lobby is toggled on/off
    "store.showGamesLobby"(newVal) {
      if (newVal) {
        this.startSessionTimer();
      } else {
        this.stopSessionTimer();
      }
    }
  },
  mounted() {
    if (this.store.showGamesLobby) {
      this.startSessionTimer();
    }
  },
  beforeUnmount() {
    this.stopSessionTimer();
  },
  methods: {
    selectGame(gameId) {
      this.store.setActiveGameId(gameId);
    },
    getGameStats(gameId) {
      if (!this.user || !this.store.db.gamerecords) {
        return { playTime: 0, record: 0 };
      }
      const userRecords = this.store.db.gamerecords.filter(
        r => String(r.UserID) === String(this.user.ID) && r.GameID === gameId
      );
      const playTime = userRecords.reduce((total, r) => total + (Number(r.PlayTime) || 0), 0);
      const record = userRecords.reduce((max, r) => Math.max(max, Number(r.Score) || 0), 0);
      return { playTime, record };
    },
    formatGamePlayTime(seconds) {
      if (!seconds) return "0с";
      if (seconds < 60) return `${seconds}с`;
      const mins = Math.floor(seconds / 60);
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      if (hrs > 0) {
        return `${hrs}ч ${remMins}м`;
      }
      return `${mins}м`;
    },
    goBack() {
      if (this.store.activeGameId) {
        // If inside a game, go back to lobby
        this.store.setActiveGameId(null);
      } else {
        // If inside lobby, close games overlay
        this.store.toggleGamesLobby(false);
      }
    },
    startSessionTimer() {
      this.playtimeSeconds = 0;
      this.stopSessionTimer();
      this.timerInterval = setInterval(() => {
        this.playtimeSeconds++;
        this.persistPlaytimeInfo();
      }, 1000);
    },
    stopSessionTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    persistPlaytimeInfo() {
      const username = this.user?.Username || "guest";
      const fullName = this.user?.Name || "anonymous";
      const totalTimeStr = String(this.playtimeSeconds);

      // 1. Persist to Local Storage
      localStorage.setItem("game_playtime_seconds", totalTimeStr);
      localStorage.setItem("game_last_player_username", username);
      localStorage.setItem("game_last_player_fullname", fullName);

      // 2. Persist to Cookies
      document.cookie = `game_playtime_seconds=${encodeURIComponent(totalTimeStr)};path=/;max-age=31536000`;
      document.cookie = `game_player_username=${encodeURIComponent(username)};path=/;max-age=31536000`;
      document.cookie = `game_player_fullname=${encodeURIComponent(fullName)};path=/;max-age=31536000`;

      // 3. Persist into the Cache Storage API
      if ("caches" in window) {
        const urlToCache = "/games/session-history-api";
        const customResponse = new Response(
          JSON.stringify({
            username: username,
            fullName: fullName,
            playtimeSeconds: this.playtimeSeconds,
            lastSavedAt: new Date().toISOString()
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "X-Cache-Generator": "AutoService-ERP-Games-Core"
            }
          }
        );
        caches.open("games-data-cache").then((cache) => {
          cache.put(urlToCache, customResponse);
        }).catch(err => {
          console.debug("Cache write skipped", err);
        });
      }
    }
  }
};
</script>

<style scoped>
/* Key animations for gaming container */
.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes scaleUp {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
