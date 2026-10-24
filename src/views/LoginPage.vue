<script setup lang="ts">
import AppTabs from "@/components/AppTabs.vue";
import AppTextField from "@/components/AppTextField.vue";
import UAlert from "@nuxt/ui/components/Alert.vue";
import AppLoadingButton from "@/components/AppLoadingButton.vue";
import Const from "@/constants/const";
import { useAuthStore } from "@/stores/auth";
import type { CustomFieldError } from "@/types/interfaces";
import { toDisplayFieldErrors } from "@/utils/apiErrorUtils";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

/** 認証ストア */
const authStore = useAuthStore();
/** ルーター */
const router = useRouter();
/** フォーム切り替えタブ */
const formTabs = [
  { label: "ログイン", value: "login" },
  { label: "登録", value: "register" },
] as const;
/** 表示中のフォーム種別 */
const formMode = ref<"login" | "register">("login");
/** メールアドレス */
const loginEmail = ref("");
/** パスワード */
const password = ref("");
/** パスワード表示フラグ */
const showPassword = ref(false);
/** APIエラー一覧 */
const fieldErrors = ref<CustomFieldError[]>([]);

/** 画面表示用のエラーメッセージ一覧 */
const errorMessages = computed(() =>
  fieldErrors.value.map((fieldError) => fieldError.message)
);

/** フォーム見出し */
const formTitle = computed(() =>
  formMode.value === "login" ? "ログイン" : "アカウント登録"
);

/** 送信ボタンラベル */
const submitLabel = computed(() =>
  formMode.value === "login" ? "ログイン" : "登録してログイン"
);

/**
 * フォーム種別を切り替える。
 * @param mode フォーム種別
 */
const switchFormMode = (mode: "login" | "register"): void => {
  formMode.value = mode;
  fieldErrors.value = [];
};

/**
 * タブの変更値をフォーム種別へ反映する。
 * @param value タブの変更値
 */
const updateFormMode = (value: unknown): void => {
  if (value === "login" || value === "register") {
    switchFormMode(value);
  }
};

/**
 * APIエラーを画面表示用エラーに変換する。
 * @param error 例外
 */
const setErrorMessages = (error: unknown): void => {
  fieldErrors.value = toDisplayFieldErrors(error);
};

/**
 * ログインまたはアカウント登録を行う。
 */
const submit = async (): Promise<void> => {
  fieldErrors.value = [];
  try {
    const request = {
      loginEmail: loginEmail.value,
      password: password.value,
    };

    if (formMode.value === "login") {
      await authStore.login(request);
    } else {
      await authStore.register(request);
    }

    await router.push({ name: "GamePage" });
  } catch (error) {
    setErrorMessages(error);
  }
};
</script>

<template>
  <div class="app-container app-container--fluid login-page">
    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-copy">
        <p class="login-kicker">Account</p>
        <h1 id="login-title">{{ formTitle }}</h1>
      </div>

      <div class="login-card">
        <AppTabs
          :model-value="formMode"
          :items="formTabs"
          color="#673ab7"
          grow
          @update:model-value="updateFormMode"
        />

        <div class="app-card__text">
          <UAlert
            v-for="message in errorMessages"
            :key="message"
            class="login-error"
            color="error"
            :icon="Const.ALERT_ICON.error"
            variant="soft"
          >
            <template #description>
              {{ message }}
            </template>
          </UAlert>

          <form @submit.prevent="submit">
            <AppTextField
              v-model="loginEmail"
              autocomplete="email"
              label="メールアドレス"
              name="loginEmail"
              prepend-icon="i-lucide-mail"
              type="email"
            />
            <AppTextField
              v-model="password"
              :append-icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
              :append-label="
                showPassword ? 'パスワードを隠す' : 'パスワードを表示する'
              "
              :type="showPassword ? 'text' : 'password'"
              :autocomplete="
                formMode === 'login' ? 'current-password' : 'new-password'
              "
              label="パスワード"
              name="password"
              prepend-icon="i-lucide-lock"
              @click:append="showPassword = !showPassword"
            />

            <AppLoadingButton
              block
              color="secondary"
              :loading="authStore.isLoading"
              size="lg"
              type="submit"
            >
              {{ submitLabel }}
            </AppLoadingButton>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  padding: 40px 20px;
}

.login-panel {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  margin: 0 auto;
  max-width: 980px;
}

.login-copy {
  align-self: center;
}

.login-kicker {
  color: #6a4fb3;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.login-copy h1 {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.15;
  margin: 0;
}

.login-card {
  background: var(--app-card-bg);
  border-radius: 8px;
  box-shadow:
    0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  color: var(--app-card-text);
  overflow: hidden;
}

.login-error {
  margin-bottom: 12px;
  padding-bottom: 12px;
  padding-top: 12px;
}

@media (max-width: 760px) {
  .login-page {
    padding: 24px 12px;
  }

  .login-panel {
    grid-template-columns: 1fr;
  }

  .login-copy h1 {
    font-size: 1.8rem;
  }
}
</style>
