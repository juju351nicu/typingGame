import { removeFrontmatter } from "@/utils/markdownUtils";
import { describe, expect, it } from "vitest";

describe("removeFrontmatter", () => {
  it("frontmatterがあるMarkdownからfrontmatterだけ除去する", () => {
    const markdown = "---\ntitle: Test\nsection: guide\n---\n# Title";

    expect(removeFrontmatter(markdown)).toBe("# Title");
  });

  it("frontmatterがないMarkdownはそのまま返す", () => {
    const markdown = "# Title\n\n本文です。";

    expect(removeFrontmatter(markdown)).toBe(markdown);
  });

  it("CRLFのfrontmatterも除去する", () => {
    const markdown = "---\r\ntitle: Test\r\n---\r\n# Title";

    expect(removeFrontmatter(markdown)).toBe("# Title");
  });

  it("本文中の区切り線は削除しない", () => {
    const markdown = "---\ntitle: Test\n---\n# Title\n\n---\n\n本文です。";

    expect(removeFrontmatter(markdown)).toBe("# Title\n\n---\n\n本文です。");
  });
});
