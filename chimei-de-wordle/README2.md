# 日本の地名でWordle 🏯

日本の地名（都道府県・市区町村）を5文字のローマ字で当てるWordleスタイルのゲームです。

## 🎮 主な機能

### 完成済み機能
- **Wordleゲーム**: 6回以内に5文字の日本の地名（ローマ字）を当てる
- **ヒント表示**: 🟩正しい位置 / 🟨含まれるが位置違い / ⬛含まれない
- **Google Maps連携**: 正解後に地名の場所をGoogle Mapで表示
- **統計機能**: プレイ数・勝率・連勝数・推測分布をローカル保存
- **結果シェア**: Twitter共有 / クリップボードコピー
- **🏆 ランキング機能（NEW）**: 連勝数をサーバーに登録し、他のユーザーと競える
  - ニックネーム登録
  - 現在の連勝数ランキング
  - 最大連勝数ランキング
  - 勝率ランキング
  - 自分の順位をハイライト表示
- **桜の花びらアニメーション**: 背景に桜が降るビジュアル演出
- **レスポンシブデザイン**: モバイル・デスクトップ対応

### エントリURI
- `index.html` - メインゲーム画面

## 📊 データモデル

### rankings テーブル
| フィールド | 型 | 説明 |
|-----------|------|------|
| id | text | ユニークID（自動生成） |
| player_name | text | プレイヤーのニックネーム |
| player_id | text | ブラウザ固有のプレイヤーID（UUID） |
| current_streak | number | 現在の連勝数 |
| best_streak | number | 最大連勝数 |
| played | number | 総プレイ回数 |
| won | number | 勝利数 |
| win_rate | number | 勝率（%） |

### ローカルストレージ
- `chimeidle-stats`: ゲーム統計データ
- `chimeidle-player-id`: プレイヤーの固有ID
- `chimeidle-player-name`: ニックネーム
- `chimeidle-visited`: 初回訪問フラグ

## 🔧 技術構成
- HTML5 / CSS3 / Vanilla JavaScript（単一ファイル構成）
- Google Fonts（Noto Sans JP）
- Font Awesome 6.4.0（アイコン）
- RESTful Table API（ランキングデータ永続化）

## 🚀 推奨次ステップ
- 日別チャレンジモード（全ユーザーが同じ問題を解く）
- ランキングのページネーション（100位以降の表示）
- プレイヤーの戦績詳細ページ
- ダークモード対応
- ランキングの自動リフレッシュ（WebSocket等）
