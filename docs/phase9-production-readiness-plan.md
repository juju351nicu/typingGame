# Phase9 本番公開準備メモ

## 目的

Phase9では、GitHub Pagesで公開しているフロントエンドと、将来公開するバックエンドAPIの接続方針を整理します。

現時点では、バックエンドを本番公開する予定はまだ先です。
そのため、最優先は「FEだけ公開してもゲームとして動く状態を維持すること」です。

## 現在の到達点

2026-07-11時点では、以下まで完了しています。

- FE単体モードでゲーム、リザルト、ランキング、ブログが動く。
- 未ログインユーザーのスコアはlocalStorageへ保存する。
- `VITE_ENABLE_BACKEND_API=false` または未指定の場合、ログイン導線を出さない。
- `npm run dev:api` でAPI有効モードを `localhost:8081` 固定で起動できる。
- ログイン済みユーザーはJWT tokenを `sessionStorage` に保存できる。
- API呼び出し時に `Authorization: Bearer {token}` を付けられる。
- ログインユーザー向けAPIが401の場合、ログイン状態をクリアし、再ログイン案内を表示できる。

## 公開方針

当面の公開方針は以下です。

```text
GitHub Pages公開版
-> FE単体モード
-> VITE_ENABLE_BACKEND_API=false
-> localStorage保存
-> ログイン導線なし
-> バックエンドAPIに接続しない
```

バックエンドAPI公開は、EC2やHTTPSを学習してから進めます。

理由:

- 先にFE単体で見せられる状態を維持したい。
- BEを公開すると、CORS、HTTPS、DB、JWT secret、サーバ運用が一気に増える。
- APIが落ちていてもゲーム自体が使える設計を守りたい。

## 環境変数の役割

typingGameでは、API接続を2つの環境変数で制御します。

```text
VITE_ENABLE_BACKEND_API
-> API機能を有効にするか

VITE_API_BASE_URL
-> API有効時の接続先URL
```

重要:

`VITE_API_BASE_URL` は接続先URLであり、APIを使うかどうかの判断には使いません。
API有効/無効の判断は `VITE_ENABLE_BACKEND_API` で行います。

理由:

- GitHub Pages公開時に、URLが残っているだけで意図せずAPI通信するのを避けるため。
- FE単体公開では、バックエンドが存在しなくても自然に動く必要があるため。

## ローカル起動

FE単体モード:

```bash
npm run dev
```

API有効モード:

```bash
npm run dev:api
```

`dev:api` は以下を固定します。

```text
VITE_ENABLE_BACKEND_API=true
VITE_API_BASE_URL=http://localhost:8091
port 8081
strictPort
```

`8081` が埋まっている場合は、自動で `8082` に逃げません。
これは、CORSやCookie条件のズレに早く気づくためです。

## GitHub Pages公開時の方針

GitHub Pagesへ公開するビルドでは、原則としてAPI無効モードにします。

```text
VITE_ENABLE_BACKEND_API=false
```

GitHub ActionsのDeploy workflowでは、Buildステップでこの値を明示します。
ローカルでFE単体モードを確認する場合は、未指定のままでも同じ挙動になります。

この状態では、以下の挙動になります。

- ログインボタンを表示しない。
- ユーザー登録画面へ誘導しない。
- スコアはlocalStorageに保存する。
- ランキングはlocalStorage由来の履歴を表示する。
- API保存・API取得を呼ばない。

## 将来API公開する場合

将来、EC2などでバックエンドを公開したら、FE側では以下を設定します。

```text
VITE_ENABLE_BACKEND_API=true
VITE_API_BASE_URL=https://api.example.com
```

そのとき確認すること:

- BEのCORS許可OriginにGitHub PagesのOriginが入っているか。
- BEがHTTPSで公開されているか。
- `Authorization` ヘッダーが送れているか。
- 401時に再ログイン案内が出るか。
- APIが落ちた場合でも、localStorageのプレイ結果が消えないか。
- GitHub PagesのURLでリロードしてもルーティングが壊れないか。

## Cookie / sessionStorage / localStorage の役割

FE側では、保存場所を以下のように使い分けます。

```text
Cookie
-> セッションCookie方式でログイン状態を維持する場合に使う
-> Cookie無効時はセッション方式のログイン継続が難しい
-> JWT主方式ではなるべく依存を減らす

sessionStorage
-> JWT access token保存に使う
-> 同じタブではリロード後も使える
-> タブまたはブラウザを閉じると消える

localStorage
-> 未ログインスコア保存に使う
-> API失敗時fallbackに使う
-> JWT token保存には使わない
```

Cookieを無効にしても、Spring Security自体が使えなくなるわけではありません。
ただし、セッションCookie方式は `JSESSIONID` Cookieを使うため、ログイン継続が難しくなります。

JWT Bearer方式では、FEが `Authorization` ヘッダーでtokenを送るため、Cookieが無効でも認証できます。
そのため、将来API公開する場合はJWT Bearer方式を主方式にします。

## Phase9でまだやらないこと

以下はまだ後回しで良いです。

- GitHub Pages公開版から本番APIへ常時接続する。
- refresh tokenを導入する。
- httpOnly Cookie方式へ移行する。
- OpenAPI Generatorを導入する。
- EC2 / Nginx / HTTPS / systemd の実作業。
- RDSや独自ドメインの設定。

## 推奨する実装順

FE側でPhase9を進める場合は、以下の順番が良いです。

1. GitHub Pages公開版はAPI無効モードであることをREADMEに明記する。
2. API有効モードはローカル確認用として `npm run dev:api` に寄せる。
3. 将来API公開時に必要な `VITE_API_BASE_URL` の設定例をdocsに残す。
4. localStorage fallbackが壊れていないことをテストで維持する。
5. BE公開後に、GitHub Pages URLからJWT Bearer認証で疎通確認する。

## 完了条件

Phase9のFE側完了条件は以下です。

- FE単体公開とAPI有効モードの違いがdocsにまとまっている。
- GitHub Pages公開版ではAPIを呼ばない方針が明確になっている。
- 将来API公開する場合の環境変数が明確になっている。
- localStorage、sessionStorage、Cookieの役割が混ざらず整理されている。
- BE側のPhase9方針と矛盾していない。
