class ChartEditor {
    constructor() {
        this.audio = document.getElementById('editor-audio');
        this.isRecording = false;
        this.recordedTimings = [];
        this.startTime = 0;
        this.songData = {
            title: '',
            artist: '',
            bpm: 120,
            offset: 0,
            audioFile: null
        };
        
        this.initEventListeners();
        this.initSliders();
    }
    
    initEventListeners() {
        // ファイル読み込み
        document.getElementById('song-file').addEventListener('change', (e) => this.loadAudioFile(e));
        
        // 楽曲情報入力
        document.getElementById('song-title').addEventListener('input', (e) => {
            this.songData.title = e.target.value;
        });
        document.getElementById('song-artist').addEventListener('input', (e) => {
            this.songData.artist = e.target.value;
        });
        document.getElementById('song-bpm').addEventListener('input', (e) => {
            this.songData.bpm = parseInt(e.target.value);
        });
        document.getElementById('song-offset').addEventListener('input', (e) => {
            this.songData.offset = parseFloat(e.target.value);
        });
        
        // 記録制御
        document.getElementById('record-btn').addEventListener('click', () => this.startRecording());
        document.getElementById('stop-record-btn').addEventListener('click', () => this.stopRecording());
        document.getElementById('clear-record-btn').addEventListener('click', () => this.clearRecording());
        
        // スペースキー記録
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 譜面生成・出力
        document.getElementById('generate-btn').addEventListener('click', () => this.generateCharts());
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadCharts());
        
        // モーダル制御
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
    }
    
    initSliders() {
        const sliders = ['beginner-density', 'normal-density', 'hyper-density', 'another-density'];
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueSpan = document.getElementById(sliderId + '-value');
            
            slider.addEventListener('input', (e) => {
                valueSpan.textContent = e.target.value + '%';
            });
        });
    }
    
    loadAudioFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        this.audio.src = url;
        this.songData.audioFile = file.name;
        
        document.getElementById('record-btn').disabled = false;
        
        console.log('楽曲ファイルを読み込みました:', file.name);
        this.updateStatus('楽曲ファイルが読み込まれました。記録を開始できます。');
    }
    
    startRecording() {
        if (!this.audio.src) {
            alert('まず楽曲ファイルを選択してください。');
            return;
        }
        
        this.isRecording = true;
        this.recordedTimings = [];
        this.startTime = performance.now();
        
        // UI更新
        document.getElementById('record-btn').disabled = true;
        document.getElementById('stop-record-btn').disabled = false;
        document.getElementById('generate-btn').disabled = true;
        
        // 楽曲再生
        this.audio.currentTime = 0;
        this.audio.play();
        
        this.updateRecordingStatus();
        console.log('記録開始');
        this.updateStatus('記録中... スペースキーでタイミングを記録してください。');
    }
    
    stopRecording() {
        this.isRecording = false;
        this.audio.pause();
        
        // UI更新
        document.getElementById('record-btn').disabled = false;
        document.getElementById('stop-record-btn').disabled = true;
        document.getElementById('generate-btn').disabled = this.recordedTimings.length === 0;
        
        console.log(`記録停止。${this.recordedTimings.length}個のタイミングを記録しました。`);
        this.updateStatus(`記録完了！ ${this.recordedTimings.length}個のタイミングを記録しました。`);
    }
    
    clearRecording() {
        this.recordedTimings = [];
        this.updateRecordingDisplay();
        document.getElementById('generate-btn').disabled = true;
        document.getElementById('preview-btn').disabled = true;
        document.getElementById('download-btn').disabled = true;
        
        console.log('記録をクリアしました');
        this.updateStatus('記録をクリアしました。');
    }
    
    handleKeyDown(event) {
        if (event.code === 'Space' && this.isRecording) {
            event.preventDefault();
            this.recordTiming();
        }
    }
    
    recordTiming() {
        if (!this.isRecording) return;
        
        const currentTime = (performance.now() - this.startTime) / 1000;
        const adjustedTime = Math.max(0, currentTime - this.songData.offset);
        
        this.recordedTimings.push(adjustedTime);
        
        // ビジュアルフィードバック
        this.showTapFeedback();
        this.updateRecordingDisplay();
        
        console.log(`タイミング記録: ${adjustedTime.toFixed(3)}s`);
    }
    
    showTapFeedback() {
        const indicator = document.getElementById('tap-indicator');
        indicator.classList.add('active');
        
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 200);
    }
    
    updateRecordingStatus() {
        if (!this.isRecording) return;
        
        const currentTime = this.audio.currentTime;
        document.getElementById('current-time').textContent = `楽曲時間: ${currentTime.toFixed(2)}s`;
        
        setTimeout(() => this.updateRecordingStatus(), 100);
    }
    
    updateRecordingDisplay() {
        document.getElementById('recorded-count').textContent = `記録済み: ${this.recordedTimings.length}回`;
        
        if (this.recordedTimings.length > 0) {
            const lastTiming = this.recordedTimings[this.recordedTimings.length - 1];
            document.getElementById('last-tap').textContent = `最後のタップ: ${lastTiming.toFixed(3)}s`;
        }
    }
    
    generateCharts() {
        if (this.recordedTimings.length === 0) {
            alert('まずタイミングを記録してください。');
            return;
        }
        
        this.updateStatus('譜面を生成中...');
        
        const difficulties = ['beginner', 'normal', 'hyper', 'another'];
        this.generatedCharts = {};
        
        difficulties.forEach(difficulty => {
            this.generatedCharts[difficulty] = this.generateDifficultyChart(difficulty);
        });
        
        document.getElementById('preview-btn').disabled = false;
        document.getElementById('download-btn').disabled = false;
        
        console.log('全ての難易度の譜面を生成しました');
        this.updateStatus('譜面生成完了！プレビューまたはダウンロードができます。');
    }
    
    generateDifficultyChart(difficulty) {
        const config = this.getDifficultyConfig(difficulty);
        const timings = [...this.recordedTimings];
        
        // 密度に基づいてタイミングを選択
        const selectedCount = Math.floor(timings.length * (config.density / 100));
        const selectedTimings = this.selectTimings(timings, selectedCount);
        
        // ノーツを生成
        const notes = selectedTimings.map(timing => {
            return this.createNotesFromTiming(timing, config);
        }).flat();
        
        // 時間でソート
        notes.sort((a, b) => a.time - b.time);
        
        return {
            title: this.songData.title || 'Untitled',
            artist: this.songData.artist || 'Unknown',
            bpm: this.songData.bpm,
            offset: this.songData.offset,
            audioFile: `assets/sounds/${this.songData.audioFile}`,
            difficulty: {
                name: difficulty.toUpperCase(),
                level: this.getDifficultyLevel(difficulty)
            },
            notes: notes
        };
    }
    
    getDifficultyConfig(difficulty) {
        const densitySlider = document.getElementById(`${difficulty}-density`);
        const chordSelect = document.getElementById(`${difficulty}-chord`);
        
        return {
            density: parseInt(densitySlider.value),
            chordLevel: parseInt(chordSelect.value)
        };
    }
    
    getDifficultyLevel(difficulty) {
        const levels = {
            beginner: 3,
            normal: 5,
            hyper: 8,
            another: 11
        };
        return levels[difficulty] || 5;
    }
    
    selectTimings(timings, count) {
        if (count >= timings.length) return timings;
        
        // 等間隔で選択（より良い分散のため）
        const selected = [];
        const interval = timings.length / count;
        
        for (let i = 0; i < count; i++) {
            const index = Math.floor(i * interval);
            selected.push(timings[index]);
        }
        
        return selected;
    }
    
    createNotesFromTiming(timing, config) {
        const notes = [];
        const chordSize = this.getChordSize(config.chordLevel);
        
        if (chordSize === 1) {
            // 単体ノーツ
            const lane = Math.floor(Math.random() * 6);
            notes.push({
                time: parseFloat(timing.toFixed(3)),
                lane: lane,
                type: 'tap'
            });
        } else {
            // 同時押しノーツ
            const usedLanes = new Set();
            for (let i = 0; i < chordSize; i++) {
                let lane;
                do {
                    lane = Math.floor(Math.random() * 6);
                } while (usedLanes.has(lane));
                
                usedLanes.add(lane);
                notes.push({
                    time: parseFloat(timing.toFixed(3)),
                    lane: lane,
                    type: 'tap'
                });
            }
        }
        
        return notes;
    }
    
    getChordSize(chordLevel) {
        const random = Math.random();
        
        switch (chordLevel) {
            case 0: return 1; // なし
            case 1: return random < 0.1 ? 2 : 1; // 稀に2個
            case 2: return random < 0.2 ? 2 : 1; // 時々2個
            case 3: return random < 0.1 ? 3 : (random < 0.3 ? 2 : 1); // 時々3個
            case 4: return random < 0.2 ? 3 : (random < 0.5 ? 2 : 1); // 頻繁に3個
            default: return 1;
        }
    }
    
    showPreview() {
        const modal = document.getElementById('preview-modal');
        const info = document.getElementById('preview-info');
        
        let infoText = '<h4>生成された譜面情報</h4>';
        Object.keys(this.generatedCharts).forEach(difficulty => {
            const chart = this.generatedCharts[difficulty];
            infoText += `<p><strong>${difficulty.toUpperCase()}</strong>: ${chart.notes.length}ノーツ</p>`;
        });
        
        info.innerHTML = infoText;
        modal.style.display = 'block';
    }
    
    closeModal() {
        document.getElementById('preview-modal').style.display = 'none';
    }
    
    downloadCharts() {
        if (!this.generatedCharts) {
            alert('まず譜面を生成してください。');
            return;
        }
        
        Object.keys(this.generatedCharts).forEach(difficulty => {
            const chart = this.generatedCharts[difficulty];
            const dataStr = JSON.stringify(chart, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${this.songData.title || 'chart'}_${difficulty}.json`;
            link.click();
        });
        
        console.log('全ての譜面をダウンロードしました');
        this.updateStatus('譜面ファイルをダウンロードしました！');
    }
    
    updateStatus(message) {
        document.getElementById('generation-status').textContent = message;
    }
}

// エディタ初期化
const editor = new ChartEditor();