import pandas as pd
import sqlite3

df = pd.read_excel('1.1.18 Telecom Regions Sri Lanka Location.xlsx')
conn = sqlite3.connect('backend/database/database.sqlite')
c = conn.cursor()

not_found = []
for index, row in df.iterrows():
    if pd.isna(row['en']):
        continue
    
    en = str(row['en'])
    # Extract prefix
    prefix = en.replace('- Regional Management Office Area', '').replace('Regional Management Office Area', '').replace('-', '').strip()
    
    # Try finding it in dis_en (District)
    c.execute("SELECT dis_en FROM grama_niladharis WHERE dis_en = ? LIMIT 1", (prefix,))
    res = c.fetchone()
    
    if res:
        district = res[0]
    else:
        # Try finding it in ds_en (DS Division)
        c.execute("SELECT dis_en FROM grama_niladharis WHERE ds_en = ? LIMIT 1", (prefix,))
        res = c.fetchone()
        if res:
            district = res[0]
        else:
            # Try fuzzy search in ds_en or name_en
            c.execute("SELECT dis_en FROM grama_niladharis WHERE ds_en LIKE ? OR name_en LIKE ? LIMIT 1", (f"%{prefix}%", f"%{prefix}%"))
            res = c.fetchone()
            if res:
                district = res[0]
            else:
                district = None
                not_found.append(prefix)

print("Not found:", len(set(not_found)))
print("Some not found:", list(set(not_found))[:20])
