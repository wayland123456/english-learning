/* ============================================
   语法练习模块（选择题）
   ============================================ */

const Grammar = {
    exercises: [],
    currentIndex: 0,
    score: 0,
    answered: [],

    init() {
        this.exercises = DATA.grammarExercises || [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = new Array(this.exercises.length).fill(null);
        this.render();
    },

    render() {
        const container = document.getElementById('grammarContainer');
        if (!container) return;

        if (this.exercises.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">暂无练习数据</p>';
            return;
        }

        if (this.currentIndex >= this.exercises.length) {
            this.showResult(container);
            return;
        }

        const ex = this.exercises[this.currentIndex];
        const progress = SupabaseAuth.getProgress();
        const grammarProgress = progress.grammar || {};
        const savedAnswer = grammarProgress[`q_${this.currentIndex}`];

        let optionsHtml = ex.options.map((opt, i) => {
            let cls = 'grammar-opt';
            const userAnswer = this.answered[this.currentIndex];
            if (userAnswer !== null) {
                if (i === ex.answer) cls += ' correct';
                else if (i === userAnswer) cls += ' wrong';
            }
            return `<div class="${cls}" onclick="Grammar.selectOption(${i})">
                        <span class="grammar-opt-letter">${String.fromCharCode(65+i)}</span>
                        <span>${this.escapeHtml(opt)}</span>
                    </div>`;
        }).join('');

        const isAnswered = this.answered[this.currentIndex] !== null;
        const correctCount = this.answered.filter((ans, i) => ans !== null && ans === this.exercises[i].answer).length;

        container.innerHTML = `
            <div class="grammar-progress">
                <span>第 ${this.currentIndex + 1} / ${this.exercises.length} 题</span>
                <div class="grammar-progress-bar">
                    <div class="grammar-progress-fill" style="width:${(this.currentIndex / this.exercises.length * 100).toFixed(1)}%"></div>
                </div>
                <span>已对 ${correctCount}</span>
            </div>
            <div class="grammar-card">
                <div class="grammar-question">${this.escapeHtml(ex.question)}</div>
                <div class="grammar-options">${optionsHtml}</div>
                ${isAnswered ? `<div class="grammar-explanation"><i class="fas fa-lightbulb"></i> ${this.escapeHtml(ex.explanation)}</div>` : ''}
                <div class="grammar-actions">
                    ${isAnswered
                        ? (this.currentIndex < this.exercises.length - 1
                            ? '<button class="btn-primary" onclick="Grammar.next()">下一题 <i class="fas fa-chevron-right"></i></button>'
                            : '<button class="btn-primary" onclick="Grammar.next()">查看结果 <i class="fas fa-trophy"></i></button>')
                        : '<button class="btn-primary" disabled style="opacity:0.5;cursor:not-allowed;">请选择一个答案</button>'
                    }
                </div>
            </div>
        `;
    },

    selectOption(index) {
        if (this.answered[this.currentIndex] !== null) return;

        const ex = this.exercises[this.currentIndex];
        const isCorrect = index === ex.answer;
        this.answered[this.currentIndex] = index;
        if (isCorrect) this.score++;

        // 音效 + toast 反馈
        if (isCorrect) {
            SoundFx.correct();
            this.showAnswerToast('✓ 回答正确！', 'correct');
        } else {
            SoundFx.wrong();
            this.showAnswerToast('✗ 答错了，正确答案已标出', 'wrong');
            // 让错误选项抖动
            setTimeout(() => {
                const wrongEl = document.querySelector('.grammar-opt.wrong');
                if (wrongEl) wrongEl.classList.add('answer-shake');
            }, 50);
        }

        const progress = SupabaseAuth.getProgress();
        if (!progress.grammar) progress.grammar = {};
        progress.grammar[`q_${this.currentIndex}`] = index;
        progress.grammar.score = this.score;
        progress.grammar.total = this.exercises.length;
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
        let levelText = pct >= 90 ? '太棒了！' : pct >= 70 ? '做得不错！' : pct >= 50 ? '继续加油！' : '需要多练习哦！';

        container.innerHTML = `
            <div class="grammar-result">
                <div class="grammar-result-circle ${level}">
                    <span class="grammar-result-score">${this.score}</span>
                    <span class="grammar-result-total">/ ${total}</span>
                </div>
                <h2>${levelText}</h2>
                <p>正确率 ${pct}%</p>
                <div class="grammar-result-actions">
                    <button class="btn-primary" onclick="Grammar.retry()"><i class="fas fa-redo"></i> 重新练习</button>
                    <button class="btn-flash" onclick="App.showPage('home')"><i class="fas fa-home"></i> 返回首页</button>
                </div>
            </div>
        `;
    },

    retry() {
        this.currentIndex = 0;
        this.score = 0;
        this.answered = new Array(this.exercises.length).fill(null);
        this.render();
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    showAnswerToast(msg, type) {
        const old = document.querySelector('.answer-toast');
        if (old) old.remove();
        const toast = document.createElement('div');
        toast.className = 'answer-toast ' + type;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1600);
    }
};
