import re
import json

file_path = r'c:\xampp\htdocs\Celonica Quecion web\dublicat.md'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

ccode_sections = re.split(r'### CCODE: `(.*?)`', content)

updates = []
seen_ccodes = set()

# Get a list of original ccodes that are already in the markdown to avoid using them as a replacement if possible
all_original_ccodes = set()
for i in range(1, len(ccode_sections), 2):
    all_original_ccodes.add(ccode_sections[i].strip())

suffix_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

sql_statements = []

for i in range(1, len(ccode_sections), 2):
    original_ccode = ccode_sections[i].strip()
    table_content = ccode_sections[i+1]
    
    ids = re.findall(r'\| (\d+) \|', table_content)
    
    # We want to make them unique.
    # The first one can keep the original CCODE, or we can change all of them.
    # "uniq only change last letters" -> If we change the last letter, we can use A, B, C...
    
    for idx, record_id in enumerate(ids):
        if idx == 0:
            new_ccode = original_ccode
            seen_ccodes.add(new_ccode)
            continue  # SKIP outputting an update for the original record!
            
        new_ccode = f"{original_ccode}{idx}"
        seen_ccodes.add(new_ccode)
        
        updates.append({
            'id': record_id,
            'old_ccode': original_ccode,
            'new_ccode': new_ccode
        })
        # Add quotes around "CCODE" automatically for Postgres!
        sql_statements.append(f"UPDATE grama_niladharis SET \"CCODE\" = '{new_ccode}' WHERE id = {record_id};")

print(f"Total records to update: {len(updates)}")
with open(r'c:\xampp\htdocs\Celonica Quecion web\update_ccodes_numbered.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))
    
print("SQL file generated at update_ccodes_numbered.sql")
