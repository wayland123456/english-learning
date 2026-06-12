/* ============================================
   作文 AI 智能评分模块 — 通义千问 Qwen-Plus
   升级：从正则规则评分 → AI 深度语义评分
   ============================================ */

const WritingAI = {
    // 通义千问文本模型 API（复用 OCR 的 Key 和域名）
    API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    API_MODEL: 'qwen-plus',

    _scoring: false,
    _ruleResult: null, // 保存规则评分结果用于对比

    getApiKey() {
        return Writing.getApiKey();
    },

    /** 构建 AI 评分提示词 */
    buildScoringPrompt(essayText, promptInfo) {
        return '你是一位资深高考英语阅卷老师。请按以下标准为这篇应用文评分。\n\n'
            + '【作文题目】\n'
            + promptInfo.title + '\n'
            + promptInfo.prompt.replace(/<[^>]+>/g, '').replace(/<br>/g, '\n') + '\n\n'
            + '【学生作文】\n'
            + essayText + '\n\n'
            + '【评分标准 — 满分15分】\n'
            + '1. 内容要点(5分)：是否覆盖所有要点、内容是否充实\n'
            + '2. 语言表达(5分)：语法准确性、词汇丰富度、句式多样性\n'
            + '3. 篇章结构(3分)：书信格式规范、段落组织、逻辑连贯\n'
            + '4. 创新亮点(2分)：表达新颖、用词精准、有个人特色\n\n'
            + '【要求】请严格返回以下JSON格式（不要加任何其他文字）：\n'
            + '{\n'
            + '  "totalScore": 整数,\n'
            + '  "dimensions": {\n'
            + '    "content": {"score": 数字,"max":5,"comment":"中文点评该维度得失"},\n'
            + '    "language": {"score": 数字,"max":5,"comment":"中文点评该维度得失"},\n'
            + '    "structure": {"score": 数字,"max":3,"comment":"中文点评该维度得失"},\n'
            + '    "innovation": {"score": 数字,"max":2,"comment":"中文点评该维度得失"}\n'
            + '  },\n'
            + '  "corrections": [\n'
            + '    {"original":"原文错误片段","corrected":"修改后","type":"grammar|word|structure","explanation":"中文解释"}\n'
            + '  ],\n'
            + '  "highlights": ["亮点表达1","亮点表达2"],\n'
            + '  "suggestions": ["改进建议1","改进建议2","改进建议3"],\n'
            + '  "overallComment": "中文总体评价（两到三句话）"\n'
            + '}\n\n'
            + '注意：score字段必须是数字(允许小数)，totalScore必须等于四个维度得分之和(四舍五入)。corrections最多5条，highlights最多3条，suggestions最多5条。';
    },

    /** 安全解析 AI 返回的 JSON（兼容 markdown 代码块包裹） */
    parseJSON(text) {
        var t = (text || '').trim();
        // 尝试直接解析
        try { return JSON.parse(t); } catch (e) { /* continue */ }
        // 尝试提取 ```json ... ``` 代码块
        var m = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (m) { try { return JSON.parse(m[1]); } catch (e2) { /* continue */ } }
        // 尝试提取最外层 {...}
        m = t.match(/\{[\s\S]*\}/);
        if (m) { try { return JSON.parse(m[0]); } catch (e3) { /* continue */ } }
        return null;
    },

    /** 验证评分结果的合法性 */
    validateResult(result) {
        if (!result || typeof result !== 'object') return false;
        if (typeof result.totalScore !== 'number') return false;
        if (!result.dimensions) return false;
        var dims = ['content', 'language', 'structure', 'innovation'];
        for (var i = 0; i < dims.length; i++) {
            var d = result.dimensions[dims[i]];
            if (!d || typeof d.score !== 'number' || !d.comment) return false;
        }
        return true;
    },

    /** 调用 AI 进行评分 */
    async scoreEssay(essayText, promptInfo) {
        var apiKey = this.getApiKey();
        if (!apiKey) {
            App.toast('请先配置通义千问 API Key', 'error');
            return null;
        }

        this._scoring = true;

        try {
            var requestBody = {
                model: this.API_MODEL,
                messages: [{
                    role: 'user',
                    content: this.buildScoringPrompt(essayText, promptInfo)
                }],
                temperature: 0.1,
                max_tokens: 2048
            };

            var response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                var errData;
                try { errData = await response.json(); } catch (e) { errData = {}; }
                var msg = errData.message || ('API 请求失败 (HTTP ' + response.status + ')');
                if (response.status === 401 || /InvalidApiKey|Unauthorized/i.test(msg)) {
                    msg = 'API Key 无效，请检查后重试';
                } else if (response.status === 429 || /Throttling|quota/i.test(msg)) {
                    msg = '调用太频繁或额度不足，请稍后再试';
                }
                throw new Error(msg);
            }

            var data = await response.json();
            var content = data.choices && data.choices[0] && data.choices[0].message
                ? data.choices[0].message.content
                : '';

            if (!content) throw new Error('AI 返回内容为空');

            var result = this.parseJSON(content);
            if (!result) {
                console.error('[WritingAI] 解析失败，原始返回:', content);
                throw new Error('AI 返回格式异常，请重试');
            }

            if (!this.validateResult(result)) {
                console.error('[WritingAI] 验证失败:', JSON.stringify(result));
                // 即使格式不完美也尝试用
                if (typeof result.totalScore === 'number') {
                    result._partial = true;
                } else {
                    throw new Error('AI 返回的评分数据不完整，请重试');
                }
            }

            return result;
        } finally {
            this._scoring = false;
        }
    },

    /** 渲染 AI 评分结果（比规则评分更丰富） */
    renderScore(aiResult) {
        var resultDiv = document.getElementById('writingScoreResult');
        var prompt = DATA.writingPrompt;

        if (!aiResult) {
            resultDiv.innerHTML = '<div class="writing-score-card"><p style="text-align:center;color:var(--danger);">AI 评分失败，请重试</p></div>';
            return;
        }

        // 总分颜色
        var totalColor;
        var totalLabel;
        if (aiResult.totalScore >= 13) { totalColor = '#10b981'; totalLabel = '优秀'; }
        else if (aiResult.totalScore >= 10) { totalColor = '#6366f1'; totalLabel = '良好'; }
        else if (aiResult.totalScore >= 7) { totalColor = '#f59e0b'; totalLabel = '一般'; }
        else { totalColor = '#ef4444'; totalLabel = '需努力'; }

        // 维度得分可视化
        var dims = aiResult.dimensions;
        var dimNames = { content: '内容要点', language: '语言表达', structure: '篇章结构', innovation: '创新亮点' };
        var dimMaxes = { content: 5, language: 5, structure: 3, innovation: 2 };
        var dimIcons = { content: 'fa-list-check', language: 'fa-pen-to-square', structure: 'fa-layer-group', innovation: 'fa-lightbulb' };

        var dimRows = '';
        var keys = ['content', 'language', 'structure', 'innovation'];
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var d = dims[k] || { score: 0, comment: '未评分' };
            var pct = Math.round((d.score / dimMaxes[k]) * 100);
            var barColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#6366f1' : '#f59e0b';
            dimRows += ''
                + '<div class="ai-dim-row">'
                + '  <div class="ai-dim-header">'
                + '    <span class="ai-dim-name"><i class="fas ' + dimIcons[k] + '"></i> ' + dimNames[k] + '</span>'
                + '    <span class="ai-dim-score" style="color:' + barColor + ';">' + d.score + ' / ' + dimMaxes[k] + '</span>'
                + '  </div>'
                + '  <div class="ai-dim-bar-bg"><div class="ai-dim-bar-fill" style="width:' + pct + '%;background:' + barColor + ';"></div></div>'
                + '  <div class="ai-dim-comment">' + (d.comment || '') + '</div>'
                + '</div>';
        }

        // 纠错列表
        var correctionsHtml = '';
        var corrs = aiResult.corrections || [];
        if (corrs.length > 0) {
            var typeNames = { grammar: '语法', word: '用词', structure: '结构' };
            correctionsHtml = '<div class="ai-section"><h4><i class="fas fa-spell-check"></i> 具体纠错</h4>';
            for (var j = 0; j < corrs.length; j++) {
                var c = corrs[j];
                correctionsHtml += ''
                    + '<div class="ai-correction">'
                    + '  <div class="ai-corr-type">' + (typeNames[c.type] || '其他') + '</div>'
                    + '  <div class="ai-corr-body">'
                    + '    <div class="ai-corr-original"><span class="ai-corr-label">原文</span> ' + WritingAI._escape(c.original) + '</div>'
                    + '    <div class="ai-corr-corrected"><span class="ai-corr-label">修改</span> ' + WritingAI._escape(c.corrected) + '</div>'
                    + '    <div class="ai-corr-explain">' + (c.explanation || '') + '</div>'
                    + '  </div>'
                    + '</div>';
            }
            correctionsHtml += '</div>';
        }

        // 亮点
        var highlightsHtml = '';
        var hls = aiResult.highlights || [];
        if (hls.length > 0) {
            highlightsHtml = '<div class="ai-section"><h4><i class="fas fa-star"></i> 亮点表达</h4><ul class="ai-highlights">';
            for (var m = 0; m < hls.length; m++) {
                highlightsHtml += '<li>' + WritingAI._escape(hls[m]) + '</li>';
            }
            highlightsHtml += '</ul></div>';
        }

        // 建议
        var suggestionsHtml = '';
        var sugs = aiResult.suggestions || [];
        if (sugs.length > 0) {
            suggestionsHtml = '<div class="ai-section"><h4><i class="fas fa-lightbulb"></i> 提升建议</h4><ol class="ai-suggestions">';
            for (var n = 0; n < sugs.length; n++) {
                suggestionsHtml += '<li>' + WritingAI._escape(sugs[n]) + '</li>';
            }
            suggestionsHtml += '</ol></div>';
        }

        // 总体评价
        var commentHtml = '';
        if (aiResult.overallComment) {
            commentHtml = ''
                + '<div class="ai-overall-comment">'
                + '  <i class="fas fa-comment-dots"></i>'
                + '  <p>' + WritingAI._escape(aiResult.overallComment) + '</p>'
                + '</div>';
        }

        // 对比规则评分（如果有）
        var comparisonHtml = '';
        if (this._ruleResult) {
            var ruleTotal = this._ruleResult.total;
            var aiTotal = aiResult.totalScore;
            var diff = aiTotal - ruleTotal;
            var diffText = diff > 0 ? 'AI 比规则评分高 ' + diff + ' 分' : diff < 0 ? 'AI 比规则评分低 ' + Math.abs(diff) + ' 分' : '两种评分一致';
            var diffColor = diff > 0 ? '#10b981' : diff < 0 ? '#f59e0b' : '#6366f1';
            comparisonHtml = ''
                + '<div class="ai-comparison" style="border-color:' + diffColor + ';">'
                + '  <div class="ai-comp-title"><i class="fas fa-balance-scale"></i> 对比参考</div>'
                + '  <div class="ai-comp-scores">'
                + '    <div><span>规则评分</span><strong>' + ruleTotal + '分</strong></div>'
                + '    <div><span>AI 评分</span><strong style="color:' + totalColor + ';">' + aiTotal + '分</strong></div>'
                + '    <div><span>差异</span><strong style="color:' + diffColor + ';">' + diffText + '</strong></div>'
                + '  </div>'
                + '</div>';
        }

        resultDiv.innerHTML = ''
            + '<div class="writing-score-card ai-score-card">'
            + '  <div class="ai-card-header">'
            + '    <h3><i class="fas fa-robot" style="color:#8b5cf6;"></i> AI 智能评分结果</h3>'
            + '    <span class="ai-badge">通义千问 Qwen-Plus</span>'
            + '  </div>'

            + '  <div class="score-total ai-score-total">'
            + '    <div class="score-total-value" style="color:' + totalColor + ';">' + aiResult.totalScore + '</div>'
            + '    <div class="score-total-label">/ ' + prompt.totalScore + ' 分 <span class="ai-level" style="color:' + totalColor + ';">' + totalLabel + '</span></div>'
            + '  </div>'

            + '  <div class="ai-dimensions">'
            + dimRows
            + '  </div>'

            + comparisonHtml
            + commentHtml
            + correctionsHtml
            + highlightsHtml
            + suggestionsHtml

            + '  <div style="text-align:center;margin-top:2rem;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
            + '    <button class="btn-retry-ai" onclick="WritingAI.retry()">'
            + '      <i class="fas fa-redo"></i> 重新评分'
            + '    </button>'
            + '    <button class="btn-primary" onclick="Writing.init()" style="padding:10px 28px;">'
            + '      <i class="fas fa-pen"></i> 重新写作'
            + '    </button>'
            + '  </div>'
            + '</div>';

        // 保存进度
        var progress = SupabaseAuth.getProgress();
        progress.writing = { score: aiResult.totalScore, mode: 'ai', time: new Date().toISOString() };
        SupabaseAuth.saveProgress(progress);
        App.updateProgress();

        resultDiv.scrollIntoView({ behavior: 'smooth' });
    },

    /** 显示 AI 评分加载状态 */
    showLoading() {
        var resultDiv = document.getElementById('writingScoreResult');
        resultDiv.innerHTML = ''
            + '<div class="ai-loading-card">'
            + '  <div class="ai-loading-spinner">'
            + '    <div class="ai-spinner-ring"></div>'
            + '    <i class="fas fa-robot ai-spinner-icon"></i>'
            + '  </div>'
            + '  <h3>AI 正在分析你的作文...</h3>'
            + '  <p class="ai-loading-steps">'
            + '    <span class="ai-step active">检查内容要点</span>'
            + '    <span class="ai-step">评估语言表达</span>'
            + '    <span class="ai-step">分析篇章结构</span>'
            + '    <span class="ai-step">发现创新亮点</span>'
            + '  </p>'
            + '  <p style="color:var(--text-light);font-size:0.85rem;">预计需要 5-10 秒</p>'
            + '</div>';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    },

    /** 显示加载步骤动画 */
    animateSteps() {
        var steps = document.querySelectorAll('.ai-step');
        if (steps.length === 0) return;
        var idx = 0;
        var timer = setInterval(function () {
            if (idx > 0 && steps[idx - 1]) steps[idx - 1].classList.remove('active');
            if (steps[idx]) steps[idx].classList.add('active');
            idx++;
            if (idx >= steps.length) {
                clearInterval(timer);
            }
        }, 1500);
        return timer;
    },

    /** 点击 AI 评分按钮 */
    async handleScore() {
        var essayText = document.getElementById('writingTextarea')
            ? document.getElementById('writingTextarea').value.trim()
            : '';

        if (!essayText) {
            App.toast('请先输入作文内容', 'info');
            return;
        }

        if (essayText.split(/\s+/).filter(function (w) { return w.length > 0; }).length < 20) {
            App.toast('作文太短，至少需要20个单词', 'info');
            return;
        }

        var apiKey = this.getApiKey();
        if (!apiKey) {
            App.toast('请先配置通义千问 API Key', 'error');
            return;
        }

        // 先执行规则评分，保存结果用于对比
        this._ruleResult = Writing.scoreEssay(essayText);

        // 显示 loading
        this.showLoading();
        var stepTimer = this.animateSteps();

        // 禁用按钮
        var aiBtn = document.getElementById('btnAiScore');
        if (aiBtn) {
            aiBtn.disabled = true;
            aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 评分中...';
        }

        try {
            var result = await this.scoreEssay(essayText, DATA.writingPrompt);

            // 还原按钮
            if (aiBtn) {
                aiBtn.disabled = false;
                aiBtn.innerHTML = '<i class="fas fa-robot"></i> AI 智能评分';
            }

            // 停止步骤动画
            clearInterval(stepTimer);

            if (result) {
                this.renderScore(result);
                App.toast('AI 评分完成！', 'success');
            }
        } catch (err) {
            // 还原按钮
            if (aiBtn) {
                aiBtn.disabled = false;
                aiBtn.innerHTML = '<i class="fas fa-robot"></i> AI 智能评分';
            }
            clearInterval(stepTimer);

            console.error('[WritingAI] 评分失败:', err);
            var msg = err.message || '评分失败';
            App.toast(msg, 'error');

            // 显示错误状态
            var resultDiv = document.getElementById('writingScoreResult');
            resultDiv.innerHTML = ''
                + '<div class="writing-score-card" style="text-align:center;">'
                + '  <div style="font-size:3rem;margin-bottom:1rem;">😞</div>'
                + '  <h3>AI 评分失败</h3>'
                + '  <p style="color:var(--text-light);margin:0.5rem 0;">' + WritingAI._escape(msg) + '</p>'
                + '  <div style="margin-top:1.5rem;">'
                + '    <button class="btn-primary" onclick="WritingAI.handleScore()">'
                + '      <i class="fas fa-redo"></i> 重试'
                + '    </button>'
                + '  </div>'
                + '</div>';
        }
    },

    /** 重新评分 */
    async retry() {
        await this.handleScore();
    },

    /** HTML 转义 */
    _escape(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
};
