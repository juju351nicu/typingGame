---
id: vue3-vuetify-pinia-dark-mode
title: Vue3 + Vuetify + Pinia でダークモードを復活させた話
date: 2026-07-04
section: guide
description: Vue3 + Vite + Vuetify のタイピングゲームで、以前外していたダークモードを Pinia と Vuetify theme の同期で復活させたときの設計と実装をまとめました。
tags: Vue 3, Vuetify, Pinia
---

# Vue3 + Vuetify + Pinia でダークモードを復活させた話

## はじめに

このタイピングゲームには、以前ダークモードの設定がありました。

ただ、当時はまだ画面全体の色設計が十分ではなく、localStorage に `isDarkMode: true` が残っていると、入力欄や一部の文字色が読みにくくなる問題がありました。

そのため一度はライトテーマへ固定していましたが、設定画面やランキング画面の整理が進んだので、改めてダークモードを復活させました。

今回やったことは大きく3つです。

```text
1. Pinia の表示設定と Vuetify theme を同期する
2. 設定画面にライト / ダーク切替を戻す
3. 手書きCSSの固定色をCSS変数へ寄せる
```

---

## 以前の問題

以前の実装では、設定store側に `isDarkMode` は残っていました。

```ts
interface ConfigState {
  isDarkMode: boolean;
}
```

しかし、アプリ起動時には強制的にライトテーマへ戻していました。

```ts
onMounted(() => {
  theme.global.name.value = Const.DISPLAY_THEME.LIGHT;
  configStore.saveDisplayMode(false);
});
```

これで白文字問題は避けられますが、ユーザーが選んだ表示テーマを保持できません。

根本的には、ダークモードを無効化するのではなく、画面側の色指定をダークテーマでも成立する形に直す必要がありました。

---

## Pinia と Vuetify theme を同期する

まず、Pinia の `isDarkMode` を Vuetify の theme 名へ変換する処理を用意しました。

```ts
export const getDisplayThemeName = (isDarkMode: boolean): string => {
  return isDarkMode ? Const.DISPLAY_THEME.DARK : Const.DISPLAY_THEME.LIGHT;
};
```

そして、`App.vue` 側では composable を呼び出すだけにしました。

```ts
const configStore = useConfigStore();
const theme = useTheme();

const { isDarkMode } = useDisplayTheme(configStore, theme);
```

`useDisplayTheme` の中では、store の値を watch して Vuetify theme を同期します。

```ts
watch(
  isDarkMode,
  (newValue) => {
    theme.global.name.value = getDisplayThemeName(newValue);
  },
  {
    immediate: true,
  }
);
```

`immediate: true` にしているので、ページを開いた直後にも localStorage から復元されたテーマが反映されます。

---

## App.vue にCSS変数を置く

次に、手書きCSSの色を直接 `#ffffff` や `#222222` に固定していた箇所を減らしました。

`App.vue` にライト用の変数を定義します。

```css
.app-shell {
  --app-bg: #e0e0e0;
  --app-surface: #ffffff;
  --app-surface-muted: #f8f9fa;
  --app-text: #222222;
  --app-text-muted: #666666;
  --app-border: #e2e6ea;
}
```

ダークモード時は同じ変数を上書きします。

```css
.app-shell--dark {
  --app-bg: #121212;
  --app-surface: #1e1f24;
  --app-surface-muted: #252830;
  --app-text: #f2f2f2;
  --app-text-muted: #c4c7ce;
  --app-border: #3a3f47;
}
```

各画面では、この変数を参照するようにします。

```css
.setting-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
}

.setting-label {
  color: var(--app-text);
}

.setting-description {
  color: var(--app-text-muted);
}
```

これで、ライト/ダークの差分を画面ごとに分散させず、アプリ全体の共通トークンとして扱えるようになりました。

---

## 設定画面に切替UIを戻す

設定画面には、表示テーマの `v-switch` を追加しました。

```vue
<v-switch
  v-model="isDarkMode"
  color="primary"
  hide-details
  inset
  :label="isDarkMode ? 'ダーク' : 'ライト'"
  @update:modelValue="setDisplayMode"
/>
```

Vuetify の switch は `null` を渡す可能性があるため、保存時には boolean のときだけ反映しています。

```ts
const setDisplayMode = (isDark: boolean | null) => {
  if (isDark === null) {
    return;
  }
  configStore.saveDisplayMode(isDark);
};
```

---

## テストで守るところ

テーマ名の変換は純粋関数にして、Vitest で確認できるようにしました。

```ts
it("ダークモードのテーマ名を返す", () => {
  expect(getDisplayThemeName(true)).toBe(Const.DISPLAY_THEME.DARK);
});
```

また、store 側でも `saveDisplayMode` が値を保存できることを確認しています。

```ts
configStore.saveDisplayMode(true);

expect(configStore.getDisplayMode).toBe(true);
```

画面の見た目は、手動確認チェックリストにも追加しました。

```text
1. 設定画面でダークへ切り替える
2. トップ、ランキング、ブログ詳細の背景と文字色を見る
3. 入力欄の文字が読めることを確認する
4. 再読み込み後もテーマが維持されることを確認する
```

---

## まとめ

今回の対応で、以前外していたダークモードをもう一度使える状態に戻しました。

ポイントは、単に Vuetify の theme を切り替えるだけではなく、手書きCSS側の固定色も一緒に見直したことです。

ダークモードは見た目の機能ですが、実装としては状態管理、永続化、UIコンポーネント、CSS設計がつながる部分でもあります。

今回のように `Pinia -> composable -> Vuetify theme -> CSS変数` の流れに整理しておくと、今後画面が増えてもテーマ対応を広げやすくなります。
