import { defineStore } from "pinia";
import Const from "@/constants/const.js";

export const useConfigStore = defineStore("config", {
  state: () => ({
    mode: 0,
    displayMode: Const.DISPLAY_THEME.LIGHT,
  }),

  getters: {
    getGameMode() {
      return this.mode;
    },
    getDisplayMode() {
      return this.displayMode;
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
