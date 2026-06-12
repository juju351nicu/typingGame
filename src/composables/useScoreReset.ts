import Const from "@/constants/const";
import type { Alert } from "@/types/interfaces";

interface ScoreResetStore {
  deleteGameScoreList: () => void;
}

/**
 * 保存済みスコアを削除し、成功アラートを追加する。
 *
 * @param gameScoresStore スコア削除処理を持つストア
 * @param alerts 画面に表示するアラート配列
 */
export const resetGameScores = (
  gameScoresStore: ScoreResetStore,
  alerts: Alert[]
): void => {
  gameScoresStore.deleteGameScoreList();
  alerts.push({
    message: "スコアを初期化しました。",
    type: Const.ALERT_TYPE.SUCCESS,
  });
};
