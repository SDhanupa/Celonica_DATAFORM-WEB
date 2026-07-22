import pandas as pd
import json

file_path = r"C:\xampp\htdocs\Celonica Quecion web\GN Division - Roof Type in Housing Unit.csv.xlsx"

try:
    df = pd.read_excel(file_path, header=0)
    
    # Fill NaN values with 0 for numeric columns, and empty string for text columns
    df['GN Division'] = df['GN Division'].fillna('')
    df['DS Division'] = df['DS Division'].fillna('')
    df['District'] = df['District'].fillna('')
    df['Province'] = df['Province'].fillna('')
    
    numeric_cols = [
        'Total Housing units', 
        'Tile', 'Asbestos', 'Concrete', 
        'Zink Aluminium sheet', 'Metal sheet', 
        'Cadjan/Palmyrah/Straw', 'Other'
    ]
    
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

    records = df.to_dict(orient='records')
    
    with open("roof_data.json", "w", encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
        
    print(f"Exported {len(records)} records to roof_data.json")

except Exception as e:
    print(f"Error: {str(e)}")
