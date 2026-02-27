<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Util from "@/utils/util";
import { GameScore } from "@/types/interfaces";
/** Propsインタフェース定義 */
interface Props {
  isGameOver: boolean,
  lastScore: GameScore,
}

/** Propsオブジェクトの設定 */
const props = defineProps<Props>();
const emit = defineEmits(["restart-game"]);

/** ダイアログの表示・非表示 */
const dialog = ref(false);

/** ゲームオーバーフラグ */
const isGameOverFlag = computed((): boolean => {
  return props.isGameOver;
});

/** 最終ゲームスコア */
const lastScore = computed((): GameScore => {
  return props.lastScore;
});

/** ゲームを再スタートする */
const reStartGame = (() => {
  emit("restart-game");
  dialog.value = false;
});

/** ゲームが終了した際に表示するメッセージ */
const scoreMessage = computed((): string => {
  if (lastScore.value != null) {
    let desc = `You completed ${lastScore.value.score} words in ${lastScore.value.time
      } time in ${Util.getLevel(lastScore.value.mode)} mode.`;
    return desc;
  }
  return "";
});

/** ゲームオーバーフラグをウォッチにて判定する */
watch(isGameOverFlag, (newValue, _oldValue) => {
  if (newValue) {
    dialog.value = true;
  }
});
</script>
<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500" persistent>
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          モーダルタイトル
        </v-card-title>

        <v-card-text>
          {{ scoreMessage }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="reStartGame">
            再スタート
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<style scoped></style>
