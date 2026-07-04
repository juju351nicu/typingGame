import {
  useTypingPanelModels,
  type TypingPanelModelEmit,
  type TypingPanelModelProps,
} from "@/composables/useTypingPanelModels";
import { describe, expect, it, vi } from "vitest";
import { reactive } from "vue";

const createProps = (): TypingPanelModelProps => {
  return reactive({
    isGameStarted: false,
    isResetTimer: false,
    shouldFinishOnWordReachedTop: true,
    gameScore: 10,
    isGameOver: false,
    inputValue: "ho",
    typedCharacterCount: 2,
    missCount: 1,
    correctCharacterCount: 8,
    isInputMiss: false,
    nextKey: "m",
  });
};

describe("useTypingPanelModels", () => {
  it("propsの値をcomputed経由で参照する", () => {
    const props = createProps();
    const emit = vi.fn() as TypingPanelModelEmit;

    const models = useTypingPanelModels(props, emit);

    expect(models.isGameStartedFlag.value).toBe(false);
    expect(models.isResetFlag.value).toBe(false);
    expect(models.shouldFinishOnWordReachedTop.value).toBe(true);
    expect(models.gameScore.value).toBe(10);
    expect(models.isGameOverFlag.value).toBe(false);
    expect(models.typeBoxValue.value).toBe("ho");
    expect(models.typedCharacterCount.value).toBe(2);
    expect(models.missCount.value).toBe(1);
    expect(models.correctCharacterCount.value).toBe(8);
    expect(models.isInputMiss.value).toBe(false);
    expect(models.nextKey.value).toBe("m");
  });

  it("computedのsetterからupdateイベントをemitする", () => {
    const props = createProps();
    const emit = vi.fn() as TypingPanelModelEmit;

    const models = useTypingPanelModels(props, emit);

    models.gameScore.value = 20;
    models.isGameOverFlag.value = true;
    models.typeBoxValue.value = "home";
    models.typedCharacterCount.value = 4;
    models.missCount.value = 2;
    models.correctCharacterCount.value = 12;
    models.isInputMiss.value = true;
    models.nextKey.value = "e";

    expect(emit).toHaveBeenCalledWith("update:gameScore", 20);
    expect(emit).toHaveBeenCalledWith("update:isGameOver", true);
    expect(emit).toHaveBeenCalledWith("update:inputValue", "home");
    expect(emit).toHaveBeenCalledWith("update:typedCharacterCount", 4);
    expect(emit).toHaveBeenCalledWith("update:missCount", 2);
    expect(emit).toHaveBeenCalledWith("update:correctCharacterCount", 12);
    expect(emit).toHaveBeenCalledWith("update:isInputMiss", true);
    expect(emit).toHaveBeenCalledWith("update:nextKey", "e");
  });

  it("propsが更新された場合にcomputedの参照値も追従する", () => {
    const props = createProps();
    const emit = vi.fn() as TypingPanelModelEmit;
    const models = useTypingPanelModels(props, emit);

    props.inputValue = "line";
    props.gameScore = 30;

    expect(models.typeBoxValue.value).toBe("line");
    expect(models.gameScore.value).toBe(30);
  });
});
