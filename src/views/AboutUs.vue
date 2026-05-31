<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import { onMounted } from "vue";

const items = [
  {
    title: "トップページ",
    disabled: false,
    href: "/",
  },
  {
    title: "当サイトについて",
    disabled: true,
    href: "/aboutUs",
  },
];
onMounted(() => {
  document.title = "Balloon Typing Game について";
});
</script>
<template>
  <Breadcrumbs :items="items" />
  <v-container class="about">
    <div class="about__inner">
      <section class="about__hero">
        <p class="about__eyebrow">About</p>
        <h1>Balloon Typing Game</h1>
        <p>
          Balloon Typing Game は、画面下から浮かんでくる風船の英単語を入力して割っていくタイピングゲームです。
          Vue 3 と TypeScript を使い、入力フィードバック、リザルト表示、ランキング保存まで実装しています。
        </p>
      </section>

      <section class="about__section">
        <h2>主な機能</h2>
        <ul>
          <li>風船が下から上へ浮かぶタイピングゲーム</li>
          <li>入力中の文字ハイライトとミス表示</li>
          <li>次に打つキーを確認できる仮想キーボード表示</li>
          <li>風船の破裂アニメーション</li>
          <li>スコア、WPM、正確率、正タイプ数、ミス数、ランクのリザルト表示</li>
          <li>localStorage を使ったローカルランキング保存</li>
          <li>難易度変更とスコア初期化</li>
          <li>PC とスマホ幅のレスポンシブ表示</li>
        </ul>
      </section>

      <section class="about__section">
        <h2>使用技術</h2>
        <ul>
          <li>Vue 3</li>
          <li>TypeScript</li>
          <li>Vite</li>
          <li>Vuetify</li>
          <li>Pinia</li>
          <li>Vitest</li>
          <li>GitHub Pages / GitHub Actions</li>
        </ul>
      </section>

      <section class="about__section">
        <h2>保存される情報</h2>
        <p>
          ランキング表示のため、プレイ結果をブラウザの localStorage に保存します。
          保存される内容は、スコア、プレイ時間、難易度、WPM、正確率、正タイプ数、ミス数、プレイ日時です。
          設定画面から保存済みスコアを削除できます。
        </p>
      </section>

      <section class="about__section">
        <h2>推奨環境</h2>
        <p>
          最新版の Google Chrome、Microsoft Edge、Firefox、Safari での利用を想定しています。
          JavaScript と localStorage が有効なブラウザでプレイしてください。
        </p>
      </section>

      <section class="about__section">
        <h2>今後の改善予定</h2>
        <ul>
          <li>ゲーム処理の composable 化</li>
          <li>スコア計算とタイマー処理の責務分離</li>
          <li>テスト範囲の拡充</li>
          <li>分析グラフや苦手キー表示の追加</li>
        </ul>
      </section>
    </div>
  </v-container>
</template>
<style scoped>
.about {
  max-width: 1000px;
  padding-top: 40px;
  padding-bottom: 64px;
}

.about__inner {
  color: #212121;
}

.about__hero {
  margin-bottom: 32px;
}

.about__eyebrow {
  color: #673ab7;
  font-weight: 700;
  margin-bottom: 8px;
}

.about__hero h1 {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 16px;
}

.about__hero p,
.about__section p,
.about__section li {
  color: #616161;
  font-size: 1rem;
  line-height: 1.8;
}

.about__section {
  border-top: 1px solid #dddddd;
  padding: 24px 0;
}

.about__section h2 {
  font-size: 1.35rem;
  margin-bottom: 12px;
}

.about__section ul {
  display: grid;
  gap: 8px;
  padding-left: 1.2rem;
}

@media (max-width: 600px) {
  .about {
    padding-top: 24px;
  }

  .about__hero h1 {
    font-size: 2.1rem;
  }
}
</style>
