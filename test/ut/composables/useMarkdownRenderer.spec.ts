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

  it("未対応言語のコードブロックもHTMLへ変換する", () => {
    const html = renderMarkdown("```unknown\nsample\n```");

    expect(html).toContain("<pre>");
    expect(html).toContain("sample");
  });
});
