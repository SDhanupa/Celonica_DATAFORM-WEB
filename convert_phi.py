import pandas as pd
import json

df = pd.read_excel('PHI AREA.xlsx')

# Clean columns
df.columns = [c.strip() for c in df.columns]

# The first 28 rows are Regional Health Services (RDHS) which correspond to Districts (or close to it)
# We will build a mapping of prefix -> district_name_en
# The prefix is the 'code' (e.g. H-111, H-12)
rdhs_mapping = {}

for _, row in df.iterrows():
    if pd.isna(row['code']):
        continue
    code = str(row['code']).strip()
    en_name = str(row['en']).strip()
    
    # If the code has no more than 1 dash, it's a district level (e.g., H-111, H-12)
    # Actually, we can just look at Location Type == 'Regional Health Services ...'
    # Or just use the first 28 rows
    if code.count('-') == 1:
        rdhs_mapping[code] = en_name

data = []
for _, row in df.iterrows():
    code = str(row['code']).strip() if not pd.isna(row['code']) else None
    
    district = None
    if code:
        # Extract the prefix, which is "H-XX" or "H-XXX"
        parts = code.split('-')
        if len(parts) >= 2:
            prefix = f"{parts[0]}-{parts[1]}"
            district = rdhs_mapping.get(prefix)
            
    # Some districts might need manual adjustment due to spelling
    if district and district.lower() == 'mullaithivu':
        district = 'Mullaitivu'
    if district and district.lower() == 'batticaola':
        district = 'Batticaloa'
    if district and district.lower() == 'nuwara eliya':
        district = 'Nuwara Eliya'
    if district and district.lower() == 'moneragala':
        district = 'Monaragala'
        
    data.append({
        'ccode': str(row['CCODE']).strip() if not pd.isna(row['CCODE']) else None,
        'code': code,
        'location': str(row['Location']).strip() if not pd.isna(row['Location']) else None,
        'full_location_name': str(row['Full Location Name']).strip() if not pd.isna(row['Full Location Name']) else None,
        'location_type': str(row['Location Type']).strip() if not pd.isna(row['Location Type']) else None,
        'name_si': str(row['si']).strip() if not pd.isna(row['si']) else None,
        'name_en': str(row['en']).strip() if not pd.isna(row['en']) else None,
        'name_ta': str(row['ta']).strip() if not pd.isna(row['ta']) else None,
        'district': district
    })

with open('phi_areas.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Saved to phi_areas.json")
