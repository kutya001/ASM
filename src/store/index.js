import { defineStore } from "pinia";
import { 
  supabase, 
  loginUser, 
  registerUserWithOrg, 
  approveUser, 
  getInitData, 
  getTable, 
  addRow, 
  addRows, 
  updateRecord, 
  updateRow, 
  deleteRow, 
  bulkImport 
} from "../services/api";

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


export const useMainStore = defineStore("main", {
  state: () => {
    let savedUser = null;
    try {
      const val = localStorage.getItem("currentUser");
      if (val) savedUser = JSON.parse(val);
    } catch (e) {
      localStorage.removeItem("currentUser");
    }
    return {
      user: savedUser,
      db: { records: [], services: [], brands: [], models: [], users: [], welcomescreens: [], gamerecords: [] },
      syncQueue: [],
      isSyncing: false,
      toasts: [],
      loading: false,
      initError: null,
      syncStatus: "synced",
      logoUrl: localStorage.getItem("app_logo_url") || "",
      welcomeBannerUrl: localStorage.getItem("app_welcome_banner_url") || "",
      appIcon: localStorage.getItem("app_icon_class") || "bi-car-front-fill",
      showGamesLobby: false,
      activeGameId: null,
      currentGameSessionId: null,
      activeGameSeconds: 0,
      activeGameScore: 0,
      gameTimerInterval: null,
      _realtimeChannel: null,
    };
  },
  getters: {
    mastersList() {
      return this.db.users.filter((u) => u.Role !== "Superadmin");
    },
    currentUserMasterID() {
      return this.user ? this.user.ID : null;
    },
    sortedBrands() {
      let b = this.db.brands || [];
      const uniqueNames = new Set();
      const bUnique = b.filter(item => {
          const name = String(item.Name || "").toLowerCase().trim();
          if(uniqueNames.has(name)) return false;
          uniqueNames.add(name);
          return true;
      });
      return bUnique.sort((x, y) =>
        String(x.Name || "")
          .toLowerCase()
          .localeCompare(String(y.Name || "").toLowerCase()),
      );
    },
    sortedServices() {
      let s = this.db.services || [];
      const uniqueNames = new Set();
      const sUnique = s.filter(item => {
          const name = String(item.Name || "").toLowerCase().trim();
          if(uniqueNames.has(name)) return false;
          uniqueNames.add(name);
          return true;
      });
      return sUnique.sort((x, y) =>
        String(x.Name || "")
          .toLowerCase()
          .localeCompare(String(y.Name || "").toLowerCase()),
      );
    },
  },
  actions: {
    async login(username, password) {
      let res = await loginUser(username, password);
      this.user = res;
      localStorage.setItem("currentUser", JSON.stringify(res));
      this.showToast(`Успешный вход. Привет, ${res.Name || res.Username}!`);
      await this.loadInitialData();
    },
    async register(username, password, orgMode, orgValue) {
      let res = await registerUserWithOrg(username, password, orgMode, orgValue);
      this.showToast(res.message);
    },
    showToast(msg, type = "success") {
      const id = Date.now();
      this.toasts.push({ id, msg, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 4000);
    },
    updateBranding(logoUrl, welcomeBannerUrl, appIcon) {
      this.logoUrl = logoUrl || "";
      this.welcomeBannerUrl = welcomeBannerUrl || "";
      this.appIcon = appIcon || "bi-car-front-fill";
      localStorage.setItem("app_logo_url", this.logoUrl);
      localStorage.setItem("app_welcome_banner_url", this.welcomeBannerUrl);
      localStorage.setItem("app_icon_class", this.appIcon);
    },
    toggleGamesLobby(show) {
      this.showGamesLobby = show;
      if (!show) {
        this.setActiveGameId(null);
      }
    },
    setActiveGameId(id) {
      if (this.activeGameId && this.activeGameId !== id) {
        this.stopGameSession();
      }
      this.activeGameId = id;
      if (id) {
        this.startGameSession(id);
      }
    },
    startGameSession(gameId) {
      if (!this.user) return;
      if (this.gameTimerInterval) {
        clearInterval(this.gameTimerInterval);
        this.gameTimerInterval = null;
      }
      const id = generateUUID();
      const newRecord = {
        ID: id,
        UserID: this.user.ID,
        Username: this.user.Username,
        GameID: gameId,
        StartTime: new Date().toISOString(),
        PlayTime: 0,
        Score: 0
      };
      if (!this.db.gamerecords) {
        this.db.gamerecords = [];
      }
      this.db.gamerecords.push(newRecord);
      this.dispatchSync("addRow", newRecord, "GameRecords");
      this.currentGameSessionId = id;
      this.activeGameSeconds = 0;
      this.activeGameScore = 0;
      this.gameTimerInterval = setInterval(() => {
        this.activeGameSeconds++;
        const idx = this.db.gamerecords.findIndex(r => r.ID === id);
        if (idx !== -1) {
          this.db.gamerecords[idx].PlayTime = this.activeGameSeconds;
        }
        if (this.activeGameSeconds % 10 === 0) {
          this.saveSessionToServer();
        }
      }, 1000);
    },
    stopGameSession() {
      if (this.gameTimerInterval) {
        clearInterval(this.gameTimerInterval);
        this.gameTimerInterval = null;
      }
      if (this.currentGameSessionId) {
        this.saveSessionToServer();
        this.currentGameSessionId = null;
      }
    },
    updateSessionScore(score) {
      const numericScore = Number(score) || 0;
      if (numericScore > this.activeGameScore) {
        this.activeGameScore = numericScore;
        if (this.currentGameSessionId) {
          const idx = this.db.gamerecords.findIndex(r => r.ID === this.currentGameSessionId);
          if (idx !== -1) {
            this.db.gamerecords[idx].Score = Math.max(Number(this.db.gamerecords[idx].Score) || 0, numericScore);
          }
        }
      }
    },
    async saveSessionToServer() {
      if (!this.currentGameSessionId) return;
      const id = this.currentGameSessionId;
      const idx = this.db.gamerecords.findIndex(r => r.ID === id);
      if (idx !== -1) {
        const record = this.db.gamerecords[idx];
        const updated = {
          ID: record.ID,
          UserID: record.UserID,
          Username: record.Username,
          GameID: record.GameID,
          StartTime: record.StartTime,
          PlayTime: this.activeGameSeconds,
          Score: this.activeGameScore
        };
        this.dispatchSync("updateRow", updated, "GameRecords");
      }
    },
    async loadWelcomeScreenInfo() {
      try {
        const screens = await getTable("WelcomeScreens");
        if (Array.isArray(screens) && screens.length > 0) {
          this.db.welcomescreens = screens;
          const screen = screens.find((s) => s.ID === "welcome_main") || screens[0];
          if (screen) {
            if (screen.Title) localStorage.setItem("welcome_screen_title", screen.Title);
            if (screen.Text) localStorage.setItem("welcome_screen_text", screen.Text);
          }
        }
      } catch (err) {
        console.error("Failed to load welcome screen info", err);
      }
    },
    async loadInitialData() {
      if (!this.user) return;
      this.loading = true;
      try {
        let d = await getInitData(this.user.Role, this.user.ID, this.user.OrganizationID);

        // Parse ServicesJSON for records
        d.records.forEach((r) => {
          if (r.ServicesJSON) {
            try {
              r.ServicesJSON =
                typeof r.ServicesJSON === "string"
                  ? JSON.parse(r.ServicesJSON)
                  : r.ServicesJSON;
            } catch (e) {
              r.ServicesJSON = [];
            }
          } else r.ServicesJSON = [];
        });

        if (!d.welcomescreens) {
          d.welcomescreens = [];
        }

        this.db = d;
        this.syncStatus = "synced";

        // Start Realtime subscription instead of polling
        this.startRealtimeSync();
      } catch (e) {
        this.initError = e.message;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      // Cleanup Realtime channel
      if (this._realtimeChannel) {
        supabase.removeChannel(this._realtimeChannel);
        this._realtimeChannel = null;
      }
      this.user = null;
      this.db = {
        records: [],
        services: [],
        brands: [],
        models: [],
        users: [],
        welcomescreens: [],
        gamerecords: [],
      };
      this.syncStatus = "synced";
      localStorage.removeItem("currentUser");
    },
    async dispatchSync(taskName, payload, sheet = null) {
      this.isSyncing = true;
      
      // Inject OrganizationID if missing and relevant
      if (typeof payload === 'object' && payload !== null && this.user) {
        payload.OrganizationID = payload.OrganizationID || this.user.OrganizationID;
      }

      this.syncQueue.push({ taskName, payload, sheet });

      // --- Optimistic UI Updates ---
      try {
        if (taskName === "addRow" && sheet) {
          const key = sheet.toLowerCase();
          if (this.db[key]) {
            const tempItem = { 
              ...payload, 
              ID: payload.ID || ("temp_" + Math.random().toString(36).substr(2, 9)) 
            };
            if (key === "records") {
              if (tempItem.ServicesJSON) {
                try {
                  tempItem.ServicesJSON = typeof tempItem.ServicesJSON === "string" ? JSON.parse(tempItem.ServicesJSON) : tempItem.ServicesJSON;
                } catch (e) {
                  tempItem.ServicesJSON = [];
                }
              } else {
                tempItem.ServicesJSON = [];
              }
              this.db.records.unshift(tempItem);
            } else {
              this.db[key].push(tempItem);
            }
          }
        } else if (taskName === "addRows" && sheet) {
          const key = sheet.toLowerCase();
          if (this.db[key] && Array.isArray(payload)) {
            payload.forEach(item => {
              const tempItem = { 
                ...item, 
                ID: item.ID || ("temp_" + Math.random().toString(36).substr(2, 9)) 
              };
              this.db[key].push(tempItem);
            });
          }
        } else if (taskName === "updateRecord") {
          const idx = this.db.records.findIndex(r => r.ID === payload.ID);
          if (idx !== -1) {
            const updated = { ...this.db.records[idx], ...payload };
            if (updated.ServicesJSON) {
              try {
                updated.ServicesJSON = typeof updated.ServicesJSON === "string" ? JSON.parse(updated.ServicesJSON) : updated.ServicesJSON;
              } catch (e) {}
            }
            this.db.records[idx] = updated;
          }
        } else if (taskName === "updateRow" && sheet) {
          const key = sheet.toLowerCase();
          if (this.db[key]) {
            const idx = this.db[key].findIndex(r => r.ID === payload.ID);
            if (idx !== -1) {
              this.db[key][idx] = { ...this.db[key][idx], ...payload };
            }
          }
        } else if (taskName === "deleteRow" && sheet) {
          const key = sheet.toLowerCase();
          if (this.db[key]) {
            this.db[key] = this.db[key].filter(r => r.ID !== payload);
          }
        }
      } catch (optErr) {
        console.warn("Optimistic update failed silently:", optErr);
      }
      // --- End of Optimistic UI Updates ---

      if (this.syncQueue.length === 1) {
        this.processSyncQueue();
      }
    },
    async processSyncQueue() {
      while (this.syncQueue.length > 0) {
        let task = this.syncQueue[0];
        try {
          this.syncStatus = "updating";
          let newData;
          if (task.taskName === "updateRecord") {
            newData = await updateRecord(task.payload);
          } else if (task.taskName === "approveUser") {
            newData = await approveUser(
              task.payload.id,
              task.payload.data,
            );
            this.db.users = newData;
          } else if (task.taskName === "addRow") {
            newData = await addRow(task.sheet, task.payload);
          } else if (task.taskName === "addRows") {
            newData = await addRows(task.sheet, task.payload);
          } else if (task.taskName === "bulkImport") {
            newData = await bulkImport(task.payload);
          } else if (task.taskName === "updateRow") {
            newData = await updateRow(task.sheet, task.payload);
          } else if (task.taskName === "deleteRow") {
            newData = await deleteRow(
              task.sheet,
              task.payload,
              this.user.Role,
              this.user.ID,
              this.user.OrganizationID,
            );
          }

          if (newData) {
            if (Array.isArray(newData)) {
              if (task.sheet === "Records" || task.taskName === "updateRecord") {
                this.db.records = newData;
              } else {
                let key = task.sheet.toLowerCase();
                this.db[key] = newData;
              }
            } else {
              this.db = newData;
            }
            // Parse ServicesJSON for records
            if (this.db.records) {
              this.db.records.forEach((r) => {
                if (r.ServicesJSON) {
                  try {
                    r.ServicesJSON =
                      typeof r.ServicesJSON === "string"
                        ? JSON.parse(r.ServicesJSON)
                        : r.ServicesJSON;
                  } catch (e) {
                    r.ServicesJSON = [];
                  }
                } else r.ServicesJSON = [];
              });
            }
          }
          this.syncQueue.shift();
          this.syncStatus = "synced";
        } catch (e) {
          console.error("Ошибка синхронизации:", e);
          this.syncStatus = "error";
          this.showToast(
            "Ошибка синхронизации. Будет повторная попытка.",
            "error",
          );
          await new Promise((r) => setTimeout(r, 4000));
        }
      }
      this.isSyncing = false;
      this.syncStatus = "synced";
    },

    // ========================
    // REALTIME (replaces polling)
    // ========================
    startRealtimeSync() {
      if (this._realtimeChannel) {
        supabase.removeChannel(this._realtimeChannel);
      }

      const tableToStoreKey = {
        records: "records",
        services: "services",
        users: "users",
        brands: "brands",
        models: "models",
        welcome_screens: "welcomescreens",
        game_records: "gamerecords",
      };

      const FIELD_MAPS = {
        users: { id: "ID", username: "Username", password: "Password", name: "Name", phone: "Phone", role: "Role", status: "Status", organization_id: "OrganizationID" },
        records: { id: "ID", client_name: "ClientName", phone: "Phone", car_number: "CarNumber", brand_id: "BrandID", model_id: "ModelID", master_id: "MasterID", start_time: "StartTime", end_time: "EndTime", status: "Status", services_json: "ServicesJSON", additional_services: "AdditionalServices", total_amount: "TotalAmount", comment: "Comment", is_paid: "IsPaid", organization_id: "OrganizationID" },
        services: { id: "ID", name: "Name", price: "Price", organization_id: "OrganizationID" },
        brands: { id: "ID", name: "Name" },
        models: { id: "ID", brand_id: "BrandID", name: "Name" },
        welcome_screens: { id: "ID", title: "Title", text: "Text" },
        game_records: { id: "ID", user_id: "UserID", username: "Username", game_id: "GameID", start_time: "StartTime", play_time: "PlayTime", score: "Score" },
      };

      function mapRow(table, dbRow) {
        if (!dbRow) return null;
        const map = FIELD_MAPS[table];
        if (!map) return dbRow;
        const result = {};
        for (const [key, value] of Object.entries(dbRow)) {
          result[map[key] || key] = value;
        }
        return result;
      }

      const isSuper = this.user && this.user.Role === 'Superadmin';
      const myOrgId = this.user ? this.user.OrganizationID : null;

      const channel = supabase
        .channel("db-all-changes")
        .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
          const table = payload.table;
          const storeKey = tableToStoreKey[table];
          if (!storeKey || !this.db[storeKey]) return;

          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            const newRow = mapRow(table, payload.new);
            if (newRow) {
              // Client-side multi-tenancy filter
              if (!isSuper && newRow.OrganizationID && String(newRow.OrganizationID) !== String(myOrgId)) {
                return;
              }
              
              const existing = this.db[storeKey].find(r => r.ID === newRow.ID);
              if (!existing) {
                if (storeKey === "records") {
                  this.db[storeKey].unshift(newRow);
                } else {
                  this.db[storeKey].push(newRow);
                }
              } else {
                const idx = this.db[storeKey].indexOf(existing);
                this.db[storeKey][idx] = { ...existing, ...newRow };
              }
            }
          } else if (eventType === "UPDATE") {
            const updatedRow = mapRow(table, payload.new);
            if (updatedRow) {
              // Client-side multi-tenancy filter
              if (!isSuper && updatedRow.OrganizationID && String(updatedRow.OrganizationID) !== String(myOrgId)) {
                return;
              }

              const idx = this.db[storeKey].findIndex(r => r.ID === updatedRow.ID);
              if (idx !== -1) {
                this.db[storeKey][idx] = { ...this.db[storeKey][idx], ...updatedRow };
              }
            }
          } else if (eventType === "DELETE") {
            const oldRow = mapRow(table, payload.old);
            if (oldRow && oldRow.ID) {
              this.db[storeKey] = this.db[storeKey].filter(r => r.ID !== oldRow.ID);
            }
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Realtime: subscribed to all tables");
          }
        });

      this._realtimeChannel = channel;
    },
  },
});
