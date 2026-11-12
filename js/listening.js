/* ============================================
   听力练习模块（听对话 → 选择题）
   ============================================ */

const Listening = {
    exercises: [],
    currentIndex: 0,
    score: 0,
    answered: [],
    audioPlaying: false,
    audioPaused: false,
    rate: 1.0,

    _storageKey: 'el_listening_progress',
    _rateKey: 'el_speech_rate',

    _saveProgress() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify({
                currentIndex: this.currentIndex,
                score: this.score,
                answered: this.answered
            }));
        } catch(e) {}
    },

    _loadProgress() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return null;
    },

    _clearProgress() {
        try { localStorage.removeItem(this._storageKey); } catch(e) {}
    },

    init() {
        this.exercises = DATA.listeningExercises || [];
        try {
            const savedRate = parseFloat(localStorage.getItem(this._rateKey));
            if (!isNaN(savedRate) && savedRate >= 0.5 && savedRate <= 1.5) this.rate = savedRate;
        } catch(e) {}
        const saved = this._loadProgress();
        if (saved && saved.currentIndex > 0 && saved.answered && saved.answered.length === this.exercises.length) {
            this.currentIndex = saved.currentIndex;
            this.score = saved.score || 0;
            this.answered = saved.answered;
            if (this.currentIndex >= this.exercises.length) this.currentIndex = 0;
        } else {
            this.currentIndex = 0;
            this.score = 0;
            this.answered = new Array(this.exercises.length).fill(null);
            this._clearProgress();
        }
        this.render();
        // 断点续做提示
        if (this.currentIndex > 0) {
            setTimeout(() => {
                const el = document.querySelector('.listening-resume-notice');
                if (el) el.remove();
                const container = document.getElementById('listeningContainer');
                if (container) {
                    const notice = document.createElement('div');
                    notice.className = 'listening-resume-notice';
                    notice.innerHTML = `<i class="fas fa-history"></i> 已恢复到第 ${this.currentIndex + 1} 题 <a href="javascript:Listening.retry()" style="margin-left:12px;color:#6366f1;text-decoration:underline;">重新开始</a>`;
                    container.insertBefore(notice, container.firstChild);
                    setTimeout(() => { if (notice.parentNode) notice.remove(); }, 5000);
                }
            }, 100);
        }
    },

    render() {
        const container = document.getElementById('listeningContainer');
        if (!container) return;

        if (this.exercises.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">暂无听力数据</p>';
            return;
        }

        if (this.currentIndex >= this.exercises.length) {
            this.showResult(container);
            return;
        }

        const ex = this.exercises[this.currentIndex];
        const userAnswer = this.answered[this.currentIndex];
        const isAnswered = userAnswer !== null;
        const correctCount = this.answered.filter((ans, i) => ans !== null && ans === this.exercises[i].answer).length;

        let optionsHtml = ex.options.map((opt, i) => {
            let cls = 'listening-opt';
            if (isAnswered) {
                if (i === ex.answer) cls += ' correct';
                else if (i === ex.selected) cls += ' wrong';
            }
            return `<div class="${cls}" onclick="Listening.selectOption(${i})">
                        <span class="listening-opt-letter">${String.fromCharCode(65+i)}</span>
                        <span>${this.escapeHtml(opt)}</span>
                    </div>`;
        }).join('');

        container.innerHTML = `
            <div class="listening-ai-notice">
                <i class="fas fa-robot"></i> 对话内容由AI生成，仅供学习参考
            </div>
            <div class="listening-progress">
                <span>第 ${this.currentIndex + 1} / ${this.exercises.length} 题</span>
                <div class="listening-progress-bar">
                    <div class="listening-progress-fill" style="width:${(this.currentIndex / this.exercises.length * 100).toFixed(1)}%"></div>
                </div>
                <span>已对 ${correctCount}</span>
            </div>

            <div class="listening-card">
                <div class="listening-audio-section">
                    <div class="listening-audio-row">
                        <button class="btn-play-audio ${this.audioPlaying ? (this.audioPaused ? 'paused' : 'playing') : ''}" onclick="Listening.toggleAudio()">
                            <i class="fas ${this.audioPlaying && !this.audioPaused ? 'fa-pause' : 'fa-play'}"></i>
                            <span>${this.audioPlaying ? (this.audioPaused ? '继续播放' : '暂停') : '播放对话'}</span>
                        </button>
                        <label class="listening-speed" title="调整朗读速度">
                            <span>语速</span>
                            <select onchange="Listening.setRate(this.value)">
                                <option value="0.75"${Math.abs(this.rate - 0.75) < 0.01 ? ' selected' : ''}>0.75× 慢</option>
                                <option value="1"${Math.abs(this.rate - 1) < 0.01 ? ' selected' : ''}>1.0× 标准</option>
                                <option value="1.25"${Math.abs(this.rate - 1.25) < 0.01 ? ' selected' : ''}>1.25× 快</option>
                            </select>
                        </label>
                    </div>
                    <div class="listening-script" id="listeningScript" style="display:none;">
                        <h4><i class="fas fa-file-alt"></i> 听力原文</h4>
                        ${this.renderScript(ex)}
                    </div>
                    <button class="btn-show-script" onclick="Listening.toggleScript()">
                        <i class="fas fa-eye"></i> 查看原文
                    </button>
                </div>

                <div class="listening-question">
                    <h3><span class="listening-q-num">${this.currentIndex + 1}.</span> ${this.escapeHtml(ex.question)}</h3>
                </div>

                <div class="listening-options">${optionsHtml}</div>

                ${isAnswered ? `
                    <div class="listening-feedback ${ex.answer === ex.selected ? 'correct' : 'wrong'}">
                        <i class="fas ${ex.answer === ex.selected ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${ex.answer === ex.selected ? '回答正确！' : `正确答案：${this.escapeHtml(ex.options[ex.answer])}`}
                    </div>
                    <div class="listening-actions">
                        ${this.currentIndex < this.exercises.length - 1
                            ? '<button class="btn-primary" onclick="Listening.next()">下一题 <i class="fas fa-chevron-right"></i></button>'
                            : '<button class="btn-primary" onclick="Listening.next()">查看结果 <i class="fas fa-trophy"></i></button>'
                        }
                    </div>
                ` : '<div class="listening-actions"><button class="btn-primary" disabled style="opacity:0.5;cursor:not-allowed;">请选择一个答案</button></div>'}
            </div>
        `;

        // 提前把本题音频拉进缓存，点"播放对话"时不用等下载
        if (typeof DialoguePlayer !== 'undefined' && DialoguePlayer.preload) {
            DialoguePlayer.preload('audio/listening/q' + (this.currentIndex + 1) + '.mp3');
        }
    },

    // 停掉朗读并复位按钮（切题、重做时用）
    stopAudio() {
        if (typeof DialoguePlayer !== 'undefined' && DialoguePlayer.stop) DialoguePlayer.stop();
        else if (typeof TTS !== 'undefined' && TTS.stop) TTS.stop();
        else if (window.speechSynthesis) speechSynthesis.cancel();
        this.audioPlaying = false;
        this.audioPaused = false;
    },

    // 三态按钮：播放 → 暂停 → 继续
    toggleAudio() {
        if (this.audioPlaying && !this.audioPaused) {
            if (typeof DialoguePlayer !== 'undefined' && DialoguePlayer.pause()) {
                this.audioPaused = true;
                this.render();
            }
            return;
        }
        if (this.audioPlaying && this.audioPaused) {
            if (typeof DialoguePlayer !== 'undefined' && DialoguePlayer.resume()) {
                this.audioPaused = false;
                this.render();
            }
            return;
        }
        this.playAudio();
    },

    playAudio() {
        // 两人对话，逐句分角色朗读（男/女不同音色）
        const ex = this.exercises[this.currentIndex];
        this.audioPlaying = true;
        this.audioPaused = false;
        this.render();

        const onDone = () => {
            this.audioPlaying = false;
            this.audioPaused = false;
            this.render();
        };

        // audio_text 每行是一个人的话，行与行交替换音色
        const lines = String(ex.audio_text || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);

        // 优先播预合成音频（男女声已混好、停顿精确），没有则回落到语音合成
        if (typeof DialoguePlayer !== 'undefined') {
            DialoguePlayer.play({
                src: 'audio/listening/q' + (this.currentIndex + 1) + '.mp3',
                turns: lines,
                rate: this.rate,
                onEnd: onDone
            });
            return;
        }

        if (typeof TTS !== 'undefined' && typeof TTS.speakDialogue === 'function') {
            TTS.speakDialogue(lines, { rate: this.rate, onEnd: onDone });
            return;
        }

        // 兜底：都没有时用单音色
        const utter = new SpeechSynthesisUtterance(ex.audio_text);
        utter.lang = 'en-US';
        utter.rate = this.rate;
        utter.onend = onDone;
        speechSynthesis.speak(utter);
    },

    // 原文：英文台词（W/M 标出说话人）+ 可折叠的中文参考译文
    // 原来直接显示中文翻译，学生看原文看到的全是中文，没有对照价值
    renderScript(ex) {
        const enLines = String(ex.audio_text || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);

        // A 用女声、B 用男声，所以按 W（woman）/ M（man）标注，和听到的声音对得上
        const enHtml = enLines.map((line, i) => {
            const tag = i % 2 === 0 ? 'W' : 'M';
            return `<p><span class="script-speaker ${tag === 'W' ? 'w' : 'm'}">${tag}</span>${this.escapeHtml(line)}</p>`;
        }).join('');

        const zhLines = String(ex.script || '')
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean);

        const zhHtml = zhLines.length
            ? `<details class="script-translation">
                   <summary>中文参考译文</summary>
                   <div>${zhLines.map(l => `<p>${this.escapeHtml(l)}</p>`).join('')}</div>
               </details>`
            : '';

        return `<div class="script-dialogue">${enHtml}</div>${zhHtml}`;
    },

    toggleScript() {
        const scriptEl = document.getElementById('listeningScript');
        if (scriptEl) {
            scriptEl.style.display = scriptEl.style.display === 'none' ? 'block' : 'none';
        }
    },

    setRate(value) {
        const r = parseFloat(value);
        if (isNaN(r)) return;
        this.rate = r;
        try { localStorage.setItem(this._rateKey, String(r)) } catch(e) {}

        // 播 mp3 时直接变速，不用中断重播
        if (this.audioPlaying && !this.audioPaused &&
            typeof DialoguePlayer !== 'undefined' && DialoguePlayer.setRate(r)) {
            this.render();
            return;
        }

        const wasPlaying = this.audioPlaying;
        const wasPaused = this.audioPaused;
        if (wasPlaying) this.stopAudio();
        this.render();
        if (wasPlaying && !wasPaused) {
            setTimeout(() => this.playAudio(), 150);
        }
    },

    selectOption(index) {
        if (this.answered[this.currentIndex] !== null) return;

        const ex = this.exercises[this.currentIndex];
        const isCorrect = index === ex.answer;
        this.answered[this.currentIndex] = index;
        ex.selected = index;
        if (isCorrect) this.score++;

        // 音效 + toast 反馈
        if (isCorrect) {
            SoundFx.correct();
        } else {
            SoundFx.wrong();
        }

        const progress = SupabaseAuth.getProgress();
        if (!progress.listening) progress.listening = {};
        progress.listening[`q_${this.currentIndex}`] = index;
        progress.listening.score = this.score;
        progress.listening.total = this.exercises.length;
        SupabaseAuth.saveProgress(progress);

        this._saveProgress();
        this.render();
    },

    next() {
        this.stopAudio();          // 切题时停掉上一题的朗读
        this.currentIndex++;
        if (this.currentIndex >= this.exercises.length) this._clearProgress();
        else this._saveProgress();
        this.render();
    },

    showResult(container) {
        const total = this.exercises.length;
        const pct = Math.round(this.score / total * 100);
        let level = pct >= 90 ? 'excellent' : pct >= 70 ? 'good' : pct >= 50 ? 'fair' : 'poor';
        let levelText = pct >= 90 ? '太棒了！听力满分！' : pct >= 70 ? '做得不错！继续加油！' : pct >= 50 ? '加油哦！多听多练！' : '需要多练习听力哦！';

        container.innerHTML = `
            <div class="listening-result">
                <div class="listening-result-circle ${level}">
                    <span class="listening-result-score">${this.score}</span>
                    <span class="listening-result-total">/ ${total}</span>
                </div>
                <h2>${levelText}</h2>
                <p>正确率 ${pct}%</p>
                <div class="listening-result-actions">
                    <button class="btn-primary" onclick="Listening.retry()"><i class="fas fa-redo"></i> 重新练习</button>
                    <button class="btn-flash" onclick="App.showPage('home')"><i class="fas fa-home"></i> 返回首页</button>
                </div>
            </div>
        `;
    },

    retry() {
        this.stopAudio();
        this.currentIndex = 0;
        this.score = 0;
        this.answered = new Array(this.exercises.length).fill(null);
        this._clearProgress();
        this.render();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
