// @vitest-environment jsdom

import { effectScope, nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SCROLL_BLOCKED_CLASS,
  useOverlayScrollBlock,
} from "@/composables/useOverlayScrollBlock";

const html = document.documentElement;

describe("useOverlayScrollBlock", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 300,
    });
    Object.defineProperty(window, "scrollX", { configurable: true, value: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("開いている間はスクロール位置のままhtmlを固定する", async () => {
    const isOpen = ref(false);
    const scope = effectScope();
    scope.run(() => useOverlayScrollBlock(isOpen));

    isOpen.value = true;
    await nextTick();

    expect(html.classList.contains(SCROLL_BLOCKED_CLASS)).toBe(true);
    expect(html.style.getPropertyValue("--app-body-scroll-y")).toBe("-300px");
    scope.stop();
  });

  it("閉じるとスクロールを再開し、元の位置へ戻す", async () => {
    const isOpen = ref(true);
    const scope = effectScope();
    scope.run(() => useOverlayScrollBlock(isOpen));

    isOpen.value = false;
    await nextTick();

    expect(html.classList.contains(SCROLL_BLOCKED_CLASS)).toBe(false);
    expect(html.style.getPropertyValue("--app-body-scroll-y")).toBe("");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 300);
    scope.stop();
  });

  it("重なったモーダルがすべて閉じるまでスクロールを止めたままにする", async () => {
    const first = ref(true);
    const second = ref(true);
    const scope = effectScope();
    scope.run(() => {
      useOverlayScrollBlock(first);
      useOverlayScrollBlock(second);
    });

    first.value = false;
    await nextTick();
    expect(html.classList.contains(SCROLL_BLOCKED_CLASS)).toBe(true);

    second.value = false;
    await nextTick();
    expect(html.classList.contains(SCROLL_BLOCKED_CLASS)).toBe(false);
    scope.stop();
  });

  it("開いたまま破棄されてもスクロールを再開する", () => {
    const isOpen = ref(true);
    const scope = effectScope();
    scope.run(() => useOverlayScrollBlock(isOpen));

    scope.stop();

    expect(html.classList.contains(SCROLL_BLOCKED_CLASS)).toBe(false);
  });
});
