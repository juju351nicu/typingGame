import type {
  GameMode,
  GameRule,
  GameScore,
  TimeLimitSeconds,
} from "@/types/interfaces";
import Util from "@/utils/gameUtils";

interface GamePageScoreInput {
  /** 現在のスコア */
  score: number;
  /** 現在の難易度 */
  mode: GameMode;
  /** 現在のゲームルール */
  gameRule: GameRule;
  /** タイムアタックの制限時間 */
  timeLimitSeconds: TimeLimitSeconds;
  /** タイムアタックモードで保存するか */
  isTimeAttackMode: boolean;
  /** 経過時間(ms) */
  accumTime: number;
  /** 入力した文字数 */
  typedCharacterCount: number;
  /** ミスした文字数 */
  missCount: number;
  /** 正しく入力した文字数 */
  correctCharacterCount: number;
}

interface GameScoreStore {
  /** ゲームスコアを保存する */
  saveGameScoreList: (score: GameScore) => void;
}

/**
 * ゲーム終了時に保存するスコア情報を作成する。
 *
 * GamePage.vueからスコア計算と保存用オブジェクト生成を切り出し、
 * WPM、正確率、タイムアタック制限時間の保存有無をテストしやすくする。
 *
 * @param input スコア作成に必要なゲーム状態と設定
 * @returns 保存用スコア
 */
export const createGamePageScore = (input: GamePageScoreInput): GameScore => {
  return {
    score: input.score,
    mode: input.mode,
    gameRule: input.gameRule,
    timeLimitSeconds: input.isTimeAttackMode
      ? input.timeLimitSeconds
      : undefined,
    time: Util.getCountDownTime(input.accumTime),
    date: Util.getCurrentTime(),
    wpm: Util.calculateWpm(input.correctCharacterCount, input.accumTime),
    accuracy: Util.calculateAccuracy(input.typedCharacterCount, input.missCount),
    missCount: input.missCount,
    correctCharacterCount: input.correctCharacterCount,
  };
};

/**
 * 作成済みスコアをストアへ保存する。
 *
 * @param gameScoresStore スコア保存ストア
 * @param score 保存するスコア
 */
export const saveGamePageScore = (
  gameScoresStore: GameScoreStore,
  score: GameScore
): void => {
  gameScoresStore.saveGameScoreList(score);
};

/**
 * 今回と同じ条件で遊んだ直近のスコアを取得する。
 *
 * 保存直後の一覧では末尾が今回のスコアになるため、その1件を比較対象から外す。
 * 通常 / タイムアタックや難易度が異なる記録は、単純比較すると意味が薄いため除外する。
 *
 * @param scores 保存済みスコア一覧
 * @param currentScore 今回のスコア
 * @returns 同じ条件の前回スコア。存在しない場合はnull
 */
export const findPreviousComparableScore = (
  scores: GameScore[],
  currentScore: GameScore
): GameScore | null => {
  const lastScore = scores.at(-1);
  const hasCurrentScoreAtEnd =
    lastScore?.date === currentScore.date &&
    lastScore?.score === currentScore.score;
  const candidates = hasCurrentScoreAtEnd ? scores.slice(0, -1) : scores;
  const currentGameRule = Util.getGameRule(currentScore);

  return (
    candidates
      .slice()
      .reverse()
      .find((score) => {
        if (
          score.mode !== currentScore.mode ||
          Util.getGameRule(score) !== currentGameRule
        ) {
          return false;
        }

        if (currentGameRule === "timeAttack") {
          return score.timeLimitSeconds === currentScore.timeLimitSeconds;
        }

        return true;
      }) ?? null
  );
};
