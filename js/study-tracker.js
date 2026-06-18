/* ============================================
   学习时长追踪模块
   - 追踪页面活跃时间（切到后台自动暂停）
   - 每30秒同步一次累计时长到 Supabase progress 表
   - 页面关闭/刷新时做最终同步
   ============================================ */

const StudyTracker = {
    totalSeconds: 0,       // 本地累计秒数
    sessionSeconds: 0,     // 本次会话秒数
    intervalId: null,
    lastSyncSeconds: 0,    // 上次同步时的累计秒数
    isActive: true,

    /* ---------- 初始化 ---------- */
    init() {
        // 监听页面可见性变化（切标签页/锁屏时暂停计时）
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // 页面关闭/刷新前同步
        window.addEventListener('beforeunload', () => {
            this._syncNow(true);
        });

        // 从云端加载已有的累计时长
        this._loadFromCloud();

        // 开始计时
        this.resume();
    },

    /* ---------- 开始计时 ---------- */
    resume() {
        if (this.intervalId) return;
        this.isActive = true;
        console.log('[StudyTracker] 开始计时，当前累计:', this.totalSeconds, '秒');
        this.intervalId = setInterval(() => {
            if (this.isActive) {
                this.sessionSeconds++;
                this.totalSeconds++;
                // 每30秒同步一次
                if (this.totalSeconds - this.lastSyncSeconds >= 30) {
                    this._syncNow(false);
                }
            }
        }, 1000);
    },

    /* ---------- 暂停计时 ---------- */
    pause() {
        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('[StudyTracker] 暂停计时，本次会话:', this.sessionSeconds, '秒');
        // 暂停时立即同步
        this._syncNow(false);
    },

    /* ---------- 同步到 Supabase ---------- */
    async _syncNow(useBeacon) {
        if (!SupabaseAuth.currentUsername) return;
        if (this.totalSeconds === this.lastSyncSeconds) return;

        const data = {
            username: SupabaseAuth.currentUsername,
            total_study_seconds: this.totalSeconds,
            last_update: new Date().toISOString()
        };

        this.lastSyncSeconds = this.totalSeconds;

        if (useBeacon && navigator.sendBeacon) {
            // 页面关闭时用 sendBeacon 保证送达
            const url = SUPABASE_URL + '/rest/v1/progress?on_conflict=username';
            navigator.sendBeacon(url, JSON.stringify(data, null, 0));
            return;
        }

        try {
            const { error } = await db
                .from('progress')
                .upsert([data], {
                    onConflict: 'username',
                    ignoreDuplicates: false
                });

            if (error) {
                // 如果字段还不存在，静默处理
                if (error.code !== 'PGRST204' && error.code !== '42703') {
                    console.warn('[StudyTracker] 同步失败：', error.message);
                }
            }
        } catch (e) {
            // 网络错误静默处理
        }
    },

    /* ---------- 从云端加载已有累计时长 ---------- */
    async _loadFromCloud() {
        if (!SupabaseAuth.currentUsername) return;
        try {
            const { data, error } = await db
                .from('progress')
                .select('total_study_seconds')
                .eq('username', SupabaseAuth.currentUsername)
                .single();

            if (data && data.total_study_seconds != null) {
                this.totalSeconds = data.total_study_seconds;
                this.lastSyncSeconds = data.total_study_seconds;
                console.log('[StudyTracker] 已加载累计学习时长：', this._formatTime(this.totalSeconds));
            }
        } catch (e) {
            // 字段不存在或网络错误，从0开始
        }
    },

    /* ---------- 格式化时间 ---------- */
    _formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}小时${m}分`;
        if (m > 0) return `${m}分${s}秒`;
        return `${s}秒`;
    }
};
