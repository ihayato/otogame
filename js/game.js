class BeatmaniaGame {
    constructor() {
        this.chartData = null;
        this.audio = document.getElementById('game-audio');
        this.video = document.getElementById('music-video');
        this.startTime = 0;
        this.isPlaying = false;
        this.notes = [];
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.noteSpeed = 3;
        this.customCharts = {};
        this.judgmentTiming = {
            perfect: 0.08,
            great: 0.12,
            good: 0.18,
            bad: 0.25,
            poor: 0.35
        };
        
        this.keyMap = {
            'a': 0, 's': 1, 'd': 2, 'g': 3,
            'h': 4, 'j': 5
        };
        
        this.initEventListeners();
        this.initMVControls();
        this.initCustomCharts();
        this.initAudioContext();
    }
    
    initAudioContext() {
        // ユーザーインタラクション後に音声コンテキストを有効化
        const enableAudio = () => {
            if (this.audio.muted) {
                this.audio.muted = false;
            }
            // ダミー再生で音声コンテキストを有効化
            this.audio.play().then(() => {
                this.audio.pause();
                this.audio.currentTime = 0;
                console.log('音声コンテキスト初期化完了');
            }).catch(() => {
                // エラーは無視（まだ音源が設定されていない場合など）
            });
            
            // イベントリスナーを削除
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
        };
        
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
    }
    
    initEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('mousedown', () => {
                const lane = parseInt(key.dataset.key);
                this.pressKey(lane);
            });
            key.addEventListener('mouseup', () => {
                const lane = parseInt(key.dataset.key);
                this.releaseKey(lane);
            });
        });
    }
    
    initMVControls() {
        // MV controls are removed, video is always displayed
        if (this.video) {
            this.video.style.display = 'block';
            this.video.style.opacity = '0.3';
        }
    }
    
    initCustomCharts() {
        const songChoice = document.getElementById('song-choice');
        const customSection = document.getElementById('custom-chart-section');
        const customFileInput = document.getElementById('custom-chart-file');
        
        songChoice.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customSection.style.display = 'block';
            } else {
                customSection.style.display = 'none';
            }
        });
        
        customFileInput.addEventListener('change', (e) => {
            this.loadCustomCharts(e.target.files);
        });
    }
    
    async loadCustomCharts(files) {
        if (files.length === 0) return;
        
        this.customCharts = {};
        
        for (const file of files) {
            try {
                const text = await file.text();
                const chartData = JSON.parse(text);
                const difficulty = chartData.difficulty.name.toLowerCase();
                
                // ファイル内容をBlobURLに変換
                const audioBlob = new Blob([], {type: 'audio/mpeg'});
                chartData.audioFileBlob = URL.createObjectURL(audioBlob);
                
                this.customCharts[difficulty] = chartData;
                console.log(`カスタム譜面読み込み: ${difficulty} (${chartData.notes.length}ノーツ)`);
            } catch (error) {
                console.error('譜面ファイル読み込みエラー:', error);
                alert(`譜面ファイルの読み込みに失敗しました: ${file.name}`);
            }
        }
        
        if (Object.keys(this.customCharts).length > 0) {
            alert(`${Object.keys(this.customCharts).length}個のカスタム譜面を読み込みました！`);
        }
    }
    
    async loadChart() {
        try {
            const difficulty = document.getElementById('difficulty').value;
            const songChoice = document.getElementById('song-choice').value;
            
            console.log(`譜面読み込み開始: ${songChoice} - ${difficulty}`);
            
            if (songChoice === 'custom') {
                // カスタム譜面を使用
                if (this.customCharts[difficulty]) {
                    this.chartData = this.customCharts[difficulty];
                    console.log(`カスタム譜面読み込み完了: ${this.chartData.difficulty.name} (${this.chartData.notes.length}ノーツ)`);
                } else {
                    throw new Error(`${difficulty}の難易度が見つかりません`);
                }
            } else {
                // デフォルトの譜面を使用
                const songId = songChoice === 'gozen4ji' ? 'gozen4ji' : songChoice;
                const chartUrl = `assets/charts/${songId}_${difficulty}.json`;
                console.log(`譜面ファイル読み込み: ${chartUrl}`);
                
                const response = await fetch(chartUrl);
                console.log(`Fetch response status: ${response.status}`);
                
                if (!response.ok) {
                    throw new Error(`譜面ファイルが見つかりません: ${chartUrl} (${response.status})`);
                }
                
                console.log('JSONパース開始');
                const text = await response.text();
                console.log(`Response text length: ${text.length}`);
                console.log(`Response first 100 chars: ${text.substring(0, 100)}`);
                
                this.chartData = JSON.parse(text);
                console.log('JSONパース完了');
                this.audio.src = this.chartData.audioFile;
                
                console.log(`譜面読み込み完了: ${this.chartData.title} - ${this.chartData.difficulty.name}`);
                console.log(`ノーツ数: ${this.chartData.notes.length}`);
                console.log(`音楽ファイル: ${this.chartData.audioFile}`);
            }
        } catch (error) {
            console.error('譜面読み込みエラー:', error);
            alert(`譜面の読み込みに失敗しました: ${error.message}`);
            throw error;
        }
    }
    
    async startGame() {
        try {
            console.log('ゲーム開始処理を開始');
            
            if (!this.chartData) {
                console.log('譜面データがないため読み込みます');
                await this.loadChart();
            }
            
            if (!this.chartData) {
                throw new Error('譜面データの読み込みに失敗しました');
            }
            
            console.log('譜面データ確認:', {
                title: this.chartData.title,
                difficulty: this.chartData.difficulty,
                notesCount: this.chartData.notes.length,
                firstNote: this.chartData.notes[0]
            });
            
            console.log('UIを更新');
            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;
            
            console.log('ゲーム状態をリセット');
            this.reset();
            this.isPlaying = true;
            
            console.log('1秒後に音楽とゲームを開始します');
            setTimeout(async () => {
                try {
                    console.log('音楽再生を開始');
                    
                    // 音楽の読み込み待機
                    if (this.audio.readyState < 2) {
                        console.log('音楽ファイルの読み込み待機中...');
                        await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => reject(new Error('音楽読み込みタイムアウト')), 10000);
                            this.audio.addEventListener('canplay', () => {
                                clearTimeout(timeout);
                                resolve();
                            }, { once: true });
                        });
                    }
                    
                    // 音楽再生
                    try {
                        await this.audio.play();
                        console.log('音楽再生成功');
                    } catch (playError) {
                        console.error('音楽自動再生エラー:', playError);
                        // 自動再生が失敗した場合はユーザークリックを待つ
                        alert('音楽を再生するためにもう一度STARTボタンをクリックしてください');
                        this.stopGame();
                        return;
                    }
                    
                    // MV再生を常に開始
                    console.log('MV再生を開始');
                    this.video.currentTime = 0;
                    this.video.play().catch(e => console.error('MV再生エラー:', e));
                    
                    this.startTime = performance.now() - (this.chartData.offset * 1000);
                    console.log(`ゲーム開始時刻設定: ${this.startTime}`);
                    
                    this.spawnNotes();
                    console.log(`ノーツ生成完了: ${this.notes.length}個`);
                    
                    this.gameLoop();
                    console.log('ゲームループ開始');
                } catch (error) {
                    console.error('ゲーム開始処理エラー:', error);
                    this.stopGame();
                    alert(`ゲーム開始に失敗しました: ${error.message}`);
                }
            }, 1000);
            
        } catch (error) {
            console.error('startGame エラー:', error);
            document.getElementById('start-btn').disabled = false;
            document.getElementById('stop-btn').disabled = true;
            alert(`ゲーム開始に失敗しました: ${error.message}`);
        }
    }
    
    stopGame() {
        this.isPlaying = false;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.video.pause();
        this.video.currentTime = 0;
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;
        
        this.clearNotes();
    }
    
    reset() {
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.notes = [];
        this.updateScore();
        this.updateCombo();
        this.clearNotes();
    }
    
    spawnNotes() {
        console.log(`spawnNotes開始: ${this.chartData.notes.length}個のノーツデータ`);
        
        // レーンの存在確認
        for (let i = 0; i < 6; i++) {
            const lane = document.querySelector(`.lane[data-lane="${i}"]`);
            console.log(`Lane ${i} exists:`, !!lane);
        }
        
        this.chartData.notes.forEach((noteData, index) => {
            if (index < 10) { // 最初の10個だけ詳細ログ
                console.log(`Note ${index}: time=${noteData.time}, lane=${noteData.lane}, type=${noteData.type}`);
            }
            
            const note = {
                time: noteData.time,
                lane: noteData.lane,
                type: noteData.type,
                duration: noteData.duration || 0,
                y: -50,
                hit: false,
                element: this.createNoteElement(noteData)
            };
            this.notes.push(note);
        });
        
        console.log(`spawnNotes完了: ${this.notes.length}個のノーツオブジェクト生成`);
        
        // DOM内のノーツ要素を確認
        const noteElements = document.querySelectorAll('.note');
        console.log(`DOM内のノーツ要素数: ${noteElements.length}`);
    }
    
    createNoteElement(noteData) {
        const note = document.createElement('div');
        note.className = 'note';
        console.log(`Creating note element for lane ${noteData.lane}`);
        
        if (noteData.lane === 7) {
            note.classList.add('scratch-note');
        }
        if (noteData.type === 'hold') {
            note.classList.add('hold');
            note.style.height = `${noteData.duration * 200}px`;
        }
        
        const lane = document.querySelector(`.lane[data-lane="${noteData.lane}"]`);
        console.log(`Lane element found for lane ${noteData.lane}:`, !!lane);
        
        if (lane) {
            // 初期位置を設定
            note.style.position = 'absolute';
            note.style.bottom = '-50px'; // 画面外から開始
            note.style.width = '100%';
            note.style.height = '30px';
            note.style.backgroundColor = '#fff';
            note.style.border = '2px solid #fff';
            note.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
            note.style.zIndex = '15'; // より高いz-indexに設定
            
            lane.appendChild(note);
            console.log(`Note element added to lane ${noteData.lane}, zIndex: ${note.style.zIndex}`);
        } else {
            console.error(`Lane not found for lane ${noteData.lane}`);
            console.log('Available lanes:', document.querySelectorAll('.lane').length);
        }
        
        return note;
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        const currentTime = (performance.now() - this.startTime) / 1000;
        const judgmentY = window.innerHeight - 100;
        
        // 最初の数秒間だけデバッグログを出力
        if (currentTime < 5 && currentTime > 0) {
            console.log(`GameLoop: currentTime=${currentTime.toFixed(2)}, activeNotes=${this.notes.filter(n => !n.hit).length}`);
        }
        
        this.notes.forEach((note, index) => {
            if (!note.hit) {
                const timeDiff = currentTime - note.time;
                note.y = judgmentY - (timeDiff * -200 * this.noteSpeed);
                const bottomPos = window.innerHeight - note.y - 100;
                note.element.style.bottom = `${bottomPos}px`;
                
                // 最初のノーツの詳細ログ
                if (index === 0 && currentTime < 25) {
                    console.log(`Note 0: time=${note.time}, currentTime=${currentTime.toFixed(2)}, timeDiff=${timeDiff.toFixed(2)}, y=${note.y.toFixed(2)}, bottom=${bottomPos.toFixed(2)}px`);
                    console.log(`Note element exists:`, !!note.element, `Element parent:`, note.element.parentElement);
                }
                
                // ノーツが画面に表示される範囲かチェック
                if (index === 0 && bottomPos > -50 && bottomPos < window.innerHeight + 50) {
                    console.log(`Note 0 should be visible! bottom=${bottomPos.toFixed(2)}px`);
                }
                
                if (timeDiff > this.judgmentTiming.poor) {
                    this.missNote(note);
                }
            }
        });
        
        this.notes = this.notes.filter(note => !note.hit || note.y > -100);
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    handleKeyDown(e) {
        if (!this.isPlaying) return;
        
        const key = e.key.toLowerCase();
        if (key in this.keyMap) {
            e.preventDefault();
            this.pressKey(this.keyMap[key]);
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key in this.keyMap) {
            e.preventDefault();
            this.releaseKey(this.keyMap[key]);
        }
    }
    
    pressKey(lane) {
        const keyElement = document.querySelector(`.key[data-key="${lane}"]`);
        keyElement.classList.add('active');
        
        if (!this.isPlaying) return;
        
        const currentTime = (performance.now() - this.startTime) / 1000;
        const hitNote = this.notes.find(note => 
            !note.hit && 
            note.lane === lane && 
            Math.abs(currentTime - note.time) <= this.judgmentTiming.poor
        );
        
        if (hitNote) {
            this.judgeNote(hitNote, currentTime);
        }
    }
    
    releaseKey(lane) {
        const keyElement = document.querySelector(`.key[data-key="${lane}"]`);
        keyElement.classList.remove('active');
    }
    
    judgeNote(note, currentTime) {
        const timeDiff = Math.abs(currentTime - note.time);
        let judgment = '';
        let points = 0;
        
        if (timeDiff <= this.judgmentTiming.perfect) {
            judgment = 'PERFECT';
            points = 1000;
        } else if (timeDiff <= this.judgmentTiming.great) {
            judgment = 'GREAT';
            points = 800;
        } else if (timeDiff <= this.judgmentTiming.good) {
            judgment = 'GOOD';
            points = 500;
        } else if (timeDiff <= this.judgmentTiming.bad) {
            judgment = 'BAD';
            points = 200;
        } else {
            judgment = 'POOR';
            points = 50;
        }
        
        this.score += points;
        this.updateScore();
        
        if (judgment !== 'POOR') {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
        } else {
            this.combo = 0;
        }
        this.updateCombo();
        
        this.showJudgment(judgment);
        this.removeNote(note);
    }
    
    missNote(note) {
        this.combo = 0;
        this.updateCombo();
        this.showJudgment('POOR');
        this.removeNote(note);
    }
    
    removeNote(note) {
        note.hit = true;
        note.element.remove();
    }
    
    showJudgment(judgment) {
        const display = document.getElementById('judge-display');
        display.textContent = judgment;
        display.className = `judge-${judgment.toLowerCase()}`;
        
        setTimeout(() => {
            display.textContent = '';
            display.className = '';
        }, 500);
    }
    
    updateScore() {
        document.getElementById('score-value').textContent = this.score;
    }
    
    updateCombo() {
        document.getElementById('combo-value').textContent = this.combo;
    }
    
    clearNotes() {
        document.querySelectorAll('.note').forEach(note => note.remove());
    }
}

const game = new BeatmaniaGame();