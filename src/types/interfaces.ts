/** コピーライトのインターフェ-ス */
export interface CopyRightType {
  company: string;
  copyRight: string;
  dateStr: string;
}
/** プライバシーポリシーのインターフェ-ス */
export interface PrivacyPolicy {
  title: string;
  link: string;
}
/** アラートのインターフェ-ス */
export interface Alert {
  id?: number;
  message: string;
  type?: "success" | "info" | "warning" | "error" | undefined;
}
/** ゲームルールの種類 */
export type GameRule = "normal" | "timeAttack";

/** ゲーム難易度の種類。BEのGameModeEnumと同じ外向き値です。 */
export type GameMode = 0 | 1 | 2;

/** タイムアタックの制限時間（秒） */
export type TimeLimitSeconds = 30 | 60 | 90;

/** ゲームスコアの基本項目 */
export interface GameScoreBase {
  time: string;
  score: number;
  mode: GameMode;
  gameRule?: GameRule;
  timeLimitSeconds?: TimeLimitSeconds;
  wpm?: number;
  accuracy?: number;
  missCount?: number;
  correctCharacterCount?: number;
}

/** ゲームスコア保存APIのリクエスト */
export interface SaveGameScoreRequest extends GameScoreBase {}

/** ゲームスコアAPIのレスポンス */
export interface GameScoreResponse extends GameScoreBase {
  id?: number;
  date: string;
}

/** ランキング取得APIの検索条件 */
export interface RankingQuery {
  mode?: GameMode | null;
  gameRule?: GameRule | null;
  timeLimitSeconds?: TimeLimitSeconds | null;
  limit?: number | null;
}

/** ゲームスコアのインターフェ-ス */
export interface GameScore extends GameScoreBase {
  date: string;
}
/** ログインユーザー情報 */
export interface LoginUser {
  id: number;
  loginEmail: string;
}
/** ユーザー登録APIのリクエスト */
export interface RegisterUserRequest {
  loginEmail: string;
  password: string;
}
/** ログインAPIのリクエスト */
export interface LoginRequest {
  loginEmail: string;
  password: string;
}
/** ログインAPIのレスポンス */
export interface LoginResponse {
  user: LoginUser;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
}
/** APIエラー時のフィールド単位エラー */
export interface CustomFieldError {
  errorCode?: string;
  field?: string;
  message: string;
}
/** APIエラー時の共通レスポンス */
export interface ErrorResponse {
  fieldErrors?: CustomFieldError[];
}
/** ランキング表示用スコアのインターフェース */
export interface RankingScore extends GameScore {
  rank: number;
  resultRank: string;
}
/** パフォーマンス推移グラフの指標 */
export type PerformanceTrendMetric = "score" | "wpm" | "accuracy";

/** パフォーマンス推移グラフ表示用データ */
export interface PerformanceTrendItem extends GameScore {
  barRatio: number;
  metricValue: number;
  playNumber: number;
}
export interface Item {
  title: string;
  value: GameMode;
}
/** JSON記事情報のインターフェ-ス */
export interface PostIndex {
  /**日付 */
  date: string;
  /**詳細 */
  description: string;
  id: string;
  section: string;
  /**タイトル */
  title: string;
  url: string;
}
/** 表示中単語の位置指定スタイル */
export interface CurrentWordStyle {
  left: string;
  top: string;
}
/** 表示するタイピングの単語のインターフェ-ス */
export interface CurrentWord {
  characters: string[];
  classList: string[];
  style: CurrentWordStyle;
  balloonClass: string;
  isBursting?: boolean;
}
