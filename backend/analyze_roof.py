import pandas as pd
import json

file_path = r"C:\xampp\htdocs\Celonica Quecion web\GN Division - Roof Type in Housing Unit.csv.xlsx"
try:
    df = pd.read_excel(file_path, header=0)
    print(json.dumps({
        "columns": list(df.columns),
        "head": df.head(3).to_dict(orient='records'),
        "shape": df.shape
    }, indent=2))
except Exception as e:
    print(str(e))
