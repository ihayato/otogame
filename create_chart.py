#!/usr/bin/env python3
"""
手動で「午前四時の宮殿」の譜面を作成するスクリプト
楽曲の構造とリズムに基づいて作成
"""
import json
import random

def create_gozen4ji_chart():
    """午前四時の宮殿の譜面データを作成"""
    
    # 楽曲情報（推定値）
    bpm = 134  # 一般的なJ-POPのBPM
    offset = 1.0  # イントロ開始までの時間
    
    # 楽曲構造（4分間の楽曲と仮定）
    structure = [
        {"name": "intro", "start": 0, "end": 16, "density": 0.3},
        {"name": "verse1", "start": 16, "end": 48, "density": 0.5},
        {"name": "chorus1", "start": 48, "end": 80, "density": 0.8},
        {"name": "verse2", "start": 80, "end": 112, "density": 0.6},
        {"name": "chorus2", "start": 112, "end": 144, "density": 0.9},
        {"name": "bridge", "start": 144, "end": 176, "density": 0.4},
        {"name": "final_chorus", "start": 176, "end": 220, "density": 1.0},
        {"name": "outro", "start": 220, "end": 248, "density": 0.3}
    ]
    
    notes = []
    beat_interval = 60.0 / bpm  # 1拍の長さ（秒）
    
    # パターンライブラリ
    patterns = {
        "basic_4beat": [0, 0, 0, 0],  # 4つ打ち
        "syncopated": [0, 0, 1, 0, 2, 0, 1, 0],  # シンコペーション
        "fill": [0, 1, 2, 3, 4, 5, 6],  # フィル
        "scratch_pattern": [7, 7],  # スクラッチパターン
        "chord": [(0, 2, 4), (1, 3, 5)],  # コード
    }
    
    for section in structure:
        section_start = section["start"]
        section_end = section["end"]
        density = section["density"]
        
        # セクション内の拍数
        beats_in_section = int((section_end - section_start) / beat_interval * 4)
        
        for beat in range(beats_in_section):
            time = section_start + (beat * beat_interval / 4)
            
            if time >= section_end:
                break
                
            # 密度に基づいてノーツ配置判定
            if random.random() < density:
                # セクションに応じたパターン選択
                if section["name"] in ["intro", "outro"]:
                    # 簡単なパターン
                    if beat % 4 == 0:  # 1拍目
                        lane = random.choice([0, 2, 4, 6])
                        notes.append({"time": round(time, 3), "lane": lane, "type": "tap"})
                        
                elif section["name"] in ["verse1", "verse2"]:
                    # 中程度のパターン
                    if beat % 2 == 0:  # 2拍ごと
                        lane = random.choice(range(7))
                        note_type = "tap"
                        if random.random() < 0.1:  # 10%でホールド
                            note_type = "hold"
                        notes.append({
                            "time": round(time, 3), 
                            "lane": lane, 
                            "type": note_type,
                            **({"duration": beat_interval} if note_type == "hold" else {})
                        })
                        
                elif "chorus" in section["name"]:
                    # 複雑なパターン
                    if beat % 1 == 0:  # 全拍
                        # メイン音
                        main_lanes = [0, 2, 4, 6]
                        lane = random.choice(main_lanes)
                        notes.append({"time": round(time, 3), "lane": lane, "type": "tap"})
                        
                        # 同時押し
                        if random.random() < 0.3:
                            second_lane = random.choice([l for l in main_lanes if l != lane])
                            notes.append({"time": round(time, 3), "lane": second_lane, "type": "tap"})
                        
                        # スクラッチ
                        if random.random() < 0.15:
                            notes.append({"time": round(time, 3), "lane": 7, "type": "scratch"})
                            
                elif section["name"] == "bridge":
                    # ブリッジセクション
                    if beat % 8 == 0:  # 2小節ごと
                        # ホールドノーツ中心
                        lane = random.choice(range(6))
                        notes.append({
                            "time": round(time, 3), 
                            "lane": lane, 
                            "type": "hold",
                            "duration": beat_interval * 4
                        })
    
    # 特別なパターンを追加
    add_special_patterns(notes, structure, beat_interval)
    
    # 時間でソート
    notes.sort(key=lambda x: x["time"])
    
    return {
        "title": "午前四時の宮殿",
        "artist": "Unknown",
        "bpm": bpm,
        "offset": offset,
        "audioFile": "assets/sounds/gozen4ji.mp3",
        "difficulty": {
            "name": "NORMAL",
            "level": 7
        },
        "notes": notes
    }

def add_special_patterns(notes, structure, beat_interval):
    """特別なパターンを追加"""
    
    # サビ前のビルドアップ
    for section in structure:
        if "chorus" in section["name"]:
            buildup_time = section["start"] - beat_interval * 4
            # スクラッチラッシュ
            for i in range(8):
                time = buildup_time + (i * beat_interval / 4)
                if i % 2 == 0:
                    notes.append({"time": round(time, 3), "lane": 7, "type": "scratch"})
    
    # エンディング部分の特別パターン
    ending_start = 240
    for i in range(16):
        time = ending_start + (i * beat_interval / 8)
        lane = i % 7
        notes.append({"time": round(time, 3), "lane": lane, "type": "tap"})

def create_multiple_difficulties():
    """複数の難易度を作成"""
    base_chart = create_gozen4ji_chart()
    
    difficulties = {
        "BEGINNER": {"level": 3, "note_reduction": 0.3, "no_holds": True},
        "NORMAL": {"level": 5, "note_reduction": 0.6, "no_holds": False},
        "HYPER": {"level": 8, "note_reduction": 0.8, "no_holds": False},
        "ANOTHER": {"level": 11, "note_reduction": 1.0, "no_holds": False}
    }
    
    for diff_name, config in difficulties.items():
        chart = base_chart.copy()
        chart["difficulty"] = {"name": diff_name, "level": config["level"]}
        
        # ノーツ数調整
        note_count = int(len(chart["notes"]) * config["note_reduction"])
        selected_notes = random.sample(chart["notes"], note_count)
        
        # BEGINNER向けの調整
        if config["no_holds"]:
            selected_notes = [note for note in selected_notes if note["type"] != "hold"]
            for note in selected_notes:
                if note["type"] == "scratch":
                    note["type"] = "tap"
                    note["lane"] = random.choice(range(7))
        
        # ANOTHERの場合、追加のノーツを配置
        if diff_name == "ANOTHER":
            additional_notes = []
            for note in selected_notes[:]:
                # 同時押しを増やす
                if random.random() < 0.2 and note["lane"] < 6:
                    additional_lane = (note["lane"] + random.choice([2, 3])) % 7
                    additional_notes.append({
                        "time": note["time"],
                        "lane": additional_lane,
                        "type": "tap"
                    })
            selected_notes.extend(additional_notes)
        
        selected_notes.sort(key=lambda x: x["time"])
        chart["notes"] = selected_notes
        
        # ファイル出力
        filename = f"assets/charts/gozen4ji_{diff_name.lower()}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(chart, f, indent=2, ensure_ascii=False)
        
        print(f"譜面作成完了: {filename} (ノーツ数: {len(selected_notes)})")

if __name__ == "__main__":
    create_multiple_difficulties()
    print("全ての譜面が作成されました！")