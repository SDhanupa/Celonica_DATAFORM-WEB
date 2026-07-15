import pandas as pd
import json

df = pd.read_excel('1.1.18 Telecom Regions Sri Lanka Location.xlsx')
df.columns = [str(c).strip() for c in df.columns]

data = []
for index, row in df.iterrows():
    data.append({
        'code': str(row['Code']).strip() if not pd.isna(row['Code']) else None,
        'location': str(row['Location']).strip() if not pd.isna(row['Location']) else None,
        'full_location_name': str(row['Location Full Name']).strip() if not pd.isna(row['Location Full Name']) else None,
        'location_type': str(row['Location Type']).strip() if not pd.isna(row['Location Type']) else None,
        'name_si': str(row['si']).strip() if not pd.isna(row['si']) else None,
        'name_en': str(row['en']).strip() if not pd.isna(row['en']) else None,
        'name_ta': str(row['ta']).strip() if not pd.isna(row['ta']) else None
    })

with open('trs_areas.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved to trs_areas.json")
