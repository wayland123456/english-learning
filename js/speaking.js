/* ============================================
   口语练习模块
   ============================================ */

const Speaking = {
    currentIndex: 0,
    isRecording: false,
    recognition: null,
    lastScore: null,
    dialogueCompleted: 0,
    currentDialogue: 1,
    userSpeechResult: '',

    init() {
        this.currentIndex = 0;
        this.dialogueCompleted = 0;
        this.currentDialogue = 1;
        this.renderSentence();
    },

    renderSentence() {
        const container = document.getElementById('speakingContainer');
        const progress = SupabaseAuth.getProgress();
        const total = DATA.speakingSentences.length;

        const completedCount = progress.speaking.filter(s => typeof s === 'number').length;
        if (completedCount >= total && this.dialogueCompleted < 2) {
            this.currentDialogue = this.dialogueCompleted + 1;
            this.renderDialogue();
            return;
        }
        if (completedCount >= total && this.dialogueCompleted >= 2) {
            this.renderComplete();
            return;
        }

        const sentence = DATA.speakingSentences[this.currentIndex];

        container.innerHTML = `
            <div class="speaking-step-indicator">
                ${DATA.speakingSentences.map((_, i) => {
                    let cls = 'step-num';
                    if (progress.speaking.includes(i)) cls += ' completed';
                    if (i === this.currentIndex) cls += ' active';
                    return `<div class="${cls}">${i + 1}</div>`;
                }).join('')}
            </div>
            <div class="speaking-card">
                <span class="step-label">第 ${this.currentIndex + 1} / ${total} 句</span>
                <div class="speaking-sentence" id="currentSentence">${sentence.english}</div>
                <div class="speaking-translation">${sentence.chinese}</div>
                <div style="color:var(--text-light);font-size:0.85rem;margin-bottom:1.5rem;">
                    <i class="fas fa-volume-up"></i> ${sentence.phonetic}
                </div>
                <div class="speaking-actions" id="speakingActions">
                    <button class="btn-play" onclick="Speaking.playSentence()">
                        <i class="fas fa-play"></i> 听标准读音
                    </button>
                </div>
                <div id="speakingResult"></div>
            </div>
        `;

        this.lastScore = null;
        this.userSpeechResult = '';
    },

    playSentence() {
        const sentence = DATA.speakingSentences[this.currentIndex];
        if (!('speechSynthesis' in window)) {
            App.toast('您的浏览器不支持语音合成', 'error');
            return;
        }

        // 移除旧的跟读按钮（防止重复）
        var oldBtn = document.getElementById('btnRecord');
        if (oldBtn) oldBtn.remove();

        const utterance = new window.SpeechSynthesisUtterance(sentence.english);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        const idx = this.currentIndex;
        const addRecordButton = () => {
            if (document.getElementById('btnRecord') || this.isRecording) return;
            if (this.currentIndex !== idx) return;
            const el = document.getElementById('speakingActions');
            if (el) {
                el.insertAdjacentHTML('beforeend', `
                    <button class="btn-record" id="btnRecord" onclick="Speaking.startRecording()">
                        <i class="fas fa-microphone"></i> 开始跟读
                    </button>
                `);
            }
        };

        utterance.onend = addRecordButton;
        // iOS Safari 可能不触发 onend，用定时器兜底
        const wordCount = sentence.english.trim().split(/\s+/).length;
        const estMs = Math.max(4000, wordCount * 800 + 2000);
        setTimeout(addRecordButton, estMs);
    },

    async startRecording() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            App.toast('您的浏览器不支持语音识别，请使用 Chrome 浏览器', 'error');
            return;
        }

        // 如果正在录音，停止
        if (this.isRecording && this.recognition) {
            this.stopRecording();
            return;
        }

        // iOS Safari 必须先通过 getUserMedia 触发麦克风权限弹窗
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(t => t.stop());
            } catch (permErr) {
                console.error('麦克风权限被拒绝:', permErr);
                App.toast('请在 iPhone 设置 → Safari → 麦克风 中允许访问', 'error');
                return;
            }
        }

        const btn = document.getElementById('btnRecord');
        if (btn) {
            btn.classList.add('recording');
            btn.innerHTML = '<i class="fas fa-stop"></i> 正在录音...点击停止';
            btn.onclick = () => this.stopRecording();
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 3;
            // iOS Safari 忽略 continuous 属性，始终在静音后自动停止
            this.recognition.continuous = false;
        } catch (e) {
            App.toast('启动语音识别失败，请刷新页面试试', 'error');
            this._resetRecordBtn();
            return;
        }

        this.isRecording = true;
        this.userSpeechResult = '';
        this._scored = false;

        this.recognition.onresult = (event) => {
            const results = event.results;
            if (!results || results.length === 0) return;

            // 取最新一条转录结果
            const lastIdx = results.length - 1;
            const alt = results[lastIdx] && results[lastIdx][0];
            if (alt && alt.transcript) {
                this.userSpeechResult = alt.transcript.trim();
                // 拿到结果立即打分，防止 onend 不触发
                if (!this._scored) {
                    this._scored = true;
                    this.scoreSpeech();
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isRecording = false;
            this._resetRecordBtn();
            if (event.error === 'no-speech') {
                App.toast('未检测到语音，请再试一次', 'info');
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                App.toast('请在 iPhone 设置 → Safari → 麦克风 中允许访问', 'error');
            } else if (event.error === 'audio-capture') {
                App.toast('无法访问麦克风，请检查系统权限设置', 'error');
            } else if (event.error === 'network') {
                App.toast('网络异常，请检查网络连接', 'error');
            } else {
                App.toast('语音识别出错：' + event.error, 'error');
            }
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this._resetRecordBtn();
            // onresult 没触发时的兜底打分
            if (!this._scored && this.userSpeechResult) {
                this._scored = true;
                this.scoreSpeech();
            }
        };

        try {
            this.recognition.start();
        } catch (e) {
            App.toast('启动录音失败，请点击允许麦克风权限', 'error');
            this.isRecording = false;
            this._resetRecordBtn();
        }
    },

    _resetRecordBtn() {
        const btn = document.getElementById('btnRecord');
        if (!btn) return;
        btn.classList.remove('recording');
        btn.innerHTML = '<i class="fas fa-microphone"></i> 重新跟读';
        btn.onclick = () => this.startRecording();
    },

    stopRecording() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // ignore
            }
        }
    },

    scoreSpeech() {
        const sentence = DATA.speakingSentences[this.currentIndex];
        const target = sentence.english.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/);
        const spoken = this.userSpeechResult.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/);

        let matchCount = 0;
        const usedIndices = new Set();

        for (const word of spoken) {
            const idx = target.findIndex((t, i) => t === word && !usedIndices.has(i));
            if (idx !== -1) {
                matchCount++;
                usedIndices.add(idx);
            }
        }

        const lengthPenalty = Math.max(0, 1 - Math.abs(target.length - spoken.length) / target.length * 0.3);
        const matchRate = matchCount / target.length;
        const score = Math.round(Math.min(100, matchRate * lengthPenalty * 100));

        this.lastScore = score;

        let scoreClass, scoreLabel;
        if (score >= 90) { scoreClass = 'score-excellent'; scoreLabel = '优秀！发音很棒！'; }
        else if (score >= 75) { scoreClass = 'score-good'; scoreLabel = '良好，继续保持！'; }
        else if (score >= 60) { scoreClass = 'score-fair'; scoreLabel = '还不错，再练练！'; }
        else { scoreClass = 'score-poor'; scoreLabel = '加油，多听几遍再试试！'; }

        // 音效反馈
        if (score >= 75) SoundFx.correct();
        else SoundFx.wrong();

        const resultDiv = document.getElementById('speakingResult');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="speaking-result">
                    <div class="score-circle ${scoreClass}">${score}</div>
                    <div class="score-label">${scoreLabel}</div>
                    <div style="margin-top:1rem;text-align:left;">
                        <p><strong>原句：</strong>${sentence.english}</p>
                        <p><strong>你的发音：</strong>${this.userSpeechResult}</p>
                    </div>
                    <button class="btn-next-sentence" onclick="Speaking.nextSentence()">
                        <i class="fas fa-arrow-right"></i> ${this.currentIndex < DATA.speakingSentences.length - 1 ? '下一句' : '进入对话练习'}
                    </button>
                </div>
            `;
        }

        const progress = SupabaseAuth.getProgress();
        if (!progress.speaking.includes(this.currentIndex)) {
            progress.speaking.push(this.currentIndex);
            SupabaseAuth.saveProgress(progress);
            App.updateProgress();
        }
    },

    nextSentence() {
        this.currentIndex++;
        if (this.currentIndex >= DATA.speakingSentences.length) {
            this.renderDialogue();
        } else {
            this.renderSentence();
        }
    },

    renderDialogue() {
        const dialogues = [DATA.dialogueExercise, DATA.dialogueExercise2];
        const dialogueIdx = this.currentDialogue - 1;
        const dialogue = dialogues[dialogueIdx] || DATA.dialogueExercise;
        const container = document.getElementById('speakingContainer');

        container.innerHTML = `
            <div style="text-align:center;margin-bottom:2rem;">
                <span class="step-label" style="display:inline-block;padding:6px 20px;background:rgba(99,102,241,0.1);color:var(--primary);border-radius:20px;font-weight:600;">
                    🎯 对话填空练习 (${this.currentDialogue}/2)
                </span>
                <h2 style="margin-top:1rem;">${dialogue.title}</h2>
                <p style="color:var(--text-light);">请根据上下文填写空缺的单词</p>
            </div>
            <div class="dialogue-card">
                ${dialogue.lines.map((line, i) => {
                    const speakerClass = line.speaker === 'A' ? 'speaker-a' : 'speaker-b';
                    let textHtml = line.text;
                    line.blanks.forEach(blank => {
                        textHtml = textHtml.replace(
                            `{${blank.index}}`,
                            `<span class="dialogue-blank" id="dialogue-blank-${i}">
                                <input type="text" placeholder="填入单词" id="dialogue-input-${i}" autocomplete="off">
                            </span>`
                        );
                    });
                    return `
                        <div class="dialogue-line ${speakerClass}">
                            <div class="dialogue-avatar">${line.speaker}</div>
                            <div class="dialogue-text">${textHtml}</div>
                        </div>
                    `;
                }).join('')}
                <button class="btn-check-dialogue" onclick="Speaking.checkDialogue()">
                    <i class="fas fa-check-circle"></i> 检查答案
                </button>
                <div id="dialogueResult"></div>
            </div>
        `;
    },

    checkDialogue() {
        const dialogues = [DATA.dialogueExercise, DATA.dialogueExercise2];
        const dialogueIdx = this.currentDialogue - 1;
        const dialogue = dialogues[dialogueIdx] || DATA.dialogueExercise;
        let correct = 0;
        const total = dialogue.lines.length;

        dialogue.lines.forEach((line, i) => {
            const input = document.getElementById(`dialogue-input-${i}`);
            const blank = document.getElementById(`dialogue-blank-${i}`);
            if (!input || !blank) return;

            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = line.blanks[0].answer.toLowerCase();

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

        const resultDiv = document.getElementById('dialogueResult');
        if (resultDiv) {
            const percentage = Math.round(correct / total * 100);
            if (percentage === 100) {
                SoundFx.correct();
                resultDiv.innerHTML = `
                    <div style="margin-top:1rem;padding:1.5rem;background:rgba(16,185,129,0.1);border-radius:12px;text-align:center;">
                        <div style="font-size:2rem;margin-bottom:0.5rem;">🎉</div>
                        <h3 style="color:var(--accent);">全部正确！</h3>
                        <p>${this.currentDialogue < 2 ? '太棒了！还有一组对话等你挑战！' : '太棒了，你已经掌握了旅游对话的关键表达！'}</p>
                        ${this.currentDialogue < 2 ? `<button class="btn-next-sentence" onclick="Speaking.goNextDialogue()" style="margin-top:1rem;">
                            <i class="fas fa-arrow-right"></i> 进入下一组对话
                        </button>` : ''}
                    </div>
                `;
                this.dialogueCompleted = this.currentDialogue;
                if (this.dialogueCompleted >= 2) {
                    App.showReward('你完成了所有口语练习和对话填空！');
                    const progress = SupabaseAuth.getProgress();
                    if (!progress.speaking.includes('dialogue')) {
                        progress.speaking.push('dialogue');
                        SupabaseAuth.saveProgress(progress);
                    }
                }
            } else {
                SoundFx.wrong();
                resultDiv.innerHTML = `
                    <div style="margin-top:1rem;padding:1.5rem;background:rgba(245,158,11,0.08);border-radius:12px;text-align:center;">
                        <p>答对了 <strong>${correct}</strong>/${total} 题，修改错误的答案后再试一次吧！</p>
                    </div>
                `;
            }
        }
    },

    goNextDialogue() {
        this.currentDialogue = 2;
        this.renderDialogue();
    },

    renderComplete() {
        const container = document.getElementById('speakingContainer');
        container.innerHTML = `
            <div class="speaking-card" style="padding:3rem;">
                <div style="font-size:4rem;margin-bottom:1rem;">🏆</div>
                <h2>口语练习已全部完成！</h2>
                <p style="color:var(--text-light);margin:1rem 0;">你已经完成了所有句子跟读和对话填空，继续其他模块的学习吧！</p>
                <button class="btn-next-sentence" onclick="Speaking.init()">
                    <i class="fas fa-redo"></i> 重新练习
                </button>
            </div>
        `;
    }
};
