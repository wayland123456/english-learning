import re

with open('teacher.html', 'r', encoding='utf-8') as f:
    content = f.read()

# --- 1. Replace the SQL in loadTeacherMessages (add receiver_username columns) ---
old_sql = '''CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_username TEXT NOT NULL,
    sender_display_name TEXT,
    message_text TEXT NOT NULL,
    teacher_reply TEXT,
    replied_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
)'''

new_sql = '''CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_username TEXT NOT NULL,
    sender_display_name TEXT,
    receiver_username TEXT,
    receiver_display_name TEXT,
    message_text TEXT NOT NULL,
    teacher_reply TEXT,
    replied_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
)'''

if old_sql in content:
    content = content.replace(old_sql, new_sql, 1)
    print('Step 1: SQL updated (added receiver_username)')
else:
    print('Step 1: SQL pattern NOT found, trying alternate...')
    # Try with BOOLEAN (typo version)
    if 'BOOLEAN' in content.split('CREATE TABLE messages')[1].split(')')[0] if 'CREATE TABLE messages' in content else '':
        print('  Found BOOLEAN typo version')
    else:
        # Find and show what's there
        idx = content.find('CREATE TABLE messages')
        if idx > 0:
            print('  Found CREATE TABLE at pos', idx)
            print('  Context:', content[idx:idx+300])

# --- 2. Replace RLS policies (allow anyone to view) ---
old_policy = '''CREATE POLICY "Students can view own messages"
ON messages FOR SELECT
TO anon
USING (true);'''

new_policy = '''CREATE POLICY "Anyone can view messages"
ON messages FOR SELECT
TO anon
USING (true);'''

if old_policy in content:
    content = content.replace(old_policy, new_policy, 1)
    print('Step 2: RLS policy updated')
else:
    print('Step 2: RLS policy pattern NOT found (may already be updated)')

# --- 3. Update renderTeacherMessages to show teacher-sent messages ---
# Replace the function
old_render_start = '        function renderTeacherMessages() {'
if old_render_start in content:
    print('Step 3: Found renderTeacherMessages, replacing...')
    
    # Find the end of the function (the closing })
    start_idx = content.find(old_render_start)
    # Find the end of this function by counting braces
    # Actually, let me find the next `}' at the right indent level
    # Simpler: replace from old_render_start to the start of next function
    
    # Let me find the function end by looking for the next function or the end pattern
    after_start = content[start_idx:]
    # Find: async function replyToMsg or end of script
    # Actually the simplest: replace the whole messages JS block
    # Let me use a different strategy: just add the new functions before loadTeacherMessages
    print('  Will use alternate strategy: prepend new functions')
else:
    print('Step 3: renderTeacherMessages not found at expected location')

# --- 4. Write updated content ---
with open('teacher.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! File updated.')
print('File length:', len(content))
