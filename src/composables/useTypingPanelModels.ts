import { computed } from "vue";

export interface TypingPanelModelProps {
  isGameStarted: boolean;
  isResetTimer: boolean;
  shouldFinishOnWordReachedTop: boolean;
  gameScore: number;
  isGameOver: boolean;
  inputValue: string;
  typedCharacterCount: number;
  missCount: number;
  correctCharacterCount: number;
  isInputMiss: boolean;
  nextKey: string;
}

export type TypingPanelModelEmit = {
  (event: "update:isGameOver", value: boolean): void;
  (event: "update:gameScore", value: number): void;
  (event: "update:inputValue", value: string): void;
  (event: "update:typedCharacterCount", value: number): void;
  (event: "update:missCount", value: number): void;
  (event: "update:correctCharacterCount", value: number): void;
  (event: "update:isInputMiss", value: boolean): void;
  (event: "update:nextKey", value: string): void;
};

/**
 * TypingPanel.vue の props と update イベントを v-model 用の computed に変換する。
 *
 * emit 名を1か所へ集約し、TypingPanel.vue 側ではゲーム処理の接続だけに集中できる
 * ようにする。
 *
 * @param props TypingPanel.vue が受け取る props
 * @param emit TypingPanel.vue の update イベント
 */
export const useTypingPanelModels = (
  props: TypingPanelModelProps,
  emit: TypingPanelModelEmit
) => {
  /** ゲームスタートフラグ */
  const isGameStartedFlag = computed((): boolean => props.isGameStarted);

  /** リセットフラグ */
  const isResetFlag = computed((): boolean => props.isResetTimer);

  /** 風船が画面上部に到達したときにゲーム終了するか */
  const shouldFinishOnWordReachedTop = computed((): boolean => {
    return props.shouldFinishOnWordReachedTop;
  });

  /** ゲームスコア */
  const gameScore = computed({
    get: (): number => props.gameScore,
    set: (value: number) => emit("update:gameScore", value),
  });

  /** ゲームオーバーフラグ */
  const isGameOverFlag = computed({
    get: (): boolean => props.isGameOver,
    set: (value: boolean) => emit("update:isGameOver", value),
  });

  /** テキストボックスに入力された値 */
  const typeBoxValue = computed({
    get: (): string => props.inputValue,
    set: (value: string) => emit("update:inputValue", value),
  });

  /** 入力した文字数 */
  const typedCharacterCount = computed({
    get: (): number => props.typedCharacterCount,
    set: (value: number) => emit("update:typedCharacterCount", value),
  });

  /** ミスした文字数 */
  const missCount = computed({
    get: (): number => props.missCount,
    set: (value: number) => emit("update:missCount", value),
  });

  /** 正しく入力した文字数 */
  const correctCharacterCount = computed({
    get: (): number => props.correctCharacterCount,
    set: (value: number) => emit("update:correctCharacterCount", value),
  });

  /** 入力が現在の単語と一致していないか */
  const isInputMiss = computed({
    get: (): boolean => props.isInputMiss,
    set: (value: boolean) => emit("update:isInputMiss", value),
  });

  /** 次に入力すべきキー */
  const nextKey = computed({
    get: (): string => props.nextKey,
    set: (value: string) => emit("update:nextKey", value),
  });

  return {
    correctCharacterCount,
    gameScore,
    isGameOverFlag,
    isGameStartedFlag,
    isInputMiss,
    isResetFlag,
    missCount,
    nextKey,
    shouldFinishOnWordReachedTop,
    typeBoxValue,
    typedCharacterCount,
  };
};
