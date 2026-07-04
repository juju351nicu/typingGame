import { ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useGamePageRestart } from "@/composables/useGamePageRestart";

describe("useGamePageRestart", () => {
  const createRestartState = () => {
    const timerComponent = ref({
      startTimer: vi.fn(),
      stopTimer: vi.fn(),
      resetTimer: vi.fn(),
    });
    const resetTimeAttackTimer = vi.fn();
    const clearKeyFeedbackTimers = vi.fn();
    const resetGamePageState = vi.fn();

    return {
      restartState: useGamePageRestart({
        timerComponent,
        resetTimeAttackTimer,
        clearKeyFeedbackTimers,
        resetGamePageState,
      }),
      timerComponent,
      resetTimeAttackTimer,
      clearKeyFeedbackTimers,
      resetGamePageState,
    };
  };

  it("TypingPanelへのリセット通知フラグを次の描画タイミングで戻す", async () => {
    const { restartState } = createRestartState();

    const resetPromise = restartState.resetTypingPanel();

    expect(restartState.isResetTimer.value).toBe(true);

    await resetPromise;

    expect(restartState.isResetTimer.value).toBe(false);
  });

  it("リトライ時にゲーム画面と関連タイマーを初期化する", async () => {
    const {
      restartState,
      timerComponent,
      resetTimeAttackTimer,
      clearKeyFeedbackTimers,
      resetGamePageState,
    } = createRestartState();

    await restartState.restartGame();

    expect(timerComponent.value.resetTimer).toHaveBeenCalledTimes(1);
    expect(resetTimeAttackTimer).toHaveBeenCalledTimes(1);
    expect(clearKeyFeedbackTimers).toHaveBeenCalledTimes(1);
    expect(resetGamePageState).toHaveBeenCalledTimes(1);
    expect(restartState.isResetTimer.value).toBe(false);
  });

  it("タイマーコンポーネントが未参照でもリトライできる", async () => {
    const timerComponent = ref(null);
    const resetTimeAttackTimer = vi.fn();
    const clearKeyFeedbackTimers = vi.fn();
    const resetGamePageState = vi.fn();
    const restartState = useGamePageRestart({
      timerComponent,
      resetTimeAttackTimer,
      clearKeyFeedbackTimers,
      resetGamePageState,
    });

    await restartState.restartGame();

    expect(resetTimeAttackTimer).toHaveBeenCalledTimes(1);
    expect(clearKeyFeedbackTimers).toHaveBeenCalledTimes(1);
    expect(resetGamePageState).toHaveBeenCalledTimes(1);
  });
});
