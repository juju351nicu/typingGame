import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useGamePageKeyboardHandlers } from "@/composables/useGamePageKeyboardHandlers";

const createKeyboardEvent = (key: string): KeyboardEvent => {
  return { key } as KeyboardEvent;
};

describe("useGamePageKeyboardHandlers", () => {
  const createState = () => {
    const timerComponent = ref({
      startTimer: vi.fn(),
      stopTimer: vi.fn(),
      resetTimer: vi.fn(),
    });
    const stopTimeAttackTimer = vi.fn();
    const resumeTimeAttackTimer = vi.fn();
    const updateKeyFeedback = vi.fn();
    const state = {
      timerComponent,
      isGameStarted: ref(true),
      isGameOver: ref(false),
      isTimeAttackMode: ref(false),
      nextKey: ref("a"),
      stopTimeAttackTimer,
      resumeTimeAttackTimer,
      updateKeyFeedback,
    };

    return {
      handlers: useGamePageKeyboardHandlers(state),
      state,
    };
  };

  it("Escapeキーで通常タイマーを停止する", () => {
    const { handlers, state } = createState();

    handlers.handleEsc(createKeyboardEvent("Escape"));

    expect(state.timerComponent.value.stopTimer).toHaveBeenCalledTimes(1);
    expect(state.stopTimeAttackTimer).not.toHaveBeenCalled();
  });

  it("タイムアタック中にEscapeキーを押すとタイムアタックタイマーも停止する", () => {
    const { handlers, state } = createState();
    state.isTimeAttackMode.value = true;

    handlers.handleEsc(createKeyboardEvent("Escape"));

    expect(state.timerComponent.value.stopTimer).toHaveBeenCalledTimes(1);
    expect(state.stopTimeAttackTimer).toHaveBeenCalledTimes(1);
  });

  it("Shiftキーで通常タイマーを再開する", () => {
    const { handlers, state } = createState();

    handlers.handleShift(createKeyboardEvent("Shift"));

    expect(state.timerComponent.value.startTimer).toHaveBeenCalledTimes(1);
    expect(state.resumeTimeAttackTimer).not.toHaveBeenCalled();
  });

  it("タイムアタック中にShiftキーを押すとタイムアタックタイマーも再開する", () => {
    const { handlers, state } = createState();
    state.isTimeAttackMode.value = true;

    handlers.handleShift(createKeyboardEvent("Shift"));

    expect(state.timerComponent.value.startTimer).toHaveBeenCalledTimes(1);
    expect(state.resumeTimeAttackTimer).toHaveBeenCalledTimes(1);
  });

  it("ゲーム未開始またはゲームオーバー時はShiftキーで再開しない", () => {
    const { handlers, state } = createState();
    state.isGameStarted.value = false;

    handlers.handleShift(createKeyboardEvent("Shift"));

    state.isGameStarted.value = true;
    state.isGameOver.value = true;
    handlers.handleShift(createKeyboardEvent("Shift"));

    expect(state.timerComponent.value.startTimer).not.toHaveBeenCalled();
  });

  it("ゲーム中のキー入力を仮想キーボード表示へ反映する", () => {
    const { handlers, state } = createState();

    handlers.handleTypingKeydown(createKeyboardEvent("b"));

    expect(state.updateKeyFeedback).toHaveBeenCalledWith("b", "a");
  });

  it("ゲーム未開始またはゲームオーバー時はキー入力を反映しない", () => {
    const { handlers, state } = createState();
    state.isGameStarted.value = false;

    handlers.handleTypingKeydown(createKeyboardEvent("b"));

    state.isGameStarted.value = true;
    state.isGameOver.value = true;
    handlers.handleTypingKeydown(createKeyboardEvent("b"));

    expect(state.updateKeyFeedback).not.toHaveBeenCalled();
  });
});
