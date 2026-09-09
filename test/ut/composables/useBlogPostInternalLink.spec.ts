// @vitest-environment jsdom

import {
  createArticleLinkClickHandler,
  resolveInAppArticlePath,
} from "@/composables/useBlogPostInternalLink";
import { describe, expect, it, vi } from "vitest";

/**
 * 記事本文要素とリンクを組み立て、クリックイベントを発火させる。
 *
 * @param attributes aタグへ設定する属性
 * @param eventInit clickイベントの初期値
 * @returns 遷移処理のモックと、ハンドラーがブラウザ動作を止めたかどうか
 */
const clickArticleLink = (
  attributes: Record<string, string>,
  eventInit: MouseEventInit = {}
) => {
  const body = document.createElement("div");
  const anchor = document.createElement("a");

  Object.entries(attributes).forEach(([name, value]) => {
    anchor.setAttribute(name, value);
  });
  body.appendChild(anchor);

  const navigate = vi.fn();
  let isDefaultPrevented = false;

  body.addEventListener("click", createArticleLinkClickHandler(navigate, "/"));
  body.addEventListener("click", (event) => {
    isDefaultPrevented = event.defaultPrevented;
    // 判定後は、jsdomが未実装の画面遷移を試みないようブラウザ動作を止める。
    event.preventDefault();
  });

  anchor.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, ...eventInit })
  );

  return { isDefaultPrevented, navigate };
};

describe("resolveInAppArticlePath", () => {
  it("公開ベースパス配下のリンクをSPA内パスへ変換する", () => {
    expect(
      resolveInAppArticlePath(
        "https://example.github.io/typingGame/guide/other-post",
        "/typingGame/",
        "https://example.github.io"
      )
    ).toBe("/guide/other-post");
  });

  it("ベースパスが/の開発環境でもSPA内パスへ変換する", () => {
    expect(
      resolveInAppArticlePath(
        "http://localhost:8081/guide/other-post#matome",
        "/",
        "http://localhost:8081"
      )
    ).toBe("/guide/other-post#matome");
  });

  it("別オリジンのリンクは変換しない", () => {
    expect(
      resolveInAppArticlePath(
        "https://github.com/juju351nicu/typingGame",
        "/typingGame/",
        "https://example.github.io"
      )
    ).toBeNull();
  });

  it("公開ベースパス外のリンクは変換しない", () => {
    expect(
      resolveInAppArticlePath(
        "https://example.github.io/other-app/guide/other-post",
        "/typingGame/",
        "https://example.github.io"
      )
    ).toBeNull();
  });

  it("URLとして解釈できないhrefは変換しない", () => {
    expect(
      resolveInAppArticlePath(
        "mailto:test@example.com",
        "/",
        "http://localhost"
      )
    ).toBeNull();
  });
});

describe("createArticleLinkClickHandler", () => {
  it("内部リンクのクリックはSPA遷移へ振り替える", () => {
    const { isDefaultPrevented, navigate } = clickArticleLink({
      href: "/guide/other-post",
    });

    expect(navigate).toHaveBeenCalledWith("/guide/other-post");
    expect(isDefaultPrevented).toBe(true);
  });

  it("別タブで開くリンクはブラウザ標準の動作へ任せる", () => {
    const { isDefaultPrevented, navigate } = clickArticleLink({
      href: "/guide/other-post",
      target: "_blank",
    });

    expect(navigate).not.toHaveBeenCalled();
    expect(isDefaultPrevented).toBe(false);
  });

  it("修飾キーを押したクリックはブラウザ標準の動作へ任せる", () => {
    const { isDefaultPrevented, navigate } = clickArticleLink(
      { href: "/guide/other-post" },
      { ctrlKey: true }
    );

    expect(navigate).not.toHaveBeenCalled();
    expect(isDefaultPrevented).toBe(false);
  });

  it("aタグ以外のクリックでは遷移しない", () => {
    const body = document.createElement("div");
    const paragraph = document.createElement("p");

    body.appendChild(paragraph);

    const navigate = vi.fn();

    body.addEventListener(
      "click",
      createArticleLinkClickHandler(navigate, "/")
    );
    paragraph.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(navigate).not.toHaveBeenCalled();
  });
});
