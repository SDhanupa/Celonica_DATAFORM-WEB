import pandas as pd
import json
import math

file_path = '../GN Division - Solid Waste Disposal by Household.csv.xlsx'

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
        'collected_by_local_authorities': get_val(row['Collected by local authorities']),
        'occupants_burn': get_val(row['Occupants burn']),
        'occupants_bury': get_val(row['Occupants bury']),
        'occupants_composting': get_val(row['Occupants composting solid waste']),
        'dispose_into_environment': get_val(row['Occupants dispose solid waste into Road/River/Canal/Sea/Creek/Forest etc']),
        'other': get_val(row['Other'])
    }
    data.append(record)

output_file = 'solid_waste_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(data)} records to {output_file}")
