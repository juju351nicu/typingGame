---
id: use-a-custom-domain-name
title: Use a custom domain name
date: 2019-02-09
section: guide
description: TODO WIP
---

# Use a custom domain name Vitestを使ったモダンなJavaScriptテスト入門
#### February 9, 2019

## 1.- はじめに

モダンなJavaScript開発において、効率的で信頼性の高いテスト戦略を構築することは非常に重要です。
本記事では、高速で使いやすいテストフレームワークである「Vitest」について詳しく解説します。
Vitestの基本的な使い方から、非同期テスト、モック、カバレッジまで、実践的な知識を提供します。


## 2.- Vitestとは

Vitestは、Vite上に構築された高速なユニットテストフレームワークです。
Jest互換のAPIを持ちながら、Viteのエコシステムを活用して高速な実行と設定の簡素化を実現しています。


## 3.- テストファイルの基本構造
Vitestのテストファイルは、以下のような基本構造を持ちます：
```javascript
// ここにコードを記述
// 必要なモジュールをインポート
import { describe, it, expect } from 'vitest'
import { someFunction } from './someModule'

// someFunctionのテストスイートを定義
describe('someFunction', () => {
  // 期待される結果を返すかテスト
  it('should return the expected result', () => {
    const result = someFunction()
    expect(result).toBe('expected result')
  })

  // 無効な入力に対してエラーを投げるかテスト
  it('should throw an error when given invalid input', () => {
    expect(() => someFunction(null)).toThrow('Invalid input')
  })
})
```
ここでのポイントは：

describeでテストのグループを定義
itで個々のテストケースを記述
expectでアサーションを行う
## 4.- 主要な関数とマッチャー

Vitestでは、以下のような関数とマッチャーがよく使われます：

describe, it, test: テストの構造を定義
expect: アサーションを行う
toBe(), toEqual(), toContain(), toThrow(): 値の比較や検証

## 5.- 非同期テスト
非同期処理のテストも簡単に書くことができます：
```javascript
// 必要なモジュールをインポート
import { describe, it, expect } from 'vitest'
import { fetchData } from './api'

// fetchData関数のテストスイートを定義
describe('fetchData', () => {
  // 正常にデータを取得できるかテスト
  it('should return data', async () => {
    // fetchData関数を呼び出し、結果を待機
    const data = await fetchData()
    // 返されたデータが期待通りの形式かチェック
    expect(data).toEqual({ id: 1, name: 'John' })
  })

  // 無効なIDでエラーを投げるかテスト
  it('should throw an error for invalid ID', async () => {
    // fetchDataに無効なID(-1)を渡し、エラーが発生することを期待
    await expect(fetchData(-1)).rejects.toThrow('Invalid ID')
  })
})
```

## 6.- モックとスパイ
Vitestでは、関数やモジュールのモックも簡単に行えます：
```javascript
// Vitestからviオブジェクトをインポート
import { vi } from 'vitest'

// モック関数の作成
const mockFn = vi.fn()

// モック関数の戻り値を設定
mockFn.mockReturnValue('mocked value')

// モジュール全体のモック
vi.mock('./someModule', () => ({
  // someModule内のsomeFunctionをモック化
  someFunction: vi.fn().mockReturnValue('mocked value')
}))
```
## 7.- セットアップと解体
テストの前後で共通の処理を行いたい場合は、以下の関数を使用します：

- beforeEach: 各テストの前に実行
- afterEach: 各テストの後に実行
- beforeAll: すべてのテストの前に1回実行
- afterAll: すべてのテストの後に1回実行

## 8.- スナップショットテスト
コンポーネントの出力が期待通りか確認するためのスナップショットテストも簡単に実装できます：
```javascript
it('should match snapshot', () => {
  const user = { name: 'John', age: 30 }
  expect(user).toMatchSnapshot()
})
```

## 9.- カバレッジ
コードカバレッジを取得するには、package.jsonに以下のスクリプトを追加します：
```javascript
{
  "scripts": {
    "test:coverage": "vitest run --coverage"
  }
}
```

## 10.- まとめ
Vitestは、モダンなJavaScript開発に適した高速で使いやすいテストフレームワークです。Jestと似たAPIを持ちながら、Viteのエコシステムを活用することで、より効率的なテスト環境を提供します。基本的なテストの書き方から、非同期テスト、モック、カバレッジまで、幅広い機能をサポートしているため、様々なプロジェクトで活用することができます。

Vitestを導入することで、開発者はより迅速かつ効果的にテストを書くことができ、結果としてプロジェクトの品質向上につながります。ぜひ、あなたのプロジェクトでVitestを試してみてください。
