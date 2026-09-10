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

置いたのはUbuntu 24.04 LTSのEC2で、Nginx、Route 53、Let's EncryptでHTTPS化しています。ただ、手順どおりに並べれば動いたわけではなく、途中で `502 Bad Gateway`、JWT設定によるSpring Bootの起動失敗、Security Groupの設定漏れに当たっています。構成そのものよりも、この3つをどう切り分けたかの方が後から役に立ちました。

## 構成

最終的な構成は次のとおりです。以降の作業は、すべてこの1枚の図のどこかを作っている話になります。

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

当初はSpring BootまでDocker化することも考えました。ただ、EC2そのものの学習とDocker化を同時に進めると、起動しなかったときの切り分け対象が増えます。Javaの設定なのか、Composeの定義なのか、Nginxの転送先なのかを一度に疑うことになるので、MySQLだけDockerに残し、Spring BootはEC2上のJavaプロセスとして動かしました。

もう1つの前提は、EC2を停止・開始してもMySQL、Spring Boot、Nginxが自動で戻ってくる状態にすることです。個人開発で常時起動させ続けるつもりはなかったので、停止を前提に組んでいます。

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

フロントエンドは静的配信だけで済むので、EC2へ載せる理由がありません。GitHub Pagesへ寄せておけば、EC2が落ちても影響するのはAPIを使う機能だけに限定できます。

外部へ公開する入口はNginxだけに絞り、Spring Bootはループバックでしか待ち受けません。8091番をSecurity Groupで閉じるだけでなく、そもそもEC2の外側からは到達できない状態にしています。境界を2枚重ねておくと、片方の設定を間違えても即座に露出しません。

HTTPS化とRoute 53はセットです。GitHub PagesがHTTPSで配信されるため、APIがHTTPのままではブラウザが混在コンテンツとして止めます。証明書はIPアドレスに対しては発行できないので、先に名前を用意する必要がありました。

常駐化にsystemdを使ったのは、SSH切断とEC2再起動を同じ仕組みで扱えるからです。`nohup` で逃げると、再起動後の復旧を別に考えることになります。

## EC2へ進む前に準備したこと

バックエンドを公開する前に、ローカル環境で次を済ませました。

- MySQL 8.4をDocker Composeで固定する → [Docker ComposeでMySQL 8.4の開発環境を統一する](docker-compose-mysql-local-db)
- Spring Bootのprodプロファイルを用意し、DB接続情報、CORS、JWT secretを環境変数へ分離する → [Spring Bootの本番設定を環境変数へ分離する](spring-boot-prod-env-settings)
- Spring SecurityをJWT Bearer認証へ対応させる → [Spring Security Resource ServerでJWT Bearer認証を実装する](spring-security-jwt-resource-server)
- ユーザー別スコアAPIとランキングAPIを実装する
- FE単体モードを残し、API障害時もlocalStorageの記録を消さない → [Vue + Piniaでゲーム結果をlocalStorageへ永続化し、API障害時も結果を残す](vue-pinia-localstorage-persistence)

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

`https://api.clipdev.jp` へ接続できること、HTTPアクセスが301でHTTPSへ寄ることを確認したあと、`certbot renew --dry-run` まで実行しています。証明書は取得できた時点でいったん動いてしまうので、3か月後に更新が失敗する構成でも当日は気づけません。`--dry-run` は、そのズレを先に見つけるための確認です。

なお、この段階でHTTPS接続がタイムアウトしました。原因はSecurity Groupの443番で、後述します。

## GitHub PagesのVueをAPIへ接続する

バックエンド公開後、GitHub Actionsの本番ビルド設定を切り替えました。workflow全体の構成は[Vue + ViteをGitHub ActionsからGitHub Pagesへ自動デプロイする](github-actions-pages-deploy)にまとめています。

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

### HTTPステータスから到達点を判断する

一番役に立ったのは、返ってきたステータスコードから「どの層まで動いているか」を読むことでした。

```text
502 Bad Gateway
  → Nginxは動作しており、HTTP応答は返っている
  → upstream から正常な応答を得られていない
  → Spring Bootの停止、proxy_passの接続先、ポート番号などが候補

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

502は、Nginx自体は動作しているものの、upstreamから正常な応答を得られていない状態です。Spring Bootの停止だけでなく、`proxy_pass` の接続先やポート番号の誤りでも同じ502になります。

そこで、転送先のSpring Bootが動いているかと、`proxy_pass` の接続先が合っているかを順に確認しました。

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

### HTTPS接続時にSecurity Groupの443番が開いていなかった

**症状**

証明書を設定したあと、`https://api.clipdev.jp` へアクセスすると接続がタイムアウトする。

**判断**

タイムアウトは、そもそもNginxまでリクエストが届いていない状態です。エラー応答が返るのではなく無反応なので、Nginxより手前を疑いました。

なお、CertbotのHTTP-01によるドメイン所有確認は80番で行われるため、証明書の取得自体は443番が閉じていても成功します。443番が必要になるのは、取得した証明書でHTTPS通信を受ける段階です。

**原因と対処**

UbuntuとNginxは正常に動作していましたが、AWS側のSecurity Groupで443番を許可していませんでした。443番を開放したところ、HTTPSで接続できるようになりました。

OS内部の状態だけを見ていても原因にたどり着けない例です。EC2の手前にあるSecurity Groupも、独立した確認対象として扱う必要があります。

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

MySQLの3306番については、Security Groupで塞ぐだけでは不十分でした。Dockerのポート公開はiptablesへ直接ルールを入れるため、UFWで3306番を塞いでも効きません。Security Group一枚だけが頼りの状態になるため、Compose定義側で `127.0.0.1:3306:3306` を指定し、ループバック限定にしています。Spring BootがEC2ホスト上、MySQLがDocker内というこの構成なら、bindアドレスを指定するだけで済みます。詳細は[Docker ComposeでMySQL 8.4の開発環境を統一する](docker-compose-mysql-local-db)で扱っています。

## API障害時にもゲームを継続できる設計

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

- ブラウザのNetworkタブでも、ユーザー別スコア保存・取得と全体ランキングの各APIが2xxで完了していることを記録する
- 停止・再開・障害時の運用手順を文書としてまとめる
- Spring Boot本体もコンテナ化し、MySQLをホストへpublishせずコンテナ間通信だけで接続する

## 振り返り

構築中に一番効いたのは、応答の種類で疑う場所を決められることでした。502ならNginxまでは動いているのでupstream側、401ならSpring Securityまで届いているので経路は正常、タイムアウトならEC2の手前。この3つを覚えてからは、Ubuntu内をあてもなく見に行く時間がほぼなくなりました。

逆に、Security Groupの443番はこの判断だけでは見つかりません。OS内部の状態はすべて正常だったので、`nginx -t` も `systemctl status` も何も教えてくれませんでした。EC2の外側にも設定があることを、独立した確認対象として持っておく必要があります。

Spring Bootをコンテナ化しなかった判断は、この切り分けの間ずっと効いていました。疑う対象がJavaプロセスとNginxとSecurity Groupの3つに収まっていたので、Dockerの層を挟んで考える必要がありませんでした。逆に言えば、構成が安定した今なら「今後の改善」に挙げたコンテナ化へ進んでもよい段階です。
