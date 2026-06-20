import { sanitize } from "@markdown-design/markdown-it-sanitize";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.min.css";
import MarkdownIt from "markdown-it";

/**
 * MarkdownをHTMLへ変換する markdown-it インスタンス。
 *
 * BlogPost.vue から Markdown 変換設定を切り離し、ブログ記事の表示仕様を
 * このファイルに集約する。
 */
const markdownIt: MarkdownIt = new MarkdownIt({
  html: true,
  /**
   * fenced code block のシンタックスハイライトを行う。
   *
   * 未対応言語やハイライト失敗時は markdown-it の標準出力へ戻すため、
   * 空文字を返して本文表示を継続する。
   *
   * @param sourceCode コードブロック本文
   * @param language Markdown側で指定された言語名
   * @returns highlight.js が生成したHTML、または空文字
   */
  highlight: (sourceCode: string, language: string) => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(sourceCode, { language }).value;
      } catch (error) {
        // ハイライト失敗だけで記事全体の表示を止めない。
        return "";
      }
    }

    return "";
  },
});

// YouTube埋め込み記事を表示できるよう、必要なiframe属性だけ許可する。
markdownIt.use(sanitize, {
  ADD_TAGS: ["iframe"],
  ADD_ATTR: [
    "allow",
    "allowfullscreen",
    "frameborder",
    "scrolling",
    "src",
    "width",
    "height",
    "style",
  ],
});

/**
 * Markdown本文をブログ詳細画面で表示するHTMLへ変換する。
 *
 * markdown-it の設定、コードハイライト、許可するHTMLタグの管理を
 * 画面コンポーネントから切り離し、BlogPost.vue を記事取得と遷移に集中させる。
 *
 * @param markdown Markdown本文
 * @returns サニタイズ済みのHTML文字列
 */
export const renderMarkdown = (markdown: string): string => {
  return markdownIt.render(markdown);
};
