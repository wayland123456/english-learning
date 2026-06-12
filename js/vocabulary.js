/* ============================================
   词汇闪卡模块
   ============================================ */

const Vocabulary = {
    cards: [],
    currentIndex: 0,
    isFlipped: false,

    init() {
        this.cards = DATA.vocabularyCards || [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.render();
    },

    render() {
        const container = document.getElementById('flashcardContainer');
        if (!container) return;

        if (this.cards.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:3rem;">暂无词汇数据</p>';
            return;
        }

        const card = this.cards[this.currentIndex];
        const progress = SupabaseAuth.getProgress();
        const learned = progress.vocabulary || [];
        const isLearned = learned.includes(this.currentIndex);

        container.innerHTML = `
            <div class="flashcard-progress">
                <span>${this.currentIndex + 1} / ${this.cards.length}</span>
                <div class="flashcard-progress-bar">
                    <div class="flashcard-progress-fill" style="width: ${(learned.length / this.cards.length * 100).toFixed(1)}%"></div>
                </div>
                <span>已学 ${learned.length}</span>
            </div>
            <div class="flashcard ${this.isFlipped ? 'flipped' : ''}" onclick="Vocabulary.flip()">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="flashcard-word">${card.word}</div>
                        <div class="flashcard-hint">点击翻转查看答案</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-meaning">${card.meaning}</div>
                        ${card.pronunciation ? '<div class="flashcard-pronunciation">' + card.pronunciation + '</div>' : ''}
                        <div class="flashcard-example">${card.example} <button class="flashcard-speak-btn" onclick="event.stopPropagation();Vocabulary.speak()" title="点击听例句发音"><i class="fas fa-volume-up"></i></button></div>
                    </div>
                </div>
            </div>
            <div class="flashcard-actions">
                <button class="btn-flash" onclick="Vocabulary.prev()"><i class="fas fa-chevron-left"></i> 上一个</button>
                <button class="btn-flash btn-mark-learned ${isLearned ? 'learned' : ''}" onclick="Vocabulary.toggleLearned()">
                    <i class="fas ${isLearned ? 'fa-check-circle' : 'fa-circle'}"></i>
                    ${isLearned ? '已掌握' : '标记为已掌握'}
                </button>
                <button class="btn-flash" onclick="Vocabulary.next()">下一个 <i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="flashcard-summary">
                <p>共 ${this.cards.length} 词，已掌握 ${learned.length} 词</p>
            </div>
        `;
    },

    flip() {
        this.isFlipped = true;
        this.render();
    },

    next() {
        if (this.currentIndex < this.cards.length - 1) {
            this.currentIndex++;
            this.isFlipped = false;
            this.render();
        }
    },

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.isFlipped = false;
            this.render();
        }
    },

    speak() {
        if (!('speechSynthesis' in window)) return;
        const card = this.cards[this.currentIndex];
        const utter = new SpeechSynthesisUtterance(card.example);
        utter.lang = 'en-US';
        utter.rate = 0.8;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    },

    toggleLearned() {
        const progress = SupabaseAuth.getProgress();
        if (!progress.vocabulary) progress.vocabulary = [];
        const idx = progress.vocabulary.indexOf(this.currentIndex);
        if (idx === -1) {
            progress.vocabulary.push(this.currentIndex);
        } else {
            progress.vocabulary.splice(idx, 1);
        }
        SupabaseAuth.saveProgress(progress);
        this.render();
    }
};
