import pandas as pd
import json
import math

file_path = '../GN Division - Source of Drinking Water of Household.csv.xlsx'

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
        'protected_well_within': get_val(row['Protected well within premises']),
        'protected_well_outside': get_val(row['Protected well outside premises']),
        'unprotected_well': get_val(row['Unprotected well']),
        'tap_within_unit': get_val(row['Tap within unit (main line)']),
        'tap_within_premises_outside': get_val(row['Tap within premises but outside unit (main line)']),
        'tap_outside_premises': get_val(row['Tap outside premises (main line)']),
        'rural_water_projects': get_val(row['Rural water projects']),
        'tube_well': get_val(row['Tube well']),
        'bowser': get_val(row['Bowser']),
        'river_tank_stream': get_val(row['River/Tank/Strea']),
        'other': get_val(row['Unnamed: 15']) if 'Unnamed: 15' in row else 0,
    }
    data.append(record)

output_file = 'drinking_water_data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(data)} records to {output_file}")
