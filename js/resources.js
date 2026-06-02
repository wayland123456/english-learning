/* ============================================
   自主学习资源模块（含地标景点 + 英文电影）
   ============================================ */

const Resources = {
    currentTab: null,
    currentTabType: 'country', // 'country' | 'movie'

    init() {
        this.renderTabs();
        this.currentTab = DATA.resources[0].id;
        this.currentTabType = 'country';
        this.renderContent();
    },

    renderTabs() {
        const container = document.getElementById('countryTabs');
        // 国家标签
        let tabs = DATA.resources.map(c =>
            `<div class="country-tab ${c.id === this.currentTab ? 'active' : ''}" onclick="Resources.selectTab('${c.id}','country')">
                <span class="flag">${c.flag}</span>
                <span>${c.countryCN}</span>
            </div>`
        ).join('');
        // 电影标签
        tabs += `
            <div class="country-tab movie-tab ${this.currentTabType === 'movie' && this.currentTab === 'movies' ? 'active' : ''}" onclick="Resources.selectTab('movies','movie')">
                <span class="flag">🎬</span>
                <span>英文电影</span>
            </div>`;
        container.innerHTML = tabs;
    },

    selectTab(id, type) {
        this.currentTab = id;
        this.currentTabType = type;
        this.renderTabs();
        this.renderContent();
    },

    renderContent() {
        const container = document.getElementById('resourceContent');
        const progress = SupabaseAuth.getProgress();

        if (this.currentTabType === 'movie') {
            this.renderMovies(container, progress);
        } else {
            this.renderCountry(container, progress);
        }
    },

    renderCountry(container, progress) {
        const country = DATA.resources.find(c => c.id === this.currentTab);
        if (!country) return;

        let html = `
            <h2 style="text-align:center;margin-bottom:2rem;">
                ${country.flag} ${country.country} 的标志性景点
            </h2>`;

        // 国家介绍趣味视频（"十分钟了解国家"系列）
        if (country.countryVideo && country.countryVideo.bvid) {
            html += `
            <div class="country-video-card">
                <h3><i class="fas fa-play-circle"></i> 十分钟了解${country.countryCN}</h3>
                <div class="resource-video">
                    <iframe
                        src="https://player.bilibili.com/player.html?bvid=${country.countryVideo.bvid}&high_quality=1&danmaku=0&autoplay=0"
                        allowfullscreen
                        allow="fullscreen"
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        title="十分钟了解${country.countryCN}">
                    </iframe>
                </div>
                <div class="country-video-tip">
                    <i class="fas fa-info-circle"></i> 趣味动画 · 全英文配音 · 中英双语字幕 — 来源：B站 OpenVista开放视界
                </div>
            </div>`;
        }

        // 景点知识卡片（纯文字 + 词汇）
        html += country.attractions.map((a, i) => {
            const globalId = `${country.id}_${i}`;
            const isLearned = progress.resources.includes(globalId);
            return `
            <div class="attraction-info-card" id="resource-${globalId}">
                <div class="resource-info">
                    <h3>
                        ${a.title}
                        ${isLearned ? '<span class="learned-badge"><i class="fas fa-check-circle"></i> 已学习</span>' : ''}
                    </h3>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${a.location}</p>
                    <p style="color:var(--text-light);margin-bottom:1rem;">${a.description}</p>
                    <div class="vocab-section">
                        <h4><i class="fas fa-language"></i> 关键词汇与表达</h4>
                        <div class="vocab-list">
                            ${a.vocabulary.map(v => `
                                <div class="vocab-item">
                                    <div class="vocab-word">${v.word}</div>
                                    <div class="vocab-meaning">${v.meaning}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="btn-learn ${isLearned ? 'learned' : ''}" onclick="Resources.markLearned('${globalId}')">
                        ${isLearned ? '<i class="fas fa-check"></i> 已掌握' : '<i class="fas fa-graduation-cap"></i> 标记为已学习'}
                    </button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = html;
    },

    renderMovies(container, progress) {
        const movies = DATA.movies;
        if (!movies) return;

        container.innerHTML = `
            <h2 style="text-align:center;margin-bottom:0.5rem;">
                🎬 经典英文电影
            </h2>
            <p style="text-align:center;color:var(--text-light);margin-bottom:2rem;">
                观看原声英文电影，在故事中感受语言的魅力
            </p>
            ${movies.map((m, i) => {
                const globalId = `movie_${m.id}`;
                const isLearned = progress.resources.includes(globalId);
                return `
                <div class="resource-card movie-card" id="resource-${globalId}">
                    <div class="movie-poster">
                        <div class="movie-poster-emoji">${m.poster}</div>
                        <div class="movie-poster-year">${m.year}</div>
                    </div>
                    <div class="resource-info movie-info">
                        <div class="movie-header">
                            <h3>${m.title} <span style="color:var(--text-light);font-weight:400;font-size:0.85em;">${m.titleCN}</span></h3>
                            ${isLearned ? '<span class="learned-badge"><i class="fas fa-check-circle"></i> 已学习</span>' : ''}
                        </div>
                        <div class="movie-famous-line">
                            <i class="fas fa-quote-left"></i>
                            <span>${m.famousLine}</span>
                            <br><small style="color:var(--text-light);">${m.famousLineCN}</small>
                        </div>
                        <p class="movie-desc">${m.description}</p>
                        <div class="movie-why-learn">
                            <h4><i class="fas fa-lightbulb"></i> 为什么要看这部电影学英语？</h4>
                            <p>${m.whyLearn}</p>
                        </div>
                        <div class="vocab-section">
                            <h4><i class="fas fa-language"></i> 关键词汇与表达</h4>
                            <div class="vocab-list">
                                ${m.vocabulary.map(v => `
                                    <div class="vocab-item">
                                        <div class="vocab-word">${v.word}</div>
                                        <div class="vocab-meaning">${v.meaning}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="movie-actions">
                            <a href="${m.bilibiliUrl}" target="_blank" class="btn-watch" rel="noopener">
                                <i class="fas fa-play-circle"></i> 在B站观看
                            </a>
                            <button class="btn-learn ${isLearned ? 'learned' : ''}" onclick="Resources.markLearned('${globalId}')">
                                ${isLearned ? '<i class="fas fa-check"></i> 已掌握' : '<i class="fas fa-graduation-cap"></i> 标记为已学习'}
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        `;
    },

    markLearned(id) {
        const progress = SupabaseAuth.getProgress();
        if (!progress.resources.includes(id)) {
            progress.resources.push(id);
            SupabaseAuth.saveProgress(progress);
            this.renderContent();
            App.updateProgress();
            App.toast('已标记为已学习！', 'success');
        }
    }
};
