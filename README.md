# Balloon Typing Game

## 概要

Vue3 + TypeScriptで作成したタイピングゲームです。
画面上に表示される単語を入力し、スコアを競います。
単語は風船（バルーン）として表示され、入力成功で破裂する演出を実装しています。

---
## スクリーンショット

![ゲーム画面](./public/images/typing-baloon-demo.png)

## デモ

※GitHub Pages URLをここに貼る

---

## 使用技術

* Vue 3
* TypeScript
* Vite
* Pinia（状態管理）
* Vuetify（UI）
* Vitest（テスト）

---

## 主な機能

* タイピング入力判定
* スコア表示・更新
* 難易度設定
* スコア保存（localStorage）
* ゲームオーバー判定
* 風船UI表示

---

## 工夫した点

* Piniaを使い、ゲーム設定とスコアを一元管理
* localStorageを利用してスコアを永続化
* setIntervalのタイマーIDを管理し、多重起動バグを防止
* コンポーネント分割により、保守性を向上（Game / Score / Config）
* Vitestを導入し、ユーティリティ関数のテストを実装
* CSSを工夫し、風船UIでゲームらしい演出を実装
---

## 苦労した点

* setIntervalの管理が難しく、多重起動バグの対応に時間がかかった
* Vueのリアクティブ更新とタイマー処理の整合性調整

---

## 今後の改善

* 仮想キーボードの追加
* ランキング機能
* UI/UXの強化
* Nuxtへの移行検討

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
