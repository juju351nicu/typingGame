/**
 * StrykerJSによるミューテーションテストの設定。
 *
 * ミューテーションテストは「ソースコードをわざと書き換えた（変異させた）とき、
 * テストが失敗して変更に気付けるか」を確認する。行カバレッジでは分からない
 * 「実行はしているが結果を検証していないテスト」を見つけるために使う。
 *
 * すべてのファイルを対象にすると時間がかかり、画面表示中心のコードでは
 * 生き残った変異の多くが見た目だけの差分になる。そのため、スコア・ランキング・
 * ページング・グラフ用データなど、値の誤りが利用者に直接見える計算ロジックだけを対象にする。
 *
 * @type {import("@stryker-mutator/api/core").PartialStrykerOptions}
 */
export default {
  testRunner: "vitest",
  vitest: {
    configFile: "vite.config.mjs",
  },
  mutate: [
    "src/utils/gameUtils.ts",
    "src/utils/chartUtils.ts",
    "src/composables/useDataTableView.ts",
    "src/composables/useRankingServerPaging.ts",
  ],
  reporters: ["clear-text", "progress", "html"],
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },
  thresholds: {
    high: 90,
    low: 80,
    // 生き残った変異が増え、スコアがこの値を下回ったらコマンドを失敗させる。
    break: 80,
  },
  tempDirName: ".stryker-tmp",
};
