/** E2Eテスト用の開発サーバーのポート。普段の開発サーバー（8081）と衝突しないよう分ける */
export const E2E_PORT = 4173;

/** ビルド時のベースパス。GitHub Pagesのリポジトリ名と同じ（vite.config.mjsのbase） */
export const E2E_BASE_PATH = "/typingGame/";

/**
 * E2Eテストで使うバックエンドAPIのURL。
 *
 * index.htmlのContent-Security-Policy（connect-src）で許可済みのローカルAPIのURLを使う。
 * 本番と同じくAPI連携を有効にしたまま、すべてのリクエストをpage.routeで差し替えるため、
 * ローカルでSpring Bootを起動していても実際のAPIへは届かない。
 */
export const E2E_API_BASE_URL = "http://localhost:8091";
