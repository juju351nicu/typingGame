import { nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useGamePageSession } from "@/composables/useGamePageSession";
import Const from "@/constants/const";
import type {
  GameMode,
  GameRule,
  GameScore,
  TimeLimitSeconds,
} from "@/types/interfaces";

const createEmptyScore = (): GameScore => ({
  score: 0,
  mode: 0,
  time: "",
  date: "",
});

const createSessionState = () => {
  const gameScoresStore = {
    saveGameScoreList: vi.fn(),
  };
  const configStore = {
    getGameMode: 1 as GameMode,
    getGameRule: Const.GAME_RULE.NORMAL as GameRule,
    getTimeLimitSeconds: 60 as TimeLimitSeconds,
  };
  const timerComponent = ref({
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    resetTimer: vi.fn(),
  });
  const startTimeAttackTimer = vi.fn();
  const stopTimeAttackTimer = vi.fn();
  const resetTimeAttackTimer = vi.fn();
  const state = {
    gameScoresStore,
    configStore,
    timerComponent,
    isTimeAttackMode: ref(false),
    accumTime: ref(60000),
    correctCharacterCount: ref(45),
    gameScore: ref(15),
    isGameOver: ref(false),
    isGameStarted: ref(false),
    lastScore: ref<GameScore>(createEmptyScore()),
    missCount: ref(5),
    typedCharacterCount: ref(50),
    startTimeAttackTimer,
    stopTimeAttackTimer,
    resetTimeAttackTimer,
  };

  return {
    session: useGamePageSession(state),
    state,
  };
};

describe("useGamePageSession", () => {
  it("通常モードではゲーム開始時にタイムアタックタイマーをリセットする", () => {
    const { session, state } = createSessionState();

    session.startGame();

    expect(state.isGameStarted.value).toBe(true);
    expect(state.resetTimeAttackTimer).toHaveBeenCalledTimes(1);
    expect(state.startTimeAttackTimer).not.toHaveBeenCalled();
  });

  it("タイムアタックではゲーム開始時に制限時間付きタイマーを開始する", () => {
    const { session, state } = createSessionState();
    state.isTimeAttackMode.value = true;
    state.configStore.getGameRule = Const.GAME_RULE.TIME_ATTACK;
    state.configStore.getTimeLimitSeconds = 90;

    session.startGame();

    expect(state.isGameStarted.value).toBe(true);
    expect(state.startTimeAttackTimer).toHaveBeenCalledWith({
      timeLimitSeconds: 90,
      onTimeUp: expect.any(Function),
    });
    expect(state.resetTimeAttackTimer).not.toHaveBeenCalled();
  });

  it("タイムアップ時にゲームオーバーにする", () => {
    const { session, state } = createSessionState();
    state.isTimeAttackMode.value = true;

    session.startGame();
    const timerOptions = state.startTimeAttackTimer.mock.calls[0][0];
    timerOptions.onTimeUp();

    expect(state.isGameOver.value).toBe(true);
  });

  it("ゲームオーバー時にタイマーを停止してスコアを保存する", async () => {
    const { state } = createSessionState();

    state.isGameOver.value = true;
    await nextTick();

    expect(state.timerComponent.value.stopTimer).toHaveBeenCalledTimes(1);
    expect(state.stopTimeAttackTimer).toHaveBeenCalledTimes(1);
    expect(state.lastScore.value).toMatchObject({
      score: 15,
      mode: 1,
      gameRule: Const.GAME_RULE.NORMAL,
      timeLimitSeconds: undefined,
      time: "00:01:00.00",
      wpm: 9,
      accuracy: 90,
      missCount: 5,
      correctCharacterCount: 45,
    });
    expect(state.gameScoresStore.saveGameScoreList).toHaveBeenCalledWith(
      state.lastScore.value
    );
  });
});
