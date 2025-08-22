# GitHub Pages 公開設定手順

## 1. GitHubリポジトリの作成

1. GitHubにログインして新しいリポジトリを作成
   - リポジトリ名: `body-pain-map`
   - Public（公開）を選択
   - READMEは追加しない（既にあるため）

## 2. ローカルリポジトリをGitHubに接続

```bash
# 現在のディレクトリで実行
git remote add origin https://github.com/YOUR_USERNAME/body-pain-map.git

# すべての変更をプッシュ
git push -u origin master
```

## 3. GitHub Pages の有効化

1. GitHubのリポジトリページを開く
2. Settings（設定）タブをクリック
3. 左側メニューの「Pages」をクリック
4. Source（ソース）セクションで：
   - 「Deploy from a branch」を選択
   - Branch: `master`（または`main`）を選択
   - Folder: `/ (root)` を選択
   - 「Save」をクリック

## 4. 公開URLの確認

設定後、数分待つと以下のURLでアクセス可能になります：

```
https://YOUR_USERNAME.github.io/body-pain-map/
```

## 5. モバイルでのアクセス

- iPhoneやAndroidのブラウザから上記URLにアクセス
- ホーム画面に追加することも可能（PWAのように使える）

## 注意事項

- 初回公開には最大10分程度かかることがあります
- 更新は `git push` するだけで自動的に反映されます
- プライベートリポジトリでもGitHub Pages は使えますが、Pro/Team/Enterpriseアカウントが必要です

## 代替案：GitHub Pages を使わない場合

もし既存のGitHub Pagesサイトがある場合、サブディレクトリとして追加することも可能：

1. 既存のGitHub Pagesリポジトリに `body-pain-map` フォルダを作成
2. そこにindex.htmlをコピー
3. URLは `https://YOUR_USERNAME.github.io/既存リポジトリ名/body-pain-map/` になります