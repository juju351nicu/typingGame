---
id: spring-boot-prod-env-settings
title: Spring Bootのprod設定と環境変数を整理した記録
date: 2026-07-12
section: guide
description: Spring BootバックエンドをEC2公開へ進める前に、application-prod.yml、DB接続、JWT secret、CORS、Swagger公開設定を環境変数で整理した流れをまとめました。
tags: Spring Boot, AWS, 環境変数
---

# Spring Bootのprod設定と環境変数を整理した記録

typingGame のバックエンドを将来EC2へ公開するために、`application-prod.yml` を追加し、本番相当の設定を整理しました。

目的は、いきなり本番運用を完成させることではなく、公開前に「GitHubに載せてはいけない値」と「環境ごとに変える値」を分けることです。

## 整理した設定

prod profileでは、主に次の値を環境変数から受け取るようにしました。

```text
SPRING_PROFILES_ACTIVE=prod
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
JWT_EXPIRES_IN_SECONDS
JWT_ISSUER
APP_CORS_ALLOWED_ORIGINS
SERVER_ADDRESS
SERVER_PORT
SPRINGDOC_ENABLED
```

ローカル開発では固定値があると便利ですが、本番相当の設定ではDBパスワードやJWT署名鍵をリポジトリに置かないことを優先しました。

## JWT_SECRETはデフォルトなしにする

特に注意したのは `JWT_SECRET` です。

開発用のsecretがそのまま本番で使われると危険なので、prod profileではデフォルト値を置かないようにしました。

```yaml
app:
  jwt:
    secret: ${JWT_SECRET}
```

これにより、環境変数を設定し忘れた場合は起動時に気づけます。

便利さよりも、危ない状態で起動しないことを優先しました。

## Swaggerを本番でデフォルト無効にする

Swagger UIはローカル開発では便利ですが、公開環境で出しっぱなしにする必要はありません。

そのため、prod profileでは次のようにデフォルト無効にしました。

```yaml
springdoc:
  api-docs:
    enabled: ${SPRINGDOC_ENABLED:false}
  swagger-ui:
    enabled: ${SPRINGDOC_ENABLED:false}
```

必要なときだけ `SPRINGDOC_ENABLED=true` を指定して有効化する方針です。

## CORSを環境変数化する

GitHub PagesのフロントエンドからEC2上のAPIを呼ぶ場合、CORSの許可Originを正しく設定する必要があります。

typingGameでは、次のように環境変数で外出ししました。

```text
APP_CORS_ALLOWED_ORIGINS=https://juju351nicu.github.io
```

ここで指定するのはURL全体ではなく、Originです。
つまり、`/typingGame/` のようなパスは含めません。

## DB設定

DB接続情報も環境変数にしました。

```text
DB_URL=jdbc:mysql://localhost:3306/typing_game?serverTimezone=Asia/Tokyo&useUnicode=true&characterEncoding=UTF-8
DB_USERNAME=typing_game_app
DB_PASSWORD=...
```

EC2で最初に動かす場合は、まずEC2内MySQLから始め、後からRDS化やDocker化を検討する方針にしています。

最初から全部を本格構成にすると、どこで詰まったのか分かりにくくなるためです。

## 学んだこと

本番設定の整理は、コードを書く作業より地味です。

しかし、DBパスワード、JWT secret、CORS、Swagger公開設定のような値を曖昧にしたまま公開へ進むと、あとで危ない状態になります。

今回 `application-prod.yml` を分けたことで、次のPhase10ではEC2上で `prod` profileを起動し、GitHub PagesのフロントエンドからAPI接続を確認する準備ができました。
