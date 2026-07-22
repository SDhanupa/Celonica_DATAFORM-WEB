import pandas as pd
import json

file_path = r"C:\xampp\htdocs\Celonica Quecion web\GN Division - Rooms in Housing Unit.csv.xlsx"
df = pd.read_excel(file_path, header=0)

# Replace NaNs with 0 for numeric columns, empty string for strings
df = df.fillna(0)

records = []
for index, row in df.iterrows():
    record = {
        'gn_name': str(row['GN Division']).strip(),
        'ds_division': str(row['DS Division']).strip(),
        'district': str(row['District']).strip(),
        'province': str(row['Province']).strip(),
        'total_housing_units': int(row['Total Housing units']),
        'room_1': int(row['1 Room']),
        'rooms_2': int(row['2 Rooms']),
        'rooms_3': int(row['3 Rooms']),
        'rooms_4': int(row['4 Rooms']),
        'rooms_5': int(row['5 Rooms']),
        'rooms_6': int(row['6 Rooms']),
        'rooms_7': int(row['7 Rooms']),
        'rooms_8': int(row['8 Rooms']),
        'rooms_9': int(row['9 Rooms']),
        'rooms_10_and_above': int(row['10 and above']),
    }
    records.append(record)

with open('rooms_data.json', 'w') as f:
    json.dump(records, f, indent=2)

print(f"Exported {len(records)} records to rooms_data.json")
