import { useTypingPanelWatchers } from "@/composables/useTypingPanelWatchers";
import type { CurrentWord } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

const createWord = (word: string): CurrentWord => ({
  characters: word.split(""),
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: "100px",
  },
});

const createOptions = () => ({
  isGameStartedFlag: ref(false),
  isResetFlag: ref(false),
  typeBoxValue: ref(""),
  currentWords: ref<CurrentWord[]>([createWord("home")]),
  isGameOverFlag: ref(false),
  typedCharacterCount: ref(0),
  missCount: ref(0),
  isInputMiss: ref(false),
  stopTimers: vi.fn(),
  saveGameMode: vi.fn(),
  startTimers: vi.fn(),
  addWord: vi.fn(),
  moveWords: vi.fn(),
  checkGameOver: vi.fn(),
  getAddWordInterval: vi.fn(() => 1000),
  getMoveWordInterval: vi.fn(() => 16),
  resetWords: vi.fn(),
  updateNextKey: vi.fn(),
  checkWordEquality: vi.fn(),
  checkCharacter: vi.fn(),
});

describe("useTypingPanelWatchers", () => {
  it("ゲーム開始時に開始処理とタイマー開始を実行する", async () => {
    const options = createOptions();
    useTypingPanelWatchers(options);

    options.isGameStartedFlag.value = true;
    await nextTick();

    expect(options.stopTimers).toHaveBeenCalledTimes(1);
    expect(options.saveGameMode).toHaveBeenCalledTimes(1);
    expect(options.addWord).toHaveBeenCalledTimes(1);
    expect(options.startTimers).toHaveBeenCalledWith({
      addWord: options.addWord,
      moveWords: options.moveWords,
      checkGameOver: options.checkGameOver,
      addWordInterval: 1000,
      moveWordInterval: 16,
    });
  });

  it("ゲーム停止時にタイマーを停止する", async () => {
    const options = createOptions();
    options.isGameStartedFlag.value = true;
    useTypingPanelWatchers(options);

    options.isGameStartedFlag.value = false;
    await nextTick();

    expect(options.stopTimers).toHaveBeenCalledTimes(1);
  });

  it("入力変更時に入力数と完了判定とフィードバックを更新する", async () => {
    const options = createOptions();
    options.typeBoxValue.value = "h";
    useTypingPanelWatchers(options);

    options.typeBoxValue.value = "ho";
    await nextTick();

    expect(options.typedCharacterCount.value).toBe(1);
    expect(options.missCount.value).toBe(0);
    expect(options.isInputMiss.value).toBe(false);
    expect(options.checkWordEquality).toHaveBeenCalledWith("ho");
    expect(options.checkCharacter).toHaveBeenCalledWith("ho");
    expect(options.updateNextKey).toHaveBeenCalledTimes(1);
  });

  it("リセット時にタイマー停止、単語初期化、ミス状態解除、次キー更新を実行する", async () => {
    const options = createOptions();
    options.isInputMiss.value = true;
    useTypingPanelWatchers(options);

    options.isResetFlag.value = true;
    await nextTick();

    expect(options.stopTimers).toHaveBeenCalledTimes(1);
    expect(options.resetWords).toHaveBeenCalledTimes(1);
    expect(options.isInputMiss.value).toBe(false);
    expect(options.updateNextKey).toHaveBeenCalledTimes(1);
  });
});
