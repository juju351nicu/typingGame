import { useTypingWordSpawner } from "@/composables/useTypingWordSpawner";
import type { CurrentWord } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const createBoard = (width: number, height: number): HTMLElement => {
  return {
    offsetWidth: width,
    offsetHeight: height,
  } as HTMLElement;
};

const createCurrentWord = (): CurrentWord => ({
  characters: ["t", "e", "s", "t"],
  classList: ["", "", "", ""],
  style: {
    left: "0px",
    top: "0px",
  },
  balloonClass: "balloon-red",
});

describe("useTypingWordSpawner", () => {
  it("表示エリアのサイズから単語追加位置を決め、追加できた場合だけ次キーを更新する", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const addTypingWord = vi.fn(() => createCurrentWord());
    const updateNextKey = vi.fn();
    const wordsBoard = ref<HTMLElement | null>(createBoard(900, 320));

    const { addWord } = useTypingWordSpawner({
      wordsBoard,
      defaultBalloonWidth: () => 100,
      addTypingWord,
      updateNextKey,
    });

    expect(addWord()).not.toBeNull();
    expect(addTypingWord).toHaveBeenCalledWith(400, 320);
    expect(updateNextKey).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it("追加する単語がない場合は次キーを更新しない", () => {
    const addTypingWord = vi.fn(() => null);
    const updateNextKey = vi.fn();
    const wordsBoard = ref<HTMLElement | null>(createBoard(500, 320));

    const { addWord } = useTypingWordSpawner({
      wordsBoard,
      defaultBalloonWidth: () => 100,
      addTypingWord,
      updateNextKey,
    });

    expect(addWord()).toBeNull();
    expect(updateNextKey).not.toHaveBeenCalled();
  });

  it("表示エリアが未取得の場合は左端と高さ0で単語を追加する", () => {
    const addTypingWord = vi.fn(() => createCurrentWord());
    const updateNextKey = vi.fn();
    const wordsBoard = ref<HTMLElement | null>(null);

    const { addWord } = useTypingWordSpawner({
      wordsBoard,
      defaultBalloonWidth: () => 100,
      addTypingWord,
      updateNextKey,
    });

    expect(addWord()).not.toBeNull();
    expect(addTypingWord).toHaveBeenCalledWith(0, 0);
    expect(updateNextKey).toHaveBeenCalledTimes(1);
  });

  it("狭い表示エリアではレスポンシブ用の風船幅を使う", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const addTypingWord = vi.fn(() => createCurrentWord());
    const wordsBoard = ref<HTMLElement | null>(createBoard(480, 240));

    const { addWord, getBalloonWidth } = useTypingWordSpawner({
      wordsBoard,
      defaultBalloonWidth: () => 200,
      addTypingWord,
      updateNextKey: vi.fn(),
    });

    expect(getBalloonWidth()).toBe(120);
    expect(addWord()).not.toBeNull();
    expect(addTypingWord).toHaveBeenCalledWith(180, 240);

    vi.restoreAllMocks();
  });
});
