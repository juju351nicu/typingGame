/**
 * Markdown本文から記事管理用のfrontmatterを取り除く。
 * @param markdown Markdown本文
 * @returns 表示用Markdown本文
 */
export const removeFrontmatter = (markdown: string): string => {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
};
