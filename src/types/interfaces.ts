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
/** 表の列定義 */
export interface DataTableHeader {
  /** 見出しに表示する文字列 */
  title: string;
  /** 行データから値を取り出すキー */
  key: string;
  /** セル内の配置 */
  align?: "start" | "center" | "end";
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
export type SaveGameScoreRequest = GameScoreBase;

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

/** ページ単位のランキング取得APIの検索条件 */
export interface RankingPageQuery extends Omit<RankingQuery, "limit"> {
  /** ページ番号（1始まり） */
  page: number;
  /** 1ページあたりの件数 */
  size: number;
}

/** ページ単位のランキング取得APIのレスポンス */
export interface RankingPageResponse {
  items: GameScoreResponse[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

/** 画面で扱うページ単位のランキング */
export interface RankingPage {
  items: GameScore[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

/** ゲームスコアのインターフェ-ス */
export interface GameScore extends GameScoreBase {
  date: string;
}
/** ユーザー権限。BEのUserRoleと同じ外向き値です。 */
export type UserRole = "user" | "admin";

/** ログインユーザー情報 */
export interface LoginUser {
  id: number;
  loginEmail: string;
  /** ユーザー権限。管理者だけがお知らせ管理画面を使える */
  role: UserRole;
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
/** お知らせの種類。現時点では運営からのお知らせだけを扱う */
export type NotificationCategory = "announce";

/** ログインユーザー向けお知らせ取得APIのレスポンス */
export interface NotificationResponse {
  id: number;
  category: NotificationCategory;
  title: string;
  body: string;
  /** お知らせから遷移するアプリ内パス。遷移先がない場合はnull */
  linkPath: string | null;
  /** 作成日時（yyyy-MM-dd HH:mm:ss） */
  createdAt: string;
  /** 未読の場合true */
  unread: boolean;
}

/** 未読お知らせ件数取得APIのレスポンス */
export type NotificationUnreadCountResponse = Record<
  NotificationCategory,
  number
>;

/** お知らせ既読化APIのリクエスト */
export interface NotificationMarkReadRequest {
  category: NotificationCategory;
}

/** 管理者向けお知らせ送信APIのリクエスト */
export interface AdminNotificationRequest {
  title: string;
  body: string;
  /** "/" から始まるアプリ内パス。遷移先がない場合はnull */
  linkPath?: string | null;
  /** 送信先ユーザーID。nullの場合は全ユーザー */
  userId?: number | null;
}

/** 管理者向けお知らせ送信・一覧APIのレスポンス */
export interface AdminNotificationResponse {
  id: number;
  category: NotificationCategory;
  /** 送信先ユーザーID。全ユーザー宛ての場合はnull */
  userId: number | null;
  title: string;
  body: string;
  linkPath: string | null;
  /** 作成日時（yyyy-MM-dd HH:mm:ss） */
  createdAt: string;
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
  /** 記事で扱う技術タグ */
  tags?: string[];
  /**タイトル */
  title: string;
  url: string;
}
/** 表示中単語の位置指定スタイル */
export interface CurrentWordStyle extends CSSProperties {
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
import type { CSSProperties } from "vue";
