import pandas as pd
import json
import math

file_path = '../GN Division - Type of Housing Unit.csv.xlsx'

print(f"Reading {file_path}...")
df = pd.read_excel(file_path, header=0)

data = []
for index, row in df.iterrows():
    gn_name = str(row['GN Division']) if not pd.isna(row['GN Division']) else ""
    if not gn_name.strip():
        continue
        
    def get_val(val):
        if pd.isna(val) or val == '-':
            return 0
        try:
            return int(str(val).replace(',', '').strip())
        except ValueError:
            return 0

    record = {
        'gn_name': str(row['GN Division']).strip(),
        'ds_division': str(row['DS Division']).strip() if not pd.isna(row['DS Division']) else "",
        'district': str(row['District']).strip() if not pd.isna(row['District']) else "",
        'province': str(row['Province']).strip() if not pd.isna(row['Province']) else "",
        'total_units': get_val(row['Total Housing units']),
        'permanent': get_val(row['Permanent']),
        'semi_permanent': get_val(row['Semi-permanent']),
        'improvised': get_val(row['Improvised']),
        'unclassified': get_val(row['Unclassified'])
    }
    data.append(record)

output_file = 'unit_types_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(data)} records to {output_file}")
