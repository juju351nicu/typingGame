<script setup lang="ts">
import AppAlerts from "@/components/AppAlerts.vue";
import AppSelectField from "@/components/AppSelectField.vue";
import AppSwitch from "@/components/AppSwitch.vue";
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import { useOverlayScrollBlock } from "@/composables/useOverlayScrollBlock";
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
useOverlayScrollBlock(isResetDialogOpen);
</script>
<template>
  <div class="app-container settings-page">
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
        <AppSelectField
          v-model="selectedOption"
          :items="options"
          label="難易度"
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
        <AppSelectField
          v-model="selectedGameRule"
          :items="gameRuleOptions"
          label="ゲームルール"
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
        <AppSelectField
          v-model="selectedTimeLimitSeconds"
          :items="timeLimitOptions"
          label="制限時間"
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
        <AppSwitch
          v-model="isVirtualKeyboardVisible"
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
        <AppSwitch
          v-model="isDarkMode"
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
        <UButton color="error" class="shadow-none" @click="openResetDialog">
          スコアを初期化する
        </UButton>
      </section>
    </div>

    <UModal
      v-model:open="isResetDialogOpen"
      title="スコアを削除しますか？"
      description="保存されているランキング履歴が削除されます。この操作は元に戻せません。"
      :ui="{ content: 'app-dialog confirm-dialog' }"
    >
      <template #content>
        <div class="confirm-card">
          <h2 class="app-card__title">スコアを削除しますか？</h2>
          <div class="app-card__text">
            保存されているランキング履歴が削除されます。この操作は元に戻せません。
          </div>
          <div class="app-card__actions">
            <span class="flex-1" />
            <UButton color="neutral" variant="ghost" @click="closeResetDialog">
              キャンセル
            </UButton>
            <UButton color="error" class="shadow-none" @click="resetModalData">
              削除する
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
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

/* body直下へ描画されるダイアログの幅 */
:global(.confirm-dialog) {
  --app-dialog-width: 420px;
}

.setting-control {
  max-width: 260px;
  min-width: 220px;
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
