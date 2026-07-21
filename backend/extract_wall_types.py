import pandas as pd
import json
import math

file_path = '../GN Division - Wall Type in Housing Units.csv.xlsx'

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
        'brick': get_val(row['Brick']),
        'cement_block_stone': get_val(row['Cement block/Stone']),
        'cabook': get_val(row['Cabook']),
        'soil_bricks': get_val(row['Soil bricks']),
        'mud': get_val(row['Mud']),
        'cadjan_palmyrah': get_val(row['Cadjan/Palmyrah']),
        'plank_metal_sheet': get_val(row['Plank/Metal Sheet']),
        'other': get_val(row['Other'])
    }
    data.append(record)

output_file = 'wall_types_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(data)} records to {output_file}")
