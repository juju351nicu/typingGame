<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import { onMounted } from "vue";

/** 公開しているソースコードのリポジトリ */
const repositories = [
  {
    label: "Frontend Repository",
    href: "https://github.com/juju351nicu/typingGame",
  },
  {
    label: "Backend Repository",
    href: "https://github.com/juju351nicu/typing-game-backend",
  },
];

const items = [
  {
    title: "トップページ",
    disabled: false,
    to: { name: "GamePage" },
  },
  {
    title: "当サイトについて",
    disabled: true,
    to: { name: "AboutUs" },
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
          Vue 3 と TypeScript のFEから、AWS EC2上のSpring Boot APIへHTTPS接続し、JWTログインとランキング保存まで実装しています。
        </p>
      </section>

      <section class="about__section">
        <h2>ソースコード</h2>
        <p>フロントエンドとバックエンドを、それぞれGitHubで公開しています。</p>
        <div class="repository-links">
          <v-btn
            v-for="repository in repositories"
            :key="repository.href"
            :href="repository.href"
            prepend-icon="mdi-github"
            rel="noopener noreferrer"
            target="_blank"
            variant="outlined"
          >
            {{ repository.label }}
          </v-btn>
        </div>
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
          <li>ユーザー登録、JWTログイン、ユーザー別スコア保存</li>
          <li>ユーザー別スコアと全体ランキングの切り替え</li>
          <li>難易度変更とスコア初期化</li>
          <li>Markdown ブログ記事の一覧・詳細表示と前後ナビゲーション</li>
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
          <li>Spring Boot / Spring Security / JWT</li>
          <li>MySQL / Docker Compose</li>
          <li>AWS EC2 / Route 53 / Nginx / Let's Encrypt</li>
        </ul>
      </section>

      <section class="about__section">
        <h2>保存される情報</h2>
        <p>
          ランキング表示のため、プレイ結果をブラウザの localStorage に保存します。
          保存される内容は、スコア、プレイ時間、難易度、WPM、正確率、正タイプ数、ミス数、プレイ日時です。
          ログイン中は、同じプレイ結果をバックエンドAPI経由でMySQLにも保存します。
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
        <h2>今後の改善候補</h2>
        <ul>
          <li>API停止中であることを利用者へ伝える表示</li>
          <li>MySQLのホスト公開設定などインフラ構成の継続的な見直し</li>
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

.repository-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
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
