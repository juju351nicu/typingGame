<script setup lang="ts">
import AppAlerts from "@/components/AppAlerts.vue";
import { computed, ref } from "vue";
import { useGameScoresStore } from "@/stores/gameScores";
import { useConfigStore } from "@/stores/config";
import Const from "@/constants/const";
import { resetGameScores } from "@/composables/useScoreReset";
import type { Alert, GameRule, TimeLimitSeconds } from "@/types/interfaces";

/** 難易度選択に表示する項目 */
interface DifficultyOption {
  title: string;
  value: number;
}

/** ゲームルール選択に表示する項目 */
interface GameRuleOption {
  title: string;
  value: GameRule;
}

/** タイムアタック制限時間の選択に表示する項目 */
interface TimeLimitOption {
  title: string;
  value: TimeLimitSeconds;
}

/** 保存済みスコアを管理するストア */
const gameScoresStore = useGameScoresStore();

/** 難易度、ゲームルール、仮想キーボード表示などの設定を管理するストア */
const configStore = useConfigStore();

/** 画面で選択中の難易度 */
const selectedOption = ref(configStore.getGameMode);

/** 画面で選択中のゲームルール */
const selectedGameRule = ref<GameRule>(configStore.getGameRule);

/** 画面で選択中のタイムアタック制限時間 */
const selectedTimeLimitSeconds = ref<TimeLimitSeconds>(
  configStore.getTimeLimitSeconds
);

/** 画面で選択中の仮想キーボード表示有無 */
const isVirtualKeyboardVisible = ref(configStore.getIsVirtualKeyBoard);

/** 画面で選択中のダークモード有無 */
const isDarkMode = ref(configStore.getDisplayMode);

/** ゲーム難易度の選択項目 */
const options = ref<DifficultyOption[]>(Const.DIFFICULTY_LEVEL);

/** ゲームルールの選択項目 */
const gameRuleOptions = ref<GameRuleOption[]>(Const.GAME_RULE_OPTIONS);

/** タイムアタック制限時間の選択項目 */
const timeLimitOptions = ref<TimeLimitOption[]>(Const.TIME_ATTACK_LIMITS);

/** タイムアタック選択時だけ制限時間の設定を表示する */
const isTimeAttackMode = computed((): boolean => {
  return selectedGameRule.value === Const.GAME_RULE.TIME_ATTACK;
});

/**
 * ゲームの難易度を保存する。
 *
 * 難易度は単語追加速度と風船移動速度に影響する。
 *
 * @param mode 難易度
 */
const setGameMode = (mode: number) => {
  configStore.saveGameMode(mode);
};

/**
 * ゲームルールを保存する。
 *
 * タイムアタックを選択した場合のみ、制限時間設定のUIを表示する。
 *
 * @param gameRule ゲームルール
 */
const setGameRule = (gameRule: GameRule) => {
  configStore.saveGameRule(gameRule);
};

/**
 * タイムアタックの制限時間を保存する。
 *
 * 通常モードでは使わないが、設定値として保持しておく。
 *
 * @param seconds 制限時間（秒）
 */
const setTimeLimitSeconds = (seconds: TimeLimitSeconds) => {
  configStore.saveTimeLimitSeconds(seconds);
};

/**
 * 仮想キーボードの表示有無を保存する。
 *
 * Vuetifyのswitchはnullを渡す可能性があるため、booleanの時だけ保存する。
 *
 * @param isVisible 表示する場合 true
 */
const setVirtualKeyboardVisible = (isVisible: boolean | null) => {
  if (isVisible === null) {
    return;
  }
  configStore.saveIsVirtualKeyboard(isVisible);
};

/**
 * 表示テーマを保存する。
 *
 * Vuetifyのswitchはnullを渡す可能性があるため、booleanの時だけ保存する。
 *
 * @param isDark ダークモードにする場合 true
 */
const setDisplayMode = (isDark: boolean | null) => {
  if (isDark === null) {
    return;
  }
  configStore.saveDisplayMode(isDark);
};

/** スコア初期化結果などを表示するアラート */
const alerts = ref<Alert[]>([]);

/** スコア初期化確認ダイアログの表示状態 */
const isResetDialogOpen = ref(false);

/**
 * 保存済みスコアを初期化して確認ダイアログを閉じる。
 */
const resetModalData = () => {
  resetGameScores(gameScoresStore, alerts.value);
  isResetDialogOpen.value = false;
};
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
          @update:modelValue="setGameMode"
          class="setting-control"
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
          @update:modelValue="setGameRule"
          class="setting-control"
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
          @update:modelValue="setTimeLimitSeconds"
          class="setting-control"
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
          @update:modelValue="setVirtualKeyboardVisible"
          class="setting-control"
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
          @update:modelValue="setDisplayMode"
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
