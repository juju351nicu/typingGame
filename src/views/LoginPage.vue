<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import type { CustomFieldError } from "@/types/interfaces";
import { toDisplayFieldErrors } from "@/utils/apiErrorUtils";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

/** 認証ストア */
const authStore = useAuthStore();
/** ルーター */
const router = useRouter();
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
  <v-container class="login-page" fluid>
    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-copy">
        <p class="login-kicker">Account</p>
        <h1 id="login-title">{{ formTitle }}</h1>
      </div>

      <v-card class="login-card" elevation="2">
        <v-tabs
          :model-value="formMode"
          color="deep-purple"
          grow
          @update:model-value="updateFormMode"
        >
          <v-tab value="login">ログイン</v-tab>
          <v-tab value="register">登録</v-tab>
        </v-tabs>

        <v-card-text>
          <v-alert
            v-for="message in errorMessages"
            :key="message"
            class="mb-3"
            density="comfortable"
            type="error"
            variant="tonal"
          >
            {{ message }}
          </v-alert>

          <v-form @submit.prevent="submit">
            <v-text-field
              v-model="loginEmail"
              autocomplete="email"
              label="メールアドレス"
              name="loginEmail"
              prepend-inner-icon="mdi-email"
              type="email"
              variant="outlined"
            />
            <v-text-field
              v-model="password"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              label="パスワード"
              name="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn
              block
              color="deep-purple"
              :loading="authStore.isLoading"
              size="large"
              type="submit"
            >
              {{ submitLabel }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </section>
  </v-container>
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
  border-radius: 8px;
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
