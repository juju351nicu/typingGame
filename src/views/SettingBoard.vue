<script setup lang="ts">
import Alerts from "@/components/Alerts.vue";
import { ref } from "vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import Const from "@/constants/const";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** ゲームの設定情報に関するストア情報 */
const configStore = useConfigStore();

/** 選択されたゲームの難易度 */
const selectedOption = ref(configStore.getGameMode);

/** ゲーム難易度の選択項目 */
const options = ref<any>(Const.DIFFICULTY_LEVEL);

/**
 * ゲームの難易度設定する
 * @param mode 難易度
 */
const setGameMode = (mode: number) => {
  configStore.saveGameMode(mode);
};

/** アラートに表示するメッセージ */
const alerts = ref<any[]>([]);
/** スコア初期化確認ダイアログ */
const isResetDialogOpen = ref(false);

/** ゲームのデータを初期化する */
const resetModalData = () => {
  // ローカルストレージのゲームのスコアを削除する
  gameScoresStore.deleteGameScoreList();
  alerts.value.push({
    message: "スコアを初期化しました。",
    type: Const.ALERT_TYPE.SUCCESS,
  });
  isResetDialogOpen.value = false;
};
</script>
<template>
  <v-container class="settings-page">
    <Alerts :alerts="alerts" />
    <section class="settings-header">
      <h1>Settings</h1>
      <p>ゲームの難易度と保存済みスコアを管理できます。</p>
    </section>

    <div class="settings-grid">
      <section class="setting-card">
        <div class="setting-card__body">
          <span class="setting-label">難易度</span>
          <p class="setting-description">
            風船の追加速度と移動速度を変更します。
          </p>
        </div>
        <v-select
          v-model="selectedOption"
          :items="options"
          item-title="title"
          item-value="value"
          label="Game Mode"
          variant="outlined"
          density="comfortable"
          hide-details
          @update:modelValue="setGameMode"
          class="setting-control"
        />
      </section>

      <section class="setting-card danger-card">
        <div class="setting-card__body">
          <span class="setting-label">スコア初期化</span>
          <p class="setting-description">
            localStorage に保存されたランキング履歴を削除します。
          </p>
        </div>
        <v-btn color="error" variant="flat" @click="isResetDialogOpen = true">
          スコアを初期化する
        </v-btn>
      </section>
    </div>

    <v-dialog v-model="isResetDialogOpen" width="420">
      <v-card class="confirm-card">
        <v-card-title>スコアを削除しますか？</v-card-title>
        <v-card-text>
          保存されているランキング履歴が削除されます。この操作は元に戻せません。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isResetDialogOpen = false">
            キャンセル
          </v-btn>
          <v-btn color="error" variant="flat" @click="resetModalData">
            削除する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<style scoped>
.settings-page {
  max-width: 980px;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  color: #222222;
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.settings-header p {
  color: #666666;
  font-size: 1.3rem;
  margin: 8px 0 0;
}

.settings-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.setting-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: 20px;
}

.danger-card {
  border-top: 4px solid #e03131;
}

.setting-card__body {
  min-width: 0;
}

.setting-label {
  color: #222222;
  display: block;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.setting-description {
  color: #666666;
  font-size: 1.1rem;
  margin: 0;
}

.setting-control {
  max-width: 260px;
  min-width: 220px;
}

.confirm-card {
  border-radius: 8px;
}

@media (max-width: 760px) {
  .settings-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .settings-header h1 {
    font-size: 2.5rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .setting-card {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  .setting-control {
    max-width: none;
    min-width: 0;
  }
}
</style>
