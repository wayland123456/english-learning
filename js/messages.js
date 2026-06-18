/* ============================================
   师生消息模块
   - 学生: 发消息给老师，查看历史消息和回复
   - 教师: 查看所有学生消息，逐条回复，主动给学生发消息
   ============================================ */

const Messages = {
    /* ---------- 学生发消息（给老师） ---------- */
    async send(username, displayName, text) {
        if (!text || !text.trim()) {
            return { success: false, message: '消息不能为空' };
        }
        try {
            const { error } = await db
                .from('messages')
                .insert([{
                    sender_username: username,
                    sender_display_name: displayName || username,
                    message_text: text.trim(),
                    is_read: false
                    // receiver_username 不填，表示发给老师
                }]);

            if (error) {
                if (error.code === 'PGRST204' || error.code === '42P01') {
                    return { success: false, message: '消息表尚未创建，请联系管理员在 Supabase 中创建 messages 表' };
                }
                return { success: false, message: '发送失败：' + error.message };
            }
            return { success: true, message: '消息已发送！' };
        } catch (e) {
            return { success: false, message: '网络错误，请重试' };
        }
    },

    /* ---------- 教师主动给学生发消息 ---------- */
    async sendToStudent(teacherUsername, teacherDisplayName, studentUsername, studentDisplayName, text) {
        if (!text || !text.trim()) {
            return { success: false, message: '消息不能为空' };
        }
        if (!studentUsername) {
            return { success: false, message: '请选择学生' };
        }
        try {
            const { error } = await db
                .from('messages')
                .insert([{
                    sender_username: teacherUsername,
                    sender_display_name: teacherDisplayName || teacherUsername,
                    receiver_username: studentUsername,   // 指定接收学生
                    receiver_display_name: studentDisplayName || studentUsername,
                    message_text: text.trim(),
                    is_read: false
                }]);

            if (error) {
                // 如果 receiver_username 列不存在（旧表），尝试不带该列的插入
                if (error.message && error.message.includes('receiver_username')) {
                    return { success: false, message: '消息表缺少 receiver_username 字段，请先执行数据库升级 SQL' };
                }
                if (error.code === 'PGRST204' || error.code === '42P01') {
                    return { success: false, message: '消息表尚未创建' };
                }
                return { success: false, message: '发送失败：' + error.message };
            }
            return { success: true, message: '消息已发送！' };
        } catch (e) {
            return { success: false, message: '网络错误，请重试' };
        }
    },

    /* ---------- 学生加载自己的消息（发送+接收） ---------- */
    async loadMyMessages(username) {
        console.log('[Messages] loadMyMessages called, username:', username);
        try {
            // 加载我发的消息，以及老师发给我的消息
            // 注意：Supabase .or() 里字符串值需要正确处理，用单独的 eq() 拼装
            const { data, error } = await db
                .from('messages')
                .select('*')
                .or('sender_username.eq."' + username + '",receiver_username.eq."' + username + '"')
                .order('created_at', { ascending: false })
                .limit(50);

            console.log('[Messages] loadMyMessages result:', { data, error, count: data ? data.length : 0 });

            if (error) {
                // 如果 receiver_username 列不存在，降级为只查发送的消息
                if (error.message && error.message.includes('receiver_username')) {
                    console.warn('[Messages] receiver_username column not found, falling back');
                    const { data: d2, error: e2 } = await db
                        .from('messages')
                        .select('*')
                        .eq('sender_username', username)
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (e2) { console.error('[Messages] fallback error:', e2); return []; }
                    return d2 || [];
                }
                if (error.code === 'PGRST204' || error.code === '42P01') {
                    console.warn('[Messages] table not found');
                    return [];
                }
                console.error('[Messages] load error:', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('[Messages] load exception:', e);
            return [];
        }
    },

    /* ---------- 学生加载未读消息（回复 + 老师主动发的） ---------- */
    async loadUnreadMessages(username) {
        try {
            // 未读的回复（老师回复了我的消息）
            const { data: replyData } = await db
                .from('messages')
                .select('*')
                .eq('sender_username', username)
                .not('teacher_reply', 'is', null)
                .eq('is_read', false);

            // 未读的老师消息（老师主动发给我的）
            const { data: teacherData, error: e2 } = await db
                .from('messages')
                .select('*')
                .eq('receiver_username', username)
                .eq('is_read', false);

            let all = [...(replyData || [])];
            if (teacherData) all = all.concat(teacherData);

            // 去重
            const seen = new Set();
            return all.filter(m => {
                if (seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
            });
        } catch (e) {
            return [];
        }
    },

    /* ---------- 学生标记消息为已读 ---------- */
    async markAsRead(messageId) {
        try {
            await db
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId);
        } catch (e) {
            // 静默处理
        }
    },

    /* ---------- 教师加载所有学生消息 ---------- */
    async loadAllMessages() {
        try {
            const { data, error } = await db
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);

            if (error) {
                if (error.code === 'PGRST204' || error.code === '42P01') {
                    return [];
                }
                console.error('加载消息失败：', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('加载消息失败：', e);
            return [];
        }
    },

    /* ---------- 教师加载学生列表 ---------- */
    async loadStudents() {
        try {
            const { data, error } = await db
                .from('students')
                .select('username, display_name, class_name')
                .eq('role', 'student')
                .order('display_name', { ascending: true });

            if (error) {
                console.error('加载学生列表失败：', error);
                return [];
            }
            return data || [];
        } catch (e) {
            console.error('加载学生列表失败：', e);
            return [];
        }
    },

    /* ---------- 教师回复 ---------- */
    async reply(messageId, replyText) {
        if (!replyText || !replyText.trim()) {
            return { success: false, message: '回复不能为空' };
        }
        try {
            const { error } = await db
                .from('messages')
                .update({
                    teacher_reply: replyText.trim(),
                    replied_at: new Date().toISOString(),
                    is_read: true
                })
                .eq('id', messageId);

            if (error) {
                return { success: false, message: '回复失败：' + error.message };
            }
            return { success: true, message: '回复成功！' };
        } catch (e) {
            return { success: false, message: '网络错误，请重试' };
        }
    },

    /* ---------- 教师标记已读（不回复） ---------- */
    async markReadByTeacher(messageId) {
        try {
            await db
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId);
        } catch (e) {
            // 静默处理
        }
    },

    /* ---------- 格式化时间 ---------- */
    formatTime(isoString) {
        if (!isoString) return '';
        const d = new Date(isoString);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return diffMins + '分钟前';
        if (diffHours < 24) return diffHours + '小时前';
        if (diffDays < 7) return diffDays + '天前';

        const month = d.getMonth() + 1;
        const day = d.getDate();
        return month + '/' + day;
    },

    formatFullTime(isoString) {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('zh-CN');
    },

    /* ---------- 统计未读消息数 ---------- */
    getUnreadCount(messages) {
        if (!messages) return 0;
        return messages.filter(m => !m.is_read && !m.teacher_reply).length;
    }
};

/* ============================================
   学生端消息 UI
   ============================================ */

const MessagesUI = {
    _loading: false,

    /* ---------- 进入消息页 ---------- */
    async load() {
        const list = document.getElementById('messagesList');
        if (!list) return;

        list.innerHTML = `<div class="messages-empty"><i class="fas fa-spinner fa-spin"></i><h3>加载中...</h3></div>`;

        const username = SupabaseAuth.currentUsername;
        if (!username) {
            list.innerHTML = `<div class="messages-empty"><i class="fas fa-user-slash"></i><h3>请先登录</h3></div>`;
            return;
        }

        const messages = await Messages.loadMyMessages(username);

        // 标记未读消息为已读
        const unread = messages.filter(m =>
            (m.teacher_reply && !m.is_read) ||  // 老师回复了我的
            (m.receiver_username === username && !m.is_read) // 老师主动发给我的
        );
        if (unread.length > 0) {
            for (const m of unread) {
                await Messages.markAsRead(m.id);
            }
        }

        this.render(messages);
        this.updateBadge(0); // 打开后清除红点
    },

    /* ---------- 渲染消息列表 ---------- */
    render(messages) {
        const list = document.getElementById('messagesList');
        if (!list) return;

        if (!messages || messages.length === 0) {
            list.innerHTML = `
                <div class="messages-empty">
                    <i class="fas fa-paper-plane"></i>
                    <h3>还没有消息</h3>
                    <p>在下方输入框给老师发送消息吧！</p>
                </div>`;
            return;
        }

        // 按时间升序排列（早的在上面）
        const sorted = [...messages].reverse();

        list.innerHTML = sorted.map(m => {
            const isFromMe = m.sender_username === SupabaseAuth.currentUsername;

            if (isFromMe) {
                // 我发给老师的
                const teacherBubble = m.teacher_reply ? `
                    <div class="msg-bubble teacher">
                        <div class="msg-reply-label">
                            <i class="fas fa-reply"></i> 老师回复
                            ${m.is_read ? '' : '<span class="msg-unread-dot" title="新回复"></span>'}
                        </div>
                        <div>${this._escapeHtml(m.teacher_reply)}</div>
                        <div class="msg-time">${Messages.formatTime(m.replied_at)}</div>
                    </div>` : `
                    <div class="msg-bubble" style="align-self:flex-start;background:#fef9e7;color:#92600a;border-radius:12px;font-size:0.8rem;padding:0.5rem 1rem;border-bottom-left-radius:4px;">
                        <i class="fas fa-clock"></i> 等待老师回复...
                    </div>`;

                return `
                    <div class="msg-item" style="margin-bottom:0.8rem;">
                        <div class="msg-bubble student">
                            <div>${this._escapeHtml(m.message_text)}</div>
                            <div class="msg-time">${Messages.formatTime(m.created_at)}</div>
                        </div>
                        ${teacherBubble}
                    </div>`;
            } else {
                // 老师发给我的（receiver_username = 我）
                return `
                    <div class="msg-item" style="margin-bottom:0.8rem;">
                        <div class="msg-bubble teacher" style="align-self:flex-start;">
                            <div class="msg-reply-label">
                                <i class="fas fa-chalkboard-teacher"></i> 老师消息
                            </div>
                            <div>${this._escapeHtml(m.message_text)}</div>
                            <div class="msg-time">${Messages.formatTime(m.created_at)}</div>
                        </div>
                    </div>`;
            }
        }).join('');

        // 滚动到底部
        list.scrollTop = list.scrollHeight;
    },

    /* ---------- 发送消息 ---------- */
    async send() {
        if (this._loading) return;

        const input = document.getElementById('msgInput');
        const btn = document.getElementById('msgSendBtn');
        const text = (input.value || '').trim();

        if (!text) {
            App.toast('请输入消息内容', 'error');
            return;
        }

        const username = SupabaseAuth.currentUsername;
        const displayName = SupabaseAuth.currentUser ? SupabaseAuth.currentUser.display_name : username;

        if (!username) {
            App.toast('请先登录', 'error');
            return;
        }

        this._loading = true;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';

        const result = await Messages.send(username, displayName, text);

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送';
        this._loading = false;

        if (result.success) {
            input.value = '';
            App.toast(result.message, 'success');
            await this.load(); // 刷新列表
        } else {
            App.toast(result.message, 'error');
        }
    },

    /* ---------- 更新红点数字 ---------- */
    updateBadge(count) {
        const badge = document.getElementById('msgBadge');
        const badgeM = document.getElementById('msgBadgeM');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        if (badgeM) {
            if (count > 0) {
                badgeM.textContent = count > 99 ? '99+' : count;
                badgeM.classList.remove('hidden');
            } else {
                badgeM.classList.add('hidden');
            }
        }
    },

    /* ---------- HTML 转义 ---------- */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
};
