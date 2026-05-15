# Balloon Typing Game

## 概要

Vue3 + TypeScript で作成したタイピングゲームです。
画面下から浮かび上がる風船型の単語を入力し、スコアを競います。
単語を正しく入力すると風船が消え、スコアが加算されます。

---

## スクリーンショット

![ゲーム画面](./public/images/typing-baloon-demo.png)

## デモ

https://juju351nicu.github.io/typingGame/

---

## 使用技術

- Vue 3
- TypeScript
- Vite
- Pinia（状態管理）
- Vuetify（UI）
- Vitest（テスト）

---

## 主な機能

- タイピング入力判定
- スコア表示・更新
- 難易度設定
- スコア保存（localStorage）
- ゲームオーバー判定
- 風船 UI 表示

---

## 工夫した点

- Pinia を使い、ゲーム設定とスコアを一元管理
- localStorage を利用してスコアを永続化
- setInterval のタイマー ID を管理し、多重起動バグを防止
- コンポーネント分割により、保守性を向上（Game / Score / Config）
- Vitest を導入し、ユーティリティ関数のテストを実装
- CSS を工夫し、風船 UI でゲームらしい演出を実装

---

## 苦労した点

- setInterval の管理が難しく、多重起動バグの対応に時間がかかった
- Vue のリアクティブ更新とタイマー処理の整合性調整

---

## 今後の改善

- 仮想キーボードの追加
- ランキング機能
- UI/UX の強化
- Nuxt への移行検討

---

## 起動方法

```bash
npm install
npm run dev
```

---

## ビルド

```bash
npm run build
```
