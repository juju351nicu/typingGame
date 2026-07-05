import type {
  GameScore,
  GameScoreResponse,
  SaveGameScoreRequest,
} from "@/types/interfaces";
import Const from "@/constants/const";
import Fetcher from "@/utils/fetchClient";

const SCORE_API_PATH = "/api/scores";
const MY_SCORE_API_PATH = "/api/me/scores";

/**
 * APIのURLを作成する。
 * @param path APIパス
 * @returns API URL
 */
const createApiUrl = (path: string): string => {
  return `${Const.BACKEND_API.BASE_URL}${path}`;
};

/**
 * スコア一覧に新しいスコアを追加する。
 * @param scores 現在のスコア一覧
 * @param score 追加するスコア
 * @returns 追加後のスコア一覧
 */
export const saveGameScore = (
  scores: GameScore[],
  score: GameScore
): GameScore[] => {
  return [...scores, score];
};

/**
 * 保存済みスコアを削除する。
 * @returns 空のスコア一覧
 */
export const deleteGameScores = (): GameScore[] => {
  return [];
};

/**
 * ゲームスコアを保存APIのリクエスト形式へ変換する。
 * @param score ゲームスコア
 * @returns 保存APIリクエスト
 */
export const toSaveGameScoreRequest = (
  score: GameScore
): SaveGameScoreRequest => {
  const { date: _date, ...request } = score;
  return request;
};

/**
 * APIレスポンスを画面・localStorageで扱うゲームスコアへ変換する。
 * @param response ゲームスコアAPIレスポンス
 * @returns ゲームスコア
 */
export const toGameScore = (response: GameScoreResponse): GameScore => {
  const { id: _id, ...score } = response;
  return score;
};

/**
 * スコア保存APIへゲームスコアを保存する。
 * @param score 保存するゲームスコア
 * @returns API保存後のゲームスコア
 */
export const saveGameScoreApi = async (
  score: GameScore
): Promise<GameScore> => {
  const response = await Fetcher.postJson<GameScoreResponse>(
    createApiUrl(SCORE_API_PATH),
    toSaveGameScoreRequest(score)
  );
  return toGameScore(response);
};

/**
 * ログインユーザー別スコア保存APIへゲームスコアを保存する。
 * @param score 保存するゲームスコア
 * @returns API保存後のゲームスコア
 */
export const saveMyGameScoreApi = async (
  score: GameScore
): Promise<GameScore> => {
  const response = await Fetcher.postJson<GameScoreResponse>(
    createApiUrl(MY_SCORE_API_PATH),
    toSaveGameScoreRequest(score)
  );
  return toGameScore(response);
};

/**
 * スコア取得APIから保存済みスコアを取得する。
 * @returns APIから取得したゲームスコア一覧
 */
export const fetchGameScoresApi = async (): Promise<GameScore[]> => {
  const response = await Fetcher.getJson<GameScoreResponse[]>(
    createApiUrl(SCORE_API_PATH)
  );
  return response.map(toGameScore);
};

/**
 * ログインユーザー別スコア取得APIから保存済みスコアを取得する。
 * @returns APIから取得したゲームスコア一覧
 */
export const fetchMyGameScoresApi = async (): Promise<GameScore[]> => {
  const response = await Fetcher.getJson<GameScoreResponse[]>(
    createApiUrl(MY_SCORE_API_PATH)
  );
  return response.map(toGameScore);
};
