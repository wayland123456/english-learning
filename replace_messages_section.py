import re

with open('teacher.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the Messages JS section: from the "消息管理" comment line
# to the closing </script> tag (the one after it)
# Strategy: split by lines, find start/end, rejoin

lines = content.split('\n')
start = None
end = None

for i, line in enumerate(lines):
    # Match the comment line (with full-width equals signs)
    if '消息管理' in line and '=====' in line:
        start = i
    # After finding start, find the next </script> that is the end of the section
    if start is not None and i > start and '</script>' in line:
        # Check this is the right </script> (the one closing the main script block)
        end = i
        break

print(f'Start line: {start+1}')
print(f'End line: {end+1}')
print(f'Start content: {lines[start][:100]}')
print(f'End content: {lines[end][:80]}')

if start is not None and end is not None:
    # Read the new JS from a separate file
    new_js = open('messages_new_js.txt', 'r', encoding='utf-8').read()
    
    # Replace
    new_lines = lines[:start] + [new_js] + lines[end+1:]
    
    with open('teacher.html', 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f'Replacement done! Lines {start+1}-{end+1} replaced.')
    print(f'New total lines: {len(new_lines)}')
else:
    print('ERROR: Could not find section boundaries!')
