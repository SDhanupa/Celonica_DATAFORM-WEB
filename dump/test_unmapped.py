import sqlite3
import pandas as pd

try:
    # Connect to PostgreSQL using psycopg2
    import psycopg2
    conn = psycopg2.connect(dbname='celonica_db', user='postgres', password='dhanu231', host='127.0.0.1')
    c = conn.cursor()
    c.execute("SELECT name_en FROM trs_areas WHERE district IS NULL LIMIT 20;")
    res = c.fetchall()
    print([x[0] for x in res])
except Exception as e:
    print(e)
