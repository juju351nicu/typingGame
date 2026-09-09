---
id: spring-security-jwt-resource-server
title: Spring Security Resource ServerでJWT Bearer認証を実装する
date: 2026-07-11
section: guide
description: Spring BootでセッションCookie方式からJWT Bearer認証へ移行するため、OAuth2 Resource Serverを使ってJWTの発行と検証を実装した構成、認証フロー、保存先の選択理由をまとめました。
tags: Spring Boot, Spring Security, JWT
---

# Spring Security Resource ServerでJWT Bearer認証を実装する

typingGameのバックエンドでは、Spring Securityでログイン機能を実装しています。

当初はセッションCookie方式で動かしていましたが、フロントエンドをGitHub Pages、バックエンドを別ホストで公開する構成にすると、Cookieでは考えることが増えます。そこでJWT Bearer認証へ移行しました。

この記事では、Spring Security標準のOAuth2 Resource Serverを使ってJWTの発行と検証を実装した構成と、トークンの保存先をどう選んだのかをまとめます。

## 認証の全体像

先に、ログインからAPI呼び出しまでの流れを示します。以降の各クラスは、この図のどこかを担当しています。

```text
Vue (フロントエンド)
  │
  │ POST /api/auth/login
  ▼
Spring Boot
  │  JwtTokenService が access token を発行
  │  JwtEncoder で署名
  ▼
Vue
  │  accessToken を sessionStorage へ保存
  │
  │ Authorization: Bearer <token>
  ▼
Spring Security
  │  Resource Server が Bearer token を受け取る
  │  JwtDecoder で署名と有効期限を検証
  │  JwtLoginUserDetailsConverter でユーザー情報を復元
  ▼
Controller
     認証済みユーザーとして処理
```

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

そのため、JWTは `sessionStorage` に保存し、`localStorage` はランキング履歴の保存用途に限定しました。localStorage側の永続化設計は[Vue + Piniaでゲーム結果をlocalStorageへ永続化し、API障害時も結果を残す](vue-pinia-localstorage-persistence)にまとめています。

### sessionStorageを選んだ理由とトレードオフ

`localStorage` ではなく `sessionStorage` にしたのは、タブを閉じたらトークンが残らないためです。共用端末で開きっぱなしにした場合でも、セッション終了とともにトークンが消えます。

ただし、これはトレードオフのある選択です。

- `sessionStorage` はJavaScriptから読めるため、XSSが成立した場合はトークンを取得される
- XSSによるトークン読み取り自体を防ぐ選択肢としては、JavaScriptから読めない `HttpOnly` Cookieへ入れる方式がある
- ただしCookie方式にはCSRF対策という別の設計課題があり、別ホスト構成ではSameSite、Secure、Cookieドメインの検討も必要になる

今回はFE/BE別ホスト構成の疎通と認証の仕組みを理解することを優先し、`sessionStorage` を選びました。どちらが安全かは一律に決まるものではなく、XSS対策とCSRF対策のどちらをどう作り込むかという設計の問題です。実サービスとして運用する場合は、`HttpOnly` Cookie方式との比較と、リフレッシュトークンの扱いを検討する必要があります。

## 401レスポンス

認証失敗時のレスポンスも、フロントエンドで扱いやすいように既存の `fieldErrors` 形式へ揃えました。

tokenが無い場合、不正な場合、期限切れの場合でも、画面側のエラー表示を共通化しやすくするためです。

## 動作確認

実装後、次の観点で確認しました。

- ログイン成功時にJWTが返る
- Bearer token付きで `/api/auth/me` を呼べる
- Bearer token付きで `/api/me/scores` を呼べる
- 不正tokenで401が返る
- Swagger UIからBearer認証を試せる
- ControllerテストでJWT認証APIを確認する

## まとめ

Spring Securityは、Cookie認証だけの仕組みではありません。認証方式をどう選び、どのAPIを保護し、フロントエンドがどこに認証情報を持つかまで含めて設計する必要があります。

今回はJWT発行と検証を独自フィルターで作らず、Spring Security標準のResource Serverへ寄せました。署名検証、有効期限、401応答といった実装を自前で書かずに済み、`JwtDecoder` のBean定義とセキュリティ設定だけで完結しています。

この構成にしたことで、フロントエンドをGitHub Pages、バックエンドをEC2に置く別ホスト構成でも、`Authorization` ヘッダーだけで認証を通せるようになりました。

`JWT_SECRET` を含む本番設定の分離は[Spring Bootの本番設定を環境変数へ分離する](spring-boot-prod-env-settings)、この構成を実際にEC2へ公開した手順は[GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](ec2-spring-boot-https-frontend-connection)で扱っています。
