/* ============================================
   自主学习资源模块（含地标景点 + 英文电影 + 对话 + 阅读）
   v=8 - 场景式学习流升级版
   ============================================ */

const Resources = {
    currentTab: null,
    currentTabType: 'country', // 'country' | 'movie'
    extraDataLoaded: false,

    init() {
        this.mergeExtraData();
        this.renderTabs();
        this.currentTab = DATA.resources[0].id;
        this.currentTabType = 'country';
        this.renderContent();
    },

    // 将 COUNTRY_EXTRA 的数据合并到 DATA.resources
    mergeExtraData() {
        if (typeof COUNTRY_EXTRA === 'undefined') return;
        DATA.resources.forEach(c => {
            const extra = COUNTRY_EXTRA[c.id];
            if (extra) {
                if (extra.dialogues) c.dialogues = extra.dialogues;
                if (extra.reading) c.reading = extra.reading;
            }
        });
        this.extraDataLoaded = true;
    },

    renderTabs() {
        const container = document.getElementById('countryTabs');
        let tabs = DATA.resources.map(c =>
            `<div class="country-tab ${c.id === this.currentTab ? 'active' : ''}" onclick="Resources.selectTab('${c.id}','country')">
                <span class="flag">${c.flag}</span>
                <span>${c.countryCN}</span>
            </div>`
        ).join('');
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

    // ============ 国家单元：场景式学习流 ============
    renderCountry(container, progress) {
        const country = DATA.resources.find(c => c.id === this.currentTab);
        if (!country) return;
        const countryDone = this.isCountryDone(country.id, progress);

        let html = `
            <div class="country-header">
                <h2>${country.flag} ${country.country} 自主学习</h2>
                ${countryDone ? '<span class="learned-badge country-done"><i class="fas fa-check-circle"></i> 本单元已完成</span>' : ''}
            </div>`;

        html += this.renderStep1_Video(country);
        html += this.renderStep2_Attractions(country, progress);
        html += this.renderStep3_Dialogues(country, progress);
        html += this.renderStep4_Reading(country, progress);
        html += this.renderStep5_Complete(country, progress, countryDone);

        container.innerHTML = html;
        this.bindDialogueEvents(country.id);
        this.bindReadingEvents(country.id);
    },

    // Step 1：国家介绍视频
    renderStep1_Video(country) {
        if (!country.video) return '';
        return `
        <div class="learning-step">
            <div class="step-header">
                <span class="step-num">1</span>
                <span>国家介绍视频</span>
            </div>
            <div style="padding:1.5rem;">
                <div class="video-container">
                    <iframe src="${country.video}" frameborder="0" allowfullscreen></iframe>
                </div>
                <p style="text-align:center;color:var(--text-light);font-size:0.85rem;margin-top:0.75rem;">
                    观看视频，初步了解${country.country}的文化与风景
                </p>
            </div>
        </div>`;
    },

    // Step 2：景点词汇
    renderStep2_Attractions(country, progress) {
        if (!country.attractions) return '';
        const learned = progress?.learnedCountryAttractions || [];
        let cards = country.attractions.map(a => {
            const done = learned.includes(a.id);
            return `
            <div class="attraction-card ${done ? 'learned' : ''}" onclick="Resources.toggleAttraction('${a.id}')">
                <div class="attraction-header">
                    <h4>${a.name} <span class="attraction-en">${a.nameEN}</span></h4>
                    ${done ? '<span class="learned-badge"><i class="fas fa-check"></i> 已学习</span>' : ''}
                </div>
                <p class="attraction-desc">${a.desc}</p>
                <div class="vocabulary-list">
                    <h5>📖 关键词汇</h5>
                    <div class="vocab-items">
                        ${a.vocabulary.map(v => `<span class="vocab-tag">${v.word} <small>${v.meaning}</small></span>`).join('')}
                    </div>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="learning-step">
            <div class="step-header">
                <span class="step-num">2</span>
                <span>景点与词汇</span>
            </div>
            <div style="padding:1.5rem;">
                <p style="color:var(--text-light);margin-bottom:1rem;font-size:0.9rem;">
                    点击景点卡片标记为"已学习"，识记相关词汇
                </p>
                ${cards}
            </div>
        </div>`;
    },

    toggleAttraction(id) {
        const progress = SupabaseAuth.getProgress();
        if (!progress.learnedCountryAttractions) progress.learnedCountryAttractions = [];
        const idx = progress.learnedCountryAttractions.indexOf(id);
        if (idx === -1) {
            progress.learnedCountryAttractions.push(id);
        } else {
            progress.learnedCountryAttractions.splice(idx, 1);
        }
        SupabaseAuth.updateProgress(progress);
        this.renderContent();
    },

    // Step 3：情景对话
    renderStep3_Dialogues(country, progress) {
        if (!country.dialogues || country.dialogues.length === 0) return '';
        const doneDialogues = progress?.doneDialogues || [];
        let cards = country.dialogues.map((dlg, di) => {
            const done = doneDialogues.includes(`${country.id}_${dlg.id}`);
            let linesHtml = dlg.lines.map((line, li) => {
                let textHtml = line.text;
                if (line.blanks && line.blanks.length > 0) {
                    line.blanks.forEach(blank => {
                        textHtml = textHtml.replace('{0}', `<input class="dialogue-blank" data-dlg="${di}" data-line="${li}" data-idx="${blank.index}" placeholder="___" />`);
                    });
                }
                return `<div class="dialogue-line">
                    <span class="speaker">${line.speaker}</span>
                    <span class="text">${textHtml}</span>
                </div>`;
            }).join('');

            return `
            <div class="dialogue-card ${done ? 'dialogue-done' : ''}" id="dialogue-card-${di}">
                <div class="dialogue-title">
                    💬 ${dlg.title}
                    ${done ? '<span class="learned-badge" style="font-size:0.75rem;"><i class="fas fa-check"></i> 已完成</span>' : ''}
                </div>
                <div class="dialogue-scene">📍 ${dlg.scene}</div>
                <div class="dialogue-lines">${linesHtml}</div>
                <div class="dialogue-actions">
                    <button class="btn-check-dialogue" onclick="Resources.checkDialogue(${di}, '${country.id}', '${dlg.id}')">检查答案</button>
                    <span class="dialogue-result-msg" id="dialogue-result-${di}"></span>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="learning-step">
            <div class="step-header">
                <span class="step-num">3</span>
                <span>情景对话练习</span>
            </div>
            <div style="padding:0.5rem 0;">
                <p style="color:var(--text-light);margin-bottom:1rem;font-size:0.9rem;padding:0 1.5rem;">
                    在空白处填入合适的单词，完成对话后点击"检查答案"
                </p>
                ${cards}
            </div>
        </div>`;
    },

    checkDialogue(dlgIdx, countryId, dlgId) {
        const country = DATA.resources.find(c => c.id === countryId);
        const dlg = country.dialogues[dlgIdx];
        let allCorrect = true;
        dlg.lines.forEach((line, li) => {
            if (!line.blanks || line.blanks.length === 0) return;
            line.blanks.forEach(blank => {
                const input = document.querySelector(`#dialogue-card-${dlgIdx} .dialogue-blank[data-line="${li}"][data-idx="${blank.index}"]`);
                if (!input) return;
                const val = input.value.trim().toLowerCase();
                const ans = blank.answer.toLowerCase();
                if (val === ans) {
                    input.className = 'dialogue-blank correct';
                } else {
                    input.className = 'dialogue-blank incorrect';
                    input.value = blank.answer;
                    allCorrect = false;
                }
            });
        });

        const resultEl = document.getElementById(`dialogue-result-${dlgIdx}`);
        if (allCorrect) {
            resultEl.textContent = '✅ 全部正确！';
            const progress = SupabaseAuth.getProgress();
            if (!progress.doneDialogues) progress.doneDialogues = [];
            const key = `${countryId}_${dlgId}`;
            if (!progress.doneDialogues.includes(key)) progress.doneDialogues.push(key);
            SupabaseAuth.updateProgress(progress);
            document.getElementById(`dialogue-card-${dlgIdx}`).classList.add('dialogue-done');
        } else {
            resultEl.textContent = '❌ 有错误，正确答案已显示';
        }
    },

    bindDialogueEvents(countryId) {
        // 对话交互通过 onclick 绑定，无需额外事件监听
    },

    // Step 4：主题阅读
    renderStep4_Reading(country, progress) {
        if (!country.reading) return '';
        const done = progress?.doneReading?.includes(country.id);
        const reading = country.reading;

        let questionsHtml = reading.questions.map((q, qi) => `
            <div class="reading-question" id="rq-${country.id}-${qi}">
                <div class="rq-question">${qi + 1}. ${q.question}</div>
                <div class="rq-options">
                    ${q.options.map((opt, oi) => `
                        <label class="rq-option" onclick="Resources.checkReadingQuestion('${country.id}',${qi},${oi})">
                            <input type="radio" name="rq-${country.id}-${qi}" value="${oi}" />
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="rq-feedback" id="rq-feedback-${country.id}-${qi}" style="display:none;"></div>
            </div>
        `).join('');

        let vocabHtml = reading.vocabulary.map(v =>
            `<span class="vocab-tag">${v.word} <small>${v.meaning}</small></span>`
        ).join('');

        return `
        <div class="learning-step">
            <div class="step-header">
                <span class="step-num">4</span>
                <span>主题阅读</span>
            </div>
            <div class="reading-card ${done ? 'reading-done' : ''}">
                <div class="reading-passage">
                    <h4>📖 ${reading.title}</h4>
                    <p>${reading.passage}</p>
                </div>
                <details class="reading-translation">
                    <summary>查看中文翻译</summary>
                    <p style="margin-top:0.5rem;">${reading.translation}</p>
                </details>
                <div class="reading-vocab">
                    <h5>🔑 重点词汇</h5>
                    <div class="vocab-items">${vocabHtml}</div>
                </div>
                <div class="reading-questions">
                    <h4>✏️ 阅读理解</h4>
                    ${questionsHtml}
                </div>
                ${done ? '<div class="reading-done-msg"><i class="fas fa-check-circle"></i> 阅读已完成</div>' : ''}
            </div>
        </div>`;
    },

    checkReadingQuestion(countryId, qIdx, selectedIdx) {
        const country = DATA.resources.find(c => c.id === countryId);
        const q = country.reading.questions[qIdx];
        const feedbackEl = document.getElementById(`rq-feedback-${countryId}-${qIdx}`);
        const questionEl = document.getElementById(`rq-${countryId}-${qIdx}`);

        // 禁用所有选项
        const radios = questionEl.querySelectorAll('input[type="radio"]');
        radios.forEach(r => r.disabled = true);

        // 显示正确/错误
        const options = questionEl.querySelectorAll('.rq-option');
        options.forEach((opt, oi) => {
            if (oi === q.answer) opt.classList.add('rq-correct');
            if (oi === selectedIdx && selectedIdx !== q.answer) opt.classList.add('rq-incorrect');
        });

        feedbackEl.style.display = 'block';
        if (selectedIdx === q.answer) {
            feedbackEl.textContent = '✅ 正确！' + q.explanation;
            feedbackEl.style.color = 'var(--success, #0f6e56)';
        } else {
            feedbackEl.textContent = '❌ 错误。正确答案：' + q.options[q.answer];
            feedbackEl.style.color = '#e74c3c';
        }

        // 检查是否所有题都做完了
        const progress = SupabaseAuth.getProgress();
        if (!progress.doneReading) progress.doneReading = [];
        if (!progress.doneReading.includes(countryId)) {
            const allDone = country.reading.questions.every((_, i) => {
                const el = document.getElementById(`rq-feedback-${countryId}-${i}`);
                return el && el.style.display !== 'none';
            });
            if (allDone) {
                progress.doneReading.push(countryId);
                SupabaseAuth.updateProgress(progress);
                this.renderContent();
            }
        }
    },

    bindReadingEvents(countryId) {
        // 阅读交互通过 onclick 绑定
    },

    // Step 5：完成单元
    renderStep5_Complete(country, progress, countryDone) {
        const learned = progress?.learnedCountryAttractions || [];
        const doneDlgs = progress?.doneDialogues || [];
        const doneRd = progress?.doneReading || [];
        const totalAttractions = country.attractions ? country.attractions.length : 0;
        const attractionsDone = country.attractions ? country.attractions.filter(a => learned.includes(a.id)).length : 0;
        const dialoguesDone = country.dialogues ? country.dialogues.filter(d => doneDlgs.includes(`${country.id}_${d.id}`)).length : 0;
        const totalDialogues = country.dialogues ? country.dialogues.length : 0;
        const readingDone = doneRd.includes(country.id);

        const canComplete = attractionsDone > 0 && dialoguesDone === totalDialogues && readingDone;

        return `
        <div class="learning-step">
            <div class="step-header">
                <span class="step-num">5</span>
                <span>完成单元</span>
            </div>
            <div class="complete-unit-card">
                <div class="complete-checklist">
                    <div class="${attractionsDone > 0 ? 'checked' : ''}">${attractionsDone > 0 ? '✅' : '⬜'} 学习景点词汇 (${attractionsDone}/${totalAttractions})</div>
                    <div class="${dialoguesDone === totalDialogues ? 'checked' : ''}">${dialoguesDone === totalDialogues ? '✅' : '⬜'} 完成对话练习 (${dialoguesDone}/${totalDialogues})</div>
                    <div class="${readingDone ? 'checked' : ''}">${readingDone ? '✅' : '⬜'} 完成主题阅读</div>
                </div>
                <button class="btn-complete-unit" onclick="Resources.completeUnit('${country.id}')" ${canComplete && !countryDone ? '' : 'disabled'}>
                    ${countryDone ? '✅ 单元已完成' : canComplete ? '🎉 完成本单元' : '请先完成以上学习内容'}
                </button>
                ${countryDone ? '<p style="margin-top:1rem;color:var(--text-light);">前往"学习成果"模块，生成你的旅行攻略或旅行日记吧！</p>' : ''}
            </div>
        </div>`;
    },

    completeUnit(countryId) {
        const progress = SupabaseAuth.getProgress();
        if (!progress.learnedResources) progress.learnedResources = [];
        const key = `country_${countryId}`;
        if (!progress.learnedResources.includes(key)) {
            progress.learnedResources.push(key);
            SupabaseAuth.updateProgress(progress);
            this.renderContent();
            alert('🎉 恭喜完成 ' + DATA.resources.find(c => c.id === countryId).country + ' 单元！\n\n前往"学习成果"模块，生成你的旅行攻略或旅行日记吧！');
        }
    },

    isCountryDone(countryId, progress) {
        return progress?.learnedResources?.includes(`country_${countryId}`);
    },

    // ============ 英文电影（保持不变）============
    renderMovies(container, progress) {
        let html = '<h2 style="margin-bottom:1.5rem;"><i class="fas fa-film"></i> 英文电影推荐</h2>';
        html += '<div class="movies-grid">';
        if (!DATA.movies) return;
        DATA.movies.forEach(m => {
            const learned = progress.learnedResources && progress.learnedResources.includes(m.id);
            html += `
            <div class="movie-card ${learned ? 'learned' : ''}" onclick="Resources.markLearned('${m.id}', this)">
                <div class="movie-poster">${m.poster ? `<img src="${m.poster}" alt="${m.title}" />` : '🎬'}</div>
                <div class="movie-info">
                    <h4>${m.title} <span class="movie-year">${m.year}</span></h4>
                    <p class="movie-desc">${m.desc}</p>
                    ${m.trailer ? `<a href="${m.trailer}" target="_blank" class="movie-trailer-btn" onclick="event.stopPropagation()"><i class="fas fa-play"></i> 观看预告片</a>` : ''}
                </div>
                ${learned ? '<div class="learned-badge"><i class="fas fa-check"></i> 已观看</div>' : ''}
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    markLearned(id, el) {
        const progress = SupabaseAuth.getProgress();
        if (!progress.learnedResources) progress.learnedResources = [];
        if (progress.learnedResources.includes(id)) return;
        progress.learnedResources.push(id);
        SupabaseAuth.updateProgress(progress);
        el.classList.add('learned');
        const badge = document.createElement('div');
        badge.className = 'learned-badge';
        badge.innerHTML = '<i class="fas fa-check"></i> 已观看';
        el.appendChild(badge);
    }
};
