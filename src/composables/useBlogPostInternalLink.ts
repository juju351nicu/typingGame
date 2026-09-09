/**
 * 記事本文のリンクURLを、SPA内遷移で使えるパスへ変換する。
 *
 * ブログ記事のMarkdownでは、関連記事を同じディレクトリ内の相対リンクで書いている。
 * v-htmlで描画したaタグはそのままではページ全体の再読み込みになるため、
 * 同一オリジンかつ公開ベースパス配下のリンクだけvue-routerへ渡せる形へ変換する。
 *
 * @param linkUrl クリックされたリンクの絶対URL
 * @param baseUrl アプリの公開ベースパス（import.meta.env.BASE_URL）
 * @param currentOrigin 表示中ページのorigin
 * @returns router.pushへ渡すパス。SPA遷移の対象外ならnull
 */
export const resolveInAppArticlePath = (
  linkUrl: string,
  baseUrl: string,
  currentOrigin: string
): string | null => {
  let url: URL;

  try {
    url = new URL(linkUrl);
  } catch {
    // mailto:のようにhrefを解釈できない場合はブラウザ標準の動作へ任せる。
    return null;
  }

  // GitHubリポジトリなどの外部リンクは、そのままブラウザへ任せる。
  if (url.origin !== currentOrigin) {
    return null;
  }

  // 末尾の"/"有無で判定がぶれないよう、ベースパスの形をそろえる。
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  // 同一オリジンでも、公開ベースパスの外はvue-routerが解決できない。
  if (!url.pathname.startsWith(normalizedBase)) {
    return null;
  }

  // 先頭の"/"を残したまま、ベースパス部分だけを取り除く。
  // 例: base="/typingGame/" のとき "/typingGame/guide/post" -> "/guide/post"
  const inAppPath = url.pathname.slice(normalizedBase.length - 1);

  // クエリとハッシュは、記事内アンカーを維持するためそのまま引き継ぐ。
  return `${inAppPath}${url.search}${url.hash}`;
};

/**
 * 記事本文のクリックを受け取り、内部リンクだけSPA遷移へ振り替える。
 *
 * 記事本文はv-htmlで描画するため個別のaタグへハンドラーを付けられない。
 * そのため本文要素側でクリックを受け取り、内部リンクかどうかを判定する。
 * aタグはキーボードフォーカスでEnterを押してもclickが発生するため、
 * マウス操作とキーボード操作の両方をこの1箇所で扱える。
 *
 * @param navigate 内部リンクと判定したときに呼ぶ遷移処理
 * @param baseUrl アプリの公開ベースパス（import.meta.env.BASE_URL）
 * @returns 記事本文要素へ登録するclickハンドラー
 */
export const createArticleLinkClickHandler = (
  navigate: (path: string) => void,
  baseUrl: string
) => {
  return (event: MouseEvent): void => {
    // 新しいタブで開く操作や、他の処理が扱ったクリックには介入しない。
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest("a");

    if (
      !anchor ||
      anchor.target === "_blank" ||
      anchor.hasAttribute("download")
    ) {
      return;
    }

    const inAppPath = resolveInAppArticlePath(
      anchor.href,
      baseUrl,
      window.location.origin
    );

    if (!inAppPath) {
      return;
    }

    event.preventDefault();
    navigate(inAppPath);
  };
};
