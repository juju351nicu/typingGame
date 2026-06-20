# Phase 5: Time Attack Mode Plan

Phase5 では、通常モードとは別にタイムアタックモードを追加します。

## 目的

現在の通常モードは、風船が画面上部に到達したらゲーム終了になります。

タイムアタックモードでは、30秒 / 60秒 / 90秒などの制限時間内に、どれだけスコア、WPM、正確率を伸ばせるかを競う形にします。

## 方針

- 既存の通常モードは壊さない。
- 最初は 30秒 / 60秒 / 90秒 の固定選択にする。
- タイムアタック専用のタイマーは、単語追加・単語移動タイマーとは別責務で管理する。
- ランキング保存は既存の localStorage 保存を活かし、必要な項目だけ追加する。
- UI は設定画面でゲームモードと制限時間を選ぶ形にする。

## モード定義

```text
normal
timeAttack
```

通常モード:

- 風船が上部に到達したら終了
- 現在のゲームルールを維持

タイムアタックモード:

- 制限時間が 0 になったら終了
- 風船が上部に到達した場合の扱いは、初期実装では通常モードと同じくゲーム終了にする
- 将来的に「時間切れまで継続」に変える余地を残す

## 設定項目

`config` store に追加候補:

```ts
gameRule: "normal" | "timeAttack";
timeLimitSeconds: 30 | 60 | 90;
```

定数候補:

```ts
GAME_RULE = {
  NORMAL: "normal",
  TIME_ATTACK: "timeAttack",
}

TIME_ATTACK_LIMITS = [
  { title: "30秒", value: 30 },
  { title: "60秒", value: 60 },
  { title: "90秒", value: 90 },
]
```

## composable 分割案

### useTimeAttackTimer.ts

タイムアタック専用の残り時間を管理します。

責務:

- 残り秒数を保持する
- カウントダウンを開始する
- 一時停止ではなく停止・リセットだけを持つ
- 0秒になったらゲーム終了 callback を呼ぶ
- unmount / reset 時に interval を止める

想定API:

```ts
const {
  remainingSeconds,
  startTimeAttackTimer,
  stopTimeAttackTimer,
  resetTimeAttackTimer,
} = useTimeAttackTimer();
```

### useGameRule.ts

モードごとの終了条件を薄くまとめる候補です。

最初から作りすぎず、`TypingPanel.vue` が読みにくくなった時点で切り出します。

## UI 変更案

### SettingsPage.vue

追加するもの:

- ゲームモード選択
  - 通常モード
  - タイムアタック
- タイムアタック選択時だけ制限時間を表示
  - 30秒
  - 60秒
  - 90秒

### GamePage.vue / TypingPanel.vue

追加するもの:

- タイムアタック時の残り時間表示
- 通常モードでは現在のタイマー表示を維持

## スコア保存

既存のスコア保存に追加候補:

```ts
gameRule: "normal" | "timeAttack";
timeLimitSeconds?: number;
```

ランキング画面では、初期実装では既存項目に影響を出さないようにし、必要であればフィルターを追加します。

## 実装順

1. 定数と型を追加する
2. config store にゲームルールと制限時間を追加する
3. SettingsPage.vue にゲームモード / 制限時間の選択UIを追加する
4. useTimeAttackTimer.ts を追加して Vitest を書く
5. TypingPanel.vue にタイムアタック終了条件を接続する
6. ResultModal / RankingPage に表示項目を最小追加する
7. README の Features / Roadmap を更新する

## 注意点

- `useTypingTimers.ts` にタイムアタックの interval を混ぜすぎない。
- タイムアタック終了時も `stopTimers()` を必ず呼び、既存 interval を残さない。
- 通常モードの終了条件を変えない。
- localStorage の既存データが壊れないよう、追加項目は optional から始める。
- テストはまず `useTimeAttackTimer.ts` とモード判定ロジックを優先する。

## 最初の実装単位

次回は以下から着手します。

```text
定数と型を追加する
config store に gameRule / timeLimitSeconds を追加する
SettingsPage.vue に選択UIを追加する
```

この段階では、まだゲーム終了条件には接続しません。

まず「設定として選べる」状態を作り、その次にタイマー処理へ接続します。
