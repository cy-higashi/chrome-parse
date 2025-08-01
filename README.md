# chrome-parse

## 概要

**chrome-parse**は、主要ポータルサイトの各種検索結果やランキング情報をワンクリックで取得し、CSVファイルとしてダウンロードできるChrome拡張機能です。
市場調査やデータ収集を効率化するための社内ツールとして設計されています。

## 主な機能

- 主要ポータルサイト等の検索結果一覧の取得とCSVダウンロード
- 各サイトのランキング・サジェスト・ヒストグラム等のデータ取得
- 個別商品情報の抽出・ダウンロード
- 取得データはShift-JISでエンコードされたCSV形式で保存

## 使い方

1. Chrome拡張としてインストール
2. 対象サイトで拡張機能アイコンをクリック
3. ポップアップメニューから取得したいデータのボタンを選択
4. 自動的にデータを抽出し、CSVファイルがダウンロードされます

## ディレクトリ構成

- `parse-app/`  
  - Chrome拡張本体
  - `manifest.json` … 拡張機能の設定
  - `popup.html`, `popup.js`, `styles.css` … UIとロジック
  - `menu/` … 各サイト・機能ごとのデータ抽出スクリプト
  - `icons/` … サイトロゴ等
  - `libs/encoding.min.js` … CSVのShift-JIS変換用ライブラリ
- `docs/`  
  - `update.xml` … 拡張機能の自動更新用
  - `parse-app.crx` … 拡張機能のパッケージファイル

## インストール方法

1. `docs/parse-app.crx` をChromeの拡張機能ページ（chrome://extensions/）にドラッグ＆ドロップ
2. 必要に応じて「デベロッパーモード」をONにしてください

## 拡張機能の更新方法

1. `parse-app/manifest.json` の `version` を上げる
2. 同じ `.pem` ファイルで `.crx` を再生成
3. `docs/parse-app.crx` を上書き
4. `docs/update.xml` の `version="..."` も更新
5. `git push` するだけで自動で配信！

## 注意事項

- 本ツールは社内利用を想定しています
- サイト構造の変更等により動作しなくなる場合があります
test