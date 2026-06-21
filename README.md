# 抗血栓薬服用患者の区域麻酔・神経ブロック 判定ツール

抗血栓薬を内服中の患者に対する区域麻酔（脊髄くも膜下麻酔・硬膜外麻酔）・末梢神経ブロック（深部／浅在性）の施行可否、および硬膜外カテーテル抜去後の内服再開時間の目安を表示する、医療従事者向けの参考ツールです。

## データソース

「抗血栓療法中の区域麻酔・神経ブロックガイドライン」
日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会 合同（2016年9月）表5・表6・表7

> 本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。最終的な臨床判断は最新版ガイドライン・各施設のプロトコル・主治医・麻酔科医の判断によってください。

## 技術スタック

- Next.js 14（App Router）
- React 18
- Tailwind CSS

外部API・データベースは使用していません。薬剤データは `lib/drugData.js` に静的に保持しています。

## ローカルでの起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## ビルド

```bash
npm run build
npm run start
```

## GitHub へのpush手順

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <あなたのリポジトリURL>
git push -u origin main
```

## Vercelへのデプロイ手順

1. [Vercel](https://vercel.com/) にログインし、「Add New... → Project」を選択
2. 上記でpushしたGitHubリポジトリを選択してインポート
3. Framework Preset が「Next.js」になっていることを確認（自動検出されます）
4. 環境変数の設定は不要です
5. 「Deploy」をクリックするとビルド・デプロイが実行されます

デプロイ完了後、発行されたURLでアプリにアクセスできます。

## ディレクトリ構成

```
app/
  layout.js        … メタデータ・フォント読み込み
  page.js
  globals.css
components/
  RegionalAnesthesiaTool.js  … メインのUI・状態管理（"use client"）
lib/
  drugData.js       … 薬剤データ（静的）
  logic.js          … 休薬基準の解決・併用時の最長基準採用ロジック
```
