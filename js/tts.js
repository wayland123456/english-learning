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
    _rate: 0.9,
    _voiceLang: 'en-GB',
    _bar: null,

    // 初始化：加载可用语音列表
    init() {
        if (!('speechSynthesis' in window)) {
            console.warn('[TTS] 浏览器不支持 Web Speech API');
            return;
        }
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
            + '      <input type="range" min="0.5" max="1.5" step="0.05" value="0.9" class="tts-speed-slider" oninput="TTS.setRate(parseFloat(this.value))">'
            + '      <span class="tts-speed-value">0.9x</span>'
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
                + '.tts-speed-slider{width:80px;accent-color:#6366f1;}'
                + '.tts-speed-value{font-size:0.78rem;color:#6366f1;font-weight:600;min-width:32px;}'
                + '.tts-bar-btn{border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.9rem;transition:all 0.2s;}'
                + '.tts-btn-pause{background:#f0f0f0;color:#333;}'
                + '.tts-btn-pause:hover{background:#e0e0e0;}'
                + '.tts-btn-stop{background:#fee2e2;color:#dc2626;}'
                + '.tts-btn-stop:hover{background:#fecaca;}'
                + '@media(max-width:768px){.tts-bar-speed{display:none;}.tts-bar-lang{font-size:0.75rem;}}';
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
        var slider = this._bar.querySelector('.tts-speed-slider');
        var val = this._bar.querySelector('.tts-speed-value');
        if (slider) slider.value = this._rate;
        if (val) val.textContent = this._rate.toFixed(1) + 'x';
    },

    // 重写 setRate 以更新显示
    setRate(rate) {
        this._rate = rate;
        this._updateSpeedDisplay();
        if (this._isPlaying) {
            this.speak();
        }
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
