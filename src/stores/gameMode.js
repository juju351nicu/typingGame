import { defineStore } from "pinia";

export const useGameModeStore = defineStore("gameMode", {
  state: () => ({
    mode: 0,
  }),
  actions: {
    saveGameMode(selectedGameMode) {
      this.mode = selectedGameMode;
    },
  },
  getters: {
    getGameMode() {
      return this.mode;
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
