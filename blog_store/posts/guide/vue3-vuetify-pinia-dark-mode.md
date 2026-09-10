---
id: vue3-vuetify-pinia-dark-mode
title: Vue 3 + Vuetify + Piniaでダークモードを復活させた話
date: 2026-07-04
section: guide
description: Vue 3 + Vite + Vuetifyのタイピングゲームで、以前外していたダークモードを Piniaと Vuetify theme の同期で復活させたときの設計と実装をまとめました。
tags: Vue 3, Vuetify, Pinia
---

# Vue 3 + Vuetify + Piniaでダークモードを復活させた話

このタイピングゲームには、以前ダークモードの設定がありました。

ただ、当時はまだ画面全体の色設計が十分ではなく、localStorageに `isDarkMode: true` が残っていると、入力欄や一部の文字色が読みにくくなる問題がありました。

そのため一度はライトテーマへ固定していましたが、設定画面やランキング画面の整理が進んだので、改めて復活させました。作業はPiniaとVuetify themeの同期、設定画面の切替UI、手書きCSSの固定色をCSS変数へ寄せる3つに分かれます。

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

## Piniaと Vuetify themeを同期する

まず、Piniaの `isDarkMode` を Vuetifyの theme名へ変換する処理を用意しました。

```ts
export const getDisplayThemeName = (isDarkMode: boolean): string => {
  return isDarkMode ? Const.DISPLAY_THEME.DARK : Const.DISPLAY_THEME.LIGHT;
};
```

そして、`App.vue` 側では composableを呼び出すだけにしました。

```ts
const configStore = useConfigStore();
const theme = useTheme();

const { isDarkMode } = useDisplayTheme(configStore, theme);
```

`useDisplayTheme` の中では、storeの値を watch して Vuetify themeを同期します。

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

`immediate: true` にしているので、ページを開いた直後にも localStorageから復元されたテーマが反映されます。

## App.vueにCSS変数を置く

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

Vuetifyの switchは `null` を渡す可能性があるため、保存時には booleanのときだけ反映しています。

```ts
const setDisplayMode = (isDark: boolean | null) => {
  if (isDark === null) {
    return;
  }
  configStore.saveDisplayMode(isDark);
};
```

## テストで守るところ

テーマ名の変換は純粋関数にして、Vitestで確認できるようにしました。

```ts
it("ダークモードのテーマ名を返す", () => {
  expect(getDisplayThemeName(true)).toBe(Const.DISPLAY_THEME.DARK);
});
```

また、store側でも `saveDisplayMode` が値を保存できることを確認しています。

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

## 振り返り

ダークモードを一度外した判断そのものは、間違っていなかったと思います。文字が読めない画面を出すより、ライトへ固定した方がましです。

よくなかったのは、その外し方でした。`isDarkMode` はstoreに残したまま起動時に上書きしていたので、設定は保存されているのに尊重されない状態でした。ユーザーから見ると「切り替えても戻る」だけで、なぜ戻るのかは画面から分かりません。無効にするなら設定項目ごと消すか、色を直すかのどちらかで、状態だけ残すのが一番分かりにくい形になります。

結果として直したのはVuetifyのtheme切替ではなく、手書きCSSに残っていた固定色でした。ダークモードは見た目の機能ですが、詰まる場所は状態管理とCSS設計の側にあります。

Piniaとcomposableの置き場所を決めた方針は[Vue 3 / TypeScriptで画面・API通信・状態管理・Utilityの責務を分離する](vue-typescript-responsibility-separation)にまとめています。
