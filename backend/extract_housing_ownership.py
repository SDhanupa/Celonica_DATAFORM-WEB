import pandas as pd
import json
import numpy as np

# Load the excel file
file_path = '../GN Division - Housing Ownership Status of Household.csv.xlsx'
print(f"Reading {file_path}...")

# Read the excel file
df = pd.read_excel(file_path)

# Map the columns
column_mapping = {
    'GN Division': 'gn_name',
    'DS Division': 'ds_division',
    'District': 'district',
    'Province': 'province',
    'Total Households': 'total_households',
    'Owned by a household member': 'owned_by_member',
    'Rent/Lease-government owned': 'rent_gov',
    'Rent/Lease-Privately owned': 'rent_private',
    'Occupied free of rent': 'free_of_rent',
    'Encroached': 'encroached',
    'Other': 'other'
}

df.rename(columns=column_mapping, inplace=True)

# Select only the mapped columns to avoid extraneous data
columns_to_keep = list(column_mapping.values())
df = df[columns_to_keep]

# Replace NaN with None so it becomes null in JSON
df = df.replace({np.nan: None})

# Convert to dict
data = df.to_dict(orient='records')

# Save to JSON
output_path = 'housing_ownership_data.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully extracted {len(data)} records to {output_path}")
