#!/usr/bin/env python3
"""
譜面データを6鍵+スクラッチに変更するスクリプト
"""
import json
import glob

def update_chart_lanes():
    """全ての譜面ファイルのレーン数を6+1に変更"""
    chart_files = glob.glob("assets/charts/gozen4ji_*.json")
    
    for chart_file in chart_files:
        print(f"更新中: {chart_file}")
        
        with open(chart_file, 'r', encoding='utf-8') as f:
            chart = json.load(f)
        
        updated_notes = []
        for note in chart['notes']:
            # lane 7 (old scratch) -> lane 6 (new scratch)
            if note['lane'] == 7:
                note['lane'] = 6
            # lane 6 -> lane 5に移動（6鍵盤の範囲内に収める）
            elif note['lane'] == 6:
                note['lane'] = 5
            # lane > 5の場合は削除または調整
            elif note['lane'] > 6:
                continue  # スキップ
                
            updated_notes.append(note)
        
        chart['notes'] = updated_notes
        
        # ファイルを更新
        with open(chart_file, 'w', encoding='utf-8') as f:
            json.dump(chart, f, indent=2, ensure_ascii=False)
        
        print(f"完了: {len(updated_notes)}ノーツ")

if __name__ == "__main__":
    update_chart_lanes()
    print("全ての譜面を6鍵+スクラッチに更新しました！")