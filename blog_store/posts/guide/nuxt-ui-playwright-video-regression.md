---
id: nuxt-ui-playwright-video-regression
title: 見た目を維持したNuxt UI移行とPlaywright動画回帰
date: 2026-11-14
section: guide
description: VuetifyからNuxt UIへ段階移行した画面を監査し、Material Design基調の見た目を保ったまま主要journeyをPlaywright動画で確認できるようにした記録です。
tags: Vue 3, Nuxt UI, Playwright, highlight.js
---

# 見た目を維持したNuxt UI移行とPlaywright動画回帰

タイピングゲームのUI基盤をVuetifyからNuxt UIへ移した後、公式のVue向け構成との差分と、移行前の見た目を維持するために残したCSSを改めて監査しました。

結論から言うと、Nuxt UIへの置換自体は既に完了していました。今回追加したのは、公式構成で推奨されるrootの分離、主要画面を通した動画回帰、技術ブログのコードハイライト対象言語の補完です。

## 移行後に維持した境界

Nuxt UIはNuxt専用ではなく、Vite + Vueでも公式pluginを利用できます。このアプリでは次の構成です。

```ts:vite.config.mjs
import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue(),
    ui({
      colorMode: false,
      components: false,
      autoImport: false,
    }),
  ],
});
```

自動importを使わず、利用するcomponentを各Vueファイルで明示しています。テーマ状態も既存Pinia storeを正本にしたまま、`<html class="dark">`だけをNuxt UIと共有します。

公式ガイドに合わせ、rootには`isolate`を付けました。

```html:index.html
<div id="app" class="isolate"></div>
```

これはoverlayのstacking contextをアプリ内へ閉じるための設定です。`UApp`、Vue plugin、Tailwind CSS、`@nuxt/ui`のimportは既に導入済みでした。

## 見た目を同じままにする

既存画面はMaterial Design基調だったため、Nuxt UIの既定themeへ一度に寄せると、ボタンの高さ、角丸、影、入力欄のnotch、dialogの余白が変わります。

そこで、意味のあるcomponentはNuxt UIへ移し、寸法と配色はtheme tokenと薄いwrapperへ集約しました。

```vue:AppButtonExample.vue
<UButton color="primary" variant="solid">
  ゲームをはじめる
</UButton>
```

```css:main.css
:root {
  --ui-primary: #1867c0;
  --ui-secondary: #673ab7;
  --ui-radius: 0.25rem;
}
```

独自CSSが残っていること自体を未移行とは扱っていません。ゲーム固有の風船、仮想キーボード、記事レイアウトと、見た目の互換に必要なtokenはアプリ側の責務です。

## Playwrightで主要journeyを動画にする

通常のE2Eは失敗検知を優先し、動画用には1本のserialなjourneyを追加しました。

```ts:showcase-video.e2e.ts
test("Nuxt UI移行後の主要画面と技術ブログを一通り操作できる", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#app")).toHaveClass(/isolate/);

  await page.goto("./settingBoard");
  await page.getByRole("switch", { name: "ライト" }).click();

  await page.goto("./scoresBoard");
  await page.getByRole("tab", { name: "分析" }).click();
});
```

Playwright project側では1280×720のWebMを常に記録します。

```ts:playwright.config.ts
{
  name: "showcase-video",
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 720 },
    video: { mode: "on", size: { width: 1280, height: 720 } },
  },
  testMatch: "**/showcase-video.e2e.ts",
}
```

実際の回帰実行で生成した動画です。

<video controls preload="metadata" aria-label="Nuxt UI移行後のPlaywright主要画面回帰動画">
  <source src="../videos/nuxt-ui-playwright-showcase.webm" type="video/webm">
  お使いのブラウザはWebM動画を再生できません。
</video>

## コード表示は既存highlight.jsを拡張する

Prism.jsやShikiへの置換も検討できますが、このアプリにはhighlight.jsのcore buildと必要言語だけを登録する構成が既にありました。新しい依存へ置き換えるより、記事で実際に使っていた未対応言語を追加する方がbundleと回帰範囲を小さくできます。

今回、CSS、Vue、JSON、HTTP、SQL、Javaを追加しました。Vueのcode fenceはHTML構文として扱います。

```ts:useMarkdownRenderer.ts
const HIGHLIGHT_LANGUAGE_ALIASES: Readonly<Record<string, string>> = {
  vue: "xml",
};
```

Markdownは最終HTMLをDOMPurifyでサニタイズし、`video`と同一originの`source`は維持します。`script`、event handler、危険なURL、inline styleは引き続き除去します。

## 確認すること

- 通常のunit test、typecheck、lint、production buildが成功する
- 既存Playwright回帰と動画journeyが成功する
- ライト／ダーク、ゲーム、ランキング、ブログが同じ動画内で確認できる
- 記事のコードblockへhighlight.jsのclassが付き、動画がGitHub Pagesから再生できる

UI libraryの移行は「CSSをゼロにする作業」ではありません。componentの責務をlibraryへ寄せ、プロダクト固有の見た目と操作を自動回帰で守れる状態にすることが完了条件です。
