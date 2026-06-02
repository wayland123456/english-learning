import re

path = r'C:\Users\85407\Desktop\travelling-english\js\supabase-auth.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 替换 supabase. 为 supabaseClient.（排除 typeof supabase 的情况）
# 用负向回顾断言
new_content = re.sub(r'(?<!typeof )supabase\.', 'supabaseClient.', content)
# 恢复 typeof 行
new_content = re.sub(r'typeof supabaseClient\.', 'typeof supabase.', new_content)

count = new_content.count('supabaseClient.')
print(f'替换数量: {count}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Done')
