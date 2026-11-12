/* ============================================
   对话音频播放器
   优先播放预合成的 mp3（男女声已混好、停顿精确），
   音频缺失时自动回落到浏览器语音合成（TTS.speakDialogue）。

   与 TTS 的区别：
   - 播放 mp3 时暂停/继续是真正的断点续播（原生 audio.pause）
   - 语速用 playbackRate，变速不变调
   ============================================ */

const DialoguePlayer = {
    _audio: null,
    _mode: null,        // 'audio' | 'tts' | null
    _paused: false,
    _onEnd: null,
    _opts: null,
    _token: 0,

    _el() {
        if (!this._audio) {
            const a = new Audio();
            a.preload = 'auto';
            this._audio = a;
        }
        return this._audio;
    },

    // opts: { src, turns, rate, onEnd }
    //   src   预合成音频地址，没有就走 TTS
    //   turns 回落用的对话内容 [{ text, speaker }]
    play(opts) {
        const self = this;
        this.stop();
        opts = opts || {};
        this._opts = opts;
        this._onEnd = opts.onEnd || null;
        const token = ++this._token;

        if (!opts.src) return this._useTTS(token);

        const a = this._el();
        let settled = false;

        const fail = () => {
            if (settled || token !== self._token) return;
            settled = true;
            // 音频不存在 / 解码失败 / 被浏览器拦截 → 改用语音合成
            console.warn('[DialogPlayer] 音频不可用，回落到语音合成:', opts.src);
            self._useTTS(token);
        };

        a.onerror = fail;
        a.onended = () => {
            if (token !== self._token) return;
            self._mode = null;
            self._paused = false;
            if (self._onEnd) self._onEnd();
        };

        a.src = opts.src;
        a.playbackRate = this._normRate(opts.rate);

        this._mode = 'audio';
        this._paused = false;

        const p = a.play();
        if (p && p.catch) p.catch(fail);
        return true;
    },

    _normRate(r) {
        const v = parseFloat(r);
        if (isNaN(v) || v < 0.5 || v > 2) return 1;
        return v;
    },

    _useTTS(token) {
        const self = this;
        const opts = this._opts || {};
        if (typeof TTS === 'undefined' || typeof TTS.speakDialogue !== 'function') {
            if (self._onEnd) self._onEnd();
            return;
        }
        this._mode = 'tts';
        this._paused = false;
        TTS.speakDialogue(opts.turns || [], {
            rate: opts.rate,
            onEnd: () => {
                if (token !== self._token) return;
                self._mode = null;
                if (self._onEnd) self._onEnd();
            }
        });
    },

    pause() {
        if (!this._mode || this._paused) return false;
        if (this._mode === 'tts') {
            if (typeof TTS === 'undefined' || !TTS.pauseDialogue) return false;
            if (!TTS.pauseDialogue()) return false;
        } else {
            try { this._el().pause(); } catch (e) { return false; }
        }
        this._paused = true;
        return true;
    },

    resume() {
        if (!this._mode || !this._paused) return false;
        if (this._mode === 'tts') {
            if (typeof TTS === 'undefined' || !TTS.resumeDialogue) return false;
            if (!TTS.resumeDialogue()) return false;
            this._paused = false;
            return true;
        }
        const a = this._el();
        const p = a.play();
        if (p && p.catch) {
            p.catch(() => {
                // 续播失败：从头播一次，别让按钮卡在"继续"
                if (this._mode === 'audio') {
                    a.currentTime = 0;
                    a.play().catch(() => {});
                }
            });
        }
        this._paused = false;
        return true;
    },

    // 改语速：音频模式下立即生效且不打断，返回 true；
    // 语音合成模式无法中途变速，返回 false（调用方需重播）
    setRate(rate) {
        const v = this._normRate(rate);
        if (this._opts) this._opts.rate = v;
        if (this._mode !== 'audio') return false;
        try {
            this._el().playbackRate = v;
            return true;
        } catch (e) {
            return false;
        }
    },

    stop() {
        this._token++;
        this._mode = null;
        this._paused = false;
        this._onEnd = null;
        if (typeof TTS !== 'undefined' && TTS.stop) TTS.stop();
        if (this._audio) {
            try {
                this._audio.pause();
                this._audio.currentTime = 0;
            } catch (e) {}
        }
    },

    // 预取音频到浏览器缓存。国内访问 GitHub Pages 首字节常有 1~3 秒延迟，
    // 进页面/悬停时先拉下来，点播放就能立刻出声。
    preload(src) {
        if (!src || this._preloaded === src) return;
        this._preloaded = src;
        if (typeof fetch !== 'function') return;
        try {
            fetch(src, { cache: 'force-cache' }).catch(function () {});
        } catch (e) { /* 忽略 */ }
    },

    isPlaying() {
        return !!this._mode && !this._paused;
    },

    isPaused() {
        return !!this._mode && this._paused;
    }
};
