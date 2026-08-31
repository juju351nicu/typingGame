import { useTypingGameWords } from "@/composables/useTypingGameWords";
import { describe, expect, it, vi } from "vitest";

describe("useTypingGameWords", () => {
  it("指定位置に次の単語を追加する", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { currentWords, currentWordIndex, addWord } = useTypingGameWords([
      "home",
      "line",
    ]);

    const addedWord = addWord(24, 120);

    expect(addedWord?.characters).toEqual(["h", "o", "m", "e"]);
    expect(addedWord?.style).toEqual({
      left: "24px",
      top: "120px",
    });
    expect(currentWords.value).toHaveLength(1);
    expect(currentWordIndex.value).toBe(1);

    vi.restoreAllMocks();
  });

  it("すべての単語を追加済みの場合は単語を追加しない", () => {
    const { currentWords, addWord, isAddedAllWords } = useTypingGameWords([
      "home",
    ]);

    expect(addWord(0, 100)).not.toBeNull();
    expect(addWord(0, 100)).toBeNull();

    expect(currentWords.value).toHaveLength(1);
    expect(isAddedAllWords()).toBe(true);
  });

  it("指定した単語を表示中リストから削除する", () => {
    const { currentWords, addWord, removeWord } = useTypingGameWords(["home"]);
    const addedWord = addWord(0, 100);

    removeWord(addedWord!);

    expect(currentWords.value).toHaveLength(0);
  });

  it("すべての単語を追加し表示中単語がない場合にゲーム完了と判定する", () => {
    const { addWord, removeWord, isGameCompleted } = useTypingGameWords([
      "home",
    ]);
    const addedWord = addWord(0, 100);

    expect(isGameCompleted()).toBe(false);

    removeWord(addedWord!);

    expect(isGameCompleted()).toBe(true);
  });

  it("表示中単語と出題インデックスをリセットする", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const { currentWords, currentWordIndex, addWord, resetWords } =
      useTypingGameWords(["home", "line"]);

    addWord(0, 100);
    resetWords();

    expect(currentWords.value).toHaveLength(0);
    expect(currentWordIndex.value).toBe(0);

    vi.restoreAllMocks();
  });
});
