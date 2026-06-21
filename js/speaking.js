/* ============================================
   口语练习模块 — 双引擎（ASR 语音识别 / 录音回放）
   ============================================ */

const Speaking = {
    currentIndex: 0,
    isRecording: false,
    recognition: null,
    lastScore: null,
    dialogueCompleted: 0,
    currentDialogue: 1,
    userSpeechResult: '',

    // 运行模式：'asr' (语音识别) | 'record' (录音回放)
    speakMode: 'asr',

    // MediaRecorder 引擎相关
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    audioUrl: null,
    _recordingStream: null,
    _recordingStartTime: 0,

    _micPermissionGranted: false,
    _permissionPromise: null,

    _storageKey: 'el_speaking_progress',

    /* ==========================================
       Progress helpers
       ========================================== */
    _saveProgress() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify({
                currentIndex: this.currentIndex,
                dialogueCompleted: this.dialogueCompleted,
                currentDialogue: this.currentDialogue
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

    /* ==========================================
       Browser & capability detection
       ========================================== */

    _getPlatform() {
        const ua = navigator.userAgent || '';
        if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
        if (/Android/.test(ua)) return 'android';
        return 'desktop';
    },

    /* 检测是否为 App 内置浏览器 */
    _isWebView() {
        const ua = navigator.userAgent || '';
        const platform = this._getPlatform();

        if (/MicroMessenger/i.test(ua)) return true;
        if (/AlipayClient/i.test(ua)) return true;
        if (/MQQBrowser|QQ\//i.test(ua)) return true;
        if (/baiduboxapp/i.test(ua)) return true;
        if (/DingTalk/i.test(ua)) return true;
        if (/Lark|Feishu/i.test(ua)) return true;

        if (platform === 'ios') {
            if (/Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) return false; // Safari
            if (/CriOS/.test(ua)) return false;   // Chrome for iOS
            if (/FxiOS/.test(ua)) return false;   // Firefox for iOS
            return true; // 其余 iOS App 内置浏览器
        }

        if (platform === 'android') {
            const hasBrowser = /Chrome|Firefox|Edge|Opera|SamsungBrowser|UCBrowser/i.test(ua);
            if (!hasBrowser) return true;
        }

        return false;
    },

    /* 核心能力检测 → { engine: 'asr' | 'record' | 'none', reason?, suggestion? } */
    _checkCapability() {
        const platform = this._getPlatform();
        const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
        const isWebView = this._isWebView();

        // === 直接不可用 ===
        if (isWebView && platform === 'ios') {
            return {
                engine: 'none',
                reason: 'App 内置浏览器无法使用语音识别功能',
                suggestion: '请在 Safari 中打开本页面再使用口语练习功能。<br><br>操作步骤：<br>1. 点击下方按钮复制链接<br>2. 打开 Safari，粘贴并访问',
                platform: 'ios-webview',
                actionBtn: 'safari'
            };
        }

        if (isWebView && platform === 'android') {
            if (hasSpeech) {
                return { engine: 'asr', isWebView: true, warning: 'App 内置浏览器中语音识别可能不稳定。建议用 Chrome 打开。' };
            }
            if (hasMedia && hasMediaRecorder) {
                return { engine: 'record', isWebView: true, warning: 'App 内置浏览器中录音可能不稳定。建议用 Chrome 打开获得语音打分。' };
            }
            return {
                engine: 'none',
                reason: 'App 内置浏览器不支持录音功能',
                suggestion: '请使用 Chrome 浏览器打开本页面',
                actionBtn: 'copy'
            };
        }

        // === SpeechRecognition 可用 → ASR 引擎 ===
        if (hasSpeech) {
            return { engine: 'asr' };
        }

        // === 有录音能力 → 录音回放引擎 ===
        if (hasMedia && hasMediaRecorder) {
            return { engine: 'record' };
        }

        // === 什么都没有 ===
        if (platform === 'ios') {
            return {
                engine: 'none',
                reason: '您的浏览器不支持麦克风访问',
                suggestion: '请使用 Safari 或 Chrome 打开本页面',
                actionBtn: 'copy'
            };
        }
        return {
            engine: 'none',
            reason: '您的浏览器不支持语音识别和录音功能',
            suggestion: '请使用 Chrome、Edge 或 Safari 浏览器打开本页面',
            actionBtn: 'copy'
        };
    },

    /* ==========================================
       Init & render
       ========================================== */

    init() {
        // 清理上一次的录音资源
        if (this.audioUrl) { URL.revokeObjectURL(this.audioUrl); this.audioUrl = null; }
        this.audioBlob = null;

        const saved = this._loadProgress();
        if (saved && (saved.currentIndex > 0 || saved.dialogueCompleted > 0)) {
            this.currentIndex = saved.currentIndex || 0;
            this.dialogueCompleted = saved.dialogueCompleted || 0;
            this.currentDialogue = saved.currentDialogue || 1;
        } else {
            this.currentIndex = 0;
            this.dialogueCompleted = 0;
            this.currentDialogue = 1;
            this._clearProgress();
        }

        // 能力检测 → 决定引擎
        const cap = this._checkCapability();
        if (cap.engine === 'none') {
            this._renderCompatWarning(cap.reason, cap.suggestion, cap.actionBtn);
            return;
        }
        this.speakMode = cap.engine;

        // 提前请求麦克风权限（只弹一次）
        if (hasGetUserMedia()) {
            this._requestMicPermission();
        }

        // ASR 模式预初始化 SpeechRecognition 实例
        if (this.speakMode === 'asr') {
            const isIOS = this._getPlatform() === 'ios';
            if (isIOS || cap.isWebView) {
                this._initRecognition();
            }
        }

        this.renderSentence();

        // Android WebView 警告条
        if (cap.warning) {
            this._showModeNotice(cap.warning, 'warning');
        }
        // 录音模式提示
        if (this.speakMode === 'record') {
            this._showModeNotice('当前浏览器不支持语音识别打分，已启用「录音回放」模式。录制你的发音后回放对比，然后自评打分。', 'info');
        }

        // 恢复进度提示
        if (this.currentIndex > 0) {
            setTimeout(() => {
                const container = document.getElementById('speakingContainer');
                if (container) {
                    const notice = document.createElement('div');
                    notice.style.cssText = 'text-align:center;padding:8px 16px;margin-bottom:1rem;background:rgba(99,102,241,0.08);border-radius:8px;color:#6366f1;font-size:0.85rem;';
                    notice.innerHTML = '<i class="fas fa-history"></i> 已恢复到第 ' + (this.currentIndex + 1) + ' 句 <a href="javascript:Speaking._clearProgress();Speaking.init();" style="margin-left:12px;color:#6366f1;text-decoration:underline;">重新开始</a>';
                    container.insertBefore(notice, container.firstChild);
                    setTimeout(function() { if (notice.parentNode) notice.remove(); }, 5000);
                }
            }, 100);
        }
    },

    renderSentence() {
        const container = document.getElementById('speakingContainer');
        const progress = SupabaseAuth.getProgress();
        const total = DATA.speakingSentences.length;

        const completedCount = progress.speaking.filter(function(s) { return typeof s === 'number'; }).length;
        if (completedCount >= total && this.dialogueCompleted < 2) {
            this.currentDialogue = this.dialogueCompleted + 1;
            this.renderDialogue();
            return;
        }
        if (completedCount >= total && this.dialogueCompleted >= 2) {
            this.renderComplete();
            return;
        }

        var sentence = DATA.speakingSentences[this.currentIndex];

        var modeLabel = '';
        if (this.speakMode === 'record') {
            modeLabel = '<span style="display:inline-block;margin-left:8px;padding:2px 10px;background:rgba(245,158,11,0.12);color:#b45309;border-radius:12px;font-size:0.75rem;font-weight:600;">🎙️ 录音模式</span>';
        }

        container.innerHTML =
            '<div class="speaking-step-indicator">' +
                DATA.speakingSentences.map(function(_, i) {
                    var cls = 'step-num';
                    if (progress.speaking.includes(i)) cls += ' completed';
                    if (i === Speaking.currentIndex) cls += ' active';
                    return '<div class="' + cls + '">' + (i + 1) + '</div>';
                }).join('') +
            '</div>' +
            '<div class="speaking-card">' +
                '<span class="step-label">第 ' + (this.currentIndex + 1) + ' / ' + total + ' 句' + modeLabel + '</span>' +
                '<div class="speaking-sentence" id="currentSentence">' + sentence.english + '</div>' +
                '<div class="speaking-translation">' + sentence.chinese + '</div>' +
                '<div style="color:var(--text-light);font-size:0.85rem;margin-bottom:1.5rem;">' +
                    '<i class="fas fa-volume-up"></i> ' + sentence.phonetic +
                '</div>' +
                '<div class="speaking-actions" id="speakingActions">' +
                    '<button class="btn-play" onclick="Speaking.playSentence()">' +
                        '<i class="fas fa-play"></i> 听标准读音' +
                    '</button>' +
                '</div>' +
                '<div id="speakingResult"></div>' +
            '</div>';

        this.lastScore = null;
        this.userSpeechResult = '';
    },

    /* ==========================================
       ASR 引擎 — SpeechRecognition
       ========================================== */

    _initRecognition() {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (this.recognition) {
            try { this.recognition.abort(); } catch(e) {}
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;
        this.recognition.continuous = false;

        var self = this;
        this.recognition.onresult = function(event) {
            var results = event.results;
            if (!results || results.length === 0) return;
            var lastIdx = results.length - 1;
            var alt = results[lastIdx] && results[lastIdx][0];
            if (alt && alt.transcript) {
                self.userSpeechResult = alt.transcript.trim();
                if (!self._scored) {
                    self._scored = true;
                    self.scoreSpeech();
                }
            }
        };

        this.recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            self.isRecording = false;
            self._resetRecordBtn();
            if (event.error === 'no-speech') {
                App.toast('未检测到语音，请再试一次', 'info');
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                var isWV = self._isWebView();
                App.toast(isWV
                    ? 'App 内置浏览器不支持语音识别，请用系统自带浏览器打开'
                    : '请在设置中允许浏览器访问麦克风', 'error');
            } else if (event.error === 'audio-capture') {
                App.toast('无法访问麦克风，请检查系统权限设置', 'error');
            } else if (event.error === 'network') {
                App.toast('网络异常，请检查网络连接', 'error');
            } else if (event.error === 'aborted') {
                // 正常中断
            } else {
                App.toast('语音识别出错：' + event.error, 'error');
            }
        };

        this.recognition.onend = function() {
            self.isRecording = false;
            self._resetRecordBtn();
            if (!self._scored && self.userSpeechResult) {
                self._scored = true;
                self.scoreSpeech();
            } else if (!self._scored && !self.userSpeechResult) {
                App.toast('未识别到语音内容，请大声朗读句子后再试', 'info');
            }
            if (self._scoreTimeout) {
                clearTimeout(self._scoreTimeout);
                self._scoreTimeout = null;
            }
        };
    },

    /* ==========================================
       ASR 模式 - 录音
       ========================================== */

    async startRecording() {
        // 录音模式走 MediaRecorder
        if (this.speakMode === 'record') {
            return this._startMediaRecording();
        }

        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            App.toast('您的浏览器不支持语音识别', 'error');
            return;
        }

        if (this.isRecording && this.recognition) {
            this.stopRecording();
            return;
        }

        var platform = this._getPlatform();
        if (platform !== 'ios' && !this._micPermissionGranted && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var granted = await this._requestMicPermission();
            if (!granted) {
                App.toast('请允许浏览器访问麦克风，然后重新点击录音', 'error');
                return;
            }
        }

        var btn = document.getElementById('btnRecord');
        if (btn) {
            btn.classList.add('recording');
            btn.innerHTML = '<i class="fas fa-stop"></i> 正在录音...点击停止';
            btn.onclick = function() { Speaking.stopRecording(); };
        }

        if (!this.recognition) {
            this._initRecognition();
        }
        if (!this.recognition) {
            App.toast('启动语音识别失败，请刷新页面试试', 'error');
            this._resetRecordBtn();
            return;
        }

        this.isRecording = true;
        this.userSpeechResult = '';
        this._scored = false;

        try {
            this.recognition.start();
            var self = this;
            this._scoreTimeout = setTimeout(function() {
                if (!self._scored && self.isRecording) {
                    console.warn('[Speaking] 录音超时，强制停止');
                    try { self.recognition.stop(); } catch(e) {}
                    self.isRecording = false;
                    self._resetRecordBtn();
                    if (self.userSpeechResult && !self._scored) {
                        self._scored = true;
                        self.scoreSpeech();
                    } else if (!self._scored) {
                        App.toast('录音超时，请检查麦克风后再试', 'info');
                    }
                }
            }, 15000);
        } catch (e) {
            App.toast('启动录音失败，请点击允许麦克风权限', 'error');
            this.isRecording = false;
            this._resetRecordBtn();
        }
    },

    _resetRecordBtn() {
        var btn = document.getElementById('btnRecord');
        if (!btn) return;
        btn.classList.remove('recording');
        if (this.speakMode === 'record') {
            btn.innerHTML = '<i class="fas fa-microphone"></i> 重新录音';
            btn.onclick = function() { Speaking.startRecording(); };
        } else {
            btn.innerHTML = '<i class="fas fa-microphone"></i> 重新跟读';
            btn.onclick = function() { Speaking.startRecording(); };
        }
    },

    stopRecording() {
        if (this._scoreTimeout) {
            clearTimeout(this._scoreTimeout);
            this._scoreTimeout = null;
        }
        // ASR 模式
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e) {}
        }
        // 录音模式
        if (this.speakMode === 'record') {
            this._stopMediaRecording();
        }
    },

    /* ==========================================
       录音回放引擎 — MediaRecorder
       ========================================== */

    async _startMediaRecording() {
        if (this.isRecording) {
            this._stopMediaRecording();
            return;
        }

        // 请求麦克风权限
        if (!this._micPermissionGranted && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var granted = await this._requestMicPermission();
            if (!granted) {
                App.toast('请允许浏览器访问麦克风，然后重新点击录音', 'error');
                return;
            }
        }

        try {
            this._recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            App.toast('无法访问麦克风，请检查系统权限设置', 'error');
            return;
        }

        this.audioChunks = [];
        this.audioBlob = null;
        if (this.audioUrl) { URL.revokeObjectURL(this.audioUrl); this.audioUrl = null; }

        // 选择最佳编码格式
        var mimeType = '';
        var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/wav'];
        for (var i = 0; i < types.length; i++) {
            if (MediaRecorder.isTypeSupported(types[i])) {
                mimeType = types[i];
                break;
            }
        }

        try {
            this.mediaRecorder = new MediaRecorder(this._recordingStream, mimeType ? { mimeType: mimeType } : undefined);
        } catch (e) {
            // iOS Safari 可能不支持音频专用录制，降级处理
            try {
                this.mediaRecorder = new MediaRecorder(this._recordingStream);
            } catch (e2) {
                this._recordingStream.getTracks().forEach(function(t) { t.stop(); });
                App.toast('您的浏览器不支持录音功能', 'error');
                return;
            }
        }

        var self = this;
        this.mediaRecorder.ondataavailable = function(e) {
            if (e.data && e.data.size > 0) {
                self.audioChunks.push(e.data);
            }
        };

        this.mediaRecorder.onstop = function() {
            self.isRecording = false;
            self._resetRecordBtn();
            // 停止麦克风流
            if (self._recordingStream) {
                self._recordingStream.getTracks().forEach(function(t) { t.stop(); });
                self._recordingStream = null;
            }
            // 生成 audio blob
            if (self.audioChunks.length > 0) {
                self.audioBlob = new Blob(self.audioChunks, { type: mimeType || 'audio/webm' });
                self.audioUrl = URL.createObjectURL(self.audioBlob);
                self._renderRecordResult();
            } else {
                App.toast('录音为空，请再试一次', 'info');
            }
        };

        this.mediaRecorder.onerror = function(e) {
            console.error('MediaRecorder error:', e);
            self.isRecording = false;
            self._resetRecordBtn();
            if (self._recordingStream) {
                self._recordingStream.getTracks().forEach(function(t) { t.stop(); });
                self._recordingStream = null;
            }
            App.toast('录音出错，请重试', 'error');
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this._recordingStartTime = Date.now();

        var btn = document.getElementById('btnRecord');
        if (btn) {
            btn.classList.add('recording');
            btn.innerHTML = '<i class="fas fa-stop"></i> 正在录音...点击停止';
            btn.onclick = function() { Speaking.stopRecording(); };
        }

        // 最长录音 30 秒自动停止
        var MAX_RECORD = 30000;
        this._recordTimeout = setTimeout(function() {
            if (self.isRecording && self.speakMode === 'record') {
                App.toast('录音已满 30 秒，自动停止', 'info');
                self._stopMediaRecording();
            }
        }, MAX_RECORD);
    },

    _stopMediaRecording() {
        if (this._recordTimeout) {
            clearTimeout(this._recordTimeout);
            this._recordTimeout = null;
        }
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try { this.mediaRecorder.stop(); } catch(e) {}
        }
    },

    _playRecording() {
        if (!this.audioUrl) return;
        var audio = new Audio(this.audioUrl);
        audio.play().catch(function(e) {
            console.error('Playback error:', e);
        });
    },

    /* 录音回放结果面板 — 自评打分 */
    _renderRecordResult() {
        var sentence = DATA.speakingSentences[this.currentIndex];
        var resultDiv = document.getElementById('speakingResult');
        if (!resultDiv) return;

        resultDiv.innerHTML =
            '<div class="speaking-result" style="background:rgba(99,102,241,0.04);">' +
                '<div style="margin-bottom:1rem;">' +
                    '<p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.5rem;">点击播放你的录音，和原句对比发音：</p>' +
                    '<button id="btnPlayRecording" onclick="Speaking._playRecording()" style="padding:10px 20px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;">' +
                        '<i class="fas fa-play"></i> 播放我的录音' +
                    '</button>' +
                '</div>' +
                '<div style="margin-top:1rem;text-align:left;border-top:1px solid var(--border);padding-top:1rem;">' +
                    '<p><strong>原句：</strong>' + sentence.english + '</p>' +
                    '<p style="color:var(--text-light);font-size:0.85rem;">' + sentence.chinese + '</p>' +
                '</div>' +
                '<div style="margin-top:1.2rem;text-align:left;">' +
                    '<p style="font-weight:600;margin-bottom:0.5rem;">自评打分：你觉得自己的发音怎么样？</p>' +
                    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                        '<button onclick="Speaking._selfScore(95)" style="flex:1;min-width:60px;padding:10px 8px;border:2px solid #10b981;background:#ecfdf5;color:#059669;border-radius:8px;font-weight:600;cursor:pointer;">👍 很棒</button>' +
                        '<button onclick="Speaking._selfScore(75)" style="flex:1;min-width:60px;padding:10px 8px;border:2px solid #6366f1;background:#eef2ff;color:#4f46e5;border-radius:8px;font-weight:600;cursor:pointer;">👌 还行</button>' +
                        '<button onclick="Speaking._selfScore(55)" style="flex:1;min-width:60px;padding:10px 8px;border:2px solid #f59e0b;background:#fef3c7;color:#b45309;border-radius:8px;font-weight:600;cursor:pointer;">🤔 一般</button>' +
                        '<button onclick="Speaking._selfScore(30)" style="flex:1;min-width:60px;padding:10px 8px;border:2px solid #ef4444;background:#fef2f2;color:#dc2626;border-radius:8px;font-weight:600;cursor:pointer;">👎 需练</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },

    _selfScore(score) {
        this.lastScore = score;

        var scoreClass, scoreLabel;
        if (score >= 90) { scoreClass = 'score-excellent'; scoreLabel = '自评：优秀！'; }
        else if (score >= 75) { scoreClass = 'score-good'; scoreLabel = '自评：良好！'; }
        else if (score >= 55) { scoreClass = 'score-fair'; scoreLabel = '自评：一般，继续练！'; }
        else { scoreClass = 'score-poor'; scoreLabel = '自评：加油，多听几遍！'; }

        if (score >= 75) SoundFx.correct();
        else SoundFx.wrong();

        var resultDiv = document.getElementById('speakingResult');
        if (resultDiv) {
            var sentence = DATA.speakingSentences[this.currentIndex];
            resultDiv.innerHTML =
                '<div class="speaking-result">' +
                    '<div class="score-circle ' + scoreClass + '">' + score + '</div>' +
                    '<div class="score-label">' + scoreLabel + '</div>' +
                    '<div style="margin-top:0.5rem;font-size:0.8rem;color:var(--text-light);">（录音回放模式 · 自评打分）</div>' +
                    '<button class="btn-next-sentence" onclick="Speaking.nextSentence()" style="margin-top:1rem;">' +
                        '<i class="fas fa-arrow-right"></i> ' + (this.currentIndex < DATA.speakingSentences.length - 1 ? '下一句' : '进入对话练习') +
                    '</button>' +
                '</div>';
        }

        var progress = SupabaseAuth.getProgress();
        if (!progress.speaking.includes(this.currentIndex)) {
            progress.speaking.push(this.currentIndex);
            SupabaseAuth.saveProgress(progress);
            App.updateProgress();
        }
    },

    /* ==========================================
       ASR 打分
       ========================================== */

    scoreSpeech() {
        var sentence = DATA.speakingSentences[this.currentIndex];
        var target = sentence.english.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/);
        var spoken = this.userSpeechResult.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/);

        var matchCount = 0;
        var usedIndices = new Set();

        for (var w = 0; w < spoken.length; w++) {
            var word = spoken[w];
            var idx = target.findIndex(function(t, i) { return t === word && !usedIndices.has(i); });
            if (idx !== -1) {
                matchCount++;
                usedIndices.add(idx);
            }
        }

        var lengthPenalty = Math.max(0, 1 - Math.abs(target.length - spoken.length) / target.length * 0.3);
        var matchRate = matchCount / target.length;
        var score = Math.round(Math.min(100, matchRate * lengthPenalty * 100));

        this.lastScore = score;

        var scoreClass, scoreLabel;
        if (score >= 90) { scoreClass = 'score-excellent'; scoreLabel = '优秀！发音很棒！'; }
        else if (score >= 75) { scoreClass = 'score-good'; scoreLabel = '良好，继续保持！'; }
        else if (score >= 60) { scoreClass = 'score-fair'; scoreLabel = '还不错，再练练！'; }
        else { scoreClass = 'score-poor'; scoreLabel = '加油，多听几遍再试试！'; }

        if (score >= 75) SoundFx.correct();
        else SoundFx.wrong();

        var resultDiv = document.getElementById('speakingResult');
        if (resultDiv) {
            resultDiv.innerHTML =
                '<div class="speaking-result">' +
                    '<div class="score-circle ' + scoreClass + '">' + score + '</div>' +
                    '<div class="score-label">' + scoreLabel + '</div>' +
                    '<div style="margin-top:1rem;text-align:left;">' +
                        '<p><strong>原句：</strong>' + sentence.english + '</p>' +
                        '<p><strong>你的发音：</strong>' + this.userSpeechResult + '</p>' +
                    '</div>' +
                    '<button class="btn-next-sentence" onclick="Speaking.nextSentence()">' +
                        '<i class="fas fa-arrow-right"></i> ' + (this.currentIndex < DATA.speakingSentences.length - 1 ? '下一句' : '进入对话练习') +
                    '</button>' +
                '</div>';
        }

        var progress = SupabaseAuth.getProgress();
        if (!progress.speaking.includes(this.currentIndex)) {
            progress.speaking.push(this.currentIndex);
            SupabaseAuth.saveProgress(progress);
            App.updateProgress();
        }
    },

    nextSentence() {
        this.currentIndex++;
        this._saveProgress();
        if (this.currentIndex >= DATA.speakingSentences.length) {
            this.renderDialogue();
        } else {
            // nextSentence 走 renderSentence 会清 innerHTML，新模式信息保留在 speakMode 上
            this.renderSentence();
        }
    },

    /* ==========================================
       Play TTS
       ========================================== */

    /* 检测语音合成是否真正可用（不仅检测 API 存在，还要检测有可用语音） */
    _hasWorkingSpeechSynthesis() {
        if (!('speechSynthesis' in window)) return false;
        // 尝试获取语音列表，如果返回空可能是异步加载
        var voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) return true;
        return 'pending'; // 异步加载中，稍后再试
    },

    /* 播放标准读音（增强版：处理异步语音加载 + 不可用时的降级） */
    playSentence() {
        var sentence = DATA.speakingSentences[this.currentIndex];
        var hasSynth = this._hasWorkingSpeechSynthesis();

        // 语音合成完全不可用 → 降级：显示文字提示，不阻止流程
        if (hasSynth === false) {
            App.toast('当前浏览器不支持语音播放，请参考文字自行朗读', 'info');
            // 仍然显示录音按钮，让用户可以继续练习
            var mode = this.speakMode;
            var el = document.getElementById('speakingActions');
            if (el && !document.getElementById('btnRecord')) {
                var label = mode === 'record' ? '开始录音' : '开始跟读';
                el.insertAdjacentHTML('beforeend',
                    '<button class="btn-record" id="btnRecord" onclick="Speaking.startRecording()">' +
                        '<i class="fas fa-microphone"></i> ' + label +
                    '</button>'
                );
            }
            return;
        }

        // 语音列表异步加载中 → 等待 voiceschanged 事件
        if (hasSynth === 'pending') {
            var self = this;
            var waited = false;
            var onVoicesLoaded = function() {
                if (waited) return;
                waited = true;
                window.speechSynthesis.removeEventListener('voiceschanged', onVoicesLoaded);
                self.playSentence(); // 重新调用，此时 voices 已加载
            };
            window.speechSynthesis.addEventListener('voiceschanged', onVoicesLoaded);
            // 最多等 3 秒，超时则降级
            setTimeout(function() {
                if (!waited) {
                    waited = true;
                    window.speechSynthesis.removeEventListener('voiceschanged', onVoicesLoaded);
                    // 超时仍不可用 → 降级
                    App.toast('语音加载超时，请参考文字自行朗读', 'info');
                    var mode = self.speakMode;
                    var el = document.getElementById('speakingActions');
                    if (el && !document.getElementById('btnRecord')) {
                        var label = mode === 'record' ? '开始录音' : '开始跟读';
                        el.insertAdjacentHTML('beforeend',
                            '<button class="btn-record" id="btnRecord" onclick="Speaking.startRecording()">' +
                                '<i class="fas fa-microphone"></i> ' + label +
                            '</button>'
                        );
                    }
                }
            }, 3000);
            return;
        }

        // 语音合成可用 → 正常播放
        var oldBtn = document.getElementById('btnRecord');
        if (oldBtn) oldBtn.remove();

        var utterance = new window.SpeechSynthesisUtterance(sentence.english);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        var voices = window.speechSynthesis.getVoices();
        var enVoice = voices.find(function(v) { return v.lang && v.lang.startsWith('en'); });
        if (enVoice) utterance.voice = enVoice;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        var idx = this.currentIndex;
        var self2 = this;
        var mode = this.speakMode;

        var addRecordButton = function() {
            if (document.getElementById('btnRecord') || self2.isRecording) return;
            if (self2.currentIndex !== idx) return;
            var el = document.getElementById('speakingActions');
            if (el) {
                var label = mode === 'record' ? '开始录音' : '开始跟读';
                el.insertAdjacentHTML('beforeend',
                    '<button class="btn-record" id="btnRecord" onclick="Speaking.startRecording()">' +
                        '<i class="fas fa-microphone"></i> ' + label +
                    '</button>'
                );
            }
        };

        utterance.onend = addRecordButton;
        var wordCount = sentence.english.trim().split(/\s+/).length;
        var estMs = Math.max(4000, wordCount * 800 + 2000);
        setTimeout(addRecordButton, estMs);
    },

    /* ==========================================
       UI 辅助
       ========================================== */

    _showModeNotice(msg, type) {
        var container = document.getElementById('speakingContainer');
        if (!container) return;
        var bg, border, color, icon;
        if (type === 'warning') {
            bg = 'rgba(245,158,11,0.1)';
            border = 'rgba(245,158,11,0.3)';
            color = '#b45309';
            icon = '⚠️';
        } else {
            bg = 'rgba(99,102,241,0.06)';
            border = 'rgba(99,102,241,0.2)';
            color = '#4338ca';
            icon = 'ℹ️';
        }
        var notice = document.createElement('div');
        notice.style.cssText = 'background:' + bg + ';border:1px solid ' + border + ';border-radius:10px;padding:10px 16px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-size:0.85rem;color:' + color + ';line-height:1.5;';
        notice.innerHTML = '<span style="font-size:1.2rem;flex-shrink:0;">' + icon + '</span><span style="flex:1;">' + msg + '</span>';
        container.insertBefore(notice, container.firstChild);
    },

    _renderCompatWarning(reason, suggestion, actionBtn) {
        var container = document.getElementById('speakingContainer');
        if (!container) return;
        var btnLabel = actionBtn === 'safari' ? '复制链接到 Safari 打开' : '复制链接到浏览器打开';
        container.innerHTML =
            '<div style="text-align:center;padding:3rem 1.5rem;">' +
                '<div style="font-size:3rem;margin-bottom:1rem;opacity:0.6;">🎤</div>' +
                '<h2 style="color:var(--text);margin-bottom:0.8rem;">口语练习暂不可用</h2>' +
                '<p style="color:var(--danger);font-weight:500;margin-bottom:0.5rem;">' + reason + '</p>' +
                '<p style="color:var(--text-light);font-size:0.9rem;line-height:1.6;max-width:400px;margin:0 auto 1.5rem;">' + suggestion + '</p>' +
                '<button onclick="navigator.clipboard&&navigator.clipboard.writeText(window.location.href);App.toast(\'链接已复制，请在浏览器中粘贴打开\',\'success\')" style="padding:0.7rem 1.6rem;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;color:var(--text);cursor:pointer;font-size:0.9rem;">' +
                    '<i class="fas fa-copy"></i> ' + btnLabel +
                '</button>' +
            '</div>';
    },

    /* ==========================================
       权限管理
       ========================================== */

    async _requestMicPermission() {
        if (this._micPermissionGranted) return true;
        if (this._permissionPromise) return this._permissionPromise;

        var self = this;
        this._permissionPromise = (async function() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return true;
            }
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    var perm = await navigator.permissions.query({ name: 'microphone' });
                    if (perm.state === 'granted') {
                        self._micPermissionGranted = true;
                        return true;
                    }
                }
            } catch(e) {}

            try {
                var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(function(t) { t.stop(); });
                self._micPermissionGranted = true;
                return true;
            } catch (err) {
                self._micPermissionGranted = false;
                return false;
            }
        })();

        var result = await this._permissionPromise;
        this._permissionPromise = null;
        return result;
    },

    /* ==========================================
       Dialogue
       ========================================== */

    renderDialogue() {
        var dialogues = [DATA.dialogueExercise, DATA.dialogueExercise2];
        var dialogueIdx = this.currentDialogue - 1;
        var dialogue = dialogues[dialogueIdx] || DATA.dialogueExercise;
        var container = document.getElementById('speakingContainer');

        container.innerHTML =
            '<div style="text-align:center;margin-bottom:2rem;">' +
                '<span class="step-label" style="display:inline-block;padding:6px 20px;background:rgba(99,102,241,0.1);color:var(--primary);border-radius:20px;font-weight:600;">' +
                    '🎯 对话填空练习 (' + this.currentDialogue + '/2)' +
                '</span>' +
                '<h2 style="margin-top:1rem;">' + dialogue.title + '</h2>' +
                '<p style="color:var(--text-light);">请根据上下文填写空缺的单词</p>' +
            '</div>' +
            '<div class="dialogue-card">' +
                dialogue.lines.map(function(line, i) {
                    var speakerClass = line.speaker === 'A' ? 'speaker-a' : 'speaker-b';
                    var textHtml = line.text;
                    line.blanks.forEach(function(blank) {
                        textHtml = textHtml.replace(
                            '{' + blank.index + '}',
                            '<span class="dialogue-blank" id="dialogue-blank-' + i + '">' +
                                '<input type="text" placeholder="填入单词" id="dialogue-input-' + i + '" autocomplete="off">' +
                            '</span>'
                        );
                    });
                    return '<div class="dialogue-line ' + speakerClass + '">' +
                        '<div class="dialogue-avatar">' + line.speaker + '</div>' +
                        '<div class="dialogue-text">' + textHtml + '</div>' +
                    '</div>';
                }).join('') +
                '<button class="btn-check-dialogue" onclick="Speaking.checkDialogue()">' +
                    '<i class="fas fa-check-circle"></i> 检查答案' +
                '</button>' +
                '<div id="dialogueResult"></div>' +
            '</div>';
    },

    checkDialogue() {
        var dialogues = [DATA.dialogueExercise, DATA.dialogueExercise2];
        var dialogueIdx = this.currentDialogue - 1;
        var dialogue = dialogues[dialogueIdx] || DATA.dialogueExercise;
        var correct = 0;
        var total = dialogue.lines.length;

        dialogue.lines.forEach(function(line, i) {
            var input = document.getElementById('dialogue-input-' + i);
            var blank = document.getElementById('dialogue-blank-' + i);
            if (!input || !blank) return;

            var userAnswer = input.value.trim().toLowerCase();
            var correctAnswer = line.blanks[0].answer.toLowerCase();

            if (userAnswer === correctAnswer) {
                blank.classList.add('correct');
                blank.classList.remove('wrong');
                input.disabled = true;
                correct++;
            } else {
                blank.classList.add('wrong');
                blank.classList.remove('correct');
            }
        });

        var resultDiv = document.getElementById('dialogueResult');
        if (resultDiv) {
            var percentage = Math.round(correct / total * 100);
            if (percentage === 100) {
                SoundFx.correct();
                resultDiv.innerHTML =
                    '<div style="margin-top:1rem;padding:1.5rem;background:rgba(16,185,129,0.1);border-radius:12px;text-align:center;">' +
                        '<div style="font-size:2rem;margin-bottom:0.5rem;">🎉</div>' +
                        '<h3 style="color:var(--accent);">全部正确！</h3>' +
                        '<p>' + (this.currentDialogue < 2 ? '太棒了！还有一组对话等你挑战！' : '太棒了，你已经掌握了旅游对话的关键表达！') + '</p>' +
                        (this.currentDialogue < 2 ? '<button class="btn-next-sentence" onclick="Speaking.goNextDialogue()" style="margin-top:1rem;"><i class="fas fa-arrow-right"></i> 进入下一组对话</button>' : '') +
                    '</div>';
                this.dialogueCompleted = this.currentDialogue;
                this._saveProgress();
                if (this.dialogueCompleted >= 2) {
                    App.showReward('你完成了所有口语练习和对话填空！');
                    var progress = SupabaseAuth.getProgress();
                    if (!progress.speaking.includes('dialogue')) {
                        progress.speaking.push('dialogue');
                        SupabaseAuth.saveProgress(progress);
                    }
                }
            } else {
                SoundFx.wrong();
                resultDiv.innerHTML =
                    '<div style="margin-top:1rem;padding:1.5rem;background:rgba(245,158,11,0.08);border-radius:12px;text-align:center;">' +
                        '<p>答对了 <strong>' + correct + '</strong>/' + total + ' 题，修改错误的答案后再试一次吧！</p>' +
                    '</div>';
            }
        }
    },

    goNextDialogue() {
        this.currentDialogue = 2;
        this.renderDialogue();
    },

    renderComplete() {
        this._clearProgress();
        var container = document.getElementById('speakingContainer');
        container.innerHTML =
            '<div class="speaking-card" style="padding:3rem;">' +
                '<div style="font-size:4rem;margin-bottom:1rem;">🏆</div>' +
                '<h2>口语练习已全部完成！</h2>' +
                '<p style="color:var(--text-light);margin:1rem 0;">你已经完成了所有句子跟读和对话填空，继续其他模块的学习吧！</p>' +
                '<button class="btn-next-sentence" onclick="Speaking.init()">' +
                    '<i class="fas fa-redo"></i> 重新练习' +
                '</button>' +
            '</div>';
    }
};

/* 工具函数 */
function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
