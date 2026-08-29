---
id: ec2-spring-boot-https-frontend-connection
title: EC2にSpring Boot APIを公開しGitHub Pagesから接続した記録
date: 2026-08-29
section: guide
description: Ubuntu EC2へSpring BootとMySQLを配置し、systemd、Nginx、Route 53、Let's Encrypt、JWTを組み合わせて、GitHub PagesのVueフロントエンドからHTTPS接続するまでをまとめました。
tags: AWS, EC2, Spring Boot, Nginx, HTTPS
---

# EC2にSpring Boot APIを公開しGitHub Pagesから接続した記録

Balloon Typing GameのバックエンドをAWS EC2へ公開し、GitHub Pagesで配信しているVueフロントエンドから接続できるところまで進めました。

今回の目的は、単にEC2でJavaを起動することではありません。

```text
GitHub Pages
  ↓ HTTPS / CORS / JWT Bearer
api.clipdev.jp
  ↓
Nginx
  ↓ HTTP / 127.0.0.1:8091
Spring Boot
  ↓
Docker Compose / MySQL
```

この経路を一つずつ確認し、EC2を停止・開始しても各サービスが自動復旧する状態を目指しました。

## EC2へ進む前に準備したこと

バックエンドを公開する前に、ローカル環境で次の準備を済ませました。

- MySQL 8.4をDocker Composeで固定する
- Spring Bootのprodプロファイルを用意する
- DB接続情報、CORS、JWT secretを環境変数へ分離する
- Spring SecurityをJWT Bearer認証へ対応させる
- ユーザー別スコアAPIとランキングAPIを実装する
- FE単体モードを残し、API障害時もlocalStorageの記録を消さない

Spring Boot本体までコンテナ化せず、MySQLだけをDockerへ分離しました。

学習範囲を小さく保ち、問題が起きたときにJava、DB、Dockerのどこが原因か判断しやすくするためです。

## Ubuntu EC2を作成してSSH接続する

EC2はUbuntu 24.04 LTSで作成しました。

秘密鍵の権限を所有者の読み取りだけに制限してから接続します。

```bash
chmod 400 ~/ssh/typing-game-ec2-key.pem

ssh -i ~/ssh/typing-game-ec2-key.pem ubuntu@<ELASTIC_IP>
```

秘密鍵、実IPアドレス、JWT、DBパスワードはブログやリポジトリへ載せません。

EC2へ接続後、Docker、Java 25、Gitを導入し、バックエンドリポジトリをcloneしました。

## MySQLをDocker Composeで起動する

EC2上でも、ローカルと同じCompose定義からMySQLを起動します。

```bash
cd ~/typing-game-backend
docker compose up -d mysql
docker compose ps
```

`healthy`になることを確認してからSpring Bootを起動しました。

DBデータはDocker volumeへ保存し、コンテナには再起動ポリシーを設定しています。

なお、現在のCompose定義ではMySQLの3306番をホストへpublishしています。Security Groupでは外部公開していませんが、最終的にはループバックへ限定するか、ホストへのpublish自体を不要にできないか見直す予定です。

## Spring Bootをprod設定で動かす

バックエンドをビルドし、まずは手動起動でDB接続とAPI応答を確認しました。

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

Spring Bootは `127.0.0.1:8091` で待ち受けます。外部から8091番へ直接接続させず、Nginx経由だけにするためです。

## systemdでSpring Bootを自動起動する

SSHを切断してもアプリを動かし、EC2再起動後にも復旧できるよう、Spring Bootをsystemdサービスにしました。

主な設定は次のとおりです。

```text
WorkingDirectory=/home/ubuntu/typing-game-backend
EnvironmentFile=/etc/typing-game-backend.env
ExecStart=/usr/bin/java -Xms128m -Xmx512m -jar <JAR_PATH>
Restart=on-failure
```

状態確認には次を使います。

```bash
sudo systemctl status typing-game-backend --no-pager
sudo systemctl is-active typing-game-backend
sudo journalctl -u typing-game-backend -n 100 --no-pager
```

最初はJWT secretの長さ検証で起動に失敗しました。

`systemctl status`だけでなく`journalctl`を確認したことで、NginxやMySQLではなくSpring Bootの設定値が原因だと特定できました。

## Nginxをリバースプロキシにする

Nginxは外部からのHTTP/HTTPSを受け、`/api/`をSpring Bootへ転送します。

```text
ブラウザ
  ↓ :443
Nginx
  ↓ 127.0.0.1:8091
Spring Boot
```

最初の確認では `502 Bad Gateway` が返りました。

502はNginxまでは到達しているものの、転送先のSpring Bootへ接続できない状態です。MySQLコンテナとSpring Bootを復旧し、次の順で切り分けました。

```bash
docker compose ps
sudo systemctl status typing-game-backend --no-pager
curl -i http://127.0.0.1:8091/api/auth/me
sudo nginx -t
```

認証が必要な `/api/auth/me` から401が返れば、通信経路としては正常です。

## Elastic IPと独自ドメインを設定する

EC2のPublic IPv4が変わるとDNSや接続先設定が壊れるため、Elastic IPを関連付けました。

Route 53で `clipdev.jp` を登録し、`api.clipdev.jp` のAレコードをElastic IPへ向けました。

```text
api.clipdev.jp
  ↓ Route 53 Aレコード
Elastic IP
  ↓
EC2
```

Security Groupは次の境界にしています。

- SSH 22番は管理元IPだけ許可
- HTTP 80番とHTTPS 443番は公開
- Spring Boot 8091番は外部公開しない
- MySQL 3306番は外部公開しない

## CertbotでHTTPS化する

GitHub PagesはHTTPSで配信されるため、APIもHTTPSでなければブラウザのMixed Content制約に抵触します。

CertbotとLet's Encryptを使い、`api.clipdev.jp`へ証明書を設定しました。

確認した内容は次のとおりです。

- `https://api.clipdev.jp` へ接続できる
- HTTPアクセスがHTTPSへ301リダイレクトされる
- 443番がSecurity Groupで許可されている
- `certbot renew --dry-run` が成功する

証明書取得の途中では、Security Groupの443番が開いておらず接続タイムアウトになりました。UbuntuやNginxの状態だけでなく、AWS側の入口も確認する必要があると分かりました。

## PowerShellから認証APIを確認する

Swagger UIはprod環境で公開しない方針のため、Windows PowerShellからAPIを直接確認しました。

確認した流れは次のとおりです。

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

これにより、HTTPS、Nginx、Spring Boot、Spring Security、JWT、MySQLまでの一連をバックエンド単体で確認できました。

作業中にJWTを端末へ表示したため、念のためJWT secretを新しい値へローテーションし、Spring Bootを再起動しました。secretを変更すると、古いsecretで署名された既存JWTは検証できなくなります。

## GitHub Pagesを本番APIへ接続する

バックエンド公開後、GitHub Actionsの本番ビルド設定を切り替えました。

```yaml
- name: Build
  env:
    VITE_ENABLE_BACKEND_API: "true"
    VITE_API_BASE_URL: "https://api.clipdev.jp"
  run: npm run build
```

ローカル開発では従来どおり `http://localhost:8091` を使用し、本番だけ独自ドメインへ向けます。

FEではログインレスポンスのJWTをsessionStorageへ保存し、API共通処理から次のヘッダーを付けます。

```http
Authorization: Bearer <ACCESS_TOKEN>
```

ページ再読み込み時には、sessionStorageにJWTが残っていれば `/api/auth/me`を呼び、ログインユーザー表示を復元するようにしました。

## EC2停止・開始後の自動復旧を確認する

EC2を一度停止し、再度開始したあとに次を確認しました。

```bash
cd ~/typing-game-backend
docker compose ps
sudo systemctl status typing-game-backend --no-pager
sudo systemctl status nginx --no-pager
curl -i https://api.clipdev.jp/api/auth/me
```

確認結果は次のとおりです。

```text
MySQL                 healthy
Spring Boot           active (running)
Nginx                 active (running)
未認証 /api/auth/me   401
```

401は失敗ではありません。認証が必要なAPIへ未認証でアクセスし、Spring Securityが正しく拒否している状態です。

## ブラウザからの接続結果

GitHub Pagesの公開画面でログインし、ヘッダーへログインユーザーが表示されることを確認しました。

```text
GitHub Pages
  ↓ CORSを伴うHTTPS通信
api.clipdev.jp
  ↓
JWTログイン成功
```

ゲーム終了後にランキング画面へ移動し、自分の記録が表示されるところまで画面上で確認しました。

デプロイ直後、開いたままのタブからランキングとブログへ遷移できないこともありました。原因は、古いHTMLが削除済みのハッシュ付きJavaScriptを参照する、SPAの遅延読込キャッシュでした。

`Ctrl + Shift + R`で強制再読み込みすると、新しいビルドへそろい、正常に遷移しました。

## EC2を停止した場合

フロントエンドとブログはGitHub Pagesにあるため、EC2を停止しても次は動きます。

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

API保存前にlocalStorageへ記録する設計なので、EC2停止中でもゲーム結果そのものは失われません。

## 現在地点

今回までに次を完了しました。

```text
EC2 / Ubuntu                     ✅
Docker Compose / MySQL           ✅
Spring Boot prod                 ✅
systemd自動起動                  ✅
Nginx reverse proxy              ✅
Elastic IP / Route 53            ✅
独自ドメイン                     ✅
Let's Encrypt / HTTPS            ✅
HTTP → HTTPS                     ✅
JWT Bearer認証                   ✅
JWT secretローテーション         ✅
GitHub Pagesの本番API接続        ✅
ブラウザログイン                 ✅
EC2再開後の自動復旧              ✅
```

次はブラウザのNetworkタブでも、ユーザー別スコア保存・取得と全体ランキングの各APIが2xxで完了していることを記録し、運用手順をさらに整えます。

## 学んだこと

- 401は、認証境界が動いていることを確認する材料になる
- 502は、Nginxより後ろのSpring BootやMySQLを確認する合図になる
- `systemctl status`だけでなく`journalctl`で起動失敗の原因を読む
- Security Group、Nginx、Spring Bootの待受アドレスは別々の防御層である
- GitHub PagesからAPIへ接続するにはHTTPSとCORSの両方が必要になる
- JWTはログや画面へ不用意に表示せず、漏えい時はsecretをローテーションする
- systemdとDockerの再起動設定により、EC2再開後の復旧を自動化できる
- FEをlocalStorage fallback対応にすると、API停止中もゲームの基本機能を維持できる

EC2構築、HTTPS化、認証確認、FE接続を一度に進めず、各層を401や502などの具体的な応答で切り分けたことで、どこまで正常なのかを判断しながら進められました。
