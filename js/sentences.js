/* ============================================
   句式练习模块
   ============================================ */

const Sentences = {
    init() {
        this.renderExercises();
    },

    renderExercises() {
        const container = document.getElementById('sentencesContainer');
        const progress = SupabaseAuth.getProgress();

        container.innerHTML = `
            <div style="text-align:center;margin-bottom:2rem;">
                <p style="color:var(--text-light);">根据中文提示和英文上下文，填写空缺的单词</p>
                <div style="margin-top:0.5rem;">
                    <span style="color:var(--accent);font-weight:600;">已完成：${progress.sentences.length}/${DATA.sentenceExercises.length}</span>
                </div>
            </div>
            ${DATA.sentenceExercises.map((ex, i) => {
                const isCompleted = progress.sentences.includes(i);
                let englishHtml = ex.english;
                ex.blanks.forEach(blank => {
                    englishHtml = englishHtml.replace(
                        `{${blank.index}}`,
                        `<span class="sentence-blank" id="sentence-blank-${i}">
                            <input type="text" placeholder="${ex.hint}" id="sentence-input-${i}" 
                                autocomplete="off" ${isCompleted ? 'disabled' : ''}>
                        </span>`
                    );
                });
                return `
                    <div class="sentence-card" id="sentence-card-${i}">
                        <span class="sentence-number">${i + 1}</span>
                        <div class="sentence-english">${englishHtml}</div>
                        <div class="sentence-chinese"><i class="fas fa-language" style="margin-right:6px;"></i>${ex.chinese}</div>
                        <div class="sentence-actions" id="sentence-actions-${i}">
                            ${isCompleted ? 
                                '<span style="color:var(--accent);font-weight:600;"><i class="fas fa-check-circle"></i> 已完成</span>' :
                                `<button class="btn-check" onclick="Sentences.checkAnswer(${i})"><i class="fas fa-check"></i> 检查</button>
                                 <button class="btn-retry" onclick="Sentences.retry(${i})"><i class="fas fa-redo"></i> 重做</button>`
                            }
                        </div>
                        <div id="sentence-feedback-${i}"></div>
                    </div>
                `;
            }).join('')}
            <div style="text-align:center;margin-top:2rem;">
                <button class="btn-primary" onclick="Sentences.checkAll()" style="padding:14px 40px;font-size:1.1rem;">
                    <i class="fas fa-check-double"></i> 批量检查所有答案
                </button>
            </div>
        `;
    },

    checkAnswer(index) {
        const ex = DATA.sentenceExercises[index];
        const input = document.getElementById(`sentence-input-${index}`);
        const blank = document.getElementById(`sentence-blank-${index}`);
        const card = document.getElementById(`sentence-card-${index}`);
        const feedback = document.getElementById(`sentence-feedback-${index}`);

        if (!input || !input.value.trim()) {
            App.toast('请先填写答案', 'info');
            return;
        }

        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = ex.blanks[0].answer.toLowerCase();
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
            blank.classList.add('correct');
            blank.classList.remove('wrong');
            card.classList.add('correct-border');
            card.classList.remove('wrong-border');
            input.disabled = true;
            input.style.color = 'var(--accent)';

            feedback.innerHTML = `<div class="sentence-feedback correct"><i class="fas fa-check-circle"></i> 正确！答案是 "${ex.blanks[0].answer}"</div>`;

            // 保存进度
            const progress = SupabaseAuth.getProgress();
            if (!progress.sentences.includes(index)) {
                progress.sentences.push(index);
                SupabaseAuth.saveProgress(progress);
                App.updateProgress();
            }

            // 检查是否全部完成
            if (progress.sentences.length === DATA.sentenceExercises.length) {
                setTimeout(() => {
                    App.showReward('你完成了所有句式练习，全部答对！');
                }, 600);
            }
        } else {
            blank.classList.add('wrong');
            blank.classList.remove('correct');
            card.classList.add('wrong-border');
            card.classList.remove('correct-border');

            feedback.innerHTML = `
                <div class="sentence-feedback wrong">
                    <i class="fas fa-times-circle"></i> 不正确，再想想看！提示：${ex.hint}
                </div>
            `;
        }
    },

    retry(index) {
        const input = document.getElementById(`sentence-input-${index}`);
        const blank = document.getElementById(`sentence-blank-${index}`);
        const card = document.getElementById(`sentence-card-${index}`);
        const feedback = document.getElementById(`sentence-feedback-${index}`);

        if (input) {
            input.value = '';
            input.focus();
            input.disabled = false;
        }
        if (blank) {
            blank.classList.remove('correct', 'wrong');
            input.style.color = '';
        }
        if (card) card.classList.remove('correct-border', 'wrong-border');
        if (feedback) feedback.innerHTML = '';
    },

    checkAll() {
        let allCorrect = true;
        let anyEmpty = false;

        DATA.sentenceExercises.forEach((ex, i) => {
            const input = document.getElementById(`sentence-input-${i}`);
            if (!input || !input.value.trim()) {
                anyEmpty = true;
                return;
            }
            this.checkAnswer(i);
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = ex.blanks[0].answer.toLowerCase();
            if (userAnswer !== correctAnswer) allCorrect = false;
        });

        if (anyEmpty) {
            App.toast('还有题目未填写', 'info');
        }
    }
};
