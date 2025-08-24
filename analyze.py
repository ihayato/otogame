#!/usr/bin/env python3
"""
音楽ファイルを分析してBPMとビート情報を抽出するツール
"""
import librosa
import numpy as np
import json
import os
import sys

def analyze_audio(file_path):
    print(f"楽曲を分析中: {file_path}")
    
    # 音声ファイルを読み込み
    y, sr = librosa.load(file_path, duration=None)
    duration = len(y) / sr
    print(f"楽曲の長さ: {duration:.2f}秒")
    
    # BPM検出
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    print(f"検出されたBPM: {tempo:.2f}")
    
    # ビートタイミングを秒に変換
    beat_times = librosa.frames_to_time(beats, sr=sr)
    
    # オンセット（音の開始）検出
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, units='time')
    
    # 楽曲の分析結果
    analysis = {
        "bpm": float(tempo),
        "duration": float(duration),
        "beat_times": beat_times.tolist(),
        "onset_times": onset_frames.tolist(),
        "sample_rate": sr
    }
    
    return analysis

def create_chart_from_analysis(analysis, difficulty="NORMAL"):
    """分析結果から譜面データを生成"""
    bpm = analysis["bpm"]
    beat_times = analysis["beat_times"]
    onset_times = analysis["onset_times"]
    duration = analysis["duration"]
    
    # 基本設定
    beat_interval = 60.0 / bpm
    
    # オフセットを最初のビートから計算
    offset = beat_times[0] if beat_times else 0.5
    
    notes = []
    lanes = list(range(8))  # 7鍵盤 + スクラッチ
    
    # 難易度に応じた密度調整
    density_config = {
        "BEGINNER": {"beat_divisor": 1, "lane_variety": 3, "scratch_freq": 0.1},
        "NORMAL": {"beat_divisor": 2, "lane_variety": 5, "scratch_freq": 0.15},
        "HYPER": {"beat_divisor": 4, "lane_variety": 7, "scratch_freq": 0.2},
        "ANOTHER": {"beat_divisor": 8, "lane_variety": 8, "scratch_freq": 0.25}
    }
    
    config = density_config.get(difficulty, density_config["NORMAL"])
    
    # メインビートでノーツ配置
    last_lane = -1
    for i, beat_time in enumerate(beat_times):
        if beat_time >= duration - 1:  # 楽曲終了1秒前まで
            break
            
        # ビート分割に基づいてノーツ配置
        for subdivision in range(config["beat_divisor"]):
            time = beat_time + (subdivision * beat_interval / config["beat_divisor"])
            
            # 密度調整（全てのタイミングにノーツを置かない）
            if subdivision == 0 or (i % 2 == 0 and subdivision % 2 == 0):
                # レーン選択（連続を避ける）
                available_lanes = [l for l in range(config["lane_variety"]) if l != last_lane]
                lane = np.random.choice(available_lanes)
                last_lane = lane
                
                # スクラッチノーツの確率
                if np.random.random() < config["scratch_freq"]:
                    lane = 7  # スクラッチレーン
                
                # ノーツタイプ決定
                note_type = "tap"
                if lane != 7 and np.random.random() < 0.1:  # 10%の確率でホールドノーツ
                    note_type = "hold"
                    duration_hold = beat_interval * np.random.choice([1, 2])
                elif lane == 7:
                    note_type = "scratch"
                
                note = {
                    "time": round(time, 3),
                    "lane": lane,
                    "type": note_type
                }
                
                if note_type == "hold":
                    note["duration"] = round(duration_hold, 3)
                
                notes.append(note)
    
    # オンセットベースのノーツも追加（メロディライン）
    for onset_time in onset_times[::3]:  # 3つに1つのオンセットを使用
        if onset_time < duration - 1 and onset_time > offset:
            # 既存のノーツと重複しないかチェック
            conflict = any(abs(note["time"] - onset_time) < 0.1 for note in notes)
            if not conflict:
                lane = np.random.choice(range(6))  # 通常レーンのみ
                notes.append({
                    "time": round(onset_time, 3),
                    "lane": lane,
                    "type": "tap"
                })
    
    # 時間でソート
    notes.sort(key=lambda x: x["time"])
    
    return {
        "title": "午前四時の宮殿",
        "artist": "Unknown",
        "bpm": round(bpm),
        "offset": round(offset, 3),
        "audioFile": "assets/sounds/gozen4ji.mp3",
        "difficulty": {
            "name": difficulty,
            "level": {"BEGINNER": 3, "NORMAL": 5, "HYPER": 8, "ANOTHER": 11}[difficulty]
        },
        "notes": notes
    }

def main():
    audio_file = "/Users/hayatoikeda/Downloads/午前四時の宮殿.mp3"
    
    if not os.path.exists(audio_file):
        print(f"音楽ファイルが見つかりません: {audio_file}")
        return
    
    try:
        # 楽曲分析
        analysis = analyze_audio(audio_file)
        
        # 難易度別に譜面生成
        difficulties = ["BEGINNER", "NORMAL", "HYPER"]
        
        for difficulty in difficulties:
            print(f"\n{difficulty}譜面を生成中...")
            chart = create_chart_from_analysis(analysis, difficulty)
            
            # ファイル出力
            output_file = f"assets/charts/gozen4ji_{difficulty.lower()}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(chart, f, indent=2, ensure_ascii=False)
            
            print(f"譜面保存: {output_file}")
            print(f"ノーツ数: {len(chart['notes'])}")
        
        print("\n譜面生成完了！")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        print("librosaがインストールされていない可能性があります。")
        print("pip install librosa でインストールしてください。")

if __name__ == "__main__":
    main()