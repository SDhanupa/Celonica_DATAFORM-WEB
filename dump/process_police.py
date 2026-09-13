import pandas as pd
import json
import os

# Paths
dir_path = r'C:\xampp\htdocs\Celonica Quecion web'
f_div = os.path.join(dir_path, r'1.1.2 police stations with divisions .xlsx')
f_map = os.path.join(dir_path, r'1.1.2 police stations use for database.xlsx')
f_con = os.path.join(dir_path, r'Police station Numbers .xlsx')
f_sin = os.path.join(dir_path, r'පොලිස් ස්ථාන 608 -.xlsx')
out_dir = os.path.join(dir_path, r'backend\database\data')
os.makedirs(out_dir, exist_ok=True)

# 1. Police Divisions
df_div = pd.read_excel(f_div).astype(object).fillna('')
divisions = []
div_by_code = {}
div_by_en = {}
div_by_si = {}

for idx, row in df_div.iterrows():
    div_id = idx + 1
    div_data = {
        'id': div_id,
        'location_code': str(row.get('Location ', '')).strip(),
        'full_location_name': str(row.get('Full Location Name', '')).strip(),
        'location_type': str(row.get('Location Type', '')).strip(),
        'name_si': str(row.get('si', '')).strip(),
        'name_en': str(row.get('en', '')).strip(),
        'name_ta': str(row.get('ta', '')).strip(),
    }
    divisions.append(div_data)
    if div_data['location_code']: div_by_code[div_data['location_code']] = div_id
    if div_data['name_en']: div_by_en[div_data['name_en'].lower().replace(' police division', '')] = div_id
    if div_data['name_si']: div_by_si[div_data['name_si'].strip()] = div_id

with open(os.path.join(out_dir, 'police_divisions.json'), 'w', encoding='utf-8') as f:
    json.dump(divisions, f, ensure_ascii=False)


# 2. Police Contacts
df_con = pd.read_excel(f_con).astype(object).fillna('')
contacts = []
for _, row in df_con.iterrows():
    div_name = str(row.get('Division', '')).strip()
    div_clean = div_name.lower().replace(' police division', '')
    div_id = div_by_en.get(div_clean)
    if not div_id:
        for k, v in div_by_en.items():
            if k in div_clean or div_clean in k:
                div_id = v
                break
    
    contacts.append({
        'police_division_id': div_id,
        'province': str(row.get('Province', '')).strip(),
        'division': div_name,
        'station_name': str(row.get('Police Station', '')).strip(),
        'oic_mobile': str(row.get('OIC Mobile Number', '')).strip(),
        'office_telephone': str(row.get('Office Telephone Number', '')).strip()
    })
with open(os.path.join(out_dir, 'police_station_contacts.json'), 'w', encoding='utf-8') as f:
    json.dump(contacts, f, ensure_ascii=False)


# 3. Sinhala Police Stations
df_sin = pd.read_excel(f_sin, skiprows=1).astype(object).fillna('')
sin_stations = []
cols = df_sin.columns.tolist()
for _, row in df_sin.iterrows():
    div_name = str(row.get(cols[3], '')).strip()
    div_id = div_by_si.get(div_name)
    
    sin_stations.append({
        'police_division_id': div_id,
        'province': str(row.get(cols[1], '')).strip(),
        'district': str(row.get(cols[2], '')).strip(),
        'division': div_name,
        'station_name': str(row.get(cols[4], '')).strip()
    })
with open(os.path.join(out_dir, 'sinhala_police_stations.json'), 'w', encoding='utf-8') as f:
    json.dump(sin_stations, f, ensure_ascii=False)


# 4. GND Police Mappings
df_map = pd.read_excel(f_map).astype(object).fillna('')
mappings = []
for _, row in df_map.iterrows():
    pd_id_val = str(row.get('pd_id', '')).strip()
    div_id = div_by_code.get(pd_id_val)
    
    mappings.append({
        'police_division_id': div_id,
        'ccode': str(row.get('ccode', '')).strip(),
        'gnd_id': str(row.get('gnd_id', '')).strip(),
        'name': str(row.get('name', '')).strip(),
        'province_id': str(row.get('province_id', '')).strip(),
        'district_id': str(row.get('district_id', '')).strip(),
        'dsd_id': str(row.get('dsd_id', '')).strip(),
        'pd_id': pd_id_val,
        'gnd_num': str(row.get('gnd_num', '')).strip(),
        'lat': str(row.get('lat', '')).strip(),
        'lng': str(row.get('lng', '')).strip(),
        'ps_id': str(row.get('ps_id', '')).strip(),
        'ps_name': str(row.get('ps_name', '')).strip(),
        'ps_name_si': str(row.get('ps_name_si', '')).strip(),
        'ps_name_ta': str(row.get('ps_name_ta', '')).strip(),
        'distance': str(row.get('distance to the police station', '')).strip()
    })
with open(os.path.join(out_dir, 'gnd_police_mappings.json'), 'w', encoding='utf-8') as f:
    json.dump(mappings, f, ensure_ascii=False)

print('Success')
