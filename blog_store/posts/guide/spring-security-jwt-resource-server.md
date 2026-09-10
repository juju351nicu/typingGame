---
id: spring-security-jwt-resource-server
title: Spring Security Resource ServerでJWT Bearer認証を実装する
date: 2026-07-11
section: guide
description: Spring BootでセッションCookie方式からJWT Bearer認証へ移行するため、OAuth2 Resource Serverを使ってJWTの発行と検証を実装した構成、認証フロー、保存先の選択理由をまとめました。
tags: Spring Boot, Spring Security, JWT
---

# Spring Security Resource ServerでJWT Bearer認証を実装する

typingGameのバックエンドは、最初セッションCookie方式のログインで動いていました。フロントエンドをGitHub Pages、バックエンドを別ホストで公開する構成に決めた時点で、これをJWT Bearer認証へ移しています。

Cookie方式でも実装はできます。ただ別オリジン構成だと、SameSite、Secure、Cookieドメイン、CORS、さらにCSRF対策までを同時に考えることになります。この段階で確かめたかったのはFE/BE間の認証経路そのものだったので、`Authorization` ヘッダーで認証情報を運ぶBearer token方式を選びました。

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

## 独自フィルターではなくResource Serverへ寄せる

JWTの検証は、Spring SecurityのOAuth2 Resource Server / JOSE系に任せています。

独自フィルターを一から書く方法もあります。ただそれだと署名検証、有効期限の判定、401応答を自分で組み立てることになり、Spring Securityが標準でどこまで面倒を見てくれるのかが分からないまま進みます。まずは標準の認証フローを把握したかったので、Bean定義とセキュリティ設定だけで完結する側を選びました。

構成は次の6つです。

- `spring-boot-starter-oauth2-resource-server` を追加
- `JwtConfig` で `JwtEncoder` と `JwtDecoder` をBean化
- `JwtTokenService` でログイン成功時のaccess tokenを生成
- `JwtProperties` でsecret、有効期限、issuerを設定化
- `SecurityConfig` でResource ServerのJWT認証を有効化
- `JwtLoginUserDetailsConverter` でJWTからログインユーザー情報を復元

## ログインレスポンス

ログイン成功時は、従来のユーザー情報に加えてJWTを返します。

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

フロントエンドはこのtokenを `sessionStorage` へ保存し、API呼び出し時に `Authorization` ヘッダーへ付けます。

```http
Authorization: Bearer xxxxx.yyyyy.zzzzz
```

## トークンとスコアで保存先を分ける

この開発で混同しないようにしたのが、ブラウザ側の保存先の役割です。未ログインユーザーのスコアは `localStorage`、JWT access tokenは `sessionStorage` に置いています。

スコア保存と認証token保存を同じ場所へ寄せると、あとから「どちらの都合で消していいのか」が判断しづらくなります。実際、スコア履歴はユーザーが明示的に初期化するまで残したい一方、tokenはセッション終了とともに消えてほしいので、寿命の要件がそもそも違います。`localStorage` 側の永続化設計は[Vue + Piniaでゲーム結果をlocalStorageへ永続化し、API障害時も結果を残す](vue-pinia-localstorage-persistence)にまとめています。

### sessionStorageを選んだ理由とトレードオフ

`localStorage` ではなく `sessionStorage` にしたのは、タブを閉じたらトークンが残らないためです。共用端末で開きっぱなしにしても、セッション終了とともに消えます。

ただし、これはトレードオフのある選択です。`sessionStorage` はJavaScriptから読めるため、XSSが成立した場合はトークンを取得されます。読み取り自体を防ぐなら、JavaScriptから読めない `HttpOnly` Cookieへ入れる方式があります。とはいえCookie方式にはCSRF対策という別の設計課題があり、別ホスト構成ではSameSite、Secure、Cookieドメインの検討も戻ってきます。

つまりCookieを避けた理由と、Cookieの方が安全になりうる理由は同じ場所にあります。どちらが安全かは一律に決まらず、XSS対策とCSRF対策のどちらをどう作り込むかという設計の問題です。ここではFE/BE別ホスト構成の疎通と認証の仕組みを理解する方を優先しました。実サービスとして運用するなら、`HttpOnly` Cookie方式との比較と、リフレッシュトークンの扱いを検討する必要があります。

## 401レスポンス

認証失敗時のレスポンスは、フロントエンドで扱いやすいように既存の `fieldErrors` 形式へ揃えています。tokenが無い場合、不正な場合、期限切れの場合で形が変わらないため、画面側のエラー表示を共通化できます。

なお、tokenを付けずに認証必須APIを叩けば401が返りますが、これは実装ミスではなくSpring Securityまで到達している合図です。動作確認では、この401が返ることそのものを期待値として扱っています。

## 動作確認

ログイン成功時にJWTが返り、そのBearer tokenで `/api/auth/me` と `/api/me/scores` を呼べること、不正tokenでは401になることを確認しました。Swagger UIのBearer認証からも同じ経路を試せます。ControllerテストではJWT認証付きのAPIを対象にしています。

## この構成にして効いたところ

署名検証、有効期限、401応答を自前で書かずに済み、`JwtDecoder` のBean定義とセキュリティ設定だけで認証が通っています。

もう1つ効いたのは、認証情報が `Authorization` ヘッダー1本に収まったことです。あとからフロントエンドをGitHub Pages、バックエンドをEC2に置く構成へ進めたとき、CORSの許可オリジンを設定するだけで疎通できました。Cookieのままなら、ここでSameSiteとドメインの調整が追加で必要になっていたはずです。

`JWT_SECRET` を含む本番設定の分離は[Spring Bootの本番設定を環境変数へ分離する](spring-boot-prod-env-settings)、この構成を実際にEC2へ公開した手順は[GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](ec2-spring-boot-https-frontend-connection)で扱っています。
