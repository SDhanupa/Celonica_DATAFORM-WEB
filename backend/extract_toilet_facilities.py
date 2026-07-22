import pandas as pd
import json
import math

file_path = '../GN Division - Toilet Facilities of Household.csv.xlsx'

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
        'total_households': get_val(row['Total Households']),
        'water_seal_piped_sewer': get_val(row['Water seal and connected to a piped sewer system']),
        'water_seal_septic_tank': get_val(row['Water seal and connected to a septic tank']),
        'pour_flush': get_val(row['Pour flush toilet (Not water seal)']),
        'direct_pit': get_val(row['Direct pit']),
        'other': get_val(row['Other']),
        'not_using': get_val(row['Not using a toilet'])
    }
    data.append(record)

output_file = 'toilet_facilities_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(data)} records to {output_file}")
