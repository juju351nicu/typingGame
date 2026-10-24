import { onScopeDispose, watch, type Ref } from "vue";

/** スクロールを止めている間、html要素に付けるクラス名 */
export const SCROLL_BLOCKED_CLASS = "app-overlay-scroll-blocked";

/** スクロールを止めているモーダルの数 */
let blockCount = 0;

/** スクロールを止める前の位置 */
let savedScroll = { x: 0, y: 0 };

/** ページのスクロールを止める。 */
const block = (): void => {
  blockCount += 1;
  if (blockCount > 1) {
    return;
  }
  const html = document.documentElement;
  savedScroll = { x: window.scrollX, y: window.scrollY };
  html.style.setProperty("--app-body-scroll-x", `${-savedScroll.x}px`);
  html.style.setProperty("--app-body-scroll-y", `${-savedScroll.y}px`);
  html.classList.add(SCROLL_BLOCKED_CLASS);
};

/** ページのスクロールを再開し、止める前の位置へ戻す。 */
const release = (): void => {
  if (blockCount === 0) {
    return;
  }
  blockCount -= 1;
  if (blockCount > 0) {
    return;
  }
  const html = document.documentElement;
  html.classList.remove(SCROLL_BLOCKED_CLASS);
  html.style.removeProperty("--app-body-scroll-x");
  html.style.removeProperty("--app-body-scroll-y");
  window.scrollTo(savedScroll.x, savedScroll.y);
};

/**
 * モーダルを開いている間、裏のページがスクロールしないようにする。
 *
 * html要素をスクロール位置のまま固定し、スクロールバーは表示したままにするため、
 * 開閉時にレイアウトの幅が変わらない。複数のモーダルが重なっても、
 * すべて閉じた時点でスクロールを再開する。
 *
 * @param isOpen モーダルの表示状態
 */
export const useOverlayScrollBlock = (isOpen: Readonly<Ref<boolean>>) => {
  /** このモーダルがスクロールを止めているかどうか */
  let isBlocking = false;

  const update = (shouldBlock: boolean): void => {
    if (shouldBlock === isBlocking) {
      return;
    }
    isBlocking = shouldBlock;
    if (shouldBlock) {
      block();
    } else {
      release();
    }
  };

  watch(isOpen, update, { immediate: true });
  onScopeDispose(() => update(false));
};
