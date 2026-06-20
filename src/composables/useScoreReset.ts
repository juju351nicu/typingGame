import Const from "@/constants/const";
import type { Alert } from "@/types/interfaces";

interface ScoreResetStore {
  /** 保存済みスコア一覧を削除するストア処理 */
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
  // localStorage 側の保存データを削除する。
  gameScoresStore.deleteGameScoreList();

  // 画面側で完了が分かるよう、成功アラートを積む。
  alerts.push({
    message: "スコアを初期化しました。",
    type: Const.ALERT_TYPE.SUCCESS,
  });
};
