import json
import os

input_file = "c:\\xampp\\htdocs\\Celonica Quecion web\\backend\\duplicates.json"
output_file = "c:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\d6ef69e0-2514-47c1-bbea-cb87fb4da2c2\\ccode_duplicates.md"

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Duplicate CCODE entries in grama_niladharis\n\n")
        f.write("Here are all the duplicate `CCODE` records found in the database. \n\n")
        
        for ccode, records in data.items():
            f.write(f"### CCODE: `{ccode}`\n")
            f.write("| ID | Name (EN) | Name (SI) | District Code | DS Code |\n")
            f.write("|---|---|---|---|---|\n")
            for r in records:
                id_val = r.get('id', '')
                name_en = r.get('name_en', '')
                name_si = r.get('name_si', '')
                dist = r.get('district_code', '')
                ds = r.get('divisional_secretariat_code', '')
                f.write(f"| {id_val} | {name_en} | {name_si} | {dist} | {ds} |\n")
            f.write("\n")
            
    print("Done generating markdown.")
except Exception as e:
    print(f"Error: {e}")
