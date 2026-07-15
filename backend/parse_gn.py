import pandas as pd
import json

file_path = r'C:\xampp\htdocs\Celonica Quecion web\GN Division - Gender of Population.csv.xlsx'
output_path = r'C:\xampp\htdocs\Celonica Quecion web\backend\database\data\gn_population.json'

try:
    df = pd.read_excel(file_path)
    
    # Check if there are any missing values in GN Division
    df = df.dropna(subset=['GN Division'])
    
    # Create the output structure
    output_data = []
    
    for index, row in df.iterrows():
        # Clean the values, especially population numbers which might be strings with commas
        def clean_int(val):
            if pd.isna(val) or val == '-':
                return 0
            if isinstance(val, str):
                val = val.replace(',', '')
            try:
                return int(float(val))
            except ValueError:
                return 0
        
        output_data.append({
            'gn_name': str(row['GN Division']).strip(),
            'ds_name': str(row['DS Division']).strip(),
            'district_name': str(row['District']).strip(),
            'population_both': clean_int(row['Total Population']),
            'population_male': clean_int(row['Male']),
            'population_female': clean_int(row['Female'])
        })
        
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully processed {len(output_data)} rows.")
except Exception as e:
    print(f"Error: {e}")
