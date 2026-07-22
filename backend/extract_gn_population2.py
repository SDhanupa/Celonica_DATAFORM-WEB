import pandas as pd
import json

try:
    df = pd.read_excel('C:\\xampp\\htdocs\\Celonica Quecion web\\Census of Population and Housing - 2024.xlsx', skiprows=4)
    updates = []
    
    for index, row in df.iterrows():
        district = row.iloc[3]
        ds_div = row.iloc[5]
        gn_name = row.iloc[7]
        
        if pd.isna(gn_name):
            continue
            
        gn_name = str(gn_name).strip()
        district = str(district).strip() if not pd.isna(district) else ""
        ds_div = str(ds_div).strip() if not pd.isna(ds_div) else ""
        
        try:
            total = pd.to_numeric(row.iloc[9], errors='coerce')
            male = pd.to_numeric(row.iloc[10], errors='coerce')
            female = pd.to_numeric(row.iloc[11], errors='coerce')
            age_0_14 = pd.to_numeric(row.iloc[13], errors='coerce')
            age_15_59 = pd.to_numeric(row.iloc[14], errors='coerce')
            age_60_64 = pd.to_numeric(row.iloc[15], errors='coerce')
            age_65_above = pd.to_numeric(row.iloc[16], errors='coerce')
            
            if pd.isna(total):
                continue
                
            updates.append({
                'district': district,
                'ds_div': ds_div,
                'gn_name': gn_name,
                'population_both': int(total) if not pd.isna(total) else 0,
                'population_male': int(male) if not pd.isna(male) else 0,
                'population_female': int(female) if not pd.isna(female) else 0,
                'age_0_14': int(age_0_14) if not pd.isna(age_0_14) else 0,
                'age_15_59': int(age_15_59) if not pd.isna(age_15_59) else 0,
                'age_60_64': int(age_60_64) if not pd.isna(age_60_64) else 0,
                'age_65_above': int(age_65_above) if not pd.isna(age_65_above) else 0,
            })
        except Exception as e:
            continue
            
    with open('C:\\xampp\\htdocs\\Celonica Quecion web\\backend\\gn_population_updates2.json', 'w', encoding='utf-8') as f:
        json.dump(updates, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully extracted {len(updates)} records to json.")
except Exception as e:
    print(f"Error: {e}")
