/* ============================================
   听力练习模块（听对话 → 选择题）
   ============================================ */

const Listening = {
    exercises: [],
    currentIndex: 0,
    score: 0,
    answered: [],
    audioPlaying: false,

    init() {
        this.exercises = DATA.listeningExercises || [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = new Array(this.exercises.length).fill(false);
        this.render();
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
        const isAnswered = this.answered[this.currentIndex];
        const correctCount = this.answered.filter(Boolean).length;

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
            <div class="listening-progress">
                <span>第 ${this.currentIndex + 1} / ${this.exercises.length} 题</span>
                <div class="listening-progress-bar">
                    <div class="listening-progress-fill" style="width:${(this.currentIndex / this.exercises.length * 100).toFixed(1)}%"></div>
                </div>
                <span>已对 ${correctCount}</span>
            </div>

            <div class="listening-card">
                <div class="listening-audio-section">
                    <button class="btn-play-audio ${this.audioPlaying ? 'playing' : ''}" onclick="Listening.playAudio()">
                        <i class="fas ${this.audioPlaying ? 'fa-pause' : 'fa-play'}"></i>
                        <span>${this.audioPlaying ? '播放中...' : '播放对话'}</span>
                    </button>
                    <div class="listening-script" id="listeningScript" style="display:none;">
                        <h4><i class="fas fa-file-alt"></i> 听力原文</h4>
                        <pre>${this.escapeHtml(ex.script)}</pre>
                    </div>
                    <button class="btn-show-script" onclick="Listening.toggleScript()">
                        <i class="fas fa-eye"></i> 查看原文
                    </button>
                </div>

                <div class="listening-question">
                    <h3><i class="fas fa-question-circle"></i> ${this.escapeHtml(ex.question)}</h3>
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
    },

    playAudio() {
        // 使用 Web Speech API 朗读听力原文
        if (this.audioPlaying) {
            speechSynthesis.cancel();
            this.audioPlaying = false;
            this.render();
            return;
        }

        const ex = this.exercises[this.currentIndex];
        this.audioPlaying = true;
        this.render();

        const utter = new SpeechSynthesisUtterance(ex.audio_text);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        utter.onend = () => {
            this.audioPlaying = false;
            this.render();
        };
        speechSynthesis.speak(utter);
    },

    toggleScript() {
        const scriptEl = document.getElementById('listeningScript');
        if (scriptEl) {
            scriptEl.style.display = scriptEl.style.display === 'none' ? 'block' : 'none';
        }
    },

    selectOption(index) {
        if (this.answered[this.currentIndex]) return;

        const ex = this.exercises[this.currentIndex];
        const isCorrect = index === ex.answer;
        this.answered[this.currentIndex] = isCorrect;
        ex.selected = index;
        if (isCorrect) this.score++;

        const progress = SupabaseAuth.getProgress();
        if (!progress.listening) progress.listening = {};
        progress.listening[`q_${this.currentIndex}`] = index;
        progress.listening.score = this.score;
        progress.listening.total = this.exercises.length;
        SupabaseAuth.saveProgress(progress);

        this.render();
    },

    next() {
        this.currentIndex++;
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
        this.currentIndex = 0;
        this.score = 0;
        this.answered = new Array(this.exercises.length).fill(false);
        this.render();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
