import re

md_file = r'c:\xampp\htdocs\Celonica Quecion web\dublicat.md'
sql_file = r'c:\xampp\htdocs\Celonica Quecion web\update_ccodes.sql'

with open(md_file, 'r', encoding='utf-8') as f:
    md_content = f.read()
    
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_lines = f.readlines()

# Get original duplicate CCODEs that were kept for the first records
ccode_sections = re.split(r'### CCODE: `(.*?)`', md_content)
all_original_ccodes = []
for i in range(1, len(ccode_sections), 2):
    all_original_ccodes.append(ccode_sections[i].strip())

new_ccodes = []
for line in sql_lines:
    match = re.search(r"CCODE = '(.*?)'", line)
    if match:
        new_ccodes.append(match.group(1))

all_ccodes = all_original_ccodes + new_ccodes

seen = set()
duplicates = set()

for code in all_ccodes:
    if code in seen:
        duplicates.add(code)
    seen.add(code)

report = "# CCODE Analysis Report\n\n"
report += f"**Total duplicated groups originally:** {len(all_original_ccodes)}\n"
report += f"**Total newly generated unique CCODEs:** {len(new_ccodes)}\n"
report += f"**Total CCODEs analyzed:** {len(all_ccodes)}\n\n"

if len(duplicates) == 0:
    report += "> [!TIP]\n> ✅ **Great News!** There are **no duplicates** among the updated CCODEs and original retained CCODEs.\n\n"
else:
    report += "> [!WARNING]\n> ⚠️ **Warning!** Duplicates were found.\n\n"
    report += "### Duplicate CCODEs:\n"
    for dup in duplicates:
        report += f"- `{dup}`\n"
    report += "\n"

report += "### All Generated CCODEs (Sample)\n"
report += "| Old CCODE | Sample New CCODEs |\n"
report += "|---|---|\n"

# Map old to new
for i in range(1, min(41, len(ccode_sections)), 2):
    original_ccode = ccode_sections[i].strip()
    # Find generated ones that start with original[:-1]
    prefix = original_ccode[:-1]
    generated = [c for c in new_ccodes if c.startswith(prefix)]
    report += f"| `{original_ccode}` | `{(', '.join(generated[:5]))}` |\n"

with open(r'C:\Users\ASUS\.gemini\antigravity-ide\brain\9d1d6057-4f85-4711-9904-5143a2b84e34\ccode_analysis_report.md', 'w', encoding='utf-8') as f:
    f.write(report)
