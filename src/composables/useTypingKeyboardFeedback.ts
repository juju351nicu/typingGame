import { ref } from "vue";
import {
  isMissKey,
  normalizeAlphabetKey,
} from "@/composables/useTypingKeyboard";
import Util from "@/utils/gameUtils";

interface TypingKeyboardFeedbackOptions {
  /** 押下キー表示を解除するまでの時間 */
  pressedKeyDuration?: number;
  /** ミスキー表示を解除するまでの時間 */
  missKeyDuration?: number;
}

/**
 * 仮想キーボードに表示する押下キーとミスキーの一時ハイライトを管理する。
 *
 * @param options キー表示を解除するまでの待機時間
 */
export const useTypingKeyboardFeedback = (
  options: TypingKeyboardFeedbackOptions = {}
) => {
  const pressedKeyDuration = options.pressedKeyDuration ?? 300;
  const missKeyDuration = options.missKeyDuration ?? 600;

  /** 実際に押したキー */
  const pressedKey = ref("");
  /** ミスしたキー */
  const missKey = ref("");

  const pressedKeyTimerId = ref<ReturnType<typeof setTimeout> | null>(null);
  const missKeyTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  /** 登録済みのキー表示解除タイマーを停止する。 */
  const clearKeyFeedbackTimers = (): void => {
    // コンポーネント破棄時や再入力時に、古い解除タイマーを残さない。
    if (pressedKeyTimerId.value !== null) {
      clearTimeout(pressedKeyTimerId.value);
      pressedKeyTimerId.value = null;
    }
    if (missKeyTimerId.value !== null) {
      clearTimeout(missKeyTimerId.value);
      missKeyTimerId.value = null;
    }
  };

  /**
   * 押下キーとミスキーの表示状態を更新する。
   *
   * @param eventKey KeyboardEvent.key などのキー入力値
   * @param nextKey 次に入力すべきキー
   */
  const updateKeyFeedback = (eventKey: string, nextKey: string): void => {
    const key = normalizeAlphabetKey(eventKey);
    if (Util.isEmpty(key, { trimString: false })) {
      return;
    }

    // 押されたキーは正誤に関係なく短時間表示する。
    pressedKey.value = key;
    if (pressedKeyTimerId.value !== null) {
      clearTimeout(pressedKeyTimerId.value);
    }
    pressedKeyTimerId.value = setTimeout(() => {
      pressedKey.value = "";
      pressedKeyTimerId.value = null;
    }, pressedKeyDuration);

    if (isMissKey(key, nextKey)) {
      // 次キーと違う場合だけ、ミスキーとして少し長めに強調する。
      missKey.value = key;
      if (missKeyTimerId.value !== null) {
        clearTimeout(missKeyTimerId.value);
      }
      missKeyTimerId.value = setTimeout(() => {
        missKey.value = "";
        missKeyTimerId.value = null;
      }, missKeyDuration);
    } else {
      // 正しいキーを押したら、前回のミス表示を消す。
      missKey.value = "";
    }
  };

  return {
    pressedKey,
    missKey,
    updateKeyFeedback,
    clearKeyFeedbackTimers,
  };
};
