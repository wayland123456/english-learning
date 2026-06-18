/* ============================================
   主应用模块
   ============================================ */

const App = {
    currentPage: 'auth',

    init() {
        // 创建粒子效果
        this.createParticles();
        // 初始化认证
        SupabaseAuth.init();
        // 滚动监听
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    },

    showPage(page) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

        // 显示目标页面
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.classList.remove('hidden');
        }

        // 更新导航高亮
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // 关闭移动端导航
        this.closeMobileNav();
        this.closeMobileMoreMenu();

        // 更新底部导航高亮
        this._updateBottomNav(page);

        // 页面切换时初始化模块
        this.currentPage = page;
        switch (page) {
            case 'resources': Resources.init(); break;
            case 'speaking': Speaking.init(); break;
            case 'sentences': Sentences.init(); break;
            case 'writing': Writing.init(); break;
            case 'vocabulary': Vocabulary.init(); break;
            case 'grammar': Grammar.init(); break;
            case 'listening': Listening.init(); break;
            case 'exam': ExamScores.init(); break;
            case 'messages': MessagesUI.load(); break;
            case 'guide': Portfolio.guide.init(); break;
            case 'diary': Portfolio.diary.init(); break;
        }

        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    toggleMobileNav() {
        const navLinks = document.getElementById('navLinks');
        navLinks.classList.toggle('show');
        // 防止背景滚动
        document.body.style.overflow = navLinks.classList.contains('show') ? 'hidden' : '';
    },

    closeMobileNav() {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) {
            navLinks.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    toggleMobileMoreMenu() {
        const overlay = document.getElementById('mobileMoreOverlay');
        const menu = document.getElementById('mobileMoreMenu');
        if (overlay && menu) {
            overlay.classList.remove('hidden');
            menu.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    closeMobileMoreMenu() {
        const overlay = document.getElementById('mobileMoreOverlay');
        const menu = document.getElementById('mobileMoreMenu');
        if (overlay && menu) {
            overlay.classList.add('hidden');
            menu.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    _updateBottomNav(page) {
        const items = document.querySelectorAll('.mbn-item');
        items.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
    },

    createParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 6) + 's';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            container.appendChild(particle);
        }
    },

    updateProgress() {
        const progress = SupabaseAuth.getProgress();
        if (!progress) return;

        // 资源进度
        const totalResources = DATA.resources.reduce((sum, c) => sum + c.attractions.length, 0);
        const learnedResources = progress.resources.length;
        const resPct = totalResources > 0 ? Math.round(learnedResources / totalResources * 100) : 0;
        const resBar = document.getElementById('progressResources');
        const resText = document.getElementById('progressResourcesText');
        if (resBar) resBar.style.width = resPct + '%';
        if (resText) resText.textContent = `${learnedResources}/${totalResources} 已学习`;

        // 口语进度
        const speakingDone = progress.speaking.filter(s => typeof s === 'number').length;
        const speakPct = Math.round(speakingDone / DATA.speakingSentences.length * 100);
        const speakBar = document.getElementById('progressSpeaking');
        const speakText = document.getElementById('progressSpeakingText');
        if (speakBar) speakBar.style.width = speakPct + '%';
        if (speakText) speakText.textContent = `${speakingDone}/${DATA.speakingSentences.length} 已完成`;

        // 句式进度
        const sentDone = progress.sentences.length;
        const sentPct = Math.round(sentDone / DATA.sentenceExercises.length * 100);
        const sentBar = document.getElementById('progressSentences');
        const sentText = document.getElementById('progressSentencesText');
        if (sentBar) sentBar.style.width = sentPct + '%';
        if (sentText) sentText.textContent = `${sentDone}/${DATA.sentenceExercises.length} 已完成`;

        // 作文进度
        const writeDone = progress.writing ? 1 : 0;
        const writeBar = document.getElementById('progressWriting');
        const writeText = document.getElementById('progressWritingText');
        if (writeBar) writeBar.style.width = (writeDone * 100) + '%';
        if (writeText) writeText.textContent = writeDone ? `已评分 (${progress.writing.score}分)` : '未完成';

        // 词汇闪卡进度
        const vocabTotal = DATA.vocabularyCards ? DATA.vocabularyCards.length : 0;
        const vocabDone = progress.vocabulary ? progress.vocabulary.length : 0;
        const vocabPct = vocabTotal > 0 ? Math.round(vocabDone / vocabTotal * 100) : 0;
        const vocabBar = document.getElementById('progressVocabulary');
        const vocabText = document.getElementById('progressVocabularyText');
        if (vocabBar) vocabBar.style.width = vocabPct + '%';
        if (vocabText) vocabText.textContent = `${vocabDone}/${vocabTotal} 已掌握`;

        // 语法练习进度
        const gramBar = document.getElementById('progressGrammar');
        const gramText = document.getElementById('progressGrammarText');
        if (gramBar && progress.grammar) {
            const gPct = progress.grammar.total > 0 ? Math.round(progress.grammar.score / progress.grammar.total * 100) : 0;
            gramBar.style.width = gPct + '%';
            gramText.textContent = `${progress.grammar.score}/${progress.grammar.total} 已练习`;
        }

        // 听力练习进度
        const listenBar = document.getElementById('progressListening');
        const listenText = document.getElementById('progressListeningText');
        if (listenBar && progress.listening) {
            const lPct = progress.listening.total > 0 ? Math.round(progress.listening.score / progress.listening.total * 100) : 0;
            listenBar.style.width = lPct + '%';
            listenText.textContent = `${progress.listening.score}/${progress.listening.total} 已练习`;
        }

        // 学习成果进度
        const portfolioBar = document.getElementById('progressPortfolio');
        const portfolioText = document.getElementById('progressPortfolioText');
        if (portfolioBar && portfolioText) {
            try {
                const guides = JSON.parse(localStorage.getItem('travelEdu_travel_guides_' + (SupabaseAuth.currentUsername || '')) || '[]');
                const diaries = JSON.parse(localStorage.getItem('travelEdu_travel_entries_' + (SupabaseAuth.currentUsername || '')) || '[]');
                const total = guides.length + diaries.length;
                const pct = total > 0 ? Math.min(100, total * 20) : 0;
                portfolioBar.style.width = pct + '%';
                portfolioText.textContent = total > 0 ? `${guides.length}攻略 ${diaries.length}日记` : '未开始';
            } catch(e) {
                portfolioText.textContent = '未开始';
            }
        }
    },

    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="${icons[type] || icons.info}" style="color:${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showReward(text) {
        const overlay = document.getElementById('rewardOverlay');
        const rewardText = document.getElementById('rewardText');
        if (rewardText) rewardText.textContent = text;
        if (overlay) overlay.classList.remove('hidden');

        // 触发星星动画
        document.querySelectorAll('.reward-stars i').forEach(star => {
            star.style.animation = 'none';
            star.offsetHeight; // 触发回流
            star.style.animation = '';
        });
    },

    closeReward() {
        document.getElementById('rewardOverlay').classList.add('hidden');
    }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 确保语音列表加载完毕
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {};
}

// ============================================
// 答题音效工具（Web Audio API，无需外部文件）
// ============================================
const SoundFx = {
    _ctx: null,
    _getCtx() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this._ctx;
    },
    _play(freq, duration, type) {
        try {
            const ctx = this._getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch(e) { /* 静默忽略 */ }
    },
    correct() { this._play(880, 0.15); setTimeout(() => this._play(1100, 0.2), 120); },
    wrong()  { this._play(200, 0.3, 'square'); },
    click()  { this._play(600, 0.08); }
};
