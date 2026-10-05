import pandas as pd
import json

df = pd.read_excel(r'C:\xampp\htdocs\Celonica Quecion web\පොලිස් ස්ථාන 608 -.xlsx', skiprows=1)
out = {
    'columns': df.columns.tolist(),
    'first_row': df.head(2).to_dict(orient='records')
}
with open('test_file_4.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
