// @vitest-environment jsdom

import AppAlerts from "@/components/AppAlerts.vue";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("AppAlerts", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("アラートをスクリーンリーダーへ即時通知する", () => {
    vi.useFakeTimers();
    const wrapper = mount(AppAlerts, {
      props: {
        alerts: [{ id: 1, message: "通信に失敗しました。", type: "error" }],
      },
      global: {
        stubs: {
          VAlert: {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    const alert = wrapper.get('[role="alert"]');
    expect(alert.attributes("aria-live")).toBe("assertive");
    expect(alert.text()).toContain("通信に失敗しました。");
  });
});
