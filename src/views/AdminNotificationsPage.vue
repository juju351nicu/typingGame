<script setup lang="ts">
import { onMounted } from "vue";
import dayjs from "dayjs";
import URadioGroup from "@nuxt/ui/components/RadioGroup.vue";
import UButton from "@nuxt/ui/components/Button.vue";
import AppAlerts from "@/components/AppAlerts.vue";
import AppProgressCircular from "@/components/AppProgressCircular.vue";
import AppStateMessage from "@/components/AppStateMessage.vue";
import AppTextField from "@/components/AppTextField.vue";
import Const from "@/constants/const";
import { ADMIN_NOTIFICATION_TARGET_OPTIONS } from "@/composables/useAdminNotificationForm";
import {
  getAdminNotificationTargetLabel,
  useAdminNotificationsPageState,
} from "@/composables/useAdminNotificationsPageState";
import { useAuthStore } from "@/stores/auth";

/** 認証切れ時の処理に使う認証ストア */
const authStore = useAuthStore();

const {
  alerts,
  errors,
  form,
  isListLoading,
  isSending,
  isUserTarget,
  loadSentNotifications,
  sentNotifications,
  submit,
} = useAdminNotificationsPageState(authStore);

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

onMounted(() => {
  document.title = "お知らせ管理";
  void loadSentNotifications();
});
</script>
<template>
  <div class="app-container admin-page">
    <AppAlerts :alerts="alerts" />
    <section class="admin-header">
      <h1>Notifications</h1>
      <p>ログインユーザーへお知らせを送信し、送信履歴を確認できます。</p>
    </section>

    <section class="admin-card" aria-labelledby="admin-form-title">
      <h2 id="admin-form-title" class="admin-card__title">お知らせを送信</h2>
      <form class="admin-form" novalidate @submit.prevent="submit">
        <AppTextField
          v-model="form.title"
          label="タイトル"
          name="title"
          :counter="Const.NOTIFICATION.TITLE_MAX_LENGTH"
          :error-message="errors.title"
        />
        <AppTextField
          v-model="form.body"
          label="本文"
          name="body"
          multiline
          :rows="5"
          :counter="Const.NOTIFICATION.BODY_MAX_LENGTH"
          :error-message="errors.body"
        />
        <AppTextField
          v-model="form.linkPath"
          label="リンク先（任意）"
          name="linkPath"
          placeholder="/scoresBoard"
          hint="「/」から始まるアプリ内のパスを入力すると、お知らせから画面を開けます。"
          :error-message="errors.linkPath"
        />

        <fieldset class="admin-form__target">
          <legend class="admin-form__legend">送信先</legend>
          <URadioGroup
            v-model="form.target"
            :items="ADMIN_NOTIFICATION_TARGET_OPTIONS"
            orientation="horizontal"
            color="secondary"
            :ui="{ fieldset: 'admin-form__radios', label: 'admin-form__radio' }"
          />
        </fieldset>
        <AppTextField
          v-if="isUserTarget"
          v-model="form.userId"
          label="ユーザーID"
          name="userId"
          inputmode="numeric"
          :error-message="errors.userId"
        />

        <div class="admin-form__actions">
          <UButton
            type="submit"
            color="secondary"
            size="lg"
            icon="i-lucide-send"
            :loading="isSending"
          >
            送信する
          </UButton>
        </div>
      </form>
    </section>

    <section class="admin-card" aria-labelledby="admin-list-title">
      <h2 id="admin-list-title" class="admin-card__title">
        送信済みのお知らせ
      </h2>
      <div v-if="isListLoading" class="admin-list__loading">
        <AppProgressCircular
          color="var(--ui-primary)"
          :size="28"
          :width="3"
          aria-label="送信済みのお知らせを読み込み中"
        />
      </div>
      <AppStateMessage
        v-else-if="sentNotifications.length === 0"
        type="empty"
        title="送信済みのお知らせはありません"
        message="お知らせを送信すると、ここに新しい順で表示されます。"
      />
      <ul v-else class="admin-list">
        <li
          v-for="notification in sentNotifications"
          :key="notification.id"
          class="admin-list__item"
        >
          <div class="admin-list__header">
            <span class="admin-list__title">{{ notification.title }}</span>
            <span class="admin-list__target">
              {{ getAdminNotificationTargetLabel(notification) }}
            </span>
          </div>
          <p class="admin-list__body">{{ notification.body }}</p>
          <div class="admin-list__meta">
            <time :datetime="notification.createdAt.replace(' ', 'T')">
              {{ formatCreatedAt(notification.createdAt) }}
            </time>
            <span v-if="notification.linkPath">
              リンク先: {{ notification.linkPath }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
<style scoped>
.admin-page {
  max-width: 980px;
}

.admin-header {
  margin-bottom: 24px;
}

.admin-header h1 {
  color: var(--app-text);
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.admin-header p {
  color: var(--app-text-muted);
  font-size: 1.3rem;
  margin: 8px 0 0;
}

.admin-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
  color: var(--app-text);
  margin-bottom: 24px;
  padding: 20px;
}

.admin-card__title {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-form__target {
  border: 0;
  margin: 0 0 12px;
  padding: 0;
}

.admin-form__legend {
  color: var(--app-text-muted);
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 8px;
}

:deep(.admin-form__radios) {
  border: 0;
  gap: 24px;
  margin: 0;
  padding: 0;
}

:deep(.admin-form__radio) {
  color: var(--app-text);
  font-size: 1rem;
}

.admin-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.admin-list__loading {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.admin-list {
  list-style: none;
}

.admin-list__item {
  border-top: 1px solid var(--app-border);
  padding: 14px 0;
}

.admin-list__item:first-child {
  border-top: 0;
  padding-top: 0;
}

.admin-list__header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: space-between;
}

.admin-list__title {
  font-size: 1.1rem;
  font-weight: bold;
}

.admin-list__target {
  background: rgba(103, 58, 183, 0.12);
  border-radius: 9999px;
  color: #673ab7;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
}

:root.dark .admin-list__target {
  background: rgba(185, 162, 255, 0.15);
  color: #b9a2ff;
}

.admin-list__body {
  color: var(--app-text-muted);
  line-height: 1.7;
  margin: 6px 0;
  white-space: pre-wrap;
}

.admin-list__meta {
  color: var(--app-text-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 0.85rem;
  gap: 4px 16px;
}

@media (max-width: 760px) {
  .admin-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .admin-header h1 {
    font-size: 2.5rem;
  }

  .admin-card {
    padding: 16px;
  }
}
</style>
