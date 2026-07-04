import { ref, watch, type Ref } from "vue";

/**
 * リザルトモーダルの表示状態を管理する。
 *
 * ゲームオーバーになった時にモーダルを開き、リトライ時には閉じる。
 *
 * @param isGameOver ゲームオーバーフラグ
 */
export const useResultModalDialog = (isGameOver: Readonly<Ref<boolean>>) => {
  /** ダイアログの表示・非表示 */
  const dialog = ref(false);

  /** ダイアログを閉じる。 */
  const closeDialog = (): void => {
    dialog.value = false;
  };

  watch(isGameOver, (newValue) => {
    if (newValue) {
      dialog.value = true;
    }
  });

  return {
    closeDialog,
    dialog,
  };
};
