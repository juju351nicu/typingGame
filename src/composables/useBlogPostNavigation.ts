import type { PostIndex } from "@/types/interfaces";

export interface BlogPostNavigation {
  currentIndex: number;
  prevPost: PostIndex | null;
  nextPost: PostIndex | null;
}

/**
 * 記事一覧の順序を基準に、現在の記事と前後の記事を取得する。
 *
 * @param posts posts_index.json 由来の記事一覧
 * @param currentId 現在表示している記事ID
 * @param currentSection 現在表示している記事セクション
 * @returns 現在位置、前の記事、次の記事
 */
export const getBlogPostNavigation = (
  posts: PostIndex[],
  currentId: string,
  currentSection: string
): BlogPostNavigation => {
  const currentIndex = posts.findIndex((post) => {
    return post.id === currentId && post.section === currentSection;
  });

  return {
    currentIndex,
    prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    nextPost:
      currentIndex >= 0 && currentIndex < posts.length - 1
        ? posts[currentIndex + 1]
        : null,
  };
};
