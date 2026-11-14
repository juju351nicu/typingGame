// @vitest-environment jsdom

import { renderMarkdown } from "@/composables/useMarkdownRenderer";
import { describe, expect, it } from "vitest";

describe("useMarkdownRenderer", () => {
  it("Markdown見出しをHTMLへ変換する", () => {
    expect(renderMarkdown("# Title")).toContain("<h1>Title</h1>");
  });

  it("コードブロックをハイライト用HTMLへ変換する", () => {
    const html = renderMarkdown("```ts\nconst value = 1;\n```");

    expect(html).toContain("<pre>");
    expect(html).toContain("const");
    expect(html).toContain("value");
  });

  it("ファイル名付きコードブロックも言語名部分でハイライトする", () => {
    const html = renderMarkdown(
      "```javascript:package.json\nconst value = 1;\n```"
    );

    expect(html).toContain("<pre>");
    expect(html).toContain("const");
    expect(html).toContain("value");
  });

  it.each([
    ["css", ".sample { color: red; }"],
    ["vue", '<template><p class="sample">text</p></template>'],
    ["json", '{"enabled":true}'],
    ["http", "GET /api/scores HTTP/1.1"],
    ["sql", "SELECT score FROM game_score;"],
    ["java", "public class Sample {}"],
  ])("記事で使う%sコードブロックをハイライトする", (language, code) => {
    const html = renderMarkdown(`\`\`\`${language}\n${code}\n\`\`\``);

    expect(html).toContain('class="hljs');
    expect(html).toContain("<span");
  });

  it("未対応言語のコードブロックもHTMLへ変換する", () => {
    const html = renderMarkdown("```unknown\nsample\n```");

    expect(html).toContain("<pre>");
    expect(html).toContain("sample");
  });

  describe("サニタイズ", () => {
    it.each([
      ["<script>alert(1)</script>", "<script"],
      ['<img src="x" onerror="alert(1)">', "onerror"],
      ['<svg onload="alert(1)"></svg>', "onload"],
      ['<div onclick="alert(1)">click</div>', "onclick"],
      ['<div style="position: fixed">cover</div>', "style="],
      ['<a href="javascript:alert(1)">link</a>', "javascript:"],
    ])("危険な入力から %s を除去する", (markdown, forbiddenValue) => {
      expect(renderMarkdown(markdown).toLowerCase()).not.toContain(
        forbiddenValue
      );
    });

    it("iframeを許可しない", () => {
      const html = renderMarkdown(
        '<iframe src="https://example.com/embed"></iframe>'
      );

      expect(html).not.toContain("iframe");
    });

    it("同一originのPlaywright動画を表示するvideo要素を維持する", () => {
      const html = renderMarkdown(`
<video controls preload="metadata" aria-label="回帰テスト動画">
  <source src="../videos/showcase.webm" type="video/webm">
</video>
      `);

      expect(html).toContain("<video");
      expect(html).toContain("controls");
      expect(html).toContain('src="../videos/showcase.webm"');
      expect(html).toContain('type="video/webm"');
    });

    it("インラインHTMLと同じ段落にあるリンクと画像を維持する", () => {
      const html = renderMarkdown(
        "[docs](https://example.com) and ![logo](logo.png) with <b>bold</b>"
      );

      expect(html).toContain('<a href="https://example.com">docs</a>');
      expect(html).toContain('<img src="logo.png" alt="logo">');
      expect(html).toContain("<b>bold</b>");
    });
  });
});
