// @vitest-environment jsdom

import AppLoadingButton from "@/components/AppLoadingButton.vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

describe("AppLoadingButton", () => {
  it("処理中でなければ文字だけを表示し、押せる状態にする", () => {
    const wrapper = mount(AppLoadingButton, {
      props: { loading: false },
      attrs: { type: "submit" },
      slots: { default: "ログイン" },
    });

    const button = wrapper.get("button");
    expect(button.text()).toBe("ログイン");
    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.attributes("aria-busy")).toBeUndefined();
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false);
  });

  it("処理中は無効表示にせず、文字を隠して中央にスピナーを表示する", () => {
    const wrapper = mount(AppLoadingButton, {
      props: { loading: true },
      attrs: { type: "submit" },
      slots: { default: "ログイン" },
    });

    const button = wrapper.get("button");
    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.attributes("aria-busy")).toBe("true");
    expect(button.classes()).toContain("app-loading-btn--loading");
    expect(
      wrapper.find('.app-loading-btn__loader [role="progressbar"]').exists()
    ).toBe(true);
  });
});
