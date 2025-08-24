#!/usr/bin/env python3
"""
譜面からスクラッチノーツを削除するスクリプト
"""
import json
import glob

def remove_scratch_notes():
    """全ての譜面ファイルからスクラッチノーツを削除"""
    chart_files = glob.glob("assets/charts/gozen4ji_*.json")
    
    for chart_file in chart_files:
        print(f"更新中: {chart_file}")
        
        with open(chart_file, 'r', encoding='utf-8') as f:
            chart = json.load(f)
        
        # スクラッチノーツ（lane 6以上）を削除
        original_count = len(chart['notes'])
        chart['notes'] = [note for note in chart['notes'] if note['lane'] < 6]
        new_count = len(chart['notes'])
        
        # ファイルを更新
        with open(chart_file, 'w', encoding='utf-8') as f:
            json.dump(chart, f, indent=2, ensure_ascii=False)
        
        print(f"完了: {original_count} -> {new_count}ノーツ (削除: {original_count - new_count})")

if __name__ == "__main__":
    remove_scratch_notes()
    print("全ての譜面からスクラッチノーツを削除しました！")