/* ---------- 全局变量（与 teacher.html 内联脚本共享） ---------- */
/*  变量 allMessages / allStudents 在 teacher.html 内联脚本中声明，
    此处不使用 let/var 重新声明，直接赋值 */


/* ---------- 加载学生列表到下拉框 ---------- */
async function loadStudentsForSelect() {
    const select = document.getElementById('studentSelect');
    if (!select) return;
    try {
        const { data, error } = await supabaseClient
            .from('students')
            .select('username, display_name, class_name')
            .eq('role', 'student')
            .order('display_name', { ascending: true });
        if (error) { console.error('加载学生列表失败:', error); return; }
        allStudents = data || [];
        select.innerHTML = '<option value="">-- 选择学生 --</option>';
        allStudents.forEach(s => {
            const label = s.display_name ? s.display_name + ' (' + s.username + ')' : s.username;
            const opt = document.createElement('option');
            opt.value = s.username;
            opt.textContent = label;
            opt.dataset.displayName = s.display_name || s.username;
            select.appendChild(opt);
        });
    } catch (e) { console.error('加载学生列表失败:', e); }
}

/* ---------- 教师加载所有消息 ---------- */
async function loadTeacherMessages() {
    const list = document.getElementById('teacherMsgList');
    list.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>正在加载消息...</p></div>';

    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) {
            if (error.code === 'PGRST204' || error.code === '42P01') {
                list.innerHTML = '<div class="empty-state">'
                    + '<i class="fas fa-database"></i>'
                    + '<p>消息表尚未创建</p>'
                    + '<p style="font-size:0.85rem;margin-top:0.5rem;">请在 Supabase SQL Editor 中执行以下 SQL：</p>'
                    + '<pre style="text-align:left;background:#f1f5f9;padding:1rem;border-radius:8px;font-size:0.8rem;margin-top:0.5rem;max-width:600px;margin-left:auto;margin-right:auto;overflow-x:auto;">'
                    + 'CREATE TABLE messages (\n'
                    + '    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n'
                    + '    sender_username TEXT NOT NULL,\n'
                    + '    sender_display_name TEXT,\n'
                    + '    receiver_username TEXT,\n'
                    + '    receiver_display_name TEXT,\n'
                    + '    message_text TEXT NOT NULL,\n'
                    + '    teacher_reply TEXT,\n'
                    + '    replied_at TIMESTAMPTZ,\n'
                    + '    is_read BOOLEAN DEFAULT false,\n'
                    + '    created_at TIMESTAMPTZ DEFAULT now()\n'
                    + ');\n\n'
                    + 'ALTER TABLE messages ENABLE ROW LEVEL SECURITY;\n\n'
                    + 'CREATE POLICY "Students can insert messages"\n'
                    + 'ON messages FOR INSERT\n'
                    + 'TO anon\n'
                    + 'WITH CHECK (true);\n\n'
                    + 'CREATE POLICY "Anyone can view messages"\n'
                    + 'ON messages FOR SELECT\n'
                    + 'TO anon\n'
                    + 'USING (true);\n\n'
                    + 'CREATE POLICY "Teacher can update messages"\n'
                    + 'ON messages FOR UPDATE\n'
                    + 'TO anon\n'
                    + 'USING (true);</pre>'
                    + '</div>';
                return;
            }
            console.error('加载消息失败:', error);
            list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>加载失败: ' + error.message + '</p></div>';
            return;
        }

        allMessages = data || [];
        renderTeacherMessages();
        updateMsgBadge();
    } catch (e) {
        console.error('加载消息失败:', e);
        list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>加载失败，请检查网络</p></div>';
    }
}

/* ---------- 渲染教师消息列表 ---------- */
function renderTeacherMessages() {
    const list = document.getElementById('teacherMsgList');
    const unreplied = allMessages.filter(m => !m.teacher_reply && !m.receiver_username);
    const sentByMe = allMessages.filter(m => !!m.receiver_username);
    const unrepliedEl = document.getElementById('msgUnrepliedCount');
    if (unrepliedEl) unrepliedEl.textContent = unreplied.length;
    const sentCountEl = document.getElementById('msgSentCount');
    if (sentCountEl) sentCountEl.textContent = sentByMe.length;

    if (allMessages.length === 0) {
        list.innerHTML = '<div class="empty-state">'
            + '<i class="fas fa-inbox"></i>'
            + '<p>暂无消息</p>'
            + '<p style="font-size:0.85rem;margin-top:0.5rem;">学生消息和您发送的消息都会显示在这里</p>'
            + '</div>';
        return;
    }

    function formatTime(iso) {
        if (!iso) return '';
        return new Date(iso).toLocaleString('zh-CN');
    }
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    list.innerHTML = allMessages.map(m => {
        const isFromStudent = !m.receiver_username;
        if (isFromStudent) {
            const isReplied = !!m.teacher_reply;
            return '<div class="msg-card ' + (isReplied ? '' : 'unreplied') + '">'
                + '<div class="msg-card-header">'
                + '<div><span class="msg-student-name">' + escapeHtml(m.sender_display_name || m.sender_username) + '</span>'
                + '<span class="msg-username">@' + escapeHtml(m.sender_username) + '</span></div>'
                + '<div style="display:flex;align-items:center;gap:0.8rem;">'
                + '<span class="msg-status ' + (isReplied ? 'replied' : 'unreplied') + '">'
                + '<i class="fas ' + (isReplied ? 'fa-check-circle' : 'fa-clock') + '"></i> '
                + (isReplied ? '已回复' : '待回复') + '</span>'
                + '<span class="msg-time">' + formatTime(m.created_at) + '</span></div>'
                + '</div>'
                + '<div class="msg-text">' + escapeHtml(m.message_text) + '</div>'
                + (isReplied
                    ? '<div class="msg-existing-reply"><span class="reply-label"><i class="fas fa-reply"></i> 我的回复 (' + formatTime(m.replied_at) + ')</span>' + escapeHtml(m.teacher_reply) + '</div>'
                    : '')
                + '<div class="msg-reply-box">'
                + '<textarea class="msg-reply-input" id="replyInput_' + m.id + '" placeholder="' + (isReplied ? '修改回复...' : '输入回复内容...') + '" rows="2">' + (isReplied ? escapeHtml(m.teacher_reply) : '') + '</textarea>'
                + '<button class="msg-reply-btn" onclick="replyToMsg(\'' + m.id + '\')"><i class="fas fa-paper-plane"></i> ' + (isReplied ? '更新' : '回复') + '</button>'
                + '</div></div>';
        } else {
            const receiverName = m.receiver_display_name || m.receiver_username;
            return '<div class="msg-card sent-by-me">'
                + '<div class="msg-card-header">'
                + '<div><span class="msg-student-name"><i class="fas fa-paper-plane" style="color:var(--accent);"></i> 发给：' + escapeHtml(receiverName) + '</span>'
                + '<span class="msg-username">@' + escapeHtml(m.receiver_username) + '</span></div>'
                + '<div style="display:flex;align-items:center;gap:0.8rem;">'
                + '<span class="msg-status replied"><i class="fas fa-check-circle"></i> 已发送</span>'
                + '<span class="msg-time">' + formatTime(m.created_at) + '</span></div>'
                + '</div>'
                + '<div class="msg-text">' + escapeHtml(m.message_text) + '</div>'
                + '</div>';
        }
    }).join('');
}

/* ---------- 教师主动发消息 ---------- */
async function sendTeacherMessage() {
    const select = document.getElementById('studentSelect');
    const input = document.getElementById('teacherMsgInput');
    const btn = document.getElementById('teacherMsgSendBtn');
    const studentUsername = select.value;
    const text = (input.value || '').trim();
    if (!studentUsername) { alert('请先选择学生'); return; }
    if (!text) { alert('请输入消息内容'); return; }

    const studentOpt = select.options[select.selectedIndex];
    const studentDisplayName = studentOpt.dataset.displayName || studentUsername;
    const teacherUsername = (document.getElementById('teacherUsername') && document.getElementById('teacherUsername').value.trim())
        ? document.getElementById('teacherUsername').value.trim() : 'teacher';

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中...';
    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                sender_username: teacherUsername,
                sender_display_name: '老师',
                receiver_username: studentUsername,
                receiver_display_name: studentDisplayName,
                message_text: text,
                is_read: false
            }]);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送';
        if (error) {
            if (error.message && error.message.includes('receiver_username')) {
                alert('消息表缺少 receiver_username 字段，请先执行数据库升级 SQL');
            } else {
                alert('发送失败：' + error.message);
            }
            return;
        }
        input.value = '';
        select.value = '';
        alert('发送成功！');
        await loadTeacherMessages();
    } catch (e) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送';
        alert('网络错误，请重试');
    }
}

/* ---------- 教师回复学生消息 ---------- */
async function replyToMsg(messageId) {
    const input = document.getElementById('replyInput_' + messageId);
    const text = (input.value || '').trim();
    if (!text) { alert('请输入回复内容'); return; }
    try {
        const { error } = await supabaseClient
            .from('messages')
            .update({ teacher_reply: text, replied_at: new Date().toISOString(), is_read: true })
            .eq('id', messageId);
        if (error) { alert('回复失败：' + error.message); return; }
        const msg = allMessages.find(m => m.id === messageId);
        if (msg) { msg.teacher_reply = text; msg.replied_at = new Date().toISOString(); msg.is_read = true; }
        renderTeacherMessages();
        updateMsgBadge();
    } catch (e) { alert('网络错误，请重试'); }
}

/* ---------- 更新消息徽章 ---------- */
function updateMsgBadge() {
    const badge = document.getElementById('teacherMsgBadge');
    if (!badge) return;
    const unreplied = allMessages.filter(m => !m.teacher_reply && !m.receiver_username).length;
    if (unreplied > 0) { badge.style.display = 'inline'; badge.textContent = unreplied; }
    else { badge.style.display = 'none'; }
}

/* ---------- 进入消息 tab 时加载学生列表 ---------- */
// 在 teacher.html 内联脚本加载后，重写 switchTab
function _setupMessageTabHook() {
    if (typeof switchTab !== 'function') {
        setTimeout(_setupMessageTabHook, 200);
        return;
    }
    const _origSwitchTab = switchTab;
    window.switchTab = function(tab) {
        _origSwitchTab(tab);
        if (tab === 'messages') { loadStudentsForSelect(); }
    };
}
_setupMessageTabHook();
