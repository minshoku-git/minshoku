# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

「みんなの社食」の **管理画面（社内オペレーター向け）**。Next.js 16 App Router + MUI v6 + Supabase。
UI 文言・コメント・コミットメッセージはすべて日本語。

**姉妹リポジトリ**: `../minshoku-order` が同じ Supabase DB を参照する **エンドユーザー向け注文アプリ**（モバイル前提、`maxWidth: 640`）。
両者で `app/_lib/supabase/tableTypes.d.ts` が手動コピーで重複しており、**既に内容が乖離している**。
DB スキーマを変更したら両方を更新すること。管理画面で登録したデータの見た目が壊れないか、order 側の表示箇所も確認する。

## Commands

```bash
yarn dev            # next dev --turbopack
yarn build
yarn lint           # prettier --check → next lint（この順で両方通す）
yarn fix            # prettier --write → eslint --fix
```

**テストフレームワークは未導入**（テストコード・テストスクリプトともに存在しない）。動作確認は `yarn dev` で手動。

`yarn lint:list` / `yarn lint:all` は **壊れている**（`app/_scripts/list-eslint-problems.js` が存在しない）。使わないこと。

## デプロイ

`vercel.json` で Git 連携デプロイを無効化し、GitHub Actions から Vercel CLI で明示デプロイする構成。

| トリガー                         | ワークフロー             | 環境       |
| -------------------------------- | ------------------------ | ---------- |
| `main` への push                 | `vercel-production.yaml` | production |
| `v{n}.{n}.{n}` ブランチへの push | `vercel-preview.yaml`    | preview    |

## 環境変数（`.env.local`）

**本番でも `_DEV` サフィックス付きの変数名を参照している**（`SUPABASE_URL_DEV` / `SUPABASE_ANON_DEV` / `SUPABASE_DB_CONNECTION_STRING_DEV` / `SUPABASE_NAME_DEV` / `APP_URL_DEV`）。
サフィックスなしの `SUPABASE_URL` 等も `.env.local` に定義されているが、コード側は参照していない（ローカル Supabase 用の残骸）。新しい変数を足すときはこの既存の命名に合わせる。

その他: `SUPABASE_DB_SCHEMA`（**public ではない**）、`SUPABASE_STORAGE`（バケット名）、`ENCRYPTION_KEY` / `BUFFER_KEY`、`GOOGLE_MAIL_USER` / `GOOGLE_APP_PASSWORD`。

**ローカルの `.env.local` の値と本番Vercel環境変数は食い違うことがある**（実例: `SUPABASE_STORAGE` がローカルでは `shop-images` だが本番は `public`。`../minshoku-order` も同じ本番Supabaseプロジェクト・同じ `public` バケットを参照しており、値は共通）。本番の値を確認する必要がある場合は推測せず `vercel link` → `vercel env pull --environment=production <file>` で取得すること。

**GMO Payment Gateway**（`GMO_BASE_URL` / `GMO_SITE_ID` / `GMO_SITE_PASS`）は、Vercelの Production/Preview で値を出し分けている。Production=GMO本番（`p01.mul-pay.jp`）、Preview=GMOテスト環境（`pt01.mul-pay.jp`）。`../minshoku-order`と同じ変数名・同じ値で揃えてあり、`app/(private)/order/_lib/gmoApi.ts`が参照する（管理画面はキャンセル/返金のみ行うため`entryTranGmo`/`execTranGmo`は使わない）。`ShopID`/`ShopPass`（`t_shops.gmo_shop_code`/`gmo_shop_password`）はDB管理なのでこの対象外。

## アーキテクチャ

### 機能単位の垂直スライス

1画面 = 1ディレクトリ。この4点セットを守る。

```
app/(private)/<feature>/
├── page.tsx        # Server Component。component.tsx を返すだけの薄いラッパー
├── component.tsx   # 'use client'。画面の実装本体
└── _lib/
    ├── types.ts    # Zod スキーマ + z.infer した型（フォーム型と API 型の両方）
    ├── fetcher.ts  # クライアント → /api/... を叩く関数
    └── function.ts # サーバー側のDB処理（route.ts から呼ばれる）
```

API ルートは `app/api/<feature>/<action>/route.ts` に**画面と対称な形**で置く。
`route.ts` はロジックを持たず、常にこの3ステップだけ：

```ts
export async function POST(req: NextRequest) {
  const validationResult = await validateRequest(req, XxxApiSchema);   // 1. 検証
  if (!validationResult.success) return NextResponse.json(validationResult.error, { status: ... });
  const result = await searchXxx(validationResult.data);               // 2. _lib/function.ts に委譲
  if (result.success) return NextResponse.json(result);                // 3. 返却
  return NextResponse.json(result.error, { status: result.error.status });
}
```

`route.ts` が画面ディレクトリの `_lib/function.ts` を import する（逆方向の依存はない）。

### リクエストの流れ

```
component.tsx
  → useApiQuery / useApiMutation      (app/_lib/hooks/query/)
  → _lib/fetcher.ts → fetcher()       (app/_lib/fetcher.ts)
  → app/api/.../route.ts
  → validateRequest()                 (app/_lib/validation.ts)
  → _lib/function.ts
  → Supabase
```

### DB アクセスは読み書きで別クライアント

|          | 使うもの                                               | 場所                          |
| -------- | ------------------------------------------------------ | ----------------------------- |
| **参照** | `@supabase/ssr` の `createClient()`                    | `app/_lib/supabase/server.ts` |
| **更新** | `pg` の `createPgClient()` で生 SQL + トランザクション | 同上                          |

更新系は必ず `BEGIN` → 複数テーブル操作 → `COMMIT`、失敗時は `rollbackWithLog(client)`（`app/_lib/supabase/transaction.ts`）。
`finally` で `client.end()` を忘れない。

INSERT/UPDATE 文は手書きせず **`getPostgreSqlItems()`**（`app/_lib/utils/utils.ts`）で組み立てる。
`Omit<t_companies, 'id' | 'created_at' | 'updated_at'>` 型のオブジェクトを渡すと `{ columns, placeholders, values }` が返るので、それをプレースホルダ付き SQL に流す（`undefined` のキーは自動で除外される）。

どちらのクライアントも非 public スキーマを使うため schema 指定が必須：supabase-js は `db: { schema }`、pg は接続後に `SET search_path TO ...`。

### エラーハンドリング

全 API が `ApiResponse<T> = ApiSuccess<T> | ApiError`（`app/_types/types.ts`）を返す。HTTP ステータスだけで判断しない。

- エラーコードは `app/errors/ErrorCodes.ts` に **`E{HTTPステータス}-{連番}` 形式**で集約（例 `E400-05`, `E401-01`）。日本語メッセージもここ。新規エラーはここに追加してから使う。
- サーバー側は `throw new CustomError(code, message, status)` → `catch` で `{ success: false, error: e }` に変換して返す（例外を外に漏らさない）。
- `fetcher()` が `success: false` を `CustomError` として throw し直し、`useApiQuery` / `useApiMutation` が捕捉して **自動で Snackbar 表示**する。呼び出し側で個別にエラー表示を書く必要はない。

### バリデーション

Zod スキーマは `_lib/types.ts` に置き、**フォーム用と API 用の2段構え**：

```ts
export const CompanyDetailSchema = z.object({ ... });               // フォーム入力用
export const CompanyDetailApiSchema = z.object({                    // API 境界用
  request: CompanyDetailSchema,
}).strict();
```

メッセージは直書きせず `formatString(MSG_MAX, '食堂名', '256')` の形で `app/_config/constants.ts` のテンプレート（`MSG_REQUIRED` / `MSG_MAX` / `MSG_EMAIL` …）と正規表現（`REG_*`）を使う。

`validateRequest()` は `multipart/form-data` を特別扱いし、`formValues` フィールドを JSON パースしたうえで店舗画像のフィールド（`shop_image_file_data` など）をマージする。画像を含むフォームはこの形に合わせる。

### クライアント状態

- **サーバー状態**: TanStack Query。キーは `app/_lib/hooks/query/queryKeys.ts` の `QUERY_KEYS` に集約。素の `useQuery` / `useMutation` ではなく **`useApiQuery` / `useApiMutation` を使う**。
- **検索条件の保持**: `sessionStorage`。キーは `app/_config/sessionStorageKeys.ts` の `SESSION_STORAGE_KEYS`。
- **グローバル UI 状態**: `app/_ui/state/` の Context 群 — `snackBar`（通知）/ `processing`（ローディング）/ `dirty`（未保存離脱ガード）。`app/(private)/layout.tsx` で Provider をまとめて設置。
- ステータス値は `app/_types/enum.ts` の enum と、対になる `convertXxxName()` で表示名に変換する。

### 認証

`middleware.ts` → `app/_lib/supabase/middleware.ts` の `updateSession()`。ここで2段階のチェックをしている：

1. Supabase セッションの有無（無ければ `/login` へリダイレクト。`publicPaths` は `['/', '/login', '/error']`）
2. **`t_administrator` にそのメールアドレスが存在し、`usage_state` が有効か** — 一般ユーザーの Supabase アカウントで管理画面に入れないための関門

**ミドルウェアが動くパスは `middleware.ts` の `matcher` 配列に明示列挙**する方式。`app/(private)/` に新しい画面を足したら matcher にも追加しないと認証チェックごと素通りする。

### GMO Payment（キャンセル/返金のみ）

管理画面はキャンセル/返金のみ行う（`app/(private)/order/_lib/orderFunction.ts` の `orderCancel`）。クレジットカードは `alterTranGmo`（`JobCd=VOID`）、PayPayは `paypayCancelReturn`。

**PayPayのキャンセル/返金APIはクレジットと仕様が異なる**（GMOテスト環境での実疎通で判明、公開ドキュメントに記載なし）。`PaypayCancelReturn.idPass` は `JobCd` ではなく `OrderID` + `CancelAmount`/`CancelTax`（取消/返金する金額を明示指定）で行う。`CancelAmount` は `t_order.amount`（会社負担込みの合計金額）ではなく、実際にPayPayへ請求された `user_burden_amount` と一致させる必要がある（不一致だと `M01085011`）。詳細な調査経緯・他のPayPay API仕様（`EntryTranPaypay`/`ExecTranPaypay`/`SearchTradeMulti`等）は `../minshoku-order/CLAUDE.md` の「PayPay決済」節を参照。

### Supabase Storage

バケット名は `process.env.SUPABASE_STORAGE`。定数 `BUCKET_SHOP_IMAGES`（`'shop-images'`）は**バケット名ではなくバケット内のパス接頭辞**なので注意（`{BUCKET_SHOP_IMAGES}/{id}/{safeFileName}`）。ファイル名は `getSafeFileName()` を通す。

**画像差し替えは「アップロード成功 → 旧ファイル削除」の順を厳守**。逆順だと、アップロード失敗時に DB がロールバックして旧ファイル名の参照に戻るのに実体が消えており、`Object not found` になる（commit 9b7d906 で修正済み）。

## コーディング規約

- Prettier: シングルクォート / セミコロンあり / `printWidth: 120` / `tabWidth: 2`。`.prettierrc` が有効な設定で、`.prettier.json` は同内容の未使用ファイル。
- import 順は `simple-import-sort` で **error**。`yarn fix` で自動整形する。
- パスエイリアスは `@/*` → リポジトリルート。
- `@typescript-eslint/no-unused-vars` は off。`any` を使う箇所は `// eslint-disable-next-line @typescript-eslint/no-explicit-any` を都度付ける既存慣習に従う。
- 関数には JSDoc（`@param` / `@returns` を日本語で）を付ける。
- マジックナンバー・固定文言は `app/_config/constants.ts` に定義してから使う。
- セクション区切りは `/* 見出し\n---...--- */` のコメント形式で統一されている。

## 触らない方がよい場所

- `app/__notisute/` — 動作しない下書きメモ（`memo.txt` と全コメントアウト済みの `.ts`）。
- `app/test/` — 検証用の使い捨てページ。
