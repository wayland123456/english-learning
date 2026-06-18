/* ============================================
   Supabase 认证 & 进度模块（替换 auth.js）
   
   架构：
   - localStorage 作为本地缓存（同步读写，兼容现有模块）
   - Supabase 作为云端数据库（异步同步）
   - 登录时从 Supabase 加载到 localStorage
   - 保存时同时写 localStorage + Supabase
   ============================================ */

const SupabaseAuth = {
    currentUser: null,
    currentUsername: null,

    /* ---------- 初始化 ---------- */
    async init() {
        // 恢复登录状态
        const saved = localStorage.getItem('travelEdu_currentUser');
        if (saved) {
            try {
                const user = JSON.parse(saved);
                // 验证用户是否还存在于 Supabase
                const { data, error } = await db
                    .from('students')
                    .select('username, display_name, role')
                    .eq('username', user.username)
                    .single();
                if (data) {
                    this.currentUser = data;
                    this.currentUsername = data.username;
                    this.onLoginSuccess();
                    this._recordLogin();
                } else {
                    localStorage.removeItem('travelEdu_currentUser');
                }
            } catch (e) {
                localStorage.removeItem('travelEdu_currentUser');
            }
        }
    },

    /* ---------- 登录（核心方法） ---------- */
    async login(username, password) {
        console.log('[Auth] 尝试登录：', username);
        if (typeof db === 'undefined') {
            console.error('[Auth] Supabase 客户端未初始化！');
            return { success: false, message: '系统未就绪，请刷新页面重试' };
        }
        const { data, error } = await db
            .from('students')
            .select('username, display_name, role, password_hash')
            .eq('username', username.trim())
            .single();

        console.log('[Auth] 查询结果：', { data: data ? '有数据' : '无数据', error: error ? error.message : '无错误' });

        if (error || !data) {
            return { success: false, message: '用户名不存在' };
        }
        if (data.password_hash !== password) {
            return { success: false, message: '密码错误' };
        }

        this.currentUser = data;
        this.currentUsername = data.username;
        localStorage.setItem('travelEdu_currentUser', JSON.stringify(data));
        this.onLoginSuccess();
        this._recordLogin();
        return { success: true, message: `欢迎回来，${data.display_name || username}！` };
    },

    /* ---------- 注册 ---------- */

    async register(username, password, displayName, className) {
        // 用户名格式限制：只允许字母、数字、下划线
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, message: '用户名只能包含字母、数字和下划线' };
        }

        const { data: existing } = await db
            .from('students')
            .select('username')
            .eq('username', username.trim())
            .single();

        if (existing) {
            return { success: false, message: '用户名已存在' };
        }

        const { error } = await db
            .from('students')
            .insert([{
                username: username.trim(),
                password_hash: password,
                display_name: displayName || username.trim(),
                class_name: className,
                role: 'student'
            }]);

        if (error) {
            return { success: false, message: '注册失败：' + error.message };
        }

        return await this.login(username, password);
    },

    /* ---------- 退出 ---------- */
    logout() {
        this.currentUser = null;
        this.currentUsername = null;
        localStorage.removeItem('travelEdu_currentUser');
        document.getElementById('page-auth').classList.remove('hidden');
        document.getElementById('page-home').classList.add('hidden');
        document.getElementById('navUser').style.display = 'none';
        document.getElementById('navLinks').style.display = 'none';
        document.getElementById('navToggle').style.display = 'none';
        App.toast('已退出登录', 'info');
    },

    /* ---------- 登录成功 UI ---------- */
    onLoginSuccess() {
        document.getElementById('page-auth').classList.add('hidden');
        document.getElementById('page-home').classList.remove('hidden');
        document.getElementById('navUser').style.display = 'flex';
        document.getElementById('navLinks').style.display = 'flex';
        document.getElementById('navToggle').style.display = 'block';
        const user = this.currentUser;
        document.getElementById('navUsername').textContent = user.display_name || user.username;
        App.updateProgress();
        // 登录后从云端加载进度
        this.loadProgress();
        // 启动学习时长追踪
        if (typeof StudyTracker !== 'undefined') {
            StudyTracker.init();
        }
    },

    /* ---------- 获取进度（同步，从 localStorage 读） ---------- */
    getProgress() {
        if (!this.currentUsername) {
            return { resources: [], speaking: [], listening: null, vocabulary: [], grammar: null, sentences: [], writing: null };
        }
        const users = JSON.parse(localStorage.getItem('travelEdu_users') || '{}');
        const user = users[this.currentUsername];
        if (!user) return { resources: [], speaking: [], listening: null, vocabulary: [], grammar: null, sentences: [], writing: null };
        return user.progress || { resources: [], speaking: [], listening: null, vocabulary: [], grammar: null, sentences: [], writing: null };
    },

    /* ---------- 保存进度（同步写 localStorage + 异步写 Supabase） ---------- */
    saveProgress(progress) {
        if (!this.currentUsername) return;

        // 1. 同步写 localStorage（兼容现有模块）
        const users = JSON.parse(localStorage.getItem('travelEdu_users') || '{}');
        if (!users[this.currentUsername]) {
            users[this.currentUsername] = { progress: progress };
        } else {
            users[this.currentUsername].progress = progress;
        }
        localStorage.setItem('travelEdu_users', JSON.stringify(users));

        // 2. 异步写 Supabase（不阻塞 UI）
        this._syncToCloud(progress);
    },

    /* ---------- 异步同步到云端 ---------- */
    async _syncToCloud(progress) {
        if (!this.currentUsername) return;
        try {
            const { error } = await db
                .from('progress')
                .upsert([{
                    username: this.currentUsername,
                    resources: progress.resources || [],
                    speaking: progress.speaking || [],
                    listening: progress.listening || null,
                    vocabulary: progress.vocabulary || [],
                    grammar: progress.grammar || null,
                    sentences: progress.sentences || [],
                    writing: progress.writing || null,
                    last_update: new Date().toISOString()
                }], {
                    onConflict: 'username'
                });

            if (error) {
                console.error('[Supabase] 同步失败：', error);
            } else {
                console.log('[Supabase] 进度已同步');
            }
        } catch (e) {
            console.error('[Supabase] 网络错误：', e);
        }
    },

    /* ---------- 记录登录时间到 progress 表 ---------- */
    async _recordLogin() {
        if (!this.currentUsername) return;
        try {
            const now = new Date().toISOString();
            const { error } = await db
                .from('progress')
                .upsert([{
                    username: this.currentUsername,
                    last_login: now,
                    last_update: now
                }], {
                    onConflict: 'username',
                    ignoreDuplicates: false
                });

            if (error) {
                // 如果 last_login 字段还不存在（数据库未更新），静默失败
                if (error.code !== 'PGRST204' && error.code !== '42703') {
                    console.warn('[Auth] 记录登录时间失败：', error.message);
                }
            } else {
                console.log('[Auth] 登录时间已记录：', now);
            }
        } catch (e) {
            // 网络错误静默处理，不影响用户体验
        }
    },
    async loadProgress() {
        if (!this.currentUsername) return;
        try {
            const { data, error } = await db
                .from('progress')
                .select('resources, speaking, listening, vocabulary, grammar, sentences, writing')
                .eq('username', this.currentUsername)
                .single();

            if (data) {
                const progress = {
                    resources: data.resources || [],
                    speaking: data.speaking || [],
                    listening: data.listening || null,
                    vocabulary: data.vocabulary || [],
                    grammar: data.grammar || null,
                    sentences: data.sentences || [],
                    writing: data.writing || null
                };
                // 写入 localStorage
                const users = JSON.parse(localStorage.getItem('travelEdu_users') || '{}');
                if (!users[this.currentUsername]) {
                    users[this.currentUsername] = { progress: progress };
                } else {
                    users[this.currentUsername].progress = progress;
                }
                localStorage.setItem('travelEdu_users', JSON.stringify(users));
                App.updateProgress();
            }
        } catch (e) {
            console.warn('[Supabase] 加载进度失败：', e);
        }
    },

    /* ---------- 批量注册学生账号 ---------- */
    async batchRegister(studentList) {
        let created = 0, skipped = 0;
        for (const s of studentList) {
            const username = s.username.trim();
            const password = s.password || '123456';
            if (!username) continue;

            const { error } = await db
                .from('students')
                .insert([{
                    username: username,
                    password_hash: password,
                    display_name: s.name || username,
                    role: 'student'
                }]);

            if (error && error.code === '23505') {
                skipped++;
            } else if (!error) {
                created++;
            } else {
                console.warn('批量注册失败：', username, error.message);
                skipped++;
            }
        }
        return { created, skipped, total: studentList.length };
    },

    /* ---------- 修改密码 ---------- */
    showChangePassword() {
        document.getElementById('changePwdOverlay').classList.remove('hidden');
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('newPassword2').value = '';
    },
    closeChangePassword() {
        document.getElementById('changePwdOverlay').classList.add('hidden');
    },
    async handleChangePassword(e) {
        e.preventDefault();
        const oldPwd = document.getElementById('oldPassword').value;
        const newPwd = document.getElementById('newPassword').value;
        const newPwd2 = document.getElementById('newPassword2').value;

        if (newPwd !== newPwd2) {
            App.toast('两次新密码不一致', 'error');
            return;
        }
        if (newPwd.length < 4) {
            App.toast('新密码至少4位', 'error');
            return;
        }
        // 验证旧密码
        const { data, error } = await db
            .from('students')
            .select('password_hash')
            .eq('username', this.currentUsername)
            .single();

        if (error || !data || data.password_hash !== oldPwd) {
            App.toast('当前密码错误', 'error');
            return;
        }
        // 更新密码
        const { error: updateError } = await db
            .from('students')
            .update({ password_hash: newPwd })
            .eq('username', this.currentUsername);

        if (updateError) {
            App.toast('修改失败，请重试', 'error');
        } else {
            App.toast('密码修改成功！', 'success');
            this.closeChangePassword();
        }
    },

    /* ========== 以下为 HTML 兼容方法 ========== */

    /* ---------- 兼容旧接口 ---------- */
    reportProgress() {
        // saveProgress 已自动同步到云端，此方法保留兼容
    },

    /* ---------- 登录/注册 Tab 切换 ---------- */
    switchTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.auth-tab:${tab === 'login' ? 'first-child' : 'last-child'}`).classList.add('active');
        document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
    },

    /* ---------- 表单登录处理 ---------- */
    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!username || !password) {
            App.toast('请输入用户名和密码', 'error');
            return;
        }
        try {
            const result = await this.login(username, password);
            if (result.success) {
                App.toast(result.message, 'success');
            } else {
                App.toast(result.message, 'error');
            }
        } catch (err) {
            console.error('[Auth] 登录异常：', err);
            App.toast('登录失败：' + (err.message || '网络错误'), 'error');
        }
    },

    /* ---------- 表单注册处理 ---------- */
    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value.trim();
        const displayName = document.getElementById('regDisplayName').value.trim();
        const className = document.getElementById('regClass').value;
        const password = document.getElementById('regPassword').value;
        const password2 = document.getElementById('regPassword2').value;

        if (!displayName) {
            App.toast('请填写真实姓名', 'error');
            return;
        }
        if (!className) {
            App.toast('请选择班级', 'error');
            return;
        }
        if (password !== password2) {
            App.toast('两次密码不一致', 'error');
            return;
        }
        if (!username || !password) {
            App.toast('请输入用户名和密码', 'error');
            return;
        }
        const result = await this.register(username, password, displayName, className);
        if (result.success) {
            App.toast(result.message, 'success');
        } else {
            App.toast(result.message, 'error');
        }
    }
};
