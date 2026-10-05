import pandas as pd

file_path = r"C:\xampp\htdocs\Celonica Quecion web\Police.xlsx"
try:
    df = pd.read_excel(file_path, nrows=5)
    print("Columns:")
    print(df.columns.tolist())
    print("\nFirst 2 rows:")
    print(df.head(2).to_dict(orient='records'))
except Exception as e:
    print(f"Error: {e}")
