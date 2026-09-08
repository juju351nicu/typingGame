---
id: ec2-spring-boot-https-frontend-connection
title: GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで
date: 2026-08-29
section: guide
description: Ubuntu 24.04のEC2へSpring BootとMySQLを配置し、systemd、Nginx、Route 53、Let's Encrypt、JWTを組み合わせてHTTPS化し、GitHub PagesのVueアプリケーションからAPIへ接続するまでの構成、手順、切り分けをまとめました。
tags: AWS, EC2, Spring Boot, Nginx, HTTPS
---

# GitHub PagesのVueからAWS EC2上のSpring Boot APIへHTTPS接続するまで

個人開発している「Balloon Typing Game」では、Vue 3 / TypeScriptでフロントエンドを、Spring BootでバックエンドAPIを実装しています。

フロントエンドはGitHub Pagesで公開していましたが、ユーザー登録・ログイン・スコア保存・ランキングを利用できるようにするため、Spring Boot APIをAWS EC2へデプロイしました。

この記事では、Ubuntu 24.04 LTSのEC2上にSpring BootとMySQLを配置し、Nginx、Route 53、Let's Encryptを組み合わせてHTTPS化したうえで、GitHub PagesのVueアプリケーションからAPIへ接続するまでの構成と手順をまとめます。

構築手順だけでなく、実際に発生した `502 Bad Gateway`、JWT設定によるSpring Bootの起動失敗、Security Groupの設定漏れを、どのように切り分けたのかもあわせて紹介します。

## 今回構築した構成

最終的な構成は次のとおりです。この記事はすべて、この1枚の図のどこを作っているかという話になります。

```text
      GitHub Pages
    ┌──────────────┐
    │ Vue 3        │
    │ TypeScript   │
    └──────┬───────┘
           │ HTTPS / CORS / Authorization: Bearer <JWT>
           ▼
      api.clipdev.jp
           │ Route 53 Aレコード
           ▼
       Elastic IP
           │
           ▼
┌────────────────────────────┐
│ EC2 / Ubuntu 24.04 LTS     │
│                            │
│  ┌──────────────────────┐  │
│  │ Nginx  :80 / :443    │  │
│  │ Let's Encrypt        │  │
│  └──────────┬───────────┘  │
│             │ reverse proxy│
│  ┌──────────▼───────────┐  │
│  │ Spring Boot          │  │
│  │ 127.0.0.1:8091       │  │
│  │ systemd              │  │
│  └──────────┬───────────┘  │
│             │              │
│  ┌──────────▼───────────┐  │
│  │ MySQL                │  │
│  │ Docker Compose       │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

Spring Boot本体はコンテナ化せず、MySQLだけをDocker Composeで管理しています。

また、EC2を停止・開始した場合でも、MySQL、Spring Boot、Nginxが自動的に復旧する状態を目標にしました。

## なぜこの構成にしたか

役割分担は次のように決めました。

```text
フロントエンド配信  GitHub Pages
API実行             EC2上でSpring Bootを直接実行
データベース        Docker Compose / MySQL
外部公開            Nginxのみ
アプリの待受        127.0.0.1:8091
HTTPS               Let's Encrypt
DNS                 Route 53
常駐化              systemd
```

それぞれ次の理由で選びました。

- フロントエンドは静的配信だけで済むため、GitHub Pagesへ寄せてEC2の負荷と障害範囲を減らす
- MySQLはローカルと同じCompose定義を使い、バージョンや起動条件の差異をなくす
- 外部へ公開する入口をNginxだけに絞る
- Spring Bootはループバックだけで待ち受け、外部から直接接続させない
- GitHub PagesがHTTPSで配信されるため、API側もLet's EncryptでHTTPS化する
- IP直打ちをやめ、Route 53で証明書を発行できる名前を用意する
- systemdで常駐化し、SSH切断とEC2再起動の両方に対応する

特に、Spring Boot本体までコンテナ化しなかったのは意図的な判断です。

学習範囲を小さく保ち、問題が起きたときにJava、DB、Dockerのどこが原因か判断しやすくするためです。

## EC2へ進む前に準備したこと

バックエンドを公開する前に、ローカル環境で次を済ませました。

- MySQL 8.4をDocker Composeで固定する
- Spring Bootのprodプロファイルを用意する
- DB接続情報、CORS、JWT secretを環境変数へ分離する
- Spring SecurityをJWT Bearer認証へ対応させる
- ユーザー別スコアAPIとランキングAPIを実装する
- FE単体モードを残し、API障害時もlocalStorageの記録を消さない

ローカルで動かない状態のままEC2へ持ち込むと、原因がアプリ側かサーバー側か分からなくなるため、先に手元で確定させています。

## Ubuntu EC2を作成してSSH接続する

EC2はUbuntu 24.04 LTSで作成しました。

秘密鍵は所有者の読み取りだけに制限してから接続します。権限が緩いとSSH側が鍵を拒否するためです。

```bash
chmod 400 ~/ssh/typing-game-ec2-key.pem

ssh -i ~/ssh/typing-game-ec2-key.pem ubuntu@<ELASTIC_IP>
```

秘密鍵、実IPアドレス、JWT、DBパスワードはブログやリポジトリへ載せません。

EC2へ接続後、Docker、Java 25、Gitを導入し、バックエンドリポジトリをcloneしました。

## MySQLをDocker Composeで起動する

EC2上でもローカルと同じCompose定義を利用し、MySQLのバージョンや起動条件の差異を減らします。

```bash
cd ~/typing-game-backend
docker compose up -d mysql
docker compose ps
```

`healthy`になったことを確認してからSpring Bootを起動します。DBが起動しきる前にアプリを起動すると、接続エラーの原因がDB未起動なのか設定ミスなのか判別しづらくなるためです。

DBデータはDocker volumeへ保存し、コンテナには再起動ポリシーを設定しています。

## Spring Bootをprod設定で動かす

まずは手動起動で、DB接続とAPI応答を確かめます。systemd化するのは、手動で動く状態にしてからにしました。

```bash
./mvnw clean package -DskipTests
```

本番用の値は `/etc/typing-game-backend.env` へ置きます。

```text
SPRING_PROFILES_ACTIVE=prod
SERVER_ADDRESS=127.0.0.1
APP_CORS_ALLOWED_ORIGINS=https://juju351nicu.github.io
JWT_SECRET=<安全な値>
```

環境変数ファイルはGit管理せず、rootだけが読める権限にしました。

`SERVER_ADDRESS=127.0.0.1` により、Spring Bootはループバックだけで待ち受けます。8091番へ外部から直接接続させず、必ずNginxを経由させるためです。

## systemdでSpring Bootを常駐化する

SSHを切断してもアプリを動かし、EC2再起動後にも復旧できるよう、Spring Bootをsystemdサービスにしました。

主な設定は次のとおりです。

```text
WorkingDirectory=/home/ubuntu/typing-game-backend
EnvironmentFile=/etc/typing-game-backend.env
ExecStart=/usr/bin/java -Xms128m -Xmx512m -jar <JAR_PATH>
Restart=on-failure
```

状態とログの確認には次を使います。

```bash
sudo systemctl status typing-game-backend --no-pager
sudo systemctl is-active typing-game-backend
sudo journalctl -u typing-game-backend -n 100 --no-pager
```

`active (running)`になっていれば、SSHを切断してもAPIは動き続けます。

## Nginxをリバースプロキシにする

Nginxは外部からのHTTP/HTTPSを受け、`/api/`を `127.0.0.1:8091` のSpring Bootへ転送します。

外部に開くポートを80番と443番だけにし、アプリケーションのポートは外へ出さない形にしています。

Nginx単体の設定確認と、転送先の応答確認は次で行いました。

```bash
sudo nginx -t
curl -i http://127.0.0.1:8091/api/auth/me
```

認証が必要な `/api/auth/me` から401が返れば、転送先そのものは正常に動いています。

## Elastic IPと独自ドメインを設定する

EC2のPublic IPv4が変わるとDNSや接続先設定が壊れるため、Elastic IPを関連付けました。

Route 53で `clipdev.jp` を登録し、`api.clipdev.jp` のAレコードをElastic IPへ向けています。

固定の名前があることで、証明書の発行対象とフロントエンドの接続先を、IPアドレスに依存せず決められるようになります。

## CertbotでHTTPS化する

GitHub PagesはHTTPSで配信されるため、APIがHTTPのままだとブラウザのMixed Content制約に抵触します。

CertbotとLet's Encryptを使い、`api.clipdev.jp`へ証明書を設定しました。

確認した内容は次のとおりです。

- `https://api.clipdev.jp` へ接続できる
- HTTPアクセスがHTTPSへ301リダイレクトされる
- 443番がSecurity Groupで許可されている
- `certbot renew --dry-run` が成功する

`--dry-run`まで確認しているのは、証明書を取得できたかどうかではなく、更新を継続できるかを確かめるためです。

## GitHub PagesのVueをAPIへ接続する

バックエンド公開後、GitHub Actionsの本番ビルド設定を切り替えました。

```yaml
- name: Build
  env:
    VITE_ENABLE_BACKEND_API: "true"
    VITE_API_BASE_URL: "https://api.clipdev.jp"
  run: npm run build
```

ローカル開発では従来どおり `http://localhost:8091` を使用し、本番ビルドだけ独自ドメインへ向けます。

サーバー側では、CORSの許可オリジンをGitHub Pagesのドメインだけに絞っています。

```text
APP_CORS_ALLOWED_ORIGINS=https://juju351nicu.github.io
```

フロントエンドはログインレスポンスのJWTをsessionStorageへ保存し、API共通処理から次のヘッダーを付けます。

```http
Authorization: Bearer <ACCESS_TOKEN>
```

ページ再読み込み時には、sessionStorageにJWTが残っていれば `/api/auth/me`を呼び、ログインユーザー表示を復元します。

## 動作確認

### バックエンド単体での確認

Swagger UIはprod環境で公開しない方針のため、Windows PowerShellからAPIを直接呼び出しました。

```text
POST /api/users
  ↓ ユーザー登録
POST /api/auth/login
  ↓ JWTアクセストークン取得
GET /api/auth/me
  ↓ Authorization: Bearer <token>
ログインユーザー取得
```

未認証のリクエストでは401、Bearerトークン付きではユーザー情報が返りました。

これで、HTTPS、Nginx、Spring Boot、Spring Security、JWT、MySQLまでの経路が、ブラウザを介さずに成立していると言えます。

### ブラウザからの確認

GitHub Pagesの公開画面からログインすると、CORSを伴うHTTPS通信でJWTログインが成立し、ヘッダーへログインユーザーが表示されます。

ゲーム終了後にランキング画面へ移動すると、自分の記録も画面上に表示されます。ここまでで、冒頭の図の上端から下端までが一本につながった状態です。

### EC2停止・開始後の自動復旧

EC2を停止・開始しても、Dockerの再起動ポリシーとsystemdによって各サービスは自動復旧します。

証拠として、再開後に次を実行しました。

```bash
cd ~/typing-game-backend
docker compose ps
sudo systemctl status typing-game-backend --no-pager
sudo systemctl status nginx --no-pager
curl -i https://api.clipdev.jp/api/auth/me
```

結果は次のとおりです。

```text
MySQL                 healthy
Spring Boot           active (running)
Nginx                 active (running)
未認証 /api/auth/me   401
```

401は失敗ではありません。認証が必要なAPIへ未認証でアクセスし、Spring Securityが正しく拒否している状態です。

## 発生した問題と切り分け

構築中に発生した問題と、どう切り分けたかをまとめます。

### HTTPステータスから到達点を判断する

今回もっとも役に立ったのは、返ってきたステータスコードから「どの層まで動いているか」を読むことでした。

```text
502 Bad Gateway
  → Nginxまでは到達している
  → 転送先のSpring Bootへ接続できていない

401 Unauthorized
  → Spring BootとSpring Securityまで到達している
  → 未認証なので正しく拒否されている

接続タイムアウト
  → Nginxまで届いていない
  → Security GroupやDNSなど、EC2の手前を疑う
```

### 502 Bad Gateway

**症状**

Nginx経由でAPIを呼ぶと `502 Bad Gateway` が返る。

**判断**

502はNginxまでは到達しているものの、転送先へ接続できていない状態を示します。そのためNginxの設定ではなく、後段から順に見ていきました。

**調査**

```bash
docker compose ps
sudo systemctl status typing-game-backend --no-pager
curl -i http://127.0.0.1:8091/api/auth/me
sudo nginx -t
```

**原因と対処**

MySQLコンテナとSpring Bootが停止していました。両方を復旧させると `/api/auth/me` が401を返すようになり、経路としては正常な状態へ戻りました。

### JWT設定によるSpring Bootの起動失敗

**症状**

systemd化した直後、サービスが起動しない。

**判断**

`systemctl status` では「起動に失敗した」ことしか分かりません。アプリケーション側の例外を読む必要があります。

**調査**

```bash
sudo journalctl -u typing-game-backend -n 100 --no-pager
```

**原因と対処**

JWT secretの長さ検証で失敗していました。ログを読んだことで、NginxやMySQLではなくSpring Bootの設定値が原因だと特定できています。

### Security Groupの443番が開いていない

**症状**

証明書取得の途中で接続タイムアウトになる。

**判断**

タイムアウトはNginxまで届いていない状態です。UbuntuとNginxは正常だったため、EC2の手前を疑いました。

**原因と対処**

AWS側のSecurity Groupで443番を許可していませんでした。OS内部の状態だけでなく、EC2の手前にある入口も見る必要があります。

### デプロイ直後のSPA画面遷移の失敗

**症状**

デプロイ直後、開いたままのタブからランキングとブログへ遷移できない。

**原因と対処**

古いHTMLが削除済みのハッシュ付きJavaScriptを参照する、SPAの遅延読込キャッシュでした。`Ctrl + Shift + R` で強制再読み込みすると新しいビルドへそろい、正常に遷移します。バックエンドではなく、フロントエンド配信側の問題です。

## セキュリティ上の考慮

公開範囲は、AWS、Nginx、アプリケーションのそれぞれで境界を分けています。

Security Groupは次のとおりです。

- SSH 22番は管理元IPだけ許可
- HTTP 80番とHTTPS 443番は公開
- Spring Boot 8091番は外部公開しない
- MySQL 3306番は外部公開しない

これに加えて、次を実施しました。

- Spring Bootの待受を `127.0.0.1:8091` に限定し、Nginx以外から接続できないようにする
- JWT secretとDBパスワードはGit管理せず、環境変数ファイルへ分離する
- 環境変数ファイルはrootだけが読める権限にする
- Swagger UIはprodプロファイルで公開しない
- 作業中にJWTを端末へ表示したため、JWT secretを新しい値へローテーションする

secretを変更すると、古いsecretで署名された既存JWTは検証できなくなります。ローテーション後はSpring Bootを再起動し、再ログインで新しいトークンを取得しました。

なお、現在のCompose定義ではMySQLの3306番をホストへpublishしています。Security Groupで外部公開はしていませんが、多層防御としては弱いため、改善対象として残しています。

## API停止時のフロントエンド動作

フロントエンドとブログはGitHub Pagesにあるため、EC2を停止しても次は動作します。

- タイピングゲーム
- 設定・結果表示
- localStorageへのスコア保存
- ローカルランキング
- Markdown技術ブログ

一方、次はEC2上のAPIが必要です。

- ユーザー登録・ログイン
- JWTによるログイン状態復元
- DBへのスコア保存・取得
- 全体ランキング

スコアはAPIへ保存する前にlocalStorageへ記録する設計のため、EC2停止中でもゲーム結果そのものは失われません。バックエンドが停止してもゲーム自体は遊べる、という切り分けを設計時点で決めています。

## 今後の改善

- MySQLの3306番について、ループバックへ限定するか、ホストへのpublish自体を不要にできないか見直す
- ブラウザのNetworkタブでも、ユーザー別スコア保存・取得と全体ランキングの各APIが2xxで完了していることを記録する
- 停止・再開・障害時の運用手順を文書としてまとめる

## まとめ

今回の構築では、VueフロントエンドをGitHub Pages、Spring Boot APIをAWS EC2へ分離して公開し、Nginx、Route 53、Let's Encryptを利用してHTTPSで接続できる構成を作りました。

単にサービスを起動するだけでなく、Security Group、Nginx、Spring Bootの待受アドレスをそれぞれ異なる境界として扱い、外部からSpring BootやMySQLへ直接接続できない構成にしています。また、systemdとDockerの再起動設定により、EC2を停止・開始しても各サービスが自動的に復旧する状態にできました。

そして、401や502といったHTTPレスポンスと `journalctl` を使えば、障害発生時にどの層まで正常に動作しているかを切り分けられます。各層を一度にまとめて見ず、具体的な応答をもとに1つずつ判断したことが、結果的に一番の近道になりました。

最終的に動作している機能は次のとおりです。

```text
ユーザー登録    ✅
JWTログイン     ✅
スコア保存      ✅
ランキング取得  ✅
EC2再起動復旧   ✅
```
