---
id: docker-compose-mysql-local-db
title: Docker ComposeでMySQLを固定した記録
date: 2026-08-14
section: guide
description: EC2学習へ進む前に、Rancher DesktopとDocker ComposeでMySQL 8.4を固定し、Spring Bootはローカル起動のままDBだけコンテナ化した流れをまとめました。
tags: Docker, MySQL, Spring Boot
---

# Docker ComposeでMySQLを固定した記録

typingGame のバックエンドをEC2へ進める前に、ローカルのMySQL環境をDocker Composeで固定しました。

目的は、いきなり本番運用の形を完成させることではありません。

まずは、別PCでも同じMySQLの条件でSpring Bootバックエンドを動かせるようにすることです。

## なぜMySQLをDocker化したか

ローカルに直接入っているMySQLは、PCごとにバージョンや初期設定が違う可能性があります。

たとえば、次のような差分が出やすいです。

- MySQLのバージョン
- 文字コードや照合順序
- タイムゾーン
- 認証方式
- rootユーザーやアプリ用ユーザーの作り方
- 既存テーブルや古いデータの有無

自分のMacでは動くけれど、Ubuntu PCや別の開発環境ではDB起動やmigrationで詰まる、という状態を減らしたいと考えました。

そこで、EC2学習へ入る前の小タスクとして、まずMySQLだけをDocker Composeで固定することにしました。

## Spring Boot本体はまだDocker化しない

今回Docker化したのはMySQLだけです。

Spring Bootアプリ本体は、これまで通りローカルのJavaとMavenで起動します。

```bash
./mvnw spring-boot:run
```

この判断にした理由は、今の目的が「アプリ全体をコンテナ化すること」ではなく、「DB条件をそろえること」だからです。

最初からSpring Boot本体、MySQL、Nginx、CI/CD、イメージビルドまで一気にDocker化すると、うまく動かないときに原因が分かりにくくなります。

今回は学習の段階を小さく分けました。

```text
今回やること
MySQLだけDocker Composeで固定する

まだやらないこと
Spring Boot本体のDocker化
Jibによるイメージ作成
GitHub Actionsからの自動デプロイ
```

## Rancher Desktopを使う

ローカルのDocker環境として、Rancher Desktopを使いました。

設定では、Docker CLIで扱いやすいように `dockerd (moby)` を選びました。

Kubernetesは今回の目的では使わないため、無効のままにしています。

確認したコマンドは次の通りです。

```bash
docker --version
docker compose version
docker run --rm hello-world
```

`hello-world` が実行できれば、Docker CLIからコンテナを起動できる状態です。

## compose.ymlで固定した内容

バックエンドリポジトリに `compose.yml` を追加し、MySQLを次のように固定しました。

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: typing-game-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: typing_game
      MYSQL_USER: typing_game_app
      MYSQL_PASSWORD: typing_game_password
      MYSQL_ROOT_PASSWORD: typing_game_root_password
      TZ: Asia/Tokyo
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_0900_ai_ci
      - --default-time-zone=+09:00
    volumes:
      - typing-game-mysql-data:/var/lib/mysql
```

ポイントは、DB名、アプリ用ユーザー、文字コード、タイムゾーン、MySQLバージョンをリポジトリ上で見える形にしたことです。

これにより、他PCでも同じ条件でMySQLを起動しやすくなります。

## 起動手順

MySQLコンテナは次のコマンドで起動します。

```bash
docker compose up -d mysql
```

状態確認は次のコマンドです。

```bash
docker compose ps
```

Spring Bootはローカルから起動します。

```bash
./mvnw spring-boot:run
```

API疎通確認は次のように行いました。

```bash
curl http://localhost:8091/api/scores
```

実際に、Docker上のMySQLへ接続した状態でスコア一覧のJSONが返るところまで確認しました。

## ローカルMySQLとの注意点

Docker MySQLもローカルMySQLも、標準では `3306` 番ポートを使います。

そのため、ローカルに直接インストールしたMySQLと、Docker ComposeのMySQLを同時に起動するとポートがぶつかります。

今回の方針では、Docker MySQLを使うときはローカルMySQLを止めることにしました。

MySQLコンテナを止めるだけなら、次のコマンドです。

```bash
docker compose down
```

DBデータも含めて作り直したい場合だけ、volumeも削除します。

```bash
docker compose down -v
```

`-v` を付けるとDBデータが消えるため、普段は付けないようにします。

## Flywayとの関係

typingGameでは、テーブル作成や変更をFlyway migrationで管理しています。

Docker ComposeでMySQLを固定したことで、次の確認がしやすくなりました。

- Flyway migrationが同じDB条件で流れる
- JPA validateでスキーマ不一致に気づける
- サンプルデータ投入後のAPI確認ができる
- EC2へ進む前にDBまわりの不安を減らせる

Spring Boot 4 / Java 25へ更新した後も、Docker MySQL 8.4に接続して起動確認できました。

## 学んだこと

Dockerは、いきなりアプリ全体をコンテナ化するためだけのものではありません。

今回のように、まずMySQLだけを固定する使い方でも十分に価値がありました。

特に個人開発では、学習範囲を小さく切ることが大事だと感じました。

DB条件をそろえる、Spring Bootはいつも通り起動する、API疎通を見る。

この順番にしたことで、Docker、MySQL、Flyway、Spring Bootのどこを確認しているのかが分かりやすくなりました。

次はこの状態を足場にして、Phase10のEC2学習へ進めます。
