// コピーライトインターフェ-ス
export interface copyRight {
  title: string;
  icon: string;
  dateStr: string;
}
// プライバシーポリシーのインターフェ-ス
export interface PrivacyPolicy {
  title: string;
  link: string;
}
// アラートのインターフェ-ス
export interface Alert {
  message: string;
  type?: "success" | "info" | "warning" | "error" | undefined
}