/* ============================================
   作文练习模块 — 通义千问 VL Max OCR + AI 智能评分
   阿里云百炼平台（qwen-vl-max / qwen-plus），国内直连
   API Key 存储：Supabase app_config 表 > localStorage 兜底
   教师配置一次，所有学生自动共享
   v9: 新增 AI 智能评分按钮 + WritingAI 模块联动
   ============================================ */

const Writing = {
    essayText: '',
    ocrResult: '',
    uploadedImage: null,
    uploadedBase64: null,
    _apiKey: '',
    _apiKeyLoaded: false,

    // 通义千问 VL Max 视觉 API 配置（兼容模式支持图片识别）
    API_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    API_MODEL: 'qwen-vl-max',
    DB_KEY: 'qwen_api_key',
    LS_KEY: 'qwen_api_key',

    async init() {
        this.essayText = '';
        this.ocrResult = '';
        this.uploadedImage = null;
        this.uploadedBase64 = null;
        await this._loadKeyFromCloud();
        this.renderPrompt();
    },

    async _loadKeyFromCloud() {
        this._apiKeyLoaded = true;
        console.log('[Writing] 开始加载 API Key...');
        try {
            if (typeof db !== 'undefined') {
                console.log('[Writing] db 可用，从 Supabase 读取...');
                var resp = await db.from('app_config').select('value').eq('key', this.DB_KEY).single();
                console.log('[Writing] Supabase 返回:', resp);
                if (resp.data && resp.data.value) {
                    this._apiKey = resp.data.value;
                    localStorage.setItem(this.LS_KEY, resp.data.value);
                    console.log('[Writing] 云 Key 已加载: ' + resp.data.value.substring(0, 12) + '...');
                    return;
                }
            } else {
                console.warn('[Writing] db 不可用，Supabase 未初始化');
            }
        } catch (e) {
            console.error('[Writing] 云加载失败：', e);
        }
        // 兼容旧 key 名 + localStorage
        this._apiKey = localStorage.getItem(this.LS_KEY)
            || localStorage.getItem('gemini_api_key')
            || '';
        console.log('[Writing] 本地 Key 兜底: ' + (this._apiKey ? this._apiKey.substring(0, 12) + '...' : '(空)'));
    },

    getApiKey() {
        return this._apiKey || '';
    },

    renderPrompt() {
        var container = document.getElementById('writingContainer');
        var prompt = DATA.writingPrompt;
        var hasKey = !!this._apiKey;
        var user = SupabaseAuth.currentUser;
        var isTeacher = user && user.role === 'teacher';

        var keySectionHtml = '';

        if (isTeacher) {
            keySectionHtml = ''
                + '<div class="writing-api-key" id="apiKeySection">'
                + '  <details' + (hasKey ? '' : ' open') + '>'
                + '    <summary style="cursor:pointer;color:var(--text-light);font-size:0.9rem;">'
                + '      <i class="fas fa-key"></i> '
                + (hasKey ? '云端 API Key 已配置 ✓（OCR识别 + AI评分 均可用）'
                          : '首次使用请配置通义千问 API Key（保存后学生自动可用）')
                + '    </summary>'
                + '    <div style="margin-top:0.8rem;display:flex;gap:0.5rem;">'
                + '      <input type="password" id="qwenKeyInput" placeholder="粘贴通义千问 API Key（sk- 开头）" '
                + '        value="' + this._apiKey + '"'
                + '        style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem;">'
                + '      <button onclick="Writing.saveApiKey()" style="padding:8px 16px;background:var(--primary);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem;">'
                + '        保存到云端'
                + '      </button>'
                + '    </div>'
                + '    <p style="margin-top:0.5rem;font-size:0.78rem;color:var(--text-light);">'
                + '      获取方式：打开 <a href="https://bailian.console.aliyun.com/" target="_blank" style="color:var(--primary);">bailian.console.aliyun.com</a>'
                + ' → 模型广场 → 搜索「qwen-plus」→ 获取Key，国内直连免翻墙'
                + '    </p>'
                + '  </details>'
                + '</div>';
        } else if (!hasKey) {
            keySectionHtml = ''
                + '<div class="writing-api-key" style="background:#fff8e1;border-color:#ffe082;">'
                + '  <p style="margin:0;font-size:0.9rem;color:#e65100;">'
                + '    <i class="fas fa-info-circle"></i> 手写识别与AI评分功能尚未配置，请联系老师开启。'
                + '  </p>'
                + '</div>';
        } else {
            keySectionHtml = ''
                + '<div class="writing-api-key">'
                + '  <p style="margin:0;font-size:0.85rem;color:#166534;">'
                + '    <i class="fas fa-check-circle"></i> AI 手写识别 + 智能评分已就绪'
                + '  </p>'
                + '</div>';
        }

        container.innerHTML = ''
            + '<div class="writing-prompt">'
            + '  <h3><i class="fas fa-clipboard-list"></i> ' + prompt.title + '</h3>'
            + '  <div class="writing-prompt-text">' + prompt.prompt + '</div>'
            + '  <div style="margin-top:1rem;display:flex;gap:1rem;flex-wrap:wrap;">'
            + '    <span style="padding:6px 14px;background:rgba(99,102,241,0.1);color:var(--primary);border-radius:20px;font-size:0.85rem;font-weight:600;">'
            + '      <i class="fas fa-star"></i> 满分 ' + prompt.totalScore + ' 分'
            + '    </span>'
            + '    <span style="padding:6px 14px;background:rgba(245,158,11,0.1);color:#f59e0b;border-radius:20px;font-size:0.85rem;font-weight:600;">'
            + '      <i class="fas fa-pen"></i> 词数 80 左右'
            + '    </span>'
            + '    ' + (hasKey ? '<span style="padding:6px 14px;background:rgba(139,92,246,0.1);color:#8b5cf6;border-radius:20px;font-size:0.85rem;font-weight:600;"><i class="fas fa-robot"></i> AI 智能评分</span>' : '')
            + '  </div>'
            + '</div>'
            + keySectionHtml

            + '<div class="writing-upload" id="uploadArea" onclick="document.getElementById(\'writingFileInput\').click()">'
            + '  <i class="fas fa-camera"></i>'
            + '  <h3>拍照上传手写作文</h3>'
            + '  <p>支持拍照或选择图片，通义千问 AI 精准识别英文手写体</p>'
            + '  <input type="file" id="writingFileInput" accept="image/*" onchange="Writing.handleUpload(event)" style="display:none;">'
            + '</div>'
            + '<div class="upload-preview hidden" id="uploadPreview"></div>'

            + '<div style="text-align:center;color:var(--text-light);margin:1.5rem 0;font-size:0.95rem;">'
            + '  —— 或者直接在下方输入作文 ——'
            + '</div>'

            + '<textarea class="writing-text-area" id="writingTextarea" '
            + '  placeholder="在此输入你的英语作文..."'
            + '  oninput="Writing.onTextInput()"></textarea>'

            + '<div class="writing-actions">'
            + '  <button class="btn-submit-writing" onclick="Writing.submitEssay()" id="btnSubmitWriting">'
            + '    <i class="fas fa-paper-plane"></i> 规则评分'
            + '  </button>'
            + '  <button class="btn-ai-score' + (hasKey ? '' : ' hidden') + '" id="btnAiScore" onclick="WritingAI.handleScore()">'
            + '    <i class="fas fa-robot"></i> AI 智能评分'
            + '  </button>'
            + '  <button class="btn-ocr hidden" id="btnOcr" onclick="Writing.runOCR()">'
            + '    <i class="fas fa-magic"></i> 识别图片文字'
            + '  </button>'
            + '</div>'
            + (hasKey ? '' : '<div class="ai-key-hint" id="aiKeyHint">'
            + '  <i class="fas fa-info-circle"></i> AI 智能评分需要配置 API Key（与手写识别共用同一Key），请老师配置后即可开启。评分更准确、反馈更详细。'
            + '</div>')

            + '<div id="writingScoreResult"></div>';
    },

    async saveApiKey() {
        var input = document.getElementById('qwenKeyInput');
        var key = (input && input.value) ? input.value.trim() : '';
        if (!key) return;

        var user = SupabaseAuth.currentUser;
        if (!user || user.role !== 'teacher') {
            App.toast('仅教师可配置 API Key', 'error');
            return;
        }

        var saved = false;

        try {
            if (typeof db !== 'undefined') {
                var resp = await db.from('app_config').upsert({
                    key: this.DB_KEY,
                    value: key,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

                if (!resp.error) {
                    saved = true;
                } else {
                    console.warn('[Writing] Supabase 保存失败：', resp.error.message);
                }
            }
        } catch (e) {
            console.warn('[Writing] Supabase 保存异常：', e);
        }

        localStorage.setItem(this.LS_KEY, key);

        if (saved) {
            App.toast('API Key 已保存到云端，OCR识别 + AI评分均可使用', 'success');
        } else {
            App.toast('API Key 已保存到本地（云端同步失败，仅当前设备可用）', 'info');
        }

        this._apiKey = key;
        this.renderPrompt();
    },

    handleUpload(event) {
        var file = event.target.files[0];
        if (!file) return;

        this.uploadedImage = file;
        var self = this;

        // 先显示加载状态
        var preview = document.getElementById('uploadPreview');
        preview.classList.remove('hidden');
        preview.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light);"><i class="fas fa-spinner fa-spin"></i> 图片处理中...</p>';

        // 用 canvas 压缩图片，避免原图 base64 过大导致 API 解析异常
        this._compressImage(file, 2048, 0.85, function(compressedDataUrl) {
            self.uploadedBase64 = compressedDataUrl;
            console.log('[Writing] 图片压缩后 base64 长度:', compressedDataUrl.length);

            preview.innerHTML = ''
                + '<img src="' + compressedDataUrl + '" alt="作文图片" style="max-width:100%;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.1);">'
                + '<p style="margin-top:0.5rem;color:var(--text-light);font-size:0.85rem;">'
                + '  图片已上传，点击下方按钮启动 AI 识别'
                + '</p>';
            document.getElementById('btnOcr').classList.remove('hidden');

            var uploadArea = document.getElementById('uploadArea');
            uploadArea.innerHTML = ''
                + '<i class="fas fa-check-circle" style="color:var(--accent);"></i>'
                + '<h3>图片已上传</h3>'
                + '<p>点击可重新选择图片</p>'
                + '<input type="file" id="writingFileInput" accept="image/*" onchange="Writing.handleUpload(event)" style="display:none;">';
        });
    },

    // 压缩图片：maxLongSide 为最长边像素上限，quality 为 JPEG 质量 (0-1)
    _compressImage(file, maxLongSide, quality, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var w = img.width;
                var h = img.height;
                // 计算缩放比例
                if (w > h && w > maxLongSide) {
                    h = Math.round(h * maxLongSide / w);
                    w = maxLongSide;
                } else if (h > maxLongSide) {
                    w = Math.round(w * maxLongSide / h);
                    h = maxLongSide;
                }
                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                callback(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    async runOCR() {
        console.log('[Writing] runOCR 被调用');
        if (!this.uploadedBase64) {
            console.warn('[Writing] 无上传图片，中止');
            App.toast('请先上传图片', 'info');
            return;
        }

        var apiKey = this.getApiKey();
        console.log('[Writing] API Key 长度: ' + apiKey.length + ', 模型: ' + this.API_MODEL);
        if (!apiKey) {
            console.error('[Writing] API Key 为空');
            App.toast('请先配置通义千问 API Key', 'error');
            var section = document.getElementById('apiKeySection');
            if (section) {
                var details = section.querySelector('details');
                if (details) details.open = true;
                var inp = document.getElementById('qwenKeyInput');
                if (inp) inp.focus();
            }
            return;
        }

        var btn = document.getElementById('btnOcr');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI 识别中...';
        btn.disabled = true;
        App.toast('通义千问 AI 正在识别手写文字...', 'info');

        try {
            // 直接把 data URL 传给 API（兼容模式支持 data URL）
            var imageUrl = this.uploadedBase64;

            var requestBody = {
                model: this.API_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: imageUrl } },
                        { type: 'text', text: 'Please transcribe the handwritten English text in this image exactly as written. Output ONLY the transcribed text, nothing else. Do not add any explanations, notes, or formatting. If the image is not handwritten English text, say "NOT_HANDWRITING".' }
                    ]
                }],
                temperature: 0,
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

            console.log('[Writing] API 响应状态:', response.status, response.statusText);
            console.log('[Writing] 发送图片大小(base64):', imageUrl.length, 'chars');
            var data = await response.json();
            console.log('[Writing] API 返回:', JSON.stringify(data).substring(0, 500));

            if (!response.ok) {
                var errMsg = 'API 请求失败 (HTTP ' + response.status + ')';
                if (data && data.message) errMsg = data.message;
                throw new Error(errMsg);
            }

            var text = '';
            if (data.choices && data.choices[0] && data.choices[0].message) {
                text = data.choices[0].message.content || '';
            }

            text = text.trim();

            if (text === 'NOT_HANDWRITING' || text === '') {
                App.toast('未检测到手写英文文字，请检查图片', 'error');
                btn.innerHTML = '<i class="fas fa-magic"></i> 重新识别';
                btn.disabled = false;
                return;
            }

            this.ocrResult = text;
            var textarea = document.getElementById('writingTextarea');
            if (textarea) {
                textarea.value = this.ocrResult;
                this.essayText = this.ocrResult;
            }

            App.toast('AI 识别完成！请检查并修正', 'success');
            btn.innerHTML = '<i class="fas fa-magic"></i> 重新识别';
            btn.disabled = false;

            if (textarea) textarea.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            console.error('Qwen OCR Error:', err);
            var msg = err.message || '识别失败';
            if (msg.indexOf('401') !== -1 || msg.indexOf('Unauthorized') !== -1 || msg.indexOf('InvalidApiKey') !== -1) {
                msg = 'API Key 无效，请检查后重试';
            } else if (msg.indexOf('429') !== -1 || msg.indexOf('Throttling') !== -1 || msg.indexOf('quota') !== -1) {
                msg = '调用太频繁或额度不足，请稍后再试';
            } else if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
                msg = '网络连接失败，请检查网络后重试';
            } else if (msg.indexOf('400') !== -1 || msg.indexOf('DownloadError') !== -1) {
                msg = '图片格式不支持或文件过大，请重新拍照上传';
            }
            App.toast(msg, 'error');
            btn.innerHTML = '<i class="fas fa-magic"></i> 重新识别';
            btn.disabled = false;
        }
    },

    onTextInput() {
        var textarea = document.getElementById('writingTextarea');
        if (textarea) {
            this.essayText = textarea.value;
        }
    },

    submitEssay() {
        this.essayText = document.getElementById('writingTextarea')?.value || '';

        if (!this.essayText.trim()) {
            App.toast('请先输入或上传作文', 'info');
            return;
        }

        var score = this.scoreEssay(this.essayText);
        this.renderScore(score);
    },

    scoreEssay(text) {
        var words = text.trim().split(/\s+/).filter(function(w) { return w.length > 0; });
        var wordCount = words.length;
        var sentenceCount = text.split(/[.!?]+/).filter(function(s) { return s.trim().length > 0; }).length;
        var paragraphCount = text.split(/\n\n+/).filter(function(p) { return p.trim().length > 0; }).length;

        var hasGreeting = /\b(dear|hi|hello)\b/i.test(text);
        var hasClosing = /\b(yours|sincerely|regards|best wishes|love)\b/i.test(text);
        var hasRecommendation = /\b(recommend|suggest|advise|think you should|worth visiting)\b/i.test(text);
        var hasReason = /\b(because|since|as|for|the reason|due to|famous for|known for)\b/i.test(text);
        var hasAdvice = /\b(should|had better|don't forget|remember|make sure|it's a good idea)\b/i.test(text);
        var hasTravelVocab = /\b(travel|visit|tour|scenery|attraction|landmark|destination|journey|explore|experience)\b/i.test(text);

        var complexMatch = text.match(/\b(which|that|who|where|when)\b/gi) || [];
        var notOnlyMatch = text.match(/\b(not only.*but also)\b/gi) || [];
        var ifMatch = text.match(/\b(if|unless|although|while|whereas)\b/gi) || [];
        var itMatch = text.match(/\b(it is.*that)\b/gi) || [];
        var complexStructures = complexMatch.length + notOnlyMatch.length + ifMatch.length + itMatch.length;

        var uniqueWords = {};
        for (var i = 0; i < words.length; i++) {
            uniqueWords[words[i].toLowerCase().replace(/[^a-z]/g, '')] = true;
        }
        var uniqueCount = Object.keys(uniqueWords).length;
        var vocabDiversity = words.length > 0 ? uniqueCount / words.length : 0;

        var grammarIssues = [];
        if (wordCount > 0 && !text.match(/[.!?]$/)) {
            grammarIssues.push('作文末尾缺少标点');
        }
        if (wordCount > 50 && sentenceCount < 3) {
            grammarIssues.push('句子数量过少，注意使用句号分隔');
        }

        var contentScore = 0;
        var languageScore = 0;
        var coherenceScore = 0;
        var innovationScore = 0;

        if (hasRecommendation) contentScore += 1.5;
        if (hasReason) contentScore += 1.5;
        if (hasAdvice) contentScore += 1;
        if (hasGreeting) contentScore += 0.5;
        if (hasClosing) contentScore += 0.5;
        if (wordCount < 50) contentScore *= 0.6;
        else if (wordCount < 70) contentScore *= 0.8;

        if (vocabDiversity > 0.7) languageScore += 1;
        else if (vocabDiversity > 0.5) languageScore += 0.7;
        else languageScore += 0.4;
        if (hasTravelVocab) languageScore += 1;
        if (complexStructures >= 2) languageScore += 1.5;
        else if (complexStructures >= 1) languageScore += 0.8;
        if (sentenceCount >= 6) languageScore += 1;
        else if (sentenceCount >= 4) languageScore += 0.7;
        if (wordCount >= 70 && wordCount <= 120) languageScore += 0.5;
        else if (wordCount >= 60) languageScore += 0.3;

        if (paragraphCount >= 2) coherenceScore += 1;
        else coherenceScore += 0.3;
        if (hasGreeting && hasClosing) coherenceScore += 1;
        else if (hasGreeting || hasClosing) coherenceScore += 0.5;
        var connectors = (text.match(/\b(however|moreover|furthermore|in addition|besides|what's more|firstly|secondly|finally|in conclusion|to sum up)\b/gi) || []).length;
        coherenceScore += Math.min(1, connectors * 0.4);

        if (vocabDiversity > 0.65 && hasTravelVocab) innovationScore += 0.7;
        if (complexStructures >= 2) innovationScore += 0.7;
        if (wordCount >= 75 && wordCount <= 110) innovationScore += 0.3;
        if (connectors >= 2) innovationScore += 0.3;

        contentScore = Math.min(5, Math.round(contentScore * 10) / 10);
        languageScore = Math.min(5, Math.round(languageScore * 10) / 10);
        coherenceScore = Math.min(3, Math.round(coherenceScore * 10) / 10);
        innovationScore = Math.min(2, Math.round(innovationScore * 10) / 10);

        var totalScore = Math.round(contentScore + languageScore + coherenceScore + innovationScore);

        var feedback = [];
        if (!hasRecommendation) feedback.push('建议明确推荐一个城市，使用 "I recommend..." 或 "I suggest you visit..." 等表达');
        if (!hasReason) feedback.push('需要补充推荐理由，至少说明两个原因');
        if (!hasAdvice) feedback.push('建议增加旅行建议，如 "You should...", "Don\'t forget to..." 等');
        if (!hasGreeting) feedback.push('书信格式需要开头问候语，如 "Dear Tom,"');
        if (!hasClosing) feedback.push('书信格式需要结尾语，如 "Yours," 或 "Best wishes,"');
        if (wordCount < 60) feedback.push('字数偏少，建议达到80词左右');
        if (wordCount > 130) feedback.push('字数偏多，高考应用文建议控制在80词左右');
        if (complexStructures < 1) feedback.push('建议使用一些复杂句式，如定语从句、状语从句等，提升语言档次');
        if (connectors < 1) feedback.push('建议使用连接词（however, moreover, besides等）增强逻辑性');
        if (!hasTravelVocab) feedback.push('建议使用更多旅游相关词汇，如 destination, explore, scenery 等');
        if (feedback.length === 0) {
            feedback.push('作文完成度很好，继续保持！');
        }

        return {
            content: contentScore,
            language: languageScore,
            coherence: coherenceScore,
            innovation: innovationScore,
            total: totalScore,
            wordCount: wordCount,
            sentenceCount: sentenceCount,
            feedback: feedback,
            grammarIssues: grammarIssues
        };
    },

    renderScore(score) {
        var resultDiv = document.getElementById('writingScoreResult');
        var prompt = DATA.writingPrompt;

        var totalColor = 'var(--accent)';
        if (score.total >= 12) totalColor = 'var(--accent)';
        else if (score.total >= 9) totalColor = 'var(--primary)';
        else if (score.total >= 6) totalColor = '#f59e0b';
        else totalColor = 'var(--danger)';

        resultDiv.innerHTML = [
            '<div class="writing-score-card">',
            '  <h3><i class="fas fa-chart-bar" style="color:var(--primary);"></i> 规则评分结果</h3>',
            '  <div class="score-total">',
            '    <div class="score-total-value" style="color:' + totalColor + ';">' + score.total + '</div>',
            '    <div class="score-total-label">/ ' + prompt.totalScore + ' 分</div>',
            '  </div>',
            '  <div class="score-breakdown">',
            '    <div class="score-item"><div class="score-item-label">内容要点</div><div class="score-item-value" style="color:var(--primary);">' + score.content + '/5</div></div>',
            '    <div class="score-item"><div class="score-item-label">语言表达</div><div class="score-item-value" style="color:var(--primary);">' + score.language + '/5</div></div>',
            '    <div class="score-item"><div class="score-item-label">篇章结构</div><div class="score-item-value" style="color:var(--primary);">' + score.coherence + '/3</div></div>',
            '    <div class="score-item"><div class="score-item-label">创新亮点</div><div class="score-item-value" style="color:var(--primary);">' + score.innovation + '/2</div></div>',
            '  </div>',
            '  <div style="display:flex;gap:2rem;margin-bottom:1.5rem;justify-content:center;flex-wrap:wrap;">',
            '    <span style="color:var(--text-light);"><i class="fas fa-font"></i> 词数：' + score.wordCount + '</span>',
            '    <span style="color:var(--text-light);"><i class="fas fa-align-left"></i> 句数：' + score.sentenceCount + '</span>',
            '  </div>',
            '  <div class="writing-feedback">',
            '    <h4><i class="fas fa-lightbulb"></i> 修改建议</h4>',
            '    <ul>' + score.feedback.map(function(f) { return '<li>' + f + '</li>'; }).join('') + '</ul>',
            (score.grammarIssues.length > 0
                ? '<h4 style="margin-top:1rem;"><i class="fas fa-exclamation-triangle"></i> 语法提醒</h4><ul>'
                  + score.grammarIssues.map(function(g) { return '<li>' + g + '</li>'; }).join('') + '</ul>'
                : ''),
            '  </div>',
            '  <div class="rule-score-note">',
            '    <i class="fas fa-info-circle"></i> 规则评分基于关键词匹配，仅供参考。点击下方按钮尝试 <strong>AI 智能评分</strong>，获得更精准的评价和语法纠错。',
            '  </div>',
            '  <div style="text-align:center;margin-top:1.5rem;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">',
            '    <button class="btn-ai-score-sm" onclick="WritingAI.handleScore()">',
            '      <i class="fas fa-robot"></i> 试试 AI 智能评分',
            '    </button>',
            '    <button class="btn-primary" onclick="Writing.init()" style="padding:10px 28px;">',
            '      <i class="fas fa-redo"></i> 重新写作',
            '    </button>',
            '  </div>',
            '</div>'
        ].join('');

        var progress = SupabaseAuth.getProgress();
        progress.writing = { score: score.total, time: new Date().toISOString() };
        SupabaseAuth.saveProgress(progress);
        App.updateProgress();

        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
};
