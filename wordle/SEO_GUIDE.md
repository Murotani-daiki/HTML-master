# SEO対策ガイド - Wordle

## 実装済みのSEO対策

### 1. **メタタグ最適化**
- **Title タグ**: 「Wordle - 1日に何回でもできる英単語推測ゲーム | html-master.com」
- **Meta Description**: 検索結果に表示される説明文を最適化
- **Meta Keywords**: 主要キーワード設定  
- **Meta Robots**: インデックス許可設定
- **Theme Color**: ブラウダーのタブ色設定

### 2. **Open Graph & Twitter Card**
SNS（Facebook、Twitterなど）でのシェア時に最適な情報表示：
- OG:type, OG:url, OG:title, OG:description, OG:image, OG:locale
- Twitter:card, Twitter:title, Twitter:description, Twitter:image

### 3. **構造化データ（JSON-LD）**
検索エンジンに対してコンテンツ情報を明確に配信：
- WebApplication タイプの指定
- アプリケーション名、説明、カテゴリー情報
- 無料アプリケーションとしての価格情報

### 4. **キャノニカルURL**
- `<link rel="canonical" href="https://html-master.com/wordle/">`
- 重複コンテンツの問題を回避

### 5. **robots.txt**
検索エンジンのクローリング制御：
- HTMLのインデックスを許可
- JS/CSSフォルダは除外（バンド幅節約）
- サイトマップの場所を指定

### 6. **sitemap.xml**
サイトマップの提供：
- ページのURL情報
- 最終更新日時
- 更新頻度（daily）
- 優先度（1.0 = 最高優先度）

### 7. **.htaccess 設定（Apache環境）**
- **キャッシュ活性化**: ブラウザキャッシュの有効期限設定
- **GZIP圧縮**: ファイル転送量削減でページ速度改善
- **HTTPS強制**: セキュリティ向上とSEOランキング改善
- **WWW統一**: www なしに統一してドメイン重複排除

---

## 導入後の推奨事項

1. **Google Search Console登録**
   - https://search.google.com/search-console/ にサイトマップを登録
   - インデックス状況をモニタリング

2. **Google Analytics導入**
   - ユーザー行動分析
   - キーワード別のトラフィック確認

3. **OGImage（og-image.png）準備**
   - SNS共有時の表示画像（1200×630px推奨）
   - `https://html-master.com/wordle/og-image.png` に配置

4. **定期的なSEO監査**
   - PageSpeed Insights での速度確認
   - Core Web Vitals の確認
   - 検索順位の定期監視

5. **コンテンツ最適化**
   - カテゴリー説明文の充実化
   - 内部リンク戦略の強化

---

## ローカル開発環境テスト

各メタタグはHTMLソースで確認可能：
```bash
# index.html の <head> セクションで確認可能
```

本番環境にデプロイ後、以下でテスト可能：
- Facebook シェア テスター: https://developers.facebook.com/tools/debug/
- Twitter Card バリデーター: https://cards-dev.twitter.com/validator

---

## サーバー環境要件

- Apache 2.2+ （.htaccess サポート必須）
- mod_rewrite モジュール有効化
- mod_deflate モジュール有効化（GZIP圧縮）
- mod_expires モジュール有効化（キャッシュ制御）

---

最終更新: 2026年2月9日
