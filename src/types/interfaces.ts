/** コピーライトのインターフェ-ス */
export interface copyRightType {
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
  message: string;
  type?: "success" | "info" | "warning" | "error" | undefined;
}
/** ゲームスコアのインターフェ-ス */
export interface GameScore {
  time: string;
  score: number;
  mode: number;
  date: string;
}
export interface Item {
  title: string;
  value: number;
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
/** 表示するタイピングの単語のインターフェ-ス */
export interface currentWord {
  characters: string[];
  classList: string[];
  style: any;
}
