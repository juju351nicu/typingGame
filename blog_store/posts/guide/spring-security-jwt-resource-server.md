---
id: spring-security-jwt-resource-server
title: Spring SecurityをJWT Bearer認証に対応させた記録
date: 2026-07-11
section: guide
description: Spring Bootバックエンドで、セッションCookie方式からJWT Bearer認証へ寄せるために、Resource Server構成、JWT発行、認証情報復元を実装した流れをまとめました。
---

# Spring SecurityをJWT Bearer認証に対応させた記録

typingGame のバックエンドでは、Spring Securityを使ってログイン機能を実装しています。

最初はセッションCookie方式で動かしていましたが、GitHub Pagesで公開するフロントエンドと、将来EC2などで公開するバックエンドを接続しやすくするため、JWT Bearer認証にも対応しました。

## JWT化した理由

フロントエンドをGitHub Pages、バックエンドを別ホストで動かす場合、Cookie認証では考えることが増えます。

- SameSite
- Secure
- HTTPS
- Cookieドメイン
- CORS
- ブラウザのCookie設定

これらを学ぶことも大事ですが、まずは `Authorization` ヘッダーで認証情報を送るJWT方式に寄せることで、FE/BE別ホスト構成の疎通確認をしやすくしました。

## 採用した構成

JWTの検証は、Spring SecurityのOAuth2 Resource Server / JOSE系に寄せました。

独自フィルターを一から作る方法もありますが、今回はSpring Security標準の流れを学びたかったためです。

主な構成は次の通りです。

- `spring-boot-starter-oauth2-resource-server` を追加
- `JwtConfig` で `JwtEncoder` と `JwtDecoder` をBean化
- `JwtTokenService` でログイン成功時のaccess tokenを生成
- `JwtProperties` でsecret、有効期限、issuerを設定化
- `SecurityConfig` でResource ServerのJWT認証を有効化
- `JwtLoginUserDetailsConverter` でJWTからログインユーザー情報を復元

## ログインレスポンス

ログイン成功時には、従来のユーザー情報に加えてJWTを返すようにしました。

```json
{
  "accessToken": "xxxxx.yyyyy.zzzzz",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "loginEmail": "user@example.com"
  }
}
```

フロントエンド側では、このtokenを `sessionStorage` に保存し、API呼び出し時に `Authorization` ヘッダーへ付けます。

```http
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

## localStorageとsessionStorageを分ける

この開発で混同しないようにしたのが、保存先の役割です。

- localStorage: 未ログインユーザーのスコア保存
- sessionStorage: JWT access token保存
- Cookie: セッション方式の移行期間・ローカル学習用

スコア保存と認証token保存を同じ場所に寄せると、あとから責務が分かりにくくなります。

そのため、JWTは `sessionStorage` に保存し、`localStorage` はランキング履歴の保存用途に限定しました。

## 401レスポンス

認証失敗時のレスポンスも、フロントエンドで扱いやすいように既存の `fieldErrors` 形式へ揃えました。

tokenが無い場合、不正な場合、期限切れの場合でも、画面側のエラー表示を共通化しやすくするためです。

## 確認したこと

実装後は、次の確認を行いました。

- ログイン成功時にJWTが返る
- Bearer token付きで `/api/auth/me` を呼べる
- Bearer token付きで `/api/me/scores` を呼べる
- 不正tokenで401が返る
- Swagger UIからBearer認証を試せる
- ControllerテストでJWT認証APIを確認する

## 学んだこと

Spring Securityは、Cookie認証だけの仕組みではありません。

認証方式をどう選び、どのAPIを保護し、フロントエンドがどこに認証情報を持つかまで含めて設計する必要があります。

今回JWT化したことで、GitHub PagesとEC2バックエンドをつなぐ次の段階へ進みやすくなりました。
