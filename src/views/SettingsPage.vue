<script setup lang="ts">
import AppAlerts from "@/components/AppAlerts.vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import { useSettingsPageState } from "@/composables/useSettingsPageState";

/** 保存済みスコアを管理するストア */
const gameScoresStore = useGameScoresStore();

/** 難易度、ゲームルール、仮想キーボード表示などの設定を管理するストア */
const configStore = useConfigStore();

const {
  alerts,
  closeResetDialog,
  gameRuleOptions,
  isDarkMode,
  isResetDialogOpen,
  isTimeAttackMode,
  isVirtualKeyboardVisible,
  openResetDialog,
  options,
  resetModalData,
  selectedGameRule,
  selectedOption,
  selectedTimeLimitSeconds,
  setDisplayMode,
  setGameMode,
  setGameRule,
  setTimeLimitSeconds,
  setVirtualKeyboardVisible,
  timeLimitOptions,
} = useSettingsPageState(configStore, gameScoresStore);
</script>
<template>
  <v-container class="settings-page">
    <AppAlerts :alerts="alerts" />
    <section class="settings-header">
      <h1>Settings</h1>
      <p>ゲームの難易度、ルール、表示補助、保存済みスコアを管理できます。</p>
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
          label="難易度"
          variant="outlined"
          density="comfortable"
          hide-details
          class="setting-control"
          @update:model-value="setGameMode"
        />
      </section>

      <section class="setting-card">
        <div class="setting-card__body">
          <span class="setting-label">ゲームルール</span>
          <p class="setting-description">
            通常モードか、制限時間内のスコアを競うモードを選びます。
          </p>
        </div>
        <v-select
          v-model="selectedGameRule"
          :items="gameRuleOptions"
          item-title="title"
          item-value="value"
          label="ゲームルール"
          variant="outlined"
          density="comfortable"
          hide-details
          class="setting-control"
          @update:model-value="setGameRule"
        />
      </section>

      <section v-if="isTimeAttackMode" class="setting-card">
        <div class="setting-card__body">
          <span class="setting-label">制限時間</span>
          <p class="setting-description">
            タイムアタックモードのプレイ時間を選びます。
          </p>
        </div>
        <v-select
          v-model="selectedTimeLimitSeconds"
          :items="timeLimitOptions"
          item-title="title"
          item-value="value"
          label="制限時間"
          variant="outlined"
          density="comfortable"
          hide-details
          class="setting-control"
          @update:model-value="setTimeLimitSeconds"
        />
      </section>

      <section class="setting-card">
        <div class="setting-card__body">
          <span class="setting-label">仮想キーボード</span>
          <p class="setting-description">
            次に打つキー、押したキー、ミスしたキーをゲーム中に表示します。
          </p>
        </div>
        <v-switch
          v-model="isVirtualKeyboardVisible"
          color="primary"
          hide-details
          inset
          :label="isVirtualKeyboardVisible ? '表示' : '非表示'"
          class="setting-control"
          @update:model-value="setVirtualKeyboardVisible"
        />
      </section>

      <section class="setting-card">
        <div class="setting-card__body">
          <span class="setting-label">表示テーマ</span>
          <p class="setting-description">
            画面全体の明るさをライト / ダークで切り替えます。
          </p>
        </div>
        <v-switch
          v-model="isDarkMode"
          color="primary"
          hide-details
          inset
          :label="isDarkMode ? 'ダーク' : 'ライト'"
          class="setting-control"
          @update:model-value="setDisplayMode"
        />
      </section>

      <section class="setting-card danger-card">
        <div class="setting-card__body">
          <span class="setting-label">スコア初期化</span>
          <p class="setting-description">
            localStorage に保存されたランキング履歴を削除します。
          </p>
        </div>
        <v-btn color="error" variant="flat" @click="openResetDialog">
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
          <v-btn variant="text" @click="closeResetDialog"> キャンセル </v-btn>
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
  color: var(--app-text);
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.settings-header p {
  color: var(--app-text-muted);
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
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
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
  color: var(--app-text);
  display: block;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.setting-description {
  color: var(--app-text-muted);
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
