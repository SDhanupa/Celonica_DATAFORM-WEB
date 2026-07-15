import pandas as pd
import json
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

files = [
    r'C:\xampp\htdocs\Celonica Quecion web\1.1.2 police stations use for database.xlsx',
    r'C:\xampp\htdocs\Celonica Quecion web\1.1.2 police stations with divisions .xlsx',
    r'C:\xampp\htdocs\Celonica Quecion web\Police station Numbers .xlsx',
    r'C:\xampp\htdocs\Celonica Quecion web\පොලිස් ස්ථාන 608 -.xlsx'
]

out = {}
for f in files:
    try:
        df = pd.read_excel(f)
        out[os.path.basename(f)] = {
            'columns': df.columns.tolist(),
            'first_row': df.head(1).to_dict(orient='records')
        }
    except Exception as e:
        out[os.path.basename(f)] = {'error': str(e)}

with open('police_meta.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
