import { nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";
import { useResultModalDialog } from "@/composables/useResultModalDialog";

describe("useResultModalDialog", () => {
  it("ゲームオーバーになるとダイアログを開く", async () => {
    const isGameOver = ref(false);
    const resultDialog = useResultModalDialog(isGameOver);

    isGameOver.value = true;
    await nextTick();

    expect(resultDialog.dialog.value).toBe(true);
  });

  it("ゲームオーバーではない状態ではダイアログを開かない", async () => {
    const isGameOver = ref(false);
    const resultDialog = useResultModalDialog(isGameOver);

    await nextTick();

    expect(resultDialog.dialog.value).toBe(false);
  });

  it("ダイアログを閉じる", async () => {
    const isGameOver = ref(false);
    const resultDialog = useResultModalDialog(isGameOver);

    isGameOver.value = true;
    await nextTick();
    resultDialog.closeDialog();

    expect(resultDialog.dialog.value).toBe(false);
  });
});
