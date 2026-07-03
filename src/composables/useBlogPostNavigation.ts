import type { PostIndex } from "@/types/interfaces";

export interface BlogPostNavigation {
  /** 現在の記事が posts-index.json の何番目にあるか */
  currentIndex: number;
  /** 現在の記事より1つ前の記事。先頭記事の場合はnull */
  prevPost: PostIndex | null;
  /** 現在の記事より1つ後の記事。末尾記事の場合はnull */
  nextPost: PostIndex | null;
}

/**
 * 記事一覧の順序を基準に、現在の記事と前後の記事を取得する。
 *
 * @param posts posts-index.json 由来の記事一覧
 * @param currentId 現在表示している記事ID
 * @param currentSection 現在表示している記事セクション
 * @returns 現在位置、前の記事、次の記事
 */
export const getBlogPostNavigation = (
  posts: PostIndex[],
  currentId: string,
  currentSection: string
): BlogPostNavigation => {
  // id と section の組み合わせで、現在表示中の記事を特定する。
  const currentIndex = posts.findIndex((post) => {
    return post.id === currentId && post.section === currentSection;
  });

  return {
    currentIndex,
    // 配列順をそのまま前後ナビゲーションの基準にする。
    prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    nextPost:
      currentIndex >= 0 && currentIndex < posts.length - 1
        ? posts[currentIndex + 1]
        : null,
  };
};
