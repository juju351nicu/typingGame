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
};
/** 単語挿入の速度 */
const INTERVAL_INSERTION = {
  EASY: 4000,
  NORMAL: 3000,
  HARD: 2000,
};
/** アニメーションの速度*/
const INTERVAL_ANIMATION = {
  EASY: 60,
  NORMAL: 30,
  HARD: 15,
};
/** ゲーム難易度の選択リスト */
const DIFFICULTY_LEVEL = [
  { title: "Easy", value: 0 },
  { title: "Normal", value: 1 },
  { title: "Hard", value: 2 },
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

const OPTIONS_OF_HEADERS = [
  { title: "ゲームの難易度", align: "start", key: "mode" },
  { title: "タイム", align: "start", key: "time" },
  { title: "スコア", align: "end", key: "score" },
  { title: "日付", align: "end", key: "date" },
];

const DATE_FORMAT = {
  STANDARD_DATE: "YYYY/MM/DD",
  STANDARD_DATE_TIME: "YYYY-MM-DD HH:mm:ss",
};

export default {
  DISPLAY_THEME,
  ALERT_TYPE,
  INTERVAL_ANIMATION,
  INTERVAL_INSERTION,
  DIFFICULTY_LEVEL,
  NUMBER_OF_ITEMS,
  DATA_TABLE_PAGES,
  OPTIONS_OF_HEADERS,
  DATE_FORMAT
};
