import type { DataTableHeader } from "vuetify";
import type { GameMode, GameRule, TimeLimitSeconds } from "@/types/interfaces";

/**
 * マークダウンブログ取得用のURL
 */
const BLOG_PATH = {
  POST_INDEX: `${import.meta.env.BASE_URL}blog_store/posts-index.json`,
  POST_FOLDER: `${import.meta.env.BASE_URL}blog_store/posts/`,
};

/** ブログリストの1ページあたりの表示件数（デフォルト）*/
const NUMBER_OF_BLOGS = 4;

/** テーマの背色 */
const DISPLAY_THEME = {
  LIGHT: "light",
  DARK: "dark",
};
/**
 * アラートの種類の定数
 */
const ALERT_TYPE = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
} as const;
/** 単語挿入の速度 */
const INTERVAL_INSERTION = {
  EASY: 4000,
  NORMAL: 3000,
  HARD: 2000,
};
/** アニメーションの速度*/
const INTERVAL_ANIMATION = {
  EASY: 15,
  NORMAL: 10,
  HARD: 5,
};
/** ゲーム難易度の種類 */
const GAME_MODE = {
  EASY: 0,
  NORMAL: 1,
  HARD: 2,
} as const satisfies Record<string, GameMode>;

/** ゲーム難易度の選択リスト */
const DIFFICULTY_LEVEL: { title: string; value: GameMode }[] = [
  { title: "Easy", value: GAME_MODE.EASY },
  { title: "Normal", value: GAME_MODE.NORMAL },
  { title: "Hard", value: GAME_MODE.HARD },
];

/** ゲーム終了条件の種類 */
const GAME_RULE = {
  NORMAL: "normal",
  TIME_ATTACK: "timeAttack",
} as const satisfies Record<string, GameRule>;

/** ゲームルールの選択リスト */
const GAME_RULE_OPTIONS: { title: string; value: GameRule }[] = [
  { title: "通常モード", value: GAME_RULE.NORMAL },
  { title: "タイムアタック", value: GAME_RULE.TIME_ATTACK },
];

/** タイムアタックの制限時間選択リスト */
const TIME_ATTACK_LIMITS: { title: string; value: TimeLimitSeconds }[] = [
  { title: "30秒", value: 30 },
  { title: "60秒", value: 60 },
  { title: "90秒", value: 90 },
];
/** data-tableの1ページあたりの表示件数（デフォルト）*/
const NUMBER_OF_ITEMS = 5;

/** data-tableの表示件数の選択リスト */
const DATA_TABLE_PAGES = [
  { value: 5, title: "5" },
  { value: 10, title: "10" },
  { value: 20, title: "20" },
  { value: -1, title: "$vuetify.dataFooter.itemsPerPageAll" },
];

const OPTIONS_OF_HEADERS: DataTableHeader[] = [
  { title: "ゲームの難易度", align: "start", key: "mode" },
  { title: "タイム", align: "start", key: "time" },
  { title: "スコア", align: "end", key: "score" },
  { title: "日付", align: "end", key: "date" },
];

const DATE_FORMAT = {
  STANDARD_DATE: "YYYY/MM/DD",
  STANDARD_DATE_TIME: "YYYY-MM-DD HH:mm:ss",
};

/** バックエンドAPI接続に関する設定 */
const BACKEND_API = {
  /** バックエンドAPIを有効にするか */
  ENABLED: import.meta.env.VITE_ENABLE_BACKEND_API === "true",
  /** バックエンドAPIのベースURL */
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:8091",
};

export default {
  BLOG_PATH,
  NUMBER_OF_BLOGS,
  DISPLAY_THEME,
  ALERT_TYPE,
  INTERVAL_ANIMATION,
  INTERVAL_INSERTION,
  GAME_MODE,
  DIFFICULTY_LEVEL,
  GAME_RULE,
  GAME_RULE_OPTIONS,
  TIME_ATTACK_LIMITS,
  NUMBER_OF_ITEMS,
  DATA_TABLE_PAGES,
  OPTIONS_OF_HEADERS,
  DATE_FORMAT,
  BACKEND_API,
};
