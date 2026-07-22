import pandas as pd
import json

excel_files = {
    'Economy': '../GN Division - Economic Activity.csv.xlsx',
    'Ownership': '../GN Division - Housing Ownership Status.csv.xlsx',
    'Wall': '../GN Division - Housing Wall Type.csv.xlsx',
    'Unit': '../GN Division - Type of Housing Unit.csv.xlsx',
    'Toilet': '../GN Division - Toilet Facilities of Household.csv.xlsx',
    'Water': '../GN Division - Source of Drinking Water of Household.csv.xlsx',
    'Waste': '../GN Division - Solid Waste Disposal by Household.csv.xlsx'
}

data = {}

for name, path in excel_files.items():
    try:
        df = pd.read_excel(path)
        row = df[(df['District'] == 'Anuradhapura') & (df['GN Division'] == 'Pahalagama') & (df['DS Division'].str.contains('Thambutt'))]
        if not row.empty:
            data[name] = row.iloc[0].to_dict()
        else:
            data[name] = "Not found"
    except Exception as e:
        data[name] = str(e)

with open('pahalagama_data.json', 'w') as f:
    json.dump(data, f, indent=2)
print("Data extracted to pahalagama_data.json")
