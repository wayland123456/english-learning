import re

filepath = "C:/Users/85407/WorkBuddy/2026-05-30-12-13-38/english-learning/js/data.js"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

country_videos = {
    'uk': 'BV12Z421N7DZ',
    'usa': 'BV1hw4m1Y7vW',
    'australia': 'BV1hS411P7tP',
    'canada': 'BV1QS411c7vx',
    'ireland': 'BV1oZ421T7We',
    'newzealand': 'BV13qsEeZEgD',
}

# Step 1: Build a map of which country id is at which line
country_ids = {}
for i, line in enumerate(lines):
    m = re.match(r"^\s+id: '(\w+)'", line)
    if m:
        cid = m.group(1)
        if cid in country_videos:
            country_ids[i] = cid

# Step 2: Find each country's flag line and note its position
flag_positions = {}
for i, line in enumerate(lines):
    if re.match(r"^\s+flag: '[^']*',?\s*$", line):
        # Find the closest preceding country id
        for pos in sorted(country_ids.keys(), reverse=True):
            if pos < i:
                flag_positions[i] = country_ids[pos]
                break

# Step 3: Insert countryVideo lines (process in reverse to preserve positions)
insertions = []
for flag_pos, cid in flag_positions.items():
    bvid = country_videos[cid]
    indent = "            "
    insert_line = f"{indent}countryVideo: {{ bvid: '{bvid}' }},\n"
    # Insert right after the flag line (at position flag_pos + 1)
    insertions.append((flag_pos + 1, insert_line))

# Sort by position descending so inserts don't shift positions
insertions.sort(key=lambda x: x[0], reverse=True)

for pos, insert_line in insertions:
    lines.insert(pos, insert_line)

# Step 4: Remove bvid and page lines
lines = [l for l in lines if not re.match(r'^\s+bvid:', l)]
lines = [l for l in lines if not re.match(r'^\s+page:', l)]

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print(f"Inserted {len(insertions)} countryVideo entries")
print(f"Remaining lines: {len(lines)}")
