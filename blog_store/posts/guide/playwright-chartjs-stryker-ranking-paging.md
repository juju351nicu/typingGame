---
id: playwright-chartjs-stryker-ranking-paging
title: ランキング画面にPlaywright E2E・Chart.js・StrykerJS・LIMIT/OFFSETページングを入れた話
date: 2026-10-25
section: guide
description: タイピングゲームのランキング画面を題材に、Chart.jsでの折れ線・棒グラフ、Spring Boot + DomaのLIMIT/OFFSETによるサーバーサイドページング、PlaywrightのE2Eテスト、StrykerJSのミューテーションテストを導入しました。ライブラリの選定理由と、E2Eで見つかった不具合、ミューテーションスコアが87%から96%に上がるまでをまとめます。
tags: Playwright, Chart.js, StrykerJS, Spring Boot, Doma, Vue 3, テスト
---

# ランキング画面にPlaywright E2E・Chart.js・StrykerJS・LIMIT/OFFSETページングを入れた話

タイピングゲームのランキング画面に、次の4つをまとめて入れました。

1. **Chart.js** で、プレイ結果の推移（折れ線グラフ）とリザルトランクの分布（棒グラフ）を表示する
2. 全体ランキングの表を、**ページ番号をサーバーへ渡して LIMIT / OFFSET で取得する**形に変える
3. **Playwright** で、ブラウザを実際に操作するE2Eテストを書く
4. **StrykerJS** で、計算ロジックのテストが本当に結果を検証しているかをミューテーションテストで確かめる

どれも「入れること」自体より、**どこまで入れるか**の判断に時間を使いました。その判断と、作業中に見つかった不具合を順に書きます。

## 1. Chart.jsでランキング分析のグラフを作る

### なぜChart.jsか

候補は Chart.js / ECharts / ApexCharts / D3 でした。

| 観点 | 判断 |
| --- | --- |
| 必要なグラフ | 折れ線と棒の2種類だけ |
| バンドルサイズ | Chart.jsは使う部品だけを `register` でき、不要なグラフ種別を含めずに済む |
| Vueとの接続 | `vue-chartjs` が props の変化で再描画してくれる |
| 学習コスト | D3は自由度が高い分、軸やツールチップを自前で組む量が多い |

折れ線と棒だけなら Chart.js で十分と判断しました。登録は使う部品だけにしています。

```ts
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

// 使う部品だけを登録し、Chart.js全体をバンドルに含めない。
ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip);
```

### 何を表示するか

以前は「直近5件」を縦棒で並べていました。件数が少なく、推移を読むには物足りなかったため、次の形に変えました。

- **直近10件の推移（折れ線）**：スコア / WPM / 正確率を切り替え
- **リザルトランク分布（棒）**：現在の絞り込み条件に一致するプレイを S / A / B / C 別に数える

系列が1つなので凡例は出さず、見出しで指標名を示します。正確率は割合なので、Y軸の上限を100%に固定しました。

### グラフ用のデータは純粋関数に分ける

Chart.js へ渡すデータと設定は、コンポーネントの中で組み立てずに `src/utils/chartUtils.ts` の関数にしました。

```ts
export const createResultRankDistribution = (
  items: RankingScore[]
): ResultRankCount[] => {
  return RESULT_RANK_ORDER.map((rank) => ({
    rank,
    count: items.filter((item) => item.resultRank === rank).length,
  }));
};
```

jsdom には canvas がないため、Vitest でグラフそのものは描けません。データと設定を関数に分けておけば、**「0件のランクも含めて S→C の順で返す」といった仕様をVitestで確認**でき、描画できるかどうかはE2Eで確認する、と役割を分けられます。

### canvasはCSS変数を読めない

この画面はライト / ダークテーマを `<html class="dark">` と CSS 変数で切り替えています。ところが canvas に描く Chart.js は CSS 変数を参照できません。

そこで、テーマごとの色を返す関数を用意し、Piniaの表示設定から計算しています。

```ts
export const getChartTheme = (isDarkMode: boolean): ChartTheme => {
  if (isDarkMode) {
    return { series: "#9c7cf0", text: "#c4c7ce", grid: "rgba(255, 255, 255, 0.08)", surface: "#1e1f24" };
  }
  return { series: "#673ab7", text: "#666666", grid: "rgba(0, 0, 0, 0.06)", surface: "#ffffff" };
};
```

ライトモードの線はアプリのアクセントカラー `#673ab7` です。最初はダーク用に `#b39ddb` を考えましたが、彩度が低く背景の上で灰色に見えたため、明るさと彩度を保った `#9c7cf0` にしました。色は見た目の好みで決めず、背景とのコントラスト比（3:1以上）を計算して確認しています。

### グラフだけにしない

グラフは色と形でしか値を伝えられないため、次の2つを付けました。

- canvas に `role="img"` と、値を文章にした `aria-label`
- 「表で見る」で開く、同じ値の表（`<details>`）

この `aria-label` は、後述のE2Eテストで「グラフに正しい値が渡っているか」を確認する手がかりにもなりました。

## 2. 全体ランキングをLIMIT / OFFSETでページングする

### 本当にサーバーサイドページングが必要か

ランキング画面には「自分の記録」と「全体ランキング」の2つの表示元があります。

| 表示元 | 件数 | 判断 |
| --- | --- | --- |
| 自分の記録 | 1人分のプレイ回数。localStorageにも保持 | 画面内でページ分割のまま |
| 全体ランキング | 全ユーザーのプレイ回数に比例して増え続ける | **サーバーでページ分割する** |

全体ランキングは、それまで上位50件を取得して画面内でページ送りしていました。これでは51位以降を見られず、件数を増やせば転送量も増えます。そこで**全体ランキングの表だけ**、ページ番号をサーバーへ渡す形にしました。自分の記録まで変えると、オフラインでも見られる今の利点がなくなるため、変えていません。

### API：`GET /api/rankings/page`

既存の `GET /api/rankings` は配列を返しており、サマリー・分析タブが使っています。応答の形を変えると公開中のフロントエンドが壊れるため、**別のエンドポイントとして追加**しました。

```text
GET /api/rankings/page?mode=2&gameRule=timeAttack&page=2&size=10

{
  "items": [ ... 10件 ... ],
  "page": 2,
  "size": 10,
  "totalCount": 23,
  "totalPages": 3
}
```

画面のページ番号は1始まりのまま受け取り、OFFSETへの変換はサーバー側で行います。

```java
static int calculateOffset(int page, int size) {
    return (page - 1) * size;
}

static int calculateTotalPages(long totalCount, int size) {
    // 0件でも空の1ページ目として表示するため、最小値は1にする。
    return (int) Math.max(1, (totalCount + size - 1) / size);
}
```

`page` には上限（10000）を付けています。`(page - 1) * size` が int の範囲を超えないようにするためです。

### SQL：並び順を一意にする

Doma の SQL ファイルは次のとおりです。

```sql
ORDER BY
    score DESC
    , time ASC
    , created_at DESC
    , id DESC
LIMIT /* limit */10
OFFSET /* offset */0
```

既存のランキングSQLは `score, time, created_at` で並べていました。上位N件を取るだけならこれで足りますが、ページングでは**同じスコア・同じタイム・同じ作成日時の行があると、ページをまたいで行が重複したり抜けたりする**可能性があります。最後に `id DESC` を足して並びを一意にしました。

総件数は別の `COUNT(*)` で取ります。絞り込み条件は一覧のSQLとそろえないと、「全3ページなのに3ページ目が空」のような食い違いが起きるので、2つのSQLの `WHERE` は同じ書き方にしています。

### フロントエンド：古い応答で上書きしない

ページ送りや絞り込みを素早く操作すると、リクエストが重なります。ネットワークの状況によっては、**古い条件の応答が後から届いて、新しい条件の表示を上書きする**ことがあります。

`useRankingServerPaging.ts` では、リクエストに通し番号を付け、最新のものだけを反映しています。

```ts
const requestId = ++latestRequestId;
isLoading.value = true;
try {
  const result = await fetchPage({ ...options.filter.value, page: page.value, size: pageSize.value });
  if (requestId === latestRequestId) {
    rankingPage.value = result;
    hasError.value = false;
  }
} catch {
  // 取得に失敗しても、直前に表示できていたページは維持する。
  if (requestId === latestRequestId) {
    hasError.value = true;
  }
} finally {
  if (requestId === latestRequestId) {
    isLoading.value = false;
  }
}
```

ほかに、次の点を入れています。

- 絞り込み条件・表示行数が変わったら1ページ目へ戻す
- 「All（全件表示）」はAPIの上限である100件に丸める（全件を一度に取らない）
- 順位はページ内の番号ではなく、`offset + index + 1` で全体の順位を表示する
- サーバーでページ分割しているときは、列見出しでの並び替えを無効にする（表示中のページだけ並び替わると誤解を招くため）

## 3. PlaywrightでE2Eテストを書く

### 何を確認するか

単体テスト（Vitest）は400件近くありますが、「部品をつないだときに画面として動くか」は確認できていませんでした。E2Eでは次の流れを確認しています。

| ファイル | 確認すること |
| --- | --- |
| `game.e2e.ts` | 風船の単語を入力するとスコアが加算される / タイムアタックが制限時間で終わり、結果がランキングに保存される |
| `ranking.e2e.ts` | サマリー、グラフ（折れ線・棒）、指標の切り替え、画面内のページ送り、0件表示 |
| `ranking-server-paging.e2e.ts` | ページ番号と件数がAPIへ渡ること、全体順位の表示、絞り込み変更で1ページ目に戻ること、取得失敗時の表示維持 |
| `navigation.e2e.ts` | ブログ一覧→記事、404画面、ダークモードの切り替えと再読み込み後の維持 |

ランキング系はスマホ幅（Pixel 7）でも実行し、合計21ケースです。

### APIはモックし、本番と同じ「API有効」の状態で動かす

本番のビルドはAPI連携を有効にしています。E2Eも同じ状態で動かし、APIへのリクエストは `page.route` で差し替えました。モックしていないリクエストはすべて503で返すようにして、**意図しない通信が外へ出ない**ようにしています。

```ts
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(`${E2E_API_BASE_URL}/**`, (route) =>
      fulfillApi(route, { message: "E2Eテストでモックしていないリクエストです。" }, 503)
    );
    await use(page);
  },
});
```

全体ランキングのモックは、BEと同じ「絞り込み → OFFSET → LIMIT」の動きにして、送られたクエリを記録しています。

```ts
await page.getByRole("button", { name: "次のページ" }).click();
await expect(table.getByText("6-10 of 23")).toBeVisible();
// 2ページ目の先頭は、ページ内の1件目ではなく全体の6位として表示する。
await expect(table.locator("tbody tr").first()).toContainText("6位");
expect(pageRequests.at(-1)?.toString()).toBe("page=2&size=5");
```

### つまずいた点

E2Eを書く過程で、次の問題に当たりました。

**(1) Content-Security-Policy でAPIへの通信が止まった**

最初はモック用に存在しないURL（`http://127.0.0.1:18091`）を使いましたが、画面にデータが出ません。ブラウザのコンソールには次のエラーがありました。

```text
Connecting to 'http://127.0.0.1:18091/api/rankings?limit=50' violates the following
Content Security Policy directive: "connect-src 'self' https://api.clipdev.jp http://localhost:8091 ..."
```

`index.html` のCSPで、接続先を本番APIとローカルAPIに限定していたためです。`page.route` での差し替えより前に、ブラウザがCSPで止めていました。CSPを緩めるのではなく、E2Eの接続先を許可済みの `http://localhost:8091` に変えました。リクエストはすべて `page.route` で差し替わるため、ローカルでSpring Bootを起動していても実際のAPIには届きません。

あわせて、別オリジンへの `Content-Type: application/json` 付きリクエストはCORSのプリフライト（OPTIONS）が先に飛ぶので、モックの応答にもCORSヘッダーとOPTIONSへの204を付けています。

**(2) 開発サーバーでは途中で画面が再読み込みされた**

最初は `vite`（開発サーバー）に対してテストしていましたが、ゲームのテストが不安定でした。開発サーバーは初めて読み込む依存関係を最適化するとき、ページを再読み込みすることがあります。今回はランキング画面で初めて Chart.js を読み込んだタイミングでこれが起きていました。

そこで、**GitHub Pagesへ公開するものと同じビルド結果を `vite preview` で配信**する形に変えました。

```ts
webServer: {
  command: `npm run build && npx vite preview --port ${E2E_PORT} --strictPort`,
  url: `http://localhost:${E2E_PORT}${E2E_BASE_PATH}`,
},
```

ここでもう1つ問題が出ました。`vite.config.mjs` はベースパスを `command === "build"` のときだけ `/typingGame/` にしていましたが、`vite preview` の `command` は `"serve"` です。HTMLは `/typingGame/assets/...` を参照しているのに、previewは `/assets/...` で配信していて、すべてのJSが404になりました。`isPreview` を見るように直しています。

```js
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/typingGame/" : "/",
  // ...
}));
```

**(3) 入力欄に読み上げ名が付いていなかった**

ゲームの入力欄を `getByRole("textbox", { name: "好きな風船の単語を入力" })` で探したところ、見つかりませんでした。Playwrightのスナップショットでは、入力欄の名前がプレースホルダーの「例: balloon」になっていました。

原因は共通部品 `AppTextField.vue` です。

```vue
<UInput
  v-bind="inputAttrs"
  :aria-label="props.label || undefined"
/>
```

呼び出し側で渡した `aria-label` が `v-bind="inputAttrs"` で入ったあと、`label` を指定していない入力欄では `undefined` で上書きされていました。スクリーンリーダーで「例: balloon」と読まれる状態だったので、`label` がなければ呼び出し側の `aria-label` を使うように直しました。ロールと名前で要素を探すPlaywrightの書き方が、そのままアクセシビリティの確認になった例です。

**(4) タイムアタックの30秒を早送りできなかった**

`page.clock` で時計を早送りしようとしましたが、10ms間隔のストップウォッチと風船の移動処理が大量に実行され、逆に遅く不安定になりました。このテストだけは最短の30秒を実時間で待つことにしました。全体の実行時間は約1分です。

## 4. StrykerJSでミューテーションテストを入れる

### ミューテーションテストとは

ソースコードを機械的に少し書き換え（`>` を `>=` に、`&&` を `||` に、など）、**テストが失敗するか**を確かめる手法です。テストが失敗すれば変異を「倒した（killed）」、通ってしまえば「生き残った（survived）」と数えます。

行カバレッジは「そのコードを実行したか」しか分かりません。ミューテーションテストは「**実行した結果を検証しているか**」を確かめられます。

### 対象を絞る

全ファイルを対象にすると時間がかかり、画面表示中心のコードでは生き残った変異の多くが見た目だけの差分になります。今回は、値の誤りが利用者に直接見える計算ロジックだけを対象にしました。

```js
export default {
  testRunner: "vitest",
  mutate: [
    "src/utils/gameUtils.ts",          // スコア、ランク、ランキングの並び順
    "src/utils/chartUtils.ts",         // グラフ用データ
    "src/composables/useDataTableView.ts",      // 表の並び替え・ページ分割
    "src/composables/useRankingServerPaging.ts", // サーバーサイドページング
  ],
  thresholds: { high: 90, low: 80, break: 80 },
};
```

バックエンドにも PIT という同様のツールがありますが、BEのテストはSpring Bootを起動する結合テストが中心で、変異ごとに起動し直すと時間がかかりすぎます。今回は追加したページ計算（OFFSET・総ページ数）を単体テストで押さえるところまでにしました。

### 結果：87.24% → 95.69%

最初の実行結果です。

```text
File                        | % score | killed | survived
useDataTableView.ts         |   73.81 |     93 |       33
useRankingServerPaging.ts   |   89.71 |     61 |        7
chartUtils.ts               |   81.40 |     70 |       16
gameUtils.ts                |   94.00 |    282 |       16
All files                   |   87.24 |    506 |       72
```

`useDataTableView.ts` が低く、生き残った変異を見ると、テストの穴がはっきり分かりました。

```text
[Survived] ConditionalExpression
src/composables/useDataTableView.ts:39:23
-     const isLeftEmpty = left === null || left === undefined;
+     const isLeftEmpty = false;
```

「空値は末尾へ寄せる」ための判定を消しても、テストが通っていました。既存のテストは次のようなものでした。

```ts
expect(compareTableValues(null, 1)).toBeGreaterThan(0);
```

空値の判定がなくなると、`null` は文字列の `"null"` として比較されます。`"null"` と `"1"` を比べると、たまたま `"null"` が後ろになるため、**判定を消しても同じ結果になっていた**のです。数値の比較も同様で、`3` と `10` を文字列として比べても符号だけなら一致してしまうケースを使っていました。

そこで、「判定がなければ結果が変わる」値でテストし直しました。

```ts
it("数値同士は文字列ではなく数値の差で比較する", () => {
  // 文字列比較では "10" < "3" になるため、差の値まで確認する。
  expect(compareTableValues(3, 10)).toBe(-7);
});

it("null・undefinedは、文字列として比べると前に来る値よりも後ろへ寄せる", () => {
  // "null" / "undefined" を文字列として比べると "z" より前になるため、空値の判定が効いているか分かる。
  expect(compareTableValues(null, "z")).toBe(1);
  expect(compareTableValues(undefined, "z")).toBe(1);
});
```

`useRankingServerPaging.ts` では、`finally` の中の `if (requestId === latestRequestId)` を `if (true)` にしても生き残っていました。「古いリクエストが成功して後から届く」テストはあったものの、「**古いリクエストが失敗して後から届く**」テストがなく、そのときに最新の表示がエラー扱いに戻らないことを確認できていませんでした。このケースと「応答待ちの間は読み込み中になる」ケースを追加しました。

```text
File                        | % score | killed | survived
useDataTableView.ts         |   96.03 |    121 |        5
useRankingServerPaging.ts   |   97.06 |     66 |        2
chartUtils.ts               |  100.00 |     86 |        0
gameUtils.ts                |   94.00 |    282 |       16
All files                   |   95.69 |    555 |       23
```

残った変異の多くは、`x * direction` を `x / direction` にしたもの（`direction` は1か-1なので結果が変わらない）のように、**書き換えても動作が変わらない変異**です。これらを倒すためにテストを増やすことはしていません。

### CIでの扱い

ミューテーションテストは通常のテストより時間がかかるため、PRごとの必須チェックにはしていません。対象の4ファイルかそのテストを変更したPRと、手動実行のときだけ GitHub Actions で動かし、HTMLレポートを成果物として残します。E2Eは毎回のPRで実行します。

## まとめ

| 項目 | 内容 |
| --- | --- |
| グラフ | Chart.jsで推移の折れ線とランク分布の棒。データは純粋関数に分けてVitestで検証 |
| ページング | 全体ランキングの表だけ、`page` / `size` をサーバーへ渡し LIMIT / OFFSET で取得。並び順は `id` で一意に |
| E2E | Playwrightで21ケース。APIはモック、本番と同じビルドをpreviewで配信 |
| ミューテーション | StrykerJSで計算ロジック4ファイルを対象に、87.24% → 95.69% |

E2Eでは、CSP、previewのベースパス、入力欄の読み上げ名という、単体テストでは見つからない問題が3つ見つかりました。ミューテーションテストでは、「テストはあるのに、たまたま同じ結果になるので検証になっていない」箇所が見つかりました。どちらも、テストの数を増やすより、**テストが何を確かめているかを見直す**きっかけになりました。
