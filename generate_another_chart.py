#!/usr/bin/env python3
"""
Generate ANOTHER difficulty chart for cryinggirl
- Uses all 431 recorded timings (100% density)
- Generates appropriate chord patterns (70% single, 20% double, 10% triple)
- Random lane assignments with no duplicates per timing
"""

import json
import random
from typing import List, Dict, Any

def load_raw_recording(file_path: str) -> Dict[str, Any]:
    """Load the raw recording data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_chord(lanes: List[int] = [0, 1, 2, 3, 4, 5]) -> List[int]:
    """Generate a chord with appropriate distribution."""
    # 70% single notes, 20% double notes, 10% triple notes
    rand = random.random()
    
    if rand < 0.7:
        # Single note
        return [random.choice(lanes)]
    elif rand < 0.9:
        # Double note
        selected_lanes = random.sample(lanes, 2)
        return sorted(selected_lanes)
    else:
        # Triple note
        selected_lanes = random.sample(lanes, 3)
        return sorted(selected_lanes)

def generate_another_chart(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate ANOTHER difficulty chart from raw recording data."""
    
    # Extract timings
    timings = raw_data["recordedTimings"]
    
    # Generate notes for all timings
    notes = []
    for timing in timings:
        # Generate chord for this timing
        lanes = generate_chord()
        
        # Create note objects for each lane
        for lane in lanes:
            note = {
                "time": timing,
                "lane": lane
            }
            notes.append(note)
    
    # Create the chart structure
    chart = {
        "title": "クライングガール",
        "artist": "Unknown", 
        "bpm": 120,
        "offset": 0,
        "audioFile": "assets/sounds/cryinggirl.wav",
        "difficulty": {
            "name": "ANOTHER",
            "level": 11
        },
        "notes": notes
    }
    
    return chart

def main():
    """Main function to generate and save the chart."""
    input_file = "/Users/hayatoikeda/Desktop/開発/otogame/beatmania-game/assets/charts/cryinggirl_raw_recording.json"
    output_file = "/Users/hayatoikeda/Desktop/開発/otogame/beatmania-game/assets/charts/cryinggirl_another.json"
    
    print("Loading raw recording data...")
    raw_data = load_raw_recording(input_file)
    
    print(f"Found {len(raw_data['recordedTimings'])} timings")
    print("Generating ANOTHER difficulty chart...")
    
    # Set random seed for consistent results (can be removed for truly random)
    random.seed(42)
    
    chart = generate_another_chart(raw_data)
    
    print(f"Generated {len(chart['notes'])} notes")
    
    # Count chord distribution for verification
    timing_groups = {}
    for note in chart['notes']:
        time = note['time']
        if time not in timing_groups:
            timing_groups[time] = []
        timing_groups[time].append(note['lane'])
    
    single_count = sum(1 for lanes in timing_groups.values() if len(lanes) == 1)
    double_count = sum(1 for lanes in timing_groups.values() if len(lanes) == 2) 
    triple_count = sum(1 for lanes in timing_groups.values() if len(lanes) == 3)
    total_timings = len(timing_groups)
    
    print(f"\nChord distribution:")
    print(f"Single notes: {single_count}/{total_timings} ({single_count/total_timings*100:.1f}%)")
    print(f"Double notes: {double_count}/{total_timings} ({double_count/total_timings*100:.1f}%)")  
    print(f"Triple notes: {triple_count}/{total_timings} ({triple_count/total_timings*100:.1f}%)")
    
    print(f"\nSaving chart to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chart, f, ensure_ascii=False, indent=2)
    
    print("ANOTHER difficulty chart generated successfully!")
    print(f"Chart details:")
    print(f"- Title: {chart['title']}")
    print(f"- Difficulty: {chart['difficulty']['name']} (Level {chart['difficulty']['level']})")
    print(f"- Total notes: {len(chart['notes'])}")
    print(f"- Total timings: {total_timings}")
    print(f"- Density: 100% (all recorded timings used)")

if __name__ == "__main__":
    main()