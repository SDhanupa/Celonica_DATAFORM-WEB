import pandas as pd
import json

file_path = r"C:\xampp\htdocs\Celonica Quecion web\GN Division - Religious Affiliation of Population.csv.xlsx"

try:
    df = pd.read_excel(file_path)
    df.fillna(0, inplace=True)
    records = df.to_dict('records')
    
    output_path = r"C:\xampp\htdocs\Celonica Quecion web\backend\religion_data.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    
    print(f"Exported {len(records)} records to religion_data.json")
except Exception as e:
    print(f"Error reading file: {e}")
