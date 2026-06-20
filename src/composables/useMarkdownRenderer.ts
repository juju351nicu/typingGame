import { sanitize } from "@markdown-design/markdown-it-sanitize";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.min.css";
import MarkdownIt from "markdown-it";

const markdownIt: MarkdownIt = new MarkdownIt({
  html: true,
  highlight: (sourceCode: string, language: string) => {
    if (language && hljs.getLanguage(language)) {
      try {
        return hljs.highlight(sourceCode, { language }).value;
      } catch (error) {
        return "";
      }
    }

    return "";
  },
});

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
