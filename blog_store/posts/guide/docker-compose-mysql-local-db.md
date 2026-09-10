---
id: docker-compose-mysql-local-db
title: Docker ComposeでMySQL 8.4の開発環境を統一する
date: 2026-08-14
section: guide
description: 開発PCごとに違うMySQLの条件をそろえるため、Rancher DesktopとDocker ComposeでMySQL 8.4を固定し、Spring Boot本体はコンテナ化せずDBだけを分離した判断をまとめました。
tags: Docker, MySQL, Spring Boot
---

# Docker ComposeでMySQL 8.4の開発環境を統一する

Spring BootでバックエンドAPIを開発しているtypingGameで、ローカルのMySQL環境をDocker Composeで固定しました。

目的は本番運用の形を完成させることではなく、別のPCでも同じMySQLの条件でバックエンドを動かせるようにすることです。

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
    restart: unless-stopped
    ports:
      - "127.0.0.1:3306:3306"
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
    healthcheck:
      test:
        - CMD-SHELL
        - mysqladmin ping -h 127.0.0.1 -uroot -p$${MYSQL_ROOT_PASSWORD} --silent
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s

volumes:
  typing-game-mysql-data:
```

ポイントは、DB名、アプリ用ユーザー、文字コード、タイムゾーン、MySQLバージョンをリポジトリ上で見える形にしたことです。

これにより、他PCでも同じ条件でMySQLを起動しやすくなります。

`restart: unless-stopped` と `healthcheck` も、この定義をそのままEC2へ持ち込むために入れています。ホストを再起動してもMySQLが復帰し、Spring Bootを起動する前に `healthy` になったかどうかを `docker compose ps` で判断できます。

### ポート公開はループバックへ限定する

`ports` の指定は、bindアドレスを書くかどうかで意味が変わります。

```yaml
# ホストの全インターフェースで待ち受ける
ports:
  - "3306:3306"

# ループバックだけで待ち受ける
ports:
  - "127.0.0.1:3306:3306"
```

bindアドレスを省略した `"3306:3306"` は、ホストのすべてのネットワークインターフェースで3306番を待ち受けます。手元の開発PCなら問題になりにくいのですが、同じ定義をEC2のような外部公開するホストへ持ち込むと、ファイアウォールの設定を誤ったときにMySQLがそのままインターネットへ露出します。

しかも、Dockerのポート公開はiptablesへ直接ルールを入れるため、UFWで3306番を塞いでも効きません。bindアドレスを省略したままだと、外部からの接続を止めているのはAWSのSecurity Groupだけ、という単層防御になります。

そこで、`127.0.0.1` を明示してループバック限定にしました。この構成ではローカルでもEC2でもSpring Bootをホスト上で直接起動していて、接続先はどちらも `localhost:3306` です。ループバックへ限定してもローカル開発の手順は変わらず、同じCompose定義を環境ごとに書き換えずに使えます。

DBクライアントから接続する場合も、同じホスト上から、あるいはSSHポートフォワード経由でつなげば影響はありません。

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

DB条件が固定されたことで、Flyway migrationが毎回同じ前提で流れ、JPA validateのスキーマ不一致もDBの個体差ではなくmigrationの問題として読めるようになりました。migrationが通らないときにMySQLのバージョンや照合順序を疑わずに済むのが、いちばん大きい違いです。

Spring Boot 4 / Java 25へ更新した後も、Docker MySQL 8.4に接続して起動を確認しています。

## 振り返り

MySQLだけ切り出すのは中途半端な構成に見えます。実際、Spring Boot本体もイメージにしてしまえば、ローカルとEC2で完全に同じものが動きます。

それでもこの形にしたのは、DB条件をそろえるという目的に対してMySQLのコンテナ化だけで足りていたからです。アプリ側までコンテナに入れると、起動しないときに疑う対象がJava、Maven、Compose定義、イメージビルドへ増えます。目的に対して必要のない層を、切り分けの対象として抱えることになります。

`ports` にbindアドレスを書いたのも、この延長でした。ローカル開発だけなら `"3306:3306"` で困りません。ただ同じ定義をEC2へ持ち込む前提だったので、外部公開するホストで意味が変わる書き方を、ローカルの時点から残さないようにしています。

この構成をベースに、次はEC2上でも同じCompose定義を利用してMySQLを起動します。ローカルと本番でDBの条件をそろえられるため、EC2側で問題が起きたときにDB環境の差異を疑わずに済みます。EC2側の構成と手順は[GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで](ec2-spring-boot-https-frontend-connection)にまとめています。
