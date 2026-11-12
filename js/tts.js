/* ============================================
   通用 TTS 模块 — 文字转语音（Web Speech API）
   可在任何页面调用：TTS.speak(text)
   提供：音色选择、语速调节、播放/暂停/停止
   ============================================ */

const TTS = {
    _voices: [],
    _preferredVoice: null,
    _utterance: null,
    _isPlaying: false,
    _isPaused: false,
    _currentText: '',
    _rate: 1.0,
    _voiceLang: 'en-GB',
    _bar: null,
    _dlgToken: 0,   // 对话朗读令牌：停止/重开时作废旧队列
    TURN_GAP_MS: 80, // 换人说话的间隙（毫秒）。考试听力是"一人说完另一人立刻接上"，
                     // 浏览器本身还有几十毫秒自然间隙，这里只补一点点，别调大

    // 初始化：加载可用语音列表
    init() {
        if (!('speechSynthesis' in window)) {
            console.warn('[TTS] 浏览器不支持 Web Speech API');
            return;
        }
        try {
            var saved = parseFloat(localStorage.getItem('el_speech_rate'));
            if (!isNaN(saved) && saved >= 0.5 && saved <= 1.5) this._rate = saved;
        } catch (e) {}
        this._loadVoices();
        // Chrome 异步加载语音
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.onvoiceschanged = () => this._loadVoices();
        }
    },

    _loadVoices() {
        this._voices = speechSynthesis.getVoices() || [];
        // 优先选英音
        this._preferredVoice = this._voices.find(v => v.lang === 'en-GB' && /female|sonia|kate/i.test(v.name))
            || this._voices.find(v => v.lang === 'en-GB')
            || this._voices.find(v => v.lang === 'en-US')
            || this._voices.find(v => v.lang.startsWith('en'));
    },

    // 播放文本
    // v2 修复「点击没反应」的几个已知坑：
    //   1) Chrome 中 speechSynthesis.cancel() 后立刻 speak()，新语句会被一起取消（静默失败）
    //      → cancel 后延迟 80ms 再 speak
    //   2) Chrome 语音列表异步加载，getVoices() 可能为空数组
    //      → speak 时现场再取一次；仍为空就不指定 voice（用系统默认，照样能读）
    //   3) 部分环境合成器卡在 paused 状态 → speak 后调用 resume() 兜底
    //   4) 超过 15 秒的长文本 Chrome 会自动停止 → 按句子分块排队朗读
    speak(text, opts) {
        if (!('speechSynthesis' in window)) {
            alert('您的浏览器不支持语音朗读功能');
            return;
        }

        opts = opts || {};
        var rate = opts.rate || this._rate;
        var lang = opts.lang || this._voiceLang;

        // 如果传了新文本就用新的，否则继续上次的
        if (text) {
            this._currentText = text;
        }
        if (!this._currentText) return;

        // 如果正在播放，先停（延迟后再发起，避免 cancel 吞掉新 utterance）
        speechSynthesis.cancel();
        this._isPaused = false;
        this._chunks = this._splitChunks(this._currentText);

        var self = this;
        setTimeout(function () {
            self._speakNext(lang, rate, true);
        }, 80);
    },

    // ============ 双人对话朗读（男/女分声） ============
    // v3 新增：原来整段对话交给同一个音色，两个说话人听起来完全一样。
    // 现在按「行 / speaker」逐句朗读，说话人 A 用女声、B 用男声（找不到男女对时用音高区分）。
    //
    // turns 支持两种写法：
    //   ['第一句', '第二句']            —— 按顺序交替 A/B
    //   [{ text: '...', speaker: 'A' }] —— 按 speaker 固定音色
    // opts: { rate, onEnd }
    speakDialogue(turns, opts) {
        if (!('speechSynthesis' in window)) {
            alert('您的浏览器不支持语音朗读功能');
            return;
        }

        opts = opts || {};
        var self = this;
        var rate = opts.rate || (typeof this.getRate === 'function' ? this.getRate() : this._rate);
        var onEnd = opts.onEnd || function () {};

        // 1) 规整成 [{text, who}]
        var list = [];
        (turns || []).forEach(function (t) {
            var text = (typeof t === 'string') ? t : ((t && t.text) || '');
            text = String(text).replace(/\s+/g, ' ').trim();
            if (!text) return;
            var who = (t && typeof t === 'object' && t.speaker) ? String(t.speaker).trim() : '';
            list.push({ text: text, who: who });
        });
        if (!list.length) { onEnd(); return; }

        // 2) 说话人 → 音色序号 0/1（没标 speaker 就按出现顺序交替）
        var hasSpeaker = false;
        for (var k = 0; k < list.length; k++) { if (list[k].who) { hasSpeaker = true; break; } }

        var map = {};
        var order = 0;
        var queue = [];
        list.forEach(function (item, i) {
            var idx;
            if (hasSpeaker && item.who) {
                if (!(item.who in map)) {
                    // A/B 这类单字母角色固定分配，避免同一角色在不同对话里换声
                    var letter = String(item.who).toUpperCase();
                    map[item.who] = /^[A-Z]$/.test(letter) ? (letter.charCodeAt(0) - 65) % 2 : (order++) % 2;
                }
                idx = map[item.who];
            } else {
                idx = i % 2;
            }
            // 单句过长再切块，规避 Chrome 长文本自动停止
            self._splitChunks(item.text).forEach(function (p) {
                queue.push({ text: p, idx: idx });
            });
        });

        // 3) 停掉正在读的，稍等再开口（cancel 后立刻 speak 会被 Chrome 吞掉）
        speechSynthesis.cancel();
        this._isPaused = false;
        this._dlgState = null;
        this._loadVoices();
        var voices = this._pickDialogueVoices();
        var token = ++this._dlgToken;

        setTimeout(function () {
            if (token !== self._dlgToken) return;
            self._speakQueue(queue, voices, rate, token, onEnd);
        }, 80);
    },

    // 逐句排队朗读；每句用自己的音色/音高
    // 支持暂停/继续：暂停时直接 cancel 静音（比原生 pause 可靠），继续时从当前这句重播
    _speakQueue(queue, voices, rate, token, onEnd) {
        this._dlgState = {
            queue: queue,
            voices: voices,
            rate: rate,
            token: token,
            i: 0,
            lastIdx: -1,
            paused: false,
            onEnd: onEnd
        };
        this._playNextTurn();
    },

    _playNextTurn() {
        var self = this;
        var st = this._dlgState;
        if (!st || st.paused || st.token !== this._dlgToken) return;

        if (st.i >= st.queue.length) {
            this._dlgState = null;
            st.onEnd();
            return;
        }

        var item = st.queue[st.i];
        // 换人时几乎不留白，模拟考试听力：一人说完另一人立刻接上
        // （浏览器在两条语音之间本来就有几十毫秒的自然间隙，这里补得越少越紧凑）
        var gap = (st.lastIdx !== -1 && st.lastIdx !== item.idx) ? this.TURN_GAP_MS : 0;
        st.lastIdx = item.idx;

        if (gap) {
            setTimeout(function () {
                if (!st.paused && st.token === self._dlgToken) self._playTurn(st, item);
            }, gap);
        } else {
            this._playTurn(st, item);
        }
    },

    _playTurn(st, item) {
        var self = this;
        var cfg = st.voices[item.idx % st.voices.length];

        var u = new SpeechSynthesisUtterance(item.text);
        u.lang = cfg.lang || 'en-US';
        if (cfg.voice) u.voice = cfg.voice;
        u.rate = st.rate;
        u.pitch = cfg.pitch || 1;
        u.volume = 1;

        var settled = false;
        var guard = null;
        var finish = function () {
            if (settled) return;
            settled = true;
            if (guard) clearTimeout(guard);
            if (st.paused) return;              // 暂停中不往下推进
            if (st.token !== self._dlgToken) return;
            st.i++;                             // 这一句播完了，指向下一句
            self._playNextTurn();
        };

        u.onend = finish;
        u.onerror = function (e) {
            var et = e && e.error;
            if (et === 'interrupted' || et === 'canceled') {
                settled = true;                 // 主动打断：保持当前句索引，便于继续/重播
                if (guard) clearTimeout(guard);
                return;
            }
            finish();
        };

        // 看门狗：Chrome 偶发不触发 onend，按字数估个上限，超时就往下走
        guard = setTimeout(function () {
            finish();
        }, Math.max(6000, item.text.length * 140 + 5000));

        self._utterance = u;
        self._isPlaying = true;
        speechSynthesis.speak(u);
        try { speechSynthesis.resume(); } catch (e) { /* ignore */ }
    },

    // 是否有对话正在播/可继续
    isDialogueActive() {
        return !!(this._dlgState && !this._dlgState.paused);
    },

    isDialoguePaused() {
        return !!(this._dlgState && this._dlgState.paused);
    },

    // 暂停：立即静音，保留播放位置
    pauseDialogue() {
        var st = this._dlgState;
        if (!st || st.paused) return false;
        st.paused = true;
        try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
        this._isPlaying = false;
        return true;
    },

    // 继续：从暂停的那一句重新读（半句被打断，重听一遍更实用）
    resumeDialogue() {
        var self = this;
        var st = this._dlgState;
        if (!st || !st.paused) return false;
        st.paused = false;
        st.token = ++this._dlgToken;            // 换新令牌，旧回调自动作废
        setTimeout(function () {
            if (st.token !== self._dlgToken) return;
            self._playNextTurn();
        }, 60);
        return true;
    },

    // 判断音色性别（按音色名猜，猜不出返回空串）
    _guessGender(v) {
        var n = String((v && v.name) || '').toLowerCase();
        var FEMALE = ['zira', 'hazel', 'susan', 'samantha', 'karen', 'victoria', 'serena', 'aria',
            'jenny', 'michelle', 'monica', 'fiona', 'tessa', 'moira', 'anna', 'allison', 'ava',
            'female', 'woman', 'kate', 'nicky', 'sonia', 'libby', 'natasha', 'clara', 'emily',
            'olivia', 'sara', 'linda', 'eva', 'catherine', 'salli', 'joanna', 'kendra', 'kimberly'];
        var MALE = ['david', 'mark', 'guy', 'alex', 'daniel', 'fred', 'tom', 'thomas', 'james',
            'george', 'oliver', 'arthur', 'rishi', 'ryan', 'eric', 'steffan', 'roger', 'aaron',
            'richard', 'sean', 'male', 'matthew', 'brian', 'christopher', 'liam', 'william',
            'andrew', 'joey', 'justin', 'stephen'];
        var i;
        for (i = 0; i < FEMALE.length; i++) { if (n.indexOf(FEMALE[i]) >= 0) return 'female'; }
        for (i = 0; i < MALE.length; i++) { if (n.indexOf(MALE[i]) >= 0) return 'male'; }
        return '';
    },

    // 挑一对音色：优先同一口音的 女 + 男
    _pickDialogueVoices() {
        var self = this;
        var all = (speechSynthesis.getVoices() || []).filter(function (v) {
            return v.lang && /^en(-|_)/i.test(String(v.lang));
        });

        if (!all.length) {
            // 一个英语音色都没有：只能靠音高区分
            return [
                { voice: null, lang: 'en-US', pitch: 0.8 },
                { voice: null, lang: 'en-US', pitch: 1.25 }
            ];
        }

        // 国内网络下 Google 的在线语音基本连不上，本地音色优先
        var localOnly = all.filter(function (v) { return !/google/i.test(v.name || ''); });
        var pool = localOnly.length ? localOnly : all;

        var rank = function (v) {
            var l = String(v.lang || '').toLowerCase().replace('_', '-');
            if (l === 'en-us') return 0;
            if (l === 'en-gb') return 1;
            if (l === 'en-au' || l === 'en-ca' || l === 'en-ie' || l === 'en-nz') return 2;
            return 3;
        };
        pool.sort(function (a, b) { return rank(a) - rank(b); });

        // 按口音分组，优先在同一口音里凑「一女一男」
        var groups = {};
        var orderKeys = [];
        pool.forEach(function (v) {
            var l = String(v.lang || '').toLowerCase().replace('_', '-');
            if (!groups[l]) { groups[l] = []; orderKeys.push(l); }
            groups[l].push(v);
        });

        for (var g = 0; g < orderKeys.length; g++) {
            var arr = groups[orderKeys[g]];
            var female = null, male = null;
            for (var i = 0; i < arr.length; i++) {
                var gd = self._guessGender(arr[i]);
                if (gd === 'female' && !female) female = arr[i];
                if (gd === 'male' && !male) male = arr[i];
                if (female && male) break;
            }
            if (female && male) {
                console.log('[TTS] 对话双音色：A=' + female.name + ' / B=' + male.name);
                return [
                    { voice: female, lang: female.lang, pitch: 1 },
                    { voice: male, lang: male.lang, pitch: 1 }
                ];
            }
        }

        // 凑不出男女对 → 用两个不同音色 + 轻微音高差
        var first = pool[0];
        var second = null;
        for (var j = 0; j < pool.length; j++) {
            if (pool[j].name !== first.name) { second = pool[j]; break; }
        }
        if (second) {
            console.log('[TTS] 对话双音色（同类）：A=' + first.name + ' / B=' + second.name);
            return [
                { voice: first, lang: first.lang, pitch: 0.92 },
                { voice: second, lang: second.lang, pitch: 1.08 }
            ];
        }

        // 只有一种音色 → 纯靠音高分开（0.8 低沉当男声，1.25 明亮当女声）
        console.log('[TTS] 仅一种英语音色，改用音高区分：' + first.name);
        return [
            { voice: first, lang: first.lang, pitch: 0.8 },
            { voice: first, lang: first.lang, pitch: 1.25 }
        ];
    },

    // 把文本按句子切成 <=180 字符的块，规避 Chrome 长文本 15 秒自动停止
    _splitChunks(text) {
        var parts = text.replace(/\s+/g, ' ').match(/[^.!?。！？]+[.!?。！？]*/g) || [text];
        var chunks = [];
        var cur = '';
        for (var i = 0; i < parts.length; i++) {
            // 单句超长时硬切兜底
            if (parts[i].length > 180) {
                if (cur.trim()) { chunks.push(cur.trim()); cur = ''; }
                for (var j = 0; j < parts[i].length; j += 180) {
                    chunks.push(parts[i].substring(j, j + 180).trim());
                }
                continue;
            }
            if ((cur + parts[i]).length > 180 && cur) {
                chunks.push(cur.trim());
                cur = parts[i];
            } else {
                cur += parts[i];
            }
        }
        if (cur.trim()) chunks.push(cur.trim());
        return chunks.length ? chunks : [text];
    },

    // 顺序朗读分块；isFirst 为 true 时做语音列表兜底加载
    _speakNext(lang, rate, isFirst) {
        if (!this._chunks || this._chunks.length === 0) return;
        var chunk = this._chunks.shift();

        // 现场兜底取语音列表（首次或为空时）
        if (isFirst) {
            this._loadVoices();
            if (!this._voices.length && typeof speechSynthesis.getVoices === 'function') {
                // 再给一次异步机会（部分浏览器首次调用返回空）
                var self = this;
                var vs = speechSynthesis.getVoices();
                if (vs && vs.length) { self._voices = vs; }
            }
        }

        var u = new SpeechSynthesisUtterance(chunk);
        u.lang = lang;
        u.rate = rate;

        // 尝试匹配对应语言的语音；找不到就不设置 voice（用系统默认）
        var voice = this._voices.find(v => v.lang === lang)
            || this._voices.find(v => v.lang && v.lang.indexOf(lang.split('-')[0]) === 0);
        if (voice) u.voice = voice;
        else if (this._preferredVoice) u.voice = this._preferredVoice;

        var self = this;
        u.onstart = () => {
            self._isPlaying = true;
            self._isPaused = false;
            self._updateBar('playing');
        };

        u.onend = () => {
            if (self._chunks && self._chunks.length > 0 && self._isPlaying !== false) {
                self._speakNext(lang, rate, false);
            } else {
                self._isPlaying = false;
                self._isPaused = false;
                self._updateBar('ended');
            }
        };

        u.onerror = (e) => {
            // interrupted/canceled 是主动停止，不算错误；其余跳到下一块
            var et = e && e.error;
            if (et === 'interrupted' || et === 'canceled') {
                self._isPlaying = false;
                self._chunks = [];
                self._updateBar('ended');
                return;
            }
            if (self._chunks && self._chunks.length > 0) {
                self._speakNext(lang, rate, false);
            } else {
                self._isPlaying = false;
                self._updateBar('ended');
            }
        };

        this._utterance = u;
        speechSynthesis.speak(u);
        // 兜底：如果合成器卡在 paused 状态，强制恢复
        try { speechSynthesis.resume(); } catch (e) { /* ignore */ }
    },

    // 暂停/恢复
    togglePause() {
        if (!this._isPlaying) return;
        if (this._isPaused) {
            speechSynthesis.resume();
            this._isPaused = false;
            this._updateBar('playing');
        } else {
            speechSynthesis.pause();
            this._isPaused = true;
            this._updateBar('paused');
        }
    },

    // 停止
    stop() {
        this._dlgToken++;
        this._dlgState = null;
        this._chunks = [];
        speechSynthesis.cancel();
        this._isPlaying = false;
        this._isPaused = false;
        this._currentText = '';
        this._hideBar();
    },

    // 设置语速
    setRate(rate) {
        this._rate = rate;
        // 如果正在播放，重新开始
        if (this._isPlaying) {
            this.speak(); // 不传 text，继续朗读 _currentText
        }
    },

    // 设置语言
    setLang(lang) {
        this._voiceLang = lang;
        if (this._isPlaying) {
            this.speak();
        }
    },

    // 获取可用英音/美音列表
    getEnglishVoices() {
        return this._voices.filter(v => v.lang.startsWith('en'));
    },

    // ============ 浮动控制条 ============
    _ensureBar() {
        if (this._bar) return this._bar;

        var bar = document.createElement('div');
        bar.className = 'tts-control-bar';
        bar.innerHTML = ''
            + '<div class="tts-bar-inner">'
            + '  <div class="tts-bar-info">'
            + '    <i class="fas fa-volume-up tts-bar-icon"></i>'
            + '    <span class="tts-bar-status">朗读中...</span>'
            + '  </div>'
            + '  <div class="tts-bar-controls">'
            + '    <select class="tts-bar-lang" onchange="TTS.setLang(this.value)">'
            + '      <option value="en-GB">英音</option>'
            + '      <option value="en-US">美音</option>'
            + '    </select>'
            + '    <div class="tts-bar-speed">'
            + '      <span class="tts-speed-label">语速</span>'
            + '      <select class="tts-bar-speed-sel" onchange="TTS.setRate(parseFloat(this.value))">'
            + '        <option value="0.75">0.75× 慢</option>'
            + '        <option value="1">1.0× 标准</option>'
            + '        <option value="1.25">1.25× 快</option>'
            + '      </select>'
            + '    </div>'
            + '    <button class="tts-bar-btn tts-btn-pause" onclick="TTS.togglePause()"><i class="fas fa-pause"></i></button>'
            + '    <button class="tts-bar-btn tts-btn-stop" onclick="TTS.stop()"><i class="fas fa-stop"></i></button>'
            + '  </div>'
            + '</div>';

        // 样式
        var style = document.createElement('style');
        if (!document.getElementById('tts-bar-style')) {
            style.id = 'tts-bar-style';
            style.textContent = ''
                + '.tts-control-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fff;box-shadow:0 -2px 20px rgba(0,0,0,0.12);border-top:2px solid #6366f1;transform:translateY(100%);transition:transform 0.3s ease;}'
                + '.tts-control-bar.tts-visible{transform:translateY(0);}'
                + '.tts-bar-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:12px 20px;gap:16px;flex-wrap:wrap;}'
                + '.tts-bar-info{display:flex;align-items:center;gap:8px;}'
                + '.tts-bar-icon{color:#6366f1;font-size:1.2rem;animation:ttsPulse 1.5s ease-in-out infinite;}'
                + '@keyframes ttsPulse{0%,100%{opacity:1}50%{opacity:0.5}}'
                + '.tts-bar-status{font-size:0.9rem;color:#333;font-weight:500;}'
                + '.tts-bar-controls{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}'
                + '.tts-bar-lang{padding:5px 10px;border:1px solid #ddd;border-radius:6px;font-size:0.82rem;background:#f8f8f8;cursor:pointer;}'
                + '.tts-bar-speed{display:flex;align-items:center;gap:6px;}'
                + '.tts-speed-label{font-size:0.78rem;color:#666;}'
                + '.tts-bar-speed-sel{padding:3px 7px;border:1px solid #ddd;border-radius:6px;font-size:0.78rem;background:#f8f8f8;cursor:pointer;color:#333;}'
                + '.tts-bar-btn{border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.9rem;transition:all 0.2s;}'
                + '.tts-btn-pause{background:#f0f0f0;color:#333;}'
                + '.tts-btn-pause:hover{background:#e0e0e0;}'
                + '.tts-btn-stop{background:#fee2e2;color:#dc2626;}'
                + '.tts-btn-stop:hover{background:#fecaca;}'
                + '@media(max-width:768px){.tts-bar-speed-sel{font-size:0.72rem;}.tts-bar-lang{font-size:0.75rem;}}';
            document.head.appendChild(style);
        }

        document.body.appendChild(bar);
        this._bar = bar;
        return bar;
    },

    _showBar() {
        var bar = this._ensureBar();
        // 适配移动端底部导航：如果有底部导航栏，控制条往上挪
        var bottomNav = document.querySelector('.mobile-bottom-nav');
        if (bottomNav && !bottomNav.classList.contains('hidden') && window.innerWidth <= 768) {
            bar.style.bottom = '60px';
        } else {
            bar.style.bottom = '0';
        }
        setTimeout(() => bar.classList.add('tts-visible'), 10);
    },

    _hideBar() {
        if (this._bar) {
            this._bar.classList.remove('tts-visible');
            setTimeout(() => {
                if (this._bar && !this._isPlaying) {
                    this._bar.remove();
                    this._bar = null;
                }
            }, 300);
        }
    },

    _updateBar(state) {
        if (!this._bar && state === 'playing') {
            this._showBar();
            return;
        }
        if (!this._bar) return;

        var statusEl = this._bar.querySelector('.tts-bar-status');
        var pauseBtn = this._bar.querySelector('.tts-btn-pause');
        var icon = this._bar.querySelector('.tts-bar-icon');

        if (state === 'playing') {
            if (statusEl) statusEl.textContent = '朗读中...';
            if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            if (icon) icon.style.animation = 'ttsPulse 1.5s ease-in-out infinite';
        } else if (state === 'paused') {
            if (statusEl) statusEl.textContent = '已暂停';
            if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (icon) icon.style.animation = 'none';
        } else if (state === 'ended') {
            this._hideBar();
        }
    },

    // 更新速度显示
    _updateSpeedDisplay() {
        if (!this._bar) return;
        var sel = this._bar.querySelector('.tts-bar-speed-sel');
        if (sel) sel.value = String(this._rate);
    },

    // 重写 setRate 以更新显示
    setRate(rate) {
        this._rate = rate;
        try { localStorage.setItem('el_speech_rate', String(rate)); } catch (e) {}
        this._updateSpeedDisplay();
        if (this._isPlaying) {
            this.speak();
        }
    },

    // 读取全站统一语速（听力、对话朗读、口语示范共用）
    getRate() {
        try {
            var r = parseFloat(localStorage.getItem('el_speech_rate'));
            if (!isNaN(r) && r >= 0.5 && r <= 1.5) return r;
        } catch (e) {}
        return this._rate;
    },

    // 重写 setLang 以更新选择框
    setLang(lang) {
        this._voiceLang = lang;
        if (this._isPlaying) {
            this.speak();
        }
    }
};

// 页面加载时初始化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        TTS.init();
    });
}
