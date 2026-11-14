import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import http from "highlight.js/lib/languages/http";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import "highlight.js/styles/github-dark.min.css";
import MarkdownIt from "markdown-it";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("http", http);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);

/** 記事で使うコードフェンス名とhighlight.jsの言語名の差分。 */
const HIGHLIGHT_LANGUAGE_ALIASES: Readonly<Record<string, string>> = {
  vue: "xml",
};

/**
 * Markdownのコードフェンス言語名をhighlight.js用に整える。
 *
 * `javascript:package.json` のようにファイル名を付けている場合は、
 * コロンより前の言語名だけを使ってハイライトする。
 *
 * @param language Markdownコードフェンスの言語名
 * @returns highlight.jsへ渡す言語名
 */
const normalizeHighlightLanguage = (language: string): string => {
  const normalizedLanguage = language.split(":")[0].trim().toLowerCase();
  return HIGHLIGHT_LANGUAGE_ALIASES[normalizedLanguage] ?? normalizedLanguage;
};

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
    const normalizedLanguage = normalizeHighlightLanguage(language);

    if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
      try {
        return hljs.highlight(sourceCode, {
          language: normalizedLanguage,
        }).value;
      } catch {
        // ハイライト失敗だけで記事全体の表示を止めない。
        return "";
      }
    }

    return "";
  },
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
  return DOMPurify.sanitize(markdownIt.render(markdown), {
    FORBID_TAGS: ["iframe"],
    FORBID_ATTR: ["style"],
  });
};
