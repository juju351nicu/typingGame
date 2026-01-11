import { defineStore } from "pinia";

export const useGameModeStore = defineStore("gameMode", {
  state: () => ({
    mode: 0,
    displayMode: 'light'
  }),

  getters: {
    getGameMode() {
      return this.mode;
    },
  },
  actions: {
    saveGameMode(selectedGameMode) {
      this.mode = selectedGameMode;
    },
    saveDisplayMode(theme) {
      this.displayMode = theme;
    }
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
