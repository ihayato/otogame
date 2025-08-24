# Beatmania風音ゲー - 午前四時の宮殿

## 概要
「午前四時の宮殿」を使用したビートマニア風リズムゲームです。

## 特徴
- 7鍵盤 + スクラッチレーン（計8レーン）
- 4段階の難易度（BEGINNER/NORMAL/HYPER/ANOTHER）
- リアルタイム判定システム（PERFECT/GREAT/GOOD/BAD/POOR）
- スコア・コンボシステム
- 実際の楽曲に合わせた譜面

## キー配置
- **1鍵**: S
- **2鍵**: D  
- **3鍵**: F
- **4鍵**: J
- **5鍵**: K
- **6鍵**: L
- **7鍵**: ;
- **スクラッチ**: ↑↓ (矢印キー)

## 遊び方

### 1. サーバー起動
```bash
python3 server.py
```

### 2. ブラウザでアクセス
http://localhost:8000 を開く

### 3. ゲームプレイ
1. 難易度を選択
2. STARTボタンをクリック
3. 降ってくるノーツに合わせてキーを押す
4. 判定ラインでタイミングよく入力

## 難易度について
- **BEGINNER (Level 3)**: 約435ノーツ、基本パターンのみ
- **NORMAL (Level 5)**: 約907ノーツ、標準的な難易度  
- **HYPER (Level 8)**: 約1209ノーツ、同時押し増加
- **ANOTHER (Level 11)**: 約1755ノーツ、最高難易度

## ファイル構成
```
beatmania-game/
├── index.html          # メインゲーム画面
├── css/style.css       # スタイルシート
├── js/game.js          # ゲームロジック
├── assets/
│   ├── charts/         # 譜面データ
│   │   ├── gozen4ji_beginner.json
│   │   ├── gozen4ji_normal.json
│   │   ├── gozen4ji_hyper.json
│   │   └── gozen4ji_another.json
│   └── sounds/
│       └── gozen4ji.mp3 # 音楽ファイル
├── server.py           # ローカルHTTPサーバー
└── create_chart.py     # 譜面生成スクリプト
```

## 譜面フォーマット
```json
{
  "title": "楽曲名",
  "artist": "アーティスト名", 
  "bpm": 134,
  "offset": 1.0,
  "audioFile": "assets/sounds/gozen4ji.mp3",
  "difficulty": {"name": "NORMAL", "level": 5},
  "notes": [
    {"time": 2.0, "lane": 0, "type": "tap"},
    {"time": 2.5, "lane": 7, "type": "scratch"},
    {"time": 3.0, "lane": 2, "type": "hold", "duration": 1.0}
  ]
}
```

### ノーツタイプ
- **tap**: 通常ノーツ
- **hold**: ホールドノーツ（長押し）
- **scratch**: スクラッチノーツ

## カスタマイズ
新しい譜面を作成する場合は、`create_chart.py`を参考にして独自の譜面データを作成できます。