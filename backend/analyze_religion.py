import pandas as pd
import json

file_path = r"C:\xampp\htdocs\Celonica Quecion web\GN Division - Religious Affiliation of Population.csv.xlsx"

try:
    df = pd.read_excel(file_path)
    print("Successfully read Excel file!")
    
    info = {
        "columns": list(df.columns),
        "row_count": len(df),
        "sample": df.head(3).to_dict('records')
    }
    print(json.dumps(info, indent=2))
except Exception as e:
    print(f"Error reading file: {e}")
