#!/usr/bin/env python3
import json
import glob

def fix_audio_path():
    chart_files = glob.glob("assets/charts/クライングガール_*.json")
    
    for chart_file in chart_files:
        print(f"修正中: {chart_file}")
        
        with open(chart_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 音楽ファイルパスを修正
        data["audioFile"] = "assets/sounds/cryinggirl.wav"
        
        with open(chart_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"完了: {chart_file}")

if __name__ == "__main__":
    fix_audio_path()
    print("全てのクライングガール譜面の音楽ファイルパスを修正しました！")