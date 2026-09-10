---
id: spring-boot-prod-env-settings
title: Spring Bootの本番設定を環境変数へ分離する — DB・JWT・CORS・Swagger
date: 2026-07-12
section: guide
description: Spring Bootのapplication-prod.ymlを追加し、DB接続情報、JWT secret、CORS許可Origin、Swagger公開設定をリポジトリから環境変数へ分離した方針と、その判断理由をまとめました。
tags: Spring Boot, AWS, 環境変数
---

# Spring Bootの本番設定を環境変数へ分離する — DB・JWT・CORS・Swagger

Vue 3のフロントエンドとSpring BootのバックエンドでタイピングゲームtypingGameを開発しています。バックエンドを外部公開するにあたり、まず設定ファイルの整理から着手しました。

公開してから設定を直すのでは遅い値があります。DBパスワードとJWT署名鍵です。これらがリポジトリに残ったまま公開すると、あとから消してもGit履歴には残り続けます。

そこで `application-prod.yml` を追加し、「GitHubへ載せてはいけない値」と「環境ごとに変える値」を環境変数へ分離しました。

なお、この設定を実際にEC2上で起動し、GitHub PagesのフロントエンドからHTTPS接続するまでの手順は、[GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](ec2-spring-boot-https-frontend-connection)で扱います。この記事は、その前段の設定設計にあたります。

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

このsecretを使ってJWTを発行・検証している実装は[Spring Security Resource ServerでJWT Bearer認証を実装する](spring-security-jwt-resource-server)にまとめています。

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

接続先を環境変数にしておくと、DBの置き場所を変えてもアプリ側のコードは変わりません。実際にこのあとEC2へ公開した際は、EC2上のDocker Composeで起動したMySQLへ `DB_URL` だけを向けて接続しています。MySQL側の定義は[Docker ComposeでMySQL 8.4の開発環境を統一する](docker-compose-mysql-local-db)にまとめています。

最初から全部を本格構成にすると、どこで詰まったのか分かりにくくなるため、変わる可能性がある値を外へ出すことを優先しました。

## 振り返り

`JWT_SECRET` にデフォルト値を置かない形にしたときは、少し迷いました。起動が失敗する設定をわざわざ作ることになるので、開発中に何度も踏む可能性があります。

ただ、デフォルト値を置いた場合の失敗の形は「起動しない」ではなく「開発用の鍵のまま本番が動く」になります。前者はその場で気づけますが、後者は気づける保証がありません。起動時に落ちる方を選んだのはそのためです。

この `application-prod.yml` は、後にEC2上で `/etc/typing-game-backend.env` から環境変数を渡す形でそのまま利用しました。設定を先に分離しておいたため、公開時に触る必要があったのは値だけで、コードの変更は発生していません。
