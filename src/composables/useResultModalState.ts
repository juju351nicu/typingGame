import Const from "@/constants/const";
import type { GameScore } from "@/types/interfaces";
import Util from "@/utils/gameUtils";
import { computed, type Ref } from "vue";

/**
 * リザルトモーダルに表示するスコア派生情報を管理する。
 *
 * ランク、難易度、ゲームルール、旧データ向けのメトリクス既定値を
 * コンポーネント外へ集約し、表示ロジックをテストしやすくする。
 *
 * @param lastScore 表示対象の最終スコア
 */
export const useResultModalState = (lastScore: Ref<GameScore>) => {
  /** ランク */
  const resultRank = computed((): string => {
    return Util.getResultRank(lastScore.value.score);
  });

  /** ランク色 */
  const rankColor = computed((): string => {
    return Util.getResultRankColor(resultRank.value);
  });

  /** 難易度 */
  const gameModeLabel = computed((): string => {
    return Util.getLevel(lastScore.value.mode);
  });

  /** ゲームルール */
  const gameRuleLabel = computed((): string => {
    return Util.getScoreGameRuleLabel(lastScore.value);
  });

  /** タイムアタックの制限時間 */
  const timeLimitLabel = computed((): string => {
    return Util.getTimeLimitLabel(lastScore.value);
  });

  /** タイムアタックの結果かどうか */
  const isTimeAttackResult = computed((): boolean => {
    return Util.getGameRule(lastScore.value) === Const.GAME_RULE.TIME_ATTACK;
  });

  /** WPM表示値。古い保存済みスコアでは0として表示する。 */
  const wpmLabel = computed((): number => {
    return lastScore.value.wpm ?? 0;
  });

  /** 正タイプ数表示値。古い保存済みスコアでは0として表示する。 */
  const correctCharacterCountLabel = computed((): number => {
    return lastScore.value.correctCharacterCount ?? 0;
  });

  /** 正確率表示値。古い保存済みスコアでは100として表示する。 */
  const accuracyLabel = computed((): number => {
    return lastScore.value.accuracy ?? 100;
  });

  /** ミス数表示値。古い保存済みスコアでは0として表示する。 */
  const missCountLabel = computed((): number => {
    return lastScore.value.missCount ?? 0;
  });

  return {
    accuracyLabel,
    correctCharacterCountLabel,
    gameModeLabel,
    gameRuleLabel,
    isTimeAttackResult,
    missCountLabel,
    rankColor,
    resultRank,
    timeLimitLabel,
    wpmLabel,
  };
};
