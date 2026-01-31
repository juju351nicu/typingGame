/** コピーライトのインターフェ-ス */
export interface copyRight {
  title: string;
  icon: string;
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
