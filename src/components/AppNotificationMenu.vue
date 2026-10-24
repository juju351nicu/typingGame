<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import UPopover from "@nuxt/ui/components/Popover.vue";
import AppProgressCircular from "@/components/AppProgressCircular.vue";
import { useNotifications } from "@/composables/useNotifications";
import { useAuthStore } from "@/stores/auth";
import type { NotificationResponse } from "@/types/interfaces";

/** 認証ストア */
const authStore = useAuthStore();
/** お知らせのリンク先へ遷移するためのルーター */
const router = useRouter();
/** お知らせ一覧を開いているか */
const isOpen = ref(false);

const {
  notifications,
  unreadCount,
  badgeLabel,
  isLoading,
  errorMessage,
  startPolling,
  stopPolling,
  openNotifications,
} = useNotifications({ authStore });

/** 未読バッジの読み上げ文 */
const badgeAriaLabel = computed((): string => {
  return `未読の通知が${unreadCount.value}件あります`;
});

/** ベルボタンの読み上げ名 */
const buttonAriaLabel = computed((): string => {
  return unreadCount.value > 0
    ? `お知らせ（${badgeAriaLabel.value}）`
    : "お知らせ";
});

/**
 * 作成日時を一覧表示用に整形する。
 *
 * @param createdAt APIの作成日時（yyyy-MM-dd HH:mm:ss）
 * @returns 「YYYY/MM/DD HH:mm」形式の日時
 */
const formatCreatedAt = (createdAt: string): string => {
  const date = dayjs(createdAt.replace(" ", "T"));
  return date.isValid() ? date.format("YYYY/MM/DD HH:mm") : createdAt;
};

/**
 * お知らせのリンク先へ遷移する。
 *
 * アプリ内パスだけを扱うため、"/" から始まるパスのみrouterへ渡す。
 *
 * @param notification 選択されたお知らせ
 */
const openLink = async (notification: NotificationResponse): Promise<void> => {
  if (!notification.linkPath?.startsWith("/")) {
    return;
  }
  isOpen.value = false;
  await router.push(notification.linkPath);
};

/**
 * 一覧の開閉に合わせて、開いたときだけ一覧取得と既読化を行う。
 *
 * @param open 開いた場合true
 */
const updateOpen = (open: boolean): void => {
  isOpen.value = open;
  if (open) {
    void openNotifications();
  }
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    startPolling();
  }
});

// ログイン・ログアウトに合わせて未読件数の定期取得を切り替える。
watch(
  () => authStore.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      startPolling();
    } else {
      stopPolling();
      isOpen.value = false;
    }
  }
);

onUnmounted(() => {
  stopPolling();
});
</script>
<template>
  <div class="notification-anchor">
    <UPopover
      :open="isOpen"
      :content="{ align: 'end', sideOffset: 4 }"
      :ui="{ content: 'notification-menu' }"
      @update:open="updateOpen"
    >
      <UButton
        class="notification-button"
        color="neutral"
        variant="ghost"
        icon="i-lucide-bell"
        :aria-label="buttonAriaLabel"
      >
        <span
          v-if="badgeLabel"
          class="notification-badge"
          role="status"
          aria-live="polite"
          :aria-label="badgeAriaLabel"
        >
          {{ badgeLabel }}
        </span>
      </UButton>

      <template #content>
        <section
          class="notification-panel"
          aria-labelledby="notification-title"
        >
          <h2 id="notification-title" class="notification-panel__title">
            お知らせ
          </h2>
          <div v-if="isLoading" class="notification-panel__state">
            <AppProgressCircular
              color="var(--ui-primary)"
              :size="24"
              :width="3"
              aria-label="お知らせを読み込み中"
            />
          </div>
          <p
            v-else-if="errorMessage"
            class="notification-panel__state notification-panel__state--error"
            role="alert"
          >
            {{ errorMessage }}
          </p>
          <p
            v-else-if="notifications.length === 0"
            class="notification-panel__state"
          >
            お知らせはありません。
          </p>
          <ul v-else class="notification-list">
            <li
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'notification-item--unread': notification.unread }"
            >
              <component
                :is="notification.linkPath ? 'button' : 'div'"
                :type="notification.linkPath ? 'button' : undefined"
                class="notification-item__body"
                @click="openLink(notification)"
              >
                <span class="notification-item__header">
                  <span
                    v-if="notification.unread"
                    class="notification-item__unread"
                    aria-hidden="true"
                  />
                  <span class="notification-item__title">
                    {{ notification.title }}
                  </span>
                  <span v-if="notification.unread" class="sr-only"
                    >（未読）</span
                  >
                </span>
                <span class="notification-item__text">{{
                  notification.body
                }}</span>
                <span class="notification-item__meta">
                  <time :datetime="notification.createdAt.replace(' ', 'T')">
                    {{ formatCreatedAt(notification.createdAt) }}
                  </time>
                  <UIcon
                    v-if="notification.linkPath"
                    name="i-lucide-chevron-right"
                    class="notification-item__link-icon"
                    aria-hidden="true"
                  />
                </span>
              </component>
            </li>
          </ul>
        </section>
      </template>
    </UPopover>
  </div>
</template>
<style scoped>
.notification-anchor {
  display: inline-flex;
}

.notification-button {
  border-radius: 50%;
  height: 48px;
  justify-content: center;
  min-width: 0;
  padding: 0;
  position: relative;
  width: 48px;
}

.notification-button :deep(svg) {
  height: 24px;
  margin: 0;
  width: 24px;
}

.notification-badge {
  align-items: center;
  background: #f44336;
  border: 2px solid #673ab7;
  border-radius: 9999px;
  color: #ffffff;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 700;
  height: 20px;
  justify-content: center;
  letter-spacing: 0;
  line-height: 1;
  min-width: 20px;
  padding: 0 4px;
  position: absolute;
  right: 4px;
  text-indent: 0;
  top: 4px;
}

:global(.notification-menu) {
  background: var(--app-card-bg);
  border-radius: 4px;
  box-shadow:
    0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14),
    0 3px 14px 2px rgba(0, 0, 0, 0.12);
  color: var(--app-card-text);
  max-height: min(480px, calc(100dvh - 88px));
  overflow-y: auto;
  width: min(360px, calc(100vw - 24px));
  z-index: 1010;
}

.notification-panel__title {
  border-bottom: thin solid var(--app-border);
  font-size: 1rem;
  font-weight: 700;
  padding: 12px 16px;
}

.notification-panel__state {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  font-size: 0.9rem;
  justify-content: center;
  padding: 24px 16px;
}

.notification-panel__state--error {
  color: #d9485f;
}

.notification-list {
  list-style: none;
}

.notification-item + .notification-item {
  border-top: thin solid var(--app-border);
}

.notification-item__body {
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  text-align: left;
  width: 100%;
}

button.notification-item__body:hover,
button.notification-item__body:focus-visible {
  background: rgba(103, 58, 183, 0.08);
  outline: none;
}

.notification-item--unread .notification-item__body {
  background: rgba(103, 58, 183, 0.05);
}

.notification-item__header {
  align-items: center;
  display: flex;
  gap: 8px;
}

.notification-item__unread {
  background: #673ab7;
  border-radius: 50%;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
}

:root.dark .notification-item__unread {
  background: #b9a2ff;
}

.notification-item__title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.4;
}

.notification-item__text {
  color: var(--app-text-muted);
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.notification-item__meta {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  font-size: 0.75rem;
  justify-content: space-between;
}

.notification-item__link-icon {
  height: 16px;
  width: 16px;
}
</style>
