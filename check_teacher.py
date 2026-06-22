import re

with open('teacher.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. Update renderTeacherMessages to show teacher-sent messages
# ============================================
old_render = r'''        function renderTeacherMessages\(\) \{
            const list = document\.getElementById\('teacherMsgList'\);
            const unreplied = allMessages\.filter\(m => \!m\.teacher_reply\)\.length;
            document\.getElementById\('msgUnrepliedCount'\)\.textContent = unreplied;

            if \(allMessages\.length === 0\) \{
                list\.innerHTML = `<div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>暂无学生消息</p>
                    <p style="font-size:0\.85rem;margin-top:0\.5rem;">学生通过网站发送消息后，会出现在这里</p>
                </div>`;
                return;
            \}

            function formatTime\(iso\) \{
                if \(!iso\) return '';
                return new Date\(iso\)\.toLocaleString\('zh-CN'\);
            \}

            function escapeHtml\(text\) \{
                const div = document\.createElement\('div'\);
                div\.textContent = text \|\| '';
                return div\.innerHTML\.replace\(/\\n/g, '<br>'\);
            \}

            list\.innerHTML = allMessages\.map\(m => \{
                const isReplied = \!\!m\.teacher_reply;
                return \`
                <div class="msg-card \$\{isReplied \? '' : 'unreplied'\}">
                    <div class="msg-card-header">
                        <div>
                            <span class="msg-student-name">\$\{escapeHtml\(m\.sender_display_name \|\| m\.sender_username\)\}</span>
                            <span class="msg-username">@\$\{escapeHtml\(m\.sender_username\)\}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:0\.8rem;">
                            <span class="msg-status \$\{isReplied \? 'replied' : 'unreplied'\}">
                                <i class="fas \$\{isReplied \? 'fa-check-circle' : 'fa-clock'\}"></i>
                                \$\{isReplied \? '已回复' : '待回复'\}
                            </span>
                            <span class="msg-time">\$\{formatTime\(m\.created_at\)\}</span>
                        </div>
                    </div>
                    <div class="msg-text">\$\{escapeHtml\(m\.message_text\)\}</div>
                    \$\{isReplied \? `
                    <div class="msg-existing-reply">
                        <span class="reply-label"><i class="fas fa-reply"></i> 我的回复 \(\$\{formatTime\(m\.replied_at\)\}\)</span>
                        \$\{escapeHtml\(m\.teacher_reply\)\}
                    </div>` : ''\}
                    <div class="msg-reply-box">
                        <textarea class="msg-reply-input" id="replyInput_\$\{m\.id\}" 
                            placeholder="\$\{isReplied \? '修改回复...' : '输入回复内容...'\}" 
                            rows="2">\$\{isReplied \? m\.teacher_reply : ''\}</textarea>
                        <button class="msg-reply-btn" onclick="replyToMsg\('$\{m\.id\}'\)">
                            <i class="fas fa-paper-plane"></i> \$\{isReplied \? '更新' : '回复'\}
                        </button>
                    </div>
                </div>`;
            \}\)\.join\(''\);
        \}'''

print('Checking if old render pattern exists...')
if re.search(old_render, content, re.DOTALL):
    print('Found old render pattern')
else:
    print('Old render pattern NOT found, trying simpler check...')
    if 'function renderTeacherMessages()' in content:
        print('  But function name exists')
        # Show context
        idx = content.find('function renderTeacherMessages()')
        print('  Context:', content[idx:idx+200])
    else:
        print('  Function name NOT found at all!')
        
print('File length:', len(content))
print('Checking other key patterns...')
print('  loadStudentsForSelect:', 'loadStudentsForSelect' in content)
print('  sendTeacherMessage:', 'sendTeacherMessage' in content)
print('  msgSentCount:', 'msgSentCount' in content)
